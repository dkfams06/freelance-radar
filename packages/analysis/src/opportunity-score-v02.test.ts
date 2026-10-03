import { describe, expect, it } from "vitest";
import { buildOpportunityV02Report, buildStarterKitReport, type FeatureV01Json, type OpportunityV01Json } from "./opportunity-score-v02";

function opportunity(): OpportunityV01Json {
  return {
    schema: "opportunity-score/v0.1",
    analysis_version: "v3.3",
    modes: {
      exclude_outliers: {
        non_staffing: {
          types: [
            {
              key: "business_management",
              n: 37,
              confidence: "high",
              normalized: { frequency: 50, budget_per_hour: 50, ai_ease: 50, reusability: 50, learning: 50, market_value: 50 },
              scores: { frequency: 50, budget_per_hour: 50, ai_ease: 50, reusability: 50, learning: 50, market_value: 50, profit: 50, balanced: 50, technology_assets: 50 },
              rank: { balanced: 1 },
              avg_ai_ease: 60,
              avg_learning: 55,
            },
          ],
        },
      },
    },
  };
}

function features(): FeatureV01Json {
  return {
    feature_version: "f1",
    analysis_version: "v3.3",
    total: 37,
    types: [
      {
        project_type: "business_management",
        n: 37,
        low_sample: false,
        avg_feature_count: 4,
        ge_50: ["authentication", "admin_dashboard"],
        ge_70: ["authentication"],
        similarity: { mean: 0.4, median: 0.35, p75: 0.5, share_ge_70: 0.1 },
        bundles: [{ support: 20, share: 0.5, features: ["authentication", "admin_dashboard"] }],
        template: { core: ["authentication", "admin_dashboard"], optional: [], coverage: 0.5, core_fit_share: 0.8 },
      },
    ],
    cross_type: [
      { feature: "authentication", count: 30, share: 30 / 37, types_ge_40: 1, types: ["business_management"] },
      { feature: "admin_dashboard", count: 28, share: 28 / 37, types_ge_40: 1, types: ["business_management"] },
    ],
    unmapped_codes: [],
  };
}

describe("opportunity score v0.2 candidate", () => {
  it("combines the requested templateability inputs and preserves confidence separately", () => {
    const report = buildOpportunityV02Report(opportunity(), features(), {
      opportunityFile: "opportunity.json",
      featureFile: "feature.json",
      generatedAt: new Date("2026-10-04T00:00:00.000Z"),
    });
    const row = report.types[0]!;
    expect(row.confidence).toBe("high");
    expect(row.templateability_score).toBe(55.5);
    expect(row.v02_score).toBe(50.83);
    expect(row.role).toBe("template_product");
    expect(row.rank_change).toBe(0);
    expect(Object.values(report.weights).reduce((sum, value) => sum + value, 0)).toBeCloseTo(1);
    expect(Object.values(report.templateability_formula).reduce((sum, value) => sum + value, 0)).toBeCloseTo(1);
  });

  it("uses the shared feature vocabulary for the starter kit and keeps extensions as design only", () => {
    const report = buildStarterKitReport(features());
    expect(report.must_include.map((feature) => feature.feature)).toEqual([
      "admin_dashboard",
      "authentication",
      "user_management",
      "role_permission",
      "statistics_dashboard",
    ]);
    expect(report.optional_modules.map((feature) => feature.feature)).toContain("payment");
    expect(report.extensions.business_management).toContain("workflow");
  });
});
