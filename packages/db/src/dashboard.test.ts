import { describe, expect, it } from "vitest";
import { computeBackfillProgress } from "./dashboard";

describe("computeBackfillProgress", () => {
  const job = { status: "RUNNING" as const, params: {}, created_at: "2026-10-02T00:00:00Z" };
  const base = { cutoff_at: "2025-10-02T00:00:00Z", started_at: "2026-10-02T00:00:00Z" };
  const now = new Date("2026-10-03T00:00:00Z");

  it("시작 직후는 0", () => {
    expect(computeBackfillProgress(job, { ...base, oldest_registered_at: null }, now)).toBe(0);
  });
  it("가장 오래된 등록일이 cutoff 와 시작 시점의 중간이면 약 50%", () => {
    const p = computeBackfillProgress(job, { ...base, oldest_registered_at: "2026-04-02T12:00:00Z" }, now)!;
    expect(p).toBeGreaterThan(0.49);
    expect(p).toBeLessThan(0.51);
  });
  it("--max 로 제한된 완료 작업은 100% 가 아니다", () => {
    const p = computeBackfillProgress(
      { ...job, status: "COMPLETED", params: { max_projects: 20 } },
      { ...base, oldest_registered_at: "2026-09-30T00:00:00Z" },
      now,
    )!;
    expect(p).toBeLessThan(0.05);
  });
  it("완료된 작업은 100%, cutoff 을 넘어도 100% 로 고정", () => {
    expect(computeBackfillProgress({ ...job, status: "COMPLETED" }, null, now)).toBe(1);
    expect(computeBackfillProgress(job, { ...base, oldest_registered_at: "2025-01-01T00:00:00Z" }, now)).toBe(1);
  });
});
