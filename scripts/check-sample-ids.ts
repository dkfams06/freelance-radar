/** 샘플 파일의 project id 가 현재 DB 에 있는지 확인 (읽기 전용) */
import { readFileSync } from "node:fs";
import pg from "pg";

const file = process.argv[2] ?? "docs/analyzer-v3-sample-20.json";
const items = JSON.parse(readFileSync(file, "utf8")).items as Array<{ project: { id: string; platform: string; external_project_id: string } }>;
const client = new pg.Client({ connectionString: process.env.SUPABASE_DB_URL, ssl: { rejectUnauthorized: false } });
await client.connect();
const r = await client.query(`select id::text, platform, external_project_id from projects where id = any($1::uuid[])`, [items.map((i) => i.project.id)]);
const found = new Set(r.rows.map((x) => x.id));
console.log(`by id: ${found.size}/${items.length}`);
const keys = items.map((i) => `${i.project.platform}:${i.project.external_project_id}`);
const k = await client.query(`select project_key from projects where project_key = any($1)`, [keys]);
console.log(`by platform:external_id: ${k.rowCount}/${items.length}`);
await client.end();
