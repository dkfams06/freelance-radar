import { describe, expect, it } from "vitest";
import {
  ANALYSIS_JSON_SCHEMA,
  PROJECT_TYPE_CODES,
  REUSE_LEVEL_CODES,
  SYSTEM_PROMPT,
  validateAnalysis,
} from "./index";
import { readFileSync } from "node:fs";
import path from "node:path";

const base = (JSON.parse(readFileSync(path.resolve(import.meta.dirname, "../../../docs/analyzer-v3-sample-20.json"), "utf8")) as {
  items: Array<{ analysis: Record<string, unknown> }>;
}).items.find((i) => i.analysis.project_type !== "maintenance")!.analysis;
const sampleAnalysis = () => ({ ...base });

describe("analysis v3.1", () => {
  it("project_type 에 qa_testing 추가, 기존 코드는 유지", () => {
    expect(PROJECT_TYPE_CODES).toContain("qa_testing");
    for (const c of ["iot_device", "media_processing", "fintech_payment", "enterprise_infra", "other"]) {
      expect(PROJECT_TYPE_CODES).toContain(c);
    }
    const schema = JSON.stringify(ANALYSIS_JSON_SCHEMA);
    expect(schema).toContain("qa_testing");
  });

  it("QA 상주 = qa_testing + staffing 조합이 schema 를 통과", () => {
    const r = validateAnalysis({ ...sampleAnalysis(), project_type: "qa_testing", engagement_type: "staffing", reuse_level: "low" });
    expect(r.ok).toBe(true);
  });

  it("reuse_level 4단계는 그대로", () => {
    expect(REUSE_LEVEL_CODES).toEqual(["high", "medium", "low", "one_off"]);
  });

  it("프롬프트에 v3.1 규칙이 들어 있다", () => {
    // 1) qa_testing 과 staffing 분리
    expect(SYSTEM_PROMPT).toContain("QA 상주 → project_type=qa_testing, engagement_type=staffing");
    // 2) reuse_level: 학습가치와 분리
    expect(SYSTEM_PROMPT).toContain("어렵거나 새로운 기술을 익힌다고 reuse_level 을 올리지 않습니다");
    // 3) 장치 연동 경계
    expect(SYSTEM_PROMPT).toContain("장비 연동이 여러 기능 중 일부일 뿐이고 핵심이 ERP/WMS");
    // 4) 예산과 작업시간 분리
    expect(SYSTEM_PROMPT).toContain("Never compress estimated hours merely to fit the client's stated budget.");
    // 5) uncertain_fields 조건
    expect(SYSTEM_PROMPT).toContain("일반적인 프로젝트는 빈 배열([])이 정상");
    // 6) 기능 추가 후 유지보수 예시
    expect(SYSTEM_PROMPT).toContain("향후 유지보수가 언급됐다는 이유만으로 maintenance 로 바꾸지 않습니다");
  });

  it("프롬프트는 여전히 정적 (cache 대상)", () => {
    expect(SYSTEM_PROMPT).not.toMatch(/\d{4}-\d{2}-\d{2}T/);
  });
});
