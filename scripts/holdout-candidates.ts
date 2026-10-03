/** holdout 후보 조회 (읽기 전용): 이미 분석/샘플에 쓰인 프로젝트 제외, 버킷별 무작위(seed 고정) 후보 출력 */
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import pg from "pg";

const docs = path.resolve(import.meta.dirname, "../docs");
const used = new Set<string>();
for (const f of readdirSync(docs).filter((x) => /sample-20\.json$/.test(x))) {
  for (const i of JSON.parse(readFileSync(path.join(docs, f), "utf8")).items) used.add(i.project.id);
}
const client = new pg.Client({ connectionString: process.env.SUPABASE_DB_URL, ssl: { rejectUnauthorized: false } });
await client.connect();
const analyzed = await client.query(`select distinct project_id::text id from project_analyses`);
for (const r of analyzed.rows) used.add(r.id);
console.log("excluded (used in docs/DB analyses):", used.size);

const buckets: Record<string, string> = {
  commerce: "쇼핑몰|커머스|스토어|마켓|카페24|스마트스토어",
  website: "홈페이지|랜딩|웹사이트|워드프레스|반응형",
  mobile: "앱 |애플리케이션|안드로이드|iOS|플러터|React Native",
  reservation: "예약|booking|렌탈|대여",
  backoffice: "관리자|어드민|백오피스|ERP|MES|그룹웨어|CRM|재고",
  crawler: "크롤링|크롤러|스크래핑|수집",
  ai: "AI|LLM|GPT|챗봇|RAG|인공지능|딥러닝",
  automation: "자동화|RPA|매크로|봇",
  dashboard: "대시보드|BI|통계|데이터 분석|시각화",
  fintech: "결제|PG|핀테크|정산|증권|코인|거래소",
  iot: "IoT|장비|센서|키오스크|임베디드|펌웨어|하드웨어|POS|프린터",
  platform: "플랫폼|매칭|커뮤니티|중개",
  saas: "SaaS|구독|멀티테넌트",
  infra: "인프라|보안|폐쇄망|DR|서버 구축|클라우드 전환|마이그레이션",
  staffing_dev: "상주|기간제|투입|개발자 모집|인력",
  qa: "QA|테스트|검수",
};
const pool = `
  select p.id::text id, p.project_key, p.platform, p.title, p.budget, p.project_duration, p.project_type, (p.extra->>'detailRestricted') restricted,
         (p.extra->>'privateMatching') private, length(coalesce(p.description,'')) len
    from projects p
   where p.registered_at >= '2025-10-02' and length(coalesce(p.description,'')) between 500 and 6000
     and coalesce(p.extra->>'detailRestricted','false') <> 'true' and coalesce(p.extra->>'privateMatching','false') <> 'true'
     and p.id <> all($1::uuid[])`;
const rows = (await client.query(pool, [[...used]])).rows;
console.log("pool size", rows.length, "by platform", Object.entries(rows.reduce((c: any, r) => ((c[r.platform] = (c[r.platform] || 0) + 1), c), {})));
// 결정적 pseudo-random (seed 고정)
let seed = 20261003;
const rnd = () => ((seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296);
for (const [name, rx] of Object.entries(buckets)) {
  const re = new RegExp(rx, "i");
  const hits = rows.filter((r) => re.test(r.title));
  const pick = [...hits].sort(() => rnd() - 0.5).slice(0, 5);
  console.log(`\n## ${name} (${hits.length})`);
  for (const r of pick) console.log(`  ${r.project_key} | ${r.title.slice(0, 44)} | ${r.budget} | ${r.project_duration ?? "-"} | ${r.len}`);
}
await client.end();
