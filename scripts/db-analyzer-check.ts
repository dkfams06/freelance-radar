/** analyzer 스키마 확인 (읽기 전용) */
import pg from "pg";

const client = new pg.Client({ connectionString: process.env.SUPABASE_DB_URL, ssl: { rejectUnauthorized: false } });
await client.connect();
const cols = await client.query(
  `select table_name, column_name, data_type from information_schema.columns
    where table_schema='public' and table_name like '%analys%' order by table_name, ordinal_position`,
);
const byTable: Record<string, string[]> = {};
for (const r of cols.rows) (byTable[r.table_name] ??= []).push(`${r.column_name}:${r.data_type}`);
for (const [t, c] of Object.entries(byTable)) console.log(`${t} (${c.length})\n  ${c.join(", ")}`);
const rls = await client.query(
  `select relname, relrowsecurity from pg_class where relname like '%analys%' and relkind='r'`,
);
console.log("rls:", rls.rows);
await client.end();
