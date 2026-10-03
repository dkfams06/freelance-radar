import { createHash } from "node:crypto";
import { budgetAmount, budgetStats, type BudgetStats } from "./stats";
import { isRawStaffing, kstMonth, type Segment } from "./market-stats";

/** 표본 추출에 필요한 projects 원본 컬럼만 표현한다. */
export interface SampleSourceProject {
  id: string;
  platform: string;
  registered_at: string | null;
  /** DB 원본 projects.project_type를 raw_type으로 매핑한다. */
  raw_type?: string | null;
  project_type?: string | null;
  budget_type: string | null;
  budget_min: number | null;
  budget_max: number | null;
  duration_days: number | null;
}

export interface SampleProjectSnapshot extends SampleSourceProject {
  segment: Segment;
  month: string;
  budget_band: string;
  duration_band: string;
  stratum: string;
}

export interface DistributionRow {
  key: string;
  population_n: number;
  population_share: number;
  sample_n: number;
  sample_share: number;
  abs_share_delta: number;
}

export interface BudgetComparison {
  unit: "fixed" | "monthly";
  population: BudgetStats;
  sample: BudgetStats;
}

export interface SampleValidation {
  passed: boolean;
  errors: string[];
  warnings: string[];
  population_n: number;
  sample_n: number;
  platform: DistributionRow[];
  staffing: DistributionRow[];
  month: DistributionRow[];
  budget_band: DistributionRow[];
  duration_band: DistributionRow[];
  budget: { fixed: BudgetComparison; monthly: BudgetComparison };
  max_abs_share_delta: {
    platform: number;
    staffing: number;
    month: number;
    budget_band: number;
    duration_band: number;
  };
}

export interface StratifiedSampleFile {
  schema: "analyzer-v3.3-market-sample/v1";
  analysis_version: string;
  seed: string;
  requested_size: number;
  population_total: number;
  eligible_population: number;
  selected_project_ids: string[];
  selected: SampleProjectSnapshot[];
  strata: Array<{ key: string; population_n: number; quota: number; sample_n: number }>;
  validation: SampleValidation;
  created_at: string;
}

const MISSING = "(missing)";

function hashKey(seed: string, key: string): string {
  return createHash("sha256").update(`${seed}\0${key}`).digest("hex");
}

export function sampleMonth(p: Pick<SampleSourceProject, "registered_at">): string {
  return p.registered_at ? kstMonth(p.registered_at) : MISSING;
}

export function sampleSegment(p: Pick<SampleSourceProject, "raw_type" | "budget_type">): Segment {
  return isRawStaffing({ raw_type: p.raw_type ?? null, budget_type: p.budget_type }) ? "staffing" : "non_staffing";
}

export function sampleBudgetBand(p: Pick<SampleSourceProject, "budget_min" | "budget_max">): string {
  const amount = budgetAmount(p);
  if (amount === null) return "no_budget";
  if (amount < 1_000_000) return "lt_1m";
  if (amount < 5_000_000) return "1m_5m";
  if (amount < 10_000_000) return "5m_10m";
  if (amount < 30_000_000) return "10m_30m";
  return "gte_30m";
}

export function sampleDurationBand(p: Pick<SampleSourceProject, "duration_days">): string {
  const days = p.duration_days;
  if (days === null || !Number.isFinite(days) || days <= 0) return MISSING;
  if (days <= 7) return "1_7d";
  if (days <= 30) return "8_30d";
  if (days <= 90) return "31_90d";
  if (days <= 180) return "91_180d";
  return "gte_181d";
}

export function sampleSnapshot(p: SampleSourceProject): SampleProjectSnapshot {
  const raw_type = p.raw_type ?? p.project_type ?? null;
  const segment = sampleSegment(p);
  const month = sampleMonth(p);
  const budget_band = sampleBudgetBand(p);
  const duration_band = sampleDurationBand(p);
  return {
    id: p.id,
    platform: p.platform,
    registered_at: p.registered_at,
    raw_type,
    budget_type: p.budget_type,
    budget_min: p.budget_min,
    budget_max: p.budget_max,
    duration_days: p.duration_days,
    segment,
    month,
    budget_band,
    duration_band,
    stratum: [month, p.platform, segment, budget_band, duration_band].join("|"),
  };
}

interface QuotaGroup<T> {
  key: string;
  rows: T[];
  quota: number;
  remainder: number;
}

/** largest-remainder 방식으로 각 세부 strata의 비례 quota를 계산한다. */
function proportionalQuotas<T>(groups: Map<string, T[]>, target: number, seed: string): Map<string, number> {
  const total = [...groups.values()].reduce((n, rows) => n + rows.length, 0);
  const actualTarget = Math.min(target, total);
  const qs: QuotaGroup<T>[] = [...groups.entries()].map(([key, rows]) => {
    const exact = total ? (rows.length * actualTarget) / total : 0;
    return { key, rows, quota: Math.floor(exact), remainder: exact - Math.floor(exact) };
  });
  let left = actualTarget - qs.reduce((n, q) => n + q.quota, 0);
  while (left > 0) {
    qs.sort((a, b) => b.remainder - a.remainder || hashKey(seed, a.key).localeCompare(hashKey(seed, b.key)));
    let advanced = false;
    for (const q of qs) {
      if (left <= 0) break;
      if (q.quota < q.rows.length) {
        q.quota++;
        left--;
        advanced = true;
      }
    }
    if (!advanced) break;
  }
  return new Map(qs.map((q) => [q.key, q.quota]));
}

export interface SelectedSample {
  selected: SampleProjectSnapshot[];
  strata: StratifiedSampleFile["strata"];
}

/** 월/플랫폼/고용형태/예산대/기간의 교차 strata 안에서 고정 seed로 추출한다. */
export function selectStratifiedSample(rows: SampleSourceProject[], size: number, seed: string): SelectedSample {
  const primaryGroups = new Map<string, SampleProjectSnapshot[]>();
  for (const row of rows) {
    const snapshot = sampleSnapshot(row);
    const primary = [snapshot.month, snapshot.platform, snapshot.segment].join("|");
    primaryGroups.set(primary, [...(primaryGroups.get(primary) ?? []), snapshot]);
  }
  const primaryQuotas = proportionalQuotas(primaryGroups, size, `${seed}:primary`);
  const selected: SampleProjectSnapshot[] = [];
  const strata: StratifiedSampleFile["strata"] = [];
  for (const [primary, group] of primaryGroups) {
    const primaryQuota = primaryQuotas.get(primary) ?? 0;
    const secondary = new Map<string, SampleProjectSnapshot[]>();
    for (const row of group) secondary.set(row.stratum, [...(secondary.get(row.stratum) ?? []), row]);
    const secondaryQuotas = proportionalQuotas(secondary, primaryQuota, `${seed}:${primary}`);
    for (const [key, subgroup] of secondary) {
      const quota = secondaryQuotas.get(key) ?? 0;
      const sorted = [...subgroup].sort((a, b) => hashKey(seed, a.id).localeCompare(hashKey(seed, b.id)) || a.id.localeCompare(b.id));
      selected.push(...sorted.slice(0, quota));
      strata.push({ key, population_n: subgroup.length, quota, sample_n: quota });
    }
  }
  selected.sort((a, b) => a.id.localeCompare(b.id));
  strata.sort((a, b) => a.key.localeCompare(b.key));
  return { selected, strata };
}

function distribution(population: string[], sample: string[]): DistributionRow[] {
  const p = new Map<string, number>();
  const s = new Map<string, number>();
  for (const k of population) p.set(k, (p.get(k) ?? 0) + 1);
  for (const k of sample) s.set(k, (s.get(k) ?? 0) + 1);
  const total = population.length;
  const sampleTotal = sample.length;
  return [...new Set([...p.keys(), ...s.keys()])]
    .sort()
    .map((key) => {
      const population_n = p.get(key) ?? 0;
      const sample_n = s.get(key) ?? 0;
      const population_share = total ? population_n / total : 0;
      const sample_share = sampleTotal ? sample_n / sampleTotal : 0;
      return { key, population_n, population_share, sample_n, sample_share, abs_share_delta: Math.abs(population_share - sample_share) };
    });
}

function maxDelta(rows: DistributionRow[]): number {
  return rows.reduce((m, r) => Math.max(m, r.abs_share_delta), 0);
}

function amounts(rows: SampleSourceProject[], unit: "fixed" | "monthly"): number[] {
  return rows.filter((r) => r.budget_type === unit).map(budgetAmount).filter((v): v is number => v !== null);
}

export function validateStratifiedSample(
  population: SampleSourceProject[],
  selected: SampleSourceProject[],
  expectedSize: number,
): SampleValidation {
  const populationIds = new Set(population.map((p) => p.id));
  const selectedIds = selected.map((p) => p.id);
  const errors: string[] = [];
  const warnings: string[] = [];
  if (selected.length !== expectedSize) errors.push(`표본 건수 ${selected.length}건 != 요청 ${expectedSize}건`);
  if (new Set(selectedIds).size !== selectedIds.length) errors.push("표본에 중복 project_id가 있습니다");
  const missing = selectedIds.filter((id) => !populationIds.has(id));
  if (missing.length) errors.push(`전체 projects에 없는 표본 project_id ${missing.length}건`);

  const pSnapshots = population.map(sampleSnapshot);
  const sSnapshots = selected.map(sampleSnapshot);
  const platform = distribution(pSnapshots.map((p) => p.platform), sSnapshots.map((p) => p.platform));
  const staffing = distribution(pSnapshots.map((p) => p.segment), sSnapshots.map((p) => p.segment));
  const month = distribution(pSnapshots.map((p) => p.month), sSnapshots.map((p) => p.month));
  const budget_band = distribution(pSnapshots.map((p) => p.budget_band), sSnapshots.map((p) => p.budget_band));
  const duration_band = distribution(pSnapshots.map((p) => p.duration_band), sSnapshots.map((p) => p.duration_band));
  const deltas = {
    platform: maxDelta(platform),
    staffing: maxDelta(staffing),
    month: maxDelta(month),
    budget_band: maxDelta(budget_band),
    duration_band: maxDelta(duration_band),
  };
  const thresholds = { platform: 0.03, staffing: 0.03, month: 0.04, budget_band: 0.05, duration_band: 0.05 };
  for (const [key, threshold] of Object.entries(thresholds) as Array<[keyof typeof deltas, number]>) {
    if (deltas[key] > threshold) errors.push(`${key} 분포 차이 ${(deltas[key] * 100).toFixed(1)}%p > ${(threshold * 100).toFixed(0)}%p`);
  }

  const fixed: BudgetComparison = { unit: "fixed", population: budgetStats(amounts(population, "fixed")), sample: budgetStats(amounts(selected, "fixed")) };
  const monthly: BudgetComparison = { unit: "monthly", population: budgetStats(amounts(population, "monthly")), sample: budgetStats(amounts(selected, "monthly")) };
  if (!selected.length) warnings.push("표본이 비어 있어 예산 비교를 할 수 없습니다");
  return {
    passed: errors.length === 0,
    errors,
    warnings,
    population_n: population.length,
    sample_n: selected.length,
    platform,
    staffing,
    month,
    budget_band,
    duration_band,
    budget: { fixed, monthly },
    max_abs_share_delta: deltas,
  };
}

export function sampleValidationMarkdown(v: SampleValidation): string {
  const pct = (n: number) => `${(n * 100).toFixed(1)}%`;
  const dist = (title: string, rows: DistributionRow[]) => [
    `### ${title}`,
    "",
    "| 구분 | 전체 n | 전체 비율 | 표본 n | 표본 비율 | 차이 |",
    "|---|---:|---:|---:|---:|---:|",
    ...rows.map((r) => `| ${r.key} | ${r.population_n} | ${pct(r.population_share)} | ${r.sample_n} | ${pct(r.sample_share)} | ${pct(r.abs_share_delta)} |`),
    "",
  ];
  const budget = (title: string, b: BudgetComparison) => [
    `### ${title}`,
    "",
    "| 구분 | n | p25 | 중앙값 | p75 |",
    "|---|---:|---:|---:|---:|",
    `| 전체 | ${b.population.n} | ${b.population.p25 ?? "-"} | ${b.population.median ?? "-"} | ${b.population.p75 ?? "-"} |`,
    `| 표본 | ${b.sample.n} | ${b.sample.p25 ?? "-"} | ${b.sample.median ?? "-"} | ${b.sample.p75 ?? "-"} |`,
    "",
  ];
  return [
    "# v3.3 시장 표본 검증",
    "",
    `- 결과: **${v.passed ? "PASS" : "FAIL"}**` ,
    `- 전체: ${v.population_n}건 · 표본: ${v.sample_n}건`,
    "- 예산 분위수는 fixed(총액)와 monthly(월 단가)를 분리했습니다.",
    "",
    ...dist("플랫폼", v.platform),
    ...dist("staffing", v.staffing),
    ...dist("월별 등록 시기", v.month),
    ...dist("예산 구간", v.budget_band),
    ...dist("프로젝트 기간", v.duration_band),
    ...budget("일반 외주 예산 (fixed, 원/총액)", v.budget.fixed),
    ...budget("staffing 예산 (monthly, 원/월)", v.budget.monthly),
    "## 검증 메시지",
    "",
    ...(v.errors.length ? v.errors.map((e) => `- ❌ ${e}`) : ["- 오류 없음"]),
    ...(v.warnings.length ? v.warnings.map((e) => `- ⚠ ${e}`) : []),
    "",
  ].join("\n");
}
