import { spawn } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";
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

/**
 * Claude Code 헤드리스 모드(`claude -p`)로 분석한다 — Claude 구독제 사용.
 * API 경로와 같은 시스템 프롬프트 / JSON 스키마 / 검증을 쓴다.
 *
 * - ANTHROPIC_API_KEY 는 자식 프로세스에서 제거해 구독(OAuth) 인증을 쓰게 한다.
 * - 도구·MCP·슬래시 명령 없이, 프로젝트 파일(CLAUDE.md 등)을 읽지 않도록 임시 폴더에서 실행한다.
 * - 비용은 API 단가로 환산한 추정치이며 구독제에서는 실제 청구되지 않는다 (사용량 한도에 반영).
 */
export class ClaudeCliClient implements SyncLlm {
  private readonly bin: string;
  private readonly cwd: string;
  private readonly timeoutMs: number;
  private readonly useApiKey: boolean;

  constructor(
    readonly cfg: LlmConfig,
    opts: { bin?: string; timeoutMs?: number; useApiKey?: boolean } = {},
  ) {
    this.bin = opts.bin ?? process.env.CLAUDE_CLI_PATH ?? resolveClaudeBin();
    this.timeoutMs = opts.timeoutMs ?? Number(process.env.ANALYZER_CLI_TIMEOUT_MS || 300_000);
    this.useApiKey = opts.useApiKey ?? process.env.ANALYZER_CLI_USE_API_KEY === "1";
    this.cwd = path.join(os.tmpdir(), "freelance-radar-analyzer");
    mkdirSync(this.cwd, { recursive: true });
  }

  buildArgs(): string[] {
    const effortArgs = this.cfg.model.startsWith("claude-haiku") ? [] : ["--effort", this.cfg.effort];
    return [
      "-p",
      "--output-format",
      "json",
      "--model",
      this.cfg.model,
      ...effortArgs,
      "--system-prompt",
      SYSTEM_PROMPT,
      "--json-schema",
      JSON.stringify(ANALYSIS_JSON_SCHEMA),
      "--tools",
      "",
      "--strict-mcp-config",
      "--disable-slash-commands",
      "--no-session-persistence",
    ];
  }

  async analyze(inputText: string): Promise<AnalyzeOutcome> {
    let stdout: string;
    try {
      stdout = await this.exec(buildUserMessage(inputText));
    } catch (e) {
      const error = e instanceof Error ? e.message : String(e);
      const usageLimit = isUsageLimitMessage(error);
      return { ok: false, errorType: usageLimit ? "USAGE_LIMIT" : "API_ERROR", error, retryable: !usageLimit };
    }
    return interpretCliOutput(stdout, this.cfg.model);
  }

  private exec(stdin: string): Promise<string> {
    const env = { ...process.env };
    if (!this.useApiKey) delete env.ANTHROPIC_API_KEY;
    return new Promise((resolve, reject) => {
      const child = spawn(this.bin, this.buildArgs(), { cwd: this.cwd, env, windowsHide: true });
      let out = "";
      let err = "";
      const timer = setTimeout(() => {
        child.kill();
        reject(new Error(`claude -p timed out after ${this.timeoutMs}ms`));
      }, this.timeoutMs);
      child.stdout.setEncoding("utf8").on("data", (d: string) => (out += d));
      child.stderr.setEncoding("utf8").on("data", (d: string) => (err += d));
      child.on("error", (e) => {
        clearTimeout(timer);
        reject(new Error(`claude CLI 실행 실패 (${this.bin}): ${e.message}`));
      });
      child.on("close", (code) => {
        clearTimeout(timer);
        if (out.trim()) resolve(out);
        else reject(new Error(`claude -p exited ${code}: ${err.trim().slice(0, 500)}`));
      });
      child.stdin.end(stdin, "utf8");
    });
  }
}

/**
 * Windows 에서는 spawn 이 PATHEXT(.cmd) 를 찾지 않고, npm 설치본은 claude.cmd shim 뿐이다.
 * shell 을 거치면 시스템 프롬프트/JSON 인자가 깨지므로 shim 이 가리키는 claude.exe 를 직접 찾는다.
 */
export function resolveClaudeBin(env = process.env, exists: (p: string) => boolean = existsSync): string {
  if (process.platform !== "win32") return "claude";
  const dirs = (env.PATH ?? env.Path ?? "").split(path.delimiter).filter(Boolean);
  for (const dir of dirs) {
    const exe = path.join(dir, "claude.exe");
    if (exists(exe)) return exe;
    if (exists(path.join(dir, "claude.cmd"))) {
      const shimTarget = path.join(dir, "node_modules", "@anthropic-ai", "claude-code", "bin", "claude.exe");
      if (exists(shimTarget)) return shimTarget;
    }
  }
  const local = path.join(env.USERPROFILE ?? os.homedir(), ".local", "bin", "claude.exe");
  return exists(local) ? local : "claude";
}

interface CliResult {
  type?: string;
  subtype?: string;
  is_error?: boolean;
  api_error_status?: number | null;
  result?: string;
  structured_output?: unknown;
  stop_reason?: string | null;
  usage?: Partial<TokenUsage>;
  modelUsage?: Record<string, unknown>;
}

/** Claude Code 구독 사용량/요청 제한으로 더 진행할 수 없는 응답인지 판정한다. */
export function isUsageLimitMessage(value: unknown): boolean {
  const text = String(value ?? "");
  return /(?:rate\s*limit|usage\s*limit|quota|too\s+many\s+requests|limit\s+reached|hit\s+(?:your\s+)?limit|\b429\b|resets?\s+(?:in|at))/i.test(text);
}

/** `claude -p --output-format json` 출력 → 검증된 분석 결과 */
export function interpretCliOutput(stdout: string, fallbackModel: string): AnalyzeOutcome {
  let j: CliResult;
  try {
    j = JSON.parse(stdout.trim()) as CliResult;
  } catch {
    return { ok: false, errorType: "API_ERROR", error: "claude -p returned non-JSON output", raw: stdout.slice(0, 2000), retryable: true };
  }
  const usage: TokenUsage = {
    input_tokens: j.usage?.input_tokens ?? 0,
    output_tokens: j.usage?.output_tokens ?? 0,
    cache_creation_input_tokens: j.usage?.cache_creation_input_tokens ?? 0,
    cache_read_input_tokens: j.usage?.cache_read_input_tokens ?? 0,
  };
  const model = Object.keys(j.modelUsage ?? {})[0] ?? fallbackModel;
  if (j.is_error) {
    const status = j.api_error_status ?? null;
    const auth = status === 401 || /authenticate|login|OAuth/i.test(j.result ?? "");
    const usageLimit = !auth && (status === 429 || isUsageLimitMessage(j.result));
    return {
      ok: false,
      errorType: usageLimit ? "USAGE_LIMIT" : "API_ERROR",
      error: auth ? `claude 로그인 필요 (claude 실행 후 /login): ${j.result ?? ""}` : `claude -p error ${status ?? ""}: ${j.result ?? j.subtype}`,
      raw: j.result,
      usage,
      // 인증 오류와 사용량 제한은 재시도해도 소용없음. 그 외 일시 오류는 재시도
      retryable: !auth && !usageLimit,
    };
  }
  if (j.stop_reason === "refusal") {
    return { ok: false, errorType: "REFUSAL", error: "refusal", raw: j.result, usage, retryable: false };
  }
  if (j.stop_reason === "max_tokens") {
    return { ok: false, errorType: "MAX_TOKENS", error: "hit max_tokens", raw: j.result, usage, retryable: true };
  }
  const text = j.structured_output !== undefined && j.structured_output !== null ? JSON.stringify(j.structured_output) : (j.result ?? "");
  const v = parseAnalysisText(text);
  if (!v.ok) return { ok: false, errorType: "VALIDATION", error: v.error, raw: text, usage, retryable: true };
  return { ok: true, analysis: v.value, usage, model };
}
