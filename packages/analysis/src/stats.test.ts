import { describe, expect, it } from "vitest";
import { approxTokens, budgetAmount, computeDistribution, estimateRun, quantile, renderDistribution, type StatsSourceRow } from "./index";

const row = (over: Partial<StatsSourceRow>): StatsSourceRow => ({
  project_id: "p",
  project_type: "website",
  engagement_type: "new_build",
  industry: "general",
  complexity_types: ["standard_crud"],
  reuse_level: "high",
  technology_assets: ["core_web"],
  vibe_coding_difficulty: 20,
  estimated_hours_min: 10,
  estimated_hours_max: 30,
  reusability_value: 60,
  learning_value: 30,
  market_value: 80,
  platform: "wishket",
  budget_min: 1_000_000,
  budget_max: 1_000_000,
  budget_type: "fixed",
  ...over,
});

describe("stats", () => {
  it("quantile interpolates and handles empty input", () => {
    expect(quantile([], 0.5)).toBeNull();
    expect(quantile([1, 2, 3, 4], 0.5)).toBe(2.5);
    expect(quantile([10, 20, 30, 40, 50], 0.25)).toBe(20);
  });

  it("uses the budget upper bound and ignores zero/missing", () => {
    expect(budgetAmount({ budget_min: 10_000, budget_max: 1_000_000 })).toBe(1_000_000);
    expect(budgetAmount({ budget_min: 500, budget_max: null })).toBe(500);
    expect(budgetAmount({ budget_min: null, budget_max: 0 })).toBeNull();
  });

  it("groups by project_type with shares, separate fixed/monthly budgets and averages", () => {
    const rows = [
      row({ budget_max: 1_000_000 }),
      row({ budget_max: 3_000_000, vibe_coding_difficulty: 40 }),
      row({ project_type: "ecommerce", engagement_type: "staffing", budget_type: "monthly", budget_max: 6_000_000, technology_assets: ["core_web", "payments", "payments"] }),
    ];
    const d = computeDistribution(rows);
    const web = d.by_project_type.find((g) => g.key === "website")!;
    expect(web.count).toBe(2);
    expect(web.share).toBeCloseTo(2 / 3);
    expect(web.fixed_budget).toMatchObject({ n: 2, mean: 2_000_000, median: 2_000_000, p25: 1_500_000, p75: 2_500_000 });
    expect(web.monthly_budget.n).toBe(0);
    expect(web.avg_vibe_coding_difficulty).toBe(30);
    expect(web.avg_estimated_hours).toBe(20);
    const ecom = d.by_project_type.find((g) => g.key === "ecommerce")!;
    expect(ecom.fixed_budget.n).toBe(0);
    expect(ecom.monthly_budget.median).toBe(6_000_000);
    expect(d.by_engagement_type[0]).toMatchObject({ key: "new_build", count: 2 });
    // 배열 필드는 프로젝트당 1회만 집계
    expect(d.technology_assets).toEqual([
      { key: "core_web", count: 3, share: 1 },
      { key: "payments", count: 1, share: 1 / 3 },
    ]);
    const md = renderDistribution(d);
    expect(md).toContain("| website | 2 | 66.7% | 2 |");
    expect(md).toContain("| payments | 1 | 33.3% |");
  });
});

describe("estimate", () => {
  it("approximates tokens and computes per-model costs", () => {
    expect(approxTokens("가나다")).toBe(3);
    expect(approxTokens("abcdefg")).toBe(2);
    const e = estimateRun({
      projectCount: 1000,
      systemTokens: 4000,
      totalInputTokens: 1_500_000,
      outputTokensPerItem: { "claude-sonnet-5-5": 2000 },
      batchChunkSize: 2000,
    });
    expect(e.batch_submissions).toBe(1);
    const s = e.models.find((m) => m.model === "claude-sonnet-5-5")!;
    expect(s.input_tokens).toBe(5_500_000);
    expect(s.output_tokens).toBe(2_000_000);
    expect(s.sync_usd).toBeCloseTo(5.5 * 2 + 2 * 10);
    expect(s.batch_usd).toBeCloseTo(s.sync_usd / 2);
    expect(s.sync_cached_usd).toBeLessThan(s.sync_usd);
  });
});
