// 수동 기준 vs 모델 결과의 분류 지표 + reuse_level confusion matrix.
// 사용: node scripts/holdout-metrics.cjs <manual.json> <model.json>
const fs = require("fs");
const [manualFile, modelFile] = process.argv.slice(2);
const load = (f) => JSON.parse(fs.readFileSync(f, "utf8"));
const M = load(manualFile);
const S = load(modelFile);
const id = (i) => i.project.platform + ":" + i.project.external_project_id;
const m = new Map(M.items.map((i) => [id(i), i.analysis]));
const s = new Map(S.items.map((i) => [id(i), i.analysis]));
const keys = [...m.keys()];
const n = keys.length;
const pct = (a, b) => `${a}/${b} (${Math.round((100 * a) / b)}%)`;

const exact = (f) => keys.filter((k) => s.get(k)[f] === m.get(k)[f]).length;
console.log("== 분류 일치율 (수동 vs 모델)");
for (const f of ["project_type", "engagement_type", "industry", "reuse_level"]) console.log(f.padEnd(18), pct(exact(f), n));
const jac = (a, b) => {
  const A = new Set(a), B = new Set(b);
  const u = new Set([...A, ...B]).size;
  return u ? [...A].filter((x) => B.has(x)).length / u : 1;
};
for (const f of ["complexity_types", "technology_assets"]) {
  const avg = keys.reduce((t, k) => t + jac(s.get(k)[f], m.get(k)[f]), 0) / n;
  console.log(f.padEnd(18), "평균 Jaccard", avg.toFixed(2));
}
const avgLen = (map, f) => (keys.reduce((t, k) => t + map.get(k)[f].length, 0) / n).toFixed(2);
console.log("complexity 평균 개수: 수동", avgLen(m, "complexity_types"), "| 모델", avgLen(s, "complexity_types"));
console.log("uncertain_fields: 수동", keys.filter((k) => m.get(k).uncertain_fields.length).length, "건 | 모델",
  keys.filter((k) => s.get(k).uncertain_fields.length).map((k) => k + ":" + s.get(k).uncertain_fields.join("+")).join(", ") || "0건");

const L = ["high", "medium", "low", "one_off"];
const step = (a, b) => Math.abs(L.indexOf(a) - L.indexOf(b));
console.log("\n== reuse_level confusion matrix (행=수동, 열=모델)");
console.log("manual \\ sonnet".padEnd(18) + L.map((x) => x.padStart(8)).join("") + "   합계");
for (const a of L) {
  const row = L.map((b) => keys.filter((k) => m.get(k).reuse_level === a && s.get(k).reuse_level === b).length);
  console.log(a.padEnd(18) + row.map((x) => String(x).padStart(8)).join("") + String(row.reduce((t, x) => t + x, 0)).padStart(7));
}
console.log("모델 합계".padEnd(18) + L.map((b) => String(keys.filter((k) => s.get(k).reuse_level === b).length).padStart(8)).join(""));
const wrong = keys.filter((k) => s.get(k).reuse_level !== m.get(k).reuse_level);
const one = wrong.filter((k) => step(s.get(k).reuse_level, m.get(k).reuse_level) === 1).length;
const two = wrong.filter((k) => step(s.get(k).reuse_level, m.get(k).reuse_level) === 2).length;
const big = wrong.filter((k) => step(s.get(k).reuse_level, m.get(k).reuse_level) >= 3).length;
console.log(`\nreuse 오류 ${wrong.length}건: 한 단계 ${one}, 두 단계 ${two}, 세 단계(high↔one_off) ${big}`);
const strict = wrong.filter((k) => (s.get(k).reuse_level === "low") !== (m.get(k).reuse_level === "low") && step(s.get(k).reuse_level, m.get(k).reuse_level) === 1);
for (const k of wrong) console.log("  ", k.padEnd(16), m.get(k).reuse_level.padEnd(8), "→", s.get(k).reuse_level.padEnd(8), "|", S.items.find((i) => id(i) === k).project.title.slice(0, 30));
const dir = (a, b) => wrong.filter((k) => m.get(k).reuse_level === a && s.get(k).reuse_level === b).length;
console.log("low/one_off 를 묶었을 때(\"재사용 낮음\") 일치:", pct(keys.filter((k) => (["low", "one_off"].includes(m.get(k).reuse_level)) === (["low", "one_off"].includes(s.get(k).reuse_level)) && (["low", "one_off"].includes(m.get(k).reuse_level) || m.get(k).reuse_level === s.get(k).reuse_level)).length, n));

console.log("\n== project_type / engagement_type 불일치");
for (const f of ["project_type", "engagement_type"]) for (const k of keys) if (s.get(k)[f] !== m.get(k)[f]) console.log("  ", f.padEnd(16), k.padEnd(16), m.get(k)[f], "→", s.get(k)[f], s.get(k).uncertain_fields.length ? "(모델 애매 표시)" : "");

console.log("\n== 작업시간/예산 (모델 hours min-max, 수동)");
const rows = keys.map((k) => ({ k, budget: S.items.find((i) => id(i) === k).project.budget, manual: m.get(k).estimated_hours_min + "-" + m.get(k).estimated_hours_max, model: s.get(k).estimated_hours_min + "-" + s.get(k).estimated_hours_max }));
console.table(rows);
const avg = (map, f) => (keys.reduce((t, k) => t + map.get(k)[f], 0) / n).toFixed(0);
console.log("평균 hours min/max: 수동", avg(m, "estimated_hours_min"), avg(m, "estimated_hours_max"), "| 모델", avg(s, "estimated_hours_min"), avg(s, "estimated_hours_max"));
