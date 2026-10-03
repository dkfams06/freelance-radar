import { describe, expect, it } from "vitest";
import {
  analysisSegment,
  computeAssetStats,
  computeBaseStats,
  computeCombos,
  computeCoverage,
  computeLists,
  computeMarketReport,
  computeTypeStats,
  computeWatchlist,
  isRawStaffing,
  kstMonth,
  rawSegment,
  renderMarketReport,
  reuseGroup,
  type AnalyzedProject,
  type MarketProject,
} from "./index";

let seq = 0;
function proj(over: Partial<MarketProject> = {}): MarketProject {
  seq++;
  return {
    id: `p${seq}`,
    platform: "wishket",
    registered_at: "2026-01-15T03:00:00Z",
    raw_type: "외주",
    budget_type: "fixed",
    budget_min: 10_000_000,
    budget_max: 10_000_000,
    ...over,
  };
}
function analyzed(over: Partial<AnalyzedProject> = {}): AnalyzedProject {
  return {
    ...proj(),
    project_type: "website",
    engagement_type: "new_build",
    industry: "general",
    technology_assets: ["core_web"],
    reuse_level: "medium",
    vibe_coding_difficulty: 40,
    estimated_hours_min: 100,
    estimated_hours_max: 200,
    learning_value: 50,
    reusability_value: 50,
    market_value: 50,
    ...over,
  } as AnalyzedProject;
}

describe("reuseGroup (보조 3단계)", () => {
  it("low + one_off = low_reuse, 원본 4단계는 그대로", () => {
    expect(reuseGroup("high")).toBe("high");
    expect(reuseGroup("medium")).toBe("medium");
    expect(reuseGroup("low")).toBe("low_reuse");
    expect(reuseGroup("one_off")).toBe("low_reuse");
    expect(reuseGroup(null)).toBeNull();
  });
});

describe("staffing 판정", () => {
  it("수집 구분/월 단가로 raw staffing 판정", () => {
    expect(isRawStaffing({ raw_type: "기간제", budget_type: "monthly" })).toBe(true);
    expect(isRawStaffing({ raw_type: "기간제 상주", budget_type: "negotiable" })).toBe(true);
    expect(isRawStaffing({ raw_type: "외주", budget_type: "monthly" })).toBe(true);
    expect(isRawStaffing({ raw_type: "외주", budget_type: "fixed" })).toBe(false);
    expect(isRawStaffing({ raw_type: "도급", budget_type: "negotiable" })).toBe(false);
  });
  it("분석 세그먼트는 engagement_type 기준", () => {
    expect(analysisSegment(analyzed({ engagement_type: "staffing" }))).toBe("staffing");
    expect(analysisSegment(analyzed({ engagement_type: "feature_extension" }))).toBe("non_staffing");
  });
});

describe("kstMonth", () => {
  it("UTC 15:00 이후는 KST 다음 날/달", () => {
    expect(kstMonth("2026-09-30T14:59:59Z")).toBe("2026-09");
    expect(kstMonth("2026-09-30T15:00:00Z")).toBe("2026-10");
  });
});

describe("computeBaseStats", () => {
  const projects: MarketProject[] = [
    // 2026-01: 외주 3건 (예산 1,2,3천만) + staffing 1건
    ...[10, 20, 30].map((m) => proj({ budget_min: m * 1_000_000, budget_max: m * 1_000_000, registered_at: "2026-01-10T00:00:00Z" })),
    proj({ raw_type: "기간제", budget_type: "monthly", budget_min: 6_000_000, budget_max: 6_000_000, registered_at: "2026-01-11T00:00:00Z" }),
    // 2026-02: 외주 1건(협의) + freemoa 범위 예산
    proj({ budget_type: "negotiable", budget_min: null, budget_max: null, registered_at: "2026-02-03T00:00:00Z" }),
    proj({ platform: "freemoa", raw_type: "도급", budget_min: 10_000_000, budget_max: 20_000_000, registered_at: "2026-02-04T00:00:00Z" }),
    // 2026-03: 부분 달 (마지막 달) 2건
    proj({ registered_at: "2026-03-01T00:00:00Z" }),
    proj({ raw_type: "기간제", budget_type: "monthly", budget_min: 5_000_000, budget_max: 5_000_000, registered_at: "2026-03-02T00:00:00Z" }),
  ];
  const b = computeBaseStats(projects);

  it("총계/플랫폼/세그먼트", () => {
    expect(b.total).toBe(8);
    expect(b.by_platform).toEqual({ wishket: 7, freemoa: 1 });
    expect(b.non_staffing.count).toBe(6);
    expect(b.staffing.count).toBe(2); // 기간제 2건
    expect(b.non_staffing.share + b.staffing.share).toBeCloseTo(1);
  });

  it("월별 집계와 월평균은 마지막(부분) 달 제외", () => {
    expect(b.months.map((m) => [m.month, m.total, m.partial])).toEqual([
      ["2026-01", 4, false],
      ["2026-02", 2, false],
      ["2026-03", 2, true],
    ]);
    expect(b.complete_months).toBe(2);
    expect(b.monthly_avg.all).toBe(3); // (4+2)/2
    expect(b.monthly_avg.staffing).toBe(0.5);
  });

  it("외주 예산: 상한 기준, 협의 제외, 중앙값/분위수/존재율", () => {
    const s = b.non_staffing.budget;
    // 금액: 10,20,30,(협의 제외),20(freemoa 상한),10(3월 외주) → [10,10,20,20,30]*100만
    expect(s.with_budget).toBe(5);
    expect(s.count).toBe(6); // 협의 1건은 금액 없음
    expect(s.presence_rate).toBeCloseTo(5 / 6);
    expect(s.stats.n).toBe(5);
    expect(s.stats.median).toBe(20_000_000);
    expect(s.stats.p25).toBe(10_000_000);
    expect(s.stats.p75).toBe(20_000_000);
    expect(b.non_staffing.budget_by_platform.freemoa!.stats.median).toBe(20_000_000);
    expect(s.unit).toBe("원(총액)");
  });

  it("staffing 월 단가는 외주 총액과 섞이지 않는다", () => {
    const s = b.staffing.budget;
    expect(s.unit).toBe("원/월");
    expect(s.stats.n).toBe(2);
    expect(s.stats.median).toBe(5_500_000);
    expect(s.presence_rate).toBe(1);
  });
});

describe("computeCoverage", () => {
  it("분석 0건/적은 표본/낮은 커버리지 경고", () => {
    const ps = Array.from({ length: 200 }, () => proj());
    expect(computeCoverage(ps, [], "v3.3").warnings[0]).toContain("분석 결과가 없습니다");
    const c = computeCoverage(ps, [analyzed()], "v3.3");
    expect(c.coverage_rate).toBeCloseTo(1 / 200);
    expect(c.warnings.some((w) => w.includes("커버리지"))).toBe(true);
    expect(c.warnings.some((w) => w.includes("1건뿐"))).toBe(true);
    expect(c.warnings.some((w) => w.includes("무작위 표본이 아니라"))).toBe(true);
  });
});

describe("computeTypeStats / lists", () => {
  const rows = [
    analyzed({ project_type: "website", vibe_coding_difficulty: 20, budget_max: 5_000_000, budget_min: 5_000_000, reuse_level: "low" }),
    analyzed({ project_type: "website", vibe_coding_difficulty: 30, budget_max: 7_000_000, budget_min: 7_000_000, reuse_level: "one_off" }),
    analyzed({ project_type: "saas", vibe_coding_difficulty: 70, budget_max: 90_000_000, budget_min: 90_000_000, reuse_level: "high" }),
  ];
  const types = computeTypeStats(rows, { segment: "non_staffing", monthly_avg_total: 300, complete_months: ["2026-01", "2026-02"], minN: 2 });

  it("건수/비율/표본 부족/예산/reuse 3단계", () => {
    const w = types.find((t) => t.key === "website")!;
    expect(w.n).toBe(2);
    expect(w.share).toBeCloseTo(2 / 3);
    expect(w.low_sample).toBe(false);
    expect(types.find((t) => t.key === "saas")!.low_sample).toBe(true);
    expect(w.budget.median).toBe(6_000_000);
    expect(w.reuse_4).toEqual({ low: 1, one_off: 1 });
    expect(w.reuse_3).toEqual({ high: 0, medium: 0, low_reuse: 2 });
    expect(w.monthly_avg_in_sample).toBe(1); // 2건 / 2개월
    expect(w.monthly_avg_estimated).toBeCloseTo(200);
  });

  it("적격 유형(n ≥ minN)이 3개 미만이면 참고용 모드", () => {
    const l = computeLists(types, { minN: 2, marketMedianBudget: 10_000_000, sampleAvgDifficulty: 40 });
    expect(l.reference_mode).toBe(true);
    expect(l.eligible_types).toBe(1);
    expect(l.top_count[0]).toMatchObject({ key: "website", value: 2 });
    expect(l.top_low_difficulty[0]!.key).toBe("website");
    expect(l.top_median_budget[0]!.key).toBe("saas");
  });

  it("견적 높음 + 난이도 낮음 후보는 두 기준을 모두 만족해야 함", () => {
    const many = [
      ...Array.from({ length: 5 }, () => analyzed({ project_type: "a", vibe_coding_difficulty: 30, budget_max: 30_000_000, budget_min: 30_000_000 })),
      ...Array.from({ length: 5 }, () => analyzed({ project_type: "b", vibe_coding_difficulty: 80, budget_max: 40_000_000, budget_min: 40_000_000 })),
      ...Array.from({ length: 5 }, () => analyzed({ project_type: "c", vibe_coding_difficulty: 20, budget_max: 3_000_000, budget_min: 3_000_000 })),
    ];
    const ts = computeTypeStats(many, { segment: "non_staffing", monthly_avg_total: 100, complete_months: [], minN: 5 });
    const l = computeLists(ts, { minN: 5, marketMedianBudget: 10_000_000, sampleAvgDifficulty: 43 });
    expect(l.reference_mode).toBe(false);
    expect(l.high_budget_low_difficulty.candidates.map((c) => c.key)).toEqual(["a"]);
  });
});

describe("technology_assets", () => {
  const rows = [
    analyzed({ technology_assets: ["core_web", "admin_system", "other"] }),
    analyzed({ technology_assets: ["core_web", "admin_system"] }),
    analyzed({ technology_assets: ["core_web", "admin_system", "payments"] }),
    analyzed({ technology_assets: ["core_web"] }),
  ];
  it("asset별 등장/비율 ('other' 제외)", () => {
    const a = computeAssetStats(rows, "non_staffing", 2);
    expect(a.find((x) => x.key === "core_web")).toMatchObject({ n: 4, share: 1 });
    expect(a.find((x) => x.key === "admin_system")!.n).toBe(3);
    expect(a.some((x) => x.key === "other")).toBe(false);
    expect(a.find((x) => x.key === "payments")!.low_sample).toBe(true);
  });

  it("조합은 최소 건수 이상만, 같은 프로젝트 집합의 조합은 묶음으로 병합", () => {
    const c3 = computeCombos(rows, "non_staffing", 3);
    expect(c3).toHaveLength(1);
    expect(c3[0]!.assets).toEqual(["admin_system", "core_web"]);
    expect(c3[0]!.n).toBe(3);
    expect(computeCombos(rows, "non_staffing", 4)).toEqual([]);
    // 같은 지지 집합: payments 는 1건뿐이라 min 1 이면 (core_web+admin_system+payments) 가 별도 묶음
    const c1 = computeCombos(rows, "non_staffing", 1);
    expect(c1.some((x) => x.assets.join() === "admin_system,core_web,payments" && x.n === 1)).toBe(true);
  });

  it("관심 조합은 기준 미만이어도 건수를 남긴다 (부분집합 포함)", () => {
    const w = computeWatchlist(rows, "non_staffing");
    expect(w[0]!.assets).toEqual(["core_web", "admin_system"]);
    expect(w[0]!.n).toBe(3);
    expect(w.find((x) => x.assets.includes("rag_embeddings"))!.n).toBe(0);
  });
});

describe("computeMarketReport / renderMarketReport", () => {
  const projects = [proj(), proj({ raw_type: "기간제", budget_type: "monthly" }), proj()];
  const a1 = { ...projects[0]!, ...analyzed(), id: projects[0]!.id } as AnalyzedProject;
  const a2 = { ...projects[1]!, ...analyzed({ engagement_type: "staffing" }), id: projects[1]!.id } as AnalyzedProject;

  it("일반 외주와 staffing 을 분리하고 최종 점수는 만들지 않는다", () => {
    const r = computeMarketReport(projects, [a1, a2], { version: "v3.3", minN: 1, now: new Date("2026-10-03T00:00:00Z") });
    expect(r.non_staffing.n).toBe(1);
    expect(r.staffing.n).toBe(1);
    expect(r.non_staffing.lists).not.toBeNull();
    expect(r.staffing.lists).toBeNull();
    expect(JSON.stringify(r)).not.toMatch(/attractiveness|profitability|매력도 점수/);
    expect(r.schema).toBe("market-stats/v1");
  });

  it("리포트 필수 구분(원본/분석/커버리지)과 합산 순위 없음 문구", () => {
    const md = renderMarketReport(computeMarketReport(projects, [a1], { version: "v3.3" }));
    expect(md).toContain("전체 원본 프로젝트 수");
    expect(md).toContain("분석 완료 프로젝트 수 (v3.3)");
    expect(md).toContain("분석 커버리지");
    expect(md).toContain("공고가 많은 유형 TOP 10");
    expect(md).toContain("중앙 견적이 높은 유형 TOP 10");
    expect(md).toContain("AI 난이도가 낮은 유형 TOP 10");
    expect(md).toContain("재사용 가치가 높은 유형 TOP 10");
    expect(md).toContain("학습 가치가 높은 유형 TOP 10");
    expect(md).toContain("견적 높음 + AI 난이도 낮음");
    expect(md).toContain("합산 순위 아님");
    expect(md).toContain("**중앙값**");
  });

  it("rawSegment 는 staffing 제외 기본 화면 기준과 일치", () => {
    expect(rawSegment(projects[1]!)).toBe("staffing");
  });
});
