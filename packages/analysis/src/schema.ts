import * as z from "zod/v4";
import {
  CLASSIFICATION_FIELDS,
  CODE_PATTERN,
  COMPLEXITY_TYPE_CODES,
  ENGAGEMENT_TYPE_CODES,
  INDUSTRY_CODES,
  PLATFORM_CODES,
  PROJECT_TYPE_CODES,
  REUSE_LEVEL_CODES,
  TECHNOLOGY_ASSETS,
} from "./taxonomy";

const score = z.number().int().min(0).max(100);
const code = z.string().regex(CODE_PATTERN);
const codes = z.array(code).max(30);

/**
 * AI 가 프로젝트 1건마다 생성하는 JSON.
 * Structured output 스키마로도 그대로 쓰이고(제약 일부는 API 에서 제거됨), 응답은 반드시 이 스키마로 다시 검증한다.
 */
export const ProjectAnalysisSchema = z.object({
  // --- 분류 (통계용, 모두 enum 강제) ---
  project_type: z.enum(PROJECT_TYPE_CODES),
  project_subcategory: z.string().min(1).max(60),
  engagement_type: z.enum(ENGAGEMENT_TYPE_CODES),
  industry: z.enum(INDUSTRY_CODES),
  complexity_types: z.array(z.enum(COMPLEXITY_TYPE_CODES)).min(1).max(COMPLEXITY_TYPE_CODES.length),
  reuse_level: z.enum(REUSE_LEVEL_CODES),
  technology_assets: z.array(z.enum(TECHNOLOGY_ASSETS)).max(TECHNOLOGY_ASSETS.length),
  /** 판단이 애매했던 분류 필드 (사람 검토 대상) */
  uncertain_fields: z.array(z.enum(CLASSIFICATION_FIELDS)).max(CLASSIFICATION_FIELDS.length),

  summary: z.string().min(10).max(400),

  required_features: codes,
  required_integrations: codes,
  required_platforms: z.array(z.enum(PLATFORM_CODES)).max(12),
  required_skills: codes,
  suggested_stack: z.array(z.string().min(1).max(40)).max(12),

  vibe_coding_difficulty: score,
  estimated_hours_min: z.number().int().min(1).max(5000),
  estimated_hours_max: z.number().int().min(1).max(5000),
  learning_value: score,
  reusability_value: score,
  market_value: score,
  technical_risk: score,
  requirement_clarity: score,

  /** 점수 근거 (사람 검토용, raw_analysis 에만 저장) */
  rationale: z.object({
    vibe_coding_difficulty: z.string().max(300),
    estimated_hours: z.string().max(300),
    learning_value: z.string().max(300),
    reusability_value: z.string().max(300),
    market_value: z.string().max(300),
    technical_risk: z.string().max(300),
  }),
});

export type ProjectAnalysis = z.infer<typeof ProjectAnalysisSchema>;

export type ValidationResult =
  | { ok: true; value: ProjectAnalysis }
  | { ok: false; error: string };

/** 스키마 검증 + 스키마로 표현할 수 없는 교차 조건 검증 */
export function validateAnalysis(input: unknown): ValidationResult {
  const parsed = ProjectAnalysisSchema.safeParse(input);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .slice(0, 8)
      .map((i) => `${i.path.join(".") || "(root)"}: ${i.message}`)
      .join("; ");
    return { ok: false, error: issues };
  }
  const v = parsed.data;
  if (v.estimated_hours_min > v.estimated_hours_max) {
    return { ok: false, error: `estimated_hours_min(${v.estimated_hours_min}) > estimated_hours_max(${v.estimated_hours_max})` };
  }
  // 중복 제거 (순서 유지)
  const uniq = <T>(a: T[]) => [...new Set(a)];
  return {
    ok: true,
    value: {
      ...v,
      complexity_types: uniq(v.complexity_types),
      technology_assets: uniq(v.technology_assets),
      uncertain_fields: uniq(v.uncertain_fields),
      required_features: uniq(v.required_features),
      required_integrations: uniq(v.required_integrations),
      required_platforms: uniq(v.required_platforms),
      required_skills: uniq(v.required_skills),
      suggested_stack: uniq(v.suggested_stack),
    },
  };
}

/** JSON 텍스트 → 검증 결과 (모델 응답, import 파일 공용) */
export function parseAnalysisText(text: string): ValidationResult {
  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch (e) {
    return { ok: false, error: `invalid JSON: ${e instanceof Error ? e.message : String(e)}` };
  }
  return validateAnalysis(json);
}
