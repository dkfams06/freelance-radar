import { confidenceForN, type Confidence, type OpportunityMetric, type OpportunityScores } from "./opportunity-score";

export type OpportunityV02Role = "core_business" | "template_product" | "selective_high_value" | "cashflow" | "learning_bet" | "avoid";

export interface OpportunityV01JsonType {
  key: string;
  n: number;
  confidence: Confidence;
  normalized: Pick<OpportunityScores, OpportunityMetric>;
  scores: OpportunityScores;
  rank: { balanced: number | null };
  avg_ai_ease: number | null;
  avg_learning: number | null;
}

export interface OpportunityV01Json {
  schema: string;
  analysis_version: string;
  modes: {
    exclude_outliers: {
      non_staffing: { types: OpportunityV01JsonType[] };
    };
  };
}

export interface FeatureV01JsonType {
  project_type: string;
  n: number;
  low_sample: boolean;
  avg_feature_count: number;
  ge_50: string[];
  ge_70: string[];
  similarity: { mean: number | null; median: number | null; p75: number | null; share_ge_70: number | null };
  bundles: Array<{ support: number; share: number; features: string[] }>;
  template: { core: string[]; optional: string[]; coverage: number | null; core_fit_share: number | null };
}

export interface FeatureV01Json {
  feature_version: string;
  analysis_version: string;
  total: number;
  types: FeatureV01JsonType[];
  cross_type: Array<{ feature: string; count: number; share: number; types_ge_40: number; types: string[] }>;
  unmapped_codes: Array<{ code: string; count: number }>;
}

export interface TemplateabilityInputs {
  core_coverage: number;
  core_fit: number;
  jaccard_similarity: number;
  bundle_strength: number;
  feature_repetition: number;
}

export interface OpportunityV02Type {
  project_type: string;
  n_opportunity: number;
  n_features: number;
  confidence: Confidence;
  v01_score: number | null;
  v01_rank: number | null;
  v02_score: number | null;
  v02_rank: number | null;
  rank_change: number | null;
  templateability_score: number | null;
  templateability_inputs: TemplateabilityInputs | null;
  core_feature_count: number;
  high_prevalence_feature_count: number;
  avg_jaccard: number | null;
  max_bundle_support: number | null;
  avg_ai_ease: number | null;
  avg_learning: number | null;
  role: OpportunityV02Role;
  role_reason: string;
}

export interface OpportunityV02Report {
  schema: "opportunity-score/v0.2-candidate";
  generated_at: string;
  analysis_version: string;
  source: { opportunity_mode: "exclude_outliers"; opportunity_file: string; feature_file: string; feature_total: number; target_type_count: number };
  weights: {
    frequency: number;
    budget_per_hour: number;
    ai_ease: number;
    reusability: number;
    templateability: number;
    learning: number;
    market_value: number;
  };
  templateability_formula: {
    core_coverage: number;
    core_fit: number;
    jaccard_similarity: number;
    bundle_strength: number;
    feature_repetition: number;
  };
  types: OpportunityV02Type[];
  role_rules: string[];
  notes: string[];
}

export interface StarterKitFeature {
  feature: string;
  count: number;
  share: number;
  types_ge_40: number;
  types: string[];
}

export interface StarterKitReport {
  feature_version: string;
  source_total: number;
  must_include: StarterKitFeature[];
  optional_modules: StarterKitFeature[];
  extensions: Record<string, string[]>;
}

const round2 = (value: number | null): number | null => value === null ? null : Math.round(value * 100) / 100;

function featureRepetitionScore(feature: FeatureV01JsonType): number {
  const coreCount = Math.max(feature.ge_50.length, 1);
  const highRatio = feature.ge_70.length / coreCount;
  const coreDensity = Math.min(1, feature.ge_50.length / Math.max(feature.avg_feature_count, 1));
  // 기능 개수 자체가 아니라, core 안에서 고빈도 기능이 차지하는 비율과 core 밀도로 계산한다.
  return (highRatio * 0.6 + coreDensity * 0.4) * 100;
}

function templateability(feature: FeatureV01JsonType): { score: number; inputs: TemplateabilityInputs } {
  const maxBundleShare = feature.bundles.length ? Math.max(...feature.bundles.map((bundle) => bundle.share)) : 0;
  const inputs: TemplateabilityInputs = {
    core_coverage: (feature.template.coverage ?? 0) * 100,
    core_fit: (feature.template.core_fit_share ?? 0) * 100,
    jaccard_similarity: (feature.similarity.mean ?? 0) * 100,
    bundle_strength: maxBundleShare * 100,
    feature_repetition: featureRepetitionScore(feature),
  };
  return {
    inputs,
    score: inputs.core_coverage * 0.3 + inputs.core_fit * 0.25 + inputs.jaccard_similarity * 0.2 + inputs.bundle_strength * 0.15 + inputs.feature_repetition * 0.1,
  };
}

function recommendRole(row: Omit<OpportunityV02Type, "role" | "role_reason">): { role: OpportunityV02Role; reason: string } {
  const t = row.templateability_score ?? 0;
  const coreFit = row.templateability_inputs?.core_fit ?? 0;
  const jaccard = row.templateability_inputs?.jaccard_similarity ?? 0;
  const aiEase = row.avg_ai_ease ?? 0;
  const learning = row.avg_learning ?? 0;
  if (t >= 55 && coreFit >= 75 && jaccard >= 30) return { role: "template_product", reason: "templateability 55+·core fit 75+·평균 Jaccard 30+" };
  if (aiEase >= 70 && t < 50) return { role: "cashflow", reason: "AI 용이성 70+·템플릿화 점수 50 미만" };
  if (learning >= 60 && t < 50) return { role: "learning_bet", reason: "학습가치 60+·템플릿화 점수 50 미만" };
  if ((row.v02_rank ?? 99) <= 3 && row.n_opportunity >= 30 && row.core_feature_count <= 6 && t >= 40) return { role: "core_business", reason: "v0.2 상위 3위·n 30+·core 6개 이하·템플릿화 40+" };
  if ((row.v02_score ?? 0) < 40 && t < 40) return { role: "avoid", reason: "v0.2 40 미만·템플릿화 40 미만" };
  return { role: "selective_high_value", reason: "경제성/재사용성은 있으나 전체 템플릿화 또는 표본 근거가 제한적" };
}

export function buildOpportunityV02Report(
  opportunity: OpportunityV01Json,
  feature: FeatureV01Json,
  opts: { generatedAt?: Date; opportunityFile: string; featureFile: string },
): OpportunityV02Report {
  const opportunityTypes = opportunity.modes.exclude_outliers.non_staffing.types;
  const byFeature = new Map(feature.types.map((type) => [type.project_type, type]));
  const rows: OpportunityV02Type[] = [];
  for (const type of opportunityTypes) {
    const f = byFeature.get(type.key);
    if (!f) continue;
    const template = templateability(f);
    const n = Math.min(type.n, f.n);
    const confidence = confidenceForN(n);
    const v01Score = type.scores.balanced;
    const normalized = type.normalized;
    const v02Score = v01Score === null || template.score === null ? null :
      (normalized.frequency ?? 0) * 0.15 +
      (normalized.budget_per_hour ?? 0) * 0.25 +
      (normalized.ai_ease ?? 0) * 0.15 +
      (normalized.reusability ?? 0) * 0.15 +
      template.score * 0.15 +
      (normalized.learning ?? 0) * 0.08 +
      (normalized.market_value ?? 0) * 0.07;
    rows.push({
      project_type: type.key,
      n_opportunity: type.n,
      n_features: f.n,
      confidence,
      v01_score: v01Score,
      v01_rank: type.rank.balanced,
      v02_score: round2(v02Score),
      v02_rank: null,
      rank_change: null,
      templateability_score: round2(template.score),
      templateability_inputs: {
        core_coverage: round2(template.inputs.core_coverage) ?? 0,
        core_fit: round2(template.inputs.core_fit) ?? 0,
        jaccard_similarity: round2(template.inputs.jaccard_similarity) ?? 0,
        bundle_strength: round2(template.inputs.bundle_strength) ?? 0,
        feature_repetition: round2(template.inputs.feature_repetition) ?? 0,
      },
      core_feature_count: f.ge_50.length,
      high_prevalence_feature_count: f.ge_70.length,
      avg_jaccard: round2(f.similarity.mean === null ? null : f.similarity.mean * 100),
      max_bundle_support: round2(f.bundles.length ? Math.max(...f.bundles.map((bundle) => bundle.share * 100)) : 0),
      avg_ai_ease: type.avg_ai_ease,
      avg_learning: type.avg_learning,
      role: "selective_high_value",
      role_reason: "",
    });
  }
  rows.sort((a, b) => (b.v02_score ?? -1) - (a.v02_score ?? -1) || b.n_opportunity - a.n_opportunity || a.project_type.localeCompare(b.project_type));
  rows.forEach((row, index) => {
    row.v02_rank = row.v02_score === null ? null : index + 1;
    row.rank_change = row.v01_rank === null || row.v02_rank === null ? null : row.v01_rank - row.v02_rank;
    const role = recommendRole(row);
    row.role = role.role;
    row.role_reason = role.reason;
  });
  rows.sort((a, b) => a.project_type.localeCompare(b.project_type));
  return {
    schema: "opportunity-score/v0.2-candidate",
    generated_at: (opts.generatedAt ?? new Date()).toISOString(),
    analysis_version: opportunity.analysis_version,
    source: {
      opportunity_mode: "exclude_outliers",
      opportunity_file: opts.opportunityFile,
      feature_file: opts.featureFile,
      feature_total: feature.total,
      target_type_count: rows.length,
    },
    weights: { frequency: 0.15, budget_per_hour: 0.25, ai_ease: 0.15, reusability: 0.15, templateability: 0.15, learning: 0.08, market_value: 0.07 },
    templateability_formula: { core_coverage: 0.3, core_fit: 0.25, jaccard_similarity: 0.2, bundle_strength: 0.15, feature_repetition: 0.1 },
    types: rows,
    role_rules: [
      "template_product: templateability ≥55, core fit ≥75, 평균 Jaccard ≥30",
      "cashflow: AI 용이성 ≥70, templateability <50",
      "learning_bet: learning ≥60, templateability <50",
      "core_business: v0.2 TOP 3, n ≥30, core feature ≤6, templateability ≥40",
      "avoid: v0.2 <40, templateability <40",
      "그 외: selective_high_value",
      "표본수는 점수 감점이 아니라 confidence로만 표시",
    ],
    notes: [
      "v0.2는 v0.1과 feature repetition f1을 결합한 후보 공식이며 최종 확정 점수가 아니다.",
      "v0.1은 이상치 제외 일반 외주 모드의 정규화 지표를 재사용했다.",
      "feature repetition은 지정된 8개 project_type 결과를 사용한다. 유형별 opportunity n과 feature n은 이상치 처리 차이로 다를 수 있다.",
      "templateability의 feature_repetition은 feature 개수 자체가 아니라 고빈도 core 비율과 core 밀도의 조합이다.",
      "reservation, saas, admin_backoffice는 n<10이므로 추천 label도 낮은 confidence로 해석해야 한다.",
    ],
  };
}

const featureLabel = (feature: StarterKitFeature) => `${feature.feature} (${Math.round(feature.share * 100)}%, ${feature.types_ge_40}개 유형)`;

export function buildStarterKitReport(feature: FeatureV01Json): StarterKitReport {
  const byFeature = new Map(feature.cross_type.map((row) => [row.feature, row]));
  const get = (key: string): StarterKitFeature => {
    const row = byFeature.get(key);
    return row ?? { feature: key, count: 0, share: 0, types_ge_40: 0, types: [] };
  };
  return {
    feature_version: feature.feature_version,
    source_total: feature.total,
    must_include: ["admin_dashboard", "authentication", "user_management", "role_permission", "statistics_dashboard"].map(get),
    optional_modules: ["file_upload", "search_filter", "notification", "payment", "excel_import_export"].map(get),
    extensions: {
      business_management: ["excel_import_export", "workflow", "approval", "task_automation", "report_generation", "external_api_integration"],
      ecommerce: ["listing_catalog", "cart_checkout", "order_management", "payment", "search_filter", "notification"],
      platform_marketplace: ["buyer_seller_roles", "matching", "search_filter", "payment", "notification", "settlement", "board_community"],
      website: ["landing_seo", "cms_content", "board_community", "inquiry_support", "media_handling"],
      reservation: ["reservation", "scheduling_calendar", "payment", "notification", "settlement"],
      saas: ["file_upload", "excel_import_export", "payment", "external_api_integration", "subscription"],
      ai_service: ["ai_llm", "ai_recognition", "external_api_integration", "file_upload", "task_automation", "rag_search"],
      admin_backoffice: ["excel_import_export", "search_filter", "notification", "legacy_migration", "report_generation"],
    },
  };
}

export function renderOpportunityV02Report(report: OpportunityV02Report): string {
  const f = (value: number | null | undefined, digits = 2) => value == null ? "-" : value.toFixed(digits);
  const rankChange = (value: number | null) => value === null ? "-" : value > 0 ? `▲${value}` : value < 0 ? `▼${Math.abs(value)}` : "-";
  const labels: Record<OpportunityV02Role, string> = { core_business: "core_business", template_product: "template_product", selective_high_value: "selective_high_value", cashflow: "cashflow", learning_bet: "learning_bet", avoid: "avoid" };
  const L: string[] = [
    `# 공략 점수 v0.2 후보 (analysis_version = ${report.analysis_version})`,
    "",
    "- 최종 확정 전 후보 공식입니다.",
    "- v0.1은 이상치 제외 일반 외주 모드, feature repetition은 f1 8개 유형 결과를 결합했습니다.",
    "",
    "## 1. 점수 공식",
    "",
    "```text",
    "opportunity_score_v0_2 = frequency*0.15 + budget_per_hour*0.25 + ai_ease*0.15 + reusability*0.15 + templateability*0.15 + learning*0.08 + market_value*0.07",
    "templateability_score = core_coverage*0.30 + core_fit*0.25 + jaccard*0.20 + bundle_strength*0.15 + feature_repetition*0.10",
    "```",
    "",
    "| project_type | n(v0.1) | n(f1) | confidence | v0.1 | v0.2 | v0.1 순위 | v0.2 순위 | 순위 변화 | templateability | 추천 label |",
    "|---|---:|---:|---|---:|---:|---:|---:|---:|---:|---|",
  ];
  for (const row of report.types) L.push(`| ${row.project_type} | ${row.n_opportunity} | ${row.n_features} | ${row.confidence} | ${f(row.v01_score)} | ${f(row.v02_score)} | ${row.v01_rank ?? "-"} | ${row.v02_rank ?? "-"} | ${rankChange(row.rank_change)} | ${f(row.templateability_score)} | ${labels[row.role]} |`);
  L.push("", "## 2. templateability 구성", "", "| project_type | core coverage | core fit | 평균 Jaccard | 최대 bundle support | feature repetition | core 수 | ≥70% 수 |", "|---|---:|---:|---:|---:|---:|---:|---:|");
  for (const row of report.types) {
    const i = row.templateability_inputs;
    L.push(`| ${row.project_type} | ${f(i?.core_coverage)} | ${f(i?.core_fit)} | ${f(i?.jaccard_similarity)} | ${f(i?.bundle_strength)} | ${f(i?.feature_repetition)} | ${row.core_feature_count} | ${row.high_prevalence_feature_count} |`);
  }
  L.push("", "## 3. 역할 분류 후보", "", "| 역할 | 유형 | 판단 근거 |", "|---|---|---|");
  const grouped = new Map<OpportunityV02Role, OpportunityV02Type[]>();
  for (const row of report.types) grouped.set(row.role, [...(grouped.get(row.role) ?? []), row]);
  for (const [role, rows] of grouped) L.push(`| ${labels[role]} | ${rows.map((row) => `${row.project_type}(${row.confidence})`).join(", ")} | ${rows.map((row) => row.role_reason).join(" / ")} |`);
  L.push("", "## 4. 해석 주의", "", ...report.notes.map((note) => `- ${note}`));
  return L.join("\n");
}

export function renderStarterKitReport(report: StarterKitReport): string {
  const lines: string[] = [
    "# 범용 외주 Starter Kit v0.1 설계 후보",
    "",
    `- feature vocabulary: ${report.feature_version}`,
    `- 기준 feature 프로젝트: ${report.source_total}건`,
    "- 아직 실제 코드는 구현하지 않는다.",
    "",
    "## 반드시 포함",
    "",
    "| 기능 | 전체 등장 | 40% 이상 유형 수 | 대상 유형 |",
    "|---|---:|---:|---|",
    ...report.must_include.map((feature) => `| ${featureLabel(feature)} | ${feature.count} | ${feature.types_ge_40} | ${feature.types.join(", ")} |`),
    "",
    "## 선택 모듈",
    "",
    "| 기능 | 전체 등장 | 40% 이상 유형 수 | 대상 유형 |",
    "|---|---:|---:|---|",
    ...report.optional_modules.map((feature) => `| ${featureLabel(feature)} | ${feature.count} | ${feature.types_ge_40} | ${feature.types.join(", ")} |`),
    "",
    "## 유형별 확장",
    "",
    "| 유형 | 확장 모듈 |",
    "|---|---|",
    ...Object.entries(report.extensions).map(([type, features]) => `| ${type} | ${features.join(", ")} |`),
    "",
    "## 설계 원칙",
    "",
    "- 반드시 포함 모듈은 로그인·관리자·권한·사용자·통계의 공통 운영 백본으로 한정한다.",
    "- 결제·알림·엑셀·검색·파일은 어댑터/모듈로 분리한다.",
    "- 유형별 확장은 core를 복제하지 않고 도메인 기능만 추가한다.",
    "- multi-tenancy, ERP 규칙, AI 모델별 파이프라인은 공통 백본에 넣지 않는다.",
  ];
  return lines.join("\n");
}
