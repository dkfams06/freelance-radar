/**
 * 모델 단가 (USD / 1M tokens, Anthropic 1st-party, 2026-09 기준).
 * Batch API 는 모든 토큰 50% 할인. cache write 1.25x, cache read 0.1x.
 */
export const MODEL_PRICING: Record<string, { input: number; output: number }> = {
  "claude-opus-5-5": { input: 4, output: 20 },
  "claude-sonnet-5-5": { input: 2, output: 10 },
  "claude-haiku-4-5": { input: 1, output: 5 },
};

export interface TokenUsage {
  input_tokens: number;
  output_tokens: number;
  cache_creation_input_tokens?: number | null;
  cache_read_input_tokens?: number | null;
}

export function estimateCostUsd(model: string, usage: TokenUsage, opts: { batch?: boolean } = {}): number | null {
  const p = MODEL_PRICING[model];
  if (!p) return null;
  const m = opts.batch ? 0.5 : 1;
  const input =
    usage.input_tokens * p.input +
    (usage.cache_creation_input_tokens ?? 0) * p.input * 1.25 +
    (usage.cache_read_input_tokens ?? 0) * p.input * 0.1;
  return ((input + usage.output_tokens * p.output) * m) / 1_000_000;
}

export function addUsage(a: TokenUsage, b: TokenUsage): TokenUsage {
  return {
    input_tokens: a.input_tokens + b.input_tokens,
    output_tokens: a.output_tokens + b.output_tokens,
    cache_creation_input_tokens: (a.cache_creation_input_tokens ?? 0) + (b.cache_creation_input_tokens ?? 0),
    cache_read_input_tokens: (a.cache_read_input_tokens ?? 0) + (b.cache_read_input_tokens ?? 0),
  };
}

export const ZERO_USAGE: TokenUsage = { input_tokens: 0, output_tokens: 0, cache_creation_input_tokens: 0, cache_read_input_tokens: 0 };
