import type { NormalizedProject, PlatformName } from "@fr/shared";
import type { DbClient } from "./client";
import { hashableFields, planProjectUpsert, type ExistingProjectRef } from "./project-mapping";
import type {
  CheckpointRow,
  CheckpointWrite,
  CollectorStatusPatch,
  CrawlErrorWrite,
  CrawlJobRow,
  CrawlLogWrite,
} from "./rows";
import type { CollectorStore, JobPatch, NewJobInput, UpsertProjectResult } from "./store";

const RESUMABLE_STATUSES = ["PAUSED", "FAILED", "LOGIN_REQUIRED"] as const;

function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}

function check<T>(res: { data: T; error: { message: string } | null }, op: string): T {
  if (res.error) throw new Error(`[db] ${op}: ${res.error.message}`);
  return res.data;
}

export class SupabaseCollectorStore implements CollectorStore {
  constructor(private readonly db: DbClient) {}

  async upsertProject(project: NormalizedProject, now: Date): Promise<UpsertProjectResult> {
    const existing = check(
      await this.db
        .from("projects")
        .select("id, content_hash")
        .eq("platform", project.platform)
        .eq("external_project_id", project.externalProjectId)
        .maybeSingle(),
      "projects.find",
    ) as ExistingProjectRef | null;

    const plan = planProjectUpsert(existing, project, now);
    let id: string;
    if (plan.action === "insert") {
      const inserted = check(
        await this.db.from("projects").insert(plan.row).select("id").single(),
        "projects.insert",
      ) as { id: string };
      id = inserted.id;
    } else {
      check(await this.db.from("projects").update(plan.row).eq("id", plan.id), "projects.update");
      id = plan.id;
    }

    if (plan.snapshot) {
      check(
        await this.db.from("project_snapshots").insert({
          project_id: id,
          content_hash: plan.row.content_hash,
          normalized: hashableFields(project),
          captured_at: now.toISOString(),
        }),
        "project_snapshots.insert",
      );
    }
    return {
      id,
      inserted: plan.action === "insert",
      changed: plan.action === "insert" ? true : plan.changed,
    };
  }

  async findExistingProjectIds(platform: PlatformName, externalIds: string[]): Promise<Set<string>> {
    const found = new Set<string>();
    for (const ids of chunk([...new Set(externalIds)], 100)) {
      if (!ids.length) continue;
      const rows = check(
        await this.db
          .from("projects")
          .select("external_project_id")
          .eq("platform", platform)
          .in("external_project_id", ids),
        "projects.exists",
      ) as Array<{ external_project_id: string }>;
      rows.forEach((r) => found.add(r.external_project_id));
    }
    return found;
  }

  async findProjectIdsSeenSince(platform: PlatformName, externalIds: string[], since: Date): Promise<Set<string>> {
    const found = new Set<string>();
    for (const ids of chunk([...new Set(externalIds)], 100)) {
      if (!ids.length) continue;
      const rows = check(
        await this.db
          .from("projects")
          .select("external_project_id")
          .eq("platform", platform)
          .in("external_project_id", ids)
          .gte("last_seen_at", since.toISOString()),
        "projects.seenSince",
      ) as Array<{ external_project_id: string }>;
      rows.forEach((r) => found.add(r.external_project_id));
    }
    return found;
  }

  async createJob(input: NewJobInput): Promise<CrawlJobRow> {
    return check(
      await this.db
        .from("crawl_jobs")
        .insert({
          platform: input.platform,
          job_type: input.job_type,
          params: input.params ?? {},
          requested_by: input.requested_by ?? null,
          status: input.status ?? "PENDING",
        })
        .select("*")
        .single(),
      "crawl_jobs.insert",
    ) as CrawlJobRow;
  }

  async getJob(id: string): Promise<CrawlJobRow | null> {
    return check(
      await this.db.from("crawl_jobs").select("*").eq("id", id).maybeSingle(),
      "crawl_jobs.get",
    ) as CrawlJobRow | null;
  }

  async claimNextPendingJob(workerId: string, platforms: readonly PlatformName[]): Promise<CrawlJobRow | null> {
    for (let attempt = 0; attempt < 3; attempt++) {
      const candidate = check(
        await this.db
          .from("crawl_jobs")
          .select("id")
          .eq("status", "PENDING")
          .in("platform", platforms as PlatformName[])
          .order("created_at", { ascending: true })
          .limit(1)
          .maybeSingle(),
        "crawl_jobs.next",
      ) as { id: string } | null;
      if (!candidate) return null;

      const now = new Date().toISOString();
      // status=PENDING 조건으로 원자적 선점
      const claimed = check(
        await this.db
          .from("crawl_jobs")
          .update({ status: "RUNNING", worker_id: workerId, heartbeat_at: now })
          .eq("id", candidate.id)
          .eq("status", "PENDING")
          .select("*"),
        "crawl_jobs.claim",
      ) as CrawlJobRow[];
      if (claimed[0]) return claimed[0];
    }
    return null;
  }

  async updateJob(id: string, patch: JobPatch): Promise<void> {
    check(await this.db.from("crawl_jobs").update(patch).eq("id", id), "crawl_jobs.update");
  }

  async findResumableBackfill(platform: PlatformName): Promise<CrawlJobRow | null> {
    return check(
      await this.db
        .from("crawl_jobs")
        .select("*")
        .eq("platform", platform)
        .eq("job_type", "BACKFILL")
        .in("status", [...RESUMABLE_STATUSES])
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      "crawl_jobs.resumable",
    ) as CrawlJobRow | null;
  }

  async hasActiveJob(platform: PlatformName, jobTypes?: readonly string[]): Promise<boolean> {
    let q = this.db
      .from("crawl_jobs")
      .select("id", { count: "exact", head: true })
      .eq("platform", platform)
      .in("status", ["PENDING", "RUNNING"]);
    if (jobTypes?.length) q = q.in("job_type", [...jobTypes]);
    const res = await q;
    if (res.error) throw new Error(`[db] crawl_jobs.active: ${res.error.message}`);
    return (res.count ?? 0) > 0;
  }

  async requeueStaleRunningJobs(staleBefore: Date): Promise<CrawlJobRow[]> {
    return check(
      await this.db
        .from("crawl_jobs")
        .update({ status: "PENDING", worker_id: null })
        .eq("status", "RUNNING")
        .or(`heartbeat_at.is.null,heartbeat_at.lt.${staleBefore.toISOString()}`)
        .select("*"),
      "crawl_jobs.requeue",
    ) as CrawlJobRow[];
  }

  async getCheckpoint(jobId: string): Promise<CheckpointRow | null> {
    return check(
      await this.db.from("crawl_checkpoints").select("*").eq("job_id", jobId).maybeSingle(),
      "crawl_checkpoints.get",
    ) as CheckpointRow | null;
  }

  async saveCheckpoint(checkpoint: CheckpointWrite): Promise<void> {
    check(
      await this.db.from("crawl_checkpoints").upsert(checkpoint, { onConflict: "job_id" }),
      "crawl_checkpoints.upsert",
    );
  }

  async insertError(error: CrawlErrorWrite): Promise<void> {
    check(await this.db.from("crawl_errors").insert(error), "crawl_errors.insert");
  }

  async resolveErrors(platform: PlatformName, externalProjectId: string): Promise<void> {
    check(
      await this.db
        .from("crawl_errors")
        .update({ resolved_at: new Date().toISOString() })
        .eq("platform", platform)
        .eq("external_project_id", externalProjectId)
        .is("resolved_at", null),
      "crawl_errors.resolve",
    );
  }

  async updateCollectorStatus(platform: PlatformName, patch: CollectorStatusPatch): Promise<void> {
    check(
      await this.db.from("collector_status").upsert({ platform, ...patch }, { onConflict: "platform" }),
      "collector_status.upsert",
    );
  }

  async insertLog(log: CrawlLogWrite): Promise<void> {
    check(await this.db.from("crawl_logs").insert(log), "crawl_logs.insert");
  }
}
