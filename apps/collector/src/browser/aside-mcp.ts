import { spawn, type ChildProcessWithoutNullStreams } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import { CrawlError, errorMessage } from "@fr/shared";

/**
 * Aside CLI 의 `aside mcp` (stdio MCP 서버) 클라이언트.
 * 확인된 도구: repl(title, code) — Playwright 스타일 JS 를 Aside Browser 에서 실행 (120초 제한, 스코프 유지)
 */
export function resolveAsideCliPath(): string {
  const fromEnv = process.env.ASIDE_CLI_PATH;
  if (fromEnv) return fromEnv;
  const local = process.env.LOCALAPPDATA ?? path.join(process.env.USERPROFILE ?? "", "AppData", "Local");
  const candidates = [
    path.join(local, "Aside", "CLI", "current", "aside.exe"),
    path.join(process.env.USERPROFILE ?? process.env.HOME ?? "", ".local", "bin", process.platform === "win32" ? "aside.exe" : "aside"),
  ];
  return candidates.find((c) => existsSync(c)) ?? "aside";
}

interface Pending {
  resolve: (v: JsonRpcResponse) => void;
  reject: (e: Error) => void;
  timer: NodeJS.Timeout;
}

interface JsonRpcResponse {
  id: number;
  result?: { content?: Array<{ type: string; text?: string }>; isError?: boolean };
  error?: { code: number; message: string };
}

export interface ToolTextResult {
  text: string;
  isError: boolean;
}

export class AsideMcpClient {
  private child: ChildProcessWithoutNullStreams | null = null;
  private starting: Promise<void> | null = null;
  private buffer = "";
  private nextId = 0;
  private readonly pending = new Map<number, Pending>();
  /** 서버가 재시작되면 REPL 스코프가 사라지므로 상위 계층이 알 수 있게 세대 번호를 올린다 */
  generation = 0;

  constructor(
    private readonly options: { cliPath?: string; account?: string | null; log?: (msg: string) => void } = {},
  ) {}

  async ensureStarted(): Promise<void> {
    if (this.child && this.child.exitCode === null) return;
    if (this.starting) return this.starting;
    this.starting = this.start().finally(() => {
      this.starting = null;
    });
    return this.starting;
  }

  private async start(): Promise<void> {
    const exe = this.options.cliPath ?? resolveAsideCliPath();
    const args = ["mcp", ...(this.options.account ? ["--account", this.options.account] : [])];
    const child = spawn(exe, args, { stdio: ["pipe", "pipe", "pipe"], windowsHide: true });
    this.child = child;
    this.buffer = "";
    child.stdout.setEncoding("utf8");
    child.stdout.on("data", (chunk: string) => this.onData(chunk));
    child.stderr.setEncoding("utf8");
    child.stderr.on("data", (chunk: string) => this.options.log?.(`[aside-mcp] ${chunk.trim()}`));
    child.on("exit", (code) => {
      this.options.log?.(`[aside-mcp] exited code=${code}`);
      for (const [, p] of this.pending) {
        clearTimeout(p.timer);
        p.reject(new CrawlError("NETWORK", `aside mcp exited (code=${code})`));
      }
      this.pending.clear();
      if (this.child === child) this.child = null;
    });
    child.on("error", (e) => this.options.log?.(`[aside-mcp] spawn error: ${errorMessage(e)}`));

    await new Promise<void>((resolve, reject) => {
      child.once("spawn", () => resolve());
      child.once("error", (e) =>
        reject(new Error(`Aside CLI 실행 실패 (${exe}). Aside CLI 설치/ASIDE_CLI_PATH 확인: ${errorMessage(e)}`)),
      );
    });
    const init = await this.request(
      "initialize",
      { protocolVersion: "2025-06-18", capabilities: {}, clientInfo: { name: "freelance-radar-collector", version: "1.0.0" } },
      30_000,
    );
    if (init.error) throw new Error(`aside mcp initialize failed: ${init.error.message}`);
    this.notify("notifications/initialized");
    this.generation++;
  }

  private onData(chunk: string) {
    this.buffer += chunk;
    let idx: number;
    while ((idx = this.buffer.indexOf("\n")) >= 0) {
      const line = this.buffer.slice(0, idx).trim();
      this.buffer = this.buffer.slice(idx + 1);
      if (!line) continue;
      let msg: JsonRpcResponse;
      try {
        msg = JSON.parse(line);
      } catch {
        this.options.log?.(`[aside-mcp] non-json: ${line.slice(0, 200)}`);
        continue;
      }
      if (typeof msg.id === "number" && this.pending.has(msg.id)) {
        const p = this.pending.get(msg.id)!;
        this.pending.delete(msg.id);
        clearTimeout(p.timer);
        p.resolve(msg);
      }
    }
  }

  private notify(method: string, params?: unknown) {
    this.child?.stdin.write(JSON.stringify({ jsonrpc: "2.0", method, params }) + "\n");
  }

  private request(method: string, params: unknown, timeoutMs: number): Promise<JsonRpcResponse> {
    const child = this.child;
    if (!child) return Promise.reject(new CrawlError("NETWORK", "aside mcp not running"));
    const id = ++this.nextId;
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(id);
        reject(new CrawlError("TIMEOUT", `aside mcp ${method} timed out after ${timeoutMs}ms`));
      }, timeoutMs);
      this.pending.set(id, { resolve, reject, timer });
      child.stdin.write(JSON.stringify({ jsonrpc: "2.0", id, method, params }) + "\n");
    });
  }

  async callTool(name: string, args: Record<string, unknown>, timeoutMs = 130_000): Promise<ToolTextResult> {
    await this.ensureStarted();
    const res = await this.request("tools/call", { name, arguments: args }, timeoutMs);
    if (res.error) throw new CrawlError("UNKNOWN", `aside mcp ${name}: ${res.error.message}`);
    const text = (res.result?.content ?? [])
      .filter((c) => c.type === "text")
      .map((c) => c.text ?? "")
      .join("\n");
    return { text, isError: !!res.result?.isError };
  }

  /** repl 도구로 코드를 실행하고 출력 텍스트를 돌려준다 */
  async repl(title: string, code: string, timeoutMs?: number): Promise<ToolTextResult> {
    return this.callTool("repl", { title, code }, timeoutMs);
  }

  async close(): Promise<void> {
    const child = this.child;
    this.child = null;
    if (!child) return;
    child.stdin.end();
    child.kill();
  }
}
