import { ENGAGEMENT_TYPE_CODES, PLATFORM_CODES, PROJECT_CATEGORY_CODES } from "./taxonomy";

/**
 * Structured output 용 JSON schema (API 가 디코딩 단계에서 강제).
 * 숫자 범위/길이/패턴 같은 제약은 API 가 지원하지 않으므로 여기 넣지 않고
 * 응답을 받은 뒤 ProjectAnalysisSchema(zod)로 검증한다. 두 스키마의 필드는 schema.test.ts 가 일치를 확인한다.
 */
const str = { type: "string" } as const;
const int = { type: "integer" } as const;
const strArr = { type: "array", items: str } as const;
const obj = (properties: Record<string, unknown>) => ({
  type: "object",
  properties,
  required: Object.keys(properties),
  additionalProperties: false,
});

export const ANALYSIS_JSON_SCHEMA: Record<string, unknown> = obj({
  project_category: { type: "string", enum: PROJECT_CATEGORY_CODES },
  project_subcategory: str,
  engagement_type: { type: "string", enum: ENGAGEMENT_TYPE_CODES },
  summary: str,
  required_features: strArr,
  required_integrations: strArr,
  required_platforms: { type: "array", items: { type: "string", enum: PLATFORM_CODES } },
  required_skills: strArr,
  suggested_stack: strArr,
  vibe_coding_difficulty: int,
  estimated_hours_min: int,
  estimated_hours_max: int,
  learning_value: int,
  reusability_value: int,
  market_value: int,
  technical_risk: int,
  requirement_clarity: int,
  rationale: obj({
    vibe_coding_difficulty: str,
    estimated_hours: str,
    learning_value: str,
    reusability_value: str,
    market_value: str,
    technical_risk: str,
  }),
});
