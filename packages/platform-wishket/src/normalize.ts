import {
  cleanText,
  emptyNormalizedProject,
  parseBudgetRange,
  parseDurationDays,
  parseIntSafe,
  parseKstDate,
  uniqueStrings,
  type NormalizedProject,
} from "@fr/shared";
import type { WishketRaw } from "./types";

export const WISHKET_BASE_URL = "https://www.wishket.com";

const TYPE_MARKS = ["외주", "기간제", "상주"];
const PRIVATE_MARK = "프라이빗 매칭";
const NON_STATUS_MARKS = new Set(["NEW", PRIVATE_MARK, ...TYPE_MARKS]);

/** 상태 마크 정리: 툴팁 문구가 붙은 경우 앞부분만 사용 */
export function cleanStatusMark(mark: string): string {
  return mark.startsWith(PRIVATE_MARK) ? PRIVATE_MARK : mark.trim();
}

/** "2026년 10월 15일" → 해당일 23:59:59 KST */
export function parseDeadline(text: string | null | undefined): Date | null {
  const d = parseKstDate(text);
  return d ? new Date(d.getTime() + 86_400_000 - 1000) : null;
}

export function budgetTypeOf(budget: string | null, typeMark: string | null): string | null {
  if (!budget) return null;
  if (/협의/.test(budget) && !/\d/.test(budget)) return "negotiable";
  if (/\/\s*월|월 금액/.test(budget) || typeMark === "기간제") return "monthly";
  return "fixed";
}

function field(fields: Record<string, string>, ...labels: string[]): string | null {
  for (const l of labels) {
    const v = cleanText(fields[l]);
    if (v) return v;
  }
  return null;
}

export function normalizeWishket(raw: WishketRaw, externalId: string, url: string): NormalizedProject {
  const d = raw.detail;
  const card = raw.listCard;
  const p = emptyNormalizedProject("wishket", externalId, url);
  const fields = d.fields ?? {};

  const statusMarks = (d.statusMarks?.length ? d.statusMarks : (card?.statusMarks ?? [])).map(cleanStatusMark);
  const privateMatching = statusMarks.includes(PRIVATE_MARK);
  const typeMark = statusMarks.find((m) => TYPE_MARKS.includes(m)) ?? cleanText(card?.typeMark) ?? null;

  p.title = cleanText(d.title) ?? cleanText(card?.title);
  // 프라이빗 매칭은 상위 등급 파트너에게만 본문이 공개된다 → 안내 문구는 description 으로 저장하지 않음
  p.description = privateMatching && /프라이빗 매칭/.test(d.description ?? "") ? null : cleanText(d.description);

  // 예산: 외주 = "예상 금액", 기간제 = 모집 대상의 금액 ("5,500,000원/월")
  const budget = field(fields, "예상 금액", "월 금액") ?? cleanText(d.target?.budget) ?? budgetFromCard(card?.budgetText);
  p.budget = budget;
  p.budgetType = budgetTypeOf(budget, typeMark);
  if (budget && p.budgetType !== "negotiable") {
    const range = parseBudgetRange(budget.replace(/\/\s*월/, ""));
    p.budgetMin = range.min;
    p.budgetMax = range.max;
  }

  p.projectDuration = field(fields, "예상 기간") ?? stripLabel(card?.termText, "예상 기간");
  p.durationDays = parseDurationDays(p.projectDuration);

  p.registeredAt = parseKstDate(d.registeredText) ?? parseKstDate(card?.registeredText);
  p.deadlineAt = parseDeadline(field(fields, "모집 마감일"));

  p.projectStatus = statusMarks.find((m) => !NON_STATUS_MARKS.has(m)) ?? null;

  const groups = d.categoryGroups ?? [];
  p.category = groups[0]?.join(", ") ?? cleanText(d.target?.role) ?? cleanText(card?.roleOrCategory);
  p.subcategory = groups[1]?.join(", ") ?? null;
  p.projectType = typeMark;

  const skills = (d.skills ?? []).map((s) => s.name);
  p.skills = uniqueStrings(skills.length ? skills : (card?.skills ?? []).map((s) => s.split("·")[0]));
  p.requiredStack = typeMark === "기간제" ? p.skills : [];

  const applicants = field(fields, "지원자 수") ?? stripLabel(card?.applicantText, "지원자");
  p.applicantCount = applicants === null ? null : /없음/.test(applicants) ? 0 : parseIntSafe(applicants);

  p.location = field(fields, "근무 위치", "클라이언트 위치") ?? cleanText(card?.location);
  p.workMethod = field(fields, "근무 형태") ?? (typeMark === "기간제" ? "상주" : typeMark === "외주" ? "도급" : null);
  p.existingSystem = field(fields, "진행 분류");
  p.planningStatus = field(fields, "기획 상태");
  p.designStatus = field(fields, "디자인 상태");
  p.developmentScope = field(fields, "개발 범위") ?? p.subcategory;

  const c = d.client;
  p.clientInfo = c
    ? {
        name: cleanText(c.name) ?? cleanText(card?.clientName),
        rating: c.rating ? Number.parseFloat(c.rating) : null,
        reviewCount: parseIntSafe(c.ratingCount),
        verified: (c.badges ?? []).some((b) => /인증/.test(b)) || (card?.clientBadges ?? []).some((b) => /인증/.test(b)),
        badges: uniqueStrings([...(c.badges ?? []), ...(card?.clientBadges ?? [])]),
        stats: c.stats ?? {},
        projectCount: parseIntSafe(c.stats?.["프로젝트 등록"]),
      }
    : card
      ? { name: card.clientName, rating: card.clientRating ? Number.parseFloat(card.clientRating) : null, badges: card.clientBadges }
      : null;

  p.extra = {
    industry: groups.length > 2 ? groups.slice(2).flat().map((g) => g.replace(/,$/, "")) : uniqueStrings([fields["프로젝트 산업 분야"]]),
    privateMatching,
    statusMarks,
    fields,
    fieldNotes: d.fieldNotes ?? {},
    target: d.target ?? null,
    skillDetails: d.skills ?? [],
    startDate: field(fields, "예상 시작일", "근무 시작일") ?? stripLabel(card?.startText, "근무 시작일"),
    workConditions: d.workConditions ?? [],
    recruitConditions: d.recruitConditions ?? [],
    targetLevelInfo: d.targetLevelInfo ?? null,
    commentCount: parseIntSafe(d.commentCount),
    level: d.target?.level ?? cleanText(card?.level),
    role: d.target?.role ?? (typeMark === "기간제" ? cleanText(card?.roleOrCategory) : null),
    detailLocked: d.locked,
  };

  p.rawPayload = raw;
  p.rawText = d.text;
  p.rawMetadata = { source: d.source, status: d.status, finalUrl: d.finalUrl, loggedIn: d.loggedIn, locked: d.locked };
  return p;
}

function stripLabel(text: string | null | undefined, label: string): string | null {
  if (!text) return null;
  return cleanText(text.replace(label, ""));
}

function budgetFromCard(text: string | null | undefined): string | null {
  if (!text) return null;
  return cleanText(text.replace(/^(예상 금액|월 금액)/, ""));
}
