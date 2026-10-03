/**
 * 표준 기능 vocabulary (feature_version f1) + 프로젝트별 feature set 추출.
 *
 * - taxonomy v3.3(분류)와 독립이다. taxonomy.ts / 프롬프트를 건드리지 않는다.
 * - LLM 호출 없음. 근거가 있는 기능만 넣는다:
 *   1) analysis: v3.3 분석값(required_features / required_integrations)의 코드를 표준 기능으로 매핑
 *   2) text: 프로젝트 제목·설명에 명시된 키워드 (계약/우대/자격 요건 등 기능과 무관한 줄은 제외)
 *   기능마다 어떤 근거로 들어왔는지(evidence)를 남긴다.
 * - 비기능 항목(유지보수, 인프라, 보안 강화, 반응형 같은 UI 특성)은 vocabulary 에 넣지 않는다.
 *   프로젝트 간 "요구 기능" 비교를 흐리기 때문.
 * - 문서: docs/feature-vocabulary-f1.md
 */

export const FEATURE_VERSION = "f1";

export type FeatureGroup = "account" | "admin" | "content" | "commerce" | "booking" | "communication" | "data" | "business" | "integration" | "ai" | "platform";

export interface FeatureDef {
  label: string;
  group: FeatureGroup;
  /** v3.3 분석값 코드 → 이 기능 (정확히 일치) */
  aliases: string[];
  /** 분석값 코드가 별칭에 없을 때 쓰는 코드 패턴 */
  codePattern?: RegExp;
  /** 설명/제목 키워드 (명시적인 표현만) */
  text?: RegExp;
}

export const FEATURES = {
  // --- 계정 ---
  authentication: {
    label: "회원가입/로그인",
    group: "account",
    aliases: ["authentication", "login", "signup", "sign_up", "membership", "user_auth"],
    codePattern: /(^|_)(login|signup|auth)(_|$)/,
    text: /회원\s?가입|로그인/,
  },
  social_login: {
    label: "소셜 로그인",
    group: "account",
    aliases: ["social_login", "kakao_login", "naver_login", "google_login", "apple_login"],
    codePattern: /social_login|(kakao|naver|google|apple)_login/,
    text: /소셜\s?로그인|(카카오|네이버|구글|애플)\s?로그인|간편\s?로그인|SNS\s?로그인/i,
  },
  identity_verification: {
    label: "본인인증",
    group: "account",
    aliases: ["identity_verification", "identity_verification_service"],
    text: /본인\s?인증|휴대폰\s?인증|PASS\s?인증|실명\s?인증/i,
  },
  user_management: {
    label: "회원/사용자 관리",
    group: "account",
    aliases: ["user_management", "member_management", "account_management"],
    codePattern: /(user|member|account)_management/,
    text: /(회원|사용자|유저)\s?관리/,
  },
  role_permission: {
    label: "역할/권한",
    group: "account",
    aliases: ["role_permission", "rbac", "permission", "permission_management", "access_control"],
    codePattern: /role|permission|rbac|access_control/,
    text: /권한\s?(관리|분리|설정|부여|별|체계)|역할별|등급별\s?(권한|접근)/,
  },
  // --- 관리 ---
  admin_dashboard: {
    label: "관리자 페이지",
    group: "admin",
    aliases: ["admin_dashboard", "admin_page", "admin", "backoffice", "admin_panel", "admin_system"],
    codePattern: /admin|backoffice/,
    text: /관리자\s?(페이지|화면|모드|기능|시스템|웹)|어드민|백오피스/,
  },
  crud_data_management: {
    label: "데이터 등록·수정·관리(CRUD)",
    group: "admin",
    aliases: ["crud", "data_management", "record_management", "data_entry"],
    codePattern: /(^|_)crud(_|$)|record_management|data_entry/,
    text: /CRUD|등록\s?[·\/,]\s?수정\s?[·\/,]\s?삭제/i,
  },
  // --- 콘텐츠/커뮤니티 ---
  cms_content: {
    label: "콘텐츠 관리(CMS)",
    group: "content",
    aliases: ["cms", "content_management", "article_management", "banner_management"],
    codePattern: /(^|_)cms(_|$)|content_management|banner/,
    text: /CMS|콘텐츠\s?관리|게시물\s?관리|배너\s?관리|팝업\s?관리/i,
  },
  board_community: {
    label: "게시판/커뮤니티",
    group: "content",
    aliases: ["board_community", "community", "bulletin_board", "notice_board", "notice"],
    codePattern: /board|community|forum/,
    text: /게시판|커뮤니티|공지\s?사항\s?(관리|등록|게시판|기능|작성)/,
  },
  comments_reviews: {
    label: "리뷰/후기/댓글",
    group: "content",
    aliases: ["comments_reviews", "review", "reviews", "rating"],
    codePattern: /review|rating|comment/,
    text: /(고객|이용|상품|구매)\s?리뷰|리뷰\s?(작성|등록|관리|기능|목록)|후기|평점|별점|댓글/,
  },
  search_filter: {
    label: "검색/필터",
    group: "content",
    aliases: ["search_filter", "search", "filtering", "advanced_search"],
    codePattern: /search|filter/,
    text: /검색|필터/,
  },
  // --- 커머스 ---
  listing_catalog: {
    label: "상품/매물 목록·상세",
    group: "commerce",
    aliases: ["product_catalog", "listing", "catalog", "product_management", "listing_management"],
    codePattern: /catalog|listing|product_(management|registration|detail)/,
    text: /상품\s?(등록|목록|상세|관리)|매물\s?(등록|목록|관리)|메뉴\s?등록/,
  },
  cart_checkout: {
    label: "장바구니/주문서",
    group: "commerce",
    aliases: ["cart_checkout", "cart", "checkout"],
    codePattern: /cart|checkout/,
    text: /장바구니/,
  },
  order_management: {
    label: "주문/발주 관리",
    group: "commerce",
    aliases: ["order_management", "order", "order_processing", "purchase_order"],
    codePattern: /(^|_)order(s)?(_|$)|purchase_order/,
    text: /주문\s?(관리|내역|처리|조회|접수)|발주(?!\s?(사|처|기관|자))/,
  },
  payment: {
    label: "결제",
    group: "commerce",
    aliases: ["payment", "payment_gateway", "easy_pay", "card_payment", "in_app_purchase", "apple_in_app_purchase", "pg_integration"],
    codePattern: /payment|(^|_)pg(_|$)|in_app_purchase/,
    text: /PG\s?(사|연동|결제)|결제\s?(모듈|연동|기능|시스템|창|페이지)|간편\s?결제|카드\s?결제|토스\s?페이먼츠|포트원|아임포트|이니시스|인앱\s?결제|온라인\s?결제/i,
  },
  subscription: {
    label: "정기결제/구독",
    group: "commerce",
    aliases: ["subscription_billing", "subscription", "recurring_billing", "membership_billing"],
    codePattern: /subscription|recurring/,
    text: /정기\s?결제|구독\s?(결제|서비스|모델|형)|멤버십\s?결제/,
  },
  settlement: {
    label: "정산",
    group: "commerce",
    aliases: ["settlement", "payout", "commission"],
    codePattern: /settlement|payout|commission/,
    text: /정산|수수료\s?(관리|정책|계산)/,
  },
  point_coupon: {
    label: "포인트/쿠폰",
    group: "commerce",
    aliases: ["point_coupon", "coupon", "point", "mileage", "reward_points"],
    codePattern: /coupon|(^|_)points?(_|$)|mileage|reward/,
    text: /쿠폰|적립금|마일리지|포인트\s?(적립|지급|사용|결제|충전|관리|제도)/,
  },
  // --- 예약/일정 ---
  reservation: {
    label: "예약",
    group: "booking",
    aliases: ["reservation", "booking", "reservation_management"],
    codePattern: /reservation|booking/,
    text: /예약\s?(시스템|기능|관리|하기|접수|현황|내역|서비스|플랫폼|페이지|가능|확인|변경|취소|일정|신청)|(온라인|실시간|모바일|시간\s?단위|중복)\s?예약/,
  },
  scheduling_calendar: {
    label: "일정/캘린더",
    group: "booking",
    aliases: ["scheduling_calendar", "calendar", "schedule", "scheduling", "schedule_management"],
    codePattern: /calendar|schedul/,
    text: /일정\s?관리|캘린더|스케줄\s?관리/,
  },
  // --- 플랫폼 ---
  buyer_seller_roles: {
    label: "판매자/공급자 등 복수 회원 유형",
    group: "platform",
    aliases: ["buyer_seller_roles", "multi_vendor", "seller_management", "partner_portal", "vendor_management", "expert_profile"],
    codePattern: /vendor|seller|partner_(portal|management|page)|provider_(management|profile)|expert_profile/,
    text: /판매자\s?(회원|페이지|센터|관리)|입점|셀러|공급자\s?(회원|페이지)|파트너\s?(회원|페이지|센터)|전문가\s?회원/,
  },
  matching: {
    label: "매칭/중개",
    group: "platform",
    aliases: ["matching", "brokerage", "match_making"],
    codePattern: /matching|broker/,
    text: /매칭|중개/,
  },
  // --- 커뮤니케이션 ---
  notification: {
    label: "알림 (푸시/문자/알림톡/메일)",
    group: "communication",
    aliases: [
      "notification_push",
      "notification_sms_kakao",
      "notification_email",
      "push_service",
      "sms_gateway",
      "email_service",
      "kakao_alimtalk",
      "notification",
      "push_notification",
    ],
    codePattern: /notification|alimtalk|push|sms|email/,
    text: /푸시\s?알림|알림톡|문자\s?(발송|알림|전송)|SMS|이메일\s?(발송|알림|전송)|메일\s?발송|알림\s?(기능|발송|전송)/i,
  },
  chat_messaging: {
    label: "채팅/메시지",
    group: "communication",
    aliases: ["chat_messaging", "chat", "messaging", "realtime_chat", "direct_message"],
    codePattern: /chat|messag/,
    text: /채팅|실시간\s?메시지|쪽지|메신저\s?기능/,
  },
  inquiry_support: {
    label: "문의/고객지원",
    group: "communication",
    aliases: ["inquiry_form", "customer_support", "qna", "faq", "contact_form", "inquiry"],
    codePattern: /inquiry|qna|faq|contact|customer_support/,
    text: /문의\s?(접수|하기|게시판|폼|관리|내역)|1\s?:\s?1\s?문의|Q&A|FAQ|고객\s?센터/i,
  },
  // --- 데이터 ---
  file_upload: {
    label: "파일 업로드/첨부",
    group: "data",
    aliases: ["file_upload", "file_management", "attachment", "document_upload", "image_upload"],
    codePattern: /file|upload|attachment/,
    text: /파일\s?(업로드|첨부|관리)|첨부\s?파일|이미지\s?업로드|업로드\s?기능/,
  },
  media_handling: {
    label: "이미지/영상 처리·재생",
    group: "data",
    aliases: ["media_processing", "video_streaming", "image_processing", "video_player", "live_streaming"],
    codePattern: /media|video|image_processing|streaming/,
    text: /동영상|영상\s?(업로드|재생|스트리밍|편집|처리)|라이브\s?방송|이미지\s?(리사이즈|처리|편집|변환)/,
  },
  excel_import_export: {
    label: "엑셀/CSV 입출력",
    group: "data",
    aliases: ["data_export", "excel_import_export", "excel", "csv_export", "excel_upload", "data_import"],
    codePattern: /excel|csv|export|data_import/,
    text: /엑셀|excel|CSV|xlsx/i,
  },
  statistics_dashboard: {
    label: "통계/대시보드",
    group: "data",
    aliases: ["statistics_reporting", "statistics", "dashboard", "analytics", "analytics_dashboard", "sales_report"],
    codePattern: /statistic|dashboard|analytics|kpi/,
    text: /통계|대시보드|매출\s?(현황|분석|리포트)|현황\s?(조회|분석)/,
  },
  report_generation: {
    label: "문서/보고서 생성·출력",
    group: "data",
    aliases: ["document_generation", "report_generation", "pdf_generation", "printing", "invoice_generation"],
    codePattern: /document_generation|report_generation|pdf|print/,
    text: /(보고서|견적서|계약서|증명서|명세서|PDF|리포트)\s?(자동\s?)?(생성|출력|발행|작성)/i,
  },
  // --- 업무 ---
  workflow: {
    label: "업무 흐름/상태 관리",
    group: "business",
    aliases: ["workflow", "approval_workflow", "process_management", "status_tracking", "task_management", "work_order"],
    codePattern: /workflow|process_management|status_track|task_management|work_order/,
    text: /워크\s?플로|업무\s?(흐름|프로세스|관리)|진행\s?(상태|현황)\s?(관리|확인|조회)|작업\s?지시/,
  },
  approval: {
    label: "결재/승인",
    group: "business",
    aliases: ["approval_workflow", "approval", "e_approval"],
    codePattern: /approval/,
    text: /전자\s?결재|결재|승인\s?(요청|처리|절차|관리|프로세스)/,
  },
  e_signature: {
    label: "전자서명/전자계약",
    group: "business",
    aliases: ["e_signature", "electronic_contract", "e_contract"],
    codePattern: /signature|e_contract|electronic_contract/,
    text: /전자\s?서명|전자\s?계약/,
  },
  inventory_management: {
    label: "재고/입출고",
    group: "business",
    aliases: ["inventory_management", "inventory", "stock_management", "warehouse_management"],
    codePattern: /inventory|stock|warehouse/,
    text: /재고|입출고|입고|출고/,
  },
  crm_customer: {
    label: "고객관리(CRM)",
    group: "business",
    aliases: ["crm", "customer_management", "lead_management"],
    codePattern: /(^|_)crm(_|$)|customer_management|lead_management/,
    text: /CRM|고객\s?관리|거래처\s?관리/i,
  },
  hr_attendance: {
    label: "인사/근태/급여",
    group: "business",
    aliases: ["hr_attendance", "attendance", "payroll", "hr_management"],
    codePattern: /attendance|payroll|(^|_)hr(_|$)/,
    text: /근태|출퇴근|급여\s?(관리|계산|명세)|인사\s?관리/,
  },
  accounting: {
    label: "회계/세금계산서",
    group: "business",
    aliases: ["accounting", "tax_invoice", "accounting_software", "invoice"],
    codePattern: /accounting|tax_invoice|invoic|ledger/,
    text: /회계|세금\s?계산서|전표|매입\s?매출/,
  },
  // --- 연동 ---
  map_location: {
    label: "지도/위치",
    group: "integration",
    aliases: ["map_location", "kakao_map", "naver_map", "google_maps", "gps", "geolocation"],
    codePattern: /(^|_)maps?(_|$)|gps|geoloc|location/,
    text: /지도|위치\s?(기반|정보|추적|확인)|GPS/i,
  },
  external_api_integration: {
    label: "외부 API/시스템 연동",
    group: "integration",
    aliases: [
      "public_api",
      "external_api",
      "erp_external",
      "marketplace_api",
      "public_data_api",
      "shopping_platform",
      "logistics_api",
      "sns_api",
      "youtube_api",
      "api_integration",
      "google_workspace",
      "slack",
      "notion",
    ],
    codePattern: /(^|_)api(s)?(_|$)|erp_|_integration$|shopping_platform/,
    text: /API\s?연동|외부\s?(시스템|API|서비스)\s?연동|ERP\s?연동|오픈\s?API/i,
  },
  multilingual: {
    label: "다국어",
    group: "integration",
    aliases: ["multilingual", "i18n", "localization", "translation"],
    codePattern: /multilingual|i18n|locali|translat/,
    text: /다국어|영문\s?(버전|페이지)|번역\s?기능/,
  },
  iot_device_integration: {
    label: "장비/IoT 연동",
    group: "integration",
    aliases: ["iot_device_control", "hardware_integration", "hardware_device", "bluetooth", "printer_integration"],
    codePattern: /iot|hardware|device|bluetooth|ble|printer|sensor|kiosk/,
    text: /장비\s?연동|IoT|센서|블루투스|BLE|키오스크|프린터\s?연동|PLC/i,
  },
  // --- 데이터 수집/자동화 ---
  web_crawling: {
    label: "크롤링/데이터 수집",
    group: "data",
    aliases: ["crawling_scraping", "crawler", "scraping", "web_crawling", "data_collection"],
    codePattern: /crawl|scrap|data_collection/,
    text: /크롤링|크롤러|스크래핑|데이터\s?수집/,
  },
  task_automation: {
    label: "업무 자동화/배치",
    group: "data",
    aliases: ["rpa_automation", "workflow_automation", "batch_job", "scheduler", "automation", "data_pipeline", "auto_posting"],
    codePattern: /automation|batch|scheduler|pipeline|macro|rpa/,
    text: /업무\s?자동화|RPA|매크로|자동\s?(발송|생성|수집|등록|입력|처리)|배치\s?작업/i,
  },
  legacy_migration: {
    label: "데이터 이관/마이그레이션",
    group: "data",
    aliases: ["legacy_migration", "data_migration", "migration"],
    codePattern: /migration/,
    text: /데이터\s?이관|마이그레이션/,
  },
  // --- AI ---
  ai_llm: {
    label: "LLM/생성형 AI",
    group: "ai",
    aliases: ["llm_generation", "llm_chatbot", "openai", "anthropic", "google_ai", "ai_chatbot", "chatbot", "llm"],
    codePattern: /llm|gpt|openai|anthropic|chatbot|generative/,
    text: /GPT|LLM|챗봇|생성형\s?AI|OpenAI|AI\s?(상담|답변|요약|작성)/i,
  },
  rag_search: {
    label: "RAG/벡터 검색",
    group: "ai",
    aliases: ["rag_search", "vector_search", "embedding", "rag"],
    codePattern: /rag|vector|embedding/,
    text: /RAG|벡터\s?(검색|DB)|임베딩/i,
  },
  ai_recognition: {
    label: "AI 인식 (영상/OCR/음성)",
    group: "ai",
    aliases: ["computer_vision", "speech_processing", "cloud_ai_vision_ocr", "ocr", "object_detection", "stt"],
    codePattern: /vision|ocr|speech|stt|object_detect|face_recogn/,
    text: /OCR|객체\s?(인식|탐지)|이미지\s?인식|음성\s?인식|STT|YOLO|얼굴\s?인식/i,
  },
  recommendation: {
    label: "추천",
    group: "ai",
    aliases: ["recommendation", "recommender"],
    codePattern: /recommend/,
    text: /추천\s?(알고리즘|시스템|기능|엔진)|맞춤\s?추천/,
  },
  // --- 기타 ---
  landing_seo: {
    label: "랜딩/SEO",
    group: "content",
    aliases: ["landing_page", "seo"],
    codePattern: /landing|(^|_)seo(_|$)/,
    text: /랜딩\s?페이지|SEO|검색\s?엔진\s?최적화/i,
  },
  app_store_release: {
    label: "앱 스토어 배포",
    group: "platform",
    aliases: ["app_store_release", "app_release"],
    codePattern: /app_store|play_store|app_release/,
    text: /앱\s?스토어|플레이\s?스토어|구글\s?플레이|스토어\s?(등록|배포|출시|심사)/,
  },
  realtime_sync: {
    label: "실시간 동기화/모니터링",
    group: "platform",
    aliases: ["realtime_sync", "realtime", "realtime_monitoring", "websocket"],
    codePattern: /realtime|real_time|websocket/,
    text: /실시간\s?(동기화|모니터링|업데이트|현황|위치|반영)|웹소켓|WebSocket/i,
  },
} as const satisfies Record<string, FeatureDef>;

export type FeatureCode = keyof typeof FEATURES;
export const FEATURE_CODES = Object.keys(FEATURES) as FeatureCode[];

/**
 * 분석값 코드 중 기능이 아닌 것(비기능/유지보수/인프라). 매핑하지 않고 "미매핑"에도 세지 않는다.
 */
export const NON_FEATURE_CODES = new Set([
  "bug_fix_maintenance",
  "infra_devops",
  "security_hardening",
  "responsive_ui",
  "responsive_web",
  "aws",
  "gcp",
  "firebase",
  "supabase",
  "blockchain",
  "game_logic",
]);

/** 기능과 무관한 줄: 계약/대금/지원 조건/우대·자격 요건/근무 조건 */
const IRRELEVANT_LINE = /계약\s?(방식|형태|조건|기간)|에스크로|대금|선금|잔금|중도금|지원\s?(형태|방법|시|자격)|우대|자격\s?요건|경험|포트폴리오|근무\s?(형태|장소|시간)|미팅|면접|예산|부가세|VAT|프로젝트\s?기간/i;
/** 부정/범위 제외 표현이 있는 줄 ("로그인은 필요하지 않습니다", "장바구니 없음") */
const NEGATED_LINE = /필요\s?(하지|치)\s?않|불필요|제외|없음|없이|않습니다|포함되지\s?않|범위\s?(외|밖)|하지\s?않/;
/** 섹션 머리말 */
const HEADER_LINE = /^(※|\[|■|◆|●|#|\+\s|【)|^.{1,24}[:：]$/;
/** 이 머리말 아래 줄들은 기능 요구가 아님 (지원 자격·우대·제안 방법·필수 기술 목록·근무/계약 조건) */
const EXCLUDED_SECTION = /우대|자격\s?요건|지원\s?(방법|시|자격|안내|절차)|제안\s?(포함|시|사항|요청)|필수\s?(기술|역량)|근무|계약|예산|모집\s?인원|진행\s?방식/;

export function featureTextLines(text: string): string[] {
  const out: string[] = [];
  let skipping = false;
  for (const raw of text.replace(/\r\n/g, "\n").split("\n")) {
    const line = raw.trim();
    if (!line) continue;
    if (HEADER_LINE.test(line)) {
      // 머리말 줄 자체는 기능 근거로 쓰지 않고, 섹션 규칙만 갱신한다
      skipping = EXCLUDED_SECTION.test(line);
      continue;
    }
    if (skipping || IRRELEVANT_LINE.test(line) || NEGATED_LINE.test(line)) continue;
    out.push(line);
  }
  return out;
}

export interface FeatureSource {
  required_features?: string[] | null;
  required_integrations?: string[] | null;
  title?: string | null;
  description?: string | null;
}

export interface FeatureEvidence {
  /** 매핑된 분석값 코드 */
  analysis: string[];
  /** 설명/제목에서 일치한 문구 (최대 2개) */
  text: string[];
}

export interface FeatureSet {
  features: FeatureCode[];
  evidence: Partial<Record<FeatureCode, FeatureEvidence>>;
  /** 표준 기능으로 매핑되지 않은 분석값 코드 (vocabulary 보강 후보) */
  unmapped: string[];
}

/** 분석값 코드 1개 → 표준 기능들 (별칭 우선, 없으면 코드 패턴) */
export function mapAnalysisCode(code: string): FeatureCode[] {
  const exact = FEATURE_CODES.filter((f) => (FEATURES[f].aliases as readonly string[]).includes(code));
  if (exact.length) return exact;
  if (NON_FEATURE_CODES.has(code)) return [];
  return FEATURE_CODES.filter((f) => {
    const p = (FEATURES[f] as FeatureDef).codePattern;
    return p ? p.test(code) : false;
  });
}

export function extractFeatures(src: FeatureSource): FeatureSet {
  const evidence: Partial<Record<FeatureCode, FeatureEvidence>> = {};
  const add = (f: FeatureCode, kind: keyof FeatureEvidence, value: string) => {
    const e = (evidence[f] ??= { analysis: [], text: [] });
    if (!e[kind].includes(value) && e[kind].length < (kind === "text" ? 2 : 10)) e[kind].push(value);
  };

  const unmapped: string[] = [];
  for (const code of [...(src.required_features ?? []), ...(src.required_integrations ?? [])]) {
    const mapped = mapAnalysisCode(code);
    if (!mapped.length && !NON_FEATURE_CODES.has(code)) unmapped.push(code);
    for (const f of mapped) add(f, "analysis", code);
  }

  const lines = featureTextLines([src.title ?? "", src.description ?? ""].join("\n"));
  for (const f of FEATURE_CODES) {
    const re = (FEATURES[f] as FeatureDef).text;
    if (!re) continue;
    for (const line of lines) {
      const m = line.match(re);
      if (m) {
        add(f, "text", m[0]);
        break;
      }
    }
  }

  const features = FEATURE_CODES.filter((f) => evidence[f]);
  return { features, evidence, unmapped: [...new Set(unmapped)] };
}
