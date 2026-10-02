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

  checkLogin(): Promise<LoginCheckResult>;
  login(): Promise<LoginResult>;

  getProjectList(params: ProjectListParams): Promise<ProjectListResult>;
  getProjectDetail(project: ProjectListItem): Promise<RawProjectDetail>;
  normalizeProject(raw: RawProjectDetail): Promise<NormalizedProject>;
}

export interface AdapterContext {
  page: BrowserPage;
  /** 선택적 자동 로그인 자격증명 (환경변수에서만 주입, DB 저장 금지) */
  credentials?: { username: string; password: string } | null;
  log?: (message: string, data?: Record<string, unknown>) => void;
}

export type AdapterFactory = (ctx: AdapterContext) => FreelancePlatformAdapter;
