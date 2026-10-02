import { describe, expect, it } from "vitest";
import { parseBudgetRange, parseDurationDays, parseKrwAmount, parseKstDate, parseRelativeKoreanTime } from "./utils";

describe("parseKstDate", () => {
  it.each([
    ["2026-10-02 14:17:40", "2026-10-02T05:17:40.000Z"],
    ["2026.10.02.", "2026-10-01T15:00:00.000Z"],
    ["등록일자 2026.10.02.", "2026-10-01T15:00:00.000Z"],
    ["2026년 10월 15일", "2026-10-14T15:00:00.000Z"],
    ["2026.10.02. 오후 17:10", "2026-10-02T08:10:00.000Z"],
    ["25.10.02", "2025-10-01T15:00:00.000Z"],
  ])("%s", (input, iso) => {
    expect(parseKstDate(input)?.toISOString()).toBe(iso);
  });
  it("빈 값은 null", () => {
    expect(parseKstDate(null)).toBeNull();
    expect(parseKstDate("협의")).toBeNull();
  });
});

describe("금액/기간", () => {
  it("parseKrwAmount", () => {
    expect(parseKrwAmount("1,500만원")).toBe(15_000_000);
    expect(parseKrwAmount("1억 2,000만원")).toBe(120_000_000);
    expect(parseKrwAmount("5,000,000원")).toBe(5_000_000);
    expect(parseKrwAmount("협의")).toBeNull();
  });
  it("parseBudgetRange", () => {
    expect(parseBudgetRange("2,500,000원 ~ 5,000,000원")).toEqual({ min: 2_500_000, max: 5_000_000 });
    expect(parseBudgetRange("500~1,000만원")).toEqual({ min: 5_000_000, max: 10_000_000 });
    expect(parseBudgetRange("15,000,000원")).toEqual({ min: 15_000_000, max: 15_000_000 });
  });
  it("parseDurationDays", () => {
    expect(parseDurationDays("45일")).toBe(45);
    expect(parseDurationDays("3개월")).toBe(90);
    expect(parseDurationDays("2주")).toBe(14);
  });
  it("parseRelativeKoreanTime", () => {
    const now = new Date("2026-10-02T00:00:00Z");
    expect(parseRelativeKoreanTime("3일 전", now)?.toISOString()).toBe("2026-09-29T00:00:00.000Z");
  });
});

describe("cleanText", () => {
  it("CRLF 정리와 공백 압축", async () => {
    const { cleanText } = await import("./utils");
    expect(cleanText("a\r\nb\r\n\r\n\r\n\r\nc  d")).toBe("a\nb\n\nc d");
    expect(cleanText("   ")).toBeNull();
  });
});
