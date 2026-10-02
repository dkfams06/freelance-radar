import { describe, expect, it } from "vitest";
import { normalizeWishket, budgetTypeOf, parseDeadline, cleanStatusMark } from "./normalize";
import type { WishketRaw } from "./types";
import term from "./__fixtures__/detail-158896.json";
import outsource from "./__fixtures__/detail-158857.json";
import priv from "./__fixtures__/detail-158894.json";

const norm = (f: { externalId: string; url: string; payload: unknown }) =>
  normalizeWishket(f.payload as WishketRaw, f.externalId, f.url);

describe("normalizeWishket", () => {
  it("기간제(상주) 프로젝트: 모집 대상 금액을 월 단위 예산으로", () => {
    const p = norm(term);
    expect(p).toMatchObject({
      platform: "wishket",
      externalProjectId: "158896",
      title: "Java 기반 녹취 솔루션 구축 PL",
      projectType: "기간제",
      projectStatus: "모집 중",
      budget: "5,500,000원/월",
      budgetType: "monthly",
      budgetMin: 5_500_000,
      budgetMax: 5_500_000,
      durationDays: 180,
      applicantCount: 0,
      category: "PL (프로젝트 리더)",
      workMethod: "상주",
      location: "서울특별시 영등포구",
      skills: ["Java"],
      requiredStack: ["Java"],
    });
    expect(p.registeredAt?.toISOString()).toBe("2026-10-01T15:00:00.000Z"); // 2026-10-02 KST
    expect(p.deadlineAt?.toISOString()).toBe("2026-10-16T14:59:59.000Z"); // 2026-10-16 23:59:59 KST
    expect(p.extra.industry).toEqual(["IT•정보통신업"]);
    expect(p.extra.target).toMatchObject({ level: "시니어", experience: "7년 차 이상" });
    expect(p.description).toContain("녹취 솔루션");
  });

  it("외주 프로젝트: 예상 금액/기획 상태/진행 분류", () => {
    const p = norm(outsource);
    expect(p).toMatchObject({
      projectType: "외주",
      budget: "350,000원",
      budgetType: "fixed",
      budgetMin: 350_000,
      durationDays: 3,
      applicantCount: 7,
      category: "개발",
      subcategory: "웹",
      planningStatus: "필요한 내용을 간단히 정리한 상태",
      existingSystem: "운영 중인 서비스의 리뉴얼 또는 유지보수를 하려 합니다.",
      workMethod: "도급",
    });
    expect(p.skills.length).toBeGreaterThan(0);
    expect(p.clientInfo?.name).toMatch(/\*/);
  });

  it("프라이빗 매칭: 안내 문구는 description 으로 저장하지 않고 지원자 수 비공개는 null", () => {
    const p = norm(priv);
    expect(p.extra.privateMatching).toBe(true);
    expect(p.description).toBeNull();
    expect(p.applicantCount).toBeNull();
    expect(p.projectStatus).toBe("모집 중");
    expect(p.budgetMin).toBe(40_000_000);
  });

  it("raw payload 와 텍스트를 보존", () => {
    const p = norm(outsource);
    expect(p.rawPayload).toBe(outsource.payload);
    expect(p.rawText).toBeTruthy();
  });
});

describe("helpers", () => {
  it("budgetTypeOf", () => {
    expect(budgetTypeOf("협의 후 결정", "외주")).toBe("negotiable");
    expect(budgetTypeOf("7,300,000원 /월", "기간제")).toBe("monthly");
    expect(budgetTypeOf("15,000,000원", "외주")).toBe("fixed");
  });
  it("parseDeadline: 한국어 날짜 → 당일 마지막 시각(KST)", () => {
    expect(parseDeadline("2026년 10월 15일")?.toISOString()).toBe("2026-10-15T14:59:59.000Z");
  });
  it("cleanStatusMark", () => {
    expect(cleanStatusMark("프라이빗 매칭PRIME·PRO·BOOST 파트너에게만공개되는")).toBe("프라이빗 매칭");
  });
});
