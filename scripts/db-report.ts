/** 수집 데이터 점검 (읽기 전용): pnpm db:report */
import pg from "pg";

const client = new pg.Client({ connectionString: process.env.SUPABASE_DB_URL, ssl: { rejectUnauthorized: false } });
await client.connect();
const q = async (title: string, sql: string) => {
  const r = await client.query(sql);
  console.log(`\n## ${title}`);
  console.table(r.rows);
};
await q("projects", `select platform, count(*) n, count(distinct external_project_id) uniq, min(registered_at)::date oldest, max(registered_at)::date newest,
  round(avg(pg_column_size(raw_payload)))::int raw_bytes, count(*) filter (where first_seen_at <> last_seen_at) reseen
  from projects group by 1 order by 1`);
await q("field coverage %", `select platform,
  round(100.0*count(description)/count(*)) description, round(100.0*count(budget_min)/count(*)) budget_min,
  round(100.0*count(registered_at)/count(*)) registered, round(100.0*count(deadline_at)/count(*)) deadline,
  round(100.0*count(applicant_count)/count(*)) applicants, round(100.0*count(*) filter (where cardinality(skills)>0)/count(*)) skills,
  round(100.0*count(category)/count(*)) category, round(100.0*count(location)/count(*)) location, round(100.0*count(planning_status)/count(*)) planning
  from projects group by 1 order by 1`);
await q("snapshots", `select p.platform, count(s.*) snapshots from project_snapshots s join projects p on p.id = s.project_id group by 1`);
await q("jobs", `select platform, job_type, status, requested_by, result->>'success' success, result->>'failure' failure, result->>'inserted' inserted, result->>'updated' updated, left(coalesce(error_message, result->>'reason'), 60) reason from crawl_jobs order by created_at desc limit 10`);
await q("checkpoints", `select platform, last_page, current_page, last_project_id, processed_count, success_count, failure_count, skipped_count, new_count, oldest_registered_at::date, status from crawl_checkpoints order by updated_at desc limit 6`);
await q("collector_status", `select platform, status, login_state, current_page, success_count, failure_count, last_success_at, heartbeat_at from collector_status`);
await q("errors", `select platform, external_project_id, error_type, left(error_message, 60) msg, retry_count, resolved_at is not null resolved from crawl_errors order by occurred_at desc limit 10`);
await q("logs", `select event, count(*) from crawl_logs group by 1 order by 2 desc limit 12`);
await client.end();
