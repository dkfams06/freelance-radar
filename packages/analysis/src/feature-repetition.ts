/**
 * project_type 내부 요구사항 반복률 분석 (feature_version f1 기준).
 *
 * - 반복률: 같은 project_type 안에서 각 기능이 등장하는 프로젝트 비율
 * - 유사도: 프로젝트 feature set 간 Jaccard (기능이 0개인 프로젝트는 유사도 계산에서 제외)
 * - 반복 bundle: support ≥ minSupport 인 frequent itemset (Apriori) 중 maximal 인 것
 * - 템플릿 후보: 등장률 ≥ 50% 기능(core) + 30~50% 기능(optional)
 *   coverage = 프로젝트 기능 중 core 로 덮이는 비율의 평균 (템플릿 하나로 얼마나 덮이는지)
 * 점수/가중치는 만들지 않는다.
 */
import { FEATURES, type FeatureCode } from "./features";
import { quantile } from "./stats";

export interface FeatureRow {
  project_id: string;
  project_type: string;
  title?: string | null;
  features: FeatureCode[];
}

export interface Prevalence {
  feature: FeatureCode;
  count: number;
  share: number;
}

export interface SimilarityStats {
  projects: number;
  pairs: number;
  mean: number | null;
  median: number | null;
  p75: number | null;
  share_ge_70: number | null;
}

export interface Bundle {
  features: FeatureCode[];
  support: number;
  share: number;
}

export interface TemplateCandidate {
  core: FeatureCode[];
  optional: FeatureCode[];
  /** 프로젝트 기능 중 core 로 덮이는 비율의 평균 */
  coverage: number | null;
  /** core 의 70% 이상을 포함하는 프로젝트 비율 */
  core_fit_share: number | null;
}

export interface TypeRepetition {
  project_type: string;
  n: number;
  low_sample: boolean;
  empty_feature_projects: number;
  avg_feature_count: number;
  top_features: Prevalence[];
  ge_50: FeatureCode[];
  ge_70: FeatureCode[];
  similarity: SimilarityStats;
  bundles: Bundle[];
  bundles_truncated: boolean;
  template: TemplateCandidate;
}

export interface CrossTypeFeature {
  feature: FeatureCode;
  count: number;
  share: number;
  /** 등장률 ≥ 40% 인 project_type 수 */
  types_ge_40: number;
  types: string[];
}

export interface RepetitionReport {
  feature_version: string;
  analysis_version: string;
  scope: string;
  params: { min_support: number; low_sample_n: number; max_bundle_size: number };
  total: number;
  types: TypeRepetition[];
  cross_type: CrossTypeFeature[];
  answers: {
    highest_repetition: string[];
    easiest_template: string[];
    least_repetitive: string[];
    prebuild_features: FeatureCode[];
  };
  unmapped_codes: { code: string; count: number }[];
  source_breakdown: { analysis_only: number; text_only: number; both: number };
}

export function prevalence(rows: FeatureRow[]): Prevalence[] {
  const counts = new Map<FeatureCode, number>();
  for (const r of rows) for (const f of new Set(r.features)) counts.set(f, (counts.get(f) ?? 0) + 1);
  return [...counts]
    .map(([feature, count]) => ({ feature, count, share: rows.length ? count / rows.length : 0 }))
    .sort((a, b) => b.count - a.count || a.feature.localeCompare(b.feature));
}

export function jaccard(a: readonly string[], b: readonly string[]): number {
  const A = new Set(a);
  const B = new Set(b);
  const union = new Set([...A, ...B]).size;
  if (!union) return 0;
  let inter = 0;
  for (const x of A) if (B.has(x)) inter++;
  return inter / union;
}

export function similarityStats(rows: FeatureRow[]): SimilarityStats {
  const withF = rows.filter((r) => r.features.length);
  const sims: number[] = [];
  for (let i = 0; i < withF.length; i++) for (let j = i + 1; j < withF.length; j++) sims.push(jaccard(withF[i]!.features, withF[j]!.features));
  sims.sort((a, b) => a - b);
  return {
    projects: withF.length,
    pairs: sims.length,
    mean: sims.length ? sims.reduce((a, b) => a + b, 0) / sims.length : null,
    median: quantile(sims, 0.5),
    p75: quantile(sims, 0.75),
    share_ge_70: sims.length ? sims.filter((s) => s >= 0.7).length / sims.length : null,
  };
}

/**
 * Apriori: support(행 수) ≥ minSupport 인 itemset 을 크기 maxSize 까지 찾고, 크기 ≥ 2 인 maximal itemset 을 돌려준다.
 * maxItemsets 를 넘으면 중단하고 truncated=true.
 */
export function frequentBundles(
  rows: FeatureRow[],
  minSupport: number,
  opts: { maxSize?: number; maxItemsets?: number } = {},
): { bundles: Bundle[]; truncated: boolean } {
  const maxSize = opts.maxSize ?? 8;
  const maxItemsets = opts.maxItemsets ?? 50_000;
  const n = rows.length;
  const sets = rows.map((r) => new Set(r.features));
  const support = (items: FeatureCode[]) => sets.filter((s) => items.every((f) => s.has(f))).length;

  let level: { items: FeatureCode[]; support: number }[] = prevalence(rows)
    .filter((p) => p.count >= minSupport)
    .map((p) => ({ items: [p.feature], support: p.count }))
    .sort((a, b) => a.items[0]!.localeCompare(b.items[0]!));
  const all: { items: FeatureCode[]; support: number }[] = [...level];
  let truncated = false;
  for (let k = 2; k <= maxSize && level.length; k++) {
    const prevKeys = new Set(level.map((l) => l.items.join("|")));
    const next: { items: FeatureCode[]; support: number }[] = [];
    for (let i = 0; i < level.length; i++) {
      for (let j = i + 1; j < level.length; j++) {
        const a = level[i]!.items;
        const b = level[j]!.items;
        if (a.slice(0, -1).join("|") !== b.slice(0, -1).join("|")) continue;
        const cand = [...a, b[b.length - 1]!].sort() as FeatureCode[];
        // 모든 (k-1) 부분집합이 frequent 여야 함
        if (!cand.every((_, idx) => prevKeys.has(cand.filter((__, t) => t !== idx).join("|")))) continue;
        const s = support(cand);
        if (s >= minSupport) next.push({ items: cand, support: s });
      }
      if (all.length + next.length > maxItemsets) {
        truncated = true;
        break;
      }
    }
    all.push(...next);
    level = next.sort((x, y) => x.items.join("|").localeCompare(y.items.join("|")));
    if (truncated) break;
  }
  const multi = all.filter((x) => x.items.length >= 2);
  const maximal = multi.filter((x) => !multi.some((y) => y.items.length > x.items.length && x.items.every((f) => y.items.includes(f))));
  const bundles = maximal
    .map((x) => ({ features: x.items, support: x.support, share: n ? x.support / n : 0 }))
    .sort((a, b) => b.features.length - a.features.length || b.support - a.support || a.features.join().localeCompare(b.features.join()));
  return { bundles, truncated };
}

export function templateCandidate(rows: FeatureRow[], prev: Prevalence[]): TemplateCandidate {
  const core = prev.filter((p) => p.share >= 0.5).map((p) => p.feature);
  const optional = prev.filter((p) => p.share >= 0.3 && p.share < 0.5).map((p) => p.feature);
  const withF = rows.filter((r) => r.features.length);
  if (!withF.length) return { core, optional, coverage: null, core_fit_share: null };
  const coreSet = new Set(core);
  const coverage = withF.reduce((s, r) => s + r.features.filter((f) => coreSet.has(f)).length / r.features.length, 0) / withF.length;
  const need = Math.ceil(core.length * 0.7);
  const fit = core.length ? withF.filter((r) => r.features.filter((f) => coreSet.has(f)).length >= need).length / withF.length : 0;
  return { core, optional, coverage, core_fit_share: fit };
}

export function typeRepetition(projectType: string, rows: FeatureRow[], opts: { minSupport: number; lowSampleN: number; maxBundleSize: number }): TypeRepetition {
  const prev = prevalence(rows);
  const { bundles, truncated } = frequentBundles(rows, opts.minSupport, { maxSize: opts.maxBundleSize });
  return {
    project_type: projectType,
    n: rows.length,
    low_sample: rows.length < opts.lowSampleN,
    empty_feature_projects: rows.filter((r) => !r.features.length).length,
    avg_feature_count: rows.length ? rows.reduce((s, r) => s + r.features.length, 0) / rows.length : 0,
    top_features: prev.slice(0, 15),
    ge_50: prev.filter((p) => p.share >= 0.5).map((p) => p.feature),
    ge_70: prev.filter((p) => p.share >= 0.7).map((p) => p.feature),
    similarity: similarityStats(rows),
    bundles: bundles.filter((b) => b.features.length >= 3).slice(0, 5),
    bundles_truncated: truncated,
    template: templateCandidate(rows, prev),
  };
}

export function computeRepetitionReport(
  rows: FeatureRow[],
  args: {
    projectTypes: string[];
    analysisVersion: string;
    featureVersion: string;
    scope: string;
    minSupport?: number;
    lowSampleN?: number;
    maxBundleSize?: number;
    unmapped?: string[][];
    sources?: { analysis_only: number; text_only: number; both: number };
  },
): RepetitionReport {
  const params = { min_support: args.minSupport ?? 5, low_sample_n: args.lowSampleN ?? 10, max_bundle_size: args.maxBundleSize ?? 8 };
  const target = rows.filter((r) => args.projectTypes.includes(r.project_type));
  const types = args.projectTypes
    .map((t) => typeRepetition(t, target.filter((r) => r.project_type === t), { minSupport: params.min_support, lowSampleN: params.low_sample_n, maxBundleSize: params.max_bundle_size }))
    .filter((t) => t.n > 0);

  const cross: CrossTypeFeature[] = prevalence(target).map((p) => {
    const hit = types.filter((t) => shareIn(target, t.project_type, p.feature) >= 0.4);
    return { feature: p.feature, count: p.count, share: p.share, types_ge_40: hit.length, types: hit.map((t) => t.project_type) };
  });
  cross.sort((a, b) => b.types_ge_40 - a.types_ge_40 || b.count - a.count);

  // 결론 정리 (표본이 작은 유형은 순위에서 제외)
  const ranked = types.filter((t) => !t.low_sample && t.similarity.mean !== null);
  const byMean = [...ranked].sort((a, b) => b.similarity.mean! - a.similarity.mean!);
  const byCoverage = [...ranked].filter((t) => t.template.coverage !== null).sort((a, b) => b.template.coverage! - a.template.coverage!);
  const answers = {
    highest_repetition: byMean.slice(0, 3).map((t) => t.project_type),
    easiest_template: byCoverage.slice(0, 3).map((t) => t.project_type),
    least_repetitive: [...byMean].reverse().slice(0, 3).map((t) => t.project_type),
    prebuild_features: cross.filter((c) => c.types_ge_40 >= 3).map((c) => c.feature),
  };

  const unmappedCounts = new Map<string, number>();
  for (const list of args.unmapped ?? []) for (const c of list) unmappedCounts.set(c, (unmappedCounts.get(c) ?? 0) + 1);

  return {
    feature_version: args.featureVersion,
    analysis_version: args.analysisVersion,
    scope: args.scope,
    params,
    total: target.length,
    types,
    cross_type: cross,
    answers,
    unmapped_codes: [...unmappedCounts].map(([code, count]) => ({ code, count })).sort((a, b) => b.count - a.count || a.code.localeCompare(b.code)),
    source_breakdown: args.sources ?? { analysis_only: 0, text_only: 0, both: 0 },
  };
}

function shareIn(rows: FeatureRow[], type: string, f: FeatureCode): number {
  const rs = rows.filter((r) => r.project_type === type);
  return rs.length ? rs.filter((r) => r.features.includes(f)).length / rs.length : 0;
}

const pct = (x: number | null) => (x == null ? "-" : `${(x * 100).toFixed(0)}%`);
const label = (f: FeatureCode) => `${f} (${FEATURES[f].label})`;

export function renderRepetitionReport(r: RepetitionReport): string {
  const L: string[] = [
    `# project_type 내부 요구사항 반복률 (feature ${r.feature_version}, analysis ${r.analysis_version})`,
    "",
    `- 대상: ${r.scope} — ${r.total}건`,
    `- 기능 추출: LLM 호출 없음. v3.3 분석값(required_features/integrations) 매핑 + 설명/제목의 명시적 키워드. 근거 없는 기능은 넣지 않음`,
    `- 기능 근거 구성: 분석값만 ${r.source_breakdown.analysis_only} · 설명만 ${r.source_breakdown.text_only} · 둘 다 ${r.source_breakdown.both} (프로젝트×기능 단위)`,
    `- bundle 최소 support ${r.params.min_support}건, n < ${r.params.low_sample_n} 유형은 ⚠ 표본 부족 (결론 순위에서 제외)`,
    "",
    "## 요약표",
    "",
    "| project_type | n | 평균 기능 수 | 평균 유사도 | 중앙 | p75 | 70%↑ 유사 쌍 | ≥50% 기능 | ≥70% 기능 | 템플릿 coverage | core 적합 |",
    "|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|",
  ];
  for (const t of r.types) {
    const s = t.similarity;
    L.push(
      `| ${t.project_type}${t.low_sample ? " ⚠" : ""} | ${t.n} | ${t.avg_feature_count.toFixed(1)} | ${pct(s.mean)} | ${pct(s.median)} | ${pct(s.p75)} | ${pct(s.share_ge_70)} | ${t.ge_50.length} | ${t.ge_70.length} | ${pct(t.template.coverage)} | ${pct(t.template.core_fit_share)} |`,
    );
  }
  L.push("", "- 평균 유사도: 같은 유형 프로젝트 쌍의 feature set Jaccard 평균", "- 템플릿 coverage: 프로젝트 기능 중 core(등장률 ≥50%) 기능 비율의 평균 · core 적합: core 의 70% 이상을 포함하는 프로젝트 비율", "");

  L.push("## 결론", "");
  L.push(`- 요구사항 반복률이 가장 높은 유형: ${r.answers.highest_repetition.join(", ") || "-"}`);
  L.push(`- 템플릿화가 가장 쉬운 유형: ${r.answers.easiest_template.join(", ") || "-"}`);
  L.push(`- 공고마다 차이가 커서 전문화 가치가 낮은 유형: ${r.answers.least_repetitive.join(", ") || "-"}`);
  L.push(`- 미리 만들어두면 여러 유형에서 반복 사용할 기능 (3개 이상 유형에서 등장률 ≥40%): ${r.answers.prebuild_features.map(label).join(", ") || "-"}`, "");

  L.push("## 유형 공통 기능 (전체 대상 기준)", "", "| 기능 | 프로젝트 수 | 비율 | 등장률≥40% 유형 수 | 유형 |", "|---|---:|---:|---:|---|");
  for (const c of r.cross_type.slice(0, 25)) L.push(`| ${label(c.feature)} | ${c.count} | ${pct(c.share)} | ${c.types_ge_40} | ${c.types.join(", ")} |`);
  L.push("");

  for (const t of r.types) {
    L.push(`## ${t.project_type} (n=${t.n})${t.low_sample ? " ⚠ 표본 부족" : ""}`, "");
    L.push(`- 평균 기능 수 ${t.avg_feature_count.toFixed(1)} · 기능 0개 프로젝트 ${t.empty_feature_projects}건`);
    const s = t.similarity;
    L.push(`- 유사도(${s.pairs}쌍): 평균 ${pct(s.mean)} · 중앙 ${pct(s.median)} · p75 ${pct(s.p75)} · 70% 이상 쌍 ${pct(s.share_ge_70)}`);
    L.push(`- 70% 이상 등장: ${t.ge_70.join(", ") || "없음"}`);
    L.push(`- 50% 이상 등장: ${t.ge_50.join(", ") || "없음"}`, "");
    L.push("| 순위 | 기능 | 프로젝트 수 | 등장률 |", "|---:|---|---:|---:|");
    t.top_features.forEach((p, i) => L.push(`| ${i + 1} | ${label(p.feature)} | ${p.count} | ${pct(p.share)} |`));
    L.push("");
    L.push(`- 대표 반복 bundle (support ≥ ${r.params.min_support}, 3개 이상 기능, maximal)${t.bundles_truncated ? " ⚠ 탐색 상한 도달" : ""}:`);
    if (!t.bundles.length) L.push("  - 없음");
    for (const b of t.bundles) L.push(`  - [${b.features.join(", ")}] — ${b.support}건 (${pct(b.share)})`);
    L.push(`- 템플릿 후보: core [${t.template.core.join(", ") || "없음"}] + optional [${t.template.optional.join(", ") || "없음"}] · coverage ${pct(t.template.coverage)} · core 적합 ${pct(t.template.core_fit_share)}`, "");
  }

  if (r.unmapped_codes.length) {
    L.push("## vocabulary 에 매핑되지 않은 분석값 코드 (보강 후보)", "");
    L.push(r.unmapped_codes.slice(0, 40).map((u) => `${u.code}(${u.count})`).join(", "), "");
  }
  return L.join("\n");
}
