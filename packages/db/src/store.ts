import type { JobStatus, JobType, NormalizedProject, PlatformName } from "@fr/shared";
import type {
  CheckpointRow,
  CheckpointWrite,
  CollectorStatusPatch,
  CrawlErrorWrite,
  CrawlJobRow,
  CrawlLogWrite,
  JobParams,
} from "./rows";

export interface UpsertProjectResult {
  id: string;
  inserted: boolean;
  changed: boolean;
}

export interface NewJobInput {
  platform: PlatformName;
  job_type: JobType;
  params?: JobParams;
  requested_by?: string | null;
  status?: JobStatus;
}

export type JobPatch = Partial<
  Pick<
    CrawlJobRow,
    | "status"
    | "requested_action"
    | "worker_id"
    | "result"
    | "error_message"
    | "heartbeat_at"
    | "started_at"
    | "finished_at"
    | "params"
  >
>;

/**
 * Collector core 가 의존하는 저장소 포트.
 * 운영: SupabaseCollectorStore / 테스트: MemoryCollectorStore
 */
export interface CollectorStore {
  // projects
  upsertProject(project: NormalizedProject, now: Date): Promise<UpsertProjectResult>;
  findExistingProjectIds(platform: PlatformName, externalIds: string[]): Promise<Set<string>>;
  /** 이 시각 이후에 이미 본(last_seen_at) 프로젝트 id 목록 — resume 시 중복 상세조회 방지 */
  findProjectIdsSeenSince(platform: PlatformName, externalIds: string[], since: Date): Promise<Set<string>>;

  // jobs
  createJob(input: NewJobInput): Promise<CrawlJobRow>;
  getJob(id: string): Promise<CrawlJobRow | null>;
  claimNextPendingJob(workerId: string, platforms: readonly PlatformName[]): Promise<CrawlJobRow | null>;
  updateJob(id: string, patch: JobPatch): Promise<void>;
  findResumableBackfill(platform: PlatformName): Promise<CrawlJobRow | null>;
  /** PENDING/RUNNING 상태의 job 이 있는가 (스케줄러 중복 생성 방지) */
  hasActiveJob(platform: PlatformName, jobTypes?: readonly string[]): Promise<boolean>;
  /** heartbeat 가 끊긴 RUNNING job 을 PENDING 으로 되돌린다 (checkpoint 는 유지) */
  requeueStaleRunningJobs(staleBefore: Date): Promise<CrawlJobRow[]>;

  // checkpoints
  getCheckpoint(jobId: string): Promise<CheckpointRow | null>;
  saveCheckpoint(checkpoint: CheckpointWrite): Promise<void>;

  // errors
  insertError(error: CrawlErrorWrite): Promise<void>;
  resolveErrors(platform: PlatformName, externalProjectId: string): Promise<void>;

  // runtime status / logs
  updateCollectorStatus(platform: PlatformName, patch: CollectorStatusPatch): Promise<void>;
  insertLog(log: CrawlLogWrite): Promise<void>;
}
