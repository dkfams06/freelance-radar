import {
  cleanText,
  emptyNormalizedProject,
  parseIntSafe,
  parseKstDate,
  uniqueStrings,
  type NormalizedProject,
} from "@fr/shared";
import type { FreemoaRaw } from "./types";

export const FREEMOA_BASE_URL = "https://www.freemoa.net";

export function freemoaProjectUrl(pno: string): string {
  return `${FREEMOA_BASE_URL}/m4/s41?first_pno=${encodeURIComponent(pno)}`;
}

/** 사이트 스크립트(s41.js) 의 표기 규칙: 1=도급, 2=시간제 상주, 3=기간제 상주, 그 외 is_stay 로 판단 */
export function workTypeLabel(workType: string | null | undefined, isStay: string | null | undefined): string {
  if (workType === "1") return "도급";
  if (workType === "2") return "시간제 상주";
  if (workType === "3") return "기간제 상주";
  return isStay === "1" ? "상주" : "도급";
}

const PROJECT_TYPE_LABELS: Record<string, string> = { "0": "[없음]", "1": "신규제작", "2": "리뉴얼", "3": "유지보수" };

/** 만원 단위 → 원 */
function manwon(v: string | null | undefined): number | null {
  const n = parseIntSafe(v);
  return n === null || n === 0 ? null : n * 10_000;
}

function flag(v: unknown): boolean | null {
  if (v === "1" || v === 1) return true;
  if (v === "0" || v === 0) return false;
  return null;
}

export function normalizeFreemoa(raw: FreemoaRaw, externalId: string, url: string): NormalizedProject {
  const row = raw.listRow ?? ({} as NonNullable<FreemoaRaw["listRow"]>);
  const v = raw.detail?.view ?? {};
  const pick = <K extends string>(key: K): string | null => {
    const val = (v as Record<string, unknown>)[key] ?? (row as Record<string, unknown>)[key];
    return val === undefined || val === null ? null : String(val);
  };
  const p = emptyNormalizedProject("freemoa", externalId, url);

  p.title = cleanText(pick("title"));
  p.description = cleanText(pick("txt"));

  const isStayLike = ["2", "3"].includes(pick("workType") ?? "") || pick("is_stay") === "1";
  p.budgetMin = manwon(pick("cost_min"));
  p.budgetMax = manwon(pick("cost_max"));
  p.budget =
    cleanText(pick("costView")) ??
    (p.budgetMin || p.budgetMax
      ? [p.budgetMin, p.budgetMax].filter(Boolean).map((n) => `${n!.toLocaleString("ko-KR")}원`).join(" ~ ")
      : null);
  p.budgetType = p.budgetMin || p.budgetMax ? (isStayLike ? "monthly" : "fixed") : p.budget ? "negotiable" : null;

  const during = parseIntSafe(pick("during"));
  p.durationDays = during && during > 0 ? during : null;
  p.projectDuration = p.durationDays ? `${p.durationDays}일` : null;

  p.registeredAt = parseKstDate(pick("INS_TIME"));
  const endtime = parseIntSafe(pick("endtime"));
  p.deadlineAt = endtime ? new Date(endtime * 1000) : parseKstDate(pick("edate"));

  const nowApply = pick("isNowApply");
  p.projectStatus = nowApply === "1" ? "모집 중" : nowApply === "0" ? "모집 마감" : null;

  const filed = cleanText(pick("proj_filed"))?.replace(/<[^>]+>/g, "") ?? null;
  const [cat, sub] = filed ? filed.split(">").map((s) => s.trim()) : [];
  p.category = cleanText(pick("proj_filed_new")) ?? cleanText(row.fld) ?? cat ?? null;
  p.subcategory = cleanText(row.fld_nm_2nd) ?? sub ?? null;

  const workLabel = workTypeLabel(pick("workType"), pick("is_stay"));
  p.projectType = workLabel;
  p.workMethod = workLabel;

  const projectTypeCode = pick("projectType");
  const projectKind = projectTypeCode ? (PROJECT_TYPE_LABELS[projectTypeCode] ?? projectTypeCode) : null;
  p.existingSystem = projectKind === "신규제작" ? "신규" : projectKind === "리뉴얼" || projectKind === "유지보수" ? `기존 시스템 (${projectKind})` : null;

  p.skills = uniqueStrings((pick("proj_language") ?? "").split(/[,/]/));
  p.requiredStack = p.skills;

  p.applicantCount = parseIntSafe(pick("ALL_APPLY_COUNT"));
  p.location = cleanText(pick("pvNmu")) ?? cleanText(row.pv_smallnm);
  p.planningStatus = cleanText(pick("plan_nm"));

  p.clientInfo = {
    name: cleanText(pick("cl_private_nm")),
    clientIdx: pick("cl_idx"),
    phoneVerified: (row as Record<string, unknown>).authHpYn === "Y" ? true : null,
  };

  const comments = (v.COMMENTS ?? []) as Array<unknown>;
  p.extra = {
    projectKind,
    beginExpect: cleanText(pick("BEGIN_EXPECT")),
    service: cleanText(pick("service")),
    referenceUrl: cleanText(pick("reference_url")),
    escrow: flag(pick("isescrow")),
    pms: flag(pick("ispms")),
    pm: flag(pick("ispm")),
    nda: flag(pick("isnda")),
    pro: flag(pick("is_pro")),
    stay: flag(pick("is_stay")),
    fieldCode: pick("proj_fld_cd"),
    fieldJson: safeJson(pick("proj_fld_json")),
    secondFieldCode: pick("F2ND"),
    deadlineDate: pick("edate"),
    languages: v.LNGS ?? [],
    fileCount: Array.isArray(v.FILES) ? v.FILES.length : null,
    commentCount: comments.length || parseIntSafe(raw.detail?.commentCount),
    detailRestricted: raw.detailRestricted,
    detailMessage: raw.detailRestricted ? (raw.detail?.errorMsg ?? null) : null,
  };

  p.rawPayload = raw;
  p.rawText = p.description;
  p.rawMetadata = {
    source: raw.source,
    status: raw.detail?.status ?? null,
    errorNo: raw.detail?.errorNo ?? null,
    detailRestricted: raw.detailRestricted,
  };
  return p;
}

function safeJson(text: string | null): unknown {
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}
