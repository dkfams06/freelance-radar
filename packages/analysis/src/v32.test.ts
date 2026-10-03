import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import {
  ANALYSIS_JSON_SCHEMA,
  ENGAGEMENT_TYPE_CODES,
  PROJECT_TYPE_CODES,
  SYSTEM_PROMPT,
  TECHNOLOGY_ASSETS,
  validateAnalysis,
} from "./index";

const base = (JSON.parse(readFileSync(path.resolve(import.meta.dirname, "../../../docs/analyzer-v3-sample-20.json"), "utf8")) as {
  items: Array<{ analysis: Record<string, unknown> }>;
}).items.find((i) => i.analysis.project_type !== "maintenance")!.analysis;

describe("analysis v3.2", () => {
  it("project_type 에서 maintenance 제거, engagement_type 에는 유지", () => {
    expect(PROJECT_TYPE_CODES).not.toContain("maintenance");
    expect(ENGAGEMENT_TYPE_CODES).toContain("maintenance");
    expect(JSON.stringify(ANALYSIS_JSON_SCHEMA)).toContain("qa_testing");
  });

  it("project_type=maintenance 는 schema 가 거부, engagement_type=maintenance 는 허용", () => {
    expect(validateAnalysis({ ...base, project_type: "maintenance" }).ok).toBe(false);
    expect(validateAnalysis({ ...base, project_type: "website", engagement_type: "maintenance" }).ok).toBe(true);
  });

  it("technology_assets 에 test_automation 추가", () => {
    expect(TECHNOLOGY_ASSETS).toContain("test_automation");
    expect(validateAnalysis({ ...base, technology_assets: ["test_automation", "core_web"] }).ok).toBe(true);
  });

  it("프롬프트에 v3.2 규칙이 들어 있다", () => {
    expect(SYSTEM_PROMPT).toContain("유지보수는 결과물 유형이 아니라 작업 형태입니다");
    expect(SYSTEM_PROMPT).toContain("기존 홈페이지 유지보수 → website");
    expect(SYSTEM_PROMPT).toContain("수동 QA·수동 검수만 하는 경우에는 넣지 않습니다");
    expect(SYSTEM_PROMPT).toContain("4개 이상은 서로 독립적인 복잡성이 실제로 각각 존재할 때만 허용합니다");
    expect(SYSTEM_PROMPT).toContain("high_risk_domain, workflow_complex, integration_heavy 를 습관적으로 함께 붙이지 않습니다");
    expect(SYSTEM_PROMPT).toContain('"배운다"는 learning_value 의 몫이고');
    // 프롬프트에 project_type 코드로서의 maintenance 는 남아 있지 않다
    expect(SYSTEM_PROMPT).not.toContain("- maintenance: 기존 시스템 유지보수가 본질");
  });
});
