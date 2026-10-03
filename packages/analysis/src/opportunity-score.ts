import {
  analysisSegment,
  computeBaseStats,
  computeTypeStats,
  type AnalysisErrorSummary,
  type AnalyzedProject,
  type MarketProject,
  type Segment,
  type TypeStat,
} from "./market-stats";
import { quantile } from "./stats";

export type OpportunityMode = "include_outliers" | "exclude_outliers";
export type OpportunityScenario = "profit" | "balanced" | "technology_assets";

export interface OpportunityWeights {
  frequency: number;
  budget_per_hour: number;
  ai_ease: number;
  reusability: number;
  learning: number;
  market_value: number;
}

export const OPPORTUNITY_WEIGHTS: Record<OpportunityScenario, OpportunityWeights> = {
  profit: {
    frequency: 0.15,
    budget_per_hour: 0.35,
    ai_ease: 0.25,
    reusability: 0.15,
    learning: 0.05,
    market_value: 0.05,
  },
  balanced: {
    frequency: 0.2,
    budget_per_hour: 0.25,
    ai_ease: 0.2,
    reusability: 0.15,
    learning: 0.1,
    market_value: 0.1,
  },
  technology_assets: {
    frequency: 0.15,
    budget_per_hour: 0.15,
    ai_ease: 0.15,
    reusability: 0.25,
    learning: 0.15,
    market_value: 0.15,
  },
};

export const OPPORTUNITY_METRICS = [
  "frequency",
  "budget_per_hour",
  "ai_ease",
  "reusability",
  "learning",
  "market_value",
] as const;

export type OpportunityMetric = (typeof OPPORTUNITY_METRICS)[number];

export interface NormalizationBounds {
  p10: number | null;
  p90: number | null;
}

export type Normalization = Record<OpportunityMetric, NormalizationBounds>;

export type Confidence = "high" | "medium" | "low" | "insufficient";

export function confidenceForN(n: number): Confidence {
  if (n >= 30) return "high";
  if (n >= 15) return "medium";
  if (n >= 5) return "low";
  return "insufficient";
}

export interface OpportunityMetrics {
  n: number;
  confidence: Confidence;
  outlier_n: number;
  monthly_avg_frequency: number | null;
  median_budget: number | null;
  median_budget_per_estimated_hour: number | null;
  avg_ai_ease: number | null;
  avg_reusability: number | null;
  avg_learning: number | null;
  avg_market_value: number | null;
}

export interface OpportunityScores {
  frequency: number | null;
  budget_per_hour: number | null;
  ai_ease: number | null;
  reusability: number | null;
  learning: number | null;
  market_value: number | null;
  profit: number | null;
  balanced: number | null;
  technology_assets: number | null;
}

export interface OpportunityTypeStat extends OpportunityMetrics {
  key: string;
  normalized: Pick<OpportunityScores, OpportunityMetric>;
  scores: OpportunityScores;
  rank: Record<OpportunityScenario, number | null>;
}

export interface RankedOpportunityType {
  key: string;
  n: number;
  confidence: Confidence;
  value: number;
  outlier_n: number;
}

export interface OpportunityTopLists {
  opportunity_score: RankedOpportunityType[];
  budget_per_hour: RankedOpportunityType[];
  ai_ease: RankedOpportunityType[];
  reusability: RankedOpportunityType[];
  learning: RankedOpportunityType[];
}

export interface OpportunityScope {
  segment: Segment;
  n: number;
  types: OpportunityTypeStat[];
  normalization: Normalization;
  top: OpportunityTopLists | null;
  stable_top10: string[];
}

export interface OpportunityProjectFlag {
  project_id: string;
  project_type: string | null;
  segment: Segment;
  midpoint_hours: number | null;
  flags: string[];
}

export interface OpportunityQuality {
  sample_positions: number;
  analyzed_success: number;
  normal_analyzed: number;
  hours_outlier: number;
  final_failed: number;
  outlier_rule: {
    field: "estimated_hours_midpoint";
    method: "IQR_1.5_fence";
    q1: number | null;
    median: number | null;
    q3: number | null;
    lower_fence: number | null;
    upper_fence: number | null;
  };
  flags: OpportunityProjectFlag[];
  final_failed_project_ids: string[];
  outlier_by_segment: Record<Segment, number>;
  outlier_by_project_type: Record<string, number>;
}

export interface OpportunityScoreReport {
  schema: "opportunity-score/v0.1";
  generated_at: string;
  analysis_version: string;
  default_mode: "exclude_outliers";
  default_scenario: "balanced";
  weights: Record<OpportunityScenario, OpportunityWeights>;
  quality: OpportunityQuality;
  modes: Record<OpportunityMode, { non_staffing: OpportunityScope; staffing: OpportunityScope }>;
  notes: string[];
}

const mean = (xs: number[]): number | null => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null);
const finite = (x: number | null): x is number => x !== null && Number.isFinite(x);
const round2 = (x: number | null): number | null => (x === null ? null : Math.round(x * 100) / 100);

function midpoint(row: AnalyzedProject): number | null {
  if (!Number.isFinite(row.estimated_hours_min) || !Number.isFinite(row.estimated_hours_max)) return null;
  if (row.estimated_hours_min <= 0 || row.estimated_hours_max < row.estimated_hours_min) return null;
  return (row.estimated_hours_min + row.estimated_hours_max) / 2;
}

export function computeHourOutliers(rows: AnalyzedProject[]) {
  const values = rows.map(midpoint).filter(finite).sort((a, b) => a - b);
  const q1 = quantile(values, 0.25);
  const median = quantile(values, 0.5);
  const q3 = quantile(values, 0.75);
  const iqr = q1 !== null && q3 !== null ? q3 - q1 : null;
  const lower = q1 !== null && iqr !== null ? q1 - 1.5 * iqr : null;
  const upper = q3 !== null && iqr !== null ? q3 + 1.5 * iqr : null;
  const outlierIds = new Set(
    rows
      .filter((row) => {
        const m = midpoint(row);
        return m !== null && lower !== null && upper !== null && (m < lower || m > upper);
      })
      .map((row) => row.id),
  );
  return { values, q1, median, q3, lower, upper, outlierIds };
}

function metricValues(types: OpportunityTypeStat[], metric: OpportunityMetric): number[] {
  return types
    .filter((type) => type.key !== "(none)")
    .map((type) => typeMetric(type, metric))
    .filter(finite)
    .sort((a, b) => a - b);
}

function typeMetric(type: OpportunityTypeStat, metric: OpportunityMetric): number | null {
  if (metric === "frequency") return type.monthly_avg_frequency;
  if (metric === "budget_per_hour") return type.median_budget_per_estimated_hour;
  if (metric === "ai_ease") return type.avg_ai_ease;
  if (metric === "reusability") return type.avg_reusability;
  if (metric === "learning") return type.avg_learning;
  return type.avg_market_value;
}

function buildNormalization(types: OpportunityTypeStat[]): Normalization {
  return Object.fromEntries(
    OPPORTUNITY_METRICS.map((metric) => {
      const values = metricValues(types, metric);
      return [metric, { p10: quantile(values, 0.1), p90: quantile(values, 0.9) }];
    }),
  ) as Normalization;
}

export function percentileScore(value: number | null, bounds: NormalizationBounds): number | null {
  if (value === null || !Number.isFinite(value) || bounds.p10 === null || bounds.p90 === null) return null;
  if (bounds.p90 <= bounds.p10) return 50;
  if (value <= bounds.p10) return 0;
  if (value >= bounds.p90) return 100;
  return ((value - bounds.p10) / (bounds.p90 - bounds.p10)) * 100;
}

function scoreWithWeights(scores: Pick<OpportunityScores, OpportunityMetric>, weights: OpportunityWeights): number | null {
  const values = OPPORTUNITY_METRICS.map((metric) => scores[metric]);
  if (values.some((value) => value === null)) return null;
  return OPPORTUNITY_METRICS.reduce((sum, metric) => sum + (scores[metric] ?? 0) * weights[metric], 0);
}

function createMetrics(type: TypeStat, rows: AnalyzedProject[], outlierIds: Set<string>): OpportunityMetrics {
  return {
    n: type.n,
    confidence: confidenceForN(type.n),
    outlier_n: rows.filter((row) => outlierIds.has(row.id)).length,
    monthly_avg_frequency: type.monthly_avg_in_sample,
    median_budget: type.budget.median,
    median_budget_per_estimated_hour: type.budget_per_estimated_hour.median,
    avg_ai_ease: type.avg_ai_ease,
    avg_reusability: type.avg_reusability_value,
    avg_learning: type.avg_learning_value,
    avg_market_value: type.avg_market_value,
  };
}

function createScope(
  rows: AnalyzedProject[],
  segment: Segment,
  completeMonths: string[],
  monthlyAvgTotal: number | null,
  outlierIds: Set<string>,
): OpportunityScope {
  const typeStats = computeTypeStats(rows, {
    segment,
    monthly_avg_total: monthlyAvgTotal,
    complete_months: completeMonths,
    minN: 5,
  });
  const byType = new Map<string, AnalyzedProject[]>();
  for (const row of rows) byType.set(row.project_type ?? "(none)", [...(byType.get(row.project_type ?? "(none)") ?? []), row]);
  const types: OpportunityTypeStat[] = typeStats.map((type) => ({
    key: type.key,
    ...createMetrics(type, byType.get(type.key) ?? [], outlierIds),
    normalized: { frequency: null, budget_per_hour: null, ai_ease: null, reusability: null, learning: null, market_value: null },
    scores: { frequency: null, budget_per_hour: null, ai_ease: null, reusability: null, learning: null, market_value: null, profit: null, balanced: null, technology_assets: null },
    rank: { profit: null, balanced: null, technology_assets: null },
  }));
  const normalization = buildNormalization(types);
  for (const type of types) {
    for (const metric of OPPORTUNITY_METRICS) type.normalized[metric] = round2(percentileScore(typeMetric(type, metric), normalization[metric]));
    type.scores = {
      ...type.normalized,
      profit: round2(scoreWithWeights(type.normalized, OPPORTUNITY_WEIGHTS.profit)),
      balanced: round2(scoreWithWeights(type.normalized, OPPORTUNITY_WEIGHTS.balanced)),
      technology_assets: round2(scoreWithWeights(type.normalized, OPPORTUNITY_WEIGHTS.technology_assets)),
    };
  }
  for (const scenarioKey of Object.keys(OPPORTUNITY_WEIGHTS) as OpportunityScenario[]) {
    const sorted = types
      .filter((type) => type.key !== "(none)" && type.scores[scenarioKey] !== null)
      .sort((a, b) => (b.scores[scenarioKey] ?? 0) - (a.scores[scenarioKey] ?? 0) || b.n - a.n || a.key.localeCompare(b.key));
    sorted.forEach((type, index) => { type.rank[scenarioKey] = index + 1; });
  }
  const top: OpportunityTopLists | null = segment === "non_staffing"
    ? {
        opportunity_score: rankTypes(types, "balanced"),
        budget_per_hour: rankTypes(types, "median_budget_per_estimated_hour"),
        ai_ease: rankTypes(types, "avg_ai_ease"),
        reusability: rankTypes(types, "avg_reusability"),
        learning: rankTypes(types, "avg_learning"),
      }
    : null;
  const scenarioTop10 = (key: OpportunityScenario) => types.filter((type) => type.rank[key] !== null && type.rank[key]! <= 10).map((type) => type.key);
  const stable_top10 = segment === "non_staffing"
    ? (Object.keys(OPPORTUNITY_WEIGHTS) as OpportunityScenario[]).map(scenarioTop10).reduce((common, keys) => common.filter((key) => keys.includes(key)))
    : [];
  return { segment, n: rows.length, types, normalization, top, stable_top10 };
}

function rankTypes(types: OpportunityTypeStat[], field: "balanced" | "median_budget_per_estimated_hour" | "avg_ai_ease" | "avg_reusability" | "avg_learning"): RankedOpportunityType[] {
  const value = (type: OpportunityTypeStat): number | null => field === "balanced" ? type.scores.balanced : type[field];
  return types
    .filter((type) => type.key !== "(none)" && value(type) !== null)
    .sort((a, b) => (value(b) ?? 0) - (value(a) ?? 0) || b.n - a.n || a.key.localeCompare(b.key))
    .slice(0, 10)
    .map((type) => ({ key: type.key, n: type.n, confidence: type.confidence, value: round2(value(type))!, outlier_n: type.outlier_n }));
}

function flagRows(rows: AnalyzedProject[], outlierIds: Set<string>): OpportunityProjectFlag[] {
  return rows.map((row) => ({
    project_id: row.id,
    project_type: row.project_type,
    segment: analysisSegment(row),
    midpoint_hours: round2(midpoint(row)),
    flags: outlierIds.has(row.id) ? ["hours_outlier"] : [],
  }));
}

export function computeOpportunityScoreReport(
  projects: MarketProject[],
  analyzed: AnalyzedProject[],
  errors: AnalysisErrorSummary[] = [],
  opts: { version: string; now?: Date; sampleProjectIds?: string[] },
): OpportunityScoreReport {
  const base = computeBaseStats(projects);
  const completeMonths = base.months.filter((month) => !month.partial).map((month) => month.month);
  const outliers = computeHourOutliers(analyzed);
  const unresolved = [...new Set(errors.filter((error) => error.resolved_at === null).map((error) => error.project_id))].sort();
  const normal = analyzed.filter((row) => !outliers.outlierIds.has(row.id));
  const scopes = (mode: OpportunityMode) => {
    const rows = mode === "exclude_outliers" ? normal : analyzed;
    const nonStaffing = rows.filter((row) => analysisSegment(row) === "non_staffing");
    const staffing = rows.filter((row) => analysisSegment(row) === "staffing");
    return {
      non_staffing: createScope(nonStaffing, "non_staffing", completeMonths, base.monthly_avg.non_staffing, outliers.outlierIds),
      staffing: createScope(staffing, "staffing", completeMonths, base.monthly_avg.staffing, outliers.outlierIds),
    };
  };
  const flags = flagRows(analyzed, outliers.outlierIds);
  const outlierBySegment: Record<Segment, number> = { non_staffing: 0, staffing: 0 };
  const outlierByProjectType: Record<string, number> = {};
  for (const row of analyzed.filter((row) => outliers.outlierIds.has(row.id))) {
    const segment = analysisSegment(row);
    outlierBySegment[segment]++;
    const key = row.project_type ?? "(none)";
    outlierByProjectType[key] = (outlierByProjectType[key] ?? 0) + 1;
  }
  return {
    schema: "opportunity-score/v0.1",
    generated_at: (opts.now ?? new Date()).toISOString(),
    analysis_version: opts.version,
    default_mode: "exclude_outliers",
    default_scenario: "balanced",
    weights: OPPORTUNITY_WEIGHTS,
    quality: {
      sample_positions: opts.sampleProjectIds?.length ?? analyzed.length + unresolved.length,
      analyzed_success: analyzed.length,
      normal_analyzed: normal.length,
      hours_outlier: outliers.outlierIds.size,
      final_failed: unresolved.length,
      outlier_rule: {
        field: "estimated_hours_midpoint",
        method: "IQR_1.5_fence",
        q1: round2(outliers.q1),
        median: round2(outliers.median),
        q3: round2(outliers.q3),
        lower_fence: round2(outliers.lower),
        upper_fence: round2(outliers.upper),
      },
      flags,
      final_failed_project_ids: unresolved,
      outlier_by_segment: outlierBySegment,
      outlier_by_project_type: outlierByProjectType,
    },
    modes: { include_outliers: scopes("include_outliers"), exclude_outliers: scopes("exclude_outliers") },
    notes: [
      "이 문서는 최종 공식이 아니라 v0.1 후보 공식을 검토하기 위한 분석이다.",
      "시간 이상치는 estimated_hours_min/max 중앙값의 전체 분석표본 IQR 1.5 fence로 flag만 붙였으며 삭제하지 않았다.",
      "기본 후보 점수는 이상치 제외 모드로 표시하고, 이상치 포함 모드는 민감도 비교용으로 함께 유지한다.",
      "각 모드의 p10/p90은 해당 모드의 project_type 지표 분포에서 다시 계산한다. p10 이하 0, p90 이상 100, 중간은 선형 변환한다.",
      "중앙 견적은 점수에서 제외하고 참고지표로만 유지한다. 시간당 예산은 budget / estimated_hours midpoint이다.",
      "confidence는 n만으로 표시하며 점수에 표본수 감점을 적용하지 않는다.",
      "staffing은 일반 외주 점수와 섞지 않고 별도 표로 유지한다.",
    ],
  };
}

export function renderOpportunityScoreReport(report: OpportunityScoreReport): string {
  const lines: string[] = [];
  const f = (value: number | null | undefined, digits = 1) => value == null ? "-" : value.toFixed(digits);
  const man = (value: number | null | undefined) => value == null ? "-" : `${Math.round(value / 10_000).toLocaleString("ko-KR")}만`;
  const metricValue = (type: OpportunityTypeStat, field: keyof OpportunityMetrics) => {
    const value = type[field];
    return typeof value === "number" ? value : null;
  };
  const confidence = (type: OpportunityTypeStat) => type.confidence;
  const typeHeader = "| project_type | n | confidence | 월평균 공고 | 중앙 견적 | 시간당 예산 중앙 | AI 용이성 | 재사용성 | 학습가치 | 시장가치 | opportunity_score |";
  const typeSeparator = "|---|---:|---|---:|---:|---:|---:|---:|---:|---:|---:|";
  const typeRows = (scope: OpportunityScope, score: boolean) => [
    typeHeader,
    typeSeparator,
    ...scope.types.map((type) => `| ${type.key} | ${type.n} | ${confidence(type)} | ${f(type.monthly_avg_frequency)} | ${man(type.median_budget)} | ${man(type.median_budget_per_estimated_hour)} | ${f(type.avg_ai_ease)} | ${f(type.avg_reusability)} | ${f(type.avg_learning)} | ${f(type.avg_market_value)} | ${score ? f(type.scores.balanced, 2) : "-"} |`),
    "",
  ];
  const rawTypeRows = (scope: OpportunityScope) => [
    "| project_type | n | confidence | 이상치 n | 월평균 공고 | 중앙 견적 | 시간당 예산 중앙 | AI 용이성 | 재사용성 | 학습가치 | 시장가치 |",
    "|---|---:|---|---:|---:|---:|---:|---:|---:|---:|---:|",
    ...scope.types.map((type) => `| ${type.key} | ${type.n} | ${type.confidence} | ${type.outlier_n} | ${f(type.monthly_avg_frequency)} | ${man(type.median_budget)} | ${man(type.median_budget_per_estimated_hour)} | ${f(type.avg_ai_ease)} | ${f(type.avg_reusability)} | ${f(type.avg_learning)} | ${f(type.avg_market_value)} |`),
    "",
  ];
  const topRows = (title: string, entries: RankedOpportunityType[]) => [
    `### ${title}`,
    "",
    "| 순위 | project_type | 값 | n | confidence | 이상치 n |",
    "|---:|---|---:|---:|---|---:|",
    ...entries.map((entry, index) => `| ${index + 1} | ${entry.key} | ${f(entry.value, 2)} | ${entry.n} | ${entry.confidence} | ${entry.outlier_n} |`),
    "",
  ];
  const scenarioRows = (scope: OpportunityScope) => (Object.keys(OPPORTUNITY_WEIGHTS) as OpportunityScenario[]).map((scenario) => {
    const types = [...scope.types]
      .filter((type) => type.key !== "(none)" && type.scores[scenario] !== null)
      .sort((a, b) => (b.scores[scenario] ?? 0) - (a.scores[scenario] ?? 0) || b.n - a.n || a.key.localeCompare(b.key))
      .slice(0, 10);
    return { scenario, types };
  });
  const scenarioLabel: Record<OpportunityScenario, string> = { profit: "수익 중심", balanced: "균형형(v0.1)", technology_assets: "기술자산 중심" };
  const renderScenario = (scope: OpportunityScope, title: string) => {
    lines.push(`### ${title}`, "", "| 시나리오 | TOP 10 |", "|---|---|", ...scenarioRows(scope).map(({ scenario, types }) => `| ${scenarioLabel[scenario]} | ${types.map((type) => `${type.key}(${f(type.scores[scenario], 2)}, n=${type.n})`).join(", ") || "-"} |`), "");
    lines.push(`- 세 시나리오 TOP 10 교집합: **${scope.stable_top10.join(", ") || "없음"}**`, "");
  };
  const renderStaffing = (mode: OpportunityMode) => {
    lines.push(`### staffing · ${mode === "exclude_outliers" ? "이상치 제외" : "이상치 포함"} (점수 미산출)`, "", ...rawTypeRows(report.modes[mode].staffing));
  };

  lines.push(`# 공략 점수 v0.1 후보 분석 (analysis_version = ${report.analysis_version})`, "", `- 생성: ${report.generated_at}`, `- 기본 표시: **이상치 제외 + 균형형(v0.1)**`, "- 최종 공식 확정이 아닌 후보 공식 및 민감도 분석입니다.", "");
  lines.push("## 1. 데이터 품질 분리", "", "| 구분 | 건수 | 처리 |", "|---|---:|---|", `| 정상 분석 | ${report.quality.normal_analyzed} | 점수 계산 대상에 포함 |`, `| 시간 이상치 | ${report.quality.hours_outlier} | 삭제하지 않고 hours_outlier flag |`, `| 최종 실패 | ${report.quality.final_failed} | 점수 계산에서 제외 |`, "", `- 이상치 기준: estimated_hours midpoint의 IQR 1.5 fence (Q1 ${f(report.quality.outlier_rule.q1, 0)}, 중앙 ${f(report.quality.outlier_rule.median, 0)}, Q3 ${f(report.quality.outlier_rule.q3, 0)}, 하한 ${f(report.quality.outlier_rule.lower_fence, 0)}, 상한 ${f(report.quality.outlier_rule.upper_fence, 0)})`, `- 분석 성공 ${report.quality.analyzed_success}건 + 최종 실패 ${report.quality.final_failed}건 = 표본 위치 ${report.quality.sample_positions}건`, `- 이상치 세그먼트: 일반 외주 ${report.quality.outlier_by_segment.non_staffing}건 / staffing ${report.quality.outlier_by_segment.staffing}건`, "");
  lines.push("### 이상치 flag 목록", "", "| project_id | project_type | segment | midpoint hours | flag |", "|---|---|---|---:|---|", ...report.quality.flags.filter((flag) => flag.flags.length).map((flag) => `| ${flag.project_id} | ${flag.project_type ?? "(none)"} | ${flag.segment} | ${f(flag.midpoint_hours, 0)} | ${flag.flags.join(", ")} |`), "");
  lines.push(`- 최종 실패 project_id: ${report.quality.final_failed_project_ids.join(", ") || "없음"}`, "");

  lines.push("## 2. 후보 공식", "", "```text", "opportunity_score = frequency_score * 0.20 + budget_per_hour_score * 0.25 + ai_ease_score * 0.20 + reusability_score * 0.15 + learning_score * 0.10 + market_value_score * 0.10", "```", "", "| 지표 | 배점 | 정규화 방향 |", "|---|---:|---|", "| 시장 빈도 | 20 | 높을수록 좋음 |", "| 시간당 예산 | 25 | 높을수록 좋음 |", "| AI 구현 용이성 | 20 | 높을수록 좋음 |", "| 재사용성 | 15 | 높을수록 좋음 |", "| 학습 가치 | 10 | 높을수록 좋음 |", "| 시장 활용성 | 10 | 높을수록 좋음 |", "", "정규화는 각 모드의 project_type 지표 분포에서 p10 이하=0, p90 이상=100, 사이는 선형 변환입니다. 중앙 견적은 점수에 넣지 않습니다.", "");

  for (const mode of ["exclude_outliers", "include_outliers"] as OpportunityMode[]) {
    const label = mode === "exclude_outliers" ? "이상치 제외 (기본 후보 점수)" : "이상치 포함 (민감도 비교)";
    const non = report.modes[mode].non_staffing;
    lines.push(`## ${mode === "exclude_outliers" ? "3" : "4"}. 일반 외주 · ${label}`, "", `- 분석 n: **${non.n}**`, "", ...typeRows(non, true));
    if (mode === "exclude_outliers") {
      lines.push("### 정규화 p10 / p90", "", "| 지표 | p10 | p90 |", "|---|---:|---:|", ...Object.entries(non.normalization).map(([key, value]) => `| ${key} | ${f(value.p10, 2)} | ${f(value.p90, 2)} |`), "");
      lines.push(...topRows("공략 점수 높은 유형 TOP 10", non.top?.opportunity_score ?? []));
      lines.push(...topRows("시간당 예산 높은 유형 TOP 10", non.top?.budget_per_hour ?? []));
      lines.push(...topRows("AI 용이성 높은 유형 TOP 10", non.top?.ai_ease ?? []));
      lines.push(...topRows("재사용성 높은 유형 TOP 10", non.top?.reusability ?? []));
      lines.push(...topRows("학습가치 높은 유형 TOP 10", non.top?.learning ?? []));
      renderScenario(non, "민감도 분석 · 세 시나리오 TOP 10");
    }
    renderStaffing(mode);
  }

  lines.push("## 5. 이상치 포함/제외 왜곡 비교", "", "| project_type | n 포함 | n 제외 | 이상치 n | score 포함 | score 제외 | Δ score(제외-포함) | 시간당 예산 포함→제외 | AI 용이성 포함→제외 | 재사용성 포함→제외 |", "|---|---:|---:|---:|---:|---:|---:|---|---|---|", ...report.modes.include_outliers.non_staffing.types.map((included) => {
    const excluded = report.modes.exclude_outliers.non_staffing.types.find((type) => type.key === included.key);
    const scoreDelta = excluded && included.scores.balanced !== null && excluded.scores.balanced !== null ? excluded.scores.balanced - included.scores.balanced : null;
    return `| ${included.key} | ${included.n} | ${excluded?.n ?? 0} | ${included.outlier_n} | ${f(included.scores.balanced, 2)} | ${f(excluded?.scores.balanced ?? null, 2)} | ${f(scoreDelta, 2)} | ${man(included.median_budget_per_estimated_hour)} → ${man(excluded?.median_budget_per_estimated_hour ?? null)} | ${f(included.avg_ai_ease)} → ${f(excluded?.avg_ai_ease ?? null)} | ${f(included.avg_reusability)} → ${f(excluded?.avg_reusability ?? null)} |`;
  }), "", "## 6. 해석 주의", "", ...report.notes.map((note) => `- ${note}`), "- 최종 실패 5건은 현재 점수 계산 대상이 아니다. 재분석 후 결과가 바뀔 수 있다.", "- 전체 5,287건의 시장 대표 점수나 최종 공략 공식으로 확정하지 않는다.");
  return lines.join("\n");
}
