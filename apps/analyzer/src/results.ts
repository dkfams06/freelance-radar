import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import {
  FEATURE_VOCAB,
  INTEGRATION_VOCAB,
  PROJECT_TYPES,
  SKILL_VOCAB,
  MODEL_PRICING,
  addUsage,
  estimateCostUsd,
  ZERO_USAGE,
  type ProjectAnalysis,
  type TokenUsage,
} from "@fr/analysis";

/** 한 번의 분석 실행 결과 (DB 와 별개로 파일로도 남겨 사람이 검토/재현할 수 있게 한다) */
export interface ResultsFile {
  analysis_version: string;
  model: string;
  mode: "sync" | "batch" | "import";
  created_at: string;
  note?: string;
  usage_total: TokenUsage;
  cost_usd_total: number | null;
  /** 리포트에 전체 분석 비용 추정을 넣을 때 기준이 되는 전체 프로젝트 수 */
  projection_total?: number;
  items: ResultItem[];
}

export interface ResultItem {
  project: {
    id: string;
    platform: string;
    external_project_id: string;
    title: string | null;
    budget: string | null;
    project_duration: string | null;
  };
  input_meta: { truncated: boolean; limited_info: boolean; hash: string; chars: number };
  ok: boolean;
  analysis?: ProjectAnalysis;
  usage?: TokenUsage | null;
  cost_usd?: number | null;
  error?: string;
  error_type?: string;
  attempts?: number;
}

export const OUT_DIR = path.resolve(import.meta.dirname, "../.out");

export function summarizeUsage(items: ResultItem[]): TokenUsage {
  return items.reduce((acc, it) => (it.usage ? addUsage(acc, it.usage) : acc), { ...ZERO_USAGE });
}

export function writeResults(r: ResultsFile, name: string): { json: string; md: string } {
  mkdirSync(OUT_DIR, { recursive: true });
  const json = path.join(OUT_DIR, `${name}.json`);
  const md = path.join(OUT_DIR, `${name}.md`);
  writeFileSync(json, JSON.stringify(r, null, 2));
  writeFileSync(md, renderReport(r));
  return { json, md };
}

export function readResults(file: string): ResultsFile {
  return JSON.parse(readFileSync(file, "utf8")) as ResultsFile;
}

function countBy(lists: string[][]): string {
  const m = new Map<string, number>();
  for (const xs of lists) for (const x of new Set(xs)) m.set(x, (m.get(x) ?? 0) + 1);
  return [...m].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).map(([k, n]) => `${k} ${n}`).join(", ") || "-";
}

/** 사람 검토가 필요한 분류 케이스 */
export function reviewCases(items: ResultItem[]): { project: ResultItem["project"]; reasons: string[] }[] {
  const out: { project: ResultItem["project"]; reasons: string[] }[] = [];
  for (const it of items) {
    const a = it.analysis;
    if (!a) continue;
    const reasons: string[] = [];
    if (a.project_type === "other") reasons.push("project_type=other");
    if (a.engagement_type === "other") reasons.push("engagement_type=other");
    if (a.industry === "other") reasons.push("industry=other");
    if (a.complexity_types.includes("other")) reasons.push("complexity_types 에 other");
    if (!a.technology_assets.length) reasons.push("technology_assets 0개");
    if (a.complexity_types.length >= 4) reasons.push(`complexity_types ${a.complexity_types.length}개`);
    // 월 단가 공고인데 staffing 이 아니거나, 반대인 경우
    const monthly = /\/월|월\s*단가|상주/.test(`${it.project.budget ?? ""} ${it.project.title ?? ""}`);
    if (monthly && a.engagement_type !== "staffing") reasons.push(`월 단가/상주 공고인데 engagement_type=${a.engagement_type}`);
    if (a.uncertain_fields.length) reasons.push(`AI 판단 애매: ${a.uncertain_fields.join(", ")}`);
    if (reasons.length) out.push({ project: it.project, reasons });
  }
  return out;
}

const esc = (s: unknown) => String(s ?? "").replace(/\|/g, "\\|").replace(/\n/g, " ");
const fmtUsd = (n: number | null | undefined) => (n == null ? "-" : `$${n.toFixed(4)}`);

function outOfVocab(items: ResultItem[]) {
  const sets = {
    features: new Set<string>(FEATURE_VOCAB),
    integrations: new Set<string>(INTEGRATION_VOCAB),
    skills: new Set<string>(SKILL_VOCAB),
  };
  const found = { features: new Map<string, number>(), integrations: new Map<string, number>(), skills: new Map<string, number>() };
  for (const it of items) {
    const a = it.analysis;
    if (!a) continue;
    const add = (m: Map<string, number>, vocab: Set<string>, xs: string[]) =>
      xs.filter((x) => !vocab.has(x)).forEach((x) => m.set(x, (m.get(x) ?? 0) + 1));
    add(found.features, sets.features, a.required_features);
    add(found.integrations, sets.integrations, a.required_integrations);
    add(found.skills, sets.skills, a.required_skills);
  }
  return found;
}

const stat = (xs: number[]) => {
  if (!xs.length) return "-";
  const s = [...xs].sort((a, b) => a - b);
  const avg = Math.round(xs.reduce((a, b) => a + b, 0) / xs.length);
  return `평균 ${avg} / 중앙 ${s[Math.floor(s.length / 2)]} / 범위 ${s[0]}~${s[s.length - 1]}`;
};

/** 사람이 검토하는 Markdown 리포트 */
export function renderReport(r: ResultsFile): string {
  const ok = r.items.filter((i) => i.ok && i.analysis);
  const failed = r.items.filter((i) => !i.ok);
  const L: string[] = [];
  L.push(`# Analyzer ${r.analysis_version} 분석 리포트`);
  L.push("");
  L.push(`- 생성: ${r.created_at}`);
  L.push(`- 모델: \`${r.model}\` (mode: ${r.mode})`);
  if (r.note) L.push(`- 비고: ${r.note}`);
  L.push(`- 결과: 성공 ${ok.length} / 실패 ${failed.length} / 전체 ${r.items.length}`);
  const u = r.usage_total;
  L.push(
    `- 토큰: input ${u.input_tokens.toLocaleString()} · output ${u.output_tokens.toLocaleString()} · cache write ${(u.cache_creation_input_tokens ?? 0).toLocaleString()} · cache read ${(u.cache_read_input_tokens ?? 0).toLocaleString()}`,
  );
  L.push(`- 비용: ${fmtUsd(r.cost_usd_total)}${ok.length && r.cost_usd_total != null ? ` (건당 ${fmtUsd(r.cost_usd_total / ok.length)})` : ""}`);
  L.push("");
  if (r.projection_total && ok.length && u.input_tokens + u.output_tokens > 0) {
    // 이번 실행의 건당 평균 토큰으로 전체 분석 비용을 추정 (모델별 출력 길이 차이는 반영 못 함)
    const n = r.items.filter((i) => i.usage).length || ok.length;
    const per: TokenUsage = {
      input_tokens: (u.input_tokens + (u.cache_creation_input_tokens ?? 0) + (u.cache_read_input_tokens ?? 0)) / n,
      output_tokens: u.output_tokens / n,
    };
    L.push(`## 전체 ${r.projection_total.toLocaleString()}건 분석 비용 추정 (건당 평균 in ${Math.round(per.input_tokens)} / out ${Math.round(per.output_tokens)} 토큰 기준)`);
    L.push("");
    L.push("| 모델 | 동기 호출 | Batch API (50% 할인) |");
    L.push("|---|---|---|");
    for (const model of Object.keys(MODEL_PRICING)) {
      const sync = estimateCostUsd(model, per)! * r.projection_total;
      L.push(`| ${model}${model === r.model ? " (이번 실행)" : ""} | $${sync.toFixed(2)} | $${(sync / 2).toFixed(2)} |`);
    }
    L.push("");
    L.push("※ 다른 모델 행은 같은 토큰 수를 가정한 단순 환산입니다. 모델마다 사고(thinking)·출력 길이가 달라 실제 비용은 다를 수 있습니다.");
    L.push("");
  }

  L.push("## 프로젝트별 분류");
  L.push("");
  L.push("| # | 제목 | 예산 | project_type | engagement | industry | complexity_types | reuse | technology_assets | 난이도 | 예상시간 | 학습 | 재사용 | 시장 |");
  L.push("|---|---|---|---|---|---|---|---|---|---|---|---|---|---|");
  ok.forEach((it, i) => {
    const a = it.analysis!;
    L.push(
      `| ${i + 1} | ${esc(it.project.title).slice(0, 34)} | ${esc(it.project.budget)} | ${a.project_type} | ${a.engagement_type} | ${a.industry} | ${a.complexity_types.join(", ")} | ${a.reuse_level} | ${a.technology_assets.join(", ") || "-"} | ${a.vibe_coding_difficulty} | ${a.estimated_hours_min}~${a.estimated_hours_max}h | ${a.learning_value} | ${a.reusability_value} | ${a.market_value} |`,
    );
  });
  L.push("");

  const cases = reviewCases(ok);
  L.push("## 분류가 애매한 케이스");
  L.push("");
  if (!cases.length) L.push("- 없음");
  for (const c of cases) L.push(`- [${c.project.platform}:${c.project.external_project_id}] ${esc(c.project.title)} — ${c.reasons.join("; ")}`);
  L.push("");

  L.push("## 분류별 샘플 건수");
  L.push("");
  for (const field of ["project_type", "engagement_type", "industry", "reuse_level"] as const) {
    L.push(`- ${field}: ${countBy(ok.map((it) => [it.analysis![field]]))}`);
  }
  L.push(`- complexity_types: ${countBy(ok.map((it) => it.analysis!.complexity_types))}`);
  L.push(`- technology_assets: ${countBy(ok.map((it) => it.analysis!.technology_assets))}`);
  L.push("");

  L.push("## 상세");
  ok.forEach((it, i) => {
    const a = it.analysis!;
    L.push("");
    L.push(`### ${i + 1}. [${it.project.platform}:${it.project.external_project_id}] ${it.project.title ?? ""}`);
    L.push("");
    L.push(`- 예산: ${it.project.budget ?? "-"} · 기간: ${it.project.project_duration ?? "-"}${it.input_meta.limited_info ? " · ⚠ 공개 정보 제한" : ""}${it.input_meta.truncated ? " · 설명 일부 생략" : ""}`);
    L.push(`- 분류: **${a.project_type}** (${PROJECT_TYPES[a.project_type]}) / ${a.project_subcategory} · ${a.engagement_type} · ${a.industry} · reuse ${a.reuse_level}`);
    L.push(`- complexity_types: ${a.complexity_types.join(", ")} · technology_assets: ${a.technology_assets.join(", ") || "-"}`);
    if (a.uncertain_fields.length) L.push(`- 판단 애매: ${a.uncertain_fields.join(", ")}`);
    L.push(`- 요약: ${a.summary}`);
    L.push(`- 기능: ${a.required_features.join(", ") || "-"}`);
    L.push(`- 연동: ${a.required_integrations.join(", ") || "-"}`);
    L.push(`- 플랫폼: ${a.required_platforms.join(", ") || "-"} · 기술: ${a.required_skills.join(", ") || "-"}`);
    L.push(`- 추천 스택: ${a.suggested_stack.join(", ")}`);
    L.push(
      `- 점수: 난이도 ${a.vibe_coding_difficulty} · 시간 ${a.estimated_hours_min}~${a.estimated_hours_max}h · 학습 ${a.learning_value} · 재사용 ${a.reusability_value} · 시장 ${a.market_value} · 위험 ${a.technical_risk} · 명확성 ${a.requirement_clarity}`,
    );
    L.push(`- 근거:`);
    for (const [k, v] of Object.entries(a.rationale)) L.push(`  - ${k}: ${v}`);
    if (it.usage) L.push(`- 토큰: in ${it.usage.input_tokens} / out ${it.usage.output_tokens} · ${fmtUsd(it.cost_usd)}`);
  });
  L.push("");

  if (failed.length) {
    L.push("## 실패");
    L.push("");
    for (const it of failed) L.push(`- ${it.project.platform}:${it.project.external_project_id} ${esc(it.project.title)} — ${it.error_type}: ${esc(it.error)}`);
    L.push("");
  }

  L.push("## 분포");
  L.push("");
  const pick = (f: (a: ProjectAnalysis) => number) => ok.map((it) => f(it.analysis!));
  L.push(`- vibe_coding_difficulty: ${stat(pick((a) => a.vibe_coding_difficulty))}`);
  L.push(`- estimated_hours_max: ${stat(pick((a) => a.estimated_hours_max))}`);
  L.push(`- learning_value: ${stat(pick((a) => a.learning_value))}`);
  L.push(`- reusability_value: ${stat(pick((a) => a.reusability_value))}`);
  L.push(`- market_value: ${stat(pick((a) => a.market_value))}`);
  L.push("");
  const oov = outOfVocab(ok);
  const fmt = (m: Map<string, number>) => ([...m].length ? [...m].sort((a, b) => b[1] - a[1]).map(([k, n]) => `${k}(${n})`).join(", ") : "없음");
  L.push("## 권장 어휘 밖 코드 (다음 버전 taxonomy 후보)");
  L.push("");
  L.push(`- features: ${fmt(oov.features)}`);
  L.push(`- integrations: ${fmt(oov.integrations)}`);
  L.push(`- skills: ${fmt(oov.skills)}`);
  L.push("");
  return L.join("\n");
}

const CLASS_FIELDS = ["project_type", "engagement_type", "industry", "reuse_level"] as const;
const SCORE_FIELDS = ["vibe_coding_difficulty", "learning_value", "reusability_value", "market_value", "technical_risk", "requirement_clarity"] as const;
const avgOf = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);
const signed = (x: number) => `${x >= 0 ? "+" : ""}${x.toFixed(1)}`;
function jaccard(a: string[], b: string[]): number {
  const A = new Set(a);
  const B = new Set(b);
  const union = new Set([...A, ...B]);
  if (!union.size) return 1;
  return [...A].filter((x) => B.has(x)).length / union.size;
}
const ARRAY_FIELDS = ["complexity_types", "technology_assets"] as const;

/**
 * 같은 프로젝트들에 대한 두 결과 파일의 분류 비교 (예: v2 → v3, 수동 샘플 → 실제 API).
 * 프로젝트는 project.id 로 맞춘다.
 */
export function renderComparison(base: ResultsFile, next: ResultsFile): string {
  const baseById = new Map(base.items.filter((i) => i.analysis).map((i) => [i.project.id, i]));
  const pairs = next.items
    .filter((i) => i.analysis && baseById.has(i.project.id))
    .map((n) => ({ b: baseById.get(n.project.id)!, n }));
  const label = (r: ResultsFile) => `${r.analysis_version} (${r.model})`;
  const title = (i: ResultItem) => `[${i.project.platform}:${i.project.external_project_id}] ${esc(i.project.title)}`;
  const L: string[] = [`# 분류 비교: ${label(base)} → ${label(next)}`, "", `- 비교 대상: ${pairs.length}건`, ""];

  // 실행 품질 (next 기준)
  const total = next.items.length;
  const okCount = next.items.filter((i) => i.ok).length;
  const schemaFailures = next.items.filter((i) => !i.ok && (i.error_type === "VALIDATION" || i.error_type === "MAX_TOKENS")).length;
  const retries = next.items.reduce((n, i) => n + Math.max(0, (i.attempts ?? 1) - 1), 0);
  const u = next.usage_total;
  L.push("## 실행 결과 (이후 파일 기준)", "");
  L.push(`- schema 성공: ${okCount}/${total} (${total ? ((okCount / total) * 100).toFixed(0) : 0}%) · 최종 schema failure ${schemaFailures}건 · 기타 실패 ${total - okCount - schemaFailures}건`);
  L.push(`- retry: ${retries}회 (재시도한 프로젝트 ${next.items.filter((i) => (i.attempts ?? 1) > 1).length}건)`);
  L.push(`- 토큰: input ${u.input_tokens.toLocaleString()} · output ${u.output_tokens.toLocaleString()} · cache write ${(u.cache_creation_input_tokens ?? 0).toLocaleString()} · cache read ${(u.cache_read_input_tokens ?? 0).toLocaleString()}`);
  L.push(`- 비용: ${fmtUsd(next.cost_usd_total)}${okCount && next.cost_usd_total != null ? ` (건당 ${fmtUsd(next.cost_usd_total / okCount)})` : ""}`);
  L.push("");

  // 분류 일치율
  L.push("## taxonomy 일치율", "", "| 필드 | 일치 | 일치율 |", "|---|---|---|");
  for (const f of CLASS_FIELDS) {
    const same = pairs.filter((p) => p.b.analysis![f] === p.n.analysis![f]).length;
    L.push(`| ${f} | ${same}/${pairs.length} | ${pairs.length ? ((same / pairs.length) * 100).toFixed(0) : 0}% |`);
  }
  for (const f of ARRAY_FIELDS) {
    const jac = pairs.map((p) => jaccard(p.b.analysis![f] as string[], p.n.analysis![f] as string[]));
    const exact = jac.filter((j) => j === 1).length;
    L.push(`| ${f} (완전 일치 / 평균 Jaccard) | ${exact}/${pairs.length} | ${(avgOf(jac) * 100).toFixed(0)}% |`);
  }
  L.push("");

  // 점수 차이
  L.push("## 점수 차이 (이후 − 이전)", "", "| 항목 | 이전 평균 | 이후 평균 | 평균 차이 | 평균 절대 차이 |", "|---|---|---|---|---|");
  const scoreRow = (name: string, f: (a: ProjectAnalysis) => number) => {
    const b = pairs.map((p) => f(p.b.analysis!));
    const n = pairs.map((p) => f(p.n.analysis!));
    const d = n.map((x, i) => x - b[i]!);
    L.push(`| ${name} | ${avgOf(b).toFixed(1)} | ${avgOf(n).toFixed(1)} | ${signed(avgOf(d))} | ${avgOf(d.map(Math.abs)).toFixed(1)} |`);
  };
  for (const f of SCORE_FIELDS) scoreRow(f, (a) => a[f]);
  scoreRow("estimated_hours_min", (a) => a.estimated_hours_min);
  scoreRow("estimated_hours_max", (a) => a.estimated_hours_max);
  L.push("");

  // 차이가 큰 프로젝트 TOP 5: 점수 5종 평균 절대 차이 + 분류 불일치 1개당 15
  const scored = pairs
    .map((p) => {
      const sd = avgOf(SCORE_FIELDS.slice(0, 4).concat(["technical_risk"]).map((f) => Math.abs(p.n.analysis![f] - p.b.analysis![f])));
      const mism = CLASS_FIELDS.filter((f) => p.b.analysis![f] !== p.n.analysis![f]);
      const hb = (p.b.analysis!.estimated_hours_min + p.b.analysis!.estimated_hours_max) / 2;
      const hn = (p.n.analysis!.estimated_hours_min + p.n.analysis!.estimated_hours_max) / 2;
      return { p, distance: sd + mism.length * 15, sd, mism, hb, hn };
    })
    .sort((a, b) => b.distance - a.distance)
    .slice(0, 5);
  L.push("## 차이가 큰 프로젝트 TOP 5", "", "(거리 = 점수 5종 평균 절대 차이 + 분류 불일치 1개당 15)", "");
  for (const x of scored) {
    const a = x.p.b.analysis!;
    const b = x.p.n.analysis!;
    L.push(
      `- ${title(x.p.n)} — 거리 ${x.distance.toFixed(1)}: 점수 차 평균 ${x.sd.toFixed(1)}, 시간 ${Math.round(x.hb)}h → ${Math.round(x.hn)}h` +
        (x.mism.length ? `, 분류 ${x.mism.map((f) => `${f} ${a[f]}→${b[f]}`).join(", ")}` : ""),
    );
  }
  L.push("");

  // other 건수
  L.push("## other 건수", "", "| 필드 | 이전 | 이후 |", "|---|---|---|");
  for (const f of CLASS_FIELDS) {
    const c = (side: "b" | "n") => pairs.filter((p) => p[side].analysis![f] === "other").length;
    L.push(`| ${f} | ${c("b")} | ${c("n")} |`);
  }
  for (const f of ARRAY_FIELDS) {
    const c = (side: "b" | "n") => pairs.filter((p) => (p[side].analysis![f] as string[]).includes("other")).length;
    L.push(`| ${f} (other 포함) | ${c("b")} | ${c("n")} |`);
  }
  L.push("");

  // 단일 값 필드 변경
  for (const f of CLASS_FIELDS) {
    const changed = pairs.filter((p) => p.b.analysis![f] !== p.n.analysis![f]);
    L.push(`## ${f} 변경 (${changed.length}건)`, "");
    if (!changed.length) L.push("- 없음");
    for (const p of changed) L.push(`- ${title(p.n)}: ${p.b.analysis![f]} → **${p.n.analysis![f]}**`);
    L.push("");
  }

  // 배열 필드 변경
  for (const f of ARRAY_FIELDS) {
    const changed = pairs
      .map((p) => {
        const before = new Set(p.b.analysis![f] as string[]);
        const after = new Set(p.n.analysis![f] as string[]);
        return { p, added: [...after].filter((x) => !before.has(x)), removed: [...before].filter((x) => !after.has(x)) };
      })
      .filter((c) => c.added.length || c.removed.length);
    L.push(`## ${f} 변경 (${changed.length}건)`, "");
    if (!changed.length) L.push("- 없음");
    for (const c of changed) {
      const parts = [c.added.length ? `+ ${c.added.join(", ")}` : "", c.removed.length ? `- ${c.removed.join(", ")}` : ""].filter(Boolean);
      L.push(`- ${title(c.p.n)}: ${parts.join(" / ")}`);
    }
    L.push("");
  }

  // 분류 판단 애매 표시 변화
  const unc = (i: ResultItem) => i.analysis!.uncertain_fields ?? [];
  const resolved = pairs.filter((p) => unc(p.b).length && !unc(p.n).length);
  L.push(`## 애매 표시가 해소된 사례 (${resolved.length}건)`, "");
  if (!resolved.length) L.push("- 없음");
  for (const p of resolved) L.push(`- ${title(p.n)}: 이전 애매 필드 ${unc(p.b).join(", ")}`);
  L.push("");

  const cases = reviewCases(pairs.map((p) => p.n));
  L.push(`## 아직 애매한 사례 (${cases.length}건)`, "");
  if (!cases.length) L.push("- 없음");
  for (const c of cases) L.push(`- [${c.project.platform}:${c.project.external_project_id}] ${esc(c.project.title)} — ${c.reasons.join("; ")}`);
  L.push("");
  return L.join("\n");
}
