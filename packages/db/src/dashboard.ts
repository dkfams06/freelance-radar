import { DEFAULT_BACKFILL_CUTOFF, PLATFORMS, type PlatformName } from "@fr/shared";
import type { DbClient } from "./client";
import type { CheckpointRow, CollectorStatusRow, CrawlErrorRow, CrawlJobRow, ProjectRow } from "./rows";

function check<T>(res: { data: T; error: { message: string } | null }, op: string): T {
  if (res.error) throw new Error(`[db] ${op}: ${res.error.message}`);
  return res.data;
}

export interface Overview {
  total: number;
  wishket: number;
  freemoa: number;
  lastCollectedAt: string | null;
  unresolvedErrors: number;
}

export interface PlatformPanel {
  platform: PlatformName;
  status: CollectorStatusRow | null;
  currentJob: CrawlJobRow | null;
  backfillJob: CrawlJobRow | null;
  backfillCheckpoint: CheckpointRow | null;
  /** 0~1, 알 수 없으면 null */
  backfillProgress: number | null;
  hasActiveJob: boolean;
}

export type RecentProject = Pick<
  ProjectRow,
  "id" | "platform" | "title" | "budget" | "registered_at" | "project_status" | "first_seen_at" | "last_seen_at" | "project_url"
>;

export async function getOverview(db: DbClient): Promise<Overview> {
  const counts = check(await db.from("project_counts").select("*").single(), "project_counts") as {
    total: number;
    wishket: number;
    freemoa: number;
    last_collected_at: string | null;
  };
  const errors = await db
    .from("crawl_errors")
    .select("id", { count: "exact", head: true })
    .is("resolved_at", null);
  if (errors.error) throw new Error(`[db] crawl_errors.count: ${errors.error.message}`);
  return {
    total: Number(counts.total),
    wishket: Number(counts.wishket),
    freemoa: Number(counts.freemoa),
    lastCollectedAt: counts.last_collected_at,
    unresolvedErrors: errors.count ?? 0,
  };
}

/** 체크포인트의 가장 오래된 등록일이 cutoff 에 얼마나 가까워졌는지로 백필 진행률 계산 */
export function computeBackfillProgress(
  job: Pick<CrawlJobRow, "status" | "params" | "created_at"> | null,
  checkpoint: Pick<CheckpointRow, "oldest_registered_at" | "cutoff_at" | "started_at"> | null,
  now = new Date(),
): number | null {
  if (!job) return null;
  if (job.status === "COMPLETED") return 1;
  const cutoff = new Date(checkpoint?.cutoff_at ?? (job.params?.cutoff as string | undefined) ?? DEFAULT_BACKFILL_CUTOFF);
  if (!checkpoint?.oldest_registered_at) return 0;
  const start = new Date(checkpoint.started_at ?? job.created_at).getTime();
  const span = Math.max(1, Math.min(start, now.getTime()) - cutoff.getTime());
  const done = Math.min(start, now.getTime()) - new Date(checkpoint.oldest_registered_at).getTime();
  return Math.max(0, Math.min(1, done / span));
}

export async function getPlatformPanels(db: DbClient): Promise<PlatformPanel[]> {
  const statuses = check(await db.from("collector_status").select("*"), "collector_status") as CollectorStatusRow[];
  const panels: PlatformPanel[] = [];
  for (const platform of PLATFORMS) {
    const status = statuses.find((s) => s.platform === platform) ?? null;
    const latest = check(
      await db.from("crawl_jobs").select("*").eq("platform", platform).order("created_at", { ascending: false }).limit(10),
      "crawl_jobs.latest",
    ) as CrawlJobRow[];
    const currentJob =
      latest.find((j) => j.status === "RUNNING") ??
      latest.find((j) => j.status === "PENDING") ??
      (status?.current_job_id ? (latest.find((j) => j.id === status.current_job_id) ?? null) : null);
    const backfillJob = (
      check(
        await db
          .from("crawl_jobs")
          .select("*")
          .eq("platform", platform)
          .eq("job_type", "BACKFILL")
          .order("created_at", { ascending: false })
          .limit(1),
        "crawl_jobs.backfill",
      ) as CrawlJobRow[]
    )[0] ?? null;
    const backfillCheckpoint = backfillJob
      ? ((check(
          await db.from("crawl_checkpoints").select("*").eq("job_id", backfillJob.id).maybeSingle(),
          "crawl_checkpoints.get",
        ) as CheckpointRow | null) ?? null)
      : null;
    panels.push({
      platform,
      status,
      currentJob,
      backfillJob,
      backfillCheckpoint,
      backfillProgress: computeBackfillProgress(backfillJob, backfillCheckpoint),
      hasActiveJob: latest.some((j) => j.status === "RUNNING" || j.status === "PENDING"),
    });
  }
  return panels;
}

export async function getRecentProjects(db: DbClient, limit = 50): Promise<RecentProject[]> {
  return check(
    await db
      .from("projects")
      .select("id, platform, title, budget, registered_at, project_status, first_seen_at, last_seen_at, project_url")
      .order("first_seen_at", { ascending: false })
      .limit(limit),
    "projects.recent",
  ) as RecentProject[];
}

export async function getProjectById(db: DbClient, id: string): Promise<ProjectRow | null> {
  return check(await db.from("projects").select("*").eq("id", id).maybeSingle(), "projects.get") as ProjectRow | null;
}

export async function getRecentErrors(db: DbClient, limit = 50): Promise<CrawlErrorRow[]> {
  return check(
    await db.from("crawl_errors").select("*").order("occurred_at", { ascending: false }).limit(limit),
    "crawl_errors.recent",
  ) as CrawlErrorRow[];
}

export async function getRecentJobs(db: DbClient, limit = 20): Promise<CrawlJobRow[]> {
  return check(
    await db.from("crawl_jobs").select("*").order("created_at", { ascending: false }).limit(limit),
    "crawl_jobs.recent",
  ) as CrawlJobRow[];
}

// ---------------------------------------------------------------------------
// 대시보드 명령: job row 를 만들거나 제어 요청을 남긴다. 실제 실행은 Collector 가 한다.
// ---------------------------------------------------------------------------

export type DashboardCommand = "backfill" | "pause" | "resume" | "check_new";

export async function runDashboardCommand(
  db: DbClient,
  command: DashboardCommand,
  platform: PlatformName,
  params: Record<string, unknown> = {},
): Promise<string> {
  const active = check(
    await db.from("crawl_jobs").select("*").eq("platform", platform).in("status", ["PENDING", "RUNNING"]),
    "crawl_jobs.active",
  ) as CrawlJobRow[];

  const insert = async (job_type: string) => {
    check(
      await db.from("crawl_jobs").insert({ platform, job_type, params, requested_by: "dashboard" }),
      "crawl_jobs.insert",
    );
  };

  switch (command) {
    case "backfill":
      if (active.some((j) => j.job_type === "BACKFILL" || j.job_type === "RESUME")) return "이미 백필이 대기/진행 중입니다";
      await insert("BACKFILL");
      return "백필 작업을 등록했습니다";
    case "check_new":
      if (active.some((j) => j.job_type === "CHECK_NEW")) return "신규 확인이 이미 대기/진행 중입니다";
      await insert("CHECK_NEW");
      return "신규 확인 작업을 등록했습니다";
    case "resume":
      if (active.some((j) => j.job_type === "BACKFILL" || j.job_type === "RESUME")) return "이미 백필이 대기/진행 중입니다";
      await insert("RESUME");
      return "재개 작업을 등록했습니다";
    case "pause": {
      if (!active.length) return "중지할 작업이 없습니다";
      for (const j of active) {
        if (j.status === "PENDING") {
          check(await db.from("crawl_jobs").update({ status: "PAUSED" }).eq("id", j.id).eq("status", "PENDING"), "crawl_jobs.pause");
        } else {
          check(await db.from("crawl_jobs").update({ requested_action: "PAUSE" }).eq("id", j.id), "crawl_jobs.requestPause");
        }
      }
      return "중지를 요청했습니다 (진행 중인 프로젝트 처리 후 멈춥니다)";
    }
  }
}
