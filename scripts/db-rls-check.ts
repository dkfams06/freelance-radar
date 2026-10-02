/** RLS/정책 상태 확인 (읽기 전용): pnpm exec tsx --env-file=.env scripts/db-rls-check.ts */
import pg from "pg";

const client = new pg.Client({ connectionString: process.env.SUPABASE_DB_URL, ssl: { rejectUnauthorized: false } });
await client.connect();
const rls = await client.query(
  `select c.relname, c.relrowsecurity as rls, (select count(*) from pg_policies p where p.tablename = c.relname and p.schemaname = 'public') as policies
     from pg_class c join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relkind = 'r' order by 1`,
);
console.table(rls.rows);
const grants = await client.query(
  `select table_name, string_agg(privilege_type, ',') as anon_privs from information_schema.role_table_grants
    where grantee = 'anon' and table_schema = 'public' and table_name = 'project_counts' group by 1`,
);
console.log("project_counts anon grants:", grants.rows);
await client.end();
