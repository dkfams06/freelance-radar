import { describe, expect, it } from "vitest";
import { normalizeFreemoa, workTypeLabel } from "./normalize";
import type { FreemoaRaw } from "./types";
import open from "./__fixtures__/detail-48501.json";
import stay from "./__fixtures__/detail-47597.json";
import restricted from "./__fixtures__/detail-47599.json";

const norm = (f: { externalId: string; url: string; payload: unknown }) =>
  normalizeFreemoa(f.payload as FreemoaRaw, f.externalId, f.url);

describe("normalizeFreemoa", () => {
  it("도급 프로젝트: 만원 단위 예산 → 원, 등록 시각 KST", () => {
    const p = norm(open);
    expect(p).toMatchObject({
      platform: "freemoa",
      externalProjectId: "48501",
      title: "기존 웹/앱 서비스 고도화 및 추가 개발",
      budget: "2,500,000원 ~ 5,000,000원",
      budgetMin: 2_500_000,
      budgetMax: 5_000_000,
      budgetType: "fixed",
      durationDays: 40,
      projectType: "도급",
      workMethod: "도급",
      existingSystem: "기존 시스템 (유지보수)",
      planningStatus: "필요기능 정리",
      location: "서울 은평구",
      category: "개발",
      subcategory: "웹",
    });
    expect(p.registeredAt?.toISOString()).toBe("2026-10-01T02:30:33.000Z"); // 11:30:33 KST
    expect(p.deadlineAt?.toISOString()).toBe("2026-10-17T15:00:00.000Z");
    expect(p.skills).toEqual(["Vue", "AOS", "iOS", "Supabase", "backend", "유지보수"]);
    expect(p.applicantCount).toBeGreaterThanOrEqual(8);
    expect(p.extra.escrow).toBe(true);
    expect(p.extra.detailRestricted).toBe(false);
  });

  it("기간제 상주: 월 단위 예산", () => {
    const p = norm(stay);
    expect(p).toMatchObject({ projectType: "기간제 상주", budgetType: "monthly", budgetMin: 2_800_000, projectStatus: "모집 마감" });
    expect(p.existingSystem).toBe("신규");
  });

  it("상세 열람 제한: 목록 데이터만으로 저장하고 플래그 표시", () => {
    const p = norm(restricted);
    expect(p.extra.detailRestricted).toBe(true);
    expect(p.extra.detailMessage).toMatch(/견적 요청/);
    expect(p.title).toContain("B2B 인쇄물");
    expect(p.budgetMin).toBe(9_800_000);
    expect(p.registeredAt?.toISOString()).toBe("2025-09-29T07:38:48.000Z");
  });

  it("raw 에 내 계정/타 사용자 식별정보가 없다", () => {
    for (const f of [open, stay, restricted]) {
      const s = JSON.stringify(f.payload);
      expect(s).not.toMatch(/myId|my_apply|company_userid|client_id/);
      expect(s).not.toMatch(/"id":/);
    }
  });
});

describe("workTypeLabel", () => {
  it("사이트 표기 규칙과 동일", () => {
    expect(workTypeLabel("1", "0")).toBe("도급");
    expect(workTypeLabel("2", "0")).toBe("시간제 상주");
    expect(workTypeLabel("3", "1")).toBe("기간제 상주");
    expect(workTypeLabel(null, "1")).toBe("상주");
    expect(workTypeLabel(null, "0")).toBe("도급");
  });
});
