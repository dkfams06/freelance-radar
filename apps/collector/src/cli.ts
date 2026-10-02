import { parseArgs } from "node:util";
import { PLATFORMS, errorMessage, isPlatformName, type JobType, type PlatformName } from "@fr/shared";
import { createServiceClient, SupabaseCollectorStore, type CollectorStore, type JobParams } from "@fr/db";
import { createBrowserProvider } from "./browser";
import { CollectorLogger } from "./core/logger";
import { CollectorWorker, WORKER_ID } from "./worker";

const USAGE = `
freelance-radar collector

사용법:
  pnpm collector <wishket|freemoa|all> <command> [options]
  pnpm collector worker [--platforms wishket,freemoa] [--schedule-new 10]

commands:
  backfill      최신 → 과거 방향 백필 (기본 cutoff 2025-10-02 KST)
  new           신규 프로젝트 확인 (CHECK_NEW)
  resume        마지막으로 중단된 백필을 checkpoint 부터 재개
  login-check   로그인 상태만 확인

options:
  --max <n>          검증용: 성공 n 건 수집 후 종료 (예: --max 20)
  --cutoff <iso>     cutoff 시각 (기본 2025-10-02T00:00:00+09:00)
  --start-page <n>   백필 시작 페이지
  --max-pages <n>    최대 페이지 수
  --refresh-known    new: 이미 있는 프로젝트도 다시 조회해서 상태 변화 반영
  --queue            직접 실행하지 않고 crawl_jobs 에 등록만 (worker 가 처리)

worker options:
  --platforms <list>     처리할 플랫폼 (기본: 전체)
  --schedule-new <min>   신규 확인 자동 생성 주기(분). 0 이면 비활성 (기본 env COLLECTOR_SCHEDULE_NEW_MINUTES)
`;

const COMMAND_TO_JOB: Record<string, JobType> = {
  backfill: "BACKFILL",
  new: "CHECK_NEW",
  resume: "RESUME",
};

async function main() {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: {
      max: { type: "string" },
      cutoff: { type: "string" },
      "start-page": { type: "string" },
      "max-pages": { type: "string" },
      "refresh-known": { type: "boolean" },
      queue: { type: "boolean" },
      platforms: { type: "string" },
      "schedule-new": { type: "string" },
      help: { type: "boolean", short: "h" },
    },
  });

  const [target, command] = positionals;
  if (values.help || !target) {
    console.log(USAGE);
    return;
  }

  const logger = new CollectorLogger({});
  const abort = new AbortController();
  let interrupted = 0;
  const onSignal = () => {
    interrupted++;
    if (interrupted > 1) process.exit(130);
    logger.warn("SHUTDOWN_REQUESTED", { message: "현재 프로젝트 처리 후 checkpoint 저장하고 종료합니다 (한 번 더 누르면 강제 종료)" });
    abort.abort(new Error("shutdown"));
  };
  process.on("SIGINT", onSignal);
  process.on("SIGTERM", onSignal);

  const store: CollectorStore = new SupabaseCollectorStore(createServiceClient());
  const persistentLogger = new CollectorLogger({}, store);

  if (target === "worker") {
    const platforms = values.platforms ? parsePlatforms(values.platforms) : [...PLATFORMS];
    const scheduleMin = Number(values["schedule-new"] ?? process.env.COLLECTOR_SCHEDULE_NEW_MINUTES ?? 0);
    const browser = await createBrowserProvider(logger);
    try {
      await new CollectorWorker({
        store,
        browser,
        logger: persistentLogger,
        platforms,
        pollIntervalMs: Number(process.env.COLLECTOR_POLL_INTERVAL ?? 5000),
        scheduleNewMs: scheduleMin > 0 ? scheduleMin * 60_000 : 0,
        signal: abort.signal,
      }).start();
    } finally {
      await browser.close();
    }
    return;
  }

  const platforms = target === "all" ? [...PLATFORMS] : parsePlatforms(target);
  if (!command) throw new Error(`command 가 필요합니다.\n${USAGE}`);

  if (command === "login-check") {
    const browser = await createBrowserProvider(logger);
    try {
      const worker = new CollectorWorker({
        store,
        browser,
        logger: persistentLogger,
        platforms,
        pollIntervalMs: 0,
        scheduleNewMs: 0,
        signal: abort.signal,
      });
      for (const p of platforms) {
        const adapter = await worker.getAdapter(p);
        const state = await adapter.checkLogin();
        await store.updateCollectorStatus(p, { login_state: state.state, login_detail: state.detail ?? null });
        logger.child({ platform: p }).info(`LOGIN ${state.state}`, { message: state.detail });
      }
    } finally {
      await browser.close();
    }
    return;
  }

  const jobType = COMMAND_TO_JOB[command];
  if (!jobType) throw new Error(`알 수 없는 command: ${command}\n${USAGE}`);

  const params: JobParams = {};
  if (values.max) params.max_projects = positiveInt(values.max, "--max");
  if (values.cutoff) params.cutoff = new Date(values.cutoff).toISOString();
  if (values["start-page"]) params.start_page = positiveInt(values["start-page"], "--start-page");
  if (values["max-pages"]) params.max_pages = positiveInt(values["max-pages"], "--max-pages");
  if (values["refresh-known"]) params.refresh_known = true;

  const jobIds: Array<{ platform: PlatformName; id: string }> = [];
  for (const platform of platforms) {
    const job = await store.createJob({ platform, job_type: jobType, params, requested_by: "cli" });
    jobIds.push({ platform, id: job.id });
    logger.child({ platform }).info("JOB_CREATED", { job: job.id, type: jobType });
  }
  if (values.queue) return;

  // 직접 실행: 방금 만든 job 을 이 프로세스가 선점해서 순서대로 처리
  const browser = await createBrowserProvider(logger);
  try {
    const worker = new CollectorWorker({
      store,
      browser,
      logger: persistentLogger,
      platforms,
      pollIntervalMs: 0,
      scheduleNewMs: 0,
      signal: abort.signal,
    });
    let failed = false;
    for (const { platform, id } of jobIds) {
      if (abort.signal.aborted) break;
      const claimed = await store.getJob(id);
      if (!claimed || claimed.status !== "PENDING") {
        logger.child({ platform }).warn("JOB_ALREADY_TAKEN", { job: id, status: claimed?.status });
        continue;
      }
      await store.updateJob(id, { status: "RUNNING", worker_id: WORKER_ID, heartbeat_at: new Date().toISOString() });
      const outcome = await worker.runJob({ ...claimed, status: "RUNNING" });
      logger.child({ platform, jobType }).info(`RESULT ${outcome.status}`, { reason: outcome.reason, ...outcome.counters });
      if (outcome.status !== "COMPLETED") failed = true;
    }
    process.exitCode = failed ? 1 : 0;
  } finally {
    await browser.close();
  }
}

function parsePlatforms(value: string): PlatformName[] {
  const list = value.split(",").map((s) => s.trim().toLowerCase());
  for (const p of list) if (!isPlatformName(p)) throw new Error(`알 수 없는 플랫폼: ${p}`);
  return list as PlatformName[];
}

function positiveInt(value: string, flag: string): number {
  const n = Number.parseInt(value, 10);
  if (!Number.isFinite(n) || n <= 0) throw new Error(`${flag} 는 양의 정수여야 합니다`);
  return n;
}

main().catch((e) => {
  console.error(`[Collector] FATAL ${errorMessage(e)}`);
  if (process.env.COLLECTOR_LOG_LEVEL === "debug" && e instanceof Error) console.error(e.stack);
  process.exit(1);
});
