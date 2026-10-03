import { ANALYSIS_VERSION, buildProjectInput, estimateCostUsd, type AnalysisSourceProject } from "@fr/analysis";
import type { LlmClient } from "./llm";
import type { ResultItem } from "./results";
import type { AnalyzerStore } from "./store";

export interface RunOptions {
  concurrency: number;
  /** 같은 실행 안에서 재시도 횟수 (retryable 오류만) */
  maxAttempts: number;
  /** null 이면 DB 저장 안 함 (dry-run) */
  store: AnalyzerStore | null;
  batch?: boolean;
  log?: (msg: string) => void;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function toItemProject(p: AnalysisSourceProject): ResultItem["project"] {
  return {
    id: p.id,
    platform: p.platform,
    external_project_id: p.external_project_id,
    title: p.title,
    budget: p.budget,
    project_duration: p.project_duration,
  };
}

/** 프로젝트를 동기(Messages API)로 하나씩 분석. 결과는 검증 후 저장하고 실패는 analysis_errors 에 남긴다 */
export async function analyzeProjectsSync(llm: LlmClient, projects: AnalysisSourceProject[], opts: RunOptions): Promise<ResultItem[]> {
  const log = opts.log ?? (() => {});
  const results: ResultItem[] = new Array(projects.length);
  let next = 0;
  let done = 0;

  const worker = async () => {
    for (;;) {
      const idx = next++;
      if (idx >= projects.length) return;
      const p = projects[idx]!;
      const input = buildProjectInput(p);
      const base = {
        project: toItemProject(p),
        input_meta: { truncated: input.truncated, limited_info: input.limitedInfo, hash: input.hash, chars: input.text.length },
      };
      let attempt = 0;
      let item: ResultItem | undefined;
      let usageAcc: ResultItem["usage"] = null;
      while (!item) {
        attempt++;
        const out = await llm.analyze(input.text);
        if (out.usage) {
          usageAcc = usageAcc
            ? {
                input_tokens: usageAcc.input_tokens + out.usage.input_tokens,
                output_tokens: usageAcc.output_tokens + out.usage.output_tokens,
                cache_creation_input_tokens: (usageAcc.cache_creation_input_tokens ?? 0) + (out.usage.cache_creation_input_tokens ?? 0),
                cache_read_input_tokens: (usageAcc.cache_read_input_tokens ?? 0) + (out.usage.cache_read_input_tokens ?? 0),
              }
            : out.usage;
        }
        const cost = usageAcc ? estimateCostUsd(llm.cfg.model, usageAcc) : null;
        if (out.ok) {
          item = { ...base, ok: true, analysis: out.analysis, usage: usageAcc, cost_usd: cost, attempts: attempt };
          if (opts.store) {
            await opts.store.saveAnalysis({
              projectId: p.id,
              version: ANALYSIS_VERSION,
              model: out.model,
              analysis: out.analysis,
              input,
              usage: usageAcc,
              costUsd: cost,
            });
          }
        } else {
          if (opts.store) {
            await opts.store.recordError({
              projectId: p.id,
              version: ANALYSIS_VERSION,
              model: llm.cfg.model,
              errorType: out.errorType,
              error: out.error,
              raw: out.raw,
            });
          }
          if (!out.retryable || attempt >= opts.maxAttempts) {
            item = { ...base, ok: false, error: out.error, error_type: out.errorType, usage: usageAcc, cost_usd: cost, attempts: attempt };
          } else {
            log(`  retry ${p.platform}:${p.external_project_id} (${out.errorType}: ${out.error.slice(0, 120)})`);
            await sleep(out.errorType === "API_ERROR" ? 5000 * attempt : 500);
          }
        }
      }
      results[idx] = item;
      done++;
      log(
        `[${done}/${projects.length}] ${item.ok ? "ok  " : "FAIL"} ${p.platform}:${p.external_project_id} ${p.title?.slice(0, 40) ?? ""}` +
          (item.ok ? ` → ${item.analysis!.project_type} d=${item.analysis!.vibe_coding_difficulty}` : ` → ${item.error_type}`),
      );
    }
  };
  await Promise.all(Array.from({ length: Math.max(1, opts.concurrency) }, worker));
  return results;
}
