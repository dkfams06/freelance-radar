import { createHash } from "node:crypto";
import { type AnalyzedProject, type MarketProject, type Segment } from "./market-stats";
import { budgetAmount, quantile } from "./stats";
import { percentileScore, type OpportunityScoreReport } from "./opportunity-score";
import type { SampleSourceProject } from "./market-sample";

export const HAIKU_VALIDATION_SAMPLE_SCHEMA = "analyzer-haiku-validation-sample/v1" as const;
export const HAIKU_VALIDATION_ANALYSIS_VERSION = "v3.3-haiku-validation";
export const HAIKU_MODEL = "claude-haiku-4-5-20251001";
export const SONNET_MODEL = "claude-sonnet-5-5";

export interface HaikuValidationSource extends SampleSourceProject {
  project_type: string | null;
  engagement_type: string | null;
  vibe_coding_difficulty: number;
  model?: string;
}

export interface HaikuValidationSnapshot extends SampleSourceProject {
  segment: Segment;
  project_type: string;
  difficulty_band: string;
  budget_band: string;
  duration_band: string;
  month: string;
  stratum: string;
}

export interface HaikuValidationDistributionRow {
  key: string;
  population_n: number;
  population_share: number;
  sample_n: number;
  sample_share: number;
  abs_share_delta: number;
}

export interface HaikuValidationSelectionValidation {
  passed: boolean;
  errors: string[];
  warnings: string[];
  population_n: number;
  sample_n: number;
  platform: HaikuValidationDistributionRow[];
  segment: HaikuValidationDistributionRow[];
  project_type: HaikuValidationDistributionRow[];
  difficulty_band: HaikuValidationDistributionRow[];
  budget_band: HaikuValidationDistributionRow[];
  duration_band: HaikuValidationDistributionRow[];
  max_abs_share_delta: Record<"platform" | "segment" | "project_type" | "difficulty_band" | "budget_band" | "duration_band", number>;
}

export interface HaikuValidationSampleFile {
  schema: typeof HAIKU_VALIDATION_SAMPLE_SCHEMA;
  base_analysis_version: string;
  target_analysis_version: string;
  seed: string;
  requested_size: number;
  population_total: number;
  eligible_population: number;
  selected_project_ids: string[];
  selected: HaikuValidationSnapshot[];
  strata: Array<{ key: string; population_n: number; quota: number; sample_n: number }>;
  validation: HaikuValidationSelectionValidation;
  created_at: string;
}

export interface HaikuValidationRunStats {
  total: number;
  success: number;
  failed: number;
  skipped: number;
}

export interface HaikuValidationComparable {
  project_id: string;
  project_type: string | null;
  engagement_type: string | null;
  reuse_level: string | null;
  complexity_types: string[];
  technology_assets: string[];
  vibe_coding_difficulty: number;
  estimated_hours_midpoint: number | null;
  learning_value: number;
  reusability_value: number;
  market_value: number;
  uncertain_fields: string[];
}

export interface AgreementMetric {
  n: number;
  matches: number;
  rate: number;
}

export interface ArrayAgreementMetric {
  n: number;
  mean_jaccard: number;
  median_jaccard: number;
  p75_jaccard: number;
}

export interface MaeMetric {
  n: number;
  mae: number;
  median_absolute_error: number;
}

export interface HoursAgreementMetric extends MaeMetric {
  median_relative_error: number;
  mean_relative_error: number;
}

export interface RetryMetric {
  total: number;
  error_events: number;
  projects_with_error: number;
  project_error_rate: number;
}

export interface OpportunityTypeComparison {
  project_type: string;
  sonnet_n: number | null;
  haiku_n: number | null;
  sonnet_score: number | null;
  haiku_score: number | null;
  score_delta: number | null;
  sonnet_rank: number | null;
  haiku_rank: number | null;
  rank_change: number | null;
}

export interface ProjectOpportunityComparison {
  sonnet_n: number;
  haiku_n: number;
  common_n: number;
  spearman: number | null;
  top20_k: number;
  top20_overlap: number;
  top20_overlap_rate: number | null;
  sonnet_top20_ids: string[];
  haiku_top20_ids: string[];
}

export type HaikuValidationRecommendation = "haiku_all" | "sonnet" | "haiku_escalation";

export interface HaikuValidationReport {
  schema: "analyzer-haiku-validation/v1";
  generated_at: string;
  base_analysis_version: string;
  haiku_analysis_version: string;
  sample: { file: string; seed: string; total: number; population_total: number; validation: HaikuValidationSelectionValidation };
  agreement: {
    matched_n: number;
    project_type: AgreementMetric;
    engagement_type: AgreementMetric;
    reuse_level_4: AgreementMetric;
    reuse_level_3: AgreementMetric;
    complexity_types: ArrayAgreementMetric;
    technology_assets: ArrayAgreementMetric;
    vibe_coding_difficulty: MaeMetric;
    estimated_hours_midpoint: HoursAgreementMetric;
    learning_value: MaeMetric;
    reusability_value: MaeMetric;
    market_value: MaeMetric;
    uncertain_fields: { sonnet_rate: number; haiku_rate: number; either_rate: number; both_rate: number };
  };
  quality: {
    sonnet_run: HaikuValidationRunStats;
    haiku_run: HaikuValidationRunStats;
    sonnet_retry: RetryMetric;
    haiku_retry: RetryMetric;
    sonnet_schema_failure_rate: number;
    haiku_schema_failure_rate: number;
  };
  opportunity_score: {
    type_comparison: OpportunityTypeComparison[];
    project_ranking: ProjectOpportunityComparison;
    project_score_definition: string;
  };
  thresholds: {
    project_type_rate: number;
    engagement_type_rate: number;
    reuse_level_3_rate: number;
    vibe_difficulty_mae: number;
    value_mae: number;
    hours_median_relative_error: number;
  };
  recommendation: { choice: HaikuValidationRecommendation; label: string; reasons: string[] };
  notes: string[];
}

const round = (n: number | null, digits = 4): number | null => n === null || !Number.isFinite(n) ? null : Math.round(n * 10 ** digits) / 10 ** digits;
const mean = (xs: number[]): number => xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0;
const median = (xs: number[]): number => quantile([...xs].sort((a, b) => a - b), 0.5) ?? 0;
const p75 = (xs: number[]): number => quantile([...xs].sort((a, b) => a - b), 0.75) ?? 0;

function hashKey(seed: string, key: string): string {
  return createHash("sha256").update(`${seed}\0${key}`).digest("hex");
}

function month(row: Pick<HaikuValidationSource, "registered_at">): string {
  return row.registered_at ? new Date(new Date(row.registered_at).getTime() + 9 * 3_600_000).toISOString().slice(0, 7) : "(missing)";
}

function segment(row: Pick<HaikuValidationSource, "engagement_type">): Segment {
  return row.engagement_type === "staffing" ? "staffing" : "non_staffing";
}

function difficultyBand(value: number): string {
  if (value <= 25) return "0_25";
  if (value <= 50) return "26_50";
  if (value <= 75) return "51_75";
  return "76_100";
}

function budgetBand(row: HaikuValidationSource): string {
  const amount = budgetAmount(row);
  if (amount === null) return "no_budget";
  if (amount < 1_000_000) return "lt_1m";
  if (amount < 5_000_000) return "1m_5m";
  if (amount < 10_000_000) return "5m_10m";
  if (amount < 30_000_000) return "10m_30m";
  return "gte_30m";
}

function durationBand(value: number | null): string {
  if (value === null || !Number.isFinite(value) || value <= 0) return "(missing)";
  if (value <= 7) return "1_7d";
  if (value <= 30) return "8_30d";
  if (value <= 90) return "31_90d";
  if (value <= 180) return "91_180d";
  return "gte_181d";
}

function snapshot(row: HaikuValidationSource): HaikuValidationSnapshot {
  const s = segment(row);
  const ptype = row.project_type ?? "(none)";
  const d = difficultyBand(row.vibe_coding_difficulty);
  const b = budgetBand(row);
  const duration = durationBand(row.duration_days);
  const m = month(row);
  return {
    id: row.id,
    platform: row.platform,
    registered_at: row.registered_at,
    raw_type: row.raw_type ?? null,
    project_type: ptype,
    budget_type: row.budget_type,
    budget_min: row.budget_min,
    budget_max: row.budget_max,
    duration_days: row.duration_days,
    segment: s,
    difficulty_band: d,
    budget_band: b,
    duration_band: duration,
    month: m,
    stratum: [m, row.platform, s, ptype, d, b, duration].join("|"),
  };
}

interface QuotaGroup<T> { key: string; rows: T[]; quota: number; remainder: number }

function quotas<T>(groups: Map<string, T[]>, target: number, seed: string): Map<string, number> {
  const total = [...groups.values()].reduce((n, rows) => n + rows.length, 0);
  const actual = Math.min(target, total);
  const qs: QuotaGroup<T>[] = [...groups.entries()].map(([key, rows]) => {
    const exact = total ? rows.length * actual / total : 0;
    return { key, rows, quota: Math.floor(exact), remainder: exact - Math.floor(exact) };
  });
  let left = actual - qs.reduce((n, q) => n + q.quota, 0);
  while (left > 0) {
    qs.sort((a, b) => b.remainder - a.remainder || hashKey(seed, a.key).localeCompare(hashKey(seed, b.key)));
    let advanced = false;
    for (const q of qs) {
      if (left <= 0) break;
      if (q.quota < q.rows.length) { q.quota++; left--; advanced = true; }
    }
    if (!advanced) break;
  }
  return new Map(qs.map((q) => [q.key, q.quota]));
}

export function selectHaikuValidationSample(rows: HaikuValidationSource[], size: number, seed: string): { selected: HaikuValidationSnapshot[]; strata: HaikuValidationSampleFile["strata"] } {
  const groups = new Map<string, HaikuValidationSnapshot[]>();
  for (const row of rows) {
    const s = snapshot(row);
    groups.set(s.stratum, [...(groups.get(s.stratum) ?? []), s]);
  }
  const q = quotas(groups, size, seed);
  const selected: HaikuValidationSnapshot[] = [];
  const strata: HaikuValidationSampleFile["strata"] = [];
  for (const [key, group] of groups) {
    const quota = q.get(key) ?? 0;
    const sorted = [...group].sort((a, b) => hashKey(seed, a.id).localeCompare(hashKey(seed, b.id)) || a.id.localeCompare(b.id));
    selected.push(...sorted.slice(0, quota));
    strata.push({ key, population_n: group.length, quota, sample_n: quota });
  }
  selected.sort((a, b) => a.id.localeCompare(b.id));
  strata.sort((a, b) => a.key.localeCompare(b.key));
  return { selected, strata };
}

function distribution<T>(population: T[], sample: T[], keyOf: (row: T) => string): HaikuValidationDistributionRow[] {
  const p = new Map<string, number>();
  const s = new Map<string, number>();
  for (const row of population) { const key = keyOf(row); p.set(key, (p.get(key) ?? 0) + 1); }
  for (const row of sample) { const key = keyOf(row); s.set(key, (s.get(key) ?? 0) + 1); }
  return [...new Set([...p.keys(), ...s.keys()])].sort().map((key) => {
    const pn = p.get(key) ?? 0;
    const sn = s.get(key) ?? 0;
    return { key, population_n: pn, population_share: population.length ? pn / population.length : 0, sample_n: sn, sample_share: sample.length ? sn / sample.length : 0, abs_share_delta: Math.abs((population.length ? pn / population.length : 0) - (sample.length ? sn / sample.length : 0)) };
  });
}

function maxDelta(rows: HaikuValidationDistributionRow[]): number {
  return rows.reduce((max, row) => Math.max(max, row.abs_share_delta), 0);
}

export function validateHaikuValidationSample(population: HaikuValidationSnapshot[], selected: HaikuValidationSnapshot[], expectedSize: number): HaikuValidationSelectionValidation {
  const ids = selected.map((row) => row.id);
  const errors: string[] = [];
  const warnings: string[] = [];
  if (selected.length !== expectedSize) errors.push(`표본 건수 ${selected.length}건 != 요청 ${expectedSize}건`);
  if (new Set(ids).size !== ids.length) errors.push("표본에 중복 project_id가 있습니다");
  const rows = {
    platform: distribution(population, selected, (row) => row.platform),
    segment: distribution(population, selected, (row) => row.segment),
    project_type: distribution(population, selected, (row) => row.project_type),
    difficulty_band: distribution(population, selected, (row) => row.difficulty_band),
    budget_band: distribution(population, selected, (row) => row.budget_band),
    duration_band: distribution(population, selected, (row) => row.duration_band),
  };
  const max_abs_share_delta = Object.fromEntries(Object.entries(rows).map(([key, value]) => [key, maxDelta(value)])) as HaikuValidationSelectionValidation["max_abs_share_delta"];
  const thresholds = { platform: 0.08, segment: 0.08, project_type: 0.1, difficulty_band: 0.08, budget_band: 0.08, duration_band: 0.08 };
  for (const [key, threshold] of Object.entries(thresholds) as Array<[keyof typeof thresholds, number]>) {
    if (max_abs_share_delta[key] > threshold) warnings.push(`${key} 최대 분포 차이 ${(max_abs_share_delta[key] * 100).toFixed(1)}%p`);
  }
  return { passed: errors.length === 0, errors, warnings, population_n: population.length, sample_n: selected.length, ...rows, max_abs_share_delta };
}

function rawFields(row: AnalyzedProject): { complexity_types: string[]; uncertain_fields: string[] } {
  const raw = (row.raw_analysis ?? {}) as { complexity_types?: unknown; uncertain_fields?: unknown };
  return {
    complexity_types: Array.isArray(raw.complexity_types) ? raw.complexity_types.filter((value): value is string => typeof value === "string") : [],
    uncertain_fields: Array.isArray(raw.uncertain_fields) ? raw.uncertain_fields.filter((value): value is string => typeof value === "string") : [],
  };
}

function midpoint(row: AnalyzedProject): number | null {
  return row.estimated_hours_min > 0 && row.estimated_hours_max >= row.estimated_hours_min ? (row.estimated_hours_min + row.estimated_hours_max) / 2 : null;
}

export function toHaikuValidationComparable(row: AnalyzedProject): HaikuValidationComparable {
  const raw = rawFields(row);
  return {
    project_id: row.project_id,
    project_type: row.project_type,
    engagement_type: row.engagement_type,
    reuse_level: row.reuse_level,
    complexity_types: raw.complexity_types,
    technology_assets: row.technology_assets ?? [],
    vibe_coding_difficulty: row.vibe_coding_difficulty,
    estimated_hours_midpoint: midpoint(row),
    learning_value: row.learning_value,
    reusability_value: row.reusability_value,
    market_value: row.market_value,
    uncertain_fields: raw.uncertain_fields,
  };
}

function jaccard(a: string[], b: string[]): number {
  const as = new Set(a); const bs = new Set(b);
  if (as.size === 0 && bs.size === 0) return 1;
  let intersection = 0;
  for (const value of as) if (bs.has(value)) intersection++;
  return (as.size + bs.size - intersection) ? intersection / (as.size + bs.size - intersection) : 0;
}

function agreement<T>(a: T[], b: T[]): AgreementMetric {
  const n = Math.min(a.length, b.length);
  const matches = a.slice(0, n).reduce((count, value, index) => count + (value === b[index] ? 1 : 0), 0);
  return { n, matches, rate: n ? matches / n : 0 };
}

function arrayAgreement(a: string[][], b: string[][]): ArrayAgreementMetric {
  const values = a.slice(0, Math.min(a.length, b.length)).map((value, index) => jaccard(value, b[index] ?? []));
  return { n: values.length, mean_jaccard: mean(values), median_jaccard: median(values), p75_jaccard: p75(values) };
}

function mae(a: number[], b: number[]): MaeMetric {
  const values = a.slice(0, Math.min(a.length, b.length)).map((value, index) => Math.abs(value - (b[index] ?? value)));
  return { n: values.length, mae: mean(values), median_absolute_error: median(values) };
}

function hoursAgreement(a: Array<number | null>, b: Array<number | null>): HoursAgreementMetric {
  const abs: number[] = []; const relative: number[] = [];
  for (let i = 0; i < Math.min(a.length, b.length); i++) {
    const av = a[i] ?? null; const bv = b[i] ?? null;
    if (av === null || bv === null || av <= 0) continue;
    abs.push(Math.abs(av - bv));
    relative.push(Math.abs(av - bv) / av);
  }
  return { n: abs.length, mae: mean(abs), median_absolute_error: median(abs), median_relative_error: median(relative), mean_relative_error: mean(relative) };
}

function reuse3(value: string | null): string | null {
  return value === "low" || value === "one_off" ? "low_or_one_off" : value;
}

function uncertaintyRate(rows: HaikuValidationComparable[]): number {
  return rows.length ? rows.filter((row) => row.uncertain_fields.length > 0).length / rows.length : 0;
}

function errorMetric(total: number, errors: Array<{ project_id: string }>): RetryMetric {
  const projects = new Set(errors.map((row) => row.project_id));
  return { total, error_events: errors.length, projects_with_error: projects.size, project_error_rate: total ? projects.size / total : 0 };
}

interface RankedScore { project_id: string; score: number }

function rankScores(rows: RankedScore[]): RankedScore[] {
  return [...rows].sort((a, b) => b.score - a.score || a.project_id.localeCompare(b.project_id));
}

function averageRanks(rows: RankedScore[]): Map<string, number> {
  const sorted = rankScores(rows); const out = new Map<string, number>();
  for (let i = 0; i < sorted.length;) {
    let j = i + 1;
    while (j < sorted.length && sorted[j]!.score === sorted[i]!.score) j++;
    const rank = (i + 1 + j) / 2;
    for (let k = i; k < j; k++) out.set(sorted[k]!.project_id, rank);
    i = j;
  }
  return out;
}

function spearman(a: RankedScore[], b: RankedScore[]): number | null {
  const common = new Set(a.map((row) => row.project_id).filter((id) => b.some((row) => row.project_id === id)));
  if (common.size < 2) return null;
  const ar = averageRanks(a.filter((row) => common.has(row.project_id)));
  const br = averageRanks(b.filter((row) => common.has(row.project_id)));
  const xs = [...common].map((id) => ar.get(id) ?? 0); const ys = [...common].map((id) => br.get(id) ?? 0);
  const xm = mean(xs); const ym = mean(ys);
  const numerator = xs.reduce((sum, x, i) => sum + (x - xm) * (ys[i]! - ym), 0);
  const denom = Math.sqrt(xs.reduce((sum, x) => sum + (x - xm) ** 2, 0) * ys.reduce((sum, y) => sum + (y - ym) ** 2, 0));
  return denom ? numerator / denom : 1;
}

function projectOpportunityScores(rows: AnalyzedProject[]): RankedScore[] {
  const typeCounts = new Map<string, number>();
  for (const row of rows) typeCounts.set(row.project_type ?? "(none)", (typeCounts.get(row.project_type ?? "(none)") ?? 0) + 1);
  const raw = rows.map((row) => {
    const budget = budgetAmount(row);
    const hours = midpoint(row);
    return {
      row,
      metrics: {
        frequency: typeCounts.get(row.project_type ?? "(none)") ?? 0,
        budget_per_hour: budget !== null && hours !== null && hours > 0 ? budget / hours : null,
        ai_ease: 100 - row.vibe_coding_difficulty,
        reusability: row.reusability_value,
        learning: row.learning_value,
        market_value: row.market_value,
      },
    };
  });
  const metricNames = ["frequency", "budget_per_hour", "ai_ease", "reusability", "learning", "market_value"] as const;
  const bounds = Object.fromEntries(metricNames.map((name) => [name, { p10: quantile(raw.map((x) => x.metrics[name]).filter((v): v is number => v !== null).sort((a, b) => a - b), 0.1), p90: quantile(raw.map((x) => x.metrics[name]).filter((v): v is number => v !== null).sort((a, b) => a - b), 0.9) }])) as Record<(typeof metricNames)[number], { p10: number | null; p90: number | null }>;
  const weights = { frequency: 0.2, budget_per_hour: 0.25, ai_ease: 0.2, reusability: 0.15, learning: 0.1, market_value: 0.1 } as const;
  return raw.flatMap(({ row, metrics }) => {
    if (metricNames.some((name) => metrics[name] === null)) return [];
    const score = metricNames.reduce((sum, name) => sum + (percentileScore(metrics[name], bounds[name]) ?? 0) * weights[name], 0);
    return [{ project_id: row.project_id, score }];
  });
}

function projectRanking(sonnetRows: AnalyzedProject[], haikuRows: AnalyzedProject[]): ProjectOpportunityComparison {
  const sonnet = rankScores(projectOpportunityScores(sonnetRows));
  const haiku = rankScores(projectOpportunityScores(haikuRows));
  const k = Math.min(20, sonnet.length, haiku.length);
  const sonnetTop = sonnet.slice(0, k).map((row) => row.project_id);
  const haikuTop = haiku.slice(0, k).map((row) => row.project_id);
  const overlap = sonnetTop.filter((id) => haikuTop.includes(id)).length;
  return { sonnet_n: sonnet.length, haiku_n: haiku.length, common_n: new Set([...sonnet.map((row) => row.project_id), ...haiku.map((row) => row.project_id)]).size, spearman: round(spearman(sonnet, haiku)), top20_k: k, top20_overlap: overlap, top20_overlap_rate: k ? overlap / k : null, sonnet_top20_ids: sonnetTop, haiku_top20_ids: haikuTop };
}

function typeScoreComparison(sonnet: OpportunityScoreReport, haiku: OpportunityScoreReport): OpportunityTypeComparison[] {
  const get = (report: OpportunityScoreReport) => new Map(report.modes.exclude_outliers.non_staffing.types.map((row) => [row.key, row]));
  const s = get(sonnet); const h = get(haiku);
  const keys = [...new Set([...s.keys(), ...h.keys()])].filter((key) => key !== "(none)").sort();
  return keys.map((project_type) => {
    const sr = s.get(project_type); const hr = h.get(project_type);
    const ss = sr?.scores.balanced ?? null; const hs = hr?.scores.balanced ?? null;
    return { project_type, sonnet_n: sr?.n ?? null, haiku_n: hr?.n ?? null, sonnet_score: round(ss, 2), haiku_score: round(hs, 2), score_delta: ss !== null && hs !== null ? round(hs - ss, 2) : null, sonnet_rank: sr?.rank.balanced ?? null, haiku_rank: hr?.rank.balanced ?? null, rank_change: sr?.rank.balanced !== null && sr?.rank.balanced !== undefined && hr?.rank.balanced !== null && hr?.rank.balanced !== undefined ? sr.rank.balanced - hr.rank.balanced : null };
  });
}

function runStats(total: number, rows: AnalyzedProject[], stats: HaikuValidationRunStats): HaikuValidationRunStats {
  return { total, success: stats.success || rows.length, failed: stats.failed || Math.max(0, total - rows.length), skipped: stats.skipped };
}

export function buildHaikuValidationReport(opts: {
  sampleFile: string;
  seed: string;
  populationTotal: number;
  selectionValidation: HaikuValidationSelectionValidation;
  sonnetRows: AnalyzedProject[];
  haikuRows: AnalyzedProject[];
  sonnetErrors: Array<{ project_id: string }>;
  haikuErrors: Array<{ project_id: string }>;
  sonnetRun: HaikuValidationRunStats;
  haikuRun: HaikuValidationRunStats;
  sonnetOpportunity: OpportunityScoreReport;
  haikuOpportunity: OpportunityScoreReport;
  baseAnalysisVersion: string;
  haikuAnalysisVersion: string;
  generatedAt?: Date;
}): HaikuValidationReport {
  const sonnet = opts.sonnetRows.map(toHaikuValidationComparable);
  const haiku = opts.haikuRows.map(toHaikuValidationComparable);
  const hById = new Map(haiku.map((row) => [row.project_id, row]));
  const pairs = sonnet.flatMap((row) => { const other = hById.get(row.project_id); return other ? [{ sonnet: row, haiku: other }] : []; });
  const s = pairs.map((pair) => pair.sonnet); const h = pairs.map((pair) => pair.haiku);
  const projectType = agreement(s.map((row) => row.project_type), h.map((row) => row.project_type));
  const engagement = agreement(s.map((row) => row.engagement_type), h.map((row) => row.engagement_type));
  const reuse4 = agreement(s.map((row) => row.reuse_level), h.map((row) => row.reuse_level));
  const reuseLevel3 = agreement(s.map((row) => reuse3(row.reuse_level)), h.map((row) => reuse3(row.reuse_level)));
  const difficulty = mae(s.map((row) => row.vibe_coding_difficulty), h.map((row) => row.vibe_coding_difficulty));
  const hours = hoursAgreement(s.map((row) => row.estimated_hours_midpoint), h.map((row) => row.estimated_hours_midpoint));
  const learning = mae(s.map((row) => row.learning_value), h.map((row) => row.learning_value));
  const reusability = mae(s.map((row) => row.reusability_value), h.map((row) => row.reusability_value));
  const market = mae(s.map((row) => row.market_value), h.map((row) => row.market_value));
  const thresholds = { project_type_rate: 0.9, engagement_type_rate: 0.95, reuse_level_3_rate: 0.8, vibe_difficulty_mae: 10, value_mae: 10, hours_median_relative_error: 0.25 };
  const reasons: string[] = [];
  const metricPass = projectType.rate >= thresholds.project_type_rate && engagement.rate >= thresholds.engagement_type_rate && reuseLevel3.rate >= thresholds.reuse_level_3_rate && difficulty.mae <= thresholds.vibe_difficulty_mae && learning.mae <= thresholds.value_mae && reusability.mae <= thresholds.value_mae && market.mae <= thresholds.value_mae && hours.median_relative_error <= thresholds.hours_median_relative_error;
  if (metricPass) reasons.push("제시된 Haiku 전체 사용 기준을 모두 충족");
  else {
    if (projectType.rate < thresholds.project_type_rate) reasons.push(`project_type 일치율 ${(projectType.rate * 100).toFixed(1)}% < 90%`);
    if (engagement.rate < thresholds.engagement_type_rate) reasons.push(`engagement_type 일치율 ${(engagement.rate * 100).toFixed(1)}% < 95%`);
    if (reuseLevel3.rate < thresholds.reuse_level_3_rate) reasons.push(`reuse 3단계 일치율 ${(reuseLevel3.rate * 100).toFixed(1)}% < 80%`);
    if (difficulty.mae > thresholds.vibe_difficulty_mae) reasons.push(`vibe difficulty MAE ${difficulty.mae.toFixed(1)} > 10`);
    if (learning.mae > thresholds.value_mae || reusability.mae > thresholds.value_mae || market.mae > thresholds.value_mae) reasons.push("value score MAE 중 하나 이상 10 초과");
    if (hours.median_relative_error > thresholds.hours_median_relative_error) reasons.push(`estimated-hours 중앙 상대오차 ${(hours.median_relative_error * 100).toFixed(1)}% > 25%`);
  }
  const ranking = projectRanking(opts.sonnetRows, opts.haikuRows);
  const rankingStable = ranking.spearman !== null && ranking.spearman >= 0.8 && (ranking.top20_overlap_rate ?? 0) >= 0.7;
  const choice: HaikuValidationRecommendation = metricPass && rankingStable ? "haiku_all" : metricPass || rankingStable ? "haiku_escalation" : "sonnet";
  const label = choice === "haiku_all" ? "Haiku 전체 사용 권장" : choice === "haiku_escalation" ? "Haiku 1차 + 애매한 건만 Sonnet escalation" : "Sonnet 유지 권장";
  if (choice === "haiku_escalation") reasons.push("분류 품질 또는 opportunity 순위 중 하나만 안정적이므로 애매한 건을 Sonnet으로 올리는 전략이 안전");
  if (choice === "sonnet") reasons.push("100건 검증에서 전체 Haiku 전환을 뒷받침할 일관성이 부족");
  return {
    schema: "analyzer-haiku-validation/v1",
    generated_at: (opts.generatedAt ?? new Date()).toISOString(),
    base_analysis_version: opts.baseAnalysisVersion,
    haiku_analysis_version: opts.haikuAnalysisVersion,
    sample: { file: opts.sampleFile, seed: opts.seed, total: opts.selectionValidation.sample_n, population_total: opts.populationTotal, validation: opts.selectionValidation },
    agreement: {
      matched_n: pairs.length,
      project_type: projectType,
      engagement_type: engagement,
      reuse_level_4: reuse4,
      reuse_level_3: reuseLevel3,
      complexity_types: arrayAgreement(s.map((row) => row.complexity_types), h.map((row) => row.complexity_types)),
      technology_assets: arrayAgreement(s.map((row) => row.technology_assets), h.map((row) => row.technology_assets)),
      vibe_coding_difficulty: difficulty,
      estimated_hours_midpoint: hours,
      learning_value: learning,
      reusability_value: reusability,
      market_value: market,
      uncertain_fields: { sonnet_rate: uncertaintyRate(s), haiku_rate: uncertaintyRate(h), either_rate: s.length ? s.filter((row, index) => row.uncertain_fields.length > 0 || h[index]!.uncertain_fields.length > 0).length / s.length : 0, both_rate: s.length ? s.filter((row, index) => row.uncertain_fields.length > 0 && h[index]!.uncertain_fields.length > 0).length / s.length : 0 },
    },
    quality: {
      sonnet_run: runStats(opts.selectionValidation.sample_n, opts.sonnetRows, opts.sonnetRun),
      haiku_run: runStats(opts.selectionValidation.sample_n, opts.haikuRows, opts.haikuRun),
      sonnet_retry: errorMetric(opts.selectionValidation.sample_n, opts.sonnetErrors),
      haiku_retry: errorMetric(opts.selectionValidation.sample_n, opts.haikuErrors),
      sonnet_schema_failure_rate: opts.selectionValidation.sample_n ? Math.max(0, opts.selectionValidation.sample_n - opts.sonnetRows.length) / opts.selectionValidation.sample_n : 0,
      haiku_schema_failure_rate: opts.selectionValidation.sample_n ? Math.max(0, opts.selectionValidation.sample_n - opts.haikuRows.length) / opts.selectionValidation.sample_n : 0,
    },
    opportunity_score: { type_comparison: typeScoreComparison(opts.sonnetOpportunity, opts.haikuOpportunity), project_ranking: ranking, project_score_definition: "표본 내 type frequency·budget_per_hour·ai_ease·reusability·learning·market_value를 v0.1 balanced 배점(20/25/20/15/10/10)과 p10~p90 정규화로 계산한 진단용 프로젝트 순위. 기존 type-level opportunity-score와 별도이며 최종 점수가 아님." },
    thresholds,
    recommendation: { choice, label, reasons },
    notes: [
      "Sonnet 결과는 정답 라벨이 아니라 동일 입력에 대한 비교 기준이다.",
      "두 모델은 동일한 v3.3 system prompt, user input, JSON schema를 사용하고 모델만 달리했다.",
      "Haiku 결과는 별도 analysis_version으로 저장해 기존 v3.3 Sonnet 결과를 덮어쓰지 않는다.",
      "retry 비율은 해당 sample project에서 analysis_errors가 한 번 이상 기록된 비율이다.",
      "기존 production opportunity-score 공식은 project_type 집계용이므로, Spearman/TOP20은 별도 프로젝트 단위 진단 proxy다.",
      "이 결과만으로 전체 5,287건 실행을 승인하지 않는다.",
    ],
  };
}

function pct(value: number | null): string { return value === null ? "-" : `${(value * 100).toFixed(1)}%`; }
function num(value: number | null, digits = 2): string { return value === null ? "-" : value.toFixed(digits); }

export function renderHaikuValidationSelection(file: HaikuValidationSampleFile): string {
  const dist = (title: string, rows: HaikuValidationDistributionRow[]) => [
    `### ${title}`, "", "| 구분 | 모집단 n | 모집단 비율 | 표본 n | 표본 비율 | 차이 |", "|---|---:|---:|---:|---:|---:|",
    ...rows.map((row) => `| ${row.key} | ${row.population_n} | ${pct(row.population_share)} | ${row.sample_n} | ${pct(row.sample_share)} | ${pct(row.abs_share_delta)} |`), "",
  ];
  return ["# Haiku 검증 표본 100건", "", `- seed: \`${file.seed}\``, `- 모집단: Sonnet ${file.base_analysis_version} 성공 분석 ${file.population_total}건`, `- 표본: ${file.selected_project_ids.length}건`, `- 검증: **${file.validation.passed ? "PASS" : "FAIL"}**`, "", ...dist("engagement segment", file.validation.segment), ...dist("project_type", file.validation.project_type), ...dist("난이도 구간", file.validation.difficulty_band), ...dist("예산 구간", file.validation.budget_band), ...dist("플랫폼", file.validation.platform), ...dist("기간", file.validation.duration_band), "## 경고", "", ...(file.validation.warnings.length ? file.validation.warnings.map((warning) => `- ${warning}`) : ["- 없음"]), ""].join("\n");
}

export function renderHaikuValidationReport(report: HaikuValidationReport): string {
  const a = report.agreement; const q = report.quality; const r = report.opportunity_score.project_ranking;
  const agreementRows: Array<[string, string]> = [
    ["project_type 일치율", pct(a.project_type.rate)], ["engagement_type 일치율", pct(a.engagement_type.rate)], ["reuse 4단계 일치율", pct(a.reuse_level_4.rate)], ["reuse 3단계 일치율", pct(a.reuse_level_3.rate)], ["complexity_types 평균 Jaccard", pct(a.complexity_types.mean_jaccard)], ["technology_assets 평균 Jaccard", pct(a.technology_assets.mean_jaccard)], ["vibe_coding_difficulty MAE", num(a.vibe_coding_difficulty.mae)], ["estimated-hours 중앙 상대오차", pct(a.estimated_hours_midpoint.median_relative_error)], ["learning_value MAE", num(a.learning_value.mae)], ["reusability_value MAE", num(a.reusability_value.mae)], ["market_value MAE", num(a.market_value.mae)], ["uncertain_fields Sonnet / Haiku", `${pct(a.uncertain_fields.sonnet_rate)} / ${pct(a.uncertain_fields.haiku_rate)}`],
  ];
  const lines = ["# Haiku 4.5 v3.3 100건 검증", "", `- 기준: ${report.base_analysis_version} Sonnet`, `- 비교: ${report.haiku_analysis_version} Haiku`, `- 비교 표본: ${a.matched_n}/${report.sample.total}건`, "- Sonnet은 정답이 아니라 일관성 비교 기준입니다.", "", "## 1. 일관성 지표", "", "| 지표 | 결과 |", "|---|---:|", ...agreementRows.map(([name, value]) => `| ${name} | ${value} |`), "", "## 2. 실행 품질", "", "| 항목 | Sonnet | Haiku |", "|---|---:|---:|", `| 성공 | ${q.sonnet_run.success} | ${q.haiku_run.success} |`, `| 최종 실패/schema failure | ${q.sonnet_run.failed} (${pct(q.sonnet_schema_failure_rate)}) | ${q.haiku_run.failed} (${pct(q.haiku_schema_failure_rate)}) |`, `| error/retry 발생 프로젝트 | ${q.sonnet_retry.projects_with_error} (${pct(q.sonnet_retry.project_error_rate)}) | ${q.haiku_retry.projects_with_error} (${pct(q.haiku_retry.project_error_rate)}) |`, `| error events | ${q.sonnet_retry.error_events} | ${q.haiku_retry.error_events} |`, "", "## 3. 기설계 기준", "", "| 기준 | 통과 기준 | 실제 | 통과 |", "|---|---:|---:|---|", `| project_type | ≥90% | ${pct(a.project_type.rate)} | ${a.project_type.rate >= report.thresholds.project_type_rate ? "PASS" : "FAIL"} |`, `| engagement_type | ≥95% | ${pct(a.engagement_type.rate)} | ${a.engagement_type.rate >= report.thresholds.engagement_type_rate ? "PASS" : "FAIL"} |`, `| reuse 3단계 | ≥80% | ${pct(a.reuse_level_3.rate)} | ${a.reuse_level_3.rate >= report.thresholds.reuse_level_3_rate ? "PASS" : "FAIL"} |`, `| vibe difficulty MAE | ≤10 | ${num(a.vibe_coding_difficulty.mae)} | ${a.vibe_coding_difficulty.mae <= report.thresholds.vibe_difficulty_mae ? "PASS" : "FAIL"} |`, `| learning/reuse/market MAE | ≤10 | ${num(Math.max(a.learning_value.mae, a.reusability_value.mae, a.market_value.mae))} | ${Math.max(a.learning_value.mae, a.reusability_value.mae, a.market_value.mae) <= report.thresholds.value_mae ? "PASS" : "FAIL"} |`, `| hours 중앙 상대오차 | ≤25% | ${pct(a.estimated_hours_midpoint.median_relative_error)} | ${a.estimated_hours_midpoint.median_relative_error <= report.thresholds.hours_median_relative_error ? "PASS" : "FAIL"} |`, "", "## 4. Opportunity-score 변화", "", "### 유형 집계", "", "| project_type | Sonnet n | Haiku n | Sonnet score | Haiku score | Δ | Sonnet rank | Haiku rank |", "|---|---:|---:|---:|---:|---:|---:|---:|", ...report.opportunity_score.type_comparison.map((row) => `| ${row.project_type} | ${row.sonnet_n ?? "-"} | ${row.haiku_n ?? "-"} | ${num(row.sonnet_score)} | ${num(row.haiku_score)} | ${num(row.score_delta)} | ${row.sonnet_rank ?? "-"} | ${row.haiku_rank ?? "-"} |`), "", "### 프로젝트 단위 순위 proxy", "", `- Spearman correlation: **${num(r.spearman, 3)}**`, `- TOP ${r.top20_k} overlap: **${r.top20_overlap}/${r.top20_k} (${pct(r.top20_overlap_rate)})**`, `- Sonnet scored: ${r.sonnet_n}건 · Haiku scored: ${r.haiku_n}건`, `- ${report.opportunity_score.project_score_definition}`, "", "## 5. 추천", "", `**${report.recommendation.label}**`, "", ...report.recommendation.reasons.map((reason) => `- ${reason}`), "", "## 주의", "", ...report.notes.map((note) => `- ${note}`), ""];
  return lines.join("\n");
}
