/**
 * supabase/migrations/*.sql 을 순서대로 적용한다.
 * 적용 기록은 Supabase CLI 와 같은 supabase_migrations.schema_migrations 에 남겨 `supabase db push` 와 호환된다.
 *
 *   pnpm db:migrate            (SUPABASE_DB_URL 필요: Supabase > Project Settings > Database > Connection string)
 */
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import pg from "pg";

const url = process.env.SUPABASE_DB_URL;
if (!url) {
  console.error("SUPABASE_DB_URL 이 필요합니다 (.env)");
  process.exit(1);
}

const dir = path.resolve(import.meta.dirname, "../supabase/migrations");
const files = readdirSync(dir).filter((f) => /^\d+_.+\.sql$/.test(f)).sort();

const client = new pg.Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
await client.connect();
try {
  await client.query(`create schema if not exists supabase_migrations`);
  await client.query(`create table if not exists supabase_migrations.schema_migrations (
    version text primary key, statements text[], name text)`);
  const applied = new Set(
    (await client.query<{ version: string }>(`select version from supabase_migrations.schema_migrations`)).rows.map((r) => r.version),
  );
  for (const file of files) {
    const [version, ...rest] = file.replace(/\.sql$/, "").split("_");
    if (applied.has(version!)) {
      console.log(`skip   ${file}`);
      continue;
    }
    const sql = readFileSync(path.join(dir, file), "utf8");
    await client.query("begin");
    try {
      await client.query(sql);
      await client.query(`insert into supabase_migrations.schema_migrations (version, statements, name) values ($1, $2, $3)`, [
        version,
        [sql],
        rest.join("_"),
      ]);
      await client.query("commit");
      console.log(`apply  ${file}`);
    } catch (e) {
      await client.query("rollback");
      throw e;
    }
  }
  // PostgREST 스키마 캐시 갱신
  await client.query(`notify pgrst, 'reload schema'`);
} finally {
  await client.end();
}
