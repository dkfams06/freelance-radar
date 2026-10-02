import { CrawlError, toCrawlError, type BrowserPage, type NavigationResult, type PlatformName } from "@fr/shared";
import type { CollectorLogger } from "../core/logger";
import { AsideMcpClient } from "./aside-mcp";
import type { BrowserProvider } from "./provider";

const MARK = "__FR_RESULT__";
const TAB_LOST_PATTERN = /target.*closed|has been closed|detached|Cannot read properties of (undefined|null)/i;

class TabLostError extends CrawlError {
  constructor(message: string) {
    super("NETWORK", message);
  }
}

/** REPL 출력에서 마커가 붙은 JSON 한 줄을 찾는다 */
export function parseMarkedResult<T>(text: string): T {
  const lines = text.split(/\r?\n/);
  for (let i = lines.length - 1; i >= 0; i--) {
    const line = lines[i]!;
    const at = line.indexOf(MARK);
    if (at >= 0) return JSON.parse(line.slice(at + MARK.length)) as T;
  }
  throw new CrawlError("UNKNOWN", `aside repl returned no result: ${text.slice(0, 500)}`);
}

/**
 * Aside REPL 안에서 플랫폼별 탭 하나를 유지하는 BrowserPage 구현.
 * 탭 핸들은 REPL 전역 `globalThis.__fr[key]` 에 두고, 모든 코드는 IIFE 로 감싸
 * REPL 의 const/let 영속 스코프와 충돌하지 않게 한다.
 */
export class AsideBrowserPage implements BrowserPage {
  private targetId: string | null = null;
  private generation = -1;
  private lastUrl: string;

  constructor(
    private readonly client: AsideMcpClient,
    private readonly key: string,
    private readonly homeUrl: string,
  ) {
    this.lastUrl = homeUrl;
  }

  private tabExpr() {
    return `globalThis.__fr && globalThis.__fr[${JSON.stringify(this.key)}]`;
  }

  /** REPL 이 재시작되었거나 탭이 닫혔으면 탭을 다시 확보한다. 새로 열었으면 true */
  private async ensureTab(url: string): Promise<boolean> {
    await this.client.ensureStarted();
    if (this.generation === this.client.generation) return false;
    const key = JSON.stringify(this.key);
    const target = JSON.stringify(this.targetId);
    const info = await this.run<{ targetId: string | null; url: string }>(
      "open tab",
      `globalThis.__fr = globalThis.__fr || {};
       let p = null;
       const wanted = ${target};
       if (wanted) {
         const open = await listBrowserTabs();
         if (open.some((t) => t.targetId === wanted)) { try { p = await attachBrowserTab(wanted); } catch {} }
       }
       if (!p) p = await openTab(${JSON.stringify(url)});
       globalThis.__fr[${key}] = p;
       let targetId = null;
       try {
         const open = await listBrowserTabs();
         const m = open.find((t) => t.url === p.url() && t.active) || open.find((t) => t.url === p.url());
         targetId = m ? m.targetId : null;
       } catch {}
       return { targetId, url: p.url() };`,
      false,
    );
    this.targetId = info.targetId ?? this.targetId;
    this.generation = this.client.generation;
    this.lastUrl = info.url;
    return true;
  }

  /** IIFE 로 감싼 코드를 실행. body 는 값을 return 한다. 탭을 잃었으면 한 번 복구 후 재시도. */
  private async run<T>(title: string, body: string, ensure = true, timeoutMs?: number): Promise<T> {
    if (!ensure) return this.runOnce<T>(title, body, timeoutMs);
    await this.ensureTab(this.lastUrl);
    try {
      return await this.runOnce<T>(title, body, timeoutMs);
    } catch (e) {
      if (!(e instanceof TabLostError)) throw e;
      this.generation = -1;
      await this.ensureTab(this.lastUrl);
      return this.runOnce<T>(title, body, timeoutMs);
    }
  }

  private async runOnce<T>(title: string, body: string, timeoutMs?: number): Promise<T> {
    const code = `await (async () => {
      const __v = await (async () => { ${body} })();
      console.log(${JSON.stringify(MARK)} + JSON.stringify(__v === undefined ? null : __v));
    })();`;
    const res = await this.client.repl(`[freelance-radar] ${this.key}: ${title}`, code, timeoutMs);
    if (res.isError) {
      if (TAB_LOST_PATTERN.test(res.text)) throw new TabLostError(res.text);
      throw toCrawlError(new Error(res.text));
    }
    return parseMarkedResult<T>(res.text);
  }

  async goto(url: string, options: { timeoutMs?: number } = {}): Promise<NavigationResult> {
    const timeout = options.timeoutMs ?? 60_000;
    const opened = await this.ensureTab(url);
    const result = await this.run<NavigationResult>(
      "goto",
      `const p = ${this.tabExpr()};
       ${opened ? "" : `await p.goto(${JSON.stringify(url)}, { waitUntil: "domcontentloaded", timeout: ${timeout} });`}
       const status = await p.evaluate(() => { const n = performance.getEntriesByType("navigation")[0]; return n && n.responseStatus ? n.responseStatus : null; });
       return { url: p.url(), status };`,
      false,
      timeout + 15_000,
    );
    this.lastUrl = result.url;
    return result;
  }

  async evaluate<T = unknown>(expression: string, options: { timeoutMs?: number } = {}): Promise<T> {
    return this.run<T>(
      "evaluate",
      `const p = ${this.tabExpr()}; return await p.evaluate(${JSON.stringify(expression)});`,
      true,
      options.timeoutMs,
    );
  }

  async currentUrl(): Promise<string> {
    return this.run<string>("url", `return ${this.tabExpr()}.url();`);
  }

  async html(): Promise<string> {
    return this.evaluate<string>("document.documentElement.outerHTML");
  }

  async closeTab(): Promise<void> {
    if (this.generation !== this.client.generation) return;
    await this.client
      .repl(
        `[freelance-radar] ${this.key}: close tab`,
        `await (async () => { const p = ${this.tabExpr()}; if (p) { await closeTab(p); delete globalThis.__fr[${JSON.stringify(this.key)}]; } })();`,
      )
      .catch(() => {});
  }
}

const HOME_URLS: Record<PlatformName, string> = {
  wishket: "https://www.wishket.com/project/",
  freemoa: "https://www.freemoa.net/m4/s41",
};

/**
 * Aside Browser 공급자.
 * 로그인 세션/쿠키는 사용자의 Aside 브라우저 프로필에 있으므로 별도 저장하지 않는다.
 */
export class AsideBrowserProvider implements BrowserProvider {
  readonly name = "aside";
  private readonly client: AsideMcpClient;
  private readonly pages = new Map<PlatformName, AsideBrowserPage>();

  constructor(logger: CollectorLogger, options: { account?: string | null; cliPath?: string } = {}) {
    this.client = new AsideMcpClient({
      account: options.account,
      cliPath: options.cliPath,
      log: (msg) => logger.debug("ASIDE", { message: msg }),
    });
  }

  async start(): Promise<void> {
    await this.client.ensureStarted();
  }

  async getPage(platform: PlatformName): Promise<BrowserPage> {
    let page = this.pages.get(platform);
    if (!page) {
      page = new AsideBrowserPage(this.client, platform, HOME_URLS[platform]);
      this.pages.set(platform, page);
    }
    return page;
  }

  async close(): Promise<void> {
    if (process.env.ASIDE_KEEP_TABS !== "1") {
      for (const page of this.pages.values()) await page.closeTab();
    }
    await this.client.close();
  }
}
