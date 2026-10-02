/** Supabase 스키마/접속 확인: tsx --env-file=../../.env e2e/db-check.ts */
import { createServiceClient } from "@fr/db";

const db = createServiceClient();
const tables = ["projects", "project_snapshots", "crawl_jobs", "crawl_checkpoints", "crawl_errors", "collector_status", "crawl_logs", "project_counts"];
let missing = 0;
for (const t of tables) {
  const r = await db.from(t).select("*", { count: "exact" }).limit(1);
  if (r.error) missing++;
  console.log(t.padEnd(18), r.error ? `ERR ${r.error.code ?? ""} ${r.error.message}` : `ok (${r.count} rows)`);
}
process.exitCode = missing ? 1 : 0;
