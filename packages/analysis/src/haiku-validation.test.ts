import { describe, expect, it } from "vitest";
import { selectHaikuValidationSample, validateHaikuValidationSample, type HaikuValidationSource } from "./haiku-validation";

function row(id: string, type: string, engagement: string, difficulty: number): HaikuValidationSource {
  return {
    id,
    platform: id.startsWith("w") ? "wishket" : "freemoa",
    registered_at: "2026-01-15T00:00:00.000Z",
    raw_type: engagement === "staffing" ? "기간제" : "외주",
    project_type: type,
    engagement_type: engagement,
    budget_type: engagement === "staffing" ? "monthly" : "fixed",
    budget_min: 1_000_000,
    budget_max: 2_000_000,
    duration_days: 30,
    vibe_coding_difficulty: difficulty,
    model: "claude-sonnet-5-5",
  };
}

describe("Haiku validation sample", () => {
  it("same seed produces the same stratified IDs and retains the requested size", () => {
    const population = [
      row("w1", "website", "new_build", 10),
      row("w2", "business_management", "new_build", 40),
      row("f1", "website", "staffing", 60),
      row("f2", "business_management", "staffing", 80),
    ];
    const first = selectHaikuValidationSample(population, 2, "fixed-seed");
    const second = selectHaikuValidationSample(population, 2, "fixed-seed");
    expect(first.selected.map((item) => item.id)).toEqual(second.selected.map((item) => item.id));
    expect(first.selected).toHaveLength(2);
    const all = selectHaikuValidationSample(population, population.length, "fixed-seed").selected;
    expect(validateHaikuValidationSample(all, first.selected, 2).passed).toBe(true);
  });
});
