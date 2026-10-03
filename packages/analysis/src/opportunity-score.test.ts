import { describe, expect, it } from "vitest";
import {
  OPPORTUNITY_WEIGHTS,
  computeHourOutliers,
  confidenceForN,
  percentileScore,
  type AnalyzedProject,
} from "./index";

function row(id: string, hours: number): AnalyzedProject {
  return {
    id,
    project_id: id,
    platform: "wishket",
    registered_at: "2026-01-15T03:00:00Z",
    raw_type: "외주",
    budget_type: "fixed",
    budget_min: 10_000_000,
    budget_max: 10_000_000,
    project_type: "website",
    engagement_type: "new_build",
    industry: "general",
    technology_assets: ["core_web"],
    reuse_level: "medium",
    vibe_coding_difficulty: 40,
    estimated_hours_min: hours,
    estimated_hours_max: hours,
    learning_value: 50,
    reusability_value: 50,
    market_value: 50,
  };
}

describe("opportunity score v0.1 helpers", () => {
  it("uses the requested confidence bands without score discount", () => {
    expect(confidenceForN(30)).toBe("high");
    expect(confidenceForN(15)).toBe("medium");
    expect(confidenceForN(5)).toBe("low");
    expect(confidenceForN(4)).toBe("insufficient");
  });

  it("normalizes p10/p90 with clamping and linear interpolation", () => {
    expect(percentileScore(10, { p10: 10, p90: 90 })).toBe(0);
    expect(percentileScore(50, { p10: 10, p90: 90 })).toBe(50);
    expect(percentileScore(90, { p10: 10, p90: 90 })).toBe(100);
    expect(percentileScore(120, { p10: 10, p90: 90 })).toBe(100);
  });

  it("flags hours outliers without removing rows", () => {
    const rows = [row("a", 100), row("b", 100), row("c", 100), row("d", 100), row("e", 1_000)];
    const result = computeHourOutliers(rows);
    expect(result.outlierIds).toEqual(new Set(["e"]));
    expect(result.values).toHaveLength(5);
  });

  it("keeps the three requested scenarios at 100 points", () => {
    for (const weights of Object.values(OPPORTUNITY_WEIGHTS)) {
      expect(Object.values(weights).reduce((sum, value) => sum + value, 0)).toBeCloseTo(1);
    }
  });
});
