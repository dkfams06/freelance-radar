import { describe, expect, it } from "vitest";
import { ASIDE_DOWN_PATTERN, TAB_LOST_PATTERN, parseMarkedResult } from "./aside";

describe("Aside REPL 오류 분류", () => {
  it("탭 핸들 유실: Aside REPL 문구와 V8 문구 모두", () => {
    expect(TAB_LOST_PATTERN.test("Error: TypeError: cannot read property 'goto' of undefined")).toBe(true);
    expect(TAB_LOST_PATTERN.test("TypeError: Cannot read properties of undefined (reading 'evaluate')")).toBe(true);
    expect(TAB_LOST_PATTERN.test("Target page, context or browser has been closed")).toBe(true);
    expect(TAB_LOST_PATTERN.test("TimeoutError: page.goto: Timeout 60000ms exceeded")).toBe(false);
  });

  it("Aside 데몬 중단", () => {
    expect(ASIDE_DOWN_PATTERN.test("fetch failed: connect ECONNREFUSED 127.0.0.1:21420\nAside isn't running on this machine.")).toBe(true);
    expect(ASIDE_DOWN_PATTERN.test("HTTP 500")).toBe(false);
  });

  it("마커 결과 파싱", () => {
    expect(parseMarkedResult<{ a: number }>("✔︎ Opened a new tab\n__FR_RESULT__{\"a\":1}")).toEqual({ a: 1 });
  });
});
