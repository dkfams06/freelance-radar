// holdout 20건 수동 v3.3 기준 파일 생성기 (1회용 기록). node scripts/make-holdout-manual.cjs
// 입력: apps/analyzer/.out/holdout-skeleton.json (scripts/holdout-skeleton.ts 로 생성)
const fs = require("fs");
const skel = JSON.parse(fs.readFileSync("apps/analyzer/.out/holdout-skeleton.json", "utf8"));
const P = new Map(skel.items.map((i) => [`${i.project.platform}:${i.project.external_project_id}`, i.project]));

// [key, project_type, engagement_type, industry, complexity[], reuse_level, assets[], uncertain[], subcategory, summary,
//  platforms[], difficulty, [hmin,hmax], learning, reusability, market, risk, clarity, reuse 근거]
const R = [
  ["freemoa:48251", "reservation", "new_build", "real_estate", ["multi_platform", "workflow_complex", "integration_heavy"], "medium", ["core_web", "backend_api", "database", "authentication_authorization", "admin_system", "payments", "mobile", "external_api_integration"], [], "회원권 분양·예약", "별장/콘도 회원권 분양, 실시간 예약, 2차 지분 거래, 결제·정산을 제공하는 Web/App/Admin 플랫폼", ["web", "admin_web", "cross_platform_app"], 55, [700, 1300], 55, 55, 60, 55, 50, "예약 엔진·결제/정산·관리자 구조는 재사용 가능하나 회원권/지분 도메인이 특수"],
  ["freemoa:48011", "iot_device", "new_build", "general", ["hardware_iot"], "low", ["hardware_iot"], [], "RPi 센서 프로토타입", "Raspberry Pi에 센서 2~3종을 연동해 데이터를 수집·통합하고 기초 분석 로직을 구현하는 프로토타입", ["embedded"], 55, [40, 120], 45, 25, 25, 55, 45, "센서 연동 경험은 남지만 클라이언트 지정 하드웨어에 맞춘 코드라 재사용 제한적"],
  ["freemoa:47955", "qa_testing", "staffing", "general", ["hardware_iot"], "one_off", ["mobile"], [], "단말 앱 QA", "자체 제작 AOSP 단말의 기본 탑재 앱(런처·VoIP 등)에 대해 TC 작성과 테스트를 1개월 상주로 수행", ["android"], 20, [150, 180], 20, 8, 40, 15, 70, "자체 제작 단말과 자사 앱 전용 TC라 다른 외주에 재사용 거의 불가"],
  ["freemoa:48311", "business_management", "staffing", "manufacturing", ["legacy_heavy"], "one_off", ["legacy_enterprise", "backend_api", "database"], [], "PLM/BOM 고도화", "대기업 계열 PLM/BOM 시스템의 분석·설계와 Java/Vue3/Tibero 기반 고도화 개발 인력 상주 투입", ["web"], 60, [600, 800], 30, 10, 20, 50, 30, "특정 고객사 내부 PLM/BOM 시스템과 Tibero 환경에 강하게 종속"],
  ["freemoa:47704", "data_dashboard", "new_build", "media_content", ["standard_crud"], "high", ["core_web", "backend_api", "database", "authentication_authorization", "admin_system", "analytics_dashboard", "cloud_infra"], [], "크리에이터 분석 플랫폼", "내부 API 데이터를 시각화하는 사용자 웹, 관리자 백오피스(회원·콘텐츠·구독·통계), 백엔드를 구축", ["web", "admin_web"], 35, [250, 450], 50, 70, 70, 30, 80, "인증·관리자·구독 관리·대시보드 구조는 다른 SaaS형 외주에 거의 그대로 재사용 가능"],
  ["freemoa:47969", "crawler_data_collection", "new_build", "finance", ["integration_heavy"], "low", ["external_api_integration"], ["project_type"], "HTS API 환경 설정", "OpenClaw 설치와 증권 HTS OpenAPI 기본 연동 설정, 데이터 수신 동작 확인", ["desktop"], 18, [6, 20], 20, 15, 25, 25, 55, "특정 프로그램·특정 증권사 API 환경 설정이라 코드 재사용 제한적"],
  ["freemoa:48169", "saas", "migration", "education", ["legacy_heavy", "integration_heavy"], "medium", ["core_web", "backend_api", "database", "authentication_authorization", "admin_system", "saas_architecture", "ai_llm", "speech_audio_ai", "external_api_integration", "cloud_infra"], [], "교육 플랫폼 재구축", "PHP/그누보드 기반 영어교육 플랫폼을 Next.js/NestJS/PostgreSQL 멀티테넌트 구조로 재구축하고 데이터를 이전", ["web", "admin_web"], 65, [1500, 2800], 65, 50, 55, 60, 60, "멀티테넌트 SaaS 구조·RBAC·AI(STT/TTS/GPT) 연동 레이어는 재사용 가능하나 기존 시스템 이전 부분은 전용"],
  ["wishket:158096", "ecommerce", "new_build", "commerce", ["standard_crud"], "medium", ["core_web", "backend_api", "database", "cloud_infra"], [], "B2B 쇼핑몰", "WordPress+WooCommerce 기반 글로벌 B2B 쇼핑몰: 구조화 Product DB, 필터 검색, 견적/주문, 관리자 운영", ["web"], 30, [150, 330], 30, 50, 60, 30, 65, "Product DB 구조·티어 가격/MOQ·패싯 필터는 다른 B2B 쇼핑몰에 재사용 가능한 구체적 구조"],
  ["wishket:155100", "website", "new_build", "general", ["standard_crud"], "low", ["core_web"], [], "B2B 홈페이지", "WordPress+WPML 기반 다국어(영어/한국어/아랍어 RTL) 글로벌 B2B 홈페이지 구축", ["web"], 12, [60, 130], 25, 28, 55, 15, 80, "특정 기업 브랜드용 커스텀 테마와 콘텐츠라 코드 재사용은 제한적"],
  ["wishket:156240", "platform_marketplace", "new_build", "general", ["standard_crud", "workflow_complex"], "high", ["core_web", "backend_api", "database", "authentication_authorization", "admin_system", "analytics_dashboard", "external_api_integration"], [], "커뮤니티+광고 시스템", "Supabase 기반 커뮤니티 게시판(웹뷰)과 광고 캠페인·트래킹, 관리자/광고주 대시보드, 4단계 권한 관리", ["web", "admin_web", "mobile_web"], 38, [200, 380], 50, 75, 70, 35, 80, "권한 관리·게시판/댓글/신고·관리자 템플릿·광고 트래킹은 범용 모듈이라 거의 그대로 재사용 가능"],
  ["wishket:158628", "fintech_payment", "staffing", "finance", ["high_risk_domain"], "low", ["core_web", "backend_api", "database", "payments", "legacy_enterprise"], [], "PG 백오피스", "대기업 차세대 PG 시스템 재구축의 백오피스를 React/Spring Boot로 분석·설계·개발하는 상주 인력 투입", ["web", "admin_web"], 60, [1200, 1500], 40, 20, 35, 55, 25, "특정 대기업 PG 업무 흐름의 백오피스라 코드 재사용은 제한적이나 일부 일반성은 있음"],
  ["wishket:154821", "automation_rpa", "staffing", "manufacturing", ["legacy_heavy"], "low", ["workflow_automation", "legacy_enterprise"], [], "대기업 RPA 운영", "대기업 RPA 프로세스 개발·운영 지원, 기존 RPA 시스템 개선(UiPath/Power Automate 등)", ["desktop"], 42, [650, 800], 30, 18, 35, 30, 30, "특정 기업 업무 흐름과 기존 RPA 수정이라 코드 재사용 제한적"],
  ["wishket:153028", "saas", "new_build", "other", ["standard_crud", "multi_platform"], "medium", ["core_web", "backend_api", "database", "authentication_authorization", "admin_system", "saas_architecture", "mobile", "analytics_dashboard", "cloud_infra"], [], "뷰티샵 전자차트", "뷰티샵용 클라우드 전자차트 SaaS MVP: 고객/시술 기록, 사진, 예약, 동의서 서명, 통계 (웹+태블릿 앱)", ["web", "admin_web", "cross_platform_app"], 45, [450, 900], 55, 55, 65, 45, 60, "권한·고객관리·예약·통계 등 SaaS 공통 구조는 재사용 가능하나 시술 차트 도메인은 전용"],
  ["wishket:150086", "automation_rpa", "new_build", "commerce", ["standard_crud"], "low", ["external_api_integration"], [], "쿠팡 재고 VBA", "쿠팡 로켓그로스 API로 재고를 조회해 일별 판매량을 계산·누적하는 Excel VBA 자동화 툴", ["desktop"], 20, [12, 30], 20, 22, 45, 15, 80, "쿠팡 API 전용 Excel VBA라 코드 재사용은 제한적"],
  ["wishket:157477", "iot_device", "new_build", "other", ["hardware_iot", "integration_heavy", "realtime"], "low", ["backend_api", "database", "realtime", "hardware_iot", "external_api_integration"], [], "피크제어 Auto-DR", "기존 EMS와 연동해 Modbus로 장비를 제어하는 피크제어/Auto-DR(OpenADR) Python 서버 백엔드", ["backend_api"], 68, [350, 650], 55, 28, 25, 62, 60, "OpenADR/Modbus 연동은 일부 일반성이 있으나 기존 EMS 스키마·장비 매핑에 묶여 재사용 제한적"],
  ["wishket:149922", "reservation", "feature_extension", "travel_hospitality", ["integration_heavy", "high_risk_domain"], "low", ["core_web", "backend_api", "payments", "external_api_integration", "admin_system"], [], "숙박 정산·캘린더", "Sharetribe Pro 기반 숙박 예약 플랫폼에 신규 PG 연동 자동 정산, iCal 동기화, 고객 문의 기능 추가", ["web", "admin_web"], 50, [80, 180], 55, 30, 50, 55, 62, "Sharetribe 플러그인/커스터마이징 대응이라 해당 플랫폼 밖에서 재사용 제한적"],
  ["wishket:152942", "mobile_app", "staffing", "education", ["legacy_heavy"], "low", ["backend_api", "database", "cloud_infra"], [], "AI튜터 앱 백엔드", "출시된 AI튜터 앱의 Nest.js/AWS 백엔드 유지관리와 신규 기능 개발 (주 20시간 재택)", ["backend_api"], 40, [900, 1100], 35, 18, 40, 30, 35, "특정 회사 앱의 기존 백엔드 수정이라 코드 재사용 제한적"],
  ["wishket:157967", "iot_device", "staffing", "general", ["legacy_heavy"], "low", ["legacy_enterprise"], ["project_type"], "키오스크 배리어프리", "기존 C#/WPF 키오스크 시스템 소스를 분석해 배리어프리 기능을 추가 개발하는 상주 인력 투입", ["desktop"], 42, [450, 560], 30, 22, 30, 35, 55, "특정 키오스크 레거시 소스 수정이지만 배리어프리 UI 패턴에는 일부 일반성"],
  ["wishket:150884", "business_management", "feature_extension", "hr", ["legacy_heavy", "high_risk_domain"], "low", ["core_web", "backend_api", "database", "legacy_enterprise"], [], "급여대장 기능 개선", "운영 중인 회계/인사 ERP의 급여대장 로직 개선과 연봉 테이블 기능 신설 (Nest.js/React)", ["web"], 45, [80, 180], 40, 25, 40, 50, 70, "특정 ERP 코드베이스의 급여 로직 수정이라 코드 재사용 제한적"],
  ["wishket:153015", "mobile_app", "new_build", "public_sector", ["multi_platform"], "medium", ["mobile", "backend_api", "database", "admin_system", "ai_llm", "external_api_integration"], [], "복지 정보 앱", "복지 정보 제공, 위치 기반 시설 안내, AI 맞춤 로드맵, 예약/상담 신청과 관리자 기능을 갖춘 Android/iOS 앱", ["ios", "android", "admin_web"], 45, [400, 900], 45, 50, 55, 40, 40, "예약/상담 신청·콘텐츠 관리자·위치 안내 구조는 재사용 가능하나 AI 로드맵은 전용"],
];

const items = R.map(([key, pt, eng, ind, cx, reuse, assets, unc, sub, summary, plats, diff, hours, learn, reus, mkt, risk, clar, why]) => {
  const proj = P.get(key);
  if (!proj) throw new Error("missing " + key);
  return {
    project: proj,
    input_meta: {},
    ok: true,
    analysis: {
      project_type: pt, project_subcategory: sub, engagement_type: eng, industry: ind, complexity_types: cx,
      reuse_level: reuse, technology_assets: assets, uncertain_fields: unc, summary,
      required_features: [], required_integrations: [], required_platforms: plats, required_skills: [], suggested_stack: [],
      vibe_coding_difficulty: diff, estimated_hours_min: hours[0], estimated_hours_max: hours[1],
      learning_value: learn, reusability_value: reus, market_value: mkt, technical_risk: risk, requirement_clarity: clar,
      rationale: {
        vibe_coding_difficulty: "수동 기준(분류 중심)",
        estimated_hours: "공고 작업 범위 기준, 예산과 무관",
        learning_value: "수동 기준(분류 중심)",
        reusability_value: why,
        market_value: "수동 기준(분류 중심)",
        technical_risk: "수동 기준(분류 중심)",
      },
    },
    usage: null,
    cost_usd: null,
  };
});

const out = {
  analysis_version: "v3.3",
  model: "claude-code-session (manual, API 미호출)",
  mode: "import",
  created_at: new Date().toISOString(),
  note:
    "v3.3 holdout 20건 수동 기준. 이전 v3~v3.2 샘플과 겹치지 않음. Sonnet 결과를 보기 전에 확정·커밋. " +
    "작성자(Claude)의 판정이며 v3.3 프롬프트도 같은 작성자가 썼으므로 순환(자기일치) 위험이 있음. " +
    "분류 6개 필드가 비교 대상이고 점수/시간은 참고용 추정치. required_features/integrations/skills/suggested_stack 은 비교 대상이 아니라 비워 둠. 실제 API 결과 아님",
  usage_total: { input_tokens: 0, output_tokens: 0 },
  cost_usd_total: 0,
  items,
};
fs.writeFileSync("docs/analyzer-v3.3-holdout-manual-20.json", JSON.stringify(out, null, 2) + "\n");
const dist = (f) => items.reduce((c, i) => ((c[i.analysis[f]] = (c[i.analysis[f]] || 0) + 1), c), {});
console.log("reuse", JSON.stringify(dist("reuse_level")));
console.log("engagement", JSON.stringify(dist("engagement_type")));
console.log("project_type", JSON.stringify(dist("project_type")));
console.log("platform", JSON.stringify(items.reduce((c, i) => ((c[i.project.platform] = (c[i.project.platform] || 0) + 1), c), {})));
console.log("uncertain", JSON.stringify(items.filter((i) => i.analysis.uncertain_fields.length).map((i) => i.project.external_project_id + ":" + i.analysis.uncertain_fields)));
console.log("avg complexity", (items.reduce((s, i) => s + i.analysis.complexity_types.length, 0) / 20).toFixed(2));
