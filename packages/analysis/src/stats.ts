/**
 * 분류 결과 분포 통계. 점수화 전에 "실제 분포"를 보기 위한 용도이며 점수/가중치는 만들지 않는다.
 *
 * 예산 기준:
 *  - 금액 = budget_max ?? budget_min (사이트가 범위로 줄 때 상한 = 고객이 제시한 최대 예산)
 *  - fixed(도급)와 monthly(월 단가)는 단위가 달라 섞지 않고 따로 집계한다. 그 외 유형은 예산 통계에서 제외.
 */

export interface StatsSourceRow {
  project_id: string;
  project_type: string | null;
  engagement_type: string | null;
  industry: string | null;
  complexity_types: string[] | null;
  reuse_level: string | null;
  technology_assets: string[] | null;
  vibe_coding_difficulty: number;
  estimated_hours_min: number;
  estimated_hours_max: number;
  reusability_value: number;
  learning_value: number;
  market_value: number;
  platform: string | null;
  budget_min: number | null;
  budget_max: number | null;
  budget_type: string | null;
}

export interface BudgetStats {
  n: number;
  mean: number | null;
  median: number | null;
  p25: number | null;
  p75: number | null;
}

export interface GroupStats {
  key: string;
  count: number;
  share: number;
  fixed_budget: BudgetStats;
  monthly_budget: BudgetStats;
  avg_vibe_coding_difficulty: number | null;
  avg_estimated_hours: number | null;
  avg_reusability_value: number | null;
  avg_learning_value: number | null;
  avg_market_value: number | null;
}

export interface OccurrenceStats {
  key: string;
  count: number;
  share: number;
}

/** 선형 보간 분위수 (정렬된 배열) */
export function quantile(sorted: number[], q: number): number | null {
  if (!sorted.length) return null;
  const pos = (sorted.length - 1) * q;
  const lo = Math.floor(pos);
  const hi = Math.ceil(pos);
  return sorted[lo]! + (sorted[hi]! - sorted[lo]!) * (pos - lo);
}

const mean = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null);

export function budgetStats(amounts: number[]): BudgetStats {
  const s = [...amounts].sort((a, b) => a - b);
  return { n: s.length, mean: mean(s), median: quantile(s, 0.5), p25: quantile(s, 0.25), p75: quantile(s, 0.75) };
}

export function budgetAmount(r: Pick<StatsSourceRow, "budget_min" | "budget_max">): number | null {
  const v = r.budget_max ?? r.budget_min;
  return v != null && v > 0 ? v : null;
}

function summarize(key: string, rows: StatsSourceRow[], total: number): GroupStats {
  const amounts = (type: string) =>
    rows.filter((r) => r.budget_type === type).map(budgetAmount).filter((v): v is number => v !== null);
  return {
    key,
    count: rows.length,
    share: total ? rows.length / total : 0,
    fixed_budget: budgetStats(amounts("fixed")),
    monthly_budget: budgetStats(amounts("monthly")),
    avg_vibe_coding_difficulty: mean(rows.map((r) => r.vibe_coding_difficulty)),
    avg_estimated_hours: mean(rows.map((r) => (r.estimated_hours_min + r.estimated_hours_max) / 2)),
    avg_reusability_value: mean(rows.map((r) => r.reusability_value)),
    avg_learning_value: mean(rows.map((r) => r.learning_value)),
    avg_market_value: mean(rows.map((r) => r.market_value)),
  };
}

/** 단일 값 필드(project_type / engagement_type / industry / reuse_level) 기준 그룹 통계, 건수 내림차순 */
export function groupBy(rows: StatsSourceRow[], field: "project_type" | "engagement_type" | "industry" | "reuse_level"): GroupStats[] {
  const groups = new Map<string, StatsSourceRow[]>();
  for (const r of rows) {
    const k = r[field] ?? "(none)";
    groups.set(k, [...(groups.get(k) ?? []), r]);
  }
  return [...groups].map(([k, rs]) => summarize(k, rs, rows.length)).sort((a, b) => b.count - a.count || a.key.localeCompare(b.key));
}

/** 배열 필드(technology_assets / complexity_types): 각 값이 등장한 프로젝트 수와 비율 */
export function occurrences(rows: StatsSourceRow[], field: "technology_assets" | "complexity_types"): OccurrenceStats[] {
  const counts = new Map<string, number>();
  for (const r of rows) for (const v of new Set(r[field] ?? [])) counts.set(v, (counts.get(v) ?? 0) + 1);
  return [...counts]
    .map(([key, count]) => ({ key, count, share: rows.length ? count / rows.length : 0 }))
    .sort((a, b) => b.count - a.count || a.key.localeCompare(b.key));
}

export interface DistributionReport {
  total: number;
  by_project_type: GroupStats[];
  by_engagement_type: GroupStats[];
  by_industry: GroupStats[];
  by_reuse_level: GroupStats[];
  technology_assets: OccurrenceStats[];
  complexity_types: OccurrenceStats[];
}

export function computeDistribution(rows: StatsSourceRow[]): DistributionReport {
  return {
    total: rows.length,
    by_project_type: groupBy(rows, "project_type"),
    by_engagement_type: groupBy(rows, "engagement_type"),
    by_industry: groupBy(rows, "industry"),
    by_reuse_level: groupBy(rows, "reuse_level"),
    technology_assets: occurrences(rows, "technology_assets"),
    complexity_types: occurrences(rows, "complexity_types"),
  };
}

const pct = (x: number) => `${(x * 100).toFixed(1)}%`;
const won = (x: number | null) => (x == null ? "-" : `${Math.round(x / 10000).toLocaleString()}만`);
const num = (x: number | null) => (x == null ? "-" : x.toFixed(1));

function groupTable(title: string, gs: GroupStats[]): string[] {
  const L = [`## ${title}`, "", "| 값 | 건수 | 비율 | 도급 예산 n | 평균 | 중앙 | p25 | p75 | 월단가 중앙 (n) | 난이도 | 예상시간 | 재사용 | 학습 |", "|---|---|---|---|---|---|---|---|---|---|---|---|---|"];
  for (const g of gs) {
    const b = g.fixed_budget;
    L.push(
      `| ${g.key} | ${g.count} | ${pct(g.share)} | ${b.n} | ${won(b.mean)} | ${won(b.median)} | ${won(b.p25)} | ${won(b.p75)} | ${won(g.monthly_budget.median)} (${g.monthly_budget.n}) | ${num(g.avg_vibe_coding_difficulty)} | ${num(g.avg_estimated_hours)} | ${num(g.avg_reusability_value)} | ${num(g.avg_learning_value)} |`,
    );
  }
  return [...L, ""];
}

function occurrenceTable(title: string, os: OccurrenceStats[]): string[] {
  return [`## ${title}`, "", "| 값 | 프로젝트 수 | 비율 |", "|---|---|---|", ...os.map((o) => `| ${o.key} | ${o.count} | ${pct(o.share)} |`), ""];
}

export function renderDistribution(d: DistributionReport, title = "분류 분포 통계"): string {
  return [
    `# ${title}`,
    "",
    `- 대상: ${d.total}건`,
    "- 예산 금액은 상한(budget_max, 없으면 budget_min) 기준. 도급(fixed)과 월 단가(monthly)는 따로 집계",
    "- 예상시간 = (estimated_hours_min + estimated_hours_max) / 2 의 평균",
    "",
    ...groupTable("project_type 기준", d.by_project_type),
    ...groupTable("engagement_type 기준", d.by_engagement_type),
    ...groupTable("industry 기준", d.by_industry),
    ...groupTable("reuse_level 기준", d.by_reuse_level),
    ...occurrenceTable("technology_assets 등장 비율", d.technology_assets),
    ...occurrenceTable("complexity_types 등장 비율", d.complexity_types),
  ].join("\n");
}
