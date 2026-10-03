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
import { WISHKET_BASE_URL, normalizeWishket } from "./normalize";
import { LOGIN_CHECK_SCRIPT, detailScript, listScript } from "./scripts";
import type { WishketDetailPayload, WishketListCard, WishketListResponse, WishketRaw } from "./types";

const PAGE_SIZE = 10;
const LOGIN_URL = `${WISHKET_BASE_URL}/accounts/login/`;

export class WishketAdapter implements FreelancePlatformAdapter {
  readonly platform = "wishket" as const;
  readonly displayName = "Wishket";
  private onSite = false;

  constructor(private readonly ctx: AdapterContext) {}

  projectUrl(externalId: string): string {
    return `${WISHKET_BASE_URL}/project/${encodeURIComponent(externalId)}/`;
  }

  /** 같은 origin fetch 를 위해 위시캣 페이지가 열려 있어야 한다 */
  private async ensureOnSite(force = false): Promise<void> {
    if (this.onSite && !force) return;
    const nav = await this.ctx.page.goto(`${WISHKET_BASE_URL}/project/`);
    if (nav.status && nav.status >= 400) {
      throw new CrawlError(httpStatusToErrorType(nav.status), `wishket home HTTP ${nav.status}`, {
        httpStatus: nav.status,
        url: nav.url,
      });
    }
    this.onSite = nav.url.startsWith(WISHKET_BASE_URL);
  }

  private async evaluate<T>(script: string): Promise<T> {
    await this.ensureOnSite();
    try {
      return await this.ctx.page.evaluate<T>(script);
    } catch (e) {
      // 탭이 다른 곳으로 이동했을 수 있음 → 한 번 복귀 후 재시도
      this.onSite = false;
      await this.ensureOnSite(true);
      return this.ctx.page.evaluate<T>(script);
    }
  }

  async checkLogin(): Promise<LoginCheckResult> {
    const r = await this.evaluate<{ status: number; loggedIn: boolean; captcha: boolean }>(LOGIN_CHECK_SCRIPT);
    if (r.captcha) return { state: "LOGIN_REQUIRED", detail: "captcha/challenge page detected" };
    if (r.status >= 400) {
      throw new CrawlError(httpStatusToErrorType(r.status), `wishket login check HTTP ${r.status}`, { httpStatus: r.status });
    }
    return r.loggedIn ? { state: "LOGGED_IN" } : { state: "LOGGED_OUT", detail: "logout link not found" };
  }

  async login(): Promise<LoginResult> {
    // 1) 페이지 새로고침으로 세션 복구 시도
    await this.ensureOnSite(true);
    let check = await this.checkLogin();
    if (check.state === "LOGGED_IN") return { ok: true, state: "LOGGED_IN" };
    if (check.state === "LOGIN_REQUIRED") return { ok: false, ...check };

    // 2) 브라우저의 저장된 자격증명(자동입력)으로 로그인 시도 — 지원되는 경우만
    if (this.ctx.page.assistedLogin) {
      const r = await this.ctx.page.assistedLogin({ siteName: "위시캣(Wishket)", loginUrl: LOGIN_URL });
      if (r.attempted) {
        await this.ensureOnSite(true);
        check = await this.checkLogin();
        if (check.state === "LOGGED_IN") return { ok: true, state: "LOGGED_IN" };
        return { ok: false, state: "LOGIN_REQUIRED", detail: r.detail ?? check.detail ?? "assisted login failed" };
      }
    }
    return { ok: false, state: "LOGIN_REQUIRED", detail: "Aside 브라우저에서 위시캣에 직접 로그인해 주세요" };
  }

  async getProjectList({ page }: ProjectListParams): Promise<ProjectListResult> {
    const r = await this.evaluate<WishketListResponse>(listScript(page));
    if (r.status === -1) {
      this.onSite = false;
      throw new CrawlError("UNKNOWN", "wishket list script unavailable (LZString missing)");
    }
    if (r.status !== 200) {
      throw new CrawlError(httpStatusToErrorType(r.status), `wishket list page ${page} HTTP ${r.status}`, {
        httpStatus: r.status,
      });
    }
    const items: ProjectListItem[] = r.cards.map((card: WishketListCard) => ({
      externalId: card.id,
      url: `${WISHKET_BASE_URL}${card.path}`,
      title: card.title,
      registeredAt: parseKstDate(card.registeredText),
      pinned: false,
      raw: card,
    }));
    const hasNextPage = r.hasNext || (r.count !== null && page * PAGE_SIZE < r.count);
    return {
      page,
      items,
      hasNextPage: items.length > 0 && hasNextPage,
      totalCount: r.count,
      totalPages: r.count !== null ? Math.ceil(r.count / PAGE_SIZE) : null,
    };
  }

  async getProjectDetail(project: ProjectListItem): Promise<RawProjectDetail> {
    const path = new URL(project.url).pathname;
    const d = await this.evaluate<WishketDetailPayload>(detailScript(path));
    if (d.captcha) throw new LoginRequiredError("captcha/challenge page detected", { url: project.url });
    if (d.status !== 200) {
      throw new CrawlError(httpStatusToErrorType(d.status), `wishket detail HTTP ${d.status}`, {
        httpStatus: d.status,
        url: project.url,
      });
    }
    if (d.notFound) {
      throw new CrawlError("NOT_FOUND", `wishket detail has no project view (${d.pageTitle ?? "unknown page"})`, {
        url: project.url,
      });
    }
    if (!d.loggedIn || d.locked) throw new LoginExpiredError("wishket session expired (detail locked)", { url: project.url });

    const payload: WishketRaw = { detail: d, listCard: (project.raw as WishketListCard | undefined) ?? null };
    return {
      externalId: project.externalId,
      url: project.url,
      payload,
      text: d.text,
      metadata: { source: d.source, status: d.status, finalUrl: d.finalUrl },
      listItem: project,
      fetchedAt: new Date(),
    };
  }

  async normalizeProject(raw: RawProjectDetail): Promise<NormalizedProject> {
    return normalizeWishket(raw.payload as WishketRaw, raw.externalId, raw.url);
  }
}
