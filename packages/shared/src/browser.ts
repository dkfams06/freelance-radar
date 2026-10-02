/**
 * 플랫폼 Adapter 가 사용하는 최소 브라우저 인터페이스.
 * 실제 구현은 apps/collector 의 Aside 드라이버가 담당한다.
 * Adapter 는 Aside/CDP 의 존재를 몰라야 한다.
 */
export interface NavigationResult {
  url: string;
  /** 메인 문서 HTTP 상태 (알 수 없으면 null) */
  status: number | null;
}

export interface BrowserPage {
  goto(url: string, options?: { timeoutMs?: number }): Promise<NavigationResult>;
  /** 페이지 컨텍스트에서 JS 표현식을 평가하고 JSON 직렬화 가능한 결과를 반환한다. */
  evaluate<T = unknown>(expression: string, options?: { timeoutMs?: number }): Promise<T>;
  currentUrl(): Promise<string>;
  html(): Promise<string>;
  /**
   * 선택 기능: 브라우저가 저장된 자격증명(비밀번호 관리자 자동입력)으로 로그인을 시도한다.
   * CAPTCHA/OTP 를 우회하지 않는다. 결과는 호출자가 다시 확인해야 한다.
   */
  assistedLogin?(request: { siteName: string; loginUrl: string }): Promise<{ attempted: boolean; detail?: string }>;
}

export interface PageFetchResult<T = unknown> {
  status: number;
  ok: boolean;
  url: string;
  contentType: string | null;
  json: T | null;
  text: string | null;
}

/**
 * 로그인 세션 쿠키를 그대로 사용하도록 현재 페이지 컨텍스트에서 fetch 를 실행한다.
 * (같은 origin 의 내부 JSON API 호출에 사용)
 */
export async function pageFetch<T = unknown>(
  page: BrowserPage,
  url: string,
  init: { method?: string; headers?: Record<string, string>; body?: string } = {},
): Promise<PageFetchResult<T>> {
  const expr = `(async () => {
    const res = await fetch(${JSON.stringify(url)}, {
      method: ${JSON.stringify(init.method ?? "GET")},
      headers: ${JSON.stringify(init.headers ?? {})},
      body: ${init.body === undefined ? "undefined" : JSON.stringify(init.body)},
      credentials: "include",
    });
    const contentType = res.headers.get("content-type");
    const text = await res.text();
    let json = null;
    if (contentType && contentType.includes("json")) { try { json = JSON.parse(text); } catch {} }
    return { status: res.status, ok: res.ok, url: res.url, contentType, json, text: json === null ? text : null };
  })()`;
  return page.evaluate<PageFetchResult<T>>(expr);
}

export async function waitForCondition(
  page: BrowserPage,
  conditionExpression: string,
  { timeoutMs = 15_000, intervalMs = 300 }: { timeoutMs?: number; intervalMs?: number } = {},
): Promise<boolean> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const ok = await page.evaluate<boolean>(`Boolean(${conditionExpression})`).catch(() => false);
    if (ok) return true;
    await new Promise((r) => setTimeout(r, intervalMs));
  }
  return false;
}
