import { describe, expect, it } from "vitest";
import {
  FEATURE_CODES,
  FEATURES,
  computeRepetitionReport,
  extractFeatures,
  featureTextLines,
  frequentBundles,
  jaccard,
  mapAnalysisCode,
  prevalence,
  renderRepetitionReport,
  similarityStats,
  templateCandidate,
  type FeatureCode,
  type FeatureRow,
} from "./index";

describe("feature vocabulary f1", () => {
  it("has 30~60 features and every alias maps to exactly the features that declare it", () => {
    expect(FEATURE_CODES.length).toBeGreaterThanOrEqual(30);
    expect(FEATURE_CODES.length).toBeLessThanOrEqual(60);
    for (const f of FEATURE_CODES) for (const a of FEATURES[f].aliases) expect(mapAnalysisCode(a)).toContain(f);
  });

  it("maps analyzer codes via alias first, then code pattern, and ignores non-feature codes", () => {
    expect(mapAnalysisCode("kakao_login")).toEqual(["social_login"]);
    expect(mapAnalysisCode("approval_workflow").sort()).toEqual(["approval", "workflow"]);
    expect(mapAnalysisCode("partner_settlement_report")).toContain("settlement");
    expect(mapAnalysisCode("api_endpoint_docs")).not.toContain("point_coupon");
    expect(mapAnalysisCode("bug_fix_maintenance")).toEqual([]);
    expect(mapAnalysisCode("totally_unknown_thing")).toEqual([]);
  });
});

describe("extractFeatures", () => {
  it("combines analysis codes and explicit description keywords with evidence", () => {
    const r = extractFeatures({
      required_features: ["authentication", "admin_dashboard", "custom_widget"],
      required_integrations: ["payment_gateway"],
      title: "예약 플랫폼 구축",
      description: "회원가입 후 예약하고 엑셀로 다운로드합니다.\n관리자 페이지에서 정산을 확인합니다.",
    });
    expect(r.features).toEqual(
      expect.arrayContaining(["authentication", "admin_dashboard", "payment", "reservation", "excel_import_export", "settlement"]),
    );
    expect(r.evidence.authentication).toEqual({ analysis: ["authentication"], text: ["회원가입"] });
    expect(r.evidence.payment).toEqual({ analysis: ["payment_gateway"], text: [] });
    expect(r.unmapped).toEqual(["custom_widget"]);
  });

  it("does not infer features from contract/eligibility lines or absent text", () => {
    const r = extractFeatures({
      description: "계약 방식: 도급 (에스크로 결제)\n우대 사항: PG 결제 연동 경험이 있으신 분\n코드 리뷰 문화가 있습니다\n핵심 포인트는 속도입니다",
    });
    expect(r.features).toEqual([]);
    expect(featureTextLines("근무 형태: 상주\n로그인 기능")).toEqual(["로그인 기능"]);
  });
});

const rows = (spec: [string, FeatureCode[]][]): FeatureRow[] => spec.map(([t, f], i) => ({ project_id: `p${i}`, project_type: t, features: f }));

describe("repetition statistics", () => {
  const A: FeatureCode[] = ["authentication", "admin_dashboard", "role_permission", "statistics_dashboard"];
  const data = rows([
    ["business_management", A],
    ["business_management", A],
    ["business_management", [...A, "excel_import_export"]],
    ["business_management", ["authentication", "admin_dashboard", "approval"]],
    ["business_management", []],
    ["website", ["landing_seo"]],
    ["website", ["inquiry_support"]],
  ]);

  it("computes prevalence and Jaccard similarity (excluding empty sets)", () => {
    expect(jaccard(["a", "b"], ["b", "c"])).toBeCloseTo(1 / 3);
    const bm = data.filter((r) => r.project_type === "business_management");
    expect(prevalence(bm)[0]).toMatchObject({ feature: "admin_dashboard", count: 4, share: 0.8 });
    const s = similarityStats(bm);
    expect(s.projects).toBe(4);
    expect(s.pairs).toBe(6);
    expect(s.share_ge_70).toBeCloseTo(3 / 6);
  });

  it("finds maximal frequent bundles with min support", () => {
    const bm = data.filter((r) => r.project_type === "business_management");
    const { bundles } = frequentBundles(bm, 3);
    expect(bundles[0]).toMatchObject({ features: [...A].sort(), support: 3 });
    expect(bundles.some((b) => b.features.length === 2 && b.features.includes("authentication") && b.features.includes("admin_dashboard"))).toBe(false);
  });

  it("builds template candidate and a report with answers", () => {
    const bm = data.filter((r) => r.project_type === "business_management");
    const t = templateCandidate(bm, prevalence(bm));
    expect(t.core).toEqual(expect.arrayContaining(["admin_dashboard", "authentication", "role_permission", "statistics_dashboard"]));
    expect(t.coverage!).toBeGreaterThan(0.8);
    const r = computeRepetitionReport(data, {
      projectTypes: ["business_management", "website", "saas"],
      analysisVersion: "v3.3",
      featureVersion: "f1",
      scope: "test",
      minSupport: 3,
      lowSampleN: 2,
    });
    expect(r.types.map((x) => x.project_type)).toEqual(["business_management", "website"]);
    expect(r.answers.highest_repetition[0]).toBe("business_management");
    expect(r.answers.least_repetitive[0]).toBe("website");
    const md = renderRepetitionReport(r);
    expect(md).toContain("| business_management | 5 |");
    expect(md).toContain("요구사항 반복률이 가장 높은 유형: business_management");
  });
});

describe("featureTextLines section/negation rules", () => {
  it("skips excluded sections until the next header, and negated lines", () => {
    const text = [
      "※ 상세 업무",
      "- 관리자 페이지 구현",
      "- 별도의 회원/로그인 기능은 필요하지 않습니다",
      "- 1회 1상품, 장바구니 없음",
      "※ 우대 사항",
      "- 키오스크/POS 개발",
      "- 엑셀 처리",
      "※ 참고 사항",
      "- 발주사 명의로 계정 생성",
      "- 산출물 리뷰 및 품질 관리",
    ].join("\n");
    expect(featureTextLines(text)).toEqual(["- 관리자 페이지 구현", "- 발주사 명의로 계정 생성", "- 산출물 리뷰 및 품질 관리"]);
    const r = extractFeatures({ description: text });
    expect(r.features).toEqual(["admin_dashboard"]);
  });
});

describe("vocabulary document", () => {
  it("docs/feature-vocabulary-f1.md lists every feature code", async () => {
    const { readFileSync } = await import("node:fs");
    const doc = readFileSync(new URL("../../../docs/feature-vocabulary-f1.md", import.meta.url), "utf8");
    for (const f of FEATURE_CODES) expect(doc).toContain(`\`${f}\``);
  });
});
