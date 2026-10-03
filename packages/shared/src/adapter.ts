import type { BrowserPage } from "./browser";
import type {
  LoginCheckResult,
  LoginResult,
  NormalizedProject,
  PlatformName,
  ProjectListItem,
  ProjectListParams,
  ProjectListResult,
  RawProjectDetail,
} from "./types";

/**
 * 모든 플랫폼 Adapter 가 구현하는 공통 인터페이스.
 * Collector core 는 이 인터페이스만 알고, 플랫폼 분기를 하지 않는다.
 *
 * 오류 규약:
 *  - 세션 만료 → LoginExpiredError
 *  - CAPTCHA/OTP/2차 인증 → LoginRequiredError
 *  - HTTP/네트워크 → CrawlError (type 으로 분류)
 */
export interface FreelancePlatformAdapter {
  readonly platform: PlatformName;
  readonly displayName: string;

  /** 외부 프로젝트 ID → 상세 URL (목록을 거치지 않는 재수집에 사용) */
  projectUrl(externalId: string): string;

  checkLogin(): Promise<LoginCheckResult>;
  login(): Promise<LoginResult>;

  getProjectList(params: ProjectListParams): Promise<ProjectListResult>;
  getProjectDetail(project: ProjectListItem): Promise<RawProjectDetail>;
  normalizeProject(raw: RawProjectDetail): Promise<NormalizedProject>;
}

export interface AdapterContext {
  page: BrowserPage;
  log?: (message: string, data?: Record<string, unknown>) => void;
}

export type AdapterFactory = (ctx: AdapterContext) => FreelancePlatformAdapter;
