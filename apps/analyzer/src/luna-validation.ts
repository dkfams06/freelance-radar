import { createHash } from "node:crypto";
import {
  buildProjectInput,
  type AnalysisSourceProject,
  type AnalyzedProject,
  type ProjectAnalysis,
} from "@fr/analysis";
import type { SavedAnalysisRow } from "./store";

export const LUNA_MODEL = "gpt-5.6-luna";
export const LUNA_VALIDATION_SAMPLE_SCHEMA = "analyzer-luna-validation/v1" as const;
export const LUNA_VALIDATION_REPORT_SCHEMA = "analyzer-luna-validation-report/v1" as const;
export const LUNA_VALIDATION_SEED = "luna-validation-v3.3-10-v1";

export interface LunaValidationSampleFile {
  schema: typeof LUNA_VALIDATION_SAMPLE_SCHEMA;
  analysis_version: "v3.3";
  haiku_model: string;
  luna_model: string;
  seed: string;
  requested_size: number;
  eligible_population: number;
  selected_project_ids: string[];
  selected: Array<{
    project_id: string;
    project_type: string | null;
    engagement_type: string | null;
    difficulty: number;
    budget: number | null;
    haiku_input_hash: string | null;
    selection_reasons: string[];
  }>;
  created_at: string;
}

type Entry = {
  project: AnalysisSourceProject;
  analyzed: AnalyzedProject;
  saved: SavedAnalysisRow;
  analysis: ProjectAnalysis;
};

function stableRank(id: string, seed: string): string {
  return createHash("sha256").update(`${seed}:${id}`).digest("hex");
}

function budgetOf(project: Pick<AnalysisSourceProject, "budget_min" | "budget_max">): number | null {
  return project.budget_max ?? project.budget_min;
}

function quantile(values: number[], p: number): number | null {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const index = (sorted.length - 1) * p;
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  if (lower === upper) return sorted[lower] ?? null;
  return (sorted[lower]! + (sorted[upper]! - sorted[lower]!) * (index - lower));
}

export function selectLunaValidationSample(
  entries: Entry[],
  opts: { seed?: string; size?: number; haikuModel: string; lunaModel?: string } = { haikuModel: "claude-haiku-4-5-20251001" },
): LunaValidationSampleFile {
  const seed = opts.seed ?? LUNA_VALIDATION_SEED;
  const size = opts.size ?? 10;
  const ranked = [...entries].sort((a, b) => stableRank(a.project.id, seed).localeCompare(stableRank(b.project.id, seed)));
  const difficulties = ranked.map((e) => e.analysis.vibe_coding_difficulty);
  const budgets = ranked.map((e) => budgetOf(e.project)).filter((x): x is number => x !== null);
  const easyCut = quantile(difficulties, 0.33) ?? 35;
  const hardCut = quantile(difficulties, 0.67) ?? 65;
  const lowBudgetCut = quantile(budgets, 0.33) ?? 0;
  const highBudgetCut = quantile(budgets, 0.67) ?? Number.POSITIVE_INFINITY;
  const selected = new Map<string, string[]>();

  const take = (predicate: (entry: Entry) => boolean, reason: string) => {
    const candidate = ranked.find((entry) => !selected.has(entry.project.id) && predicate(entry));
    if (candidate) selected.set(candidate.project.id, [...(selected.get(candidate.project.id) ?? []), reason]);
  };

  for (const type of ["business_management", "platform_marketplace", "ecommerce", "website", "ai_service"]) {
    take((entry) => entry.analysis.project_type === type, type);
  }
  take((entry) => entry.analysis.engagement_type === "staffing", "staffing");
  take((entry) => entry.analysis.vibe_coding_difficulty <= easyCut, "쉬운 프로젝트");
  take((entry) => entry.analysis.vibe_coding_difficulty >= hardCut, "어려운 프로젝트");
  take((entry) => {
    const budget = budgetOf(entry.project);
    return budget !== null && budget <= lowBudgetCut;
  }, "낮은 예산대");
  take((entry) => {
    const budget = budgetOf(entry.project);
    return budget !== null && budget >= highBudgetCut;
  }, "높은 예산대");

  for (const entry of ranked) {
    if (selected.size >= size) break;
    if (!selected.has(entry.project.id)) selected.set(entry.project.id, ["seed 보충"]);
  }

  const chosen = [...selected.keys()].slice(0, size).map((id) => entries.find((entry) => entry.project.id === id)!);
  return {
    schema: LUNA_VALIDATION_SAMPLE_SCHEMA,
    analysis_version: "v3.3",
    haiku_model: opts.haikuModel,
    luna_model: opts.lunaModel ?? LUNA_MODEL,
    seed,
    requested_size: size,
    eligible_population: entries.length,
    selected_project_ids: chosen.map((entry) => entry.project.id),
    selected: chosen.map((entry) => ({
      project_id: entry.project.id,
      project_type: entry.analysis.project_type,
      engagement_type: entry.analysis.engagement_type,
      difficulty: entry.analysis.vibe_coding_difficulty,
      budget: budgetOf(entry.project),
      haiku_input_hash: entry.saved.input_hash,
      selection_reasons: selected.get(entry.project.id) ?? [],
    })),
    created_at: new Date().toISOString(),
  };
}

export function validateLunaSample(sample: LunaValidationSampleFile, entries: Entry[]): string[] {
  const byId = new Map(entries.map((entry) => [entry.project.id, entry]));
  const errors: string[] = [];
  if (sample.schema !== LUNA_VALIDATION_SAMPLE_SCHEMA) errors.push("sample schema가 올바르지 않습니다");
  if (sample.analysis_version !== "v3.3") errors.push("analysis_version은 v3.3이어야 합니다");
  if (sample.luna_model !== LUNA_MODEL) errors.push(`Luna model은 ${LUNA_MODEL}이어야 합니다`);
  if (new Set(sample.selected_project_ids).size !== sample.selected_project_ids.length) errors.push("project_id가 중복됩니다");
  for (const id of sample.selected_project_ids) {
    const entry = byId.get(id);
    if (!entry) {
      errors.push(`Haiku 성공 결과 또는 원본 프로젝트가 없습니다: ${id}`);
      continue;
    }
    const currentHash = buildProjectInput(entry.project).hash;
    if (entry.saved.input_hash !== currentHash) errors.push(`입력 hash가 현재 원본과 다릅니다: ${id}`);
    const recorded = sample.selected.find((row) => row.project_id === id);
    if (recorded?.haiku_input_hash !== entry.saved.input_hash) errors.push(`sample에 기록된 Haiku input hash가 다릅니다: ${id}`);
  }
  return errors;
}

type NumericField =
  | "vibe_coding_difficulty"
  | "estimated_hours_min"
  | "estimated_hours_max"
  | "learning_value"
  | "reusability_value"
  | "market_value"
  | "technical_risk"
  | "requirement_clarity";

type Comparable = Pick<
  ProjectAnalysis,
  | "project_type"
  | "engagement_type"
  | "reuse_level"
  | "complexity_types"
  | "technology_assets"
  | "vibe_coding_difficulty"
  | "estimated_hours_min"
  | "estimated_hours_max"
  | "learning_value"
  | "reusability_value"
  | "market_value"
  | "technical_risk"
  | "requirement_clarity"
  | "uncertain_fields"
  | "rationale"
>;

function asAnalysis(row: SavedAnalysisRow): Comparable {
  return row.raw_analysis as Comparable;
}

function jaccard(a: string[], b: string[]): number {
  const aa = new Set(a);
  const bb = new Set(b);
  const union = new Set([...aa, ...bb]).size;
  if (!union) return 1;
  return [...aa].filter((x) => bb.has(x)).length / union;
}

function median(values: number[]): number | null {
  return quantile(values, 0.5);
}

function numericMetric(values: Array<{ haiku: number; luna: number }>) {
  const abs = values.map((x) => Math.abs(x.luna - x.haiku));
  const signed = values.map((x) => x.luna - x.haiku);
  return {
    n: values.length,
    mae: abs.length ? abs.reduce((a, b) => a + b, 0) / abs.length : null,
    median_absolute_error: median(abs),
    max_absolute_error: abs.length ? Math.max(...abs) : null,
    mean_signed_difference: signed.length ? signed.reduce((a, b) => a + b, 0) / signed.length : null,
  };
}

function exactMetric(values: boolean[]) {
  return { n: values.length, matches: values.filter(Boolean).length, rate: values.length ? values.filter(Boolean).length / values.length : null };
}

function arrayMetric(values: number[]) {
  return { n: values.length, mean: values.length ? values.reduce((a, b) => a + b, 0) / values.length : null, median: median(values), p75: quantile(values, 0.75) };
}

function hoursMetric(values: Array<{ haiku: number; luna: number }>) {
  const base = numericMetric(values);
  const relative = values.map((x) => Math.abs(x.luna - x.haiku) / Math.max(Math.abs(x.haiku), 1));
  return { ...base, median_relative_error: median(relative), mean_relative_error: relative.length ? relative.reduce((a, b) => a + b, 0) / relative.length : null, max_relative_error: relative.length ? Math.max(...relative) : null };
}

function pct(value: number | null): string {
  return value === null ? "—" : `${(value * 100).toFixed(1)}%`;
}

function num(value: number | null): string {
  return value === null ? "—" : value.toFixed(2);
}

function money(value: number | null): string {
  return value === null ? "—" : `${Math.round(value).toLocaleString("ko-KR")}원`;
}

export interface LunaValidationReport {
  schema: typeof LUNA_VALIDATION_REPORT_SCHEMA;
  generated_at: string;
  sample: LunaValidationSampleFile;
  model: string;
  matched_n: number;
  agreement: {
    project_type: ReturnType<typeof exactMetric>;
    engagement_type: ReturnType<typeof exactMetric>;
    reuse_level_4: ReturnType<typeof exactMetric>;
    reuse_level_3: ReturnType<typeof exactMetric>;
    complexity_types: ReturnType<typeof arrayMetric>;
    technology_assets: ReturnType<typeof arrayMetric>;
    numeric: Record<NumericField, ReturnType<typeof numericMetric>>;
    estimated_hours_midpoint: ReturnType<typeof hoursMetric>;
    uncertain_fields: { haiku_rate: number; luna_rate: number; either_rate: number };
  };
  bias: {
    vibe_coding_difficulty_mean_signed: number | null;
    estimated_hours_midpoint_mean_signed: number | null;
    learning_value_mean_signed: number | null;
    reusability_value_mean_signed: number | null;
    market_value_mean_signed: number | null;
    project_type_luna_counts: Record<string, number>;
  };
  projects: Array<Record<string, unknown>>;
  recommendation: { code: string; label: string; thresholds: Record<string, boolean>; reasons: string[] };
}

export function buildLunaValidationReport(sample: LunaValidationSampleFile, haikuRows: SavedAnalysisRow[], lunaRows: SavedAnalysisRow[]): LunaValidationReport {
  const haikuById = new Map(haikuRows.map((row) => [row.project_id, row]));
  const lunaById = new Map(lunaRows.map((row) => [row.project_id, row]));
  const pairs = sample.selected_project_ids.flatMap((id) => {
    const haiku = haikuById.get(id);
    const luna = lunaById.get(id);
    return haiku && luna ? [{ id, haiku: asAnalysis(haiku), luna: asAnalysis(luna) }] : [];
  });
  const numericFields: NumericField[] = ["vibe_coding_difficulty", "estimated_hours_min", "estimated_hours_max", "learning_value", "reusability_value", "market_value", "technical_risk", "requirement_clarity"];
  const numeric = Object.fromEntries(numericFields.map((field) => [field, numericMetric(pairs.map((p) => ({ haiku: p.haiku[field], luna: p.luna[field] })))])) as Record<NumericField, ReturnType<typeof numericMetric>>;
  const midpointPairs = pairs.map((p) => ({ haiku: (p.haiku.estimated_hours_min + p.haiku.estimated_hours_max) / 2, luna: (p.luna.estimated_hours_min + p.luna.estimated_hours_max) / 2 }));
  const projectTypeCounts: Record<string, number> = {};
  for (const pair of pairs) projectTypeCounts[pair.luna.project_type] = (projectTypeCounts[pair.luna.project_type] ?? 0) + 1;
  const projects = pairs.map((pair) => {
    const categoricalDifferences = ["project_type", "engagement_type", "reuse_level"].filter((field) => pair.haiku[field as "project_type" | "engagement_type" | "reuse_level"] !== pair.luna[field as "project_type" | "engagement_type" | "reuse_level"]);
    const numericDifferences = numericFields.map((field) => ({ field, difference: pair.luna[field] - pair.haiku[field] })).sort((a, b) => Math.abs(b.difference) - Math.abs(a.difference));
    return {
      project_id: pair.id,
      project_type: { haiku: pair.haiku.project_type, luna: pair.luna.project_type },
      engagement_type: { haiku: pair.haiku.engagement_type, luna: pair.luna.engagement_type },
      reuse_level: { haiku: pair.haiku.reuse_level, luna: pair.luna.reuse_level },
      vibe_coding_difficulty: { haiku: pair.haiku.vibe_coding_difficulty, luna: pair.luna.vibe_coding_difficulty },
      estimated_hours_midpoint: { haiku: (pair.haiku.estimated_hours_min + pair.haiku.estimated_hours_max) / 2, luna: (pair.luna.estimated_hours_min + pair.luna.estimated_hours_max) / 2 },
      learning_value: { haiku: pair.haiku.learning_value, luna: pair.luna.learning_value },
      reusability_value: { haiku: pair.haiku.reusability_value, luna: pair.luna.reusability_value },
      market_value: { haiku: pair.haiku.market_value, luna: pair.luna.market_value },
      uncertain_fields: { haiku: pair.haiku.uncertain_fields, luna: pair.luna.uncertain_fields },
      differences: categoricalDifferences,
      largest_numeric_differences: numericDifferences.slice(0, 3),
      rationale: {
        haiku: pair.haiku.rationale,
        luna: pair.luna.rationale,
      },
    };
  });
  const thresholds = {
    project_type: (exactMetric(pairs.map((p) => p.haiku.project_type === p.luna.project_type)).rate ?? 0) >= 0.8,
    engagement_type: (exactMetric(pairs.map((p) => p.haiku.engagement_type === p.luna.engagement_type)).rate ?? 0) >= 0.9,
    reuse_level_3: (exactMetric(pairs.map((p) => (p.haiku.reuse_level === "low" ? "one_off" : p.haiku.reuse_level) === (p.luna.reuse_level === "low" ? "one_off" : p.luna.reuse_level))).rate ?? 0) >= 0.8,
    vibe_difficulty_mae: (numeric.vibe_coding_difficulty.mae ?? Number.POSITIVE_INFINITY) <= 10,
    value_mae: Math.max(numeric.learning_value.mae ?? Infinity, numeric.reusability_value.mae ?? Infinity, numeric.market_value.mae ?? Infinity) <= 10,
    hours_median_relative_error: (hoursMetric(midpointPairs).median_relative_error ?? Infinity) <= 0.25,
  };
  const passed = Object.values(thresholds).filter(Boolean).length;
  const recommendation = passed === 6
    ? { code: "similar", label: "Haiku와 매우 유사 → Luna fallback 후보", reasons: ["사전 임시 기준 6개를 모두 통과했습니다.", "단, 10건 표본이므로 최종 혼용 결정은 추가 검증 후로 제한합니다."] }
    : passed >= 4
      ? { code: "biased", label: "대체로 유사하지만 일부 편향 있음 → fallback 가능하나 보정 필요", reasons: [`임시 기준 ${passed}/6개를 통과했습니다.`, "실패한 지표와 프로젝트별 근거를 확인해야 합니다."] }
      : { code: "different", label: "차이가 큼 → Luna 혼용 비추천", reasons: [`임시 기준 ${passed}/6개만 통과했습니다.`, "Haiku와 Luna를 같은 시장 통계에 섞지 않는 것이 안전합니다."] };
  return {
    schema: LUNA_VALIDATION_REPORT_SCHEMA,
    generated_at: new Date().toISOString(),
    sample,
    model: sample.luna_model,
    matched_n: pairs.length,
    agreement: {
      project_type: exactMetric(pairs.map((p) => p.haiku.project_type === p.luna.project_type)),
      engagement_type: exactMetric(pairs.map((p) => p.haiku.engagement_type === p.luna.engagement_type)),
      reuse_level_4: exactMetric(pairs.map((p) => p.haiku.reuse_level === p.luna.reuse_level)),
      reuse_level_3: exactMetric(pairs.map((p) => (p.haiku.reuse_level === "low" ? "one_off" : p.haiku.reuse_level) === (p.luna.reuse_level === "low" ? "one_off" : p.luna.reuse_level))),
      complexity_types: arrayMetric(pairs.map((p) => jaccard(p.haiku.complexity_types, p.luna.complexity_types))),
      technology_assets: arrayMetric(pairs.map((p) => jaccard(p.haiku.technology_assets, p.luna.technology_assets))),
      numeric,
      estimated_hours_midpoint: hoursMetric(midpointPairs),
      uncertain_fields: {
        haiku_rate: pairs.length ? pairs.filter((p) => p.haiku.uncertain_fields.length > 0).length / pairs.length : 0,
        luna_rate: pairs.length ? pairs.filter((p) => p.luna.uncertain_fields.length > 0).length / pairs.length : 0,
        either_rate: pairs.length ? pairs.filter((p) => p.haiku.uncertain_fields.length > 0 || p.luna.uncertain_fields.length > 0).length / pairs.length : 0,
      },
    },
    bias: {
      vibe_coding_difficulty_mean_signed: numeric.vibe_coding_difficulty.mean_signed_difference,
      estimated_hours_midpoint_mean_signed: numericMetric(midpointPairs).mean_signed_difference,
      learning_value_mean_signed: numeric.learning_value.mean_signed_difference,
      reusability_value_mean_signed: numeric.reusability_value.mean_signed_difference,
      market_value_mean_signed: numeric.market_value.mean_signed_difference,
      project_type_luna_counts: projectTypeCounts,
    },
    projects,
    recommendation: { ...recommendation, thresholds },
  };
}

export function renderLunaValidationMarkdown(report: LunaValidationReport): string {
  const a = report.agreement;
  const rows = [
    ["project_type 일치율", pct(a.project_type.rate)],
    ["engagement_type 일치율", pct(a.engagement_type.rate)],
    ["reuse_level 4단계 일치율", pct(a.reuse_level_4.rate)],
    ["reuse_level 3단계 일치율", pct(a.reuse_level_3.rate)],
    ["complexity_types Jaccard 평균/중앙/p75", `${num(a.complexity_types.mean)} / ${num(a.complexity_types.median)} / ${num(a.complexity_types.p75)}`],
    ["technology_assets Jaccard 평균/중앙/p75", `${num(a.technology_assets.mean)} / ${num(a.technology_assets.median)} / ${num(a.technology_assets.p75)}`],
    ["vibe_coding_difficulty MAE", num(a.numeric.vibe_coding_difficulty.mae)],
    ["estimated_hours midpoint 중앙 상대오차", pct(a.estimated_hours_midpoint.median_relative_error)],
    ["learning_value MAE", num(a.numeric.learning_value.mae)],
    ["reusability_value MAE", num(a.numeric.reusability_value.mae)],
    ["market_value MAE", num(a.numeric.market_value.mae)],
    ["uncertain_fields Haiku/Luna/either", `${pct(a.uncertain_fields.haiku_rate)} / ${pct(a.uncertain_fields.luna_rate)} / ${pct(a.uncertain_fields.either_rate)}`],
  ];
  const projectRows = report.projects.map((p) => {
    const type = p.project_type as { haiku: string; luna: string };
    const engagement = p.engagement_type as { haiku: string; luna: string };
    const reuse = p.reuse_level as { haiku: string; luna: string };
    const diff = p.estimated_hours_midpoint as { haiku: number; luna: number };
    return `| ${p.project_id} | ${type.haiku} / ${type.luna} | ${engagement.haiku} / ${engagement.luna} | ${reuse.haiku} / ${reuse.luna} | ${(p.vibe_coding_difficulty as { haiku: number; luna: number }).haiku} / ${(p.vibe_coding_difficulty as { haiku: number; luna: number }).luna} | ${diff.haiku} / ${diff.luna} | ${(p.learning_value as { haiku: number; luna: number }).haiku} / ${(p.learning_value as { haiku: number; luna: number }).luna} | ${(p.reusability_value as { haiku: number; luna: number }).haiku} / ${(p.reusability_value as { haiku: number; luna: number }).luna} | ${(p.market_value as { haiku: number; luna: number }).haiku} / ${(p.market_value as { haiku: number; luna: number }).luna} |`;
  }).join("\n");
  const bias = report.bias;
  const signed = (value: number | null) => value === null ? "—" : `${value >= 0 ? "+" : ""}${value.toFixed(2)}`;
  const detailed = report.projects.filter((p) => (p.differences as string[]).length || (p.largest_numeric_differences as Array<{ difference: number }>).some((x) => Math.abs(x.difference) >= 10)).map((p) => {
    const reasons = p.differences as string[];
    const numeric = p.largest_numeric_differences as Array<{ field: string; difference: number }>;
    const r = p.rationale as { haiku: Record<string, string>; luna: Record<string, string> };
    return `### ${p.project_id}\n- 차이 필드: ${reasons.length ? reasons.join(", ") : "수치 편차"}\n- 주요 수치 편차: ${numeric.map((x) => `${x.field} ${x.difference >= 0 ? "+" : ""}${x.difference}`).join(", ")}\n- Haiku 근거: ${Object.values(r.haiku).join(" | ")}\n- Luna 근거: ${Object.values(r.luna).join(" | ")}`;
  }).join("\n\n");
  return [
    `# Luna ${report.sample.analysis_version} 10건 교차검증`,
    "",
    `- 모델: **${report.model}** (Codex CLI 구독)`,
    `- 기준: **${report.sample.haiku_model}** 기존 DB 결과`,
    `- 표본: ${report.matched_n}/${report.sample.requested_size}건 · seed=${report.sample.seed}`,
    "- Haiku 결과는 재분석하지 않았고 기존 행을 그대로 사용했습니다.",
    "- API/Batch API는 사용하지 않았습니다.",
    "",
    "## 일관성 지표",
    "",
    "| 지표 | 결과 |",
    "|---|---:|",
    ...rows.map(([name, value]) => `| ${name} | ${value} |`),
    "",
    "## 숫자 항목 세부",
    "",
    "| 항목 | MAE | 중앙 절대차 | 최대 차이 | Luna-Haiku 평균 부호차 |",
    "|---|---:|---:|---:|---:|",
    ...(["vibe_coding_difficulty", "estimated_hours_min", "estimated_hours_max", "learning_value", "reusability_value", "market_value", "technical_risk", "requirement_clarity"] as NumericField[]).map((field) => `| ${field} | ${num(a.numeric[field].mae)} | ${num(a.numeric[field].median_absolute_error)} | ${num(a.numeric[field].max_absolute_error)} | ${signed(a.numeric[field].mean_signed_difference)} |`),
    `| estimated_hours_midpoint 상대차 | ${num(a.estimated_hours_midpoint.mae)} | ${pct(a.estimated_hours_midpoint.median_relative_error)} | ${pct(a.estimated_hours_midpoint.max_relative_error)} | ${signed(a.estimated_hours_midpoint.mean_signed_difference)} |`,
    "",
    "## 프로젝트별 비교",
    "",
    "| project_id | project_type H/L | engagement H/L | reuse H/L | 난이도 H/L | 시간 중앙 H/L | learning H/L | reuse H/L | market H/L |",
    "|---|---|---|---|---:|---:|---:|---:|---:|",
    projectRows,
    "",
    "## 편향 확인",
    "",
    `- 난이도 평균 부호차(Luna-Haiku): **${signed(bias.vibe_coding_difficulty_mean_signed)}**`,
    `- 시간 중앙값 평균 부호차: **${signed(bias.estimated_hours_midpoint_mean_signed)}시간**`,
    `- learning 평균 부호차: **${signed(bias.learning_value_mean_signed)}**`,
    `- reusability 평균 부호차: **${signed(bias.reusability_value_mean_signed)}**`,
    `- market 평균 부호차: **${signed(bias.market_value_mean_signed)}**`,
    `- Luna project_type 분포: ${Object.entries(bias.project_type_luna_counts).map(([k, v]) => `${k} ${v}건`).join(", ") || "—"}`,
    "",
    "## 차이가 큰 프로젝트 근거",
    "",
    detailed || "큰 차이가 있는 프로젝트가 없습니다.",
    "",
    "## 임시 판단",
    "",
    `**${report.recommendation.label}**`,
    "",
    ...report.recommendation.reasons.map((reason) => `- ${reason}`),
    "",
    "| 임시 기준 | 통과 |",
    "|---|---|",
    ...Object.entries(report.recommendation.thresholds).map(([key, value]) => `| ${key} | ${value ? "PASS" : "FAIL"} |`),
    "",
  ].join("\n");
}

export type { Entry as LunaValidationEntry };
