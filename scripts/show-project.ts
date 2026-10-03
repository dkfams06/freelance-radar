/** 프로젝트 공고 원문 확인 (읽기 전용): tsx --env-file=.env scripts/show-project.ts <platform:id> ... */
import pg from "pg";

const keys = process.argv.slice(2);
const client = new pg.Client({ connectionString: process.env.SUPABASE_DB_URL, ssl: { rejectUnauthorized: false } });
await client.connect();
for (const key of keys) {
  const r = await client.query(`select title, budget, project_duration, description from projects where project_key = $1`, [key]);
  const p = r.rows[0];
  console.log(`\n===== ${key} | ${p?.title} | ${p?.budget} | ${p?.project_duration}\n${(p?.description ?? "").slice(0, 2500)}`);
}
await client.end();
