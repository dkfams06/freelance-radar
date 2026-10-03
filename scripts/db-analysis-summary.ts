/** analyzer 저장 현황 (읽기 전용) */
import pg from "pg";

const client = new pg.Client({ connectionString: process.env.SUPABASE_DB_URL, ssl: { rejectUnauthorized: false } });
await client.connect();
const a = await client.query(`select analysis_version, model, count(*) from project_analyses group by 1,2 order by 1,2`);
console.table(a.rows);
const e = await client.query(
  `select error_type, left(error_message, 60) msg, count(*), count(*) filter (where resolved_at is null) unresolved
     from analysis_errors group by 1,2 order by 3 desc`,
);
console.table(e.rows);
await client.end();
