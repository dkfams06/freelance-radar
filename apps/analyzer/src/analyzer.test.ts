import type Anthropic from "@anthropic-ai/sdk";
import { describe, expect, it } from "vitest";
import { buildRequestParams, interpretMessage } from "./llm";
import { renderReport, type ResultsFile } from "./results";

const analysis = {
  project_category: "ecommerce",
  project_subcategory: "자사몰",
  engagement_type: "build",
  summary: "의류 자사몰 구축과 관리자 페이지",
  required_features: ["product_catalog", "cart_checkout", "payment", "custom_size_guide"],
  required_integrations: ["payment_gateway"],
  required_platforms: ["web"],
  required_skills: ["frontend", "backend"],
  suggested_stack: ["Next.js", "Supabase"],
  vibe_coding_difficulty: 35,
  estimated_hours_min: 60,
  estimated_hours_max: 120,
  learning_value: 50,
  reusability_value: 80,
  market_value: 85,
  technical_risk: 25,
  requirement_clarity: 60,
  rationale: {
    vibe_coding_difficulty: "a",
    estimated_hours: "b",
    learning_value: "c",
    reusability_value: "d",
    market_value: "e",
    technical_risk: "f",
  },
};

const message = (over: Partial<Anthropic.Message> & { text?: string }): Anthropic.Message =>
  ({
    id: "msg_1",
    type: "message",
    role: "assistant",
    model: "claude-opus-5-5",
    stop_reason: "end_turn",
    stop_sequence: null,
    stop_details: null,
    usage: { input_tokens: 100, output_tokens: 50, cache_creation_input_tokens: 0, cache_read_input_tokens: 3000 },
    content: [{ type: "text", text: over.text ?? JSON.stringify(analysis), citations: null }],
    ...over,
  }) as unknown as Anthropic.Message;

describe("buildRequestParams", () => {
  it("uses structured output, cached system prompt and effort", () => {
    const p = buildRequestParams({ model: "claude-opus-5-5", effort: "low", maxTokens: 8000 }, "제목: x");
    expect(p.output_config?.format?.type).toBe("json_schema");
    expect(p.output_config?.effort).toBe("low");
    expect((p.system as Anthropic.TextBlockParam[])[0]!.cache_control).toEqual({ type: "ephemeral" });
    expect(JSON.stringify(p.messages)).toContain("<project>");
  });

  it("omits effort for Haiku 4.5", () => {
    const p = buildRequestParams({ model: "claude-haiku-4-5", effort: "low", maxTokens: 8000 }, "x");
    expect(p.output_config?.effort).toBeUndefined();
  });
});

describe("interpretMessage", () => {
  it("validates successful output", () => {
    const r = interpretMessage(message({}));
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.usage.cache_read_input_tokens).toBe(3000);
  });

  it("maps refusal, max_tokens and schema violations to typed errors", () => {
    const refusal = interpretMessage(message({ stop_reason: "refusal", text: "" }));
    expect(refusal.ok || refusal.errorType).toBe("REFUSAL");
    const cut = interpretMessage(message({ stop_reason: "max_tokens", text: "{" }));
    expect(cut.ok || cut.errorType).toBe("MAX_TOKENS");
    const bad = interpretMessage(message({ text: JSON.stringify({ ...analysis, market_value: 150 }) }));
    expect(bad.ok || [bad.errorType, bad.retryable]).toEqual(["VALIDATION", true]);
  });
});

describe("renderReport", () => {
  it("renders table, out-of-vocabulary codes and projection", () => {
    const r: ResultsFile = {
      analysis_version: "v1",
      model: "claude-opus-5-5",
      mode: "sync",
      created_at: "2026-10-03T00:00:00Z",
      usage_total: { input_tokens: 1000, output_tokens: 500, cache_creation_input_tokens: 0, cache_read_input_tokens: 0 },
      cost_usd_total: 0.014,
      projection_total: 5000,
      items: [
        {
          project: { id: "p1", platform: "wishket", external_project_id: "1", title: "자사몰", budget: "500만원", project_duration: "30일" },
          input_meta: { truncated: false, limited_info: false, hash: "h", chars: 100 },
          ok: true,
          analysis: analysis as never,
          usage: { input_tokens: 1000, output_tokens: 500 },
          cost_usd: 0.014,
        },
      ],
    };
    const md = renderReport(r);
    expect(md).toContain("| 1 | wishket | 자사몰 | 500만원 | ecommerce / 자사몰 |");
    expect(md).toContain("custom_size_guide(1)");
    expect(md).toContain("전체 5,000건 분석 비용 추정");
  });
});
