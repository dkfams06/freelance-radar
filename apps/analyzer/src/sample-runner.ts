import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import path from "node:path";
import {
  addUsage,
  buildProjectInput,
  estimateCostUsd,
  ZERO_USAGE,
  type AnalysisSourceProject,
  type TokenUsage,
} from "@fr/analysis";
import type { AnalyzeOutcome, SyncLlm } from "./llm";
import type { AnalyzerStore } from "./store";

export type SampleProgressStatus = "success" | "failed" | "skipped";

export interface SampleRunProgress {
  schema: "analyzer-run-sample/v1";
  analysis_version: string;
  sample_file: string;
  sample_ids: string[];
  model: string;
  backend: "claude-cli" | "codex-cli";
  total: number;
  next_index: number;
  current_project_id: string | null;
  status: Record<string, SampleProgressStatus>;
  counts: { success: number; failed: number; skipped: number };
  usage_total: TokenUsage;
  started_at: string;
  updated_at: string;
  stopped_reason: "usage_limit" | "process_error" | "completed" | null;
  last_error: string | null;
}

export interface RunSampleOptions {
  version: string;
  sampleFile: string;
  sampleIds: string[];
  projects: AnalysisSourceProject[];
  progressFile: string;
  model: string;
  backend: "claude-cli" | "codex-cli";
  llm: SyncLlm;
  store: AnalyzerStore;
  maxAttempts: number;
  delayMs: number;
  concurrency: number;
  retryFailed: boolean;
  force?: boolean;
  log: (message: string) => void;
}

export interface RunSampleResult {
  stopped: boolean;
  progress: SampleRunProgress;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function now(): string {
  return new Date().toISOString();
}

function emptyProgress(opts: RunSampleOptions): SampleRunProgress {
  return {
    schema: "analyzer-run-sample/v1",
    analysis_version: opts.version,
    sample_file: opts.sampleFile,
    sample_ids: [...opts.sampleIds],
    model: opts.model,
    backend: opts.backend,
    total: opts.sampleIds.length,
    next_index: 0,
    current_project_id: null,
    status: {},
    counts: { success: 0, failed: 0, skipped: 0 },
    usage_total: { ...ZERO_USAGE },
    started_at: now(),
    updated_at: now(),
    stopped_reason: null,
    last_error: null,
  };
}

function saveProgress(file: string, progress: SampleRunProgress): void {
  mkdirSync(path.dirname(file), { recursive: true });
  const tmp = `${file}.tmp`;
  writeFileSync(tmp, `${JSON.stringify(progress, null, 2)}\n`);
  renameSync(tmp, file);
}

function validateProgress(progress: SampleRunProgress, opts: RunSampleOptions): void {
  if (progress.schema !== "analyzer-run-sample/v1") throw new Error(`지원하지 않는 progress schema: ${progress.schema}`);
  if (progress.analysis_version !== opts.version) throw new Error("progress의 analysis_version이 현재 실행과 다릅니다");
  if (progress.model !== opts.model) throw new Error(`progress의 model(${progress.model})과 현재 model(${opts.model})이 다릅니다`);
  if (progress.backend !== opts.backend) throw new Error(`progress backend(${progress.backend})와 현재 backend(${opts.backend})가 다릅니다`);
  if (progress.total !== opts.sampleIds.length || progress.sample_ids.join("\n") !== opts.sampleIds.join("\n")) {
    throw new Error("progress의 sample ID 목록이 현재 sample file과 다릅니다");
  }
}

function loadProgress(opts: RunSampleOptions): SampleRunProgress {
  if (!existsSync(opts.progressFile)) {
    const progress = emptyProgress(opts);
    saveProgress(opts.progressFile, progress);
    return progress;
  }
  const progress = JSON.parse(readFileSync(opts.progressFile, "utf8")) as SampleRunProgress;
  validateProgress(progress, opts);
  return progress;
}

function updateStatus(progress: SampleRunProgress, projectId: string, status: SampleProgressStatus): void {
  const previous = progress.status[projectId];
  if (previous === status) return;
  if (previous) progress.counts[previous]--;
  progress.status[projectId] = status;
  progress.counts[status]++;
}

function addUsageToProgress(progress: SampleRunProgress, usage: TokenUsage | null): void {
  if (usage) progress.usage_total = addUsage(progress.usage_total, usage);
}

function progressText(progress: SampleRunProgress): string {
  const completed = progress.counts.success + progress.counts.failed + progress.counts.skipped;
  return `completed=${completed}/${progress.total} remaining=${progress.total - progress.next_index} success=${progress.counts.success} failed=${progress.counts.failed} skip=${progress.counts.skipped}`;
}

function advanceNextIndex(progress: SampleRunProgress): void {
  while (progress.next_index < progress.sample_ids.length) {
    const projectId = progress.sample_ids[progress.next_index]!;
    if (!progress.status[projectId]) return;
    progress.next_index++;
  }
}

interface ProjectRunResult {
  kind: "success" | "failed" | "usage_limit";
  error?: string;
  errorType?: string;
  usage: TokenUsage | null;
}

async function analyzeOne(
  p: AnalysisSourceProject,
  opts: RunSampleOptions,
): Promise<ProjectRunResult> {
  const input = buildProjectInput(p);
  let usage: TokenUsage | null = null;
  for (let attempt = 1; attempt <= opts.maxAttempts; attempt++) {
    const out: AnalyzeOutcome = await opts.llm.analyze(input.text);
    if (out.usage) usage = usage ? addUsage(usage, out.usage) : out.usage;
    if (out.ok) {
      const cost = usage ? estimateCostUsd(opts.model, usage) : null;
      await opts.store.saveAnalysis({
        projectId: p.id,
        version: opts.version,
        model: out.model,
        analysis: out.analysis,
        input,
        usage,
        costUsd: cost,
      });
      return { kind: "success", usage };
    }
    if (out.errorType === "USAGE_LIMIT") {
      return { kind: "usage_limit", error: out.error, errorType: out.errorType, usage };
    }
    await opts.store.recordError({
      projectId: p.id,
      version: opts.version,
      model: opts.model,
      errorType: out.errorType,
      error: out.error,
      raw: out.raw,
    });
    if (!out.retryable || attempt >= opts.maxAttempts) {
      return { kind: "failed", error: out.error, errorType: out.errorType, usage };
    }
    opts.log(`  retry ${p.id} (${out.errorType}: ${out.error.slice(0, 120)})`);
    await sleep(out.errorType === "API_ERROR" ? 5_000 * attempt : 500);
  }
  return { kind: "failed", error: "unreachable", errorType: "API_ERROR", usage };
}

export async function runSample(opts: RunSampleOptions): Promise<RunSampleResult> {
  if (!Number.isInteger(opts.concurrency) || opts.concurrency < 1) {
    throw new Error("concurrency는 1 이상의 정수여야 합니다");
  }
  const progress = loadProgress(opts);
  const byId = new Map(opts.projects.map((p) => [p.id, p]));
  const analyzed = opts.force ? new Map<string, string>() : await opts.store.analyzedHashes(opts.version, opts.model);
  const unresolved = await opts.store.unresolvedErrorProjectIds(opts.version, opts.model);

  if (opts.retryFailed) {
    const firstFailed = opts.sampleIds.findIndex((id) => progress.status[id] === "failed");
    if (firstFailed >= 0) progress.next_index = Math.min(progress.next_index, firstFailed);
  }

  type WorkResult = ProjectRunResult & {
    index: number;
    projectId: string;
    skipped?: boolean;
    processError?: boolean;
  };

  let cursor = progress.next_index;
  while (cursor < opts.sampleIds.length) {
    const indexes: number[] = [];
    while (indexes.length < opts.concurrency && cursor < opts.sampleIds.length) indexes.push(cursor++);

    const processIndex = async (i: number): Promise<WorkResult> => {
      const projectId = opts.sampleIds[i]!;
      const p = byId.get(projectId);
      if (!p) throw new Error(`sample project not found: ${projectId}`);
      const existingStatus = progress.status[projectId];
      const shouldRetryFailed = opts.retryFailed && existingStatus === "failed";

      if ((existingStatus === "success" || existingStatus === "skipped") && !shouldRetryFailed) {
        advanceNextIndex(progress);
        progress.updated_at = now();
        saveProgress(opts.progressFile, progress);
        opts.log(`[${i + 1}/${opts.sampleIds.length}] SKIP project=${projectId} (checkpoint already complete) ${progressText(progress)}`);
        return { kind: "success", skipped: true, index: i, projectId, usage: null };
      }
      if (analyzed.has(projectId)) {
        updateStatus(progress, projectId, "skipped");
        advanceNextIndex(progress);
        progress.current_project_id = null;
        progress.updated_at = now();
        progress.stopped_reason = null;
        saveProgress(opts.progressFile, progress);
        opts.log(`[${i + 1}/${opts.sampleIds.length}] SKIP project=${projectId} (already analyzed) ${progressText(progress)}`);
        return { kind: "success", skipped: true, index: i, projectId, usage: null };
      }
      if (existingStatus === "failed" && !shouldRetryFailed) {
        advanceNextIndex(progress);
        progress.current_project_id = null;
        progress.updated_at = now();
        saveProgress(opts.progressFile, progress);
        opts.log(`[${i + 1}/${opts.sampleIds.length}] SKIP project=${projectId} (previous failure; use --retry-failed) ${progressText(progress)}`);
        return { kind: "failed", skipped: true, index: i, projectId, usage: null };
      }
      if (unresolved.has(projectId) && !opts.retryFailed) {
        updateStatus(progress, projectId, "skipped");
        advanceNextIndex(progress);
        progress.current_project_id = null;
        progress.updated_at = now();
        saveProgress(opts.progressFile, progress);
        opts.log(`[${i + 1}/${opts.sampleIds.length}] SKIP project=${projectId} (unresolved previous error) ${progressText(progress)}`);
        return { kind: "failed", skipped: true, index: i, projectId, usage: null };
      }

      progress.current_project_id = projectId;
      progress.updated_at = now();
      progress.stopped_reason = null;
      progress.last_error = null;
      saveProgress(opts.progressFile, progress);
      let result: ProjectRunResult;
      try {
        result = await analyzeOne(p, opts);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        progress.current_project_id = projectId;
        progress.updated_at = now();
        progress.stopped_reason = "process_error";
        progress.last_error = message;
        saveProgress(opts.progressFile, progress);
        return { kind: "failed", processError: true, error: message, errorType: "PROCESS_ERROR", index: i, projectId, usage: null };
      }
      addUsageToProgress(progress, result.usage);
      if (result.kind === "usage_limit") {
        progress.current_project_id = projectId;
        progress.updated_at = now();
        progress.stopped_reason = "usage_limit";
        progress.last_error = result.error ?? "Claude Code usage limit";
        saveProgress(opts.progressFile, progress);
        return { ...result, index: i, projectId };
      }

      updateStatus(progress, projectId, result.kind);
      advanceNextIndex(progress);
      progress.current_project_id = null;
      progress.updated_at = now();
      progress.stopped_reason = null;
      progress.last_error = result.kind === "failed" ? result.error ?? null : null;
      saveProgress(opts.progressFile, progress);
      const label = result.kind === "success" ? "SUCCESS" : `FAIL ${result.errorType ?? "unknown"}`;
      opts.log(`[${i + 1}/${opts.sampleIds.length}] ${label} project=${projectId} ${progressText(progress)}`);
      return { ...result, index: i, projectId };
    };

    const batchResults = await Promise.all(indexes.map((i) => processIndex(i)));
    const stopResult = batchResults.find((result) => result.kind === "usage_limit" || result.processError);
    if (stopResult) {
      const reason = stopResult.kind === "usage_limit" ? "usage_limit" : "process_error";
      progress.current_project_id = stopResult.projectId;
      progress.stopped_reason = reason;
      progress.last_error = stopResult.error ?? (reason === "usage_limit" ? "Claude Code usage limit" : "process error");
      progress.updated_at = now();
      saveProgress(opts.progressFile, progress);
      opts.log(`[${reason === "usage_limit" ? "STOP usage_limit" : "STOP process_error"}] project=${stopResult.projectId} ${progressText(progress)}`);
      return { stopped: true, progress };
    }
    if (cursor < opts.sampleIds.length && opts.delayMs > 0) await sleep(opts.delayMs);
  }

  progress.next_index = opts.sampleIds.length;
  progress.current_project_id = null;
  progress.updated_at = now();
  progress.stopped_reason = "completed";
  progress.last_error = null;
  saveProgress(opts.progressFile, progress);
  opts.log(
    `완료 total=${progress.total} success=${progress.counts.success} failed=${progress.counts.failed} skip=${progress.counts.skipped}`,
  );
  return { stopped: false, progress };
}
