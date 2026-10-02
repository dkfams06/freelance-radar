import type { CrawlErrorType } from "./types";

/**
 * 크롤링 중 발생한 오류를 분류해서 Core 가 플랫폼을 모른 채로
 * retry / 속도 조절 / 로그인 처리를 결정할 수 있게 한다.
 */
export class CrawlError extends Error {
  readonly type: CrawlErrorType;
  readonly httpStatus: number | null;
  readonly url: string | null;

  constructor(
    type: CrawlErrorType,
    message: string,
    options: { httpStatus?: number | null; url?: string | null; cause?: unknown } = {},
  ) {
    super(message, { cause: options.cause });
    this.name = "CrawlError";
    this.type = type;
    this.httpStatus = options.httpStatus ?? null;
    this.url = options.url ?? null;
  }

  /** 일반 retry 대상인가 (로그인 계열은 별도 처리) */
  get retryable(): boolean {
    return !["LOGIN_EXPIRED", "LOGIN_REQUIRED", "NOT_FOUND", "PARSE"].includes(this.type);
  }

  /** 사이트가 부하를 감지했을 가능성이 있어 속도를 줄여야 하는가 */
  get shouldThrottle(): boolean {
    return ["RATE_LIMITED", "FORBIDDEN", "TIMEOUT", "NETWORK"].includes(this.type);
  }
}

/** 세션 만료: 자동 로그인 후 재시도 가능 */
export class LoginExpiredError extends CrawlError {
  constructor(message = "login session expired", options: { url?: string | null } = {}) {
    super("LOGIN_EXPIRED", message, options);
    this.name = "LoginExpiredError";
  }
}

/** CAPTCHA / OTP / 2차 인증 등 사람의 개입이 필요한 상태. 우회하지 않는다. */
export class LoginRequiredError extends CrawlError {
  constructor(message = "manual login required", options: { url?: string | null } = {}) {
    super("LOGIN_REQUIRED", message, options);
    this.name = "LoginRequiredError";
  }
}

export function httpStatusToErrorType(status: number): CrawlErrorType {
  if (status === 429) return "RATE_LIMITED";
  if (status === 403) return "FORBIDDEN";
  if (status === 404 || status === 410) return "NOT_FOUND";
  if (status === 401) return "LOGIN_EXPIRED";
  if (status >= 500) return "NETWORK";
  return "UNKNOWN";
}

const TIMEOUT_PATTERN = /time(d)?\s?out|ETIMEDOUT/i;
const NETWORK_PATTERN = /ECONNRESET|ECONNREFUSED|ENOTFOUND|EAI_AGAIN|socket hang up|net::ERR_|network|fetch failed/i;

/** 임의의 오류를 CrawlError 로 정규화한다. */
export function toCrawlError(error: unknown): CrawlError {
  if (error instanceof CrawlError) return error;
  const message = error instanceof Error ? error.message : String(error);
  if (TIMEOUT_PATTERN.test(message)) return new CrawlError("TIMEOUT", message, { cause: error });
  if (NETWORK_PATTERN.test(message)) return new CrawlError("NETWORK", message, { cause: error });
  return new CrawlError("UNKNOWN", message, { cause: error });
}
