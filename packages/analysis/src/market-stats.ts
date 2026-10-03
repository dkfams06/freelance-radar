import { budgetAmount, budgetStats, type BudgetStats } from "./stats";
import { reuseGroup, type ReuseGroup } from "./taxonomy";

/**
 * 시장 통계 (market-stats). 최종 점수(외주 매력도/수익성/공략)는 만들지 않고 분포만 계산한다.
 *
 * 규약
 *  - 예산 금액 = budget_max ?? budget_min (기존 `stats` 와 동일, 사이트가 범위로 줄 때 상한)
 *  - staffing(상주/기간제/월 단가)은 예산이 "월 단가"라 일반 외주(총액)와 섞지 않는다. 기본 시장 화면은 staffing 제외.
 *  - 원본 전체 통계는 raw 수집 구분으로 staffing 을 판정하고,
 *    분석 기반 통계는 AI 분류(engagement_type=staffing)로 판정한다 (두 방식은 분석 표본에서 일치 확인 가능).
 *  - 월별 평균은 "완전한 달"(수집 시점이 속한 마지막 달 제외)만 사용한다.
 */

export const STAFFING_RAW_TYPES = ["기간제", "기간제 상주", "시간제 상주", "상주"] as const;

export type Segment = "non_staffing" | "staffing";

export interface MarketProject {
  id: string;
  platform: string;
  registered_at: string | null;
  /** projects.project_type (수집 구분: 외주/기간제/도급/기간제 상주 ...) */
  raw_type: string | null;
  budget_type: string | null;
  budget_min: number | null;
  budget_max: number | null;
}

export interface MarketAnalysis {
  project_id: string;
  project_type: string | null;
  engagement_type: string | null;
  industry: string | null;
  technology_assets: string[] | null;
  reuse_level: string | null;
  vibe_coding_difficulty: number;
  estimated_hours_min: number;
  estimated_hours_max: number;
  learning_value: number;
  reusability_value: number;
  market_value: number;
}

export type AnalyzedProject = MarketProject & MarketAnalysis;

export function isRawStaffing(p: Pick<MarketProject, "raw_type" | "budget_type">): boolean {
  return (STAFFING_RAW_TYPES as readonly string[]).includes(p.raw_type ?? "") || p.budget_type === "monthly";
}

export const rawSegment = (p: MarketProject): Segment => (isRawStaffing(p) ? "staffing" : "non_staffing");
export const analysisSegment = (p: AnalyzedProject): Segment => (p.engagement_type === "staffing" ? "staffing" : "non_staffing");

/** KST 기준 YYYY-MM */
export function kstMonth(iso: string): string {
  return new Date(new Date(iso).getTime() + 9 * 3_600_000).toISOString().slice(0, 7);
}

/** KST 기준 YYYY-MM-DD */
export function kstDate(iso: string): string {
  return new Date(new Date(iso).getTime() + 9 * 3_600_000).toISOString().slice(0, 10);
}

const mean = (xs: number[]): number | null => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null);

/** 예산 금액 목록. staffing 은 월 단가, 외주는 총액 (budget_type 이 다른 값(협의 등)이면 제외) */
export function amountsOf(rows: MarketProject[], segment: Segment): number[] {
  const type = segment === "staffing" ? "monthly" : "fixed";
  return rows
    .filter((r) => r.budget_type === type)
    .map(budgetAmount)
    .filter((v): v is number => v !== null);
}

// ---------------------------------------------------------------------------
// 1. 원본 전체 통계 (분석 불필요)
// ---------------------------------------------------------------------------

export interface BudgetSummary {
  /** 세그먼트 전체 프로젝트 수 */
  count: number;
  /** 금액이 있는 프로젝트 수 */
  with_budget: number;
  /** 금액 존재율 (0~1) */
  presence_rate: number;
  stats: BudgetStats;
  unit: string;
}

export interface MonthRow {
  month: string;
  total: number;
  non_staffing: number;
  staffing: number;
  /** 수집 시점이 속한 달(부분 집계) */
  partial: boolean;
}

export interface SegmentBase {
  count: number;
  share: number;
  by_platform: Record<string, number>;
  budget: BudgetSummary;
  budget_by_platform: Record<string, BudgetSummary>;
}

export interface BaseStats {
  total: number;
  by_platform: Record<string, number>;
  months: MonthRow[];
  complete_months: number;
  monthly_avg: { all: number | null; non_staffing: number | null; staffing: number | null };
  non_staffing: SegmentBase;
  staffing: SegmentBase;
  /** 예산 존재율: 전체(구분 없이) */
  overall_budget_presence: number;
  /** KST 기준 YYYY-MM-DD */
  date_range: { from: string | null; to: string | null };
}

function budgetSummary(rows: MarketProject[], segment: Segment): BudgetSummary {
  const amounts = amountsOf(rows, segment);
  return {
    count: rows.length,
    with_budget: amounts.length,
    presence_rate: rows.length ? amounts.length / rows.length : 0,
    stats: budgetStats(amounts),
    unit: segment === "staffing" ? "원/월" : "원(총액)",
  };
}

function segmentBase(rows: MarketProject[], segment: Segment, total: number): SegmentBase {
  const by_platform: Record<string, number> = {};
  for (const r of rows) by_platform[r.platform] = (by_platform[r.platform] ?? 0) + 1;
  const budget_by_platform: Record<string, BudgetSummary> = {};
  for (const platform of Object.keys(by_platform)) {
    budget_by_platform[platform] = budgetSummary(
      rows.filter((r) => r.platform === platform),
      segment,
    );
  }
  return { count: rows.length, share: total ? rows.length / total : 0, by_platform, budget: budgetSummary(rows, segment), budget_by_platform };
}

export function computeBaseStats(projects: MarketProject[]): BaseStats {
  const total = projects.length;
  const by_platform: Record<string, number> = {};
  const monthMap = new Map<string, { total: number; non_staffing: number; staffing: number }>();
  let from: string | null = null;
  let to: string | null = null;
  for (const p of projects) {
    by_platform[p.platform] = (by_platform[p.platform] ?? 0) + 1;
    if (!p.registered_at) continue;
    const m = kstMonth(p.registered_at);
    const row = monthMap.get(m) ?? { total: 0, non_staffing: 0, staffing: 0 };
    row.total++;
    row[rawSegment(p)]++;
    monthMap.set(m, row);
    if (!from || p.registered_at < from) from = p.registered_at;
    if (!to || p.registered_at > to) to = p.registered_at;
  }
  const monthKeys = [...monthMap.keys()].sort();
  const lastMonth = monthKeys.at(-1);
  const months: MonthRow[] = monthKeys.map((month) => ({ month, ...monthMap.get(month)!, partial: month === lastMonth }));
  const complete = months.filter((m) => !m.partial);
  const avgOf = (f: (m: MonthRow) => number) => (complete.length ? complete.reduce((s, m) => s + f(m), 0) / complete.length : null);

  const nonStaffing = projects.filter((p) => rawSegment(p) === "non_staffing");
  const staffing = projects.filter((p) => rawSegment(p) === "staffing");
  const withAnyBudget = projects.filter((p) => budgetAmount(p) !== null).length;
  return {
    total,
    by_platform,
    months,
    complete_months: complete.length,
    monthly_avg: { all: avgOf((m) => m.total), non_staffing: avgOf((m) => m.non_staffing), staffing: avgOf((m) => m.staffing) },
    non_staffing: segmentBase(nonStaffing, "non_staffing", total),
    staffing: segmentBase(staffing, "staffing", total),
    overall_budget_presence: total ? withAnyBudget / total : 0,
    date_range: { from: from ? kstDate(from) : null, to: to ? kstDate(to) : null },
  };
}

// ---------------------------------------------------------------------------
// 2. 분석 커버리지
// ---------------------------------------------------------------------------

export interface Coverage {
  version: string;
  total_projects: number;
  analyzed: number;
  coverage_rate: number;
  analyzed_by_segment: Record<Segment, number>;
  total_by_segment: Record<Segment, number>;
  analyzed_by_platform: Record<string, number>;
  /** 분석 표본이 시장 추정에 쓰기엔 부족한지에 대한 경고 문구 */
  warnings: string[];
}

export function computeCoverage(projects: MarketProject[], analyzed: AnalyzedProject[], version: string): Coverage {
  const total_by_segment: Record<Segment, number> = { non_staffing: 0, staffing: 0 };
  for (const p of projects) total_by_segment[rawSegment(p)]++;
  const analyzed_by_segment: Record<Segment, number> = { non_staffing: 0, staffing: 0 };
  const analyzed_by_platform: Record<string, number> = {};
  for (const a of analyzed) {
    analyzed_by_segment[analysisSegment(a)]++;
    analyzed_by_platform[a.platform] = (analyzed_by_platform[a.platform] ?? 0) + 1;
  }
  const coverage_rate = projects.length ? analyzed.length / projects.length : 0;
  const warnings: string[] = [];
  if (analyzed.length === 0) warnings.push(`${version} 분석 결과가 없습니다. 분석 기반 통계는 비어 있습니다.`);
  else {
    if (coverage_rate < 0.1) warnings.push(`분석 커버리지가 ${(coverage_rate * 100).toFixed(1)}% 로 낮습니다 (분석 ${analyzed.length} / 원본 ${projects.length}). 분석 기반 수치는 시장 전체를 대표하지 않습니다.`);
    if (analyzed.length < 100) warnings.push(`분석 표본이 ${analyzed.length}건뿐이라 유형별 평균/중앙값은 참고용입니다 (n 이 작은 유형은 ⚠ 표시).`);
    warnings.push("분석된 프로젝트는 무작위 표본이 아니라 검증용으로 직접 고른 샘플이라, 유형 비율·월평균 공고 수를 시장 비율로 해석하면 안 됩니다.");
  }
  return { version, total_projects: projects.length, analyzed: analyzed.length, coverage_rate, analyzed_by_segment, total_by_segment, analyzed_by_platform, warnings };
}

// ---------------------------------------------------------------------------
// 3. project_type 통계 (분석 표본)
// ---------------------------------------------------------------------------

export interface TypeStat {
  key: string;
  n: number;
  /** 분석 표본(해당 세그먼트) 안에서의 비율 */
  share: number;
  /** 표본 안 월평균 공고 수 (완전한 달 기준) */
  monthly_avg_in_sample: number | null;
  /** 표본 비율 × 해당 세그먼트 전체 월평균. 표본이 무작위일 때만 의미 있음 */
  monthly_avg_estimated: number | null;
  budget: BudgetStats;
  avg_vibe_coding_difficulty: number | null;
  avg_hours_min: number | null;
  avg_hours_max: number | null;
  avg_learning_value: number | null;
  avg_reusability_value: number | null;
  avg_market_value: number | null;
  reuse_4: Record<string, number>;
  reuse_3: Record<ReuseGroup, number>;
  /** n 이 minN 보다 작아 신뢰하기 어려움 */
  low_sample: boolean;
}

export interface Averages {
  n: number;
  avg_vibe_coding_difficulty: number | null;
  avg_learning_value: number | null;
  avg_reusability_value: number | null;
  avg_market_value: number | null;
}

function groupMetrics(rows: AnalyzedProject[]) {
  return {
    avg_vibe_coding_difficulty: mean(rows.map((r) => r.vibe_coding_difficulty)),
    avg_hours_min: mean(rows.map((r) => r.estimated_hours_min)),
    avg_hours_max: mean(rows.map((r) => r.estimated_hours_max)),
    avg_learning_value: mean(rows.map((r) => r.learning_value)),
    avg_reusability_value: mean(rows.map((r) => r.reusability_value)),
    avg_market_value: mean(rows.map((r) => r.market_value)),
  };
}

function reuseCounts(rows: AnalyzedProject[]) {
  const reuse_4: Record<string, number> = {};
  const reuse_3: Record<ReuseGroup, number> = { high: 0, medium: 0, low_reuse: 0 };
  for (const r of rows) {
    if (r.reuse_level) reuse_4[r.reuse_level] = (reuse_4[r.reuse_level] ?? 0) + 1;
    const g = reuseGroup(r.reuse_level);
    if (g) reuse_3[g]++;
  }
  return { reuse_4, reuse_3 };
}

export interface ScopeContext {
  segment: Segment;
  /** 해당 세그먼트 완전한 달 기준 전체 월평균(원본) */
  monthly_avg_total: number | null;
  complete_months: string[];
  minN: number;
}

export function computeTypeStats(rows: AnalyzedProject[], ctx: ScopeContext): TypeStat[] {
  const groups = new Map<string, AnalyzedProject[]>();
  for (const r of rows) groups.set(r.project_type ?? "(none)", [...(groups.get(r.project_type ?? "(none)") ?? []), r]);
  const monthSet = new Set(ctx.complete_months);
  return [...groups]
    .map(([key, rs]): TypeStat => {
      const inWindow = rs.filter((r) => r.registered_at && monthSet.has(kstMonth(r.registered_at))).length;
      const share = rows.length ? rs.length / rows.length : 0;
      return {
        key,
        n: rs.length,
        share,
        monthly_avg_in_sample: ctx.complete_months.length ? inWindow / ctx.complete_months.length : null,
        monthly_avg_estimated: ctx.monthly_avg_total === null ? null : share * ctx.monthly_avg_total,
        budget: budgetStats(amountsOf(rs, ctx.segment)),
        ...groupMetrics(rs),
        ...reuseCounts(rs),
        low_sample: rs.length < ctx.minN,
      };
    })
    .sort((a, b) => b.n - a.n || a.key.localeCompare(b.key));
}

export function averagesOf(rows: AnalyzedProject[]): Averages {
  return {
    n: rows.length,
    avg_vibe_coding_difficulty: mean(rows.map((r) => r.vibe_coding_difficulty)),
    avg_learning_value: mean(rows.map((r) => r.learning_value)),
    avg_reusability_value: mean(rows.map((r) => r.reusability_value)),
    avg_market_value: mean(rows.map((r) => r.market_value)),
  };
}

export function reuseDistribution(rows: AnalyzedProject[]) {
  return reuseCounts(rows);
}

// ---------------------------------------------------------------------------
// 4. technology_assets 통계 / 조합
// ---------------------------------------------------------------------------

export interface AssetStat {
  key: string;
  n: number;
  share: number;
  budget: BudgetStats;
  avg_vibe_coding_difficulty: number | null;
  avg_learning_value: number | null;
  avg_reusability_value: number | null;
  low_sample: boolean;
}

const uniqueAssets = (r: AnalyzedProject) => [...new Set(r.technology_assets ?? [])].filter((a) => a !== "other").sort();

export function computeAssetStats(rows: AnalyzedProject[], segment: Segment, minN: number): AssetStat[] {
  const groups = new Map<string, AnalyzedProject[]>();
  for (const r of rows) for (const a of uniqueAssets(r)) groups.set(a, [...(groups.get(a) ?? []), r]);
  return [...groups]
    .map(([key, rs]): AssetStat => ({
      key,
      n: rs.length,
      share: rows.length ? rs.length / rows.length : 0,
      budget: budgetStats(amountsOf(rs, segment)),
      avg_vibe_coding_difficulty: mean(rs.map((r) => r.vibe_coding_difficulty)),
      avg_learning_value: mean(rs.map((r) => r.learning_value)),
      avg_reusability_value: mean(rs.map((r) => r.reusability_value)),
      low_sample: rs.length < minN,
    }))
    .sort((a, b) => b.n - a.n || a.key.localeCompare(b.key));
}

export interface ComboStat {
  assets: string[];
  n: number;
  share: number;
  budget: BudgetStats;
  avg_vibe_coding_difficulty: number | null;
  avg_learning_value: number | null;
  avg_reusability_value: number | null;
}

export const WATCHLIST_COMBOS: string[][] = [
  ["core_web", "admin_system"],
  ["core_web", "payments", "authentication_authorization"],
  ["ai_llm", "rag_embeddings"],
  ["browser_automation", "web_crawling"],
];

function combosOf(assets: string[], size: number): string[][] {
  const out: string[][] = [];
  const rec = (start: number, cur: string[]) => {
    if (cur.length === size) return void out.push([...cur]);
    for (let i = start; i < assets.length; i++) rec(i + 1, [...cur, assets[i]!]);
  };
  rec(0, []);
  return out;
}

function comboStat(assets: string[], rs: AnalyzedProject[], total: number, segment: Segment): ComboStat {
  return {
    assets,
    n: rs.length,
    share: total ? rs.length / total : 0,
    budget: budgetStats(amountsOf(rs, segment)),
    avg_vibe_coding_difficulty: mean(rs.map((r) => r.vibe_coding_difficulty)),
    avg_learning_value: mean(rs.map((r) => r.learning_value)),
    avg_reusability_value: mean(rs.map((r) => r.reusability_value)),
  };
}

/**
 * 2~3개 자산 조합 중 minCombo 건 이상 등장한 것만 (건수 내림차순). 'other' 자산은 제외.
 *
 * 같은 프로젝트 집합에서 나오는 조합(예: A+B, A+C, B+C 가 항상 같은 9건)은 하나로 묶어,
 * 그 프로젝트들에서 항상 함께 등장하는 자산 전체(closed itemset)로 표시한다.
 */
export function computeCombos(rows: AnalyzedProject[], segment: Segment, minCombo: number, sizes: number[] = [2, 3]): ComboStat[] {
  const groups = new Map<string, AnalyzedProject[]>();
  const seen = new Set<string>();
  for (const r of rows) {
    const assets = uniqueAssets(r);
    for (const size of sizes) {
      for (const combo of combosOf(assets, size)) {
        const k = combo.join("+");
        const key = `${k}|${r.id}`;
        if (seen.has(key)) continue;
        seen.add(key);
        groups.set(k, [...(groups.get(k) ?? []), r]);
      }
    }
  }
  const bySupport = new Map<string, AnalyzedProject[]>();
  for (const rs of groups.values()) {
    if (rs.length < minCombo) continue;
    bySupport.set(rs.map((r) => r.id).sort().join(","), rs);
  }
  return [...bySupport.values()]
    .map((rs) => {
      const closure = uniqueAssets(rs[0]!).filter((x) => rs.every((r) => uniqueAssets(r).includes(x)));
      return comboStat(closure, rs, rows.length, segment);
    })
    .sort((x, y) => y.n - x.n || y.assets.length - x.assets.length || x.assets.join().localeCompare(y.assets.join()));
}

/** 관심 조합(부분집합 포함 기준) 등장 건수. minCombo 미만이어도 JSON 에는 남긴다 (md 는 minCombo 이상만 표시) */
export function computeWatchlist(rows: AnalyzedProject[], segment: Segment, combos: string[][] = WATCHLIST_COMBOS): ComboStat[] {
  return combos.map((combo) => {
    const rs = rows.filter((r) => combo.every((a) => uniqueAssets(r).includes(a)));
    return comboStat(combo, rs, rows.length, segment);
  });
}

// ---------------------------------------------------------------------------
// 5. 다음 단계 판단용 지표별 목록 (합산 순위 없음)
// ---------------------------------------------------------------------------

export interface RankedItem {
  key: string;
  n: number;
  value: number;
  low_sample: boolean;
}

export interface MarketLists {
  min_n: number;
  /** n ≥ minN 인 유형 수 */
  eligible_types: number;
  /** 적격 유형이 부족해 n<minN 유형까지 포함한 참고용 목록 */
  reference_mode: boolean;
  top_count: RankedItem[];
  top_median_budget: RankedItem[];
  top_low_difficulty: RankedItem[];
  top_reusability: RankedItem[];
  top_learning: RankedItem[];
  high_budget_low_difficulty: {
    thresholds: { median_budget: number | null; avg_difficulty: number | null; budget_source: string };
    candidates: Array<{ key: string; n: number; median_budget: number; avg_difficulty: number; low_sample: boolean }>;
  };
}

export function computeLists(
  types: TypeStat[],
  opts: { minN: number; marketMedianBudget: number | null; sampleAvgDifficulty: number | null; limit?: number },
): MarketLists {
  const limit = opts.limit ?? 10;
  const eligible = types.filter((t) => !t.low_sample && t.key !== "(none)");
  const reference = eligible.length < 3;
  const pool = (reference ? types : eligible).filter((t) => t.key !== "(none)");
  const rank = (value: (t: TypeStat) => number | null, dir: "desc" | "asc"): RankedItem[] =>
    pool
      .map((t) => ({ t, v: value(t) }))
      .filter((x): x is { t: TypeStat; v: number } => x.v !== null)
      .sort((a, b) => (dir === "desc" ? b.v - a.v : a.v - b.v) || b.t.n - a.t.n || a.t.key.localeCompare(b.t.key))
      .slice(0, limit)
      .map(({ t, v }) => ({ key: t.key, n: t.n, value: v, low_sample: t.low_sample }));

  const candidates = pool
    .filter(
      (t) =>
        t.budget.median !== null &&
        t.avg_vibe_coding_difficulty !== null &&
        opts.marketMedianBudget !== null &&
        opts.sampleAvgDifficulty !== null &&
        t.budget.median >= opts.marketMedianBudget &&
        t.avg_vibe_coding_difficulty <= opts.sampleAvgDifficulty,
    )
    .map((t) => ({ key: t.key, n: t.n, median_budget: t.budget.median!, avg_difficulty: t.avg_vibe_coding_difficulty!, low_sample: t.low_sample }))
    .sort((a, b) => b.median_budget - a.median_budget || a.avg_difficulty - b.avg_difficulty);

  return {
    min_n: opts.minN,
    eligible_types: eligible.length,
    reference_mode: reference,
    top_count: rank((t) => t.n, "desc"),
    top_median_budget: rank((t) => t.budget.median, "desc"),
    top_low_difficulty: rank((t) => t.avg_vibe_coding_difficulty, "asc"),
    top_reusability: rank((t) => t.avg_reusability_value, "desc"),
    top_learning: rank((t) => t.avg_learning_value, "desc"),
    high_budget_low_difficulty: {
      thresholds: {
        median_budget: opts.marketMedianBudget,
        avg_difficulty: opts.sampleAvgDifficulty,
        budget_source: "원본 외주(staffing 제외) 전체 예산 중앙값 / 분석 표본 평균 난이도",
      },
      candidates,
    },
  };
}

// ---------------------------------------------------------------------------
// 전체 리포트
// ---------------------------------------------------------------------------

export interface ScopeReport {
  segment: Segment;
  n: number;
  averages: Averages;
  reuse: ReturnType<typeof reuseCounts>;
  types: TypeStat[];
  assets: AssetStat[];
  combos: ComboStat[];
  watchlist: ComboStat[];
  lists: MarketLists | null;
}

export interface MarketReport {
  schema: "market-stats/v1";
  generated_at: string;
  analysis_version: string;
  params: { min_n: number; min_combo: number };
  notes: string[];
  base: BaseStats;
  coverage: Coverage;
  /** 기본 화면: staffing 제외 */
  non_staffing: ScopeReport;
  staffing: ScopeReport;
}

export interface ComputeOptions {
  version: string;
  minN?: number;
  minCombo?: number;
  now?: Date;
}

export function computeMarketReport(projects: MarketProject[], analyzed: AnalyzedProject[], opts: ComputeOptions): MarketReport {
  const minN = opts.minN ?? 5;
  const minCombo = opts.minCombo ?? 5;
  const base = computeBaseStats(projects);
  const coverage = computeCoverage(projects, analyzed, opts.version);
  const completeMonths = base.months.filter((m) => !m.partial).map((m) => m.month);

  const scope = (segment: Segment, withLists: boolean): ScopeReport => {
    const rows = analyzed.filter((a) => analysisSegment(a) === segment);
    const types = computeTypeStats(rows, {
      segment,
      monthly_avg_total: base.monthly_avg[segment],
      complete_months: completeMonths,
      minN,
    });
    const averages = averagesOf(rows);
    return {
      segment,
      n: rows.length,
      averages,
      reuse: reuseDistribution(rows),
      types,
      assets: computeAssetStats(rows, segment, minN),
      combos: computeCombos(rows, segment, minCombo),
      watchlist: computeWatchlist(rows, segment),
      lists: withLists
        ? computeLists(types, {
            minN,
            marketMedianBudget: base[segment].budget.stats.median,
            sampleAvgDifficulty: averages.avg_vibe_coding_difficulty,
          })
        : null,
    };
  };

  return {
    schema: "market-stats/v1",
    generated_at: (opts.now ?? new Date()).toISOString(),
    analysis_version: opts.version,
    params: { min_n: minN, min_combo: minCombo },
    notes: [
      "예산 금액 = 상한(budget_max, 없으면 budget_min). 중앙값을 우선 지표로 본다.",
      "일반 외주(총액)와 staffing(월 단가)은 단위가 달라 분리 집계. 기본 시장 화면은 staffing 제외.",
      "월별 평균은 수집 시점이 속한 마지막 달을 제외한 완전한 달만 사용 (첫 달 2025-10 은 cutoff 2025-10-02 라 약 1일 적음).",
      "자산 조합은 2~3개 조합 중 최소 등장 건수 이상만, 같은 프로젝트 집합에서 나오는 조합은 항상 함께 등장하는 자산 묶음(closed itemset)으로 병합.",
      "reuse_level 은 원본 4단계 유지 + 보조 3단계(high / medium / low_reuse = low + one_off) 집계.",
      "최종 점수(외주 매력도/수익성/공략)는 계산하지 않는다.",
    ],
    base,
    coverage,
    non_staffing: scope("non_staffing", true),
    staffing: scope("staffing", false),
  };
}

