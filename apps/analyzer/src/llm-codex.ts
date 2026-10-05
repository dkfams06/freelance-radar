import { spawn } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import {
  ANALYSIS_JSON_SCHEMA,
  SYSTEM_PROMPT,
  buildUserMessage,
  parseAnalysisText,
  type TokenUsage,
} from "@fr/analysis";
import type { AnalyzeOutcome, LlmConfig, SyncLlm } from "./llm";

/** Codex CLI 로그인(구독)으로 분석한다. API key나 OpenAI API 호출을 사용하지 않는다. */
export class CodexCliClient implements SyncLlm {
  private readonly bin: string;
  private readonly cwd: string;
  private readonly timeoutMs: number;
  private readonly schemaPath: string;

  constructor(
    readonly cfg: LlmConfig,
    opts: { bin?: string; timeoutMs?: number } = {},
  ) {
    this.bin = opts.bin ?? process.env.CODEX_CLI_PATH ?? "codex";
    this.timeoutMs = opts.timeoutMs ?? Number(process.env.ANALYZER_CODEX_TIMEOUT_MS || 300_000);
    this.cwd = path.join(os.tmpdir(), "freelance-radar-analyzer-codex");
    mkdirSync(this.cwd, { recursive: true });
    this.schemaPath = path.join(this.cwd, "analysis-schema.json");
    writeFileSync(this.schemaPath, `${JSON.stringify(ANALYSIS_JSON_SCHEMA)}\n`);
  }

  buildArgs(): string[] {
    return [
      "exec",
      "--model",
      this.cfg.model,
      "--sandbox",
      "read-only",
      "--skip-git-repo-check",
      "--ephemeral",
      "--ignore-user-config",
      "--output-schema",
      this.schemaPath,
      "--json",
      "-",
    ];
  }

  async analyze(inputText: string): Promise<AnalyzeOutcome> {
    const prompt = `${SYSTEM_PROMPT}\n\n${buildUserMessage(inputText)}\n\n반드시 위 JSON Schema에 맞는 JSON 객체 하나만 최종 답변으로 출력하세요. 설명이나 마크다운은 출력하지 마세요.`;
    try {
      const result = await this.exec(prompt);
      return interpretCodexOutput(result.stdout, result.stderr, result.exitCode, this.cfg.model);
    } catch (e) {
      const error = e instanceof Error ? e.message : String(e);
      const usageLimit = isCodexUsageLimitMessage(error);
      return { ok: false, errorType: usageLimit ? "USAGE_LIMIT" : "API_ERROR", error, retryable: !usageLimit };
    }
  }

  private exec(stdin: string): Promise<{ stdout: string; stderr: string; exitCode: number | null }> {
    return new Promise((resolve, reject) => {
      const child = spawn(this.bin, this.buildArgs(), { cwd: this.cwd, env: process.env, windowsHide: true });
      let stdout = "";
      let stderr = "";
      const timer = setTimeout(() => {
        child.kill();
        reject(new Error(`codex exec timed out after ${this.timeoutMs}ms`));
      }, this.timeoutMs);
      child.stdout.setEncoding("utf8").on("data", (d: string) => (stdout += d));
      child.stderr.setEncoding("utf8").on("data", (d: string) => (stderr += d));
      child.on("error", (e) => {
        clearTimeout(timer);
        reject(new Error(`Codex CLI 실행 실패 (${this.bin}): ${e.message}`));
      });
      child.on("close", (code) => {
        clearTimeout(timer);
        resolve({ stdout, stderr, exitCode: code });
      });
      child.stdin.end(stdin, "utf8");
    });
  }
}

export function isCodexUsageLimitMessage(value: unknown): boolean {
  return /(?:rate\s*limit|usage\s*limit|quota|too\s+many\s+requests|limit\s+reached|\b429\b|resets?\s+(?:in|at))/i.test(String(value ?? ""));
}

interface CodexEvent {
  type?: string;
  item?: { type?: string; text?: string; content?: Array<{ type?: string; text?: string }> };
  usage?: Partial<TokenUsage>;
  message?: string;
  error?: unknown;
}

function usageFromEvents(events: CodexEvent[]): TokenUsage {
  const usage = [...events].reverse().find((e) => e.usage)?.usage;
  return {
    input_tokens: usage?.input_tokens ?? 0,
    output_tokens: usage?.output_tokens ?? 0,
    cache_creation_input_tokens: usage?.cache_creation_input_tokens ?? 0,
    cache_read_input_tokens: usage?.cache_read_input_tokens ?? 0,
  };
}

function finalText(events: CodexEvent[], stdout: string): string {
  for (const event of [...events].reverse()) {
    if (event.type === "item.completed" && event.item?.type === "agent_message" && event.item.text) return event.item.text;
    if (event.item?.text) return event.item.text;
    const contentText = event.item?.content?.map((x) => x.text ?? "").join("").trim();
    if (contentText) return contentText;
  }
  return stdout.trim();
}

export function interpretCodexOutput(stdout: string, stderr: string, exitCode: number | null, fallbackModel: string): AnalyzeOutcome {
  const events: CodexEvent[] = stdout
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .flatMap((line) => {
      try {
        return [JSON.parse(line) as CodexEvent];
      } catch {
        return [];
      }
    });
  const usage = usageFromEvents(events);
  const errorText = `${stderr}\n${events.map((e) => e.message ?? JSON.stringify(e.error ?? "")).join("\n")}`.trim();
  if (exitCode !== 0 && !stdout.trim()) {
    const usageLimit = isCodexUsageLimitMessage(errorText);
    return { ok: false, errorType: usageLimit ? "USAGE_LIMIT" : "API_ERROR", error: errorText.slice(0, 2000) || `codex exec exited ${exitCode}`, usage, retryable: !usageLimit };
  }
  const text = finalText(events, stdout);
  const v = parseAnalysisText(text);
  if (!v.ok) {
    const usageLimit = isCodexUsageLimitMessage(errorText) || isCodexUsageLimitMessage(text);
    return { ok: false, errorType: usageLimit ? "USAGE_LIMIT" : "VALIDATION", error: usageLimit ? errorText.slice(0, 2000) : v.error, raw: text.slice(0, 20000), usage, retryable: !usageLimit };
  }
  return { ok: true, analysis: v.value, usage, model: fallbackModel };
}
