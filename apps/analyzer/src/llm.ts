import Anthropic from "@anthropic-ai/sdk";
import {
  ANALYSIS_JSON_SCHEMA,
  SYSTEM_PROMPT,
  buildUserMessage,
  parseAnalysisText,
  type ProjectAnalysis,
  type TokenUsage,
} from "@fr/analysis";

export interface LlmConfig {
  model: string;
  /** low | medium | high — 분류/추출 작업이라 기본 low */
  effort: "low" | "medium" | "high";
  maxTokens: number;
}

export function loadLlmConfig(env = process.env): LlmConfig {
  return {
    model: env.ANALYZER_MODEL || "claude-opus-5-5",
    effort: (env.ANALYZER_EFFORT as LlmConfig["effort"]) || "low",
    maxTokens: Number(env.ANALYZER_MAX_TOKENS || 8000),
  };
}

// 요청마다 같은 schema 객체 → 같은 바이트 (문법 컴파일 캐시 재사용)
const OUTPUT_FORMAT = { type: "json_schema" as const, schema: ANALYSIS_JSON_SCHEMA };

/** 동기 호출과 Batch 요청에 공통으로 쓰는 요청 본문 */
export function buildRequestParams(cfg: LlmConfig, inputText: string): Anthropic.MessageCreateParamsNonStreaming {
  // Haiku 4.5 는 effort 를 지원하지 않는다
  const supportsEffort = !cfg.model.startsWith("claude-haiku");
  return {
    model: cfg.model,
    max_tokens: cfg.maxTokens,
    // 시스템 프롬프트는 모든 요청에서 동일 → prompt cache 대상
    system: [{ type: "text", text: SYSTEM_PROMPT, cache_control: { type: "ephemeral" } }],
    messages: [{ role: "user", content: buildUserMessage(inputText) }],
    output_config: { format: OUTPUT_FORMAT, ...(supportsEffort ? { effort: cfg.effort } : {}) },
  };
}

export type AnalyzeOutcome =
  | { ok: true; analysis: ProjectAnalysis; usage: TokenUsage; model: string }
  | { ok: false; errorType: AnalysisErrorType; error: string; raw?: string; usage?: TokenUsage; retryable: boolean };

export type AnalysisErrorType = "API_ERROR" | "VALIDATION" | "REFUSAL" | "MAX_TOKENS" | "EXPIRED";

export function usageOf(u: Anthropic.Usage): TokenUsage {
  return {
    input_tokens: u.input_tokens,
    output_tokens: u.output_tokens,
    cache_creation_input_tokens: u.cache_creation_input_tokens ?? 0,
    cache_read_input_tokens: u.cache_read_input_tokens ?? 0,
  };
}

/** 모델 응답 메시지 → 검증된 분석 결과 (sync/batch 공용) */
export function interpretMessage(msg: Anthropic.Message): AnalyzeOutcome {
  const usage = usageOf(msg.usage);
  const text = msg.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("");
  if (msg.stop_reason === "refusal") {
    return { ok: false, errorType: "REFUSAL", error: `refusal: ${msg.stop_details?.category ?? "unknown"}`, raw: text, usage, retryable: false };
  }
  if (msg.stop_reason === "max_tokens") {
    return { ok: false, errorType: "MAX_TOKENS", error: "hit max_tokens", raw: text, usage, retryable: true };
  }
  const v = parseAnalysisText(text);
  if (!v.ok) return { ok: false, errorType: "VALIDATION", error: v.error, raw: text, usage, retryable: true };
  return { ok: true, analysis: v.value, usage, model: msg.model };
}

/** 동기 분석에 필요한 최소 인터페이스 (Messages API / claude -p 공용) */
export interface SyncLlm {
  readonly cfg: LlmConfig;
  analyze(inputText: string): Promise<AnalyzeOutcome>;
}

export type LlmBackend = "api" | "claude-cli";

export function llmBackend(env = process.env): LlmBackend {
  return env.ANALYZER_BACKEND === "claude-cli" ? "claude-cli" : "api";
}

export class LlmClient implements SyncLlm {
  readonly client: Anthropic;
  constructor(readonly cfg: LlmConfig) {
    // 자격증명: ANTHROPIC_API_KEY (또는 SDK 가 지원하는 다른 방식)
    this.client = new Anthropic({ maxRetries: 4 });
  }

  async analyze(inputText: string): Promise<AnalyzeOutcome> {
    try {
      const msg = await this.client.messages.create(buildRequestParams(this.cfg, inputText));
      return interpretMessage(msg);
    } catch (e) {
      const retryable =
        e instanceof Anthropic.RateLimitError ||
        e instanceof Anthropic.InternalServerError ||
        e instanceof Anthropic.APIConnectionError ||
        (e instanceof Anthropic.APIError && (e.status ?? 0) >= 500);
      return { ok: false, errorType: "API_ERROR", error: e instanceof Error ? e.message : String(e), retryable };
    }
  }

  async submitBatch(items: { customId: string; inputText: string }[]) {
    return this.client.messages.batches.create({
      requests: items.map((it) => ({ custom_id: it.customId, params: buildRequestParams(this.cfg, it.inputText) })),
    });
  }

  retrieveBatch(id: string) {
    return this.client.messages.batches.retrieve(id);
  }

  async *batchResults(id: string): AsyncGenerator<{ customId: string; outcome: AnalyzeOutcome }> {
    for await (const r of await this.client.messages.batches.results(id)) {
      const res = r.result;
      if (res.type === "succeeded") {
        yield { customId: r.custom_id, outcome: interpretMessage(res.message) };
      } else if (res.type === "errored") {
        yield {
          customId: r.custom_id,
          outcome: { ok: false, errorType: "API_ERROR", error: JSON.stringify(res.error).slice(0, 500), retryable: true },
        };
      } else {
        yield { customId: r.custom_id, outcome: { ok: false, errorType: "EXPIRED", error: res.type, retryable: true } };
      }
    }
  }
}
