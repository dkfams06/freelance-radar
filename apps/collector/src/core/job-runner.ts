import {
  CrawlError,
  DEFAULT_BACKFILL_CUTOFF,
  LoginExpiredError,
  LoginRequiredError,
  errorMessage,
  toCrawlError,
  type FreelancePlatformAdapter,
  type JobStatus,
  type NormalizedProject,
  type ProjectListItem,
  type ProjectListResult,
} from "@fr/shared";
import type { CheckpointWrite, CollectorStore, CrawlJobRow, JobParams } from "@fr/db";
import { evaluatePageAgainstCutoff, isBeforeCutoff, pageEntirelyBeforeCutoff } from "./cutoff";
import type { CollectorLogger } from "./logger";
import { AdaptiveRateLimiter } from "./rate-limiter";
import { DEFAULT_RETRY_DELAYS_MS, RetryExhaustedError, withRetry } from "./retry";

export type JobOutcomeStatus = Extract<JobStatus, "COMPLETED" | "PAUSED" | "CANCELLED" | "FAILED" | "LOGIN_REQUIRED">;

export interface JobOutcome {
  status: JobOutcomeStatus;
  reason: string;
  counters: Counters;
}

interface Counters {
  processed: number;
  success: number;
  failure: number;
  skipped: number;
  inserted: number;
  updated: number;
  changed: number;
  lastPage: number;
}

export interface JobRunnerDeps {
  store: CollectorStore;
  adapter: FreelancePlatformAdapter;
  logger: CollectorLogger;
  workerId: string;
  rateLimiter?: AdaptiveRateLimiter;
  retryDelaysMs?: readonly number[];
  sleep?: (ms: number) => Promise<void>;
  now?: () => Date;
  /** 프로세스 종료 신호 → 현재 작업을 PAUSED 로 안전 중단 */
  signal?: AbortSignal;
}

/** 작업 중단 신호 (일시정지/취소/로그인 필요/실패) */
class StopJob extends Error {
  constructor(
    readonly status: JobOutcomeStatus,
    reason: string,
  ) {
    super(reason);
  }
}

type ItemResult =
  | { kind: "saved"; project: NormalizedProject; inserted: boolean; changed: boolean }
  | { kind: "before_cutoff"; project: NormalizedProject }
  | { kind: "failed"; error: CrawlError };

const TERMINAL: JobOutcomeStatus[] = ["COMPLETED", "CANCELLED"];

/**
 * 플랫폼과 무관한 작업 실행기. 플랫폼별 동작은 전부 adapter 에 위임한다.
 */
export class JobRunner {
  private readonly store: CollectorStore;
  private readonly adapter: FreelancePlatformAdapter;
  private log: CollectorLogger;
  private readonly limiter: AdaptiveRateLimiter;
  private readonly retryDelays: readonly number[];
  private readonly sleep?: (ms: number) => Promise<void>;
  private readonly now: () => Date;

  private job!: CrawlJobRow;
  private checkpoint!: CheckpointWrite;
  private counters!: Counters;

  constructor(private readonly deps: JobRunnerDeps) {
    this.store = deps.store;
    this.adapter = deps.adapter;
    this.log = deps.logger;
    this.limiter = deps.rateLimiter ?? new AdaptiveRateLimiter({ sleep: deps.sleep });
    this.retryDelays = deps.retryDelaysMs ?? DEFAULT_RETRY_DELAYS_MS;
    this.sleep = deps.sleep;
    this.now = deps.now ?? (() => new Date());
  }

  get platform() {
    return this.adapter.platform;
  }

  /** 이미 RUNNING 으로 선점된 job 을 실행한다. */
  async run(claimed: CrawlJobRow): Promise<JobOutcome> {
    if (claimed.platform !== this.platform) throw new Error(`adapter/job platform mismatch`);

    // RESUME: 대상 BACKFILL job 을 이어서 실행하고, RESUME job 은 결과를 따라간다.
    let job = claimed;
    if (claimed.job_type === "RESUME") {
      const target = claimed.params.target_job_id
        ? await this.store.getJob(claimed.params.target_job_id)
        : await this.store.findResumableBackfill(this.platform);
      if (!target || target.job_type !== "BACKFILL" || TERMINAL.includes(target.status as JobOutcomeStatus)) {
        const outcome: JobOutcome = { status: "COMPLETED", reason: "nothing to resume", counters: emptyCounters() };
        await this.store.updateJob(claimed.id, {
          status: "COMPLETED",
          finished_at: this.now().toISOString(),
          result: { message: outcome.reason },
        });
        return outcome;
      }
      await this.store.updateJob(target.id, {
        status: "RUNNING",
        worker_id: this.deps.workerId,
        requested_action: null,
        heartbeat_at: this.now().toISOString(),
      });
      job = { ...target, status: "RUNNING" };
    }

    const outcome = await this.execute(job);

    if (job.id !== claimed.id) {
      await this.store.updateJob(claimed.id, {
        status: outcome.status,
        finished_at: this.now().toISOString(),
        result: { resumed_job_id: job.id, ...outcome.counters, reason: outcome.reason },
      });
    }
    return outcome;
  }

  private async execute(job: CrawlJobRow): Promise<JobOutcome> {
    this.job = job;
    this.log = this.deps.logger.child({ platform: this.platform, jobType: job.job_type, jobId: job.id });
    const startedAt = job.started_at ?? this.now().toISOString();
    if (!job.started_at) {
      await this.store.updateJob(job.id, { started_at: startedAt });
      this.job = { ...job, started_at: startedAt };
    }

    const existing = await this.store.getCheckpoint(job.id);
    this.checkpoint = existing
      ? { ...existing, status: "RUNNING" }
      : {
          platform: this.platform,
          job_id: job.id,
          last_page: 0,
          current_page: null,
          last_project_id: null,
          processed_count: 0,
          success_count: 0,
          failure_count: 0,
          skipped_count: 0,
          new_count: 0,
          oldest_registered_at: null,
          cutoff_at: job.job_type === "BACKFILL" ? this.cutoff(job.params).toISOString() : null,
          status: "RUNNING",
          started_at: startedAt,
        };
    this.counters = {
      ...emptyCounters(),
      processed: this.checkpoint.processed_count,
      success: this.checkpoint.success_count,
      failure: this.checkpoint.failure_count,
      skipped: this.checkpoint.skipped_count,
      inserted: this.checkpoint.new_count,
      lastPage: this.checkpoint.last_page,
    };

    this.log.info("JOB_START", { resumeFromPage: existing ? existing.last_page + 1 : null }, true);
    await this.store.updateCollectorStatus(this.platform, {
      status: "RUNNING",
      current_job_id: job.id,
      current_job_type: job.job_type,
      current_page: this.checkpoint.current_page,
      processed_count: this.counters.processed,
      success_count: this.counters.success,
      failure_count: this.counters.failure,
      worker_id: this.deps.workerId,
      heartbeat_at: this.now().toISOString(),
    });

    let outcome: JobOutcome;
    try {
      await this.ensureLoggedIn();
      const reason = job.job_type === "CHECK_NEW" ? await this.runCheckNew() : await this.runBackfill();
      outcome = { status: "COMPLETED", reason, counters: { ...this.counters } };
    } catch (e) {
      if (e instanceof StopJob) {
        outcome = { status: e.status, reason: e.message, counters: { ...this.counters } };
      } else if (e instanceof LoginRequiredError) {
        outcome = { status: "LOGIN_REQUIRED", reason: e.message, counters: { ...this.counters } };
      } else {
        outcome = { status: "FAILED", reason: errorMessage(e), counters: { ...this.counters } };
        this.log.error("JOB_ERROR", { message: errorMessage(e) });
      }
    }

    await this.finish(outcome);
    return outcome;
  }

  // ---------------------------------------------------------------------------
  // BACKFILL: 최신 페이지 → 과거 방향. cutoff 이전에 도달하면 종료.
  // ---------------------------------------------------------------------------
  private async runBackfill(): Promise<string> {
    const params = this.job.params;
    const cutoff = this.cutoff(params);
    const seenSince = new Date(this.job.started_at!);
    let page =
      this.checkpoint.last_page > 0 ? this.checkpoint.last_page + 1 : Math.max(1, params.start_page ?? 1);

    for (;;) {
      if (params.max_pages && page > (params.start_page ?? 1) + params.max_pages - 1) return "max_pages reached";
      await this.checkControl();
      await this.setCurrentPage(page);

      const list = await this.fetchList(page);
      if (list.items.length === 0) return `empty page ${page}: end of list`;

      const decision = evaluatePageAgainstCutoff(list.items, cutoff);
      const alreadySeen = await this.store.findProjectIdsSeenSince(
        this.platform,
        decision.eligible.map((i) => i.externalId),
        seenSince,
      );
      this.log.info("PAGE", {
        page,
        items: list.items.length,
        eligible: decision.eligible.length,
        alreadySeen: alreadySeen.size,
      });

      const dates: Array<{ pinned?: boolean; registeredAt?: Date | null }> = [];
      for (const item of list.items) {
        if (isBeforeCutoff(item.registeredAt, cutoff)) {
          dates.push(item);
          await this.countSkipped();
          continue;
        }
        if (alreadySeen.has(item.externalId)) {
          dates.push(item);
          await this.countSkipped();
          continue;
        }
        await this.checkControl();
        const result = await this.processItem(item, page, cutoff);
        dates.push({ pinned: item.pinned, registeredAt: result.kind === "failed" ? item.registeredAt : result.project.registeredAt });
        if (params.max_projects && this.counters.success >= params.max_projects) {
          await this.completePage(page);
          return `max_projects=${params.max_projects} reached`;
        }
      }

      await this.completePage(page);
      if (decision.reachedCutoff || pageEntirelyBeforeCutoff(dates, cutoff)) return `cutoff ${cutoff.toISOString()} reached at page ${page}`;
      if (!list.hasNextPage) return `last page ${page}`;
      page++;
    }
  }

  // ---------------------------------------------------------------------------
  // CHECK_NEW: 최신 목록 일부만 확인. 이미 있는 프로젝트가 연속으로 나오면 종료.
  // ---------------------------------------------------------------------------
  private async runCheckNew(): Promise<string> {
    const params = this.job.params;
    const maxPages = params.max_pages ?? 3;
    const stopAfterKnown = params.known_streak_stop ?? 5;
    let knownStreak = 0;

    for (let page = 1; page <= maxPages; page++) {
      await this.checkControl();
      await this.setCurrentPage(page);
      const list = await this.fetchList(page);
      if (list.items.length === 0) return `empty page ${page}`;
      const existing = await this.store.findExistingProjectIds(
        this.platform,
        list.items.map((i) => i.externalId),
      );
      this.log.info("PAGE", { page, items: list.items.length, known: existing.size });

      for (const item of list.items) {
        if (existing.has(item.externalId)) {
          if (!item.pinned) knownStreak++;
          if (params.refresh_known) {
            await this.checkControl();
            await this.processItem(item, page, null);
          } else {
            await this.countSkipped();
          }
          if (knownStreak >= stopAfterKnown) {
            await this.completePage(page);
            return `reached ${knownStreak} known projects`;
          }
          continue;
        }
        knownStreak = 0;
        await this.checkControl();
        await this.processItem(item, page, null);
      }
      await this.completePage(page);
      if (!list.hasNextPage) return `last page ${page}`;
    }
    return `max_pages=${maxPages} checked`;
  }

  // ---------------------------------------------------------------------------
  // 단일 프로젝트 처리: 상세 → 정규화 → 저장. 실패해도 작업은 계속.
  // ---------------------------------------------------------------------------
  private async processItem(item: ProjectListItem, page: number, cutoff: Date | null): Promise<ItemResult> {
    let attempts = 0;
    let result: ItemResult;
    try {
      const project = await this.withLogin(() =>
        withRetry(
          async () => {
            attempts++;
            await this.limiter.wait();
            const t0 = Date.now();
            const raw = await this.adapter.getProjectDetail(item);
            const normalized = await this.adapter.normalizeProject(raw);
            this.limiter.onSuccess(Date.now() - t0);
            return normalized;
          },
          {
            delaysMs: this.retryDelays,
            sleep: this.sleep,
            onFailure: (err, attempt, next) => {
              this.limiter.onError(err);
              this.log.warn("RETRY", {
                page,
                project: item.externalId,
                type: err.type,
                attempt: attempt + 1,
                nextDelayMs: next,
                message: err.message,
              });
            },
          },
        ),
      );

      if (cutoff && isBeforeCutoff(project.registeredAt, cutoff)) {
        result = { kind: "before_cutoff", project };
      } else {
        const saved = await this.store.upsertProject(project, this.now());
        await this.store.resolveErrors(this.platform, item.externalId);
        result = { kind: "saved", project, inserted: saved.inserted, changed: saved.changed };
      }
    } catch (e) {
      if (e instanceof StopJob || e instanceof LoginRequiredError) throw e;
      const error = e instanceof RetryExhaustedError ? e.lastError : toCrawlError(e);
      result = { kind: "failed", error };
      await this.recordError(item, page, error, Math.max(0, attempts - 1));
    }

    await this.applyItemResult(item, page, result);
    return result;
  }

  private async applyItemResult(item: ProjectListItem, page: number, result: ItemResult) {
    const c = this.counters;
    const cp = this.checkpoint;
    const nowIso = this.now().toISOString();
    c.processed++;
    cp.last_project_id = item.externalId;

    if (result.kind === "saved") {
      c.success++;
      if (result.inserted) c.inserted++;
      else c.updated++;
      if (result.changed) c.changed++;
      const reg = result.project.registeredAt;
      if (reg && (!cp.oldest_registered_at || reg < new Date(cp.oldest_registered_at))) {
        cp.oldest_registered_at = reg.toISOString();
      }
      this.log.info(result.inserted ? "SUCCESS NEW" : result.changed ? "SUCCESS UPDATED" : "SUCCESS", {
        page,
        project: item.externalId,
      });
    } else if (result.kind === "before_cutoff") {
      c.skipped++;
      this.log.info("SKIP BEFORE_CUTOFF", { page, project: item.externalId });
    } else {
      c.failure++;
      this.log.warn("FAILED", { page, project: item.externalId, type: result.error.type });
    }

    await this.persistProgress({
      ...(result.kind === "saved" ? { last_success_at: nowIso } : {}),
      ...(result.kind === "failed"
        ? { last_error_at: nowIso, last_error_message: `${item.externalId}: ${result.error.message}`.slice(0, 1000) }
        : {}),
    });
  }

  private async fetchList(page: number): Promise<ProjectListResult> {
    try {
      return await this.withLogin(() =>
        withRetry(
          async () => {
            await this.limiter.wait();
            const t0 = Date.now();
            const list = await this.adapter.getProjectList({ page });
            this.limiter.onSuccess(Date.now() - t0);
            return list;
          },
          {
            delaysMs: this.retryDelays,
            sleep: this.sleep,
            onFailure: (err, attempt, next) => {
              this.limiter.onError(err);
              this.log.warn("LIST RETRY", { page, type: err.type, attempt: attempt + 1, nextDelayMs: next, message: err.message });
            },
          },
        ),
      );
    } catch (e) {
      if (e instanceof StopJob || e instanceof LoginRequiredError) throw e;
      const error = e instanceof RetryExhaustedError ? e.lastError : toCrawlError(e);
      await this.store.insertError({
        platform: this.platform,
        job_id: this.job.id,
        external_project_id: null,
        url: error.url,
        page,
        error_type: error.type,
        error_message: `list page ${page}: ${error.message}`,
        stack: error.stack ?? null,
        retry_count: this.retryDelays.length,
        details: null,
      });
      // 목록 페이지를 건너뛰면 데이터가 빠지므로 작업을 FAILED 로 멈추고 checkpoint 에서 재개하게 한다.
      throw new StopJob("FAILED", `list page ${page} failed: ${error.message}`);
    }
  }

  // ---------------------------------------------------------------------------
  // 로그인
  // ---------------------------------------------------------------------------
  private async ensureLoggedIn(): Promise<void> {
    const check = await this.adapter.checkLogin();
    if (check.state === "LOGGED_IN") {
      await this.store.updateCollectorStatus(this.platform, { login_state: "LOGGED_IN", login_detail: null });
      return;
    }
    if (check.state === "LOGIN_REQUIRED") await this.markLoginRequired(check.detail ?? "manual login required");
    this.log.info("LOGIN_CHECK", { state: check.state, message: check.detail }, true);
    await this.relogin(check.detail);
  }

  private async relogin(reason?: string): Promise<void> {
    this.log.warn("LOGIN_ATTEMPT", { message: reason }, true);
    const result = await this.adapter.login();
    if (result.ok && result.state === "LOGGED_IN") {
      await this.store.updateCollectorStatus(this.platform, { login_state: "LOGGED_IN", login_detail: null });
      this.log.info("LOGIN_OK", {}, true);
      return;
    }
    await this.markLoginRequired(result.detail ?? "automatic login failed");
  }

  private async markLoginRequired(detail: string): Promise<never> {
    await this.store.updateCollectorStatus(this.platform, {
      status: "LOGIN_REQUIRED",
      login_state: "LOGIN_REQUIRED",
      login_detail: detail,
    });
    this.log.error("LOGIN_REQUIRED", { message: detail });
    throw new LoginRequiredError(detail);
  }

  /** 세션 만료 → 로그인 → 같은 작업 1회 재시도. 그래도 만료면 LOGIN_REQUIRED. */
  private async withLogin<T>(fn: () => Promise<T>): Promise<T> {
    try {
      return await fn();
    } catch (e) {
      if (e instanceof LoginRequiredError) await this.markLoginRequired(e.message);
      if (!(e instanceof LoginExpiredError)) throw e;
      await this.relogin(e.message);
      try {
        return await fn();
      } catch (e2) {
        if (e2 instanceof LoginExpiredError || e2 instanceof LoginRequiredError) await this.markLoginRequired(e2.message);
        throw e2;
      }
    }
  }

  // ---------------------------------------------------------------------------
  // 진행상태 / 제어
  // ---------------------------------------------------------------------------
  private async checkControl(): Promise<void> {
    if (this.deps.signal?.aborted) throw new StopJob("PAUSED", "collector shutting down");
    const fresh = await this.store.getJob(this.job.id);
    if (fresh?.requested_action === "CANCEL" || fresh?.status === "CANCELLED") {
      throw new StopJob("CANCELLED", "cancelled by request");
    }
    if (fresh?.requested_action === "PAUSE" || fresh?.status === "PAUSED") {
      throw new StopJob("PAUSED", "paused by request");
    }
  }

  private async setCurrentPage(page: number) {
    this.checkpoint.current_page = page;
    await this.persistProgress({});
  }

  private async completePage(page: number) {
    this.checkpoint.last_page = page;
    this.counters.lastPage = page;
    await this.persistProgress({});
    this.log.info("PAGE_DONE", { page, success: this.counters.success, failure: this.counters.failure }, true);
  }

  private async countSkipped() {
    this.counters.skipped++;
    this.checkpoint.skipped_count = this.counters.skipped;
  }

  private async persistProgress(statusPatch: Record<string, unknown>) {
    const cp = this.checkpoint;
    const c = this.counters;
    cp.processed_count = c.processed;
    cp.success_count = c.success;
    cp.failure_count = c.failure;
    cp.skipped_count = c.skipped;
    cp.new_count = c.inserted;
    const nowIso = this.now().toISOString();
    await this.store.saveCheckpoint({ ...cp });
    await this.store.updateJob(this.job.id, { heartbeat_at: nowIso });
    await this.store.updateCollectorStatus(this.platform, {
      current_page: cp.current_page,
      processed_count: c.processed,
      success_count: c.success,
      failure_count: c.failure,
      heartbeat_at: nowIso,
      ...statusPatch,
    });
  }

  private async recordError(item: ProjectListItem, page: number, error: CrawlError, retryCount: number) {
    await this.store.insertError({
      platform: this.platform,
      job_id: this.job.id,
      external_project_id: item.externalId,
      url: error.url ?? item.url,
      page,
      error_type: error.type,
      error_message: error.message.slice(0, 2000),
      stack: error.stack?.slice(0, 4000) ?? null,
      retry_count: retryCount,
      details: error.httpStatus ? { httpStatus: error.httpStatus } : null,
    });
  }

  private async finish(outcome: JobOutcome) {
    const nowIso = this.now().toISOString();
    this.checkpoint.status = outcome.status;
    await this.store.saveCheckpoint({ ...this.checkpoint });
    await this.store.updateJob(this.job.id, {
      status: outcome.status,
      requested_action: null,
      heartbeat_at: nowIso,
      finished_at: TERMINAL.includes(outcome.status) ? nowIso : null,
      error_message: outcome.status === "COMPLETED" ? null : outcome.reason,
      result: { ...outcome.counters, reason: outcome.reason },
    });
    const statusMap = {
      COMPLETED: "IDLE",
      CANCELLED: "IDLE",
      PAUSED: "PAUSED",
      FAILED: "ERROR",
      LOGIN_REQUIRED: "LOGIN_REQUIRED",
    } as const;
    await this.store.updateCollectorStatus(this.platform, {
      status: statusMap[outcome.status],
      current_job_id: outcome.status === "COMPLETED" || outcome.status === "CANCELLED" ? null : this.job.id,
      heartbeat_at: nowIso,
      ...(outcome.status === "FAILED" ? { last_error_at: nowIso, last_error_message: outcome.reason.slice(0, 1000) } : {}),
    });
    const level = outcome.status === "COMPLETED" ? "info" : "warn";
    this.log[level](`JOB_${outcome.status}`, { message: outcome.reason, ...outcome.counters }, true);
  }

  private cutoff(params: JobParams): Date {
    return new Date(params.cutoff ?? process.env.COLLECTOR_BACKFILL_CUTOFF ?? DEFAULT_BACKFILL_CUTOFF);
  }
}

function emptyCounters(): Counters {
  return { processed: 0, success: 0, failure: 0, skipped: 0, inserted: 0, updated: 0, changed: 0, lastPage: 0 };
}
