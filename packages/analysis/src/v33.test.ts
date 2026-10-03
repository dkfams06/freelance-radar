import { describe, expect, it } from "vitest";
import {
  ANALYSIS_VERSION,
  ENGAGEMENT_TYPE_CODES,
  PROJECT_TYPE_CODES,
  REUSE_LEVEL_CODES,
  REUSE_LEVELS,
  SYSTEM_PROMPT,
  TECHNOLOGY_ASSETS,
} from "./index";

describe("analysis v3.3 (reuse_level only)", () => {
  it("버전은 v3.3", () => {
    expect(ANALYSIS_VERSION).toBe("v3.3");
  });

  it("reuse_level 4단계 코드와 다른 taxonomy 는 v3.2 와 동일", () => {
    expect(REUSE_LEVEL_CODES).toEqual(["high", "medium", "low", "one_off"]);
    expect(PROJECT_TYPE_CODES).not.toContain("maintenance");
    expect(PROJECT_TYPE_CODES).toContain("qa_testing");
    expect(ENGAGEMENT_TYPE_CODES).toContain("maintenance");
    expect(TECHNOLOGY_ASSETS).toContain("test_automation");
  });

  it("정의: medium 은 구체적 모듈, one_off 는 아주 특수한 고객 종속", () => {
    expect(REUSE_LEVELS.medium).toContain("구체적인 모듈/구조");
    expect(REUSE_LEVELS.one_off).toContain("폐쇄망");
    expect(REUSE_LEVELS.low).toContain("특정 SDK 대응");
  });

  it("프롬프트 규칙", () => {
    expect(SYSTEM_PROMPT).toContain("단순히 \"비슷한 기술을 또 쓸 수 있다\"는 이유만으로 medium 을 주지 않습니다");
    expect(SYSTEM_PROMPT).toContain("\"아주 특수한 고객 종속\"일 때만 쓰고");
    expect(SYSTEM_PROMPT).toContain("staffing(상주/인력 투입)이라는 이유만으로 one_off 로 분류하지 않습니다");
    // v3.2 에서 one_off 를 삼킨 문구는 제거
    expect(SYSTEM_PROMPT).not.toContain("특정 기업 환경, 특정 SDK, 특정 승인 대응, 특정 레거시 수정은 기본적으로 low");
  });

  it("complexity/점수 규칙은 v3.2 그대로", () => {
    expect(SYSTEM_PROMPT).toContain("4개 이상은 서로 독립적인 복잡성이 실제로 각각 존재할 때만 허용합니다");
    expect(SYSTEM_PROMPT).toContain("Never compress estimated hours merely to fit the client's stated budget.");
  });
});
