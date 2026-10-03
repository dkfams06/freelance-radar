/** holdout 선정 목록 → 샘플 골격 파일 (--ids-from 용). 읽기 전용 */
import { writeFileSync } from "node:fs";
import pg from "pg";

const keys = [
  "freemoa:48251", "freemoa:48011", "freemoa:47955", "freemoa:48311", "freemoa:47704", "freemoa:47969", "freemoa:48169",
  "wishket:158096", "wishket:155100", "wishket:156240", "wishket:158628", "wishket:154821", "wishket:153028", "wishket:150086",
  "wishket:157477", "wishket:149922", "wishket:152942", "wishket:157967", "wishket:150884", "wishket:153015",
];
const client = new pg.Client({ connectionString: process.env.SUPABASE_DB_URL, ssl: { rejectUnauthorized: false } });
await client.connect();
const r = await client.query(
  `select id::text, platform, external_project_id, title, budget, project_duration, registered_at from projects where project_key = any($1)`,
  [keys],
);
await client.end();
const byKey = new Map(r.rows.map((x) => [`${x.platform}:${x.external_project_id}`, x]));
const items = keys.map((k) => {
  const p = byKey.get(k);
  if (!p) throw new Error(`missing ${k}`);
  return { project: { id: p.id, platform: p.platform, external_project_id: p.external_project_id, title: p.title, budget: p.budget, project_duration: p.project_duration } };
});
writeFileSync(process.argv[2]!, JSON.stringify({ analysis_version: "v3.3", model: "holdout-skeleton", mode: "import", created_at: new Date().toISOString(), usage_total: { input_tokens: 0, output_tokens: 0 }, cost_usd_total: 0, items }, null, 2));
console.log(items.length, "items →", process.argv[2]);
console.log(r.rows.map((x) => `${x.platform}:${x.external_project_id} ${new Date(x.registered_at).toISOString().slice(0, 10)}`).join(", "));
