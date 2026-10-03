import {
  CrawlError,
  LoginExpiredError,
  LoginRequiredError,
  httpStatusToErrorType,
  parseKstDate,
  type AdapterContext,
  type FreelancePlatformAdapter,
  type LoginCheckResult,
  type LoginResult,
  type NormalizedProject,
  type ProjectListItem,
  type ProjectListParams,
  type ProjectListResult,
  type RawProjectDetail,
} from "@fr/shared";
import { FREEMOA_BASE_URL, freemoaProjectUrl, normalizeFreemoa } from "./normalize";
import { LOGIN_CHECK_SCRIPT, detailScript, listScript } from "./scripts";
import type { FreemoaDetailResponse, FreemoaListResponse, FreemoaListRow, FreemoaRaw } from "./types";

const PAGE_SIZE = 10;
const LOGIN_URL = `${FREEMOA_BASE_URL}/m0/s02`;
/** API 응답 ERROR.NO == -1: "로그인이 필요한 서비스입니다." */
const ERROR_LOGIN_REQUIRED = -1;

export class FreemoaAdapter implements FreelancePlatformAdapter {
  readonly platform = "freemoa" as const;
  readonly displayName = "Freemoa";
  private onSite = false;

  constructor(private readonly ctx: AdapterContext) {}

  projectUrl(externalId: string): string {
    return freemoaProjectUrl(externalId);
  }

  private async ensureOnSite(force = false): Promise<void> {
    if (this.onSite && !force) return;
    const nav = await this.ctx.page.goto(`${FREEMOA_BASE_URL}/m4/s41`);
    if (nav.status && nav.status >= 400) {
      throw new CrawlError(httpStatusToErrorType(nav.status), `freemoa home HTTP ${nav.status}`, {
        httpStatus: nav.status,
        url: nav.url,
      });
    }
    this.onSite = nav.url.startsWith(FREEMOA_BASE_URL);
  }

  private async evaluate<T>(script: string): Promise<T> {
    await this.ensureOnSite();
    try {
      return await this.ctx.page.evaluate<T>(script);
    } catch {
      this.onSite = false;
      await this.ensureOnSite(true);
      return this.ctx.page.evaluate<T>(script);
    }
  }

  async checkLogin(): Promise<LoginCheckResult> {
    const r = await this.evaluate<{ status: number; loggedIn: boolean; captcha: boolean }>(LOGIN_CHECK_SCRIPT);
    if (r.captcha) return { state: "LOGIN_REQUIRED", detail: "captcha/challenge page detected" };
    if (r.status >= 400) {
      throw new CrawlError(httpStatusToErrorType(r.status), `freemoa login check HTTP ${r.status}`, { httpStatus: r.status });
    }
    return r.loggedIn ? { state: "LOGGED_IN" } : { state: "LOGGED_OUT", detail: "logout link not found" };
  }

  async login(): Promise<LoginResult> {
    await this.ensureOnSite(true);
    let check = await this.checkLogin();
    if (check.state === "LOGGED_IN") return { ok: true, state: "LOGGED_IN" };
    if (check.state === "LOGIN_REQUIRED") return { ok: false, ...check };

    if (this.ctx.page.assistedLogin) {
      const r = await this.ctx.page.assistedLogin({ siteName: "프리모아(Freemoa)", loginUrl: LOGIN_URL });
      if (r.attempted) {
        await this.ensureOnSite(true);
        check = await this.checkLogin();
        if (check.state === "LOGGED_IN") return { ok: true, state: "LOGGED_IN" };
        return { ok: false, state: "LOGIN_REQUIRED", detail: r.detail ?? check.detail ?? "assisted login failed" };
      }
    }
    return { ok: false, state: "LOGIN_REQUIRED", detail: "Aside 브라우저에서 프리모아에 직접 로그인해 주세요" };
  }

  async getProjectList({ page }: ProjectListParams): Promise<ProjectListResult> {
    const r = await this.evaluate<FreemoaListResponse>(listScript(page));
    if (r.status !== 200) {
      throw new CrawlError(httpStatusToErrorType(r.status), `freemoa list page ${page} HTTP ${r.status}`, {
        httpStatus: r.status,
      });
    }
    if (r.errorNo === ERROR_LOGIN_REQUIRED) throw new LoginExpiredError("freemoa list requires login");
    if (r.errorNo !== 0 && r.errorNo !== null) {
      throw new CrawlError("UNKNOWN", `freemoa list error ${r.errorNo}: ${r.errorMsg ?? ""}`);
    }
    const items: ProjectListItem[] = r.rows.map((row: FreemoaListRow) => ({
      externalId: String(row.proj_idx),
      url: freemoaProjectUrl(String(row.proj_idx)),
      title: row.title,
      registeredAt: parseKstDate(row.INS_TIME),
      pinned: false,
      raw: row,
    }));
    const total = r.pagination ? Number(r.pagination.totalRows) : null;
    const hasNext = r.pagination ? r.pagination.nextPage !== null || (total !== null && page * PAGE_SIZE < total) : false;
    return {
      page,
      items,
      hasNextPage: items.length > 0 && hasNext,
      totalCount: total,
      totalPages: total !== null ? Math.ceil(total / PAGE_SIZE) : null,
    };
  }

  async getProjectDetail(project: ProjectListItem): Promise<RawProjectDetail> {
    const d = await this.evaluate<FreemoaDetailResponse>(detailScript(project.externalId));
    if (d.status !== 200) {
      throw new CrawlError(httpStatusToErrorType(d.status), `freemoa detail HTTP ${d.status}`, {
        httpStatus: d.status,
        url: project.url,
      });
    }
    if (d.errorNo === ERROR_LOGIN_REQUIRED) {
      throw new LoginExpiredError("freemoa session expired (detail requires login)", { url: project.url });
    }
    if (/captcha|자동입력|보안문자/i.test(d.errorMsg ?? "")) {
      throw new LoginRequiredError(`freemoa: ${d.errorMsg}`, { url: project.url });
    }
    // 견적 요청을 받은 파트너만 열람 가능 등 → 상세 없이 목록 데이터만 보존
    const restricted = d.errorNo !== 0 || !d.view;
    const payload: FreemoaRaw = {
      source: "freemoa.api",
      listRow: (project.raw as FreemoaListRow | undefined) ?? null,
      detail: d,
      detailRestricted: restricted,
    };
    return {
      externalId: project.externalId,
      url: project.url,
      payload,
      text: d.view?.txt ?? null,
      metadata: { source: "freemoa.api", status: d.status, errorNo: d.errorNo },
      listItem: project,
      fetchedAt: new Date(),
    };
  }

  async normalizeProject(raw: RawProjectDetail): Promise<NormalizedProject> {
    return normalizeFreemoa(raw.payload as FreemoaRaw, raw.externalId, raw.url);
  }
}
