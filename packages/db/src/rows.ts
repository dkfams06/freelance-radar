import type {
  CollectorRuntimeStatus,
  CrawlErrorType,
  JobControlAction,
  JobStatus,
  JobType,
  LoginState,
  PlatformName,
} from "@fr/shared";

export interface ProjectRow {
  id: string;
  platform: PlatformName;
  external_project_id: string;
  project_key: string;
  project_url: string;
  title: string | null;
  description: string | null;
  budget: string | null;
  budget_min: number | null;
  budget_max: number | null;
  budget_type: string | null;
  project_duration: string | null;
  duration_days: number | null;
  registered_at: string | null;
  deadline_at: string | null;
  project_status: string | null;
  category: string | null;
  subcategory: string | null;
  project_type: string | null;
  skills: string[];
  applicant_count: number | null;
  client_info: Record<string, unknown> | null;
  location: string | null;
  work_method: string | null;
  development_scope: string | null;
  existing_system: string | null;
  planning_status: string | null;
  design_status: string | null;
  required_stack: string[];
  preferred_stack: string[];
  extra: Record<string, unknown>;
  raw_payload: unknown;
  raw_text: string | null;
  raw_metadata: Record<string, unknown> | null;
  raw_html: string | null;
  content_hash: string | null;
  duplicate_group_id: string | null;
  first_seen_at: string;
  last_seen_at: string;
  created_at: string;
  updated_at: string;
}

/** insert/update 시 쓰는 컬럼 (id, project_key, created_at 등 DB 관리 컬럼 제외) */
export type ProjectWrite = Omit<
  ProjectRow,
  "id" | "project_key" | "created_at" | "updated_at" | "first_seen_at" | "duplicate_group_id"
> & { first_seen_at?: string };

export interface CrawlJobRow {
  id: string;
  platform: PlatformName;
  job_type: JobType;
  status: JobStatus;
  requested_action: JobControlAction | null;
  params: JobParams;
  requested_by: string | null;
  worker_id: string | null;
  result: Record<string, unknown> | null;
  error_message: string | null;
  heartbeat_at: string | null;
  created_at: string;
  started_at: string | null;
  finished_at: string | null;
  updated_at: string;
}

export interface JobParams {
  /** ISO 시각. 이 시각 이전에 등록된 프로젝트는 수집하지 않음 */
  cutoff?: string;
  /** 검증용 소량 수집 (예: 20) */
  max_projects?: number;
  /** BACKFILL 시작 페이지 강제 */
  start_page?: number;
  /** RESUME 대상 BACKFILL job id */
  target_job_id?: string;
  /** CHECK_NEW: 최대 탐색 페이지 */
  max_pages?: number;
  /** CHECK_NEW: 이미 있는 프로젝트를 연속 N개 만나면 종료 */
  known_streak_stop?: number;
  /** CHECK_NEW: 만난 기존 프로젝트도 상세 재조회해서 상태 변화 반영 */
  refresh_known?: boolean;
  [key: string]: unknown;
}

export interface CheckpointRow {
  id: string;
  platform: PlatformName;
  job_id: string;
  last_page: number;
  current_page: number | null;
  last_project_id: string | null;
  processed_count: number;
  success_count: number;
  failure_count: number;
  skipped_count: number;
  new_count: number;
  oldest_registered_at: string | null;
  cutoff_at: string | null;
  status: string;
  started_at: string;
  updated_at: string;
}

export type CheckpointWrite = Omit<CheckpointRow, "id" | "updated_at">;

export interface CrawlErrorRow {
  id: string;
  platform: PlatformName;
  job_id: string | null;
  external_project_id: string | null;
  url: string | null;
  page: number | null;
  error_type: CrawlErrorType | string;
  error_message: string;
  stack: string | null;
  retry_count: number;
  details: Record<string, unknown> | null;
  occurred_at: string;
  resolved_at: string | null;
}

export type CrawlErrorWrite = Omit<CrawlErrorRow, "id" | "occurred_at" | "resolved_at">;

export interface CollectorStatusRow {
  platform: PlatformName;
  status: CollectorRuntimeStatus;
  current_job_id: string | null;
  current_job_type: JobType | null;
  current_page: number | null;
  processed_count: number;
  success_count: number;
  failure_count: number;
  last_success_at: string | null;
  last_error_at: string | null;
  last_error_message: string | null;
  login_state: LoginState;
  login_detail: string | null;
  worker_id: string | null;
  heartbeat_at: string | null;
  updated_at: string;
}

export type CollectorStatusPatch = Partial<Omit<CollectorStatusRow, "platform" | "updated_at">>;

export interface CrawlLogWrite {
  platform: PlatformName | null;
  job_id: string | null;
  level: "debug" | "info" | "warn" | "error";
  event: string;
  message?: string | null;
  data?: Record<string, unknown> | null;
}
