/** 적용된 migration 목록과 analyzer 테이블 존재 여부 (읽기 전용) */
import pg from "pg";

const client = new pg.Client({ connectionString: process.env.SUPABASE_DB_URL, ssl: { rejectUnauthorized: false } });
await client.connect();
const m = await client.query(`select version, name from supabase_migrations.schema_migrations order by version`);
console.table(m.rows);
const t = await client.query(
  `select table_name from information_schema.tables where table_schema='public' and table_name like '%analys%' order by 1`,
);
console.log("analysis tables:", t.rows.map((r) => r.table_name));
await client.end();
