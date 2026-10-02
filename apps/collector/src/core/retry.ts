import { CrawlError, sleep as defaultSleep, toCrawlError } from "@fr/shared";

/** 1차 실패 후 10초, 2차 30초, 3차 90초 */
export const DEFAULT_RETRY_DELAYS_MS = [10_000, 30_000, 90_000] as const;

export class RetryExhaustedError extends Error {
  constructor(
    readonly lastError: CrawlError,
    readonly attempts: number,
  ) {
    super(lastError.message, { cause: lastError });
    this.name = "RetryExhaustedError";
  }
}

export interface RetryOptions {
  delaysMs?: readonly number[];
  sleep?: (ms: number) => Promise<void>;
  /** 각 실패마다 호출 (속도 조절/로그용) */
  onFailure?: (error: CrawlError, attempt: number, nextDelayMs: number | null) => void | Promise<void>;
}

/**
 * 재시도 가능한 오류는 delays 만큼 재시도한다 (기본 최대 3회).
 * 재시도 불가 오류(로그인 만료/로그인 필요/404/파싱)는 즉시 그대로 throw.
 * 재시도가 모두 실패하면 RetryExhaustedError.
 */
export async function withRetry<T>(fn: (attempt: number) => Promise<T>, options: RetryOptions = {}): Promise<T> {
  const delays = options.delaysMs ?? DEFAULT_RETRY_DELAYS_MS;
  const sleepFn = options.sleep ?? ((ms: number) => defaultSleep(ms));
  let attempt = 0;
  for (;;) {
    try {
      return await fn(attempt);
    } catch (raw) {
      const error = toCrawlError(raw);
      if (!error.retryable) {
        await options.onFailure?.(error, attempt, null);
        throw error;
      }
      const delay = delays[attempt];
      await options.onFailure?.(error, attempt, delay ?? null);
      if (delay === undefined) throw new RetryExhaustedError(error, attempt + 1);
      await sleepFn(delay);
      attempt++;
    }
  }
}
