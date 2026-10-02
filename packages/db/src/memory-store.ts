import { randomUUID } from "node:crypto";
import type { NormalizedProject, PlatformName } from "@fr/shared";
import { planProjectUpsert, type ProjectUpsertPlan } from "./project-mapping";
import type {
  CheckpointRow,
  CheckpointWrite,
  CollectorStatusPatch,
  CrawlErrorRow,
  CrawlErrorWrite,
  CrawlJobRow,
  CrawlLogWrite,
  ProjectWrite,
} from "./rows";
import type { CollectorStore, JobPatch, NewJobInput, UpsertProjectResult } from "./store";

type StoredProject = ProjectWrite & { id: string; first_seen_at: string };

/** 테스트/드라이런용 인메모리 저장소. SupabaseCollectorStore 와 같은 의미를 따른다. */
export class MemoryCollectorStore implements CollectorStore {
  projects = new Map<string, StoredProject>();
  snapshots: Array<{ projectId: string; hash: string | null }> = [];
  jobs = new Map<string, CrawlJobRow>();
  checkpoints = new Map<string, CheckpointRow>();
  errors: CrawlErrorRow[] = [];
  statuses = new Map<PlatformName, CollectorStatusPatch>();
  logs: CrawlLogWrite[] = [];
  lastPlans: ProjectUpsertPlan[] = [];

  private key(platform: string, id: string) {
    return `${platform}:${id}`;
  }

  async upsertProject(project: NormalizedProject, now: Date): Promise<UpsertProjectResult> {
    const k = this.key(project.platform, project.externalProjectId);
    const existing = this.projects.get(k);
    const plan = planProjectUpsert(
      existing ? { id: existing.id, content_hash: existing.content_hash } : null,
      project,
      now,
    );
    this.lastPlans.push(plan);
    let id: string;
    if (plan.action === "insert") {
      id = randomUUID();
      this.projects.set(k, { ...plan.row, id, first_seen_at: plan.row.first_seen_at ?? now.toISOString() });
    } else {
      id = plan.id;
      this.projects.set(k, { ...existing!, ...plan.row, id, first_seen_at: existing!.first_seen_at });
    }
    if (plan.snapshot) this.snapshots.push({ projectId: id, hash: plan.row.content_hash });
    return { id, inserted: plan.action === "insert", changed: plan.action === "insert" || plan.changed };
  }

  async findExistingProjectIds(platform: PlatformName, externalIds: string[]): Promise<Set<string>> {
    return new Set(externalIds.filter((id) => this.projects.has(this.key(platform, id))));
  }

  async findProjectIdsSeenSince(platform: PlatformName, externalIds: string[], since: Date): Promise<Set<string>> {
    return new Set(
      externalIds.filter((id) => {
        const p = this.projects.get(this.key(platform, id));
        return p && new Date(p.last_seen_at) >= since;
      }),
    );
  }

  async createJob(input: NewJobInput): Promise<CrawlJobRow> {
    const now = new Date().toISOString();
    const job: CrawlJobRow = {
      id: randomUUID(),
      platform: input.platform,
      job_type: input.job_type,
      status: input.status ?? "PENDING",
      requested_action: null,
      params: input.params ?? {},
      requested_by: input.requested_by ?? null,
      worker_id: null,
      result: null,
      error_message: null,
      heartbeat_at: null,
      created_at: now,
      started_at: null,
      finished_at: null,
      updated_at: now,
    };
    this.jobs.set(job.id, job);
    return { ...job };
  }

  async getJob(id: string): Promise<CrawlJobRow | null> {
    const j = this.jobs.get(id);
    return j ? { ...j } : null;
  }

  async claimNextPendingJob(workerId: string, platforms: readonly PlatformName[]): Promise<CrawlJobRow | null> {
    const next = [...this.jobs.values()]
      .filter((j) => j.status === "PENDING" && platforms.includes(j.platform))
      .sort((a, b) => a.created_at.localeCompare(b.created_at))[0];
    if (!next) return null;
    Object.assign(next, { status: "RUNNING", worker_id: workerId, heartbeat_at: new Date().toISOString() });
    return { ...next };
  }

  async updateJob(id: string, patch: JobPatch): Promise<void> {
    const j = this.jobs.get(id);
    if (j) Object.assign(j, patch, { updated_at: new Date().toISOString() });
  }

  async findResumableBackfill(platform: PlatformName): Promise<CrawlJobRow | null> {
    const j = [...this.jobs.values()]
      .filter(
        (x) =>
          x.platform === platform &&
          x.job_type === "BACKFILL" &&
          ["PAUSED", "FAILED", "LOGIN_REQUIRED"].includes(x.status),
      )
      .sort((a, b) => b.created_at.localeCompare(a.created_at))[0];
    return j ? { ...j } : null;
  }

  async hasActiveJob(platform: PlatformName, jobTypes?: readonly string[]): Promise<boolean> {
    return [...this.jobs.values()].some(
      (j) =>
        j.platform === platform &&
        (j.status === "PENDING" || j.status === "RUNNING") &&
        (!jobTypes?.length || jobTypes.includes(j.job_type)),
    );
  }

  async requeueStaleRunningJobs(staleBefore: Date): Promise<CrawlJobRow[]> {
    const out: CrawlJobRow[] = [];
    for (const j of this.jobs.values()) {
      if (j.status === "RUNNING" && (!j.heartbeat_at || new Date(j.heartbeat_at) < staleBefore)) {
        Object.assign(j, { status: "PENDING", worker_id: null });
        out.push({ ...j });
      }
    }
    return out;
  }

  async getCheckpoint(jobId: string): Promise<CheckpointRow | null> {
    const c = this.checkpoints.get(jobId);
    return c ? { ...c } : null;
  }

  async saveCheckpoint(checkpoint: CheckpointWrite): Promise<void> {
    const prev = this.checkpoints.get(checkpoint.job_id);
    this.checkpoints.set(checkpoint.job_id, {
      ...checkpoint,
      id: prev?.id ?? randomUUID(),
      updated_at: new Date().toISOString(),
    });
  }

  async insertError(error: CrawlErrorWrite): Promise<void> {
    this.errors.push({ ...error, id: randomUUID(), occurred_at: new Date().toISOString(), resolved_at: null });
  }

  async resolveErrors(platform: PlatformName, externalProjectId: string): Promise<void> {
    const now = new Date().toISOString();
    for (const e of this.errors) {
      if (e.platform === platform && e.external_project_id === externalProjectId && !e.resolved_at) e.resolved_at = now;
    }
  }

  async updateCollectorStatus(platform: PlatformName, patch: CollectorStatusPatch): Promise<void> {
    this.statuses.set(platform, { ...this.statuses.get(platform), ...patch });
  }

  async insertLog(log: CrawlLogWrite): Promise<void> {
    this.logs.push(log);
  }
}
