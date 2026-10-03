/**
 * Collector V1 종료 검증 (읽기 전용): pnpm db:verify
 * 백필 건수 / 중복 / crawl_errors / cutoff / checkpoint / 비정상 job 을 한 번에 점검하고, 문제 항목은 [WARN] 으로 표시한다.
 */
import pg from "pg";

const CUTOFF = process.env.COLLECTOR_BACKFILL_CUTOFF ?? "2025-10-02T00:00:00+09:00";
const client = new pg.Client({ connectionString: process.env.SUPABASE_DB_URL, ssl: { rejectUnauthorized: false } });
await client.connect();
const warnings: string[] = [];
const q = async <T extends pg.QueryResultRow>(title: string, sql: string, params: unknown[] = []) => {
  const r = await client.query<T>(sql, params);
  console.log(`\n## ${title}`);
  console.table(r.rows);
  return r.rows;
};

// 1, 2. 플랫폼별 건수와 최근 1년 백필 범위
await q("1-2. 플랫폼별 건수", `select platform, count(*) total,
  count(*) filter (where registered_at >= $1::timestamptz) since_cutoff,
  min(registered_at) oldest, max(registered_at) newest
  from projects group by 1 order by 1`, [CUTOFF]);

// 3. 중복 row
const dups = await q("3. 중복 (platform, external_project_id)", `select platform, external_project_id, count(*) n
  from projects group by 1, 2 having count(*) > 1 limit 20`);
if (dups.length) warnings.push(`중복 row ${dups.length}건 이상`);
const urlDups = await q("3. 중복 project_url", `select project_url, count(*) n from projects group by 1 having count(*) > 1 limit 20`);
if (urlDups.length) warnings.push(`project_url 중복 ${urlDups.length}건 이상`);

// 4. crawl_errors
await q("4. crawl_errors 현황", `select platform, error_type, count(*) total,
  count(*) filter (where resolved_at is null) unresolved from crawl_errors group by 1, 2 order by 1, 2`);
const unresolved = await q<{ platform: string; external_project_id: string }>(
  "4. 미해결 오류 중 projects 에 없는 프로젝트 (재수집 필요)",
  `select distinct e.platform, e.external_project_id, max(e.error_type) error_type, max(e.occurred_at) last_at
   from crawl_errors e
   where e.resolved_at is null and e.external_project_id is not null
     and not exists (select 1 from projects p where p.platform = e.platform and p.external_project_id = e.external_project_id)
   group by 1, 2 order by 1, 2`,
);
if (unresolved.length) warnings.push(`수집되지 않은 미해결 오류 프로젝트 ${unresolved.length}건`);

// 5. cutoff
await q("5. cutoff 경계", `select platform,
  count(*) filter (where registered_at < $1::timestamptz) before_cutoff,
  count(*) filter (where registered_at is null) no_registered_at,
  min(registered_at) filter (where registered_at >= $1::timestamptz) oldest_in_range
  from projects group by 1 order by 1`, [CUTOFF]);
const cps = await q<{ platform: string; status: string; oldest_registered_at: Date | null; cutoff_at: Date | null }>(
  "5-6. BACKFILL checkpoint",
  `select c.platform, j.job_type, j.status job_status, c.status, c.last_page, c.current_page, c.processed_count, c.success_count,
     c.failure_count, c.skipped_count, c.new_count, c.oldest_registered_at, c.cutoff_at, c.updated_at
   from crawl_checkpoints c join crawl_jobs j on j.id = c.job_id
   where j.job_type in ('BACKFILL', 'RESUME') order by c.updated_at desc limit 10`,
);
for (const platform of ["wishket", "freemoa"]) {
  const done = cps.find((c) => c.platform === platform && c.status === "COMPLETED" && c.cutoff_at);
  if (!done) warnings.push(`${platform}: 완료된 BACKFILL checkpoint 없음`);
  else if (done.oldest_registered_at && done.cutoff_at && done.oldest_registered_at < done.cutoff_at)
    warnings.push(`${platform}: checkpoint oldest_registered_at 이 cutoff 이전`);
}

// 7. 비정상 job
const stuck = await q("7. 멈춘 RUNNING / 오래된 PENDING job", `select id, platform, job_type, status, requested_by, created_at, heartbeat_at,
    left(error_message, 80) error
  from crawl_jobs
  where (status = 'RUNNING' and coalesce(heartbeat_at, started_at, created_at) < now() - interval '10 minutes')
     or (status = 'PENDING' and created_at < now() - interval '30 minutes')
  order by created_at`);
if (stuck.length) warnings.push(`비정상 job ${stuck.length}건`);
await q("7. job 상태 요약", `select platform, job_type, status, count(*) from crawl_jobs group by 1, 2, 3 order by 1, 2, 3`);
await q("CHECK_NEW 최근 실행", `select platform, status, requested_by, created_at, finished_at,
    result->>'success' success, result->>'inserted' inserted, result->>'lastPage' last_page, result->>'processed' processed, left(coalesce(error_message, result->>'reason'), 60) reason
  from crawl_jobs where job_type = 'CHECK_NEW' order by created_at desc limit 10`);

console.log(`\n## 결과\n${warnings.length ? warnings.map((w) => `[WARN] ${w}`).join("\n") : "[OK] 문제 없음"}`);
await client.end();
process.exitCode = warnings.length ? 1 : 0;
