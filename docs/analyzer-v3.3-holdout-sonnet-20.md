# Analyzer v3.3 분석 리포트

- 생성: 2026-10-03T03:59:09.716Z
- 모델: `claude-sonnet-5-5` (mode: sync)
- 비고: backend=claude-cli (claude -p, Claude 구독제). 비용은 API 단가 환산 추정치이며 실제 청구되지 않음 (구독 사용량 한도에 반영)
- 결과: 성공 20 / 실패 0 / 전체 20
- 토큰: input 198 · output 74,886 · cache write 115,123 · cache read 1,069,940
- 비용: $1.2511 (건당 $0.0626)

## 전체 5,287건 분석 비용 추정 (건당 평균 in 59263 / out 3744 토큰 기준)

| 모델 | 동기 호출 | Batch API (50% 할인) |
|---|---|---|
| claude-opus-5-5 | $1649.22 | $824.61 |
| claude-sonnet-5-5 (이번 실행) | $824.61 | $412.30 |
| claude-haiku-4-5 | $412.30 | $206.15 |

※ 다른 모델 행은 같은 토큰 수를 가정한 단순 환산입니다. 모델마다 사고(thinking)·출력 길이가 달라 실제 비용은 다를 수 있습니다.

## 프로젝트별 분류

| # | 제목 | 예산 | project_type | engagement | industry | complexity_types | reuse | technology_assets | 난이도 | 예상시간 | 학습 | 재사용 | 시장 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | 별장/콘도 회원권 분양, 예약 관리 플랫폼 구축(Web/App | 50,000,000원 ~ 100,000,000원 | platform_marketplace | new_build | real_estate | integration_heavy, workflow_complex, high_risk_domain, multi_platform | medium | core_web, backend_api, database, authentication_authorization, admin_system, payments, external_api_integration, mobile, realtime, security | 62 | 700~1200h | 70 | 60 | 62 |
| 2 | [신규/임베디드] Raspberry Pi 센서 연동 프로토타입 | 5,000,000원 ~ 7,000,000원 | iot_device | new_build | general | hardware_iot | low | hardware_iot, data_pipeline | 58 | 60~130h | 45 | 30 | 40 |
| 3 | (상주) 커스텀 Android 단말 및 기본 탑재 앱 QA엔지 | 4,000,000원 ~ 5,000,000원 | qa_testing | staffing | general | hardware_iot | low | hardware_iot | 40 | 150~180h | 35 | 25 | 45 |
| 4 | [상주] PLM/BOM 고도화 개발 (Java/Vue3/Tib | 5,000,000원 ~ 10,000,000원 | business_management | staffing | manufacturing | workflow_complex, legacy_heavy | low | core_web, backend_api, database, legacy_enterprise | 60 | 600~900h | 35 | 25 | 40 |
| 5 | 크리에이터 주요 지표 분석 시각화 제공 플랫폼 웹 개발 | 10,000,000원 ~ 20,000,000원 | data_dashboard | new_build | media_content | standard_crud, integration_heavy | medium | core_web, backend_api, database, authentication_authorization, admin_system, analytics_dashboard, external_api_integration, cloud_infra | 38 | 280~450h | 50 | 60 | 68 |
| 6 | OpenClaw 설치 및 증권 HTS API 연동 설정 작업 | 300,000원 ~ 800,000원 | automation_rpa | new_build | finance | integration_heavy | low | external_api_integration | 25 | 6~16h | 25 | 22 | 35 |
| 7 | [도급/상주] 영어교육 플랫폼 차세대 아키텍처 전환 개발 | 100,000,000원 ~ 200,000,000원 | saas | renewal | education | legacy_heavy, integration_heavy, workflow_complex | medium | core_web, backend_api, database, authentication_authorization, admin_system, saas_architecture, ai_llm, speech_audio_ai, external_api_integration, data_pipeline, security, legacy_enterprise | 65 | 1400~2400h | 70 | 55 | 55 |
| 8 | 글로벌 B2B 쇼핑몰 신규 구축 (WordPress + Woo | 15,000,000원 | ecommerce | new_build | commerce | standard_crud, integration_heavy | medium | core_web, backend_api, database, authentication_authorization, admin_system, external_api_integration, cloud_infra, security | 35 | 220~360h | 40 | 60 | 80 |
| 9 | WordPress 기반 글로벌 B2B 홈페이지 신규 구축 | 12,000,000원 | website | new_build | manufacturing | standard_crud | high | core_web, backend_api, database, admin_system | 22 | 120~200h | 35 | 65 | 75 |
| 10 | Supabase 기반 사용자 게시판 및 관리자/광고주 대시보드 | 15,000,000원 | platform_marketplace | new_build | general | workflow_complex, multi_platform | medium | core_web, backend_api, database, authentication_authorization, admin_system, analytics_dashboard, ai_llm, cloud_infra, security | 42 | 280~420h | 60 | 65 | 65 |
| 11 | React/Spring Boot 기반 대기업 PG 백오피스 풀 | 6,000,000원/월 | fintech_payment | staffing | finance | high_risk_domain, workflow_complex | low | core_web, backend_api, database, admin_system, data_pipeline, legacy_enterprise | 62 | 900~1300h | 45 | 35 | 55 |
| 12 | RPA 기반 대기업 업무 프로세스 자동화 개발 및 운영 지원 | 5,500,000원/월 | automation_rpa | staffing | manufacturing | legacy_heavy, integration_heavy | low | workflow_automation, browser_automation, analytics_dashboard, legacy_enterprise | 50 | 700~850h | 45 | 35 | 60 |
| 13 | 클라우드 기반 전자차트 SaaS 플랫폼 MVP 개발 | 40,000,000원 | saas | new_build | other | standard_crud, multi_platform | medium | core_web, backend_api, database, authentication_authorization, admin_system, saas_architecture, mobile, analytics_dashboard, cloud_infra | 42 | 400~650h | 60 | 68 | 70 |
| 14 | 쿠팡 API 연동 제품 판매량 및 재고 추적 자동화 (Exce | 1,000,000원 | automation_rpa | new_build | commerce | standard_crud | medium | external_api_integration, workflow_automation | 25 | 16~32h | 25 | 45 | 60 |
| 15 | EMS 연동 피크제어 및 Auto-DR 서버 백엔드 개발 | 5,000,000원 | iot_device | new_build | other | hardware_iot, integration_heavy, algorithmic_specialized | low | backend_api, database, hardware_iot, external_api_integration, data_pipeline | 68 | 220~400h | 60 | 35 | 35 |
| 16 | Sharetribe 기반 숙박 예약 플랫폼 결제/정산 기능 개 | 5,000,000원 | platform_marketplace | feature_extension | travel_hospitality | integration_heavy, high_risk_domain | medium | core_web, backend_api, payments, external_api_integration, database | 58 | 130~230h | 60 | 50 | 55 |
| 17 | Nest.js/AWS 기반 AI튜터 앱 백엔드 개발 (주 20 | 3,000,000원/월 | mobile_app | staffing | education | legacy_heavy | low | backend_api, database, cloud_infra, legacy_enterprise | 50 | 900~1100h | 35 | 30 | 60 |
| 18 | C#.Net WPF 기반 키오스크 배리어프리 기능 추가 개발 | 3,000,000원/월 | iot_device | staffing | general | legacy_heavy, hardware_iot | low | legacy_enterprise, hardware_iot | 55 | 400~520h | 35 | 25 | 35 |
| 19 | Nest.js/React 기반 회계/인사 ERP 시스템 기능  | 6,000,000원 | business_management | feature_extension | professional_services | legacy_heavy, high_risk_domain, workflow_complex | low | core_web, backend_api, database, admin_system, legacy_enterprise | 58 | 100~180h | 45 | 35 | 55 |
| 20 | AI 기반 사용자 맞춤형 디지털 복지 앱 구축 | 20,000,000원 | platform_marketplace | new_build | public_sector | multi_platform, integration_heavy | medium | mobile, backend_api, database, admin_system, ai_llm, authentication_authorization, external_api_integration, core_web | 42 | 280~480h | 55 | 55 | 60 |

## 분류가 애매한 케이스

- [freemoa:48251] 별장/콘도 회원권 분양, 예약 관리 플랫폼 구축(Web/App) — complexity_types 4개; AI 판단 애매: project_type
- [freemoa:48169] [도급/상주] 영어교육 플랫폼 차세대 아키텍처 전환 개발 — 월 단가/상주 공고인데 engagement_type=renewal
- [wishket:153028] 클라우드 기반 전자차트 SaaS 플랫폼 MVP 개발 — industry=other
- [wishket:157477] EMS 연동 피크제어 및 Auto-DR 서버 백엔드 개발 — industry=other
- [wishket:157967] C#.Net WPF 기반 키오스크 배리어프리 기능 추가 개발 — AI 판단 애매: project_type
- [wishket:153015] AI 기반 사용자 맞춤형 디지털 복지 앱 구축 — AI 판단 애매: project_type

## 분류별 샘플 건수

- project_type: platform_marketplace 4, automation_rpa 3, iot_device 3, business_management 2, saas 2, data_dashboard 1, ecommerce 1, fintech_payment 1, mobile_app 1, qa_testing 1, website 1
- engagement_type: new_build 11, staffing 6, feature_extension 2, renewal 1
- industry: general 4, manufacturing 3, commerce 2, education 2, finance 2, other 2, media_content 1, professional_services 1, public_sector 1, real_estate 1, travel_hospitality 1
- reuse_level: low 10, medium 9, high 1
- complexity_types: integration_heavy 9, legacy_heavy 6, workflow_complex 6, standard_crud 5, hardware_iot 4, high_risk_domain 4, multi_platform 4, algorithmic_specialized 1
- technology_assets: backend_api 14, database 14, core_web 12, admin_system 10, external_api_integration 9, authentication_authorization 7, legacy_enterprise 7, cloud_infra 5, analytics_dashboard 4, data_pipeline 4, hardware_iot 4, security 4, ai_llm 3, mobile 3, payments 2, saas_architecture 2, workflow_automation 2, browser_automation 1, realtime 1, speech_audio_ai 1

## 상세

### 1. [freemoa:48251] 별장/콘도 회원권 분양, 예약 관리 플랫폼 구축(Web/App)

- 예산: 50,000,000원 ~ 100,000,000원 · 기간: 121일
- 분류: **platform_marketplace** (중개/매칭/마켓플레이스/커뮤니티 플랫폼) / 별장 회원권 분양·예약 · new_build · real_estate · reuse medium
- complexity_types: integration_heavy, workflow_complex, high_risk_domain, multi_platform · technology_assets: core_web, backend_api, database, authentication_authorization, admin_system, payments, external_api_integration, mobile, realtime, security
- 판단 애매: project_type
- 요약: 부동산 개발사를 위해 별장/콘도 회원권 분양, 실시간 예약, 회원 간 지분 거래(2차 마켓), 결제·정산을 아우르는 웹·앱·관리자 플랫폼을 신규 구축한다.
- 기능: authentication, identity_verification, social_login, product_catalog, reservation, scheduling_calendar, matching, payment, subscription_billing, settlement, admin_dashboard, user_management, cms, approval_workflow, order_management, app_store_release, notification_push
- 연동: payment_gateway, identity_verification_service, kakao_login, naver_login, google_login, apple_login
- 플랫폼: web, admin_web, cross_platform_app, backend_api · 기술: frontend, backend, database, authentication, payment, cross_platform_mobile, ui_design, project_management, security
- 추천 스택: Next.js, TypeScript, Supabase, Expo(React Native), Tailwind, 토스페이먼츠, Vercel
- 점수: 난이도 62 · 시간 700~1200h · 학습 70 · 재사용 60 · 시장 62 · 위험 60 · 명확성 40
- 근거:
  - vibe_coding_difficulty: 웹·앱·관리자에 정기결제, 지분 거래, 정산이 겹쳐 난이도가 높다.
  - estimated_hours: 3개 클라이언트와 PG, 본인인증, 정산, 2차 마켓까지 범위가 커서 700~1200시간.
  - learning_value: 결제, 정기과금, 예약 엔진, 앱 배포 경험을 얻는다.
  - reusability_value: 예약, 결제, 관리자 모듈은 재사용되지만 지분 거래는 도메인 특화다.
  - market_value: 예약·결제·마켓 조합은 반복되나 회원권 지분 거래는 틈새다.
  - technical_risk: 지분 거래의 법적 요건, 정산 정확성, 아이디어 단계의 불확실성이 있다.
- 토큰: in 8 / out 3517 · $0.0781

### 2. [freemoa:48011] [신규/임베디드] Raspberry Pi 센서 연동 프로토타입 개발

- 예산: 5,000,000원 ~ 7,000,000원 · 기간: 30일
- 분류: **iot_device** (실제 물리 장치(센서/장비/프린터/락커/키오스크/주변기기/산업장비)와의 통신·제어가 핵심인 시스템) / 라즈베리파이 센서 프로토타입 · new_build · general · reuse low
- complexity_types: hardware_iot · technology_assets: hardware_iot, data_pipeline
- 요약: Raspberry Pi에 센서 2~3종을 연동해 데이터를 수집·처리하고 BCS 기초 분석 결과를 출력하는 임베디드 프로토타입을 신규 개발한다.
- 기능: hardware_integration, iot_device_control, data_pipeline
- 연동: hardware_device
- 플랫폼: embedded · 기술: embedded, backend
- 추천 스택: Raspberry Pi OS, Python, GPIO/I2C/SPI libraries, SQLite
- 점수: 난이도 58 · 시간 60~130h · 학습 45 · 재사용 30 · 시장 40 · 위험 55 · 명확성 40
- 근거:
  - vibe_coding_difficulty: 실센서 연동과 하드웨어 검증이 필요하고 BCS 정의가 불명확함
  - estimated_hours: 센서 2~3종 연동, 통합, 기초 분석까지 약 60~130시간
  - learning_value: 센서·GPIO 경험은 쌓이나 범용 확장성은 제한적
  - reusability_value: 센서 드라이버 코드는 일부만 재사용 가능
  - market_value: RPi 프로토타입 의뢰는 있으나 센서마다 달라 반복성 보통
  - technical_risk: 센서 미확정, 하드웨어 불량 가능성, BCS 모호함
- 토큰: in 12 / out 4601 · $0.0940

### 3. [freemoa:47955] (상주) 커스텀 Android 단말 및 기본 탑재 앱 QA엔지니어

- 예산: 4,000,000원 ~ 5,000,000원 · 기간: 30일
- 분류: **qa_testing** (QA/테스트/테스트 자동화/앱·웹 검수/품질보증/테스트 엔지니어 투입) / Android 단말 앱 QA · staffing · general · reuse low
- complexity_types: hardware_iot · technology_assets: hardware_iot
- 요약: 자사 커스텀 AOSP 기반 Android 단말의 기본 탑재 앱(런처, VoIP, 업데이터 등)에 대해 TC 작성, 테스트 수행, 이슈 공유를 하는 1개월 강남 상주 QA 인력 투입.
- 기능: bug_fix_maintenance
- 연동: hardware_device
- 플랫폼: android · 기술: qa_testing, mobile_native
- 추천 스택: Android Studio, ADB, Appium, Jira
- 점수: 난이도 40 · 시간 150~180h · 학습 35 · 재사용 25 · 시장 45 · 위험 30 · 명확성 65
- 근거:
  - vibe_coding_difficulty: 실기기 수동 QA 중심이라 AI 활용 여지가 제한적이다.
  - estimated_hours: 약 1개월 주5일 상주 기준 150~180시간이다.
  - learning_value: AOSP 단말 QA 경험은 있으나 코드 자산은 적다.
  - reusability_value: TC 작성 방법은 재사용되나 대상이 자사 단말에 한정된다.
  - market_value: 모바일 앱 QA 수요는 있으나 상주 단기 건이다.
  - technical_risk: 단말과 앱이 미완성 상태라 일정 변동 위험이 있다.
- 토큰: in 12 / out 4169 · $0.0653

### 4. [freemoa:48311] [상주] PLM/BOM 고도화 개발 (Java/Vue3/Tibero)

- 예산: 5,000,000원 ~ 10,000,000원 · 기간: 120일
- 분류: **business_management** (사내 업무관리/ERP/그룹웨어/MES) / PLM/BOM 시스템 · staffing · manufacturing · reuse low
- complexity_types: workflow_complex, legacy_heavy · technology_assets: core_web, backend_api, database, legacy_enterprise
- 요약: 제조 고객사의 PLM/BOM 시스템 고도화를 위해 화성 현장에 상주하며 BOM 분석·설계와 Java/Vue3/Tibero 기반 개발을 수행하는 기간제 인력 투입 프로젝트.
- 기능: admin_dashboard, role_permission, approval_workflow, data_export, legacy_migration
- 연동: -
- 플랫폼: web, admin_web, backend_api · 기술: backend, frontend, database, legacy_tech, project_management
- 추천 스택: Java, Spring, Vue3, Tibero, JavaScript
- 점수: 난이도 60 · 시간 600~900h · 학습 35 · 재사용 25 · 시장 40 · 위험 50 · 명확성 35
- 근거:
  - vibe_coding_difficulty: 고객사 BOM 도메인과 기존 시스템 의존, 상주 환경이라 어렵다.
  - estimated_hours: 4개월 상주 중 개발 1명 분량을 범위 불명확한 채 추정.
  - learning_value: PLM/BOM 도메인과 Tibero는 배우지만 범용성은 제한적이다.
  - reusability_value: 고객사 업무 흐름과 기존 시스템에 종속되어 재사용이 낮다.
  - market_value: 제조 PLM/BOM 상주 수요는 있으나 특수 도메인이다.
  - technical_risk: 요구 범위가 모호하고 고객 협의·기존 시스템 불확실성이 있다.
- 토큰: in 12 / out 5220 · $0.0767

### 5. [freemoa:47704] 크리에이터 주요 지표 분석 시각화 제공 플랫폼 웹 개발

- 예산: 10,000,000원 ~ 20,000,000원 · 기간: 60일
- 분류: **data_dashboard** (BI/통계/대시보드/데이터 분석) / 크리에이터 지표 분석 · new_build · media_content · reuse medium
- complexity_types: standard_crud, integration_heavy · technology_assets: core_web, backend_api, database, authentication_authorization, admin_system, analytics_dashboard, external_api_integration, cloud_infra
- 요약: 브랜드·광고주·에이전시를 위해 유튜브 크리에이터 채널 지표를 시각화·비교하는 분석 웹 서비스와 관리자 백오피스, 백엔드를 신규 구축한다. 데이터 수집·가공은 내부 개발자가 담당하고 외주는 API 연동 UI와 서버를 맡는다.
- 기능: authentication, social_login, user_management, admin_dashboard, statistics_reporting, search_filter, cms, subscription_billing, payment, role_permission, board_community
- 연동: google_login, payment_gateway
- 플랫폼: web, mobile_web, admin_web, backend_api · 기술: frontend, backend, database, authentication, devops_infra
- 추천 스택: Next.js, TypeScript, NestJS, PostgreSQL, Tailwind, Recharts, GCP Cloud Run
- 점수: 난이도 38 · 시간 280~450h · 학습 50 · 재사용 60 · 시장 68 · 위험 32 · 명확성 75
- 근거:
  - vibe_coding_difficulty: 표준 CRUD·차트 UI 중심이며 내부 API 연동 의존이 있음.
  - estimated_hours: 사용자 웹, 백오피스, 백엔드, API 연동을 합쳐 약 280~450시간.
  - learning_value: 대시보드 시각화와 NestJS/GCP 경험은 유용하나 새로운 개념은 적음.
  - reusability_value: 인증·어드민·차트 대시보드 구조는 다른 프로젝트에 재사용 가능.
  - market_value: 분석 대시보드와 백오피스 조합은 외주 시장에서 반복적으로 나옴.
  - technical_risk: 내부 API 지연과 결제 범위 미확정이 위험하나 기술은 주류임.
- 토큰: in 6 / out 1267 · $0.0290

### 6. [freemoa:47969] OpenClaw 설치 및 증권 HTS API 연동 설정 작업

- 예산: 300,000원 ~ 800,000원 · 기간: 2일
- 분류: **automation_rpa** (브라우저 자동화/RPA/업무 자동화 프로그램) / 증권 API 환경 설정 · new_build · finance · reuse low
- complexity_types: integration_heavy · technology_assets: external_api_integration
- 요약: Windows 11 PC에 OpenClaw를 설치하고 증권사 HTS OpenAPI를 연동해 기본 데이터 수신을 확인하는 원격 설정 작업. 자동매매 로직 개발은 범위에 없다.
- 기능: data_pipeline
- 연동: -
- 플랫폼: desktop · 기술: backend
- 추천 스택: Python, Windows 11, 증권사 OpenAPI
- 점수: 난이도 25 · 시간 6~16h · 학습 25 · 재사용 22 · 시장 35 · 위험 35 · 명확성 55
- 근거:
  - vibe_coding_difficulty: 설치·설정 중심이나 증권사 API와 원격 환경 이슈가 있음.
  - estimated_hours: 설치, 연동 설정, 테스트, 사용 안내까지 1~2일 분량.
  - learning_value: 증권 OpenAPI 연동 경험은 쌓이나 코드 자산은 적음.
  - reusability_value: 특정 PC 환경 설정 위주라 코드 재사용은 제한적.
  - market_value: 증권 API 환경 설정 수요는 있으나 틈새 영역임.
  - technical_risk: OpenClaw와 증권사 API의 호환성, 인증서·계정 의존이 있음.
- 토큰: in 6 / out 1450 · $0.0259

### 7. [freemoa:48169] [도급/상주] 영어교육 플랫폼 차세대 아키텍처 전환 개발

- 예산: 100,000,000원 ~ 200,000,000원 · 기간: 180일
- 분류: **saas** (SaaS 제품 (다수 고객사 대상 구독형 서비스)) / 영어교육 LMS 재구축 · renewal · education · reuse medium
- complexity_types: legacy_heavy, integration_heavy, workflow_complex · technology_assets: core_web, backend_api, database, authentication_authorization, admin_system, saas_architecture, ai_llm, speech_audio_ai, external_api_integration, data_pipeline, security, legacy_enterprise
- 요약: PHP·그누보드 기반 운영 중인 영어교육 플랫폼(ELP/LEMS)을 Next.js·NestJS·PostgreSQL 기반 멀티테넌트 구조로 전면 재구축하고 데이터를 마이그레이션한다. GPT/STT/TTS 연동과 관리자 시스템을 포함한다.
- 기능: authentication, role_permission, admin_dashboard, user_management, statistics_reporting, board_community, file_upload, llm_generation, speech_processing, legacy_migration, data_pipeline, security_hardening, infra_devops, scheduling_calendar, search_filter
- 연동: openai, hardware_device
- 플랫폼: web, admin_web, backend_api · 기술: frontend, backend, database, authentication, llm_integration, devops_infra, data_engineering, legacy_tech, security
- 추천 스택: Next.js, NestJS, TypeScript, PostgreSQL, Redis, BullMQ, OpenAI API
- 점수: 난이도 65 · 시간 1400~2400h · 학습 70 · 재사용 55 · 시장 55 · 위험 65 · 명확성 55
- 근거:
  - vibe_coding_difficulty: 기존 기능 전수 재구축, 데이터 마이그레이션, 멀티테넌트, 5천 동시접속 설계로 난도 높음.
  - estimated_hours: ELP·LEMS 전체 재구축과 DB 이전, AI 연동, 인프라 포함해 대규모 범위.
  - learning_value: 멀티테넌트, 큐/워커, DB 마이그레이션, AI 연동 구조 등 재사용 가능한 역량 많음.
  - reusability_value: 인증·RBAC·멀티테넌트·Adapter 구조는 재사용 가능하나 교육 도메인 로직은 특화.
  - market_value: LMS·SaaS 재구축은 반복되나 대규모 도급·상주 조건은 제한적.
  - technical_risk: RFP 미공개, 레거시 데이터 정합성, 카페24 인프라 한계와 동시접속 요구가 위험.
- 토큰: in 10 / out 4945 · $0.0791

### 8. [wishket:158096] 글로벌 B2B 쇼핑몰 신규 구축 (WordPress + WooCommerce)

- 예산: 15,000,000원 · 기간: 90일
- 분류: **ecommerce** (쇼핑몰/커머스) / 글로벌 B2B 쇼핑몰 · new_build · commerce · reuse medium
- complexity_types: standard_crud, integration_heavy · technology_assets: core_web, backend_api, database, authentication_authorization, admin_system, external_api_integration, cloud_infra, security
- 요약: 해외 바이어 대상 B2B 쇼핑몰을 WordPress+WooCommerce로 신규 구축한다. 상품 DB 설계, 패싯 필터, B2B 회원 승인·가격 제어, 견적 요청, SEO, 인프라와 운영 교육을 포함한다.
- 기능: authentication, user_management, role_permission, admin_dashboard, product_catalog, search_filter, cart_checkout, order_management, payment, seo, multilingual, data_export, statistics_reporting, notification_email, cms, infra_devops, document_generation
- 연동: shopping_platform, google_workspace
- 플랫폼: web, mobile_web, admin_web · 기술: frontend, backend, database, ui_design, devops_infra, project_management
- 추천 스택: WordPress, WooCommerce, FacetWP, ACF, Cloudflare, Elementor
- 점수: 난이도 35 · 시간 220~360h · 학습 40 · 재사용 60 · 시장 80 · 위험 35 · 명확성 75
- 근거:
  - vibe_coding_difficulty: 플러그인 중심 WooCommerce 구축이나 B2B 가격·필터·인프라 범위가 넓음
  - estimated_hours: 기획·디자인·개발·인프라·QA·교육까지 포함해 220~360시간
  - learning_value: WooCommerce B2B와 SEO 경험은 쌓이나 신기술은 적음
  - reusability_value: Child Theme, 플러그인, B2B 가격 구조를 다른 쇼핑몰에 재사용 가능
  - market_value: WooCommerce B2B 쇼핑몰 구축은 외주에서 반복 수요가 많음
  - technical_risk: 해외 PG 제한과 플러그인 충돌이 있으나 검증된 스택임
- 토큰: in 10 / out 3944 · $0.0705

### 9. [wishket:155100] WordPress 기반 글로벌 B2B 홈페이지 신규 구축

- 예산: 12,000,000원 · 기간: 60일
- 분류: **website** (기업/브랜드 홈페이지, 랜딩) / 글로벌 B2B 다국어 홈페이지 · new_build · manufacturing · reuse high
- complexity_types: standard_crud · technology_assets: core_web, backend_api, database, admin_system
- 요약: 사막 생태계 복원 기술 기업의 해외 영업용 B2B 홈페이지를 WordPress 커스텀 테마와 WPML로 구축한다. 영어·한국어·아랍어(RTL) 다국어를 지원하고 향후 프랑스어로 확장 가능해야 한다.
- 기능: cms, landing_page, multilingual, admin_dashboard, seo, product_catalog, file_upload
- 연동: -
- 플랫폼: web, mobile_web, admin_web · 기술: frontend, backend, ui_design
- 추천 스택: WordPress, WPML, PHP, ACF, Tailwind, GA4
- 점수: 난이도 22 · 시간 120~200h · 학습 35 · 재사용 65 · 시장 75 · 위험 20 · 명확성 72
- 근거:
  - vibe_coding_difficulty: WordPress 커스텀 테마와 WPML 설정 중심이라 표준 수준이며 RTL 대응이 추가된다.
  - estimated_hours: 약 14페이지 커스텀 테마, 다국어, RTL, 배포를 합쳐 120~200시간으로 본다.
  - learning_value: WPML과 RTL 경험은 얻지만 기술 자체는 흔하다.
  - reusability_value: 커스텀 테마와 다국어 구조를 다른 B2B 사이트에 재사용할 수 있다.
  - market_value: WordPress 다국어 기업 사이트는 반복 수요가 많다.
  - technical_risk: 위험은 낮다. 수출바우처 조건과 아랍어 번역 일정이 변수다.
- 토큰: in 10 / out 4229 · $0.0737

### 10. [wishket:156240] Supabase 기반 사용자 게시판 및 관리자/광고주 대시보드 구축

- 예산: 15,000,000원 · 기간: 60일
- 분류: **platform_marketplace** (중개/매칭/마켓플레이스/커뮤니티 플랫폼) / 커뮤니티·광고 플랫폼 · new_build · general · reuse medium
- complexity_types: workflow_complex, multi_platform · technology_assets: core_web, backend_api, database, authentication_authorization, admin_system, analytics_dashboard, ai_llm, cloud_infra, security
- 요약: Flutter 앱 웹뷰에 연동되는 커뮤니티 게시판과 자체 광고 캠페인 시스템, 관리자·광고주 대시보드를 Supabase 기반으로 신규 구축한다.
- 기능: authentication, role_permission, user_management, admin_dashboard, board_community, comments_reviews, file_upload, cms, statistics_reporting, data_export, llm_generation, seo, approval_workflow, scheduling_calendar
- 연동: supabase, openai
- 플랫폼: web, admin_web, mobile_web · 기술: frontend, backend, database, authentication, ui_design
- 추천 스택: Next.js, TypeScript, Supabase, MUI, Tailwind, Vercel
- 점수: 난이도 42 · 시간 280~420h · 학습 60 · 재사용 65 · 시장 65 · 위험 35 · 명확성 72
- 근거:
  - vibe_coding_difficulty: 표준 CRUD 중심이나 광고 트래킹 배치, 권한, 웹뷰 연동이 있음
  - estimated_hours: 게시판, 광고, 어드민, 통계, 디자인, QA까지 범위가 넓음
  - learning_value: Supabase RLS, Edge Functions, 광고 트래킹을 익힐 수 있음
  - reusability_value: 권한, 게시판, 어드민 구조는 재사용할 수 있으나 광고 로직은 특화됨
  - market_value: Supabase 기반 커뮤니티·어드민 개발은 반복 수요가 많음
  - technical_risk: 트래킹 부하와 웹뷰 연동 외에는 검증된 기술임
- 토큰: in 10 / out 3911 · $0.0638

### 11. [wishket:158628] React/Spring Boot 기반 대기업 PG 백오피스 풀스택 개발

- 예산: 6,000,000원/월 · 기간: 225일
- 분류: **fintech_payment** (PG/선불/결제 인프라/핀테크 시스템) / PG 백오피스 정산 · staffing · finance · reuse low
- complexity_types: high_risk_domain, workflow_complex · technology_assets: core_web, backend_api, database, admin_system, data_pipeline, legacy_enterprise
- 요약: 대기업 차세대 PG 시스템 재구축의 백오피스(정산 포함) 웹을 React/Spring Boot/Oracle로 개발하는 상주 기간제 인력 투입 프로젝트.
- 기능: admin_dashboard, settlement, role_permission, statistics_reporting, data_export, payment
- 연동: -
- 플랫폼: admin_web, backend_api · 기술: frontend, backend, database, payment, legacy_tech
- 추천 스택: React, Spring Boot, Spring Batch, Oracle, IBSheet
- 점수: 난이도 62 · 시간 900~1300h · 학습 45 · 재사용 35 · 시장 55 · 위험 50 · 명확성 35
- 근거:
  - vibe_coding_difficulty: 대기업 PG 정산, 상주, 대형 조직 환경이라 어렵다.
  - estimated_hours: 약 7개월 상주 1인 분량으로 추정했다.
  - learning_value: Spring Batch 정산 경험은 유용하나 IBSheet 등 레거시 요소가 많다.
  - reusability_value: 기업 전용 업무 흐름이라 재사용이 제한적이다.
  - market_value: SI형 PG/정산 백오피스 수요는 꾸준하다.
  - technical_risk: 정산 정확성 요구와 발주처 의존이 있다.
- 토큰: in 12 / out 5001 · $0.0759

### 12. [wishket:154821] RPA 기반 대기업 업무 프로세스 자동화 개발 및 운영 지원

- 예산: 5,500,000원/월 · 기간: 150일
- 분류: **automation_rpa** (브라우저 자동화/RPA/업무 자동화 프로그램) / 대기업 RPA 개발·운영 · staffing · manufacturing · reuse low
- complexity_types: legacy_heavy, integration_heavy · technology_assets: workflow_automation, browser_automation, analytics_dashboard, legacy_enterprise
- 요약: LS그룹에 상주하며 기존 RPA 시스템을 운영·개선하고 업무 자동화 프로세스를 설계·개발하는 기간제 인력 투입 프로젝트입니다.
- 기능: approval_workflow, bug_fix_maintenance, statistics_reporting, document_generation
- 연동: erp_external
- 플랫폼: desktop, web · 기술: backend, legacy_tech, project_management
- 추천 스택: UiPath, Power Automate, PowerApps, Power BI, Python
- 점수: 난이도 50 · 시간 700~850h · 학습 45 · 재사용 35 · 시장 60 · 위험 35 · 명확성 35
- 근거:
  - vibe_coding_difficulty: UiPath 등 로우코드 도구와 기존 RPA 시스템 의존, 상주 환경.
  - estimated_hours: 4.5개월 상주 1인 기준 약 700~850시간.
  - learning_value: RPA·Power Platform 경험은 쌓이나 기업 환경 종속적.
  - reusability_value: 기업 내부 업무 흐름 중심이라 코드 재사용은 제한적.
  - market_value: RPA·업무 자동화 수요는 꾸준하나 상주형 위주.
  - technical_risk: 기존 시스템 불확실성은 있으나 기술 자체는 검증됨.
- 토큰: in 8 / out 2251 · $0.0379

### 13. [wishket:153028] 클라우드 기반 전자차트 SaaS 플랫폼 MVP 개발

- 예산: 40,000,000원 · 기간: 170일
- 분류: **saas** (SaaS 제품 (다수 고객사 대상 구독형 서비스)) / 뷰티샵 전자차트 SaaS · new_build · other · reuse medium
- complexity_types: standard_crud, multi_platform · technology_assets: core_web, backend_api, database, authentication_authorization, admin_system, saas_architecture, mobile, analytics_dashboard, cloud_infra
- 요약: 뷰티샵을 대상으로 고객·시술 전자차트, 사진, 예약, 통계를 관리하는 클라우드 SaaS의 MVP를 관리자 웹과 태블릿/모바일 앱으로 신규 구축한다.
- 기능: authentication, role_permission, user_management, admin_dashboard, file_upload, reservation, scheduling_calendar, e_signature, statistics_reporting, crm, document_generation
- 연동: -
- 플랫폼: web, admin_web, ios, android · 기술: frontend, backend, database, authentication, cross_platform_mobile, ui_design, devops_infra, project_management
- 추천 스택: Next.js, TypeScript, Supabase, Expo (React Native), Tailwind, Vercel
- 점수: 난이도 42 · 시간 400~650h · 학습 60 · 재사용 68 · 시장 70 · 위험 35 · 명확성 50
- 근거:
  - vibe_coding_difficulty: CRUD 중심이나 웹+앱, 서명·사진 관리가 포함됨
  - estimated_hours: 기획·디자인·웹·앱·인프라·문서 산출물까지 포함한 범위
  - learning_value: SaaS 멀티테넌시와 앱 배포 경험을 쌓을 수 있음
  - reusability_value: 인증·권한·예약·CRUD 구조를 다른 SaaS에 재사용 가능
  - market_value: 업종별 예약·차트 SaaS 수요가 반복적임
  - technical_risk: 정부지원사업 선정 여부가 불확실하고 민감정보 이슈가 있음
- 토큰: in 14 / out 6453 · $0.0991

### 14. [wishket:150086] 쿠팡 API 연동 제품 판매량 및 재고 추적 자동화 (Excel VBA)

- 예산: 1,000,000원 · 기간: 5일
- 분류: **automation_rpa** (브라우저 자동화/RPA/업무 자동화 프로그램) / 쿠팡 재고 엑셀 자동화 · new_build · commerce · reuse medium
- complexity_types: standard_crud · technology_assets: external_api_integration, workflow_automation
- 요약: 쿠팡 로켓그로스 API로 제품별 현재 재고를 조회하고 전일 대비 판매량을 계산해 시트에 누적 기록하는 Excel VBA 자동화 도구를 만든다. 셀러의 수동 재고/판매 관리 업무 대체가 목적이다.
- 기능: data_pipeline, inventory_management, statistics_reporting
- 연동: marketplace_api
- 플랫폼: desktop · 기술: backend, legacy_tech
- 추천 스택: Excel VBA, Coupang Open API, VBA-JSON
- 점수: 난이도 25 · 시간 16~32h · 학습 25 · 재사용 45 · 시장 60 · 위험 30 · 명확성 65
- 근거:
  - vibe_coding_difficulty: VBA와 단일 API 조회·차감 계산 중심의 단순 구조.
  - estimated_hours: 시트 설계, HMAC 인증 호출, 누적 기록, 테스트로 16~32시간.
  - learning_value: VBA는 쇠퇴 기술이나 쿠팡 API 인증 경험은 남음.
  - reusability_value: 쿠팡 API 호출·HMAC 서명 로직은 재사용 가능하나 VBA 종속.
  - market_value: 셀러 대상 엑셀 자동화 수요는 꾸준히 반복됨.
  - technical_risk: 쿠팡 API 키 발급과 재고 엔드포인트 적합성이 불확실함.
- 토큰: in 6 / out 1125 · $0.0248

### 15. [wishket:157477] EMS 연동 피크제어 및 Auto-DR 서버 백엔드 개발

- 예산: 5,000,000원 · 기간: 60일
- 분류: **iot_device** (실제 물리 장치(센서/장비/프린터/락커/키오스크/주변기기/산업장비)와의 통신·제어가 핵심인 시스템) / 피크제어·Auto-DR 서버 · new_build · other · reuse low
- complexity_types: hardware_iot, integration_heavy, algorithmic_specialized · technology_assets: backend_api, database, hardware_iot, external_api_integration, data_pipeline
- 요약: 기존 EMS와 연동해 Modbus로 피크제어 대상 설비를 모니터링·제어하고 OpenADR 2.0b 기반 Auto-DR, 단계별 부하 차단, ESS/태양광 제어, 이행률 정산을 처리하는 Python 비동기 백엔드 서버를 구축한다.
- 기능: hardware_integration, iot_device_control, data_pipeline, notification_email, statistics_reporting, public_api, scheduling_calendar, document_generation, infra_devops
- 연동: hardware_device, public_data_api, erp_external
- 플랫폼: backend_api · 기술: backend, database, devops_infra, data_engineering
- 추천 스택: Python, FastAPI, AsyncIO, PostgreSQL, pymodbus, Docker
- 점수: 난이도 68 · 시간 220~400h · 학습 60 · 재사용 35 · 시장 35 · 위험 70 · 명확성 55
- 근거:
  - vibe_coding_difficulty: Modbus 실설비 제어와 OpenADR 규격, 예측·제어 로직으로 검증이 어렵다.
  - estimated_hours: 5개 기능군에 설비 연동·테스트·인프라 구성까지 포함해 산정.
  - learning_value: OpenADR·Modbus·에너지 제어는 배울 가치가 있으나 틈새 도메인이다.
  - reusability_value: Modbus 수집 모듈 등 일부만 재사용되고 대부분 고객 설비에 종속된다.
  - market_value: 에너지 DR 영역은 수요가 있으나 반복성은 낮은 편이다.
  - technical_risk: 실설비 의존, 기존 EMS 스키마 불확실, 예산 대비 범위가 커서 위험이 높다.
- 토큰: in 22 / out 11086 · $0.1489

### 16. [wishket:149922] Sharetribe 기반 숙박 예약 플랫폼 결제/정산 기능 개발

- 예산: 5,000,000원 · 기간: 30일
- 분류: **platform_marketplace** (중개/매칭/마켓플레이스/커뮤니티 플랫폼) / 숙박 예약 마켓플레이스 · feature_extension · travel_hospitality · reuse medium
- complexity_types: integration_heavy, high_risk_domain · technology_assets: core_web, backend_api, payments, external_api_integration, database
- 요약: Sharetribe Pro 기반 한일 숙박 예약 플랫폼에 신규 PG 연동 결제·자동 정산, iCal 캘린더 동기화·차단일, 고객 문의 기능을 추가한다.
- 기능: payment, settlement, admin_dashboard, scheduling_calendar, reservation, board_community, statistics_reporting
- 연동: payment_gateway
- 플랫폼: web, admin_web · 기술: frontend, backend, payment, database
- 추천 스택: Sharetribe Flex SDK, Next.js, TypeScript, Node.js, PostgreSQL
- 점수: 난이도 58 · 시간 130~230h · 학습 60 · 재사용 50 · 시장 55 · 위험 65 · 명확성 55
- 근거:
  - vibe_coding_difficulty: Sharetribe 제약 속 해외 PG·정산·iCal 동기화 통합이 어렵다.
  - estimated_hours: 결제·정산, iCal, 문의, 관리자 화면까지 범위가 넓다.
  - learning_value: 크로스보더 결제·정산과 iCal 동기화 경험을 쌓는다.
  - reusability_value: iCal 동기화·정산 모듈은 재사용 가능하나 Sharetribe에 종속된다.
  - market_value: 예약 플랫폼 결제·정산은 반복 수요가 있으나 Sharetribe 한정이다.
  - technical_risk: PG 선정·정산 방식 미확정, Sharetribe 결제 구조 제약이 위험이다.
- 토큰: in 6 / out 1162 · $0.0269

### 17. [wishket:152942] Nest.js/AWS 기반 AI튜터 앱 백엔드 개발 (주 20시간 재택)

- 예산: 3,000,000원/월 · 기간: 360일
- 분류: **mobile_app** (iOS/Android 앱이 결과물의 중심) / AI튜터 앱 백엔드 · staffing · education · reuse low
- complexity_types: legacy_heavy · technology_assets: backend_api, database, cloud_infra, legacy_enterprise
- 요약: 출시된 AI튜터 모바일 앱의 Nest.js/AWS 백엔드를 주 20시간 재택으로 유지관리하고 신규 기능을 개발하는 시니어 백엔드 인력 투입 건.
- 기능: bug_fix_maintenance, user_management, authentication, infra_devops
- 연동: aws
- 플랫폼: backend_api · 기술: backend, database, devops_infra
- 추천 스택: NestJS, TypeScript, AWS, MongoDB, MariaDB
- 점수: 난이도 50 · 시간 900~1100h · 학습 35 · 재사용 30 · 시장 60 · 위험 40 · 명확성 40
- 근거:
  - vibe_coding_difficulty: 기존 코드 분석과 운영 이슈 대응이 중심이라 중간 난이도.
  - estimated_hours: 주 20시간씩 약 52주 기준으로 추정.
  - learning_value: NestJS/AWS 운영 경험은 쌓이나 신규 기술 학습은 제한적.
  - reusability_value: 기존 서비스 종속 코드라 재사용은 제한적.
  - market_value: NestJS/AWS 백엔드 유지보수 인력 수요는 꾸준함.
  - technical_risk: 기존 시스템 상태와 범위가 불명확해 위험이 있음.
- 토큰: in 10 / out 3334 · $0.0531

### 18. [wishket:157967] C#.Net WPF 기반 키오스크 배리어프리 기능 추가 개발

- 예산: 3,000,000원/월 · 기간: 90일
- 분류: **iot_device** (실제 물리 장치(센서/장비/프린터/락커/키오스크/주변기기/산업장비)와의 통신·제어가 핵심인 시스템) / 키오스크 배리어프리 · staffing · general · reuse low
- complexity_types: legacy_heavy, hardware_iot · technology_assets: legacy_enterprise, hardware_iot
- 판단 애매: project_type
- 요약: 부산 상주로 기존 C# WPF 키오스크 시스템 소스를 분석해 기획·디자인된 배리어프리 기능과 화면을 추가 개발하는 기간제 인력 투입 건.
- 기능: hardware_integration, legacy_migration
- 연동: hardware_device
- 플랫폼: desktop · 기술: desktop_app, legacy_tech, frontend
- 추천 스택: C#, .NET, WPF
- 점수: 난이도 55 · 시간 400~520h · 학습 35 · 재사용 25 · 시장 35 · 위험 45 · 명확성 50
- 근거:
  - vibe_coding_difficulty: 기존 WPF 키오스크 코드 분석과 상주 환경, 장비 연동 가능성.
  - estimated_hours: 3개월 상주 1명 기준, 화면 개발 중심으로 추정.
  - learning_value: WPF 키오스크와 접근성 경험은 있으나 범위가 좁음.
  - reusability_value: 특정 기업 레거시 코드에 종속되어 재사용 제한적.
  - market_value: 키오스크 접근성 수요는 있으나 WPF 상주는 틈새.
  - technical_risk: 기존 코드 품질과 장비 연동 범위가 불확실.
- 토큰: in 8 / out 2191 · $0.0379

### 19. [wishket:150884] Nest.js/React 기반 회계/인사 ERP 시스템 기능 개선

- 예산: 6,000,000원 · 기간: 30일
- 분류: **business_management** (사내 업무관리/ERP/그룹웨어/MES) / 회계/인사 ERP 급여대장 · feature_extension · professional_services · reuse low
- complexity_types: legacy_heavy, high_risk_domain, workflow_complex · technology_assets: core_web, backend_api, database, admin_system, legacy_enterprise
- 요약: 운영 중인 Nest.js/React 기반 회계·인사·노무 ERP의 급여대장(근로소득자) 로직을 개선하고 연봉 테이블 기능을 신설한다. 기존 소스 분석 후 기획·디자인·개발·QA까지 수행한다.
- 기능: admin_dashboard, hr_attendance, accounting, user_management, bug_fix_maintenance
- 연동: -
- 플랫폼: web, admin_web · 기술: frontend, backend, database, legacy_tech
- 추천 스택: NestJS, React, TypeScript, PostgreSQL, Redis, Tailwind CSS
- 점수: 난이도 58 · 시간 100~180h · 학습 45 · 재사용 35 · 시장 55 · 위험 55 · 명확성 65
- 근거:
  - vibe_coding_difficulty: 타인 소스 분석과 급여·4대보험 계산 정확성 검증이 필요하다.
  - estimated_hours: 연봉테이블 신설, 일할계산, 퇴사자 처리, 기획·QA 포함 약 100~180시간.
  - learning_value: 급여 계산 로직은 배우나 특정 시스템 중심이다.
  - reusability_value: 급여 계산 개념은 쓰지만 코드는 기존 ERP에 종속된다.
  - market_value: ERP/급여 기능 개선 수요는 꾸준하나 도메인 특화다.
  - technical_risk: 급여 오계산 위험과 기존 코드 품질 불확실성이 있다.
- 토큰: in 6 / out 1152 · $0.0283

### 20. [wishket:153015] AI 기반 사용자 맞춤형 디지털 복지 앱 구축

- 예산: 20,000,000원 · 기간: 180일
- 분류: **platform_marketplace** (중개/매칭/마켓플레이스/커뮤니티 플랫폼) / AI 복지 정보·상담 앱 · new_build · public_sector · reuse medium
- complexity_types: multi_platform, integration_heavy · technology_assets: mobile, backend_api, database, admin_system, ai_llm, authentication_authorization, external_api_integration, core_web
- 판단 애매: project_type
- 요약: 복지 정책·시설·행사 정보를 제공하고 AI로 위치 기반 추천과 금융·법률·복지 연계 로드맵을 제시하며 예약·상담 신청까지 지원하는 iOS/Android 앱과 관리자 웹을 기획부터 구축한다.
- 기능: authentication, user_management, product_catalog, search_filter, map_location, llm_generation, recommendation, reservation, admin_dashboard, cms, statistics_reporting, notification_push, app_store_release
- 연동: public_data_api, kakao_map, openai, push_service
- 플랫폼: cross_platform_app, admin_web, backend_api · 기술: cross_platform_mobile, backend, frontend, database, llm_integration, ui_design, project_management
- 추천 스택: Expo(React Native), Next.js, TypeScript, Supabase, OpenAI API, Vercel
- 점수: 난이도 42 · 시간 280~480h · 학습 55 · 재사용 55 · 시장 60 · 위험 40 · 명확성 40
- 근거:
  - vibe_coding_difficulty: 앱+관리자+AI 추천·위치 연동이나 대부분 표준 구성이다.
  - estimated_hours: 기획·디자인·앱·백엔드·관리자 전 범위로 280~480시간.
  - learning_value: LBS, LLM 추천, 앱 배포 경험을 쌓을 수 있다.
  - reusability_value: 인증·관리자·예약·지도 모듈은 재사용 가능하나 도메인 특화다.
  - market_value: 정보 제공+예약 매칭 앱은 반복적으로 나오는 유형이다.
  - technical_risk: 정부과제 선정 조건부이고 공공데이터와 AI 품질이 불확실하다.
- 토큰: in 10 / out 3878 · $0.0619

## 분포

- vibe_coding_difficulty: 평균 48 / 중앙 50 / 범위 22~68
- estimated_hours_max: 평균 600 / 중앙 450 / 범위 16~2400
- learning_value: 평균 47 / 중앙 45 / 범위 25~70
- reusability_value: 평균 44 / 중앙 45 / 범위 22~68
- market_value: 평균 56 / 중앙 60 / 범위 35~80

## 권장 어휘 밖 코드 (다음 버전 taxonomy 후보)

- features: 없음
- integrations: 없음
- skills: 없음
