export const PLATFORMS = ["wishket", "freemoa"] as const;
export type PlatformName = (typeof PLATFORMS)[number];

export function isPlatformName(value: unknown): value is PlatformName {
  return typeof value === "string" && (PLATFORMS as readonly string[]).includes(value);
}

/** RETRY_ERRORS: 미해결 crawl_errors 의 프로젝트를 다시 수집 */
export const JOB_TYPES = ["BACKFILL", "CHECK_NEW", "RESUME", "RETRY_ERRORS"] as const;
export type JobType = (typeof JOB_TYPES)[number];

export const JOB_STATUSES = [
  "PENDING",
  "RUNNING",
  "PAUSED",
  "COMPLETED",
  "FAILED",
  "CANCELLED",
  "LOGIN_REQUIRED",
] as const;
export type JobStatus = (typeof JOB_STATUSES)[number];

/** Dashboard → Collector 제어 요청. Collector가 다음 안전 지점에서 반영한다. */
export type JobControlAction = "PAUSE" | "CANCEL";

export type LoginState = "LOGGED_IN" | "LOGGED_OUT" | "LOGIN_REQUIRED" | "UNKNOWN";

export type CollectorRuntimeStatus =
  | "IDLE"
  | "RUNNING"
  | "PAUSED"
  | "LOGIN_REQUIRED"
  | "ERROR"
  | "OFFLINE";

export type CrawlErrorType =
  | "NETWORK"
  | "TIMEOUT"
  | "RATE_LIMITED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "PARSE"
  | "LOGIN_EXPIRED"
  | "LOGIN_REQUIRED"
  | "UNKNOWN";

export interface LoginCheckResult {
  state: LoginState;
  /** 사람이 읽을 수 있는 설명 (예: "captcha detected") */
  detail?: string;
}

export interface LoginResult {
  ok: boolean;
  state: LoginState;
  detail?: string;
}

export interface ProjectListParams {
  page: number;
}

export interface ProjectListItem {
  externalId: string;
  url: string;
  title?: string | null;
  /** 목록에서 등록일을 알 수 있으면 채운다 (cutoff 판정에 사용) */
  registeredAt?: Date | null;
  /** 상단 고정/광고 등 정렬 순서를 따르지 않는 항목 */
  pinned?: boolean;
  /** 목록 단계에서 얻은 원본 데이터 (상세 raw 와 함께 보존) */
  raw?: unknown;
}

export interface ProjectListResult {
  page: number;
  items: ProjectListItem[];
  hasNextPage: boolean;
  /** 사이트가 알려주는 전체 건수/페이지 (있다면) */
  totalCount?: number | null;
  totalPages?: number | null;
}

export interface RawProjectDetail {
  externalId: string;
  url: string;
  /** 네트워크 JSON 원본 (우선 저장) */
  payload?: unknown;
  /** 본문 텍스트 */
  text?: string | null;
  /** 수집 메타데이터 (수집 경로, 응답 코드 등) */
  metadata?: Record<string, unknown>;
  /** JSON 을 구할 수 없거나 디버깅이 필요할 때만 */
  html?: string | null;
  listItem?: ProjectListItem;
  fetchedAt: Date;
}

export interface ClientInfo {
  name?: string | null;
  type?: string | null;
  verified?: boolean | null;
  rating?: number | null;
  projectCount?: number | null;
  [key: string]: unknown;
}

export interface NormalizedProject {
  platform: PlatformName;
  externalProjectId: string;
  projectUrl: string;

  title: string | null;
  description: string | null;

  budget: string | null;
  budgetMin: number | null;
  budgetMax: number | null;
  budgetType: string | null;

  projectDuration: string | null;
  durationDays: number | null;

  registeredAt: Date | null;
  deadlineAt: Date | null;

  projectStatus: string | null;

  category: string | null;
  subcategory: string | null;
  projectType: string | null;

  skills: string[];
  applicantCount: number | null;

  clientInfo: ClientInfo | null;
  location: string | null;
  workMethod: string | null;
  developmentScope: string | null;
  existingSystem: string | null;
  planningStatus: string | null;
  designStatus: string | null;
  requiredStack: string[];
  preferredStack: string[];

  /** 공통 컬럼에 매핑되지 않은 추가 정규화 필드 (버리지 않는다) */
  extra: Record<string, unknown>;

  rawPayload: unknown;
  rawText: string | null;
  rawMetadata: Record<string, unknown> | null;
  rawHtml: string | null;
}

export function emptyNormalizedProject(
  platform: PlatformName,
  externalProjectId: string,
  projectUrl: string,
): NormalizedProject {
  return {
    platform,
    externalProjectId,
    projectUrl,
    title: null,
    description: null,
    budget: null,
    budgetMin: null,
    budgetMax: null,
    budgetType: null,
    projectDuration: null,
    durationDays: null,
    registeredAt: null,
    deadlineAt: null,
    projectStatus: null,
    category: null,
    subcategory: null,
    projectType: null,
    skills: [],
    applicantCount: null,
    clientInfo: null,
    location: null,
    workMethod: null,
    developmentScope: null,
    existingSystem: null,
    planningStatus: null,
    designStatus: null,
    requiredStack: [],
    preferredStack: [],
    extra: {},
    rawPayload: null,
    rawText: null,
    rawMetadata: null,
    rawHtml: null,
  };
}
