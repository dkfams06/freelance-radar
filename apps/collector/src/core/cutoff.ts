import type { ProjectListItem } from "@fr/shared";

export function isBeforeCutoff(date: Date | null | undefined, cutoff: Date): boolean {
  return !!date && date.getTime() < cutoff.getTime();
}

export interface PageCutoffDecision {
  /** 이 페이지에서 처리할 항목 (cutoff 이전으로 확인된 항목 제외) */
  eligible: ProjectListItem[];
  /** 목록 날짜로 cutoff 이전이 확인되어 건너뛴 항목 수 */
  skippedBeforeCutoff: number;
  /** 정렬 대상 항목(고정글 제외)이 모두 cutoff 이전 → 이후 페이지는 볼 필요 없음 */
  reachedCutoff: boolean;
}

/**
 * 최신순 목록의 한 페이지를 cutoff 기준으로 판정한다.
 * - 상단 고정(pinned) 항목은 정렬 순서를 따르지 않으므로 종료 판정에 쓰지 않는다.
 * - 목록에 날짜가 없는 항목은 상세 조회 후 판정하도록 eligible 에 남긴다.
 */
export function evaluatePageAgainstCutoff(items: ProjectListItem[], cutoff: Date): PageCutoffDecision {
  const eligible: ProjectListItem[] = [];
  let skipped = 0;
  for (const item of items) {
    if (isBeforeCutoff(item.registeredAt, cutoff)) skipped++;
    else eligible.push(item);
  }
  const ordered = items.filter((i) => !i.pinned);
  const reachedCutoff = ordered.length > 0 && ordered.every((i) => isBeforeCutoff(i.registeredAt, cutoff));
  return { eligible, skippedBeforeCutoff: skipped, reachedCutoff };
}

/**
 * 상세 조회로 알게 된 등록일까지 반영한 페이지 종료 판정.
 * 정렬 대상 항목 중 날짜를 아는 항목이 있고 그 전부가 cutoff 이전이면 종료.
 */
export function pageEntirelyBeforeCutoff(
  dates: Array<{ pinned?: boolean; registeredAt?: Date | null }>,
  cutoff: Date,
): boolean {
  const ordered = dates.filter((d) => !d.pinned);
  const known = ordered.filter((d) => d.registeredAt);
  return known.length > 0 && known.length === ordered.length && known.every((d) => isBeforeCutoff(d.registeredAt, cutoff));
}
