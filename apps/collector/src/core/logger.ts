import { PLATFORM_LABELS, errorMessage, type PlatformName } from "@fr/shared";
import type { CollectorStore } from "@fr/db";

type Level = "debug" | "info" | "warn" | "error";

export interface LogFields {
  page?: number | null;
  project?: string | null;
  [key: string]: unknown;
}

const LEVEL_ORDER: Record<Level, number> = { debug: 10, info: 20, warn: 30, error: 40 };

/**
 * 구조화 로그.
 * 콘솔: [Wishket] BACKFILL page=17 project=123456 SUCCESS
 * persist=true 이벤트는 Supabase crawl_logs 에도 기록.
 */
export class CollectorLogger {
  constructor(
    private readonly scope: { platform?: PlatformName | null; jobType?: string | null; jobId?: string | null } = {},
    private readonly store?: CollectorStore | null,
    private readonly minLevel: Level = (process.env.COLLECTOR_LOG_LEVEL as Level) || "info",
    private readonly json = process.env.COLLECTOR_LOG_FORMAT === "json",
  ) {}

  child(scope: { platform?: PlatformName | null; jobType?: string | null; jobId?: string | null }): CollectorLogger {
    return new CollectorLogger({ ...this.scope, ...scope }, this.store, this.minLevel, this.json);
  }

  debug(event: string, fields?: LogFields) {
    this.write("debug", event, fields);
  }
  info(event: string, fields?: LogFields, persist = false) {
    this.write("info", event, fields, persist);
  }
  warn(event: string, fields?: LogFields, persist = false) {
    this.write("warn", event, fields, persist);
  }
  error(event: string, fields?: LogFields, persist = true) {
    this.write("error", event, fields, persist);
  }

  private write(level: Level, event: string, fields: LogFields = {}, persist = false) {
    if (LEVEL_ORDER[level] >= LEVEL_ORDER[this.minLevel]) {
      const ts = new Date().toISOString();
      if (this.json) {
        console.log(JSON.stringify({ ts, level, ...this.scope, event, ...fields }));
      } else {
        const label = this.scope.platform ? `[${PLATFORM_LABELS[this.scope.platform]}]` : "[Collector]";
        const parts = [ts, label];
        if (this.scope.jobType) parts.push(this.scope.jobType);
        for (const [k, v] of Object.entries(fields)) {
          if (v === undefined || v === null) continue;
          parts.push(`${k}=${typeof v === "object" ? JSON.stringify(v) : String(v)}`);
        }
        parts.push(event);
        const line = parts.join(" ");
        if (level === "error") console.error(line);
        else if (level === "warn") console.warn(line);
        else console.log(line);
      }
    }
    if (persist && this.store) {
      this.store
        .insertLog({
          platform: this.scope.platform ?? null,
          job_id: this.scope.jobId ?? null,
          level,
          event,
          message: typeof fields.message === "string" ? fields.message : null,
          data: fields,
        })
        .catch((e) => console.error(`[Collector] failed to persist log: ${errorMessage(e)}`));
    }
  }
}
