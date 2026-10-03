import { describe, expect, it } from "vitest";
import {
  ANALYSIS_JSON_SCHEMA,
  ProjectAnalysisSchema,
  SYSTEM_PROMPT,
  buildProjectInput,
  estimateCostUsd,
  parseAnalysisText,
  validateAnalysis,
  type AnalysisSourceProject,
  type ProjectAnalysis,
} from "./index";

export const sampleAnalysis = (): ProjectAnalysis => ({
  project_type: "reservation",
  project_subcategory: "병원 예약",
  engagement_type: "new_build",
  industry: "healthcare",
  complexity_types: ["standard_crud", "integration_heavy", "standard_crud"],
  reuse_level: "high",
  technology_assets: ["core_web", "backend_api", "admin_system"],
  uncertain_fields: [],
  summary: "병원 환자가 진료를 예약하고 관리자가 일정을 관리하는 웹 서비스",
  required_features: ["authentication", "reservation", "admin_dashboard", "reservation"],
  required_integrations: ["kakao_alimtalk"],
  required_platforms: ["web", "admin_web"],
  required_skills: ["frontend", "backend", "database"],
  suggested_stack: ["Next.js", "Supabase", "Vercel"],
  vibe_coding_difficulty: 30,
  estimated_hours_min: 40,
  estimated_hours_max: 80,
  learning_value: 40,
  reusability_value: 75,
  market_value: 80,
  technical_risk: 20,
  requirement_clarity: 70,
  rationale: {
    vibe_coding_difficulty: "a",
    estimated_hours: "b",
    learning_value: "c",
    reusability_value: "d",
    market_value: "e",
    technical_risk: "f",
  },
});

const project = (over: Partial<AnalysisSourceProject> = {}): AnalysisSourceProject => ({
  id: "00000000-0000-0000-0000-000000000001",
  platform: "wishket",
  external_project_id: "1",
  title: "병원 예약 시스템",
  description: "환자 예약 기능과 관리자 페이지가 필요합니다. ".repeat(5),
  budget: "5,000,000원",
  budget_min: 5000000,
  budget_max: 5000000,
  budget_type: "fixed",
  project_duration: "30일",
  duration_days: 30,
  registered_at: "2026-10-01T00:00:00Z",
  project_status: "모집 중",
  category: "개발",
  subcategory: "웹",
  project_type: "외주",
  skills: ["React"],
  location: null,
  work_method: null,
  development_scope: null,
  existing_system: "신규",
  planning_status: null,
  design_status: null,
  required_stack: [],
  preferred_stack: [],
  extra: { fields: { "모집 마감": "2026-10-10" }, fieldCode: "1,2", privateMatching: false },
  ...over,
});

describe("validateAnalysis", () => {
  it("accepts a valid analysis and de-duplicates arrays", () => {
    const r = validateAnalysis(sampleAnalysis());
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.required_features).toEqual(["authentication", "reservation", "admin_dashboard"]);
      expect(r.value.complexity_types).toEqual(["standard_crud", "integration_heavy"]);
    }
  });

  it("rejects out-of-range scores, unknown category, bad codes, hours min > max", () => {
    expect(validateAnalysis({ ...sampleAnalysis(), market_value: 101 }).ok).toBe(false);
    expect(validateAnalysis({ ...sampleAnalysis(), vibe_coding_difficulty: 12.5 }).ok).toBe(false);
    expect(validateAnalysis({ ...sampleAnalysis(), project_type: "bank" }).ok).toBe(false);
    expect(validateAnalysis({ ...sampleAnalysis(), required_features: ["Payment Gateway"] }).ok).toBe(false);
    expect(validateAnalysis({ ...sampleAnalysis(), engagement_type: "build" }).ok).toBe(false);
    expect(validateAnalysis({ ...sampleAnalysis(), industry: "banking" }).ok).toBe(false);
    expect(validateAnalysis({ ...sampleAnalysis(), complexity_types: [] }).ok).toBe(false);
    expect(validateAnalysis({ ...sampleAnalysis(), complexity_types: ["crud"] }).ok).toBe(false);
    expect(validateAnalysis({ ...sampleAnalysis(), reuse_level: "very_high" }).ok).toBe(false);
    expect(validateAnalysis({ ...sampleAnalysis(), technology_assets: ["kubernetes"] }).ok).toBe(false);
    expect(validateAnalysis({ ...sampleAnalysis(), technology_assets: [] }).ok).toBe(true);
    const r = validateAnalysis({ ...sampleAnalysis(), estimated_hours_min: 100, estimated_hours_max: 50 });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toMatch(/estimated_hours_min/);
  });

  it("parses JSON text and reports invalid JSON", () => {
    expect(parseAnalysisText(JSON.stringify(sampleAnalysis())).ok).toBe(true);
    const bad = parseAnalysisText("{not json");
    expect(bad.ok).toBe(false);
  });
});

describe("ANALYSIS_JSON_SCHEMA", () => {
  it("enforces the classification enums in the API schema", () => {
    const props = ANALYSIS_JSON_SCHEMA.properties as Record<string, { enum?: string[]; items?: { enum?: string[] } }>;
    expect(props.project_type!.enum).toContain("crawler_data_collection");
    expect(props.engagement_type!.enum).toContain("staffing");
    expect(props.industry!.enum).toContain("finance");
    expect(props.reuse_level!.enum).toEqual(["high", "medium", "low", "one_off"]);
    expect(props.complexity_types!.items!.enum).toContain("high_risk_domain");
    expect(props.technology_assets!.items!.enum).toContain("rag_embeddings");
  });

  it("has exactly the same fields as the zod schema, all required", () => {
    const zodKeys = Object.keys(ProjectAnalysisSchema.shape).sort();
    const props = ANALYSIS_JSON_SCHEMA.properties as Record<string, unknown>;
    expect(Object.keys(props).sort()).toEqual(zodKeys);
    expect((ANALYSIS_JSON_SCHEMA.required as string[]).sort()).toEqual(zodKeys);
    expect(Object.keys((props.rationale as { properties: object }).properties).sort()).toEqual(
      Object.keys(ProjectAnalysisSchema.shape.rationale.shape).sort(),
    );
  });
});

describe("buildProjectInput", () => {
  it("formats fields, skips internal extra keys, is deterministic", () => {
    const a = buildProjectInput(project());
    expect(a.text).toContain("제목: 병원 예약 시스템");
    expect(a.text).toContain("- 모집 마감: 2026-10-10");
    expect(a.text).not.toContain("fieldCode");
    expect(a.truncated).toBe(false);
    expect(a.limitedInfo).toBe(false);
    expect(buildProjectInput(project()).hash).toBe(a.hash);
    expect(buildProjectInput(project({ title: "다른 제목" })).hash).not.toBe(a.hash);
  });

  it("flags truncation and limited info", () => {
    expect(buildProjectInput(project({ description: "가".repeat(20000) })).truncated).toBe(true);
    expect(buildProjectInput(project({ description: null })).limitedInfo).toBe(true);
    expect(buildProjectInput(project({ extra: { detailRestricted: true } })).limitedInfo).toBe(true);
  });
});

describe("prompt / cost", () => {
  it("system prompt is static (cache-friendly)", () => {
    expect(SYSTEM_PROMPT).not.toMatch(/\d{4}-\d{2}-\d{2}T/);
    expect(SYSTEM_PROMPT).toContain("vibe_coding_difficulty");
  });

  it("estimates cost with batch discount and cache pricing", () => {
    const u = { input_tokens: 1_000_000, output_tokens: 100_000 };
    expect(estimateCostUsd("claude-sonnet-5-5", u)).toBeCloseTo(3);
    expect(estimateCostUsd("claude-sonnet-5-5", u, { batch: true })).toBeCloseTo(1.5);
    expect(estimateCostUsd("claude-haiku-4-5", { input_tokens: 0, output_tokens: 0, cache_read_input_tokens: 1_000_000 })).toBeCloseTo(0.1);
    expect(estimateCostUsd("unknown-model", u)).toBeNull();
  });
});

describe("buildProjectInput dedupe", () => {
  it("drops extra values that repeat a header value or an earlier extra", () => {
    const t = buildProjectInput(
      project({ planning_status: "간단히 정리", extra: { fields: { "기획 상태": "간단히 정리", industry: "교육업", "산업 분야": "교육업" } } }),
    ).text;
    expect(t.match(/간단히 정리/g)).toHaveLength(1);
    expect(t.match(/교육업/g)).toHaveLength(1);
  });
});
