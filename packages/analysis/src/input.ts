import { createHash } from "node:crypto";

/** Analyzer 가 읽는 projects 컬럼 (raw_* 는 읽지 않는다) */
export interface AnalysisSourceProject {
  id: string;
  platform: string;
  external_project_id: string;
  title: string | null;
  description: string | null;
  budget: string | null;
  budget_min: number | null;
  budget_max: number | null;
  budget_type: string | null;
  project_duration: string | null;
  duration_days: number | null;
  registered_at: string | null;
  project_status: string | null;
  category: string | null;
  subcategory: string | null;
  project_type: string | null;
  skills: string[] | null;
  location: string | null;
  work_method: string | null;
  development_scope: string | null;
  existing_system: string | null;
  planning_status: string | null;
  design_status: string | null;
  required_stack: string[] | null;
  preferred_stack: string[] | null;
  extra: Record<string, unknown> | null;
}

export const ANALYSIS_SOURCE_COLUMNS =
  "id,platform,external_project_id,title,description,budget,budget_min,budget_max,budget_type,project_duration,duration_days," +
  "registered_at,project_status,category,subcategory,project_type,skills,location,work_method,development_scope,existing_system," +
  "planning_status,design_status,required_stack,preferred_stack,extra";

/** 설명이 이보다 길면 잘라서 보내고 input.truncated=true 로 기록한다 (토큰 상한) */
export const MAX_DESCRIPTION_CHARS = 9000;
const MAX_EXTRA_VALUE_CHARS = 400;

// extra 중 분석에 의미 없는 내부 코드/카운터
const EXTRA_SKIP = new Set([
  "fieldCode",
  "fieldJson",
  "secondFieldCode",
  "fileCount",
  "commentCount",
  "referenceUrl",
  "detailMessage",
  "service",
  "statusMarks",
]);

export interface BuiltInput {
  text: string;
  truncated: boolean;
  /** 원본 정보가 거의 없는 프로젝트 (프라이빗 매칭/열람 제한) */
  limitedInfo: boolean;
  hash: string;
}

function line(label: string, value: unknown): string | null {
  if (value === null || value === undefined) return null;
  if (Array.isArray(value)) return value.length ? `${label}: ${value.join(", ")}` : null;
  const s = String(value).trim();
  return s ? `${label}: ${s}` : null;
}

/** seen: 이미 출력한 값 (공통 컬럼과 extra 에 같은 값이 반복되는 경우가 많아 중복 제거) */
function extraLines(extra: Record<string, unknown> | null, seen: Set<string>): string[] {
  if (!extra) return [];
  const out: string[] = [];
  const push = (k: string, v: unknown) => {
    if (EXTRA_SKIP.has(k)) return;
    if (typeof v === "string" && v.trim()) {
      const value = v.trim().slice(0, MAX_EXTRA_VALUE_CHARS);
      if (seen.has(value)) return;
      seen.add(value);
      out.push(`- ${k}: ${value}`);
    }
    else if (typeof v === "boolean" && v) out.push(`- ${k}: true`);
    else if (Array.isArray(v) && v.length && v.every((x) => typeof x === "string")) out.push(`- ${k}: ${v.join(", ")}`);
  };
  for (const [k, v] of Object.entries(extra)) {
    if (k === "fields" && v && typeof v === "object" && !Array.isArray(v)) {
      for (const [fk, fv] of Object.entries(v as Record<string, unknown>)) push(fk, fv);
    } else {
      push(k, v);
    }
  }
  return out;
}

/** projects row → 모델 입력 텍스트. 같은 입력이면 같은 hash (재분석 필요 여부 판단용) */
export function buildProjectInput(p: AnalysisSourceProject): BuiltInput {
  const desc = (p.description ?? "").replace(/\r\n/g, "\n").trim();
  const truncated = desc.length > MAX_DESCRIPTION_CHARS;
  const extra = p.extra ?? {};
  const limitedInfo = Boolean(extra.privateMatching || extra.detailRestricted) || desc.length < 80;

  const header = [
    line("플랫폼", p.platform),
    line("제목", p.title),
    line("예산", p.budget),
    line("예산 유형", p.budget_type),
    line("기간", p.project_duration),
    line("사이트 분류", [p.category, p.subcategory].filter(Boolean).join(" / ") || null),
    line("계약 형태", p.project_type),
    line("근무 방식", p.work_method),
    line("지역", p.location),
    line("개발 범위", p.development_scope),
    line("기존 시스템", p.existing_system),
    line("기획 상태", p.planning_status),
    line("디자인 상태", p.design_status),
    line("기술 태그", p.skills ?? []),
    line("필수 기술", p.required_stack ?? []),
    line("우대 기술", p.preferred_stack ?? []),
  ].filter((x): x is string => x !== null);

  const seen = new Set(header.map((h) => h.slice(h.indexOf(": ") + 2)));
  const extras = extraLines(extra, seen);
  const parts = [header.join("\n")];
  if (extras.length) parts.push(`[추가 항목]\n${extras.join("\n")}`);
  parts.push(
    `[프로젝트 설명]\n${desc ? (truncated ? `${desc.slice(0, MAX_DESCRIPTION_CHARS)}\n...(이하 생략)` : desc) : "(설명 비공개 또는 없음)"}`,
  );
  const text = parts.join("\n\n");
  return { text, truncated, limitedInfo, hash: createHash("sha256").update(text).digest("hex").slice(0, 32) };
}
