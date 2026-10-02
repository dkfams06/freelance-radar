import { hostname } from "node:os";
import { errorMessage, sleep, type PlatformName } from "@fr/shared";
import type { CollectorStore, CrawlJobRow } from "@fr/db";
import { AdapterRegistry } from "./adapters";
import type { BrowserProvider } from "./browser/provider";
import { JobRunner, type JobOutcome } from "./core/job-runner";
import type { CollectorLogger } from "./core/logger";
import { AdaptiveRateLimiter } from "./core/rate-limiter";

export const WORKER_ID = `${hostname()}:${process.pid}`;

export interface WorkerOptions {
  store: CollectorStore;
  browser: BrowserProvider;
  logger: CollectorLogger;
  platforms: readonly PlatformName[];
  pollIntervalMs: number;
  /** 신규 확인(CHECK_NEW) 자동 생성 주기. 0 이면 비활성 */
  scheduleNewMs: number;
  signal: AbortSignal;
}

/**
 * 오래 실행되는 Collector 프로세스.
 * Supabase crawl_jobs 를 polling 해서 PENDING 작업을 하나씩(동시성 1) 처리한다.
 */
export class CollectorWorker {
  private readonly registry: AdapterRegistry;
  private readonly limiters = new Map<PlatformName, AdaptiveRateLimiter>();
  private lastScheduledAt = 0;

  constructor(private readonly o: WorkerOptions) {
    this.registry = new AdapterRegistry(o.browser, o.logger);
  }

  async start(): Promise<void> {
    const { store, logger, platforms } = this.o;
    // 단일 워커 전제: 이전 프로세스가 남긴 RUNNING 작업은 checkpoint 를 유지한 채 다시 대기열로
    const requeued = await store.requeueStaleRunningJobs(new Date());
    for (const j of requeued) logger.info("REQUEUE_INTERRUPTED", { job: j.id, platform: j.platform, type: j.job_type }, true);
    for (const p of platforms) {
      await store.updateCollectorStatus(p, { status: "IDLE", worker_id: WORKER_ID, heartbeat_at: new Date().toISOString() });
    }
    logger.info("WORKER_START", { worker: WORKER_ID, platforms: platforms.join(","), pollMs: this.o.pollIntervalMs }, true);

    while (!this.o.signal.aborted) {
      try {
        await this.maybeScheduleCheckNew();
        const job = await store.claimNextPendingJob(WORKER_ID, platforms);
        if (job) {
          await this.runJob(job);
          continue;
        }
        await this.heartbeat();
      } catch (e) {
        logger.error("WORKER_LOOP_ERROR", { message: errorMessage(e) });
      }
      await sleep(this.o.pollIntervalMs, this.o.signal).catch(() => {});
    }

    for (const p of platforms) {
      await store.updateCollectorStatus(p, { status: "OFFLINE", heartbeat_at: new Date().toISOString() }).catch(() => {});
    }
    logger.info("WORKER_STOP", { worker: WORKER_ID }, true);
  }

  getAdapter(platform: PlatformName) {
    return this.registry.get(platform);
  }

  async runJob(job: CrawlJobRow): Promise<JobOutcome> {
    const adapter = await this.registry.get(job.platform);
    let limiter = this.limiters.get(job.platform);
    if (!limiter) {
      limiter = new AdaptiveRateLimiter(rateLimiterOptionsFromEnv());
      this.limiters.set(job.platform, limiter);
    }
    const runner = new JobRunner({
      store: this.o.store,
      adapter,
      logger: this.o.logger,
      workerId: WORKER_ID,
      rateLimiter: limiter,
      signal: this.o.signal,
    });
    return runner.run(job);
  }

  private async heartbeat() {
    const now = new Date().toISOString();
    for (const p of this.o.platforms) {
      await this.o.store.updateCollectorStatus(p, { worker_id: WORKER_ID, heartbeat_at: now });
    }
  }

  private async maybeScheduleCheckNew() {
    if (!this.o.scheduleNewMs) return;
    if (Date.now() - this.lastScheduledAt < this.o.scheduleNewMs) return;
    this.lastScheduledAt = Date.now();
    for (const platform of this.o.platforms) {
      // 진행 중/대기 중인 작업이 있으면(백필 포함) 신규 확인을 쌓지 않는다
      if (await this.o.store.hasActiveJob(platform)) continue;
      const job = await this.o.store.createJob({ platform, job_type: "CHECK_NEW", requested_by: "scheduler" });
      this.o.logger.info("SCHEDULED_CHECK_NEW", { platform, job: job.id });
    }
  }
}

export function rateLimiterOptionsFromEnv() {
  const min = Number(process.env.COLLECTOR_MIN_DELAY_MS);
  const max = Number(process.env.COLLECTOR_MAX_DELAY_MS);
  return {
    minDelayMs: Number.isFinite(min) && min > 0 ? min : undefined,
    maxDelayMs: Number.isFinite(max) && max > 0 ? max : undefined,
  };
}
