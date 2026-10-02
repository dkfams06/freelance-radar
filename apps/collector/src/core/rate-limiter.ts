import { randomBetween, sleep as defaultSleep, type CrawlError } from "@fr/shared";

export interface RateLimiterOptions {
  minDelayMs?: number;
  maxDelayMs?: number;
  /** 감속 시 곱해지는 배수 */
  backoffFactor?: number;
  maxMultiplier?: number;
  /** 연속 성공 N 회마다 한 단계 회복 */
  recoverAfter?: number;
  /** 응답이 이보다 느리면 감속 */
  slowResponseMs?: number;
  random?: () => number;
  sleep?: (ms: number) => Promise<void>;
}

/**
 * 요청 사이 간격을 조절한다.
 * 기본 1.5~3초 랜덤, 429/403/timeout/network 오류나 느린 응답이 감지되면 배수를 키운다.
 */
export class AdaptiveRateLimiter {
  private multiplier = 1;
  private successStreak = 0;
  private lastRequestAt = 0;
  private readonly o: Required<Omit<RateLimiterOptions, "random" | "sleep">>;
  private readonly random: () => number;
  private readonly sleepFn: (ms: number) => Promise<void>;

  constructor(options: RateLimiterOptions = {}) {
    this.o = {
      minDelayMs: options.minDelayMs ?? 1500,
      maxDelayMs: options.maxDelayMs ?? 3000,
      backoffFactor: options.backoffFactor ?? 2,
      maxMultiplier: options.maxMultiplier ?? 16,
      recoverAfter: options.recoverAfter ?? 10,
      slowResponseMs: options.slowResponseMs ?? 8000,
    };
    this.random = options.random ?? Math.random;
    this.sleepFn = options.sleep ?? ((ms) => defaultSleep(ms));
  }

  get currentMultiplier(): number {
    return this.multiplier;
  }

  nextDelayMs(): number {
    return Math.round(randomBetween(this.o.minDelayMs, this.o.maxDelayMs, this.random) * this.multiplier);
  }

  /** 다음 요청 전에 호출. 마지막 요청 이후 경과 시간을 고려해 남은 만큼만 기다린다. */
  async wait(now: () => number = Date.now): Promise<number> {
    const delay = this.nextDelayMs();
    const elapsed = this.lastRequestAt ? now() - this.lastRequestAt : delay;
    const remaining = Math.max(0, delay - elapsed);
    if (remaining > 0) await this.sleepFn(remaining);
    this.lastRequestAt = now();
    return remaining;
  }

  onSuccess(responseMs?: number): void {
    if (responseMs !== undefined && responseMs > this.o.slowResponseMs) {
      this.slowDown();
      return;
    }
    this.successStreak++;
    if (this.multiplier > 1 && this.successStreak >= this.o.recoverAfter) {
      this.multiplier = Math.max(1, this.multiplier / this.o.backoffFactor);
      this.successStreak = 0;
    }
  }

  onError(error: CrawlError): void {
    if (error.shouldThrottle) this.slowDown();
  }

  slowDown(): void {
    this.successStreak = 0;
    this.multiplier = Math.min(this.o.maxMultiplier, this.multiplier * this.o.backoffFactor);
  }
}
