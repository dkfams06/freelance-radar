# Analyzer v3.3 분석 리포트

- 생성: 2026-10-03T03:53:44.230Z
- 모델: `claude-code-session (manual, API 미호출)` (mode: import)
- 비고: v3.3 holdout 20건 수동 기준. 이전 v3~v3.2 샘플과 겹치지 않음. Sonnet 결과를 보기 전에 확정·커밋. 작성자(Claude)의 판정이며 v3.3 프롬프트도 같은 작성자가 썼으므로 순환(자기일치) 위험이 있음. 분류 6개 필드가 비교 대상이고 점수/시간은 참고용 추정치. required_features/integrations/skills/suggested_stack 은 비교 대상이 아니라 비워 둠. 실제 API 결과 아님
- 결과: 성공 20 / 실패 0 / 전체 20
- 토큰: input 0 · output 0 · cache write 0 · cache read 0
- 비용: $0.0000 (건당 $0.0000)

## 프로젝트별 분류

| # | 제목 | 예산 | project_type | engagement | industry | complexity_types | reuse | technology_assets | 난이도 | 예상시간 | 학습 | 재사용 | 시장 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | 별장/콘도 회원권 분양, 예약 관리 플랫폼 구축(Web/App | 50,000,000원 ~ 100,000,000원 | reservation | new_build | real_estate | multi_platform, workflow_complex, integration_heavy | medium | core_web, backend_api, database, authentication_authorization, admin_system, payments, mobile, external_api_integration | 55 | 700~1300h | 55 | 55 | 60 |
| 2 | [신규/임베디드] Raspberry Pi 센서 연동 프로토타입 | 5,000,000원 ~ 7,000,000원 | iot_device | new_build | general | hardware_iot | low | hardware_iot | 55 | 40~120h | 45 | 25 | 25 |
| 3 | (상주) 커스텀 Android 단말 및 기본 탑재 앱 QA엔지 | 4,000,000원 ~ 5,000,000원 | qa_testing | staffing | general | hardware_iot | one_off | mobile | 20 | 150~180h | 20 | 8 | 40 |
| 4 | [상주] PLM/BOM 고도화 개발 (Java/Vue3/Tib | 5,000,000원 ~ 10,000,000원 | business_management | staffing | manufacturing | legacy_heavy | one_off | legacy_enterprise, backend_api, database | 60 | 600~800h | 30 | 10 | 20 |
| 5 | 크리에이터 주요 지표 분석 시각화 제공 플랫폼 웹 개발 | 10,000,000원 ~ 20,000,000원 | data_dashboard | new_build | media_content | standard_crud | high | core_web, backend_api, database, authentication_authorization, admin_system, analytics_dashboard, cloud_infra | 35 | 250~450h | 50 | 70 | 70 |
| 6 | OpenClaw 설치 및 증권 HTS API 연동 설정 작업 | 300,000원 ~ 800,000원 | crawler_data_collection | new_build | finance | integration_heavy | low | external_api_integration | 18 | 6~20h | 20 | 15 | 25 |
| 7 | [도급/상주] 영어교육 플랫폼 차세대 아키텍처 전환 개발 | 100,000,000원 ~ 200,000,000원 | saas | migration | education | legacy_heavy, integration_heavy | medium | core_web, backend_api, database, authentication_authorization, admin_system, saas_architecture, ai_llm, speech_audio_ai, external_api_integration, cloud_infra | 65 | 1500~2800h | 65 | 50 | 55 |
| 8 | 글로벌 B2B 쇼핑몰 신규 구축 (WordPress + Woo | 15,000,000원 | ecommerce | new_build | commerce | standard_crud | medium | core_web, backend_api, database, cloud_infra | 30 | 150~330h | 30 | 50 | 60 |
| 9 | WordPress 기반 글로벌 B2B 홈페이지 신규 구축 | 12,000,000원 | website | new_build | general | standard_crud | low | core_web | 12 | 60~130h | 25 | 28 | 55 |
| 10 | Supabase 기반 사용자 게시판 및 관리자/광고주 대시보드 | 15,000,000원 | platform_marketplace | new_build | general | standard_crud, workflow_complex | high | core_web, backend_api, database, authentication_authorization, admin_system, analytics_dashboard, external_api_integration | 38 | 200~380h | 50 | 75 | 70 |
| 11 | React/Spring Boot 기반 대기업 PG 백오피스 풀 | 6,000,000원/월 | fintech_payment | staffing | finance | high_risk_domain | low | core_web, backend_api, database, payments, legacy_enterprise | 60 | 1200~1500h | 40 | 20 | 35 |
| 12 | RPA 기반 대기업 업무 프로세스 자동화 개발 및 운영 지원 | 5,500,000원/월 | automation_rpa | staffing | manufacturing | legacy_heavy | low | workflow_automation, legacy_enterprise | 42 | 650~800h | 30 | 18 | 35 |
| 13 | 클라우드 기반 전자차트 SaaS 플랫폼 MVP 개발 | 40,000,000원 | saas | new_build | other | standard_crud, multi_platform | medium | core_web, backend_api, database, authentication_authorization, admin_system, saas_architecture, mobile, analytics_dashboard, cloud_infra | 45 | 450~900h | 55 | 55 | 65 |
| 14 | 쿠팡 API 연동 제품 판매량 및 재고 추적 자동화 (Exce | 1,000,000원 | automation_rpa | new_build | commerce | standard_crud | low | external_api_integration | 20 | 12~30h | 20 | 22 | 45 |
| 15 | EMS 연동 피크제어 및 Auto-DR 서버 백엔드 개발 | 5,000,000원 | iot_device | new_build | other | hardware_iot, integration_heavy, realtime | low | backend_api, database, realtime, hardware_iot, external_api_integration | 68 | 350~650h | 55 | 28 | 25 |
| 16 | Sharetribe 기반 숙박 예약 플랫폼 결제/정산 기능 개 | 5,000,000원 | reservation | feature_extension | travel_hospitality | integration_heavy, high_risk_domain | low | core_web, backend_api, payments, external_api_integration, admin_system | 50 | 80~180h | 55 | 30 | 50 |
| 17 | Nest.js/AWS 기반 AI튜터 앱 백엔드 개발 (주 20 | 3,000,000원/월 | mobile_app | staffing | education | legacy_heavy | low | backend_api, database, cloud_infra | 40 | 900~1100h | 35 | 18 | 40 |
| 18 | C#.Net WPF 기반 키오스크 배리어프리 기능 추가 개발 | 3,000,000원/월 | iot_device | staffing | general | legacy_heavy | low | legacy_enterprise | 42 | 450~560h | 30 | 22 | 30 |
| 19 | Nest.js/React 기반 회계/인사 ERP 시스템 기능  | 6,000,000원 | business_management | feature_extension | hr | legacy_heavy, high_risk_domain | low | core_web, backend_api, database, legacy_enterprise | 45 | 80~180h | 40 | 25 | 40 |
| 20 | AI 기반 사용자 맞춤형 디지털 복지 앱 구축 | 20,000,000원 | mobile_app | new_build | public_sector | multi_platform | medium | mobile, backend_api, database, admin_system, ai_llm, external_api_integration | 45 | 400~900h | 45 | 50 | 55 |

## 분류가 애매한 케이스

- [freemoa:47969] OpenClaw 설치 및 증권 HTS API 연동 설정 작업 — AI 판단 애매: project_type
- [freemoa:48169] [도급/상주] 영어교육 플랫폼 차세대 아키텍처 전환 개발 — 월 단가/상주 공고인데 engagement_type=migration
- [wishket:153028] 클라우드 기반 전자차트 SaaS 플랫폼 MVP 개발 — industry=other
- [wishket:157477] EMS 연동 피크제어 및 Auto-DR 서버 백엔드 개발 — industry=other
- [wishket:157967] C#.Net WPF 기반 키오스크 배리어프리 기능 추가 개발 — AI 판단 애매: project_type

## 분류별 샘플 건수

- project_type: iot_device 3, automation_rpa 2, business_management 2, mobile_app 2, reservation 2, saas 2, crawler_data_collection 1, data_dashboard 1, ecommerce 1, fintech_payment 1, platform_marketplace 1, qa_testing 1, website 1
- engagement_type: new_build 11, staffing 6, feature_extension 2, migration 1
- industry: general 5, commerce 2, education 2, finance 2, manufacturing 2, other 2, hr 1, media_content 1, public_sector 1, real_estate 1, travel_hospitality 1
- reuse_level: low 11, medium 5, high 2, one_off 2
- complexity_types: legacy_heavy 6, standard_crud 6, integration_heavy 5, hardware_iot 3, high_risk_domain 3, multi_platform 3, workflow_complex 2, realtime 1
- technology_assets: backend_api 13, database 12, core_web 10, external_api_integration 8, admin_system 7, authentication_authorization 5, cloud_infra 5, legacy_enterprise 5, mobile 4, analytics_dashboard 3, payments 3, ai_llm 2, hardware_iot 2, saas_architecture 2, realtime 1, speech_audio_ai 1, workflow_automation 1

## 상세

### 1. [freemoa:48251] 별장/콘도 회원권 분양, 예약 관리 플랫폼 구축(Web/App)

- 예산: 50,000,000원 ~ 100,000,000원 · 기간: 121일
- 분류: **reservation** (예약/예약관리) / 회원권 분양·예약 · new_build · real_estate · reuse medium
- complexity_types: multi_platform, workflow_complex, integration_heavy · technology_assets: core_web, backend_api, database, authentication_authorization, admin_system, payments, mobile, external_api_integration
- 요약: 별장/콘도 회원권 분양, 실시간 예약, 2차 지분 거래, 결제·정산을 제공하는 Web/App/Admin 플랫폼
- 기능: -
- 연동: -
- 플랫폼: web, admin_web, cross_platform_app · 기술: -
- 추천 스택: 
- 점수: 난이도 55 · 시간 700~1300h · 학습 55 · 재사용 55 · 시장 60 · 위험 55 · 명확성 50
- 근거:
  - vibe_coding_difficulty: 수동 기준(분류 중심)
  - estimated_hours: 공고 작업 범위 기준, 예산과 무관
  - learning_value: 수동 기준(분류 중심)
  - reusability_value: 예약 엔진·결제/정산·관리자 구조는 재사용 가능하나 회원권/지분 도메인이 특수
  - market_value: 수동 기준(분류 중심)
  - technical_risk: 수동 기준(분류 중심)

### 2. [freemoa:48011] [신규/임베디드] Raspberry Pi 센서 연동 프로토타입 개발

- 예산: 5,000,000원 ~ 7,000,000원 · 기간: 30일
- 분류: **iot_device** (실제 물리 장치(센서/장비/프린터/락커/키오스크/주변기기/산업장비)와의 통신·제어가 핵심인 시스템) / RPi 센서 프로토타입 · new_build · general · reuse low
- complexity_types: hardware_iot · technology_assets: hardware_iot
- 요약: Raspberry Pi에 센서 2~3종을 연동해 데이터를 수집·통합하고 기초 분석 로직을 구현하는 프로토타입
- 기능: -
- 연동: -
- 플랫폼: embedded · 기술: -
- 추천 스택: 
- 점수: 난이도 55 · 시간 40~120h · 학습 45 · 재사용 25 · 시장 25 · 위험 55 · 명확성 45
- 근거:
  - vibe_coding_difficulty: 수동 기준(분류 중심)
  - estimated_hours: 공고 작업 범위 기준, 예산과 무관
  - learning_value: 수동 기준(분류 중심)
  - reusability_value: 센서 연동 경험은 남지만 클라이언트 지정 하드웨어에 맞춘 코드라 재사용 제한적
  - market_value: 수동 기준(분류 중심)
  - technical_risk: 수동 기준(분류 중심)

### 3. [freemoa:47955] (상주) 커스텀 Android 단말 및 기본 탑재 앱 QA엔지니어

- 예산: 4,000,000원 ~ 5,000,000원 · 기간: 30일
- 분류: **qa_testing** (QA/테스트/테스트 자동화/앱·웹 검수/품질보증/테스트 엔지니어 투입) / 단말 앱 QA · staffing · general · reuse one_off
- complexity_types: hardware_iot · technology_assets: mobile
- 요약: 자체 제작 AOSP 단말의 기본 탑재 앱(런처·VoIP 등)에 대해 TC 작성과 테스트를 1개월 상주로 수행
- 기능: -
- 연동: -
- 플랫폼: android · 기술: -
- 추천 스택: 
- 점수: 난이도 20 · 시간 150~180h · 학습 20 · 재사용 8 · 시장 40 · 위험 15 · 명확성 70
- 근거:
  - vibe_coding_difficulty: 수동 기준(분류 중심)
  - estimated_hours: 공고 작업 범위 기준, 예산과 무관
  - learning_value: 수동 기준(분류 중심)
  - reusability_value: 자체 제작 단말과 자사 앱 전용 TC라 다른 외주에 재사용 거의 불가
  - market_value: 수동 기준(분류 중심)
  - technical_risk: 수동 기준(분류 중심)

### 4. [freemoa:48311] [상주] PLM/BOM 고도화 개발 (Java/Vue3/Tibero)

- 예산: 5,000,000원 ~ 10,000,000원 · 기간: 120일
- 분류: **business_management** (사내 업무관리/ERP/그룹웨어/MES) / PLM/BOM 고도화 · staffing · manufacturing · reuse one_off
- complexity_types: legacy_heavy · technology_assets: legacy_enterprise, backend_api, database
- 요약: 대기업 계열 PLM/BOM 시스템의 분석·설계와 Java/Vue3/Tibero 기반 고도화 개발 인력 상주 투입
- 기능: -
- 연동: -
- 플랫폼: web · 기술: -
- 추천 스택: 
- 점수: 난이도 60 · 시간 600~800h · 학습 30 · 재사용 10 · 시장 20 · 위험 50 · 명확성 30
- 근거:
  - vibe_coding_difficulty: 수동 기준(분류 중심)
  - estimated_hours: 공고 작업 범위 기준, 예산과 무관
  - learning_value: 수동 기준(분류 중심)
  - reusability_value: 특정 고객사 내부 PLM/BOM 시스템과 Tibero 환경에 강하게 종속
  - market_value: 수동 기준(분류 중심)
  - technical_risk: 수동 기준(분류 중심)

### 5. [freemoa:47704] 크리에이터 주요 지표 분석 시각화 제공 플랫폼 웹 개발

- 예산: 10,000,000원 ~ 20,000,000원 · 기간: 60일
- 분류: **data_dashboard** (BI/통계/대시보드/데이터 분석) / 크리에이터 분석 플랫폼 · new_build · media_content · reuse high
- complexity_types: standard_crud · technology_assets: core_web, backend_api, database, authentication_authorization, admin_system, analytics_dashboard, cloud_infra
- 요약: 내부 API 데이터를 시각화하는 사용자 웹, 관리자 백오피스(회원·콘텐츠·구독·통계), 백엔드를 구축
- 기능: -
- 연동: -
- 플랫폼: web, admin_web · 기술: -
- 추천 스택: 
- 점수: 난이도 35 · 시간 250~450h · 학습 50 · 재사용 70 · 시장 70 · 위험 30 · 명확성 80
- 근거:
  - vibe_coding_difficulty: 수동 기준(분류 중심)
  - estimated_hours: 공고 작업 범위 기준, 예산과 무관
  - learning_value: 수동 기준(분류 중심)
  - reusability_value: 인증·관리자·구독 관리·대시보드 구조는 다른 SaaS형 외주에 거의 그대로 재사용 가능
  - market_value: 수동 기준(분류 중심)
  - technical_risk: 수동 기준(분류 중심)

### 6. [freemoa:47969] OpenClaw 설치 및 증권 HTS API 연동 설정 작업

- 예산: 300,000원 ~ 800,000원 · 기간: 2일
- 분류: **crawler_data_collection** (크롤러/데이터 수집기) / HTS API 환경 설정 · new_build · finance · reuse low
- complexity_types: integration_heavy · technology_assets: external_api_integration
- 판단 애매: project_type
- 요약: OpenClaw 설치와 증권 HTS OpenAPI 기본 연동 설정, 데이터 수신 동작 확인
- 기능: -
- 연동: -
- 플랫폼: desktop · 기술: -
- 추천 스택: 
- 점수: 난이도 18 · 시간 6~20h · 학습 20 · 재사용 15 · 시장 25 · 위험 25 · 명확성 55
- 근거:
  - vibe_coding_difficulty: 수동 기준(분류 중심)
  - estimated_hours: 공고 작업 범위 기준, 예산과 무관
  - learning_value: 수동 기준(분류 중심)
  - reusability_value: 특정 프로그램·특정 증권사 API 환경 설정이라 코드 재사용 제한적
  - market_value: 수동 기준(분류 중심)
  - technical_risk: 수동 기준(분류 중심)

### 7. [freemoa:48169] [도급/상주] 영어교육 플랫폼 차세대 아키텍처 전환 개발

- 예산: 100,000,000원 ~ 200,000,000원 · 기간: 180일
- 분류: **saas** (SaaS 제품 (다수 고객사 대상 구독형 서비스)) / 교육 플랫폼 재구축 · migration · education · reuse medium
- complexity_types: legacy_heavy, integration_heavy · technology_assets: core_web, backend_api, database, authentication_authorization, admin_system, saas_architecture, ai_llm, speech_audio_ai, external_api_integration, cloud_infra
- 요약: PHP/그누보드 기반 영어교육 플랫폼을 Next.js/NestJS/PostgreSQL 멀티테넌트 구조로 재구축하고 데이터를 이전
- 기능: -
- 연동: -
- 플랫폼: web, admin_web · 기술: -
- 추천 스택: 
- 점수: 난이도 65 · 시간 1500~2800h · 학습 65 · 재사용 50 · 시장 55 · 위험 60 · 명확성 60
- 근거:
  - vibe_coding_difficulty: 수동 기준(분류 중심)
  - estimated_hours: 공고 작업 범위 기준, 예산과 무관
  - learning_value: 수동 기준(분류 중심)
  - reusability_value: 멀티테넌트 SaaS 구조·RBAC·AI(STT/TTS/GPT) 연동 레이어는 재사용 가능하나 기존 시스템 이전 부분은 전용
  - market_value: 수동 기준(분류 중심)
  - technical_risk: 수동 기준(분류 중심)

### 8. [wishket:158096] 글로벌 B2B 쇼핑몰 신규 구축 (WordPress + WooCommerce)

- 예산: 15,000,000원 · 기간: 90일
- 분류: **ecommerce** (쇼핑몰/커머스) / B2B 쇼핑몰 · new_build · commerce · reuse medium
- complexity_types: standard_crud · technology_assets: core_web, backend_api, database, cloud_infra
- 요약: WordPress+WooCommerce 기반 글로벌 B2B 쇼핑몰: 구조화 Product DB, 필터 검색, 견적/주문, 관리자 운영
- 기능: -
- 연동: -
- 플랫폼: web · 기술: -
- 추천 스택: 
- 점수: 난이도 30 · 시간 150~330h · 학습 30 · 재사용 50 · 시장 60 · 위험 30 · 명확성 65
- 근거:
  - vibe_coding_difficulty: 수동 기준(분류 중심)
  - estimated_hours: 공고 작업 범위 기준, 예산과 무관
  - learning_value: 수동 기준(분류 중심)
  - reusability_value: Product DB 구조·티어 가격/MOQ·패싯 필터는 다른 B2B 쇼핑몰에 재사용 가능한 구체적 구조
  - market_value: 수동 기준(분류 중심)
  - technical_risk: 수동 기준(분류 중심)

### 9. [wishket:155100] WordPress 기반 글로벌 B2B 홈페이지 신규 구축

- 예산: 12,000,000원 · 기간: 60일
- 분류: **website** (기업/브랜드 홈페이지, 랜딩) / B2B 홈페이지 · new_build · general · reuse low
- complexity_types: standard_crud · technology_assets: core_web
- 요약: WordPress+WPML 기반 다국어(영어/한국어/아랍어 RTL) 글로벌 B2B 홈페이지 구축
- 기능: -
- 연동: -
- 플랫폼: web · 기술: -
- 추천 스택: 
- 점수: 난이도 12 · 시간 60~130h · 학습 25 · 재사용 28 · 시장 55 · 위험 15 · 명확성 80
- 근거:
  - vibe_coding_difficulty: 수동 기준(분류 중심)
  - estimated_hours: 공고 작업 범위 기준, 예산과 무관
  - learning_value: 수동 기준(분류 중심)
  - reusability_value: 특정 기업 브랜드용 커스텀 테마와 콘텐츠라 코드 재사용은 제한적
  - market_value: 수동 기준(분류 중심)
  - technical_risk: 수동 기준(분류 중심)

### 10. [wishket:156240] Supabase 기반 사용자 게시판 및 관리자/광고주 대시보드 구축

- 예산: 15,000,000원 · 기간: 60일
- 분류: **platform_marketplace** (중개/매칭/마켓플레이스/커뮤니티 플랫폼) / 커뮤니티+광고 시스템 · new_build · general · reuse high
- complexity_types: standard_crud, workflow_complex · technology_assets: core_web, backend_api, database, authentication_authorization, admin_system, analytics_dashboard, external_api_integration
- 요약: Supabase 기반 커뮤니티 게시판(웹뷰)과 광고 캠페인·트래킹, 관리자/광고주 대시보드, 4단계 권한 관리
- 기능: -
- 연동: -
- 플랫폼: web, admin_web, mobile_web · 기술: -
- 추천 스택: 
- 점수: 난이도 38 · 시간 200~380h · 학습 50 · 재사용 75 · 시장 70 · 위험 35 · 명확성 80
- 근거:
  - vibe_coding_difficulty: 수동 기준(분류 중심)
  - estimated_hours: 공고 작업 범위 기준, 예산과 무관
  - learning_value: 수동 기준(분류 중심)
  - reusability_value: 권한 관리·게시판/댓글/신고·관리자 템플릿·광고 트래킹은 범용 모듈이라 거의 그대로 재사용 가능
  - market_value: 수동 기준(분류 중심)
  - technical_risk: 수동 기준(분류 중심)

### 11. [wishket:158628] React/Spring Boot 기반 대기업 PG 백오피스 풀스택 개발

- 예산: 6,000,000원/월 · 기간: 225일
- 분류: **fintech_payment** (PG/선불/결제 인프라/핀테크 시스템) / PG 백오피스 · staffing · finance · reuse low
- complexity_types: high_risk_domain · technology_assets: core_web, backend_api, database, payments, legacy_enterprise
- 요약: 대기업 차세대 PG 시스템 재구축의 백오피스를 React/Spring Boot로 분석·설계·개발하는 상주 인력 투입
- 기능: -
- 연동: -
- 플랫폼: web, admin_web · 기술: -
- 추천 스택: 
- 점수: 난이도 60 · 시간 1200~1500h · 학습 40 · 재사용 20 · 시장 35 · 위험 55 · 명확성 25
- 근거:
  - vibe_coding_difficulty: 수동 기준(분류 중심)
  - estimated_hours: 공고 작업 범위 기준, 예산과 무관
  - learning_value: 수동 기준(분류 중심)
  - reusability_value: 특정 대기업 PG 업무 흐름의 백오피스라 코드 재사용은 제한적이나 일부 일반성은 있음
  - market_value: 수동 기준(분류 중심)
  - technical_risk: 수동 기준(분류 중심)

### 12. [wishket:154821] RPA 기반 대기업 업무 프로세스 자동화 개발 및 운영 지원

- 예산: 5,500,000원/월 · 기간: 150일
- 분류: **automation_rpa** (브라우저 자동화/RPA/업무 자동화 프로그램) / 대기업 RPA 운영 · staffing · manufacturing · reuse low
- complexity_types: legacy_heavy · technology_assets: workflow_automation, legacy_enterprise
- 요약: 대기업 RPA 프로세스 개발·운영 지원, 기존 RPA 시스템 개선(UiPath/Power Automate 등)
- 기능: -
- 연동: -
- 플랫폼: desktop · 기술: -
- 추천 스택: 
- 점수: 난이도 42 · 시간 650~800h · 학습 30 · 재사용 18 · 시장 35 · 위험 30 · 명확성 30
- 근거:
  - vibe_coding_difficulty: 수동 기준(분류 중심)
  - estimated_hours: 공고 작업 범위 기준, 예산과 무관
  - learning_value: 수동 기준(분류 중심)
  - reusability_value: 특정 기업 업무 흐름과 기존 RPA 수정이라 코드 재사용 제한적
  - market_value: 수동 기준(분류 중심)
  - technical_risk: 수동 기준(분류 중심)

### 13. [wishket:153028] 클라우드 기반 전자차트 SaaS 플랫폼 MVP 개발

- 예산: 40,000,000원 · 기간: 170일
- 분류: **saas** (SaaS 제품 (다수 고객사 대상 구독형 서비스)) / 뷰티샵 전자차트 · new_build · other · reuse medium
- complexity_types: standard_crud, multi_platform · technology_assets: core_web, backend_api, database, authentication_authorization, admin_system, saas_architecture, mobile, analytics_dashboard, cloud_infra
- 요약: 뷰티샵용 클라우드 전자차트 SaaS MVP: 고객/시술 기록, 사진, 예약, 동의서 서명, 통계 (웹+태블릿 앱)
- 기능: -
- 연동: -
- 플랫폼: web, admin_web, cross_platform_app · 기술: -
- 추천 스택: 
- 점수: 난이도 45 · 시간 450~900h · 학습 55 · 재사용 55 · 시장 65 · 위험 45 · 명확성 60
- 근거:
  - vibe_coding_difficulty: 수동 기준(분류 중심)
  - estimated_hours: 공고 작업 범위 기준, 예산과 무관
  - learning_value: 수동 기준(분류 중심)
  - reusability_value: 권한·고객관리·예약·통계 등 SaaS 공통 구조는 재사용 가능하나 시술 차트 도메인은 전용
  - market_value: 수동 기준(분류 중심)
  - technical_risk: 수동 기준(분류 중심)

### 14. [wishket:150086] 쿠팡 API 연동 제품 판매량 및 재고 추적 자동화 (Excel VBA)

- 예산: 1,000,000원 · 기간: 5일
- 분류: **automation_rpa** (브라우저 자동화/RPA/업무 자동화 프로그램) / 쿠팡 재고 VBA · new_build · commerce · reuse low
- complexity_types: standard_crud · technology_assets: external_api_integration
- 요약: 쿠팡 로켓그로스 API로 재고를 조회해 일별 판매량을 계산·누적하는 Excel VBA 자동화 툴
- 기능: -
- 연동: -
- 플랫폼: desktop · 기술: -
- 추천 스택: 
- 점수: 난이도 20 · 시간 12~30h · 학습 20 · 재사용 22 · 시장 45 · 위험 15 · 명확성 80
- 근거:
  - vibe_coding_difficulty: 수동 기준(분류 중심)
  - estimated_hours: 공고 작업 범위 기준, 예산과 무관
  - learning_value: 수동 기준(분류 중심)
  - reusability_value: 쿠팡 API 전용 Excel VBA라 코드 재사용은 제한적
  - market_value: 수동 기준(분류 중심)
  - technical_risk: 수동 기준(분류 중심)

### 15. [wishket:157477] EMS 연동 피크제어 및 Auto-DR 서버 백엔드 개발

- 예산: 5,000,000원 · 기간: 60일
- 분류: **iot_device** (실제 물리 장치(센서/장비/프린터/락커/키오스크/주변기기/산업장비)와의 통신·제어가 핵심인 시스템) / 피크제어 Auto-DR · new_build · other · reuse low
- complexity_types: hardware_iot, integration_heavy, realtime · technology_assets: backend_api, database, realtime, hardware_iot, external_api_integration
- 요약: 기존 EMS와 연동해 Modbus로 장비를 제어하는 피크제어/Auto-DR(OpenADR) Python 서버 백엔드
- 기능: -
- 연동: -
- 플랫폼: backend_api · 기술: -
- 추천 스택: 
- 점수: 난이도 68 · 시간 350~650h · 학습 55 · 재사용 28 · 시장 25 · 위험 62 · 명확성 60
- 근거:
  - vibe_coding_difficulty: 수동 기준(분류 중심)
  - estimated_hours: 공고 작업 범위 기준, 예산과 무관
  - learning_value: 수동 기준(분류 중심)
  - reusability_value: OpenADR/Modbus 연동은 일부 일반성이 있으나 기존 EMS 스키마·장비 매핑에 묶여 재사용 제한적
  - market_value: 수동 기준(분류 중심)
  - technical_risk: 수동 기준(분류 중심)

### 16. [wishket:149922] Sharetribe 기반 숙박 예약 플랫폼 결제/정산 기능 개발

- 예산: 5,000,000원 · 기간: 30일
- 분류: **reservation** (예약/예약관리) / 숙박 정산·캘린더 · feature_extension · travel_hospitality · reuse low
- complexity_types: integration_heavy, high_risk_domain · technology_assets: core_web, backend_api, payments, external_api_integration, admin_system
- 요약: Sharetribe Pro 기반 숙박 예약 플랫폼에 신규 PG 연동 자동 정산, iCal 동기화, 고객 문의 기능 추가
- 기능: -
- 연동: -
- 플랫폼: web, admin_web · 기술: -
- 추천 스택: 
- 점수: 난이도 50 · 시간 80~180h · 학습 55 · 재사용 30 · 시장 50 · 위험 55 · 명확성 62
- 근거:
  - vibe_coding_difficulty: 수동 기준(분류 중심)
  - estimated_hours: 공고 작업 범위 기준, 예산과 무관
  - learning_value: 수동 기준(분류 중심)
  - reusability_value: Sharetribe 플러그인/커스터마이징 대응이라 해당 플랫폼 밖에서 재사용 제한적
  - market_value: 수동 기준(분류 중심)
  - technical_risk: 수동 기준(분류 중심)

### 17. [wishket:152942] Nest.js/AWS 기반 AI튜터 앱 백엔드 개발 (주 20시간 재택)

- 예산: 3,000,000원/월 · 기간: 360일
- 분류: **mobile_app** (iOS/Android 앱이 결과물의 중심) / AI튜터 앱 백엔드 · staffing · education · reuse low
- complexity_types: legacy_heavy · technology_assets: backend_api, database, cloud_infra
- 요약: 출시된 AI튜터 앱의 Nest.js/AWS 백엔드 유지관리와 신규 기능 개발 (주 20시간 재택)
- 기능: -
- 연동: -
- 플랫폼: backend_api · 기술: -
- 추천 스택: 
- 점수: 난이도 40 · 시간 900~1100h · 학습 35 · 재사용 18 · 시장 40 · 위험 30 · 명확성 35
- 근거:
  - vibe_coding_difficulty: 수동 기준(분류 중심)
  - estimated_hours: 공고 작업 범위 기준, 예산과 무관
  - learning_value: 수동 기준(분류 중심)
  - reusability_value: 특정 회사 앱의 기존 백엔드 수정이라 코드 재사용 제한적
  - market_value: 수동 기준(분류 중심)
  - technical_risk: 수동 기준(분류 중심)

### 18. [wishket:157967] C#.Net WPF 기반 키오스크 배리어프리 기능 추가 개발

- 예산: 3,000,000원/월 · 기간: 90일
- 분류: **iot_device** (실제 물리 장치(센서/장비/프린터/락커/키오스크/주변기기/산업장비)와의 통신·제어가 핵심인 시스템) / 키오스크 배리어프리 · staffing · general · reuse low
- complexity_types: legacy_heavy · technology_assets: legacy_enterprise
- 판단 애매: project_type
- 요약: 기존 C#/WPF 키오스크 시스템 소스를 분석해 배리어프리 기능을 추가 개발하는 상주 인력 투입
- 기능: -
- 연동: -
- 플랫폼: desktop · 기술: -
- 추천 스택: 
- 점수: 난이도 42 · 시간 450~560h · 학습 30 · 재사용 22 · 시장 30 · 위험 35 · 명확성 55
- 근거:
  - vibe_coding_difficulty: 수동 기준(분류 중심)
  - estimated_hours: 공고 작업 범위 기준, 예산과 무관
  - learning_value: 수동 기준(분류 중심)
  - reusability_value: 특정 키오스크 레거시 소스 수정이지만 배리어프리 UI 패턴에는 일부 일반성
  - market_value: 수동 기준(분류 중심)
  - technical_risk: 수동 기준(분류 중심)

### 19. [wishket:150884] Nest.js/React 기반 회계/인사 ERP 시스템 기능 개선

- 예산: 6,000,000원 · 기간: 30일
- 분류: **business_management** (사내 업무관리/ERP/그룹웨어/MES) / 급여대장 기능 개선 · feature_extension · hr · reuse low
- complexity_types: legacy_heavy, high_risk_domain · technology_assets: core_web, backend_api, database, legacy_enterprise
- 요약: 운영 중인 회계/인사 ERP의 급여대장 로직 개선과 연봉 테이블 기능 신설 (Nest.js/React)
- 기능: -
- 연동: -
- 플랫폼: web · 기술: -
- 추천 스택: 
- 점수: 난이도 45 · 시간 80~180h · 학습 40 · 재사용 25 · 시장 40 · 위험 50 · 명확성 70
- 근거:
  - vibe_coding_difficulty: 수동 기준(분류 중심)
  - estimated_hours: 공고 작업 범위 기준, 예산과 무관
  - learning_value: 수동 기준(분류 중심)
  - reusability_value: 특정 ERP 코드베이스의 급여 로직 수정이라 코드 재사용 제한적
  - market_value: 수동 기준(분류 중심)
  - technical_risk: 수동 기준(분류 중심)

### 20. [wishket:153015] AI 기반 사용자 맞춤형 디지털 복지 앱 구축

- 예산: 20,000,000원 · 기간: 180일
- 분류: **mobile_app** (iOS/Android 앱이 결과물의 중심) / 복지 정보 앱 · new_build · public_sector · reuse medium
- complexity_types: multi_platform · technology_assets: mobile, backend_api, database, admin_system, ai_llm, external_api_integration
- 요약: 복지 정보 제공, 위치 기반 시설 안내, AI 맞춤 로드맵, 예약/상담 신청과 관리자 기능을 갖춘 Android/iOS 앱
- 기능: -
- 연동: -
- 플랫폼: ios, android, admin_web · 기술: -
- 추천 스택: 
- 점수: 난이도 45 · 시간 400~900h · 학습 45 · 재사용 50 · 시장 55 · 위험 40 · 명확성 40
- 근거:
  - vibe_coding_difficulty: 수동 기준(분류 중심)
  - estimated_hours: 공고 작업 범위 기준, 예산과 무관
  - learning_value: 수동 기준(분류 중심)
  - reusability_value: 예약/상담 신청·콘텐츠 관리자·위치 안내 구조는 재사용 가능하나 AI 로드맵은 전용
  - market_value: 수동 기준(분류 중심)
  - technical_risk: 수동 기준(분류 중심)

## 분포

- vibe_coding_difficulty: 평균 42 / 중앙 45 / 범위 12~68
- estimated_hours_max: 평균 666 / 중앙 560 / 범위 20~2800
- learning_value: 평균 40 / 중앙 40 / 범위 20~65
- reusability_value: 평균 34 / 중앙 28 / 범위 8~75
- market_value: 평균 45 / 중앙 45 / 범위 20~70

## 권장 어휘 밖 코드 (다음 버전 taxonomy 후보)

- features: 없음
- integrations: 없음
- skills: 없음
