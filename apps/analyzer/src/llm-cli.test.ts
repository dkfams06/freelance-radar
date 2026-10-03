import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { ClaudeCliClient, interpretCliOutput } from "./llm-cli";

const sample = JSON.parse(
  readFileSync(path.resolve(import.meta.dirname, "../../../docs/analyzer-v3-sample-20.json"), "utf8"),
) as { items: Array<{ analysis: Record<string, unknown> }> };
const validAnalysis = sample.items.find((i) => i.analysis.project_type !== "maintenance")!.analysis;

const cliJson = (over: Record<string, unknown>) =>
  JSON.stringify({
    type: "result",
    subtype: "success",
    is_error: false,
    result: "",
    usage: { input_tokens: 1200, output_tokens: 600, cache_creation_input_tokens: 0, cache_read_input_tokens: 3000 },
    modelUsage: { "claude-sonnet-5-5": {} },
    ...over,
  });

describe("interpretCliOutput", () => {
  it("structured_output 을 스키마 검증 후 사용하고 사용량/모델을 기록", () => {
    const out = interpretCliOutput(cliJson({ structured_output: validAnalysis }), "fallback");
    expect(out.ok).toBe(true);
    if (out.ok) {
      expect(out.model).toBe("claude-sonnet-5-5");
      expect(out.usage).toMatchObject({ input_tokens: 1200, output_tokens: 600, cache_read_input_tokens: 3000 });
    }
  });

  it("structured_output 이 없으면 result 텍스트(JSON)를 파싱", () => {
    const out = interpretCliOutput(cliJson({ result: JSON.stringify(validAnalysis) }), "m");
    expect(out.ok).toBe(true);
  });

  it("로그인 만료(401)는 재시도하지 않는다", () => {
    const out = interpretCliOutput(
      cliJson({ is_error: true, api_error_status: 401, result: "Failed to authenticate. OAuth access token has expired." }),
      "m",
    );
    expect(out).toMatchObject({ ok: false, errorType: "API_ERROR", retryable: false });
  });

  it("과부하 등 다른 오류는 재시도 대상", () => {
    const out = interpretCliOutput(cliJson({ is_error: true, api_error_status: 529, result: "Overloaded" }), "m");
    expect(out).toMatchObject({ ok: false, retryable: true });
  });

  it("스키마 위반은 VALIDATION (재시도 대상)", () => {
    const out = interpretCliOutput(cliJson({ structured_output: { ...validAnalysis, project_type: "not_a_project_type" } }), "m");
    expect(out).toMatchObject({ ok: false, errorType: "VALIDATION", retryable: true });
  });

  it("JSON 이 아닌 출력", () => {
    expect(interpretCliOutput("oops", "m")).toMatchObject({ ok: false, retryable: true });
  });
});

describe("ClaudeCliClient.buildArgs", () => {
  it("도구 없이 같은 시스템 프롬프트/스키마로 헤드리스 실행", () => {
    const args = new ClaudeCliClient({ model: "claude-sonnet-5-5", effort: "low", maxTokens: 8000 }).buildArgs();
    expect(args).toEqual(expect.arrayContaining(["-p", "--output-format", "json", "--model", "claude-sonnet-5-5", "--json-schema", "--no-session-persistence"]));
    expect(args[args.indexOf("--tools") + 1]).toBe("");
  });
});
