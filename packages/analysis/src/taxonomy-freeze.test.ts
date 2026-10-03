import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import {
  ANALYSIS_VERSION,
  COMPLEXITY_TYPE_CODES,
  ENGAGEMENT_TYPE_CODES,
  INDUSTRY_CODES,
  PROJECT_TYPE_CODES,
  REUSE_LEVEL_CODES,
  SYSTEM_PROMPT,
  TECHNOLOGY_ASSETS,
} from "./index";

/**
 * v3.3 taxonomy 동결 가드.
 * 이 테스트가 깨지면 분류 코드나 프롬프트가 바뀐 것이다. 전체 분석(Batch) 결과의 일관성이 깨지므로
 * 의도한 변경이라면 새 analysis_version 으로 올리고 사용자 승인 후 이 값을 함께 갱신한다.
 * (분석 결과는 (project_id, analysis_version) 으로 저장되어 서로 덮어쓰지 않는다.)
 */
describe("taxonomy v3.3 freeze", () => {
  it("analysis_version", () => {
    expect(ANALYSIS_VERSION).toBe("v3.3");
  });

  it("project_type", () => {
    expect([...PROJECT_TYPE_CODES]).toEqual(["website", "ecommerce", "reservation", "admin_backoffice", "business_management", "saas", "platform_marketplace", "mobile_app", "ai_service", "crawler_data_collection", "automation_rpa", "data_dashboard", "fintech_payment", "iot_device", "media_processing", "enterprise_infra", "qa_testing", "other"]);
  });

  it("engagement_type", () => {
    expect([...ENGAGEMENT_TYPE_CODES]).toEqual(["new_build", "feature_extension", "renewal", "maintenance", "bug_fix", "migration", "consulting", "staffing", "design_publishing", "other"]);
  });

  it("industry", () => {
    expect([...INDUSTRY_CODES]).toEqual(["general", "commerce", "education", "healthcare", "finance", "real_estate", "travel_hospitality", "logistics", "manufacturing", "professional_services", "public_sector", "media_content", "sports", "food", "construction", "mobility", "hr", "other"]);
  });

  it("complexity_types", () => {
    expect([...COMPLEXITY_TYPE_CODES]).toEqual(["standard_crud", "integration_heavy", "workflow_complex", "realtime", "legacy_heavy", "high_risk_domain", "hardware_iot", "algorithmic_specialized", "multi_platform", "other"]);
  });

  it("reuse_level (원본 4단계)", () => {
    expect([...REUSE_LEVEL_CODES]).toEqual(["high", "medium", "low", "one_off"]);
  });

  it("technology_assets", () => {
    expect([...TECHNOLOGY_ASSETS]).toEqual(["core_web", "backend_api", "database", "authentication_authorization", "admin_system", "saas_architecture", "payments", "ai_llm", "rag_embeddings", "ai_agents", "browser_automation", "web_crawling", "workflow_automation", "data_pipeline", "analytics_dashboard", "external_api_integration", "mobile", "cloud_infra", "docker", "ci_cd", "realtime", "legacy_enterprise", "hardware_iot", "security", "computer_vision", "speech_audio_ai", "ocr_document_ai", "test_automation", "other"]);
  });

  it("시스템 프롬프트 (sha256)", () => {
    expect(createHash("sha256").update(SYSTEM_PROMPT).digest("hex")).toBe("49f87294e109b7a2e77ca7ceb3899e1e368eb692d8f5b17888fbb5d61c21ab6b");
  });
});
