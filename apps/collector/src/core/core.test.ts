import { describe, expect, it } from "vitest";
import {
  CrawlError,
  LoginExpiredError,
  LoginRequiredError,
  emptyNormalizedProject,
  type FreelancePlatformAdapter,
  type LoginCheckResult,
  type ProjectListItem,
  type RawProjectDetail,
} from "@fr/shared";
import { MemoryCollectorStore } from "@fr/db";
import { AdaptiveRateLimiter } from "./rate-limiter";
import { RetryExhaustedError, withRetry } from "./retry";
import { evaluatePageAgainstCutoff, pageEntirelyBeforeCutoff } from "./cutoff";
import { JobRunner } from "./job-runner";
import { CollectorLogger } from "./logger";

const noSleep = async () => {};
const CUTOFF = "2025-10-02T00:00:00+09:00";

describe("withRetry", () => {
  it("10s/30s/90s 로 최대 3회 재시도 후 RetryExhaustedError", async () => {
    const waits: number[] = [];
    let calls = 0;
    await expect(
      withRetry(
        async () => {
          calls++;
          throw new CrawlError("TIMEOUT", "timeout");
        },
        { sleep: async (ms) => void waits.push(ms) },
      ),
    ).rejects.toBeInstanceOf(RetryExhaustedError);
    expect(calls).toBe(4);
    expect(waits).toEqual([10_000, 30_000, 90_000]);
  });

  it("중간에 성공하면 결과 반환", async () => {
    let calls = 0;
    const v = await withRetry(
      async () => {
        if (++calls < 3) throw new CrawlError("NETWORK", "ECONNRESET");
        return "ok";
      },
      { sleep: noSleep },
    );
    expect(v).toBe("ok");
    expect(calls).toBe(3);
  });

  it("로그인 만료는 재시도하지 않고 즉시 전달", async () => {
    let calls = 0;
    await expect(
      withRetry(
        async () => {
          calls++;
          throw new LoginExpiredError();
        },
        { sleep: noSleep },
      ),
    ).rejects.toBeInstanceOf(LoginExpiredError);
    expect(calls).toBe(1);
  });
});

describe("AdaptiveRateLimiter", () => {
  it("기본 지연은 1.5~3초", () => {
    const lo = new AdaptiveRateLimiter({ random: () => 0 });
    const hi = new AdaptiveRateLimiter({ random: () => 1 });
    expect(lo.nextDelayMs()).toBe(1500);
    expect(hi.nextDelayMs()).toBe(3000);
  });

  it("429/403/timeout/network 에서 감속, 연속 성공 시 회복", () => {
    const rl = new AdaptiveRateLimiter({ random: () => 0, recoverAfter: 2 });
    rl.onError(new CrawlError("RATE_LIMITED", "429"));
    expect(rl.currentMultiplier).toBe(2);
    rl.onError(new CrawlError("FORBIDDEN", "403"));
    expect(rl.currentMultiplier).toBe(4);
    rl.onError(new CrawlError("PARSE", "bad html"));
    expect(rl.currentMultiplier).toBe(4);
    rl.onSuccess(100);
    rl.onSuccess(100);
    expect(rl.currentMultiplier).toBe(2);
    rl.onSuccess(60_000); // 느린 응답 → 감속
    expect(rl.currentMultiplier).toBe(4);
  });
});

describe("cutoff", () => {
  const cutoff = new Date(CUTOFF);
  const item = (id: string, date: string | null, pinned = false): ProjectListItem => ({
    externalId: id,
    url: `https://x/${id}`,
    registeredAt: date ? new Date(date) : null,
    pinned,
  });

  it("cutoff 이전 항목은 제외, 정렬 항목이 모두 이전이면 종료", () => {
    const d = evaluatePageAgainstCutoff(
      [item("p", "2026-09-01T00:00:00Z", true), item("a", "2025-09-30T00:00:00Z"), item("b", "2025-09-01T00:00:00Z")],
      cutoff,
    );
    expect(d.eligible.map((i) => i.externalId)).toEqual(["p"]);
    expect(d.reachedCutoff).toBe(true);
  });

  it("경계: 2025-10-02 00:00 KST 등록은 포함", () => {
    const d = evaluatePageAgainstCutoff([item("a", "2025-10-02T00:00:00+09:00"), item("b", "2025-10-01T23:59:59+09:00")], cutoff);
    expect(d.eligible.map((i) => i.externalId)).toEqual(["a"]);
    expect(d.reachedCutoff).toBe(false);
  });

  it("날짜를 모르는 항목이 있으면 종료하지 않는다", () => {
    expect(pageEntirelyBeforeCutoff([{ registeredAt: new Date("2025-01-01") }, { registeredAt: null }], cutoff)).toBe(false);
    expect(pageEntirelyBeforeCutoff([{ registeredAt: new Date("2025-01-01") }], cutoff)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// JobRunner (fake adapter)
// ---------------------------------------------------------------------------

interface FakeProject {
  id: string;
  date: string;
}

class FakeAdapter implements FreelancePlatformAdapter {
  readonly platform = "wishket" as const;
  readonly displayName = "Fake";
  loginState: LoginCheckResult = { state: "LOGGED_IN" };
  loginWorks = true;
  detailCalls: string[] = [];
  listCalls: number[] = [];
  failDetail = new Map<string, () => Error>();
  expireOnceAt: string | null = null;
  /** 이 상세 호출 횟수 이후 abort (중단 시뮬레이션) */
  onDetail?: (id: string) => void;

  constructor(
    private readonly pages: FakeProject[][],
    private readonly listHasDates = true,
  ) {}

  async checkLogin() {
    return this.loginState;
  }
  async login() {
    if (this.loginWorks) this.loginState = { state: "LOGGED_IN" };
    return this.loginWorks
      ? { ok: true, state: "LOGGED_IN" as const }
      : { ok: false, state: "LOGIN_REQUIRED" as const, detail: "captcha" };
  }
  async getProjectList({ page }: { page: number }) {
    this.listCalls.push(page);
    const items = (this.pages[page - 1] ?? []).map((p) => ({
      externalId: p.id,
      url: `https://fake/${p.id}`,
      registeredAt: this.listHasDates ? new Date(p.date) : null,
    }));
    return { page, items, hasNextPage: page < this.pages.length };
  }
  async getProjectDetail(item: ProjectListItem): Promise<RawProjectDetail> {
    this.detailCalls.push(item.externalId);
    this.onDetail?.(item.externalId);
    if (this.expireOnceAt === item.externalId) {
      this.expireOnceAt = null;
      throw new LoginExpiredError();
    }
    const f = this.failDetail.get(item.externalId);
    if (f) throw f();
    const date = this.pages.flat().find((p) => p.id === item.externalId)!.date;
    return { externalId: item.externalId, url: item.url, payload: { id: item.externalId, date }, fetchedAt: new Date() };
  }
  async normalizeProject(raw: RawProjectDetail) {
    const p = emptyNormalizedProject("wishket", raw.externalId, raw.url);
    p.title = `project ${raw.externalId}`;
    p.registeredAt = new Date((raw.payload as { date: string }).date);
    p.rawPayload = raw.payload;
    return p;
  }
}

function makePages(perPage: number, dates: string[]): FakeProject[][] {
  const all = dates.map((date, i) => ({ id: String(1000 - i), date }));
  const pages: FakeProject[][] = [];
  for (let i = 0; i < all.length; i += perPage) pages.push(all.slice(i, i + perPage));
  return pages;
}

const quietLogger = new CollectorLogger({}, null, "error");

function runner(store: MemoryCollectorStore, adapter: FakeAdapter, signal?: AbortSignal) {
  return new JobRunner({
    store,
    adapter,
    logger: quietLogger,
    workerId: "test",
    rateLimiter: new AdaptiveRateLimiter({ sleep: noSleep }),
    retryDelaysMs: [1, 1, 1],
    sleep: noSleep,
    signal,
  });
}

async function claim(store: MemoryCollectorStore, jobType: "BACKFILL" | "CHECK_NEW" | "RESUME", params = {}) {
  await store.createJob({ platform: "wishket", job_type: jobType, params: { cutoff: CUTOFF, ...params } });
  return (await store.claimNextPendingJob("test", ["wishket"]))!;
}

describe("JobRunner BACKFILL", () => {
  const dates = [
    "2026-09-30T00:00:00Z",
    "2026-06-01T00:00:00Z",
    "2026-01-01T00:00:00Z",
    "2025-12-01T00:00:00Z",
    "2025-10-05T00:00:00Z",
    "2025-09-20T00:00:00Z", // cutoff 이전
    "2025-09-10T00:00:00Z",
    "2025-08-01T00:00:00Z",
  ];

  it("최신→과거로 수집하고 cutoff 에서 종료", async () => {
    const store = new MemoryCollectorStore();
    const adapter = new FakeAdapter(makePages(3, dates));
    const out = await runner(store, adapter).run(await claim(store, "BACKFILL"));
    expect(out.status).toBe("COMPLETED");
    expect(store.projects.size).toBe(5);
    // page 2 에 cutoff 경계, page 3 이 전부 cutoff 이전 → 종료 (보수적으로 한 페이지 더 확인)
    expect(adapter.listCalls).toEqual([1, 2, 3]);
    expect(adapter.detailCalls).not.toContain("995");
  });

  it("목록에 날짜가 없으면 상세 등록일로 cutoff 판정 (저장하지 않음)", async () => {
    const store = new MemoryCollectorStore();
    const adapter = new FakeAdapter(makePages(3, dates), false);
    const out = await runner(store, adapter).run(await claim(store, "BACKFILL"));
    expect(out.status).toBe("COMPLETED");
    expect(store.projects.size).toBe(5);
    expect(adapter.listCalls).toEqual([1, 2, 3]); // page 3 이 전부 cutoff 이전 → 종료
  });

  it("한 프로젝트 실패는 crawl_errors 에 기록하고 계속 진행", async () => {
    const store = new MemoryCollectorStore();
    const adapter = new FakeAdapter(makePages(3, dates));
    adapter.failDetail.set("999", () => new CrawlError("TIMEOUT", "timeout"));
    const out = await runner(store, adapter).run(await claim(store, "BACKFILL"));
    expect(out.status).toBe("COMPLETED");
    expect(out.counters.failure).toBe(1);
    expect(store.projects.size).toBe(4);
    expect(store.errors).toHaveLength(1);
    expect(store.errors[0]).toMatchObject({ external_project_id: "999", error_type: "TIMEOUT", retry_count: 3 });
    // 1회 + 재시도 3회
    expect(adapter.detailCalls.filter((id) => id === "999")).toHaveLength(4);
  });

  it("중단 후 checkpoint 에서 재개 (처음부터 다시 수집하지 않음)", async () => {
    const store = new MemoryCollectorStore();
    const adapter = new FakeAdapter(makePages(2, dates));
    const ac = new AbortController();
    adapter.onDetail = (id) => {
      if (id === "998") ac.abort(); // page 2 처리 중 종료
    };
    const job = await claim(store, "BACKFILL");
    const first = await runner(store, adapter, ac.signal).run(job);
    expect(first.status).toBe("PAUSED");
    const cp = store.checkpoints.get(job.id)!;
    expect(cp.last_page).toBe(1);
    expect(store.jobs.get(job.id)!.status).toBe("PAUSED");

    adapter.onDetail = undefined;
    adapter.detailCalls = [];
    adapter.listCalls = [];
    const resume = await claim(store, "RESUME");
    const second = await runner(store, adapter).run(resume);
    expect(second.status).toBe("COMPLETED");
    expect(adapter.listCalls[0]).toBe(2); // page 2 부터 재개
    expect(adapter.detailCalls).not.toContain("1000");
    expect(adapter.detailCalls).not.toContain("998"); // 이번 job 에서 이미 저장된 항목은 건너뜀
    expect(store.projects.size).toBe(5);
    expect(store.jobs.get(job.id)!.status).toBe("COMPLETED");
    expect(store.jobs.get(resume.id)!.status).toBe("COMPLETED");
  });

  it("dashboard 일시정지 요청을 반영", async () => {
    const store = new MemoryCollectorStore();
    const adapter = new FakeAdapter(makePages(3, dates));
    const job = await claim(store, "BACKFILL");
    adapter.onDetail = (id) => {
      if (id === "999") void store.updateJob(job.id, { requested_action: "PAUSE" });
    };
    const out = await runner(store, adapter).run(job);
    expect(out.status).toBe("PAUSED");
    expect(store.statuses.get("wishket")?.status).toBe("PAUSED");
  });

  it("max_projects 로 소량 수집", async () => {
    const store = new MemoryCollectorStore();
    const adapter = new FakeAdapter(makePages(3, dates));
    const out = await runner(store, adapter).run(await claim(store, "BACKFILL", { max_projects: 2 }));
    expect(out.status).toBe("COMPLETED");
    expect(store.projects.size).toBe(2);
  });
});

describe("JobRunner login handling", () => {
  const dates = ["2026-09-30T00:00:00Z", "2026-09-29T00:00:00Z", "2025-01-01T00:00:00Z"];

  it("세션 만료 → login() → 실패했던 프로젝트 재시도", async () => {
    const store = new MemoryCollectorStore();
    const adapter = new FakeAdapter(makePages(5, dates));
    adapter.expireOnceAt = "999";
    const out = await runner(store, adapter).run(await claim(store, "BACKFILL"));
    expect(out.status).toBe("COMPLETED");
    expect(store.projects.size).toBe(2);
    expect(adapter.detailCalls.filter((id) => id === "999")).toHaveLength(2);
  });

  it("CAPTCHA/OTP → LOGIN_REQUIRED 로 전환하고 중단", async () => {
    const store = new MemoryCollectorStore();
    const adapter = new FakeAdapter(makePages(5, dates));
    adapter.failDetail.set("999", () => new LoginRequiredError("otp required"));
    const job = await claim(store, "BACKFILL");
    const out = await runner(store, adapter).run(job);
    expect(out.status).toBe("LOGIN_REQUIRED");
    expect(store.jobs.get(job.id)!.status).toBe("LOGIN_REQUIRED");
    expect(store.statuses.get("wishket")).toMatchObject({ status: "LOGIN_REQUIRED", login_state: "LOGIN_REQUIRED" });
  });

  it("시작 시 로그아웃 상태이고 자동 로그인 실패 → LOGIN_REQUIRED", async () => {
    const store = new MemoryCollectorStore();
    const adapter = new FakeAdapter(makePages(5, dates));
    adapter.loginState = { state: "LOGGED_OUT" };
    adapter.loginWorks = false;
    const out = await runner(store, adapter).run(await claim(store, "BACKFILL"));
    expect(out.status).toBe("LOGIN_REQUIRED");
    expect(adapter.listCalls).toEqual([]);
  });
});

describe("JobRunner CHECK_NEW", () => {
  it("기존 프로젝트를 연속으로 만나면 종료하고 신규만 저장", async () => {
    const dates = Array.from({ length: 12 }, (_, i) => new Date(Date.UTC(2026, 8, 30 - i)).toISOString());
    const store = new MemoryCollectorStore();
    const adapter = new FakeAdapter(makePages(4, dates));
    // 기존 수집분: 1000-3 이후 전부
    for (const p of makePages(4, dates).flat().slice(3)) {
      await store.upsertProject({ ...emptyNormalizedProject("wishket", p.id, "u"), registeredAt: new Date(p.date) }, new Date());
    }
    const before = store.projects.size;
    const out = await runner(store, adapter).run(await claim(store, "CHECK_NEW", { known_streak_stop: 3 }));
    expect(out.status).toBe("COMPLETED");
    expect(store.projects.size - before).toBe(3);
    expect(adapter.listCalls).toEqual([1, 2]);
    expect(adapter.detailCalls).toEqual(["1000", "999", "998"]);
  });
});
