/** 목록 카드에서 추출한 값 (위시캣 /project/?d=... XHR 응답의 HTML 조각) */
export interface WishketListCard {
  id: string;
  path: string;
  title: string | null;
  statusMarks: string[];
  /** 예: "예상 금액 협의 후 결정", "월 금액 7,300,000원 /월" */
  budgetText: string | null;
  termText: string | null;
  startText: string | null;
  roleOrCategory: string | null;
  level: string | null;
  typeMark: string | null;
  skills: string[];
  location: string | null;
  registeredText: string | null;
  deadlineText: string | null;
  applicantText: string | null;
  clientName: string | null;
  clientRating: string | null;
  clientBadges: string[];
}

export interface WishketListResponse {
  status: number;
  count: number | null;
  hasNext: boolean;
  cards: WishketListCard[];
  loggedIn: boolean | null;
}

export interface LabeledValues {
  title: string | null;
  values: string[];
}

/** 상세 페이지 DOM 에서 추출한 구조화 원본 */
export interface WishketDetailPayload {
  source: "wishket.detail.dom";
  status: number;
  finalUrl: string;
  loggedIn: boolean;
  /** "로그인하고 ... 확인하기" 가 보이면 비로그인 상태로 일부 정보가 가려진 것 */
  locked: boolean;
  captcha: boolean;
  notFound?: boolean;
  pageTitle?: string | null;

  statusMarks: string[];
  registeredText: string | null;
  title: string | null;
  categoryGroups: string[][];
  /** 라벨 → 값 (예상 금액, 예상 기간, 지원자 수, 모집 마감일, 진행 분류, 기획 상태, 근무 위치 ...) */
  fields: Record<string, string>;
  /** 라벨 → 부가 표기 (예: 모집 마감일 → "마감 1주 6일 전") */
  fieldNotes: Record<string, string>;
  /** 기간제(상주) 프로젝트의 모집 대상 */
  target: { role: string | null; level: string | null; experience: string | null; budget: string | null } | null;
  skills: Array<{ name: string; detail: string | null }>;
  description: string | null;
  workConditions: LabeledValues[];
  recruitConditions: LabeledValues[];
  targetLevelInfo: string | null;
  client: {
    name: string | null;
    rating: string | null;
    ratingCount: string | null;
    badges: string[];
    stats: Record<string, string>;
  } | null;
  commentCount: string | null;
  text: string | null;
}

export interface WishketRaw {
  detail: WishketDetailPayload;
  listCard: WishketListCard | null;
}
