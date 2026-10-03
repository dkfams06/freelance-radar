import type { BudgetStats } from "./stats";
import type { AssetStat, ComboStat, MarketReport, RankedItem, ScopeReport, Segment, TypeStat } from "./market-stats";

const pct = (x: number | null | undefined, d = 1) => (x == null ? "-" : `${(x * 100).toFixed(d)}%`);
const f1 = (x: number | null | undefined) => (x == null ? "-" : x.toFixed(1));
const f0 = (x: number | null | undefined) => (x == null ? "-" : Math.round(x).toLocaleString("ko-KR"));
/** 원 → 만원 */
const man = (x: number | null | undefined) => (x == null ? "-" : `${Math.round(x / 10_000).toLocaleString("ko-KR")}만`);
const warn = (low: boolean) => (low ? " ⚠" : "");
const SEG_LABEL: Record<Segment, string> = { non_staffing: "일반 외주 (staffing 제외)", staffing: "staffing (상주/기간제/월 단가)" };

/** 중앙값을 맨 앞에 굵게 (평균보다 중요) */
function budgetCells(b: BudgetStats): string {
  return `**${man(b.median)}** | ${man(b.p25)} | ${man(b.p75)} | ${man(b.mean)} | ${b.n}`;
}

function typeTable(types: TypeStat[], unit: string): string[] {
  if (!types.length) return ["_분석된 프로젝트가 없습니다._", ""];
  return [
    `| project_type | n | 비율 | 월평균(표본) | 월평균(추정) | **중앙 예산** | p25 | p75 | 평균 | 예산 n | 난이도 | 시간 min | 시간 max | 학습 | 재사용 | 시장성 | reuse 4단계 (h/m/l/o) | reuse 3단계 (h/m/low_reuse) |`,
    "|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|",
    ...types.map((t) => {
      const r4 = ["high", "medium", "low", "one_off"].map((k) => t.reuse_4[k] ?? 0).join("/");
      const r3 = `${t.reuse_3.high}/${t.reuse_3.medium}/${t.reuse_3.low_reuse}`;
      return `| ${t.key}${warn(t.low_sample)} | ${t.n} | ${pct(t.share)} | ${f1(t.monthly_avg_in_sample)} | ${f1(t.monthly_avg_estimated)} | ${budgetCells(t.budget)} | ${f1(t.avg_vibe_coding_difficulty)} | ${f0(t.avg_hours_min)} | ${f0(t.avg_hours_max)} | ${f1(t.avg_learning_value)} | ${f1(t.avg_reusability_value)} | ${f1(t.avg_market_value)} | ${r4} | ${r3} |`;
    }),
    "",
    `_예산 단위: ${unit}. ⚠ = 표본 부족(n < 기준). 월평균(추정)은 표본 비율 × 원본 월평균이라 표본이 무작위일 때만 의미가 있습니다._`,
    "",
  ];
}

function assetTable(assets: AssetStat[]): string[] {
  if (!assets.length) return ["_분석된 프로젝트가 없습니다._", ""];
  return [
    "| asset | 등장 n | 등장 비율 | **중앙 예산** | p25 | p75 | 평균 | 예산 n | 난이도 | 학습 | 재사용 |",
    "|---|---|---|---|---|---|---|---|---|---|---|",
    ...assets.map(
      (a) => `| ${a.key}${warn(a.low_sample)} | ${a.n} | ${pct(a.share)} | ${budgetCells(a.budget)} | ${f1(a.avg_vibe_coding_difficulty)} | ${f1(a.avg_learning_value)} | ${f1(a.avg_reusability_value)} |`,
    ),
    "",
  ];
}

function comboTable(combos: ComboStat[], minCombo: number): string[] {
  if (!combos.length) return [`_${minCombo}건 이상 등장한 자산 조합이 아직 없습니다 (분석 표본이 작음)._`, ""];
  return [
    "| 자산 묶음 | 등장 n | 비율 | **중앙 예산** | p25 | p75 | 평균 | 예산 n | 난이도 | 학습 | 재사용 |",
    "|---|---|---|---|---|---|---|---|---|---|---|",
    ...combos.slice(0, 40).map(
      (c) => `| ${c.assets.join(" + ")} | ${c.n} | ${pct(c.share)} | ${budgetCells(c.budget)} | ${f1(c.avg_vibe_coding_difficulty)} | ${f1(c.avg_learning_value)} | ${f1(c.avg_reusability_value)} |`,
    ),
    "",
  ];
}

function rankList(title: string, items: RankedItem[], fmt: (v: number) => string, valueLabel: string, showN = true): string[] {
  if (!items.length) return [`### ${title}`, "", "_해당 없음_", ""];
  return [
    `### ${title}`,
    "",
    showN ? `| 순위 | project_type | ${valueLabel} | n |` : `| 순위 | project_type | ${valueLabel} |`,
    showN ? "|---|---|---|---|" : "|---|---|---|",
    ...items.map((it, i) => `| ${i + 1} | ${it.key}${warn(it.low_sample)} | ${fmt(it.value)} |${showN ? ` ${it.n} |` : ""}`),
    "",
  ];
}

function scopeSection(title: string, s: ScopeReport, unit: string, minN: number, minCombo: number): string[] {
  const L: string[] = [`## ${title}`, "", `- 분석 표본: **${s.n}건** (${SEG_LABEL[s.segment]})`];
  if (s.n) {
    L.push(
      `- 표본 평균: 난이도 ${f1(s.averages.avg_vibe_coding_difficulty)} · 학습 ${f1(s.averages.avg_learning_value)} · 재사용 ${f1(s.averages.avg_reusability_value)} · 시장성 ${f1(s.averages.avg_market_value)}`,
      `- reuse: 4단계 high ${s.reuse.reuse_4.high ?? 0} / medium ${s.reuse.reuse_4.medium ?? 0} / low ${s.reuse.reuse_4.low ?? 0} / one_off ${s.reuse.reuse_4.one_off ?? 0}` +
        ` → 3단계 high ${s.reuse.reuse_3.high} / medium ${s.reuse.reuse_3.medium} / low_reuse ${s.reuse.reuse_3.low_reuse}`,
    );
  }
  L.push("", `### project_type별 통계 (n < ${minN} 은 ⚠)`, "", ...typeTable(s.types, unit));
  L.push("### technology_assets별 통계", "", ...assetTable(s.assets));
  L.push(`### technology_assets 조합 (${minCombo}건 이상, 항상 함께 등장하는 자산은 한 묶음으로 표시)`, "", ...comboTable(s.combos, minCombo));
  return L;
}

export function renderMarketReport(r: MarketReport): string {
  const b = r.base;
  const c = r.coverage;
  const ns = b.non_staffing;
  const st = b.staffing;
  const L: string[] = [];
  L.push(`# 시장 통계 v1 (analysis_version = ${r.analysis_version} 기준)`, "");
  L.push(`- 생성: ${r.generated_at}`);
  L.push(`- 원본 기간: ${b.date_range.from ?? "-"} ~ ${b.date_range.to ?? "-"} (KST) (완전한 달 ${b.complete_months}개로 월평균 계산)`);
  L.push("- **기본 시장 화면은 staffing 제외**이며 staffing 은 별도 섹션으로 분리했습니다.", "- 예산은 **중앙값**을 우선 지표로 보고, 평균은 이상치 영향이 커서 보조로만 표시합니다.", "");

  // 0. 커버리지
  L.push("## 0. 데이터 범위와 분석 커버리지", "");
  L.push("| 구분 | 건수 |", "|---|---|");
  L.push(`| 전체 원본 프로젝트 수 | **${b.total.toLocaleString("ko-KR")}** |`);
  L.push(`| 분석 완료 프로젝트 수 (${c.version}) | **${c.analyzed.toLocaleString("ko-KR")}** |`);
  L.push(`| 분석 커버리지 | **${pct(c.coverage_rate, 2)}** |`);
  L.push(`| 원본 일반 외주 / staffing | ${c.total_by_segment.non_staffing.toLocaleString("ko-KR")} / ${c.total_by_segment.staffing.toLocaleString("ko-KR")} |`);
  L.push(`| 분석 완료 일반 외주 / staffing | ${c.analyzed_by_segment.non_staffing} / ${c.analyzed_by_segment.staffing} |`);
  L.push(`| 분석 완료 플랫폼별 | ${Object.entries(c.analyzed_by_platform).map(([k, v]) => `${k} ${v}`).join(", ") || "-"} |`, "");
  for (const w of c.warnings) L.push(`> ⚠ ${w}`);
  if (c.warnings.length) L.push("");

  // 1. 원본 전체
  L.push("## 1. 원본 전체 시장 통계 (분석 불필요)", "");
  L.push("### 규모", "", "| 구분 | 건수 | 비율 |", "|---|---|---|");
  L.push(`| 전체 | ${b.total.toLocaleString("ko-KR")} | 100% |`);
  for (const [k, v] of Object.entries(b.by_platform)) L.push(`| 플랫폼: ${k} | ${v.toLocaleString("ko-KR")} | ${pct(v / b.total)} |`);
  L.push(`| 일반 외주 (staffing 제외) | ${ns.count.toLocaleString("ko-KR")} | ${pct(ns.share)} |`);
  L.push(`| staffing | ${st.count.toLocaleString("ko-KR")} | ${pct(st.share)} |`, "");
  L.push("| 플랫폼 | 일반 외주 | staffing | staffing 비율 |", "|---|---|---|---|");
  for (const k of Object.keys(b.by_platform)) {
    const a = ns.by_platform[k] ?? 0;
    const s = st.by_platform[k] ?? 0;
    L.push(`| ${k} | ${a.toLocaleString("ko-KR")} | ${s.toLocaleString("ko-KR")} | ${pct(a + s ? s / (a + s) : 0)} |`);
  }
  L.push("");

  L.push("### 월별 등록 프로젝트 수 (KST)", "", "| 월 | 전체 | 일반 외주 | staffing | staffing 비율 |", "|---|---|---|---|---|");
  for (const m of b.months) L.push(`| ${m.month}${m.partial ? " (부분)" : ""} | ${m.total} | ${m.non_staffing} | ${m.staffing} | ${pct(m.total ? m.staffing / m.total : 0)} |`);
  L.push(`| **월평균 (완전한 ${b.complete_months}개월)** | **${f1(b.monthly_avg.all)}** | **${f1(b.monthly_avg.non_staffing)}** | **${f1(b.monthly_avg.staffing)}** | |`, "");

  L.push("### 예산 통계", "");
  L.push("| 구분 | 전체 n | 예산 있음 n | 존재율 | **중앙값** | p25 | p75 | 평균 | 단위 |", "|---|---|---|---|---|---|---|---|---|");
  const row = (label: string, s: typeof ns.budget) =>
    `| ${label} | ${s.count.toLocaleString("ko-KR")} | ${s.with_budget.toLocaleString("ko-KR")} | ${pct(s.presence_rate)} | **${man(s.stats.median)}** | ${man(s.stats.p25)} | ${man(s.stats.p75)} | ${man(s.stats.mean)} | ${s.unit} |`;
  L.push(row("일반 외주 (전체)", ns.budget));
  for (const [k, v] of Object.entries(ns.budget_by_platform)) L.push(row(`일반 외주 · ${k}`, v));
  L.push(row("staffing (전체)", st.budget));
  for (const [k, v] of Object.entries(st.budget_by_platform)) L.push(row(`staffing · ${k}`, v));
  L.push("", `_예산 존재율은 협의/미정(negotiable) 공고가 빠지기 때문에 100% 가 아닙니다. 전체 구분 없이 금액이 있는 비율: ${pct(b.overall_budget_presence)}._`, "");

  // 2~
  L.push(...scopeSection("2. 일반 외주 (staffing 제외) — 분석 표본 기준", r.non_staffing, "원(총액)", r.params.min_n, r.params.min_combo));
  L.push(...scopeSection("3. staffing (별도) — 분석 표본 기준", r.staffing, "원/월", r.params.min_n, r.params.min_combo));

  // 4. 관심 조합
  L.push("## 4. 관심 자산 조합 등장 건수 (일반 외주 / staffing)", "");
  L.push(`_${r.params.min_combo}건 이상만 표에 표시합니다. 전체 건수는 JSON 의 watchlist 에 있습니다._`, "");
  const shown = [...r.non_staffing.watchlist.map((w) => ({ w, seg: "일반 외주" })), ...r.staffing.watchlist.map((w) => ({ w, seg: "staffing" }))].filter((x) => x.w.n >= r.params.min_combo);
  if (!shown.length) L.push("_관심 조합 중 기준 이상 등장한 것이 아직 없습니다._", "");
  else {
    L.push("| 구분 | 조합 | 등장 n | **중앙 예산** | 난이도 |", "|---|---|---|---|---|");
    for (const { w, seg } of shown) L.push(`| ${seg} | ${w.assets.join(" + ")} | ${w.n} | **${man(w.budget.median)}** | ${f1(w.avg_vibe_coding_difficulty)} |`);
    L.push("");
  }

  // 5. 목록
  const lists = r.non_staffing.lists!;
  L.push("## 5. 다음 단계 판단용 지표별 목록 (일반 외주 기준, 합산 순위 아님)", "");
  if (lists.reference_mode) {
    L.push(
      `> ⚠ n ≥ ${lists.min_n} 인 유형이 ${lists.eligible_types}개뿐이라 **모든 유형을 참고용으로** 보여줍니다. 아래 순위는 의사결정에 쓰지 마세요 (n 이 1~3 인 평균/중앙값은 의미가 약합니다).`,
      "",
    );
  }
  L.push(...rankList("공고가 많은 유형 TOP 10 (분석 표본 내 건수)", lists.top_count, (v) => String(v), "건수", false));
  L.push(...rankList("중앙 견적이 높은 유형 TOP 10 (일반 외주 총액)", lists.top_median_budget, (v) => man(v), "중앙 예산"));
  L.push(...rankList("AI 난이도가 낮은 유형 TOP 10 (평균 vibe_coding_difficulty)", lists.top_low_difficulty, f1, "평균 난이도"));
  L.push(...rankList("재사용 가치가 높은 유형 TOP 10 (평균 reusability_value)", lists.top_reusability, f1, "평균 재사용"));
  L.push(...rankList("학습 가치가 높은 유형 TOP 10 (평균 learning_value)", lists.top_learning, f1, "평균 학습"));
  const h = lists.high_budget_low_difficulty;
  L.push("### \"견적 높음 + AI 난이도 낮음\" 후보 유형", "");
  L.push(`- 기준: 유형 중앙 예산 ≥ 원본 일반 외주 전체 중앙값(**${man(h.thresholds.median_budget)}**) 이고 평균 난이도 ≤ 분석 표본 평균(**${f1(h.thresholds.avg_difficulty)}**)`);
  if (!h.candidates.length) L.push("- 해당 후보 없음", "");
  else {
    L.push("", "| project_type | 중앙 예산 | 평균 난이도 | n |", "|---|---|---|---|");
    for (const x of h.candidates) L.push(`| ${x.key}${warn(x.low_sample)} | **${man(x.median_budget)}** | ${f1(x.avg_difficulty)} | ${x.n} |`);
    L.push("");
  }

  // 6. 한계
  L.push("## 6. 해석 주의", "");
  for (const n of r.notes) L.push(`- ${n}`);
  L.push("- 위 목록은 지표별로 따로 본 것이며 합산 점수/최종 순위는 만들지 않았습니다.");
  L.push("- 분석 기반 표(2~5번 섹션)는 분석 커버리지가 올라가기 전까지 참고용입니다. 전체 분석 후 같은 명령으로 다시 생성합니다.", "");
  return L.join("\n");
}
