/** 시장 통계 설계용 원본 분포 탐색 (읽기 전용): tsx --env-file=.env scripts/explore-market.ts */
import pg from "pg";

const c = new pg.Client({ connectionString: process.env.SUPABASE_DB_URL, ssl: { rejectUnauthorized: false } });
await c.connect();
const q = async (title: string, sql: string) => {
  console.log(`\n## ${title}`);
  console.table((await c.query(sql)).rows);
};
await q("플랫폼/수집 구분/예산 유형", `select platform, project_type raw_type, budget_type, count(*) n, count(budget_min) with_min, count(budget_max) with_max,
  round(avg(budget_min)) avg_min from projects group by 1,2,3 order by 1,2,3`);
await q("등록일 범위", `select min(registered_at)::date, max(registered_at)::date, count(*), count(registered_at) with_date from projects`);
await q("월별", `select to_char(registered_at at time zone 'Asia/Seoul','YYYY-MM') m, count(*) from projects group by 1 order by 1`);
await q("예산 구간 이상치 (프리모아 포괄 범위)", `select platform, budget_min, budget_max, count(*) n from projects where budget_max is not null and budget_min is not null and budget_max >= 50*budget_min group by 1,2,3 order by 4 desc limit 10`);
await q("분석 현황", `select analysis_version, count(*) from project_analyses group by 1 order by 1`);
await q("budget 0 / 극단값", `select count(*) filter (where budget_min = 0) zero_min, count(*) filter (where budget_min > 1000000000) over_1b, max(budget_max) max_budget from projects`);
await q("분석 vs raw 상주 일치", `select p.project_type raw_type, a.engagement_type, count(*) from project_analyses a join projects p on p.id=a.project_id where a.analysis_version='v3.3' group by 1,2 order by 1,2`);
await c.end();
