/**
 * Analyzer V1 분류 체계.
 *
 * - 6개 분류(project_type, engagement_type, complexity_types, reuse_level, technology_assets, industry)는
 *   고정 enum 이며 schema validation 으로 강제한다. DB 컬럼은 text/jsonb 라서
 *   데이터를 본 뒤 코드를 늘리고 analysis_version 을 올려 재분석하면 된다.
 * - 기능/연동/기술 목록은 "권장 어휘"다. AI 는 가능한 한 이 코드를 재사용하고,
 *   맞는 것이 없을 때만 새 snake_case 코드를 만든다. 새 코드는 report 의 "어휘 밖" 집계로 드러나
 *   다음 버전에서 어휘에 편입할지 결정한다.
 */

/** 무엇을 만드는 일인지 (primary 1개) */
export const PROJECT_TYPES = {
  website: "기업/브랜드 홈페이지, 랜딩",
  ecommerce: "쇼핑몰/커머스",
  reservation: "예약/예약관리",
  admin_backoffice: "관리자 시스템/백오피스",
  business_management: "사내 업무관리/ERP/그룹웨어/MES",
  saas: "SaaS 제품 (다수 고객사 대상 구독형 서비스)",
  platform_marketplace: "중개/매칭/마켓플레이스/커뮤니티 플랫폼",
  mobile_app: "iOS/Android 앱이 결과물의 중심",
  ai_service: "LLM/RAG/영상·음성 AI 기능이 중심",
  crawler_data_collection: "크롤러/데이터 수집기",
  automation_rpa: "브라우저 자동화/RPA/업무 자동화 프로그램",
  data_dashboard: "BI/통계/대시보드/데이터 분석",
  maintenance: "기존 시스템 유지보수가 본질",
  other: "위 어디에도 맞지 않음",
} as const;
export type ProjectType = keyof typeof PROJECT_TYPES;
export const PROJECT_TYPE_CODES = Object.keys(PROJECT_TYPES) as [ProjectType, ...ProjectType[]];

/** 일의 형태 */
export const ENGAGEMENT_TYPES = {
  new_build: "신규 구축 (산출물 기준 도급)",
  feature_extension: "기존 시스템에 기능 추가/고도화",
  renewal: "리뉴얼/재구축 (기존 서비스를 새로 다시 만듦)",
  maintenance: "운영/유지보수 계약",
  bug_fix: "오류 수정 위주",
  migration: "이전/전환 (플랫폼·언어·인프라 마이그레이션)",
  consulting: "기획/설계/컨설팅/PM·PL 역할",
  staffing: "상주/기간제/월 단가 인력 투입형",
  design_publishing: "디자인/퍼블리싱 위주",
  other: "위 어디에도 맞지 않음",
} as const;
export type EngagementType = keyof typeof ENGAGEMENT_TYPES;
export const ENGAGEMENT_TYPE_CODES = Object.keys(ENGAGEMENT_TYPES) as [EngagementType, ...EngagementType[]];

/** AI coding agent 기반 1인 개발 관점의 난이도 특성 (복수) */
export const COMPLEXITY_TYPES = {
  standard_crud: "로그인·관리자·CRUD·일반 DB/API 중심",
  integration_heavy: "외부 API 여러 개, 결제, 소셜 로그인, ERP 등 연동 비중이 큼",
  workflow_complex: "복잡한 상태 전이·승인·업무 프로세스",
  realtime: "실시간 채팅/스트리밍/동기화/동시성",
  legacy_heavy: "남이 만든 기존 대규모 소스 분석·수정",
  high_risk_domain: "금융/의료/보안 등 오류 비용이 큰 영역",
  hardware_iot: "장비/센서/펌웨어/프린터 등 실기기 의존",
  algorithmic_specialized: "특수 알고리즘/영상/음성/수학/역분석",
  multi_platform: "web + app 등 여러 클라이언트를 동시에 구축",
  other: "위 어디에도 맞지 않음",
} as const;
export type ComplexityType = keyof typeof COMPLEXITY_TYPES;
export const COMPLEXITY_TYPE_CODES = Object.keys(COMPLEXITY_TYPES) as [ComplexityType, ...ComplexityType[]];

/** 결과물 재사용 수준 (이후 프로젝트 간 feature overlap 통계로 보정 예정) */
export const REUSE_LEVELS = {
  high: "구조/코드를 다른 프로젝트에서 상당 부분 재사용 (관리자·인증·권한·결제·예약·CRUD·통계·일반 SaaS)",
  medium: "일부 구조·컴포넌트는 재사용, 커스텀 비중이 큼",
  low: "재사용할 부분이 적음",
  one_off: "특정 회사/장비/레거시에 종속된 사실상 일회성",
} as const;
export type ReuseLevel = keyof typeof REUSE_LEVELS;
export const REUSE_LEVEL_CODES = Object.keys(REUSE_LEVELS) as [ReuseLevel, ...ReuseLevel[]];

/** 수행 시 축적되는 기술자산 (복수) */
export const TECHNOLOGY_ASSETS = [
  "core_web",
  "backend_api",
  "database",
  "authentication_authorization",
  "admin_system",
  "saas_architecture",
  "payments",
  "ai_llm",
  "rag_embeddings",
  "ai_agents",
  "browser_automation",
  "web_crawling",
  "workflow_automation",
  "data_pipeline",
  "analytics_dashboard",
  "external_api_integration",
  "mobile",
  "cloud_infra",
  "docker",
  "ci_cd",
  "realtime",
  "legacy_enterprise",
  "hardware_iot",
  "security",
  "other",
] as const;
export type TechnologyAsset = (typeof TECHNOLOGY_ASSETS)[number];

/** 산업군 (기술 난이도와 별개로 판단) */
export const INDUSTRIES = {
  general: "특정 산업 무관/불명",
  commerce: "유통/커머스/소매",
  education: "교육",
  healthcare: "의료/헬스케어",
  finance: "금융/핀테크/결제/가상자산",
  real_estate: "부동산/인테리어/주거",
  travel_hospitality: "여행/숙박/관광",
  logistics: "물류/배송",
  manufacturing: "제조/생산",
  professional_services: "법률/세무/회계/컨설팅 등 전문 서비스",
  public_sector: "공공/정부/기관",
  media_content: "미디어/언론/콘텐츠/엔터",
  sports: "스포츠/레저",
  food: "식음료/외식",
  construction: "건설/시공/설비",
  mobility: "모빌리티/자동차/교통",
  hr: "채용/인사",
  other: "위 어디에도 맞지 않음",
} as const;
export type Industry = keyof typeof INDUSTRIES;
export const INDUSTRY_CODES = Object.keys(INDUSTRIES) as [Industry, ...Industry[]];

/** 분류가 애매했을 때 AI 가 표시하는 필드 */
export const CLASSIFICATION_FIELDS = [
  "project_type",
  "engagement_type",
  "industry",
  "complexity_types",
  "reuse_level",
  "technology_assets",
] as const;

export const PLATFORMS = {
  web: "반응형 웹/웹앱",
  admin_web: "관리자 웹",
  mobile_web: "모바일 웹/PWA",
  ios: "iOS 네이티브",
  android: "Android 네이티브",
  cross_platform_app: "크로스플랫폼 앱 (Flutter/React Native)",
  desktop: "데스크톱 앱",
  backend_api: "서버/API 단독",
  browser_extension: "브라우저 확장",
  chatbot: "메신저/챗봇",
  embedded: "임베디드/펌웨어",
  other: "기타",
} as const;
export type PlatformCode = keyof typeof PLATFORMS;
export const PLATFORM_CODES = Object.keys(PLATFORMS) as [PlatformCode, ...PlatformCode[]];

export const FEATURE_VOCAB = [
  "authentication",
  "social_login",
  "identity_verification",
  "user_management",
  "role_permission",
  "admin_dashboard",
  "cms",
  "board_community",
  "comments_reviews",
  "search_filter",
  "product_catalog",
  "cart_checkout",
  "order_management",
  "payment",
  "subscription_billing",
  "settlement",
  "point_coupon",
  "reservation",
  "scheduling_calendar",
  "notification_push",
  "notification_sms_kakao",
  "notification_email",
  "chat_messaging",
  "realtime_sync",
  "map_location",
  "file_upload",
  "media_processing",
  "video_streaming",
  "statistics_reporting",
  "data_export",
  "crawling_scraping",
  "data_pipeline",
  "llm_generation",
  "llm_chatbot",
  "rag_search",
  "computer_vision",
  "speech_processing",
  "recommendation",
  "multilingual",
  "landing_page",
  "seo",
  "inventory_management",
  "crm",
  "hr_attendance",
  "accounting",
  "approval_workflow",
  "document_generation",
  "e_signature",
  "matching",
  "iot_device_control",
  "hardware_integration",
  "blockchain",
  "game_logic",
  "app_store_release",
  "public_api",
  "legacy_migration",
  "bug_fix_maintenance",
  "infra_devops",
  "security_hardening",
] as const;

export const INTEGRATION_VOCAB = [
  "kakao_login",
  "kakao_alimtalk",
  "kakao_map",
  "naver_login",
  "naver_map",
  "google_login",
  "apple_login",
  "google_maps",
  "payment_gateway",
  "easy_pay",
  "identity_verification_service",
  "sms_gateway",
  "email_service",
  "push_service",
  "openai",
  "anthropic",
  "google_ai",
  "cloud_ai_vision_ocr",
  "aws",
  "gcp",
  "firebase",
  "supabase",
  "shopping_platform",
  "marketplace_api",
  "sns_api",
  "youtube_api",
  "public_data_api",
  "tax_invoice",
  "erp_external",
  "accounting_software",
  "google_workspace",
  "slack",
  "notion",
  "logistics_api",
  "hardware_device",
] as const;

export const SKILL_VOCAB = [
  "frontend",
  "backend",
  "database",
  "authentication",
  "payment",
  "ui_design",
  "mobile_native",
  "cross_platform_mobile",
  "desktop_app",
  "devops_infra",
  "data_engineering",
  "crawling",
  "llm_integration",
  "ai_ml",
  "computer_vision",
  "realtime",
  "security",
  "embedded",
  "game_dev",
  "blockchain",
  "legacy_tech",
  "qa_testing",
  "project_management",
] as const;

/** snake_case 코드 형식 (어휘 밖 코드도 이 형식은 지켜야 한다) */
export const CODE_PATTERN = /^[a-z][a-z0-9_]{1,40}$/;
