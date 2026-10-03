import { MODEL_PRICING, estimateCostUsd } from "./cost";

/**
 * 전체 분류 실행 전 비용/토큰 추정 (API 호출 없음).
 * 토큰 수는 문자 수 기반 근사치다: 한글 음절 1자 ≈ 1 token, 그 외 3.5자 ≈ 1 token.
 * API 키가 있으면 CLI 가 count_tokens 로 보정 계수를 구해 넘긴다.
 */
export function approxTokens(text: string): number {
  const hangul = (text.match(/[가-힣]/g) ?? []).length;
  return Math.ceil(hangul + (text.length - hangul) / 3.5);
}

export interface EstimateInput {
  projectCount: number;
  /** 요청 1건의 system 프롬프트 + output schema 토큰 */
  systemTokens: number;
  /** 프로젝트 입력(user message) 토큰 합계 */
  totalInputTokens: number;
  /** 건당 예상 출력 토큰 (JSON + thinking) */
  outputTokensPerItem: Record<string, number>;
  batchChunkSize: number;
}

export interface ModelEstimate {
  model: string;
  input_tokens: number;
  output_tokens: number;
  sync_usd: number;
  /** 동기 호출 + system prompt cache 적중 가정 (첫 요청 이후 cache read) */
  sync_cached_usd: number;
  batch_usd: number;
}

export interface Estimate {
  project_count: number;
  api_calls_sync: number;
  batch_submissions: number;
  models: ModelEstimate[];
}

export function estimateRun(e: EstimateInput): Estimate {
  const n = e.projectCount;
  const models = Object.keys(MODEL_PRICING).map((model) => {
    const out = (e.outputTokensPerItem[model] ?? 1500) * n;
    const input = e.systemTokens * n + e.totalInputTokens;
    const sync = estimateCostUsd(model, { input_tokens: input, output_tokens: out })!;
    const cached = estimateCostUsd(model, {
      input_tokens: e.totalInputTokens,
      output_tokens: out,
      cache_creation_input_tokens: n ? e.systemTokens : 0,
      cache_read_input_tokens: Math.max(0, n - 1) * e.systemTokens,
    })!;
    return {
      model,
      input_tokens: input,
      output_tokens: out,
      sync_usd: sync,
      sync_cached_usd: cached,
      batch_usd: estimateCostUsd(model, { input_tokens: input, output_tokens: out }, { batch: true })!,
    };
  });
  return {
    project_count: n,
    api_calls_sync: n,
    batch_submissions: Math.ceil(n / e.batchChunkSize),
    models,
  };
}

/** v2 출력(JSON 약 900~1,100 토큰) + low effort thinking 가정. 실제 20건 실행 결과로 교체할 값 */
export const DEFAULT_OUTPUT_TOKENS: Record<string, number> = {
  "claude-opus-5-5": 2200,
  "claude-sonnet-5-5": 2200,
  "claude-haiku-4-5": 1100,
};

export function renderEstimate(est: Estimate, note: string): string {
  const L = [
    `- 분석 대상: ${est.project_count.toLocaleString()}건`,
    `- API 호출 수: 동기 ${est.api_calls_sync.toLocaleString()}회 / Batch 제출 ${est.batch_submissions}회 (요청 ${est.project_count.toLocaleString()}건)`,
    `- ${note}`,
    "",
    "| 모델 | input tokens | output tokens | 동기 | 동기+캐시 | Batch |",
    "|---|---|---|---|---|---|",
  ];
  for (const m of est.models) {
    L.push(
      `| ${m.model} | ${m.input_tokens.toLocaleString()} | ${m.output_tokens.toLocaleString()} | $${m.sync_usd.toFixed(2)} | $${m.sync_cached_usd.toFixed(2)} | $${m.batch_usd.toFixed(2)} |`,
    );
  }
  return L.join("\n");
}
