import { writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import { parseArgs } from "node:util";
import { createServiceClient } from "@fr/db";
import {
  ANALYSIS_VERSION,
  buildProjectInput,
  estimateCostUsd,
  validateAnalysis,
  type AnalysisSourceProject,
  type TokenUsage,
} from "@fr/analysis";
import { LlmClient, loadLlmConfig } from "./llm";
import { OUT_DIR, readResults, summarizeUsage, writeResults, type ResultItem, type ResultsFile } from "./results";
import { analyzeProjectsSync, toItemProject } from "./runner";
import { AnalyzerStore } from "./store";

const USAGE = `
freelance-radar analyzer (${ANALYSIS_VERSION})

사용법: pnpm analyzer <command> [options]

commands:
  sample          플랫폼별 최신 프로젝트 n 건을 동기 분석 → DB 저장 + 리포트 (기본 wishket 10, freemoa 10)
  run             미분석 프로젝트를 동기(Messages API) 분석
  batch-submit    미분석 프로젝트를 Message Batches API 로 제출 (50% 할인, 보통 1시간 이내 완료)
  batch-collect   제출한 batch 결과 회수 → 검증 → 저장 (--wait: 끝날 때까지 대기)
  export-inputs   샘플 프로젝트의 분석 입력 텍스트를 파일로 저장 (프롬프트 검토용)
  import <file>   결과 파일(.out/*.json)의 분석을 스키마 재검증 후 DB 저장
  report <file>   결과 파일로 Markdown 리포트 재생성

options:
  --wishket <n> --freemoa <n>   sample / export-inputs 건수
  --platform <p>                run / batch-submit 대상 플랫폼
  --limit <n>                   run / batch-submit 최대 건수
  --retry-failed                run / batch-submit: 미해결 실패 건만
  --force                       이미 분석된 프로젝트도 다시 분석 (같은 버전 덮어쓰기)
  --concurrency <n>             동기 분석 동시 요청 수 (기본 4)
  --dry-run                     DB 에 쓰지 않음 (결과 파일만)
  --wait                        batch-collect: 완료까지 1분 간격 대기

env: ANTHROPIC_API_KEY, ANALYZER_MODEL (기본 claude-opus-5-5), ANALYZER_EFFORT (기본 low), ANALYZER_MAX_TOKENS (기본 8000)
`;

const log = (m: string) => console.log(m);
const stamp = () => new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);

async function main() {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: {
      wishket: { type: "string" },
      freemoa: { type: "string" },
      platform: { type: "string" },
      limit: { type: "string" },
      "retry-failed": { type: "boolean" },
      force: { type: "boolean" },
      concurrency: { type: "string" },
      "dry-run": { type: "boolean" },
      wait: { type: "boolean" },
      help: { type: "boolean", short: "h" },
    },
  });
  const [command, rawArg] = positionals;
  // pnpm --filter 는 패키지 디렉터리에서 실행되므로 상대 경로는 호출한 위치(INIT_CWD) 기준으로 푼다
  const arg = rawArg ? path.resolve(process.env.INIT_CWD ?? process.cwd(), rawArg) : undefined;
  if (!command || values.help) {
    console.log(USAGE);
    return;
  }
  const num = (v: string | undefined, d: number) => (v === undefined ? d : Number(v));
  const db = createServiceClient();
  const store = new AnalyzerStore(db);
  const dryRun = Boolean(values["dry-run"]);

  const sampleProjects = async () => {
    const w = await store.latestProjects("wishket", num(values.wishket, 10));
    const f = await store.latestProjects("freemoa", num(values.freemoa, 10));
    return [...w, ...f];
  };

  switch (command) {
    case "export-inputs": {
      const projects = await sampleProjects();
      mkdirSync(OUT_DIR, { recursive: true });
      const file = path.join(OUT_DIR, `inputs-${stamp()}.json`);
      writeFileSync(
        file,
        JSON.stringify(projects.map((p) => ({ project: toItemProject(p), input: buildProjectInput(p) })), null, 2),
      );
      log(`${projects.length} inputs → ${file}`);
      return;
    }

    case "sample":
    case "run": {
      const llm = new LlmClient(loadLlmConfig());
      let projects: AnalysisSourceProject[];
      if (command === "sample") {
        projects = await sampleProjects();
      } else {
        const ids = await candidateIds(store, {
          platform: values.platform,
          retryFailed: Boolean(values["retry-failed"]),
          force: Boolean(values.force),
        });
        projects = await store.projectsByIds(ids.slice(0, num(values.limit, ids.length)));
      }
      log(`analyze ${projects.length} projects with ${llm.cfg.model} (effort ${llm.cfg.effort})${dryRun ? " [dry-run]" : ""}`);
      const items = await analyzeProjectsSync(llm, projects, {
        concurrency: num(values.concurrency, 4),
        maxAttempts: 3,
        store: dryRun ? null : store,
        log,
      });
      const total = (await store.allProjectIds()).length;
      finish({ model: llm.cfg.model, mode: "sync", items, projectionTotal: total, name: `${command}-${stamp()}`, batch: false });
      return;
    }

    case "batch-submit": {
      const llm = new LlmClient(loadLlmConfig());
      const ids = await candidateIds(store, {
        platform: values.platform,
        retryFailed: Boolean(values["retry-failed"]),
        force: Boolean(values.force),
      });
      const target = ids.slice(0, num(values.limit, ids.length));
      if (!target.length) return log("분석할 프로젝트가 없습니다");
      // 한 batch 당 최대 100,000건/256MB. 실패 시 영향 범위를 줄이려고 2,000건 단위로 나눈다
      for (let i = 0; i < target.length; i += 2000) {
        const chunk = await store.projectsByIds(target.slice(i, i + 2000));
        const batch = await llm.submitBatch(chunk.map((p) => ({ customId: p.id, inputText: buildProjectInput(p).text })));
        const id = await store.createBatch({
          provider_batch_id: batch.id,
          analysis_version: ANALYSIS_VERSION,
          model: llm.cfg.model,
          project_ids: chunk.map((p) => p.id),
        });
        log(`submitted batch ${batch.id} (${chunk.length} requests) → analysis_batches.${id}`);
      }
      return;
    }

    case "batch-collect": {
      const llm = new LlmClient(loadLlmConfig());
      for (;;) {
        const open = await store.openBatches();
        if (!open.length) return log("회수할 batch 가 없습니다");
        let pending = 0;
        for (const b of open) {
          const remote = await llm.retrieveBatch(b.provider_batch_id);
          if (remote.processing_status !== "ended") {
            pending++;
            log(`batch ${b.provider_batch_id}: ${remote.processing_status} ${JSON.stringify(remote.request_counts)}`);
            continue;
          }
          await collectBatch(llm, store, b);
        }
        if (!pending || !values.wait) return;
        await new Promise((r) => setTimeout(r, 60_000));
      }
    }

    case "import": {
      if (!arg) throw new Error("import <results.json>");
      const file = readResults(arg);
      const projects = new Map((await store.projectsByIds(file.items.map((i) => i.project.id))).map((p) => [p.id, p]));
      let saved = 0;
      for (const it of file.items) {
        const v = validateAnalysis(it.analysis);
        it.ok = v.ok;
        if (!v.ok) {
          it.error = v.error;
          it.error_type = "VALIDATION";
          log(`invalid ${it.project.platform}:${it.project.external_project_id}: ${v.error}`);
          continue;
        }
        it.analysis = v.value;
        const p = projects.get(it.project.id);
        if (!p) throw new Error(`project not found: ${it.project.id}`);
        if (!dryRun) {
          await store.saveAnalysis({
            projectId: p.id,
            version: file.analysis_version,
            model: file.model,
            analysis: v.value,
            input: buildProjectInput(p),
            usage: it.usage ?? null,
            costUsd: it.cost_usd ?? null,
          });
          saved++;
        }
      }
      log(`import: valid ${file.items.filter((i) => i.ok).length}/${file.items.length}, saved ${saved}${dryRun ? " [dry-run]" : ""}`);
      const out = writeResults(file, `import-${stamp()}`);
      log(`report → ${out.md}`);
      return;
    }

    case "report": {
      if (!arg) throw new Error("report <results.json>");
      const out = writeResults(readResults(arg), `report-${stamp()}`);
      log(`report → ${out.md}`);
      return;
    }

    default:
      console.log(USAGE);
      process.exitCode = 1;
  }
}

async function candidateIds(
  store: AnalyzerStore,
  opts: { platform?: string; retryFailed: boolean; force: boolean },
): Promise<string[]> {
  const all = await store.allProjectIds(opts.platform);
  const inFlight = new Set((await store.openBatches()).flatMap((b) => b.project_ids));
  const analyzed = opts.force ? new Map() : await store.analyzedHashes(ANALYSIS_VERSION);
  const failed = opts.retryFailed ? await store.unresolvedErrorProjectIds(ANALYSIS_VERSION) : null;
  return all.filter((id) => !inFlight.has(id) && !analyzed.has(id) && (!failed || failed.has(id)));
}

async function collectBatch(
  llm: LlmClient,
  store: AnalyzerStore,
  b: { id: string; provider_batch_id: string; model: string; analysis_version: string; project_ids: string[] },
) {
  const projects = new Map((await store.projectsByIds(b.project_ids)).map((p) => [p.id, p]));
  const items: ResultItem[] = [];
  for await (const { customId, outcome } of llm.batchResults(b.provider_batch_id)) {
    const p = projects.get(customId);
    if (!p) continue;
    const input = buildProjectInput(p);
    const usage: TokenUsage | null = outcome.usage ?? null;
    const cost = usage ? estimateCostUsd(b.model, usage, { batch: true }) : null;
    const base = {
      project: toItemProject(p),
      input_meta: { truncated: input.truncated, limited_info: input.limitedInfo, hash: input.hash, chars: input.text.length },
      usage,
      cost_usd: cost,
      attempts: 1,
    };
    if (outcome.ok) {
      await store.saveAnalysis({
        projectId: p.id,
        version: b.analysis_version,
        model: outcome.model,
        analysis: outcome.analysis,
        input,
        usage,
        costUsd: cost,
        batchId: b.id,
      });
      items.push({ ...base, ok: true, analysis: outcome.analysis });
    } else {
      await store.recordError({
        projectId: p.id,
        version: b.analysis_version,
        model: b.model,
        errorType: outcome.errorType,
        error: outcome.error,
        raw: outcome.raw,
        batchId: b.id,
      });
      items.push({ ...base, ok: false, error: outcome.error, error_type: outcome.errorType });
    }
  }
  const usage = summarizeUsage(items);
  const cost = items.reduce((s, i) => s + (i.cost_usd ?? 0), 0);
  await store.updateBatch(b.id, {
    status: "COLLECTED",
    succeeded_count: items.filter((i) => i.ok).length,
    failed_count: items.filter((i) => !i.ok).length,
    usage,
    cost_usd: cost,
    ended_at: new Date().toISOString(),
    collected_at: new Date().toISOString(),
  });
  finish({ model: b.model, mode: "batch", items, name: `batch-${b.provider_batch_id}`, batch: true });
}

function finish(args: { model: string; mode: ResultsFile["mode"]; items: ResultItem[]; projectionTotal?: number; name: string; batch: boolean }) {
  const usage = summarizeUsage(args.items);
  const r: ResultsFile = {
    analysis_version: ANALYSIS_VERSION,
    model: args.model,
    mode: args.mode,
    created_at: new Date().toISOString(),
    usage_total: usage,
    cost_usd_total: estimateCostUsd(args.model, usage, { batch: args.batch }),
    projection_total: args.projectionTotal,
    items: args.items,
  };
  const out = writeResults(r, args.name);
  const ok = args.items.filter((i) => i.ok).length;
  log(`\n성공 ${ok} / 실패 ${args.items.length - ok}, tokens in ${usage.input_tokens} out ${usage.output_tokens}, cost $${(r.cost_usd_total ?? 0).toFixed(4)}`);
  log(`results → ${out.json}\nreport  → ${out.md}`);
}

main().catch((e) => {
  console.error(e instanceof Error ? e.stack : e);
  process.exitCode = 1;
});
