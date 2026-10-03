# Analyzer v3.1 분석 리포트

- 생성: 2026-10-03T03:30:27.274Z
- 모델: `claude-sonnet-5-5` (mode: sync)
- 비고: backend=claude-cli (claude -p, Claude 구독제). 비용은 API 단가 환산 추정치이며 실제 청구되지 않음 (구독 사용량 한도에 반영)
- 결과: 성공 20 / 실패 0 / 전체 20
- 토큰: input 160 · output 51,583 · cache write 108,823 · cache read 739,615
- 비용: $0.9361 (건당 $0.0468)

## 전체 5,287건 분석 비용 추정 (건당 평균 in 42430 / out 2579 토큰 기준)

| 모델 | 동기 호출 | Batch API (50% 할인) |
|---|---|---|
| claude-opus-5-5 | $1170.03 | $585.01 |
| claude-sonnet-5-5 (이번 실행) | $585.01 | $292.51 |
| claude-haiku-4-5 | $292.51 | $146.25 |

※ 다른 모델 행은 같은 토큰 수를 가정한 단순 환산입니다. 모델마다 사고(thinking)·출력 길이가 달라 실제 비용은 다를 수 있습니다.

## 프로젝트별 분류

| # | 제목 | 예산 | project_type | engagement | industry | complexity_types | reuse | technology_assets | 난이도 | 예상시간 | 학습 | 재사용 | 시장 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | .NET 기반 기능 수정 및 보안 개발 | 350,000원 | maintenance | feature_extension | professional_services | legacy_heavy, workflow_complex | low | backend_api, database, security, legacy_enterprise, core_web | 55 | 24~40h | 30 | 30 | 45 |
| 2 | Spring Boot 기반 PG사 선불시스템 구축 개발 | 6,000,000원/월 | fintech_payment | staffing | finance | high_risk_domain, integration_heavy, workflow_complex | low | backend_api, database, payments, external_api_integration, security | 68 | 900~1300h | 65 | 30 | 55 |
| 3 | Java 기반 녹취 솔루션 구축 PL | 5,500,000원/월 | media_processing | staffing | general | integration_heavy, legacy_heavy, workflow_complex | one_off | legacy_enterprise, backend_api, speech_audio_ai | 70 | 900~1100h | 30 | 12 | 25 |
| 4 | 물류 자동화 설비 연동 WMS 반품 자동화 백엔드 개발 | 7,000,000원/월 | iot_device | staffing | logistics | hardware_iot, integration_heavy, legacy_heavy | one_off | hardware_iot, backend_api, legacy_enterprise, core_web | 72 | 450~650h | 38 | 15 | 30 |
| 5 | 스크린 파크골프 브랜드 신규 홈페이지 제작 | 1,000,000원 | website | design_publishing | sports | standard_crud | medium | core_web | 8 | 25~45h | 8 | 35 | 60 |
| 6 | Oracle 기반 생산계획 시스템 구축 PL | 8,000,000원/월 | business_management | staffing | manufacturing | workflow_complex, legacy_heavy, algorithmic_specialized | low | database, legacy_enterprise, analytics_dashboard, backend_api | 62 | 480~620h | 35 | 25 | 45 |
| 7 | 예약 플랫폼 프론트/백엔드 연동 및 해외 결제 시스템 구축 | 15,000,000원 | reservation | new_build | general | integration_heavy, high_risk_domain, workflow_complex | high | core_web, backend_api, database, authentication_authorization, admin_system, payments, external_api_integration, cloud_infra | 48 | 200~320h | 72 | 78 | 80 |
| 8 | APM/DR 기반 금융권 차세대 인프라 관제 및 금융보안 분석 | 7,000,000원/월 | enterprise_infra | staffing | finance | high_risk_domain, legacy_heavy | one_off | legacy_enterprise, security, cloud_infra | 80 | 3000~4200h | 35 | 10 | 30 |
| 9 | EDW/CDC·ETL 기반 금융권 차세대 정보계 분석·설계 | 7,000,000원/월 | data_dashboard | staffing | finance | legacy_heavy, high_risk_domain, integration_heavy | low | data_pipeline, database, analytics_dashboard, legacy_enterprise | 70 | 3000~4500h | 35 | 20 | 30 |
| 10 | 중등 온라인 교육 서비스 모바일 앱·반응형 웹 QA | 4,000,000원/월 | qa_testing | staffing | education | multi_platform | low | other | 25 | 320~380h | 25 | 25 | 50 |
| 11 | 유소년 스포츠 등번호 AI 하이라이트 웹 MVP 개발 | 5,000,000원 | ai_service | new_build | sports | algorithmic_specialized, workflow_complex | medium | computer_vision, ocr_document_ai, data_pipeline, backend_api, core_web, database, admin_system, cloud_infra, docker | 62 | 130~220h | 72 | 52 | 48 |
| 12 | 언론 웹사이트 추가 개발 및 유지보수 | 10,000원 ~ 1,000,000원 | website | feature_extension | media_content | legacy_heavy, integration_heavy | medium | core_web, backend_api, cloud_infra, external_api_integration, admin_system | 45 | 40~90h | 45 | 50 | 60 |
| 13 | 기존 웹/앱 서비스 고도화 및 추가 개발 | 2,500,000원 ~ 5,000,000원 | iot_device | feature_extension | general | hardware_iot, legacy_heavy, multi_platform | low | hardware_iot, backend_api, mobile, core_web, database, legacy_enterprise, cloud_infra | 68 | 130~240h | 45 | 30 | 45 |
| 14 | 자사 iOS 앱 승인 대응 | 18,000,000원 ~ 18,000,000원 | mobile_app | feature_extension | education | integration_heavy, legacy_heavy, high_risk_domain | low | mobile, payments, external_api_integration, backend_api, legacy_enterprise | 55 | 120~240h | 65 | 40 | 55 |
| 15 | 위하고 세무 업무 자동화 PC 프로그램 구축 | 25,000,000원 ~ 40,000,000원 | automation_rpa | new_build | professional_services | integration_heavy, legacy_heavy, high_risk_domain | low | browser_automation, web_crawling, workflow_automation, security, database, external_api_integration, legacy_enterprise | 62 | 320~560h | 60 | 38 | 50 |
| 16 | [상주] AI Agent 구축 상주 인력 모집 | 5,000,000원 ~ 10,000,000원 | ai_service | staffing | finance | integration_heavy, high_risk_domain | low | ai_llm, rag_embeddings, ai_agents, external_api_integration, backend_api | 58 | 1100~1400h | 60 | 30 | 55 |
| 17 | AI 기반 주거형 종합공조 토탈 플랫폼 신규 구축 | 10,000,000원 ~ 20,000,000원 | platform_marketplace | new_build | real_estate | integration_heavy, workflow_complex | medium | core_web, backend_api, database, authentication_authorization, admin_system, payments, external_api_integration, analytics_dashboard | 48 | 300~480h | 50 | 62 | 66 |
| 18 | 삼성 안드로이드 태블릿 웹사이트 출력 연동 APK 개발 | 800,000원 ~ 1,000,000원 | iot_device | new_build | general | hardware_iot | low | mobile, hardware_iot | 52 | 30~60h | 40 | 35 | 40 |
| 19 | 해외(태국) 무인 생수 락커 SW 및 제어보드 통합 개발 | 50,000,000원 ~ 100,000,000원 | iot_device | new_build | commerce | hardware_iot, integration_heavy, workflow_complex, high_risk_domain, multi_platform | low | core_web, backend_api, database, authentication_authorization, admin_system, payments, external_api_integration, realtime, hardware_iot, security, cloud_infra, ci_cd | 72 | 700~1100h | 70 | 35 | 35 |
| 20 | 거래소 신규 공지사항 실시간 감지 파이썬 코드 개발 | 10,000원 ~ 1,000,000원 | crawler_data_collection | new_build | finance | algorithmic_specialized, integration_heavy | low | web_crawling, backend_api, external_api_integration | 62 | 30~80h | 45 | 35 | 40 |

## 분류가 애매한 케이스

- [freemoa:48501] 기존 웹/앱 서비스 고도화 및 추가 개발 — AI 판단 애매: engagement_type
- [freemoa:48472] 해외(태국) 무인 생수 락커 SW 및 제어보드 통합 개발 — complexity_types 5개

## 분류별 샘플 건수

- project_type: iot_device 4, ai_service 2, website 2, automation_rpa 1, business_management 1, crawler_data_collection 1, data_dashboard 1, enterprise_infra 1, fintech_payment 1, maintenance 1, media_processing 1, mobile_app 1, platform_marketplace 1, qa_testing 1, reservation 1
- engagement_type: staffing 8, new_build 7, feature_extension 4, design_publishing 1
- industry: finance 5, general 4, education 2, professional_services 2, sports 2, commerce 1, logistics 1, manufacturing 1, media_content 1, real_estate 1
- reuse_level: low 12, medium 4, one_off 3, high 1
- complexity_types: integration_heavy 12, legacy_heavy 10, high_risk_domain 8, workflow_complex 8, hardware_iot 4, algorithmic_specialized 3, multi_platform 3, standard_crud 1
- technology_assets: backend_api 14, database 10, core_web 9, external_api_integration 9, legacy_enterprise 9, cloud_infra 6, admin_system 5, payments 5, security 5, hardware_iot 4, analytics_dashboard 3, authentication_authorization 3, mobile 3, data_pipeline 2, web_crawling 2, ai_agents 1, ai_llm 1, browser_automation 1, ci_cd 1, computer_vision 1, docker 1, ocr_document_ai 1, other 1, rag_embeddings 1, realtime 1, speech_audio_ai 1, workflow_automation 1

## 상세

### 1. [wishket:158857] .NET 기반 기능 수정 및 보안 개발

- 예산: 350,000원 · 기간: 3일
- 분류: **maintenance** (기존 시스템 유지보수가 본질) / .NET 조회제한·보안 개선 · feature_extension · professional_services · reuse low
- complexity_types: legacy_heavy, workflow_complex · technology_assets: backend_api, database, security, legacy_enterprise, core_web
- 요약: 운영 중인 .NET 법조인 검색 시스템에 IP·채널별 조회량 탐지, 단계별 접속 차단(429), 관리자 이메일 알림 기능을 추가하고 현직 선택 항목 3개를 추가한다.
- 기능: security_hardening, notification_email, admin_dashboard, bug_fix_maintenance, statistics_reporting
- 연동: email_service
- 플랫폼: web, admin_web · 기술: backend, database, security, legacy_tech
- 추천 스택: ASP.NET, C#, MSSQL, Visual Studio 2019, Windows Server
- 점수: 난이도 55 · 시간 24~40h · 학습 30 · 재사용 30 · 시장 45 · 위험 55 · 명확성 75
- 근거:
  - vibe_coding_difficulty: 기존 .NET 레거시 분석과 운영 서비스 수정이 필요해 중상 난이도.
  - estimated_hours: 분석, 탐지·차단·알림 기능, 항목 추가, 검증까지 약 24~40시간.
  - learning_value: 레이트리밋 개념은 유용하나 레거시 .NET 중심이라 제한적.
  - reusability_value: 특정 고객 레거시 코드에 묶여 재사용이 제한적.
  - market_value: 레거시 .NET 보안·수정 수요는 있으나 범위가 특정적.
  - technical_risk: 운영 환경 접근, 짧은 일정, 데이터 훼손 우려가 있음.
- 토큰: in 12 / out 5235 · $0.1046

### 2. [wishket:158882] Spring Boot 기반 PG사 선불시스템 구축 개발

- 예산: 6,000,000원/월 · 기간: 210일
- 분류: **fintech_payment** (PG/선불/결제 인프라/핀테크 시스템) / PG사 선불시스템 · staffing · finance · reuse low
- complexity_types: high_risk_domain, integration_heavy, workflow_complex · technology_assets: backend_api, database, payments, external_api_integration, security
- 요약: PG사의 선불결제 시스템 구축 프로젝트에 Spring Boot 개발자가 공덕역 인근에 상주하며 PG결제 영역을 개발한다.
- 기능: payment, settlement, point_coupon, user_management, admin_dashboard, security_hardening
- 연동: payment_gateway
- 플랫폼: backend_api, admin_web · 기술: backend, database, payment, security
- 추천 스택: Spring Boot, Java, PostgreSQL, Redis, Docker
- 점수: 난이도 68 · 시간 900~1300h · 학습 65 · 재사용 30 · 시장 55 · 위험 60 · 명확성 20
- 근거:
  - vibe_coding_difficulty: 금융 결제 도메인과 상주 환경, 범위 불명확으로 난이도가 높음.
  - estimated_hours: 약 7개월 상주 기간제를 기준으로 범위를 추정함.
  - learning_value: PG·선불 결제 구조 경험은 가치가 크지만 범위가 한정적임.
  - reusability_value: 고객 전용 시스템이라 코드 재사용이 제한적임.
  - market_value: 결제 개발 수요는 있으나 PG사 선불은 특수함.
  - technical_risk: 오류 비용이 크고 요구사항이 불명확함.
- 토큰: in 6 / out 1069 · $0.0464

### 3. [wishket:158896] Java 기반 녹취 솔루션 구축 PL

- 예산: 5,500,000원/월 · 기간: 180일
- 분류: **media_processing** (녹취/영상·음성 처리/미디어 분석 파이프라인) / 콜센터 녹취 솔루션 PL · staffing · general · reuse one_off
- complexity_types: integration_heavy, legacy_heavy, workflow_complex · technology_assets: legacy_enterprise, backend_api, speech_audio_ai
- 요약: 콜센터 녹취 솔루션 구축 사업에서 녹취 영역을 총괄하는 시니어 PL을 폐쇄망 상주로 투입하는 기간제 공고. 고객 협의, 분석·설계 조율, 일정 관리, 내부 Java 개발자 커뮤니케이션을 맡는다.
- 기능: speech_processing, approval_workflow, legacy_migration
- 연동: hardware_device
- 플랫폼: backend_api, web · 기술: project_management, backend, legacy_tech
- 추천 스택: Java, Spring Boot, PostgreSQL, Oracle
- 점수: 난이도 70 · 시간 900~1100h · 학습 30 · 재사용 12 · 시장 25 · 위험 55 · 명확성 35
- 근거:
  - vibe_coding_difficulty: 폐쇄망 상주, CTI·교환기 도메인 이해와 PL 협의 업무 비중이 커 AI 활용이 제한적.
  - estimated_hours: 6개월 상주 기간제로 월 150~180시간 기준, 범위가 불명확해 추정함.
  - learning_value: CTI·녹취 도메인 지식은 얻지만 특정 분야에 한정되고 PL 업무 위주.
  - reusability_value: 자체 엔진과 폐쇄망 환경에 종속되어 코드 재사용이 거의 불가능.
  - market_value: 녹취·콜센터 PL 수요는 좁은 틈새 시장에 해당.
  - technical_risk: 고객 요구 협의, 폐쇄망, 자체 엔진 의존으로 불확실성이 있음.
- 토큰: in 12 / out 4546 · $0.0690

### 4. [wishket:158891] 물류 자동화 설비 연동 WMS 반품 자동화 백엔드 개발

- 예산: 7,000,000원/월 · 기간: 120일
- 분류: **iot_device** (실제 물리 장치(센서/장비/프린터/락커/키오스크/주변기기/산업장비)와의 통신·제어가 핵심인 시스템) / WMS 반품 설비 연동 · staffing · logistics · reuse one_off
- complexity_types: hardware_iot, integration_heavy, legacy_heavy · technology_assets: hardware_iot, backend_api, legacy_enterprise, core_web
- 요약: 홈쇼핑 WMS 반품 자동화 설비(소터, 바코드리더기)를 TCP/IP·RS-232·PLC로 연동하는 백엔드와 WMS 화면을 개발하고, 설비 테스트부터 오픈까지 상주 수행하는 인력 투입 프로젝트입니다.
- 기능: hardware_integration, iot_device_control, admin_dashboard, order_management, inventory_management
- 연동: hardware_device, erp_external
- 플랫폼: backend_api, web · 기술: backend, embedded, legacy_tech, frontend
- 추천 스택: Java, Spring Boot, React, Oracle, TCP Socket
- 점수: 난이도 72 · 시간 450~650h · 학습 38 · 재사용 15 · 시장 30 · 위험 70 · 명확성 50
- 근거:
  - vibe_coding_difficulty: 실설비·PLC 연동과 현장 통합테스트, 상주 환경이라 AI 단독 수행이 어렵다.
  - estimated_hours: 4개월 상주, 설비 연동·WMS 화면·테스트·오픈 범위로 추정.
  - learning_value: 소켓·전문 파싱은 배우지만 특정 설비·레거시 지식 중심이다.
  - reusability_value: 특정 설비와 고객 WMS에 종속되어 재사용이 제한된다.
  - market_value: 물류 설비 연동 수요는 있으나 특수 도메인이라 반복성이 낮다.
  - technical_risk: 실장비 의존, 현장 테스트, 오픈 일정 리스크가 크다.
- 토큰: in 6 / out 1182 · $0.0241

### 5. [wishket:158892] 스크린 파크골프 브랜드 신규 홈페이지 제작

- 예산: 1,000,000원 · 기간: 14일
- 분류: **website** (기업/브랜드 홈페이지, 랜딩) / 브랜드 홈페이지 · design_publishing · sports · reuse medium
- complexity_types: standard_crud · technology_assets: core_web
- 요약: 스크린 파크골프 시스템 제조·판매 기업을 위해 아임웹 등 웹빌더로 회사/제품/렌탈 안내와 문의 폼을 갖춘 반응형 브랜드 홈페이지를 기획·디자인·구축한다.
- 기능: landing_page, cms, admin_dashboard
- 연동: -
- 플랫폼: web, mobile_web · 기술: frontend, ui_design
- 추천 스택: 아임웹, Figma
- 점수: 난이도 8 · 시간 25~45h · 학습 8 · 재사용 35 · 시장 60 · 위험 12 · 명확성 55
- 근거:
  - vibe_coding_difficulty: 웹빌더 기반 홈페이지로 코딩 거의 없는 단순 작업.
  - estimated_hours: 기획·디자인·세팅 포함 페이지 수 개 구성 약 25~45시간.
  - learning_value: 웹빌더 작업이라 새로 배울 기술이 적음.
  - reusability_value: 디자인 원본과 구성 경험은 일부 재사용 가능.
  - market_value: 웹빌더 홈페이지 제작 외주는 반복 수요가 많음.
  - technical_risk: 기술 위험은 낮고 10월 15일 기한 엄수가 변수.
- 토큰: in 10 / out 3304 · $0.0534

### 6. [wishket:158884] Oracle 기반 생산계획 시스템 구축 PL

- 예산: 8,000,000원/월 · 기간: 90일
- 분류: **business_management** (사내 업무관리/ERP/그룹웨어/MES) / 제조 생산계획 시스템 · staffing · manufacturing · reuse low
- complexity_types: workflow_complex, legacy_heavy, algorithmic_specialized · technology_assets: database, legacy_enterprise, analytics_dashboard, backend_api
- 요약: 제조업 생산계획 영역 시스템 구축에 상주 투입되어 납기 지연 사유 분석, 납기 시뮬레이션, Early Warning, 대시보드를 개발하고 파트를 리딩하는 PL 인력 구인입니다.
- 기능: statistics_reporting, admin_dashboard, data_pipeline, scheduling_calendar, notification_push
- 연동: -
- 플랫폼: web, backend_api · 기술: database, backend, legacy_tech, project_management, data_engineering
- 추천 스택: Oracle, PL/SQL, Java Spring, Grafana
- 점수: 난이도 62 · 시간 480~620h · 학습 35 · 재사용 25 · 시장 45 · 위험 55 · 명확성 40
- 근거:
  - vibe_coding_difficulty: 기존 Oracle 환경 상주, 시뮬레이션 로직과 도메인 이해가 필요함.
  - estimated_hours: 90일 상주 풀타임에 리딩 업무를 포함해 추정.
  - learning_value: Oracle/PL-SQL 및 제조 도메인 중심이라 범용 학습은 제한적.
  - reusability_value: 고객 전용 시스템이라 코드 재사용이 제한적.
  - market_value: 제조 생산계획 인력 수요는 있으나 특수 도메인.
  - technical_risk: 기존 시스템과 데이터 불확실성, 납기 시뮬레이션 정확도 위험.
- 토큰: in 6 / out 1134 · $0.0231

### 7. [wishket:158850] 예약 플랫폼 프론트/백엔드 연동 및 해외 결제 시스템 구축

- 예산: 15,000,000원 · 기간: 60일
- 분류: **reservation** (예약/예약관리) / 시간 단위 예약 플랫폼 · new_build · general · reuse high
- complexity_types: integration_heavy, high_risk_domain, workflow_complex · technology_assets: core_web, backend_api, database, authentication_authorization, admin_system, payments, external_api_integration, cloud_infra
- 요약: 파트너와 글로벌 고객을 연결하는 시간 단위 예약 플랫폼의 백엔드를 구축하고, 기존 React 프로토타입 3종(고객·파트너·관리자)을 연동합니다. 중복 예약 방지와 해외 결제 PG 통합 및 배포까지 포함합니다.
- 기능: authentication, role_permission, reservation, scheduling_calendar, payment, admin_dashboard, order_management, search_filter, statistics_reporting, infra_devops
- 연동: payment_gateway, easy_pay, aws
- 플랫폼: web, admin_web, mobile_web, backend_api · 기술: frontend, backend, database, payment, authentication, devops_infra
- 추천 스택: Next.js, TypeScript, Supabase, PostgreSQL, Stripe/PayPal, Vercel
- 점수: 난이도 48 · 시간 200~320h · 학습 72 · 재사용 78 · 시장 80 · 위험 52 · 명확성 72
- 근거:
  - vibe_coding_difficulty: 3종 웹 연동, 동시성 제어, 다중 해외 PG로 중상 난이도.
  - estimated_hours: 백엔드, 3종 화면 연동, 해외 결제 5종, 배포 포함 200~320시간.
  - learning_value: 동시성 제어와 글로벌 결제 연동은 재활용도가 높은 경험.
  - reusability_value: 예약, 결제, 권한, 관리자 구조는 다른 외주에 재사용 가능.
  - market_value: 예약 플랫폼과 결제 연동은 반복 수요가 많음.
  - technical_risk: 위챗·라인페이 가맹 심사와 중복 예약 방지의 정확성이 위험 요소.
- 토큰: in 14 / out 6516 · $0.0969

### 8. [wishket:158890] APM/DR 기반 금융권 차세대 인프라 관제 및 금융보안 분석·설계

- 예산: 7,000,000원/월 · 기간: 810일
- 분류: **enterprise_infra** (DR/관제/인프라 설계 등 엔터프라이즈 인프라) / 금융 APM/DR 관제 설계 · staffing · finance · reuse one_off
- complexity_types: high_risk_domain, legacy_heavy · technology_assets: legacy_enterprise, security, cloud_infra
- 요약: 예탁결제원 차세대 시스템의 E2E 거래추적, APM, 인프라 관제, DR 시나리오, 금융보안 체계를 분석·설계하는 시니어 PL급 상주 인력 투입.
- 기능: infra_devops, security_hardening
- 연동: -
- 플랫폼: other · 기술: devops_infra, security, legacy_tech, project_management
- 추천 스택: SiteScope, APM, Unix, ELK
- 점수: 난이도 80 · 시간 3000~4200h · 학습 35 · 재사용 10 · 시장 30 · 위험 65 · 명확성 35
- 근거:
  - vibe_coding_difficulty: 금융 대형 레거시 상주 설계로 AI 활용 여지가 작음
  - estimated_hours: 27개월 상주 중 약 18~24개월분 설계 업무 추정
  - learning_value: 특정 제품·금융 도메인 중심이라 범용 학습은 제한적
  - reusability_value: 고객 전용 설계 문서 중심이라 재사용 어려움
  - market_value: 금융권 관제/DR 인력 수요는 있으나 특수함
  - technical_risk: 제안 단계라 투입 불확실하고 규제 도메인임
- 토큰: in 10 / out 3347 · $0.0526

### 9. [wishket:158888] EDW/CDC·ETL 기반 금융권 차세대 정보계 분석·설계

- 예산: 7,000,000원/월 · 기간: 810일
- 분류: **data_dashboard** (BI/통계/대시보드/데이터 분석) / 금융 정보계 EDW 설계 · staffing · finance · reuse low
- complexity_types: legacy_heavy, high_risk_domain, integration_heavy · technology_assets: data_pipeline, database, analytics_dashboard, legacy_enterprise
- 요약: 예탁결제원 차세대 정보계(EDW, OLAP, CDC/ETL) 개편 프로젝트의 분석·설계 인력을 여의도 상주 기간제로 모집한다. 데이터 모델링, CDC/OGG 실시간 복제, 배치 ETL, OLAP 아키텍처 설계를 담당한다.
- 기능: data_pipeline, statistics_reporting, legacy_migration
- 연동: -
- 플랫폼: backend_api · 기술: data_engineering, database, legacy_tech, project_management
- 추천 스택: Oracle GoldenGate, Oracle DB, Informatica, Mondrian OLAP, ERwin
- 점수: 난이도 70 · 시간 3000~4500h · 학습 35 · 재사용 20 · 시장 30 · 위험 60 · 명확성 45
- 근거:
  - vibe_coding_difficulty: 금융 레거시 정보계 설계로 상주·폐쇄환경, AI 활용 제한적.
  - estimated_hours: 27개월 상주 중 분석·설계 단계 위주로 추정, 범위 불명확.
  - learning_value: CDC/ETL 지식은 유용하나 특정 기관 레거시 중심.
  - reusability_value: 고객 전용 시스템 설계라 코드 재사용이 제한적.
  - market_value: 금융 EDW 인력 수요는 있으나 시장 한정적.
  - technical_risk: 제안 단계라 투입 불확실, 대형 금융 시스템 위험.
- 토큰: in 6 / out 1152 · $0.0240

### 10. [wishket:158878] 중등 온라인 교육 서비스 모바일 앱·반응형 웹 QA

- 예산: 4,000,000원/월 · 기간: 60일
- 분류: **qa_testing** (QA/테스트/테스트 자동화/앱·웹 검수/품질보증/테스트 엔지니어 투입) / 교육 앱·웹 QA 상주 · staffing · education · reuse low
- complexity_types: multi_platform · technology_assets: other
- 요약: 중학생 대상 온라인 동영상 강의 서비스의 iOS/Android 앱과 반응형 웹을 검증하는 QA 엔지니어를 2개월간 서초 상주로 투입한다. 테스트 계획·케이스 작성, 결함 관리, 크로스 브라우저/디바이스 테스트를 수행한다.
- 기능: bug_fix_maintenance
- 연동: -
- 플랫폼: ios, android, web, mobile_web · 기술: qa_testing
- 추천 스택: Jira, Playwright, BrowserStack, Postman, TestRail
- 점수: 난이도 25 · 시간 320~380h · 학습 25 · 재사용 25 · 시장 50 · 위험 20 · 명확성 60
- 근거:
  - vibe_coding_difficulty: 코딩보다 수동 기능·디바이스 테스트 중심이라 AI 활용 여지가 제한적이다.
  - estimated_hours: 2개월 상주 풀타임 기준 약 320~380시간으로 추정.
  - learning_value: QA 프로세스 경험은 있으나 코드 자산 학습은 적다.
  - reusability_value: 테스트 케이스 템플릿 외 재사용 가능한 코드가 거의 없다.
  - market_value: 앱·웹 QA 상주 수요는 꾸준하나 개발 외주와는 결이 다르다.
  - technical_risk: 기술 위험은 낮고 일정 압박과 상주 조건 정도만 있다.
- 토큰: in 6 / out 1108 · $0.0236

### 11. [freemoa:48504] 유소년 스포츠 등번호 AI 하이라이트 웹 MVP 개발

- 예산: 5,000,000원 · 기간: 45일
- 분류: **ai_service** (LLM/RAG/영상·음성 AI 기능이 중심) / 등번호 AI 하이라이트 · new_build · sports · reuse medium
- complexity_types: algorithmic_specialized, workflow_complex · technology_assets: computer_vision, ocr_document_ai, data_pipeline, backend_api, core_web, database, admin_system, cloud_infra, docker
- 요약: 유소년 축구 경기 영상을 업로드하면 등번호를 인식해 선수별 구간을 추출하고 하이라이트 영상을 만든다. 학부모는 앱형 모바일 웹(PWA)에서 자녀 영상을 시청하며, 관리자 웹과 확장형 비동기 파이프라인 설계 문서도 포함한다.
- 기능: admin_dashboard, file_upload, media_processing, computer_vision, video_streaming, data_pipeline, user_management, public_api, document_generation
- 연동: aws
- 플랫폼: web, admin_web, mobile_web · 기술: backend, frontend, computer_vision, ai_ml, devops_infra, database
- 추천 스택: Next.js, TypeScript, Python FastAPI, YOLO, PaddleOCR, FFmpeg, AWS S3, Redis/Celery
- 점수: 난이도 62 · 시간 130~220h · 학습 72 · 재사용 52 · 시장 48 · 위험 66 · 명확성 72
- 근거:
  - vibe_coding_difficulty: 실제 경기 영상에서 등번호 인식 정확도 검증이 어렵고 비동기 영상 파이프라인이 필요하다.
  - estimated_hours: 관리자 웹, PWA, 영상 처리 파이프라인, 설계 문서까지 범위가 넓다.
  - learning_value: YOLO/OCR, 영상 큐 처리, PWA 등 재활용 가능한 기술을 익힌다.
  - reusability_value: 업로드·큐·관리자 구조는 재사용되지만 인식 모듈은 도메인 특화다.
  - market_value: 스포츠 AI 영상은 수요가 있으나 반복 빈도는 중간이다.
  - technical_risk: 등번호 가림·저해상도로 정확도 불확실하고 90분 영상 처리 비용 부담이 있다.
- 토큰: in 6 / out 1741 · $0.0360

### 12. [freemoa:48502] 언론 웹사이트 추가 개발 및 유지보수

- 예산: 10,000원 ~ 1,000,000원 · 기간: 30일
- 분류: **website** (기업/브랜드 홈페이지, 랜딩) / 언론 사이트 기능 추가 · feature_extension · media_content · reuse medium
- complexity_types: legacy_heavy, integration_heavy · technology_assets: core_web, backend_api, cloud_infra, external_api_integration, admin_system
- 요약: 중단된 해외 언론사 기사 발행 웹사이트의 기존 소스를 인수해 다중 이미지 횡스크롤/라이트박스 UI와 AWS S3/CloudFront 기반 대량 이미지 업로드 최적화를 구현하고, 이후 월 유지보수를 담당합니다.
- 기능: file_upload, cms, admin_dashboard, media_processing, bug_fix_maintenance, infra_devops
- 연동: aws
- 플랫폼: web, admin_web · 기술: frontend, backend, devops_infra, legacy_tech
- 추천 스택: 기존 스택 유지, AWS S3, CloudFront, TypeScript, Tailwind
- 점수: 난이도 45 · 시간 40~90h · 학습 45 · 재사용 50 · 시장 60 · 위험 45 · 명확성 50
- 근거:
  - vibe_coding_difficulty: 미확인 기존 코드 인수와 S3 대량 업로드 최적화가 포함됨.
  - estimated_hours: 코드 파악, UI 구현, 업로드 최적화, 인프라 점검 범위로 추정.
  - learning_value: S3/CloudFront 대용량 미디어 처리 경험은 유용함.
  - reusability_value: 업로드·갤러리 패턴은 재사용 가능하나 기존 코드에 종속.
  - market_value: 인수인계 유지보수와 미디어 업로드 최적화는 흔한 수요.
  - technical_risk: 기존 소스 상태와 스택이 불명확하고 명세서가 없음.
- 토큰: in 6 / out 1161 · $0.0275

### 13. [freemoa:48501] 기존 웹/앱 서비스 고도화 및 추가 개발

- 예산: 2,500,000원 ~ 5,000,000원 · 기간: 40일
- 분류: **iot_device** (실제 물리 장치(센서/장비/프린터/락커/키오스크/주변기기/산업장비)와의 통신·제어가 핵심인 시스템) / 장치연동 웹앱 고도화 · feature_extension · general · reuse low
- complexity_types: hardware_iot, legacy_heavy, multi_platform · technology_assets: hardware_iot, backend_api, mobile, core_web, database, legacy_enterprise, cloud_infra
- 판단 애매: engagement_type
- 요약: Vue 웹 2종과 AOS/iOS 앱, Supabase 백엔드로 운영 중인 장치 연동 서비스에 기능 추가와 오류 개선, TCP 세션 처리 개선을 하고 스토어 배포까지 진행합니다.
- 기능: user_management, notification_push, iot_device_control, hardware_integration, bug_fix_maintenance, app_store_release, legacy_migration
- 연동: hardware_device, aws
- 플랫폼: web, admin_web, ios, android, backend_api · 기술: frontend, backend, mobile_native, database, legacy_tech, embedded
- 추천 스택: Vue, Supabase, TypeScript, Naver Cloud, Android Studio, Xcode
- 점수: 난이도 68 · 시간 130~240h · 학습 45 · 재사용 30 · 시장 45 · 위험 70 · 명확성 62
- 근거:
  - vibe_coding_difficulty: 기존 코드 분석, 장치 TCP 세션 디버깅, 웹 2종과 앱 2종 동시 수정이 필요합니다.
  - estimated_hours: 기능 수정이 많고 장치 테스트와 스토어 배포까지 포함해 130~240시간으로 봤습니다.
  - learning_value: TCP 세션과 장치 연동, 앱 배포 경험은 남지만 특정 서비스에 한정됩니다.
  - reusability_value: 특정 서비스의 레거시 코드와 장치 프로토콜에 묶여 재사용이 제한적입니다.
  - market_value: 장치 연동 앱 유지보수 수요는 있으나 도메인이 한정적입니다.
  - technical_risk: 실장치 의존, 재현이 어려운 LTE TCP 오류, 롤백 이력, 스토어 심사 위험이 있습니다.
- 토큰: in 6 / out 1839 · $0.0348

### 14. [freemoa:48495] 자사 iOS 앱 승인 대응

- 예산: 18,000,000원 ~ 18,000,000원 · 기간: 30일 · ⚠ 공개 정보 제한
- 분류: **mobile_app** (iOS/Android 앱이 결과물의 중심) / iOS 인앱결제 도입 · feature_extension · education · reuse low
- complexity_types: integration_heavy, legacy_heavy, high_risk_domain · technology_assets: mobile, payments, external_api_integration, backend_api, legacy_enterprise
- 요약: 비상교육 온리원 중등 2.0 레슨 앱에 iOS 인앱 결제(상품 구매, 복원, 내역)와 이용권 연동, 애플 결제 검증 서버 연동을 추가하고 앱 심사 승인에 대응한다.
- 기능: payment, subscription_billing, order_management, app_store_release, user_management, bug_fix_maintenance
- 연동: erp_external
- 플랫폼: ios, backend_api · 기술: mobile_native, backend, payment, legacy_tech
- 추천 스택: Swift, StoreKit 2, SwiftUI, Apple App Store Server API, 기존 서버 스택
- 점수: 난이도 55 · 시간 120~240h · 학습 65 · 재사용 40 · 시장 55 · 위험 60 · 명확성 55
- 근거:
  - vibe_coding_difficulty: 기존 앱·서버 코드에 StoreKit 결제와 서버 검증을 붙이고 심사 대응까지 해야 함.
  - estimated_hours: 앱 결제 UI, 이용권 연동, 서버 검증, 심사 대응을 합쳐 약 120~240시간.
  - learning_value: StoreKit 인앱결제와 영수증 검증, 심사 대응은 다른 외주에도 쓸 수 있음.
  - reusability_value: 결제 패턴은 재사용할 수 있지만 고객사 앱·이용권 체계에 종속됨.
  - market_value: iOS 인앱결제 도입 수요는 꾸준하지만 공고 하나가 특정 기업 건임.
  - technical_risk: 애플 심사 승인 의존, 결제 오류 비용, 기존 시스템 불확실성이 있음.
- 토큰: in 8 / out 2438 · $0.0386

### 15. [freemoa:48491] 위하고 세무 업무 자동화 PC 프로그램 구축

- 예산: 25,000,000원 ~ 40,000,000원 · 기간: 93일
- 분류: **automation_rpa** (브라우저 자동화/RPA/업무 자동화 프로그램) / 세무 업무 자동화 PC앱 · new_build · professional_services · reuse low
- complexity_types: integration_heavy, legacy_heavy, high_risk_domain · technology_assets: browser_automation, web_crawling, workflow_automation, security, database, external_api_integration, legacy_enterprise
- 요약: 세무사무소용 위하고·홈택스 연동 부가세/원천세 신고 자동화 로직(클라이언트 제공 Claude 스크립트)을 상용 Windows PC 프로그램으로 리팩토링하고 GUI, 보안, 라이선스, 인스톨러까지 턴키 구축한다.
- 기능: authentication, role_permission, crawling_scraping, statistics_reporting, admin_dashboard, security_hardening, legacy_migration, document_generation
- 연동: erp_external
- 플랫폼: desktop · 기술: desktop_app, backend, crawling, security, frontend, database, ui_design
- 추천 스택: Electron, TypeScript, Playwright, SQLite (SQLCipher), React, electron-builder
- 점수: 난이도 62 · 시간 320~560h · 학습 60 · 재사용 38 · 시장 50 · 위험 68 · 명확성 55
- 근거:
  - vibe_coding_difficulty: 비공식 연동·2차 인증 대응과 기존 스크립트 분석, 세무 정확성 검증이 어렵다.
  - estimated_hours: 분석·리팩토링, GUI, 라이선스, 인스톨러, 보안, 문서화 포함 약 320~560시간.
  - learning_value: 데스크톱 패키징, 라이선스, 자동화 예외 처리를 익힐 수 있다.
  - reusability_value: 라이선스·인스톨러 구조는 재사용되나 위하고 전용 로직이 많다.
  - market_value: 세무 자동화 특화라 반복성은 중간 수준이다.
  - technical_risk: 위하고·홈택스 UI 변경, 2차 인증, 약관 문제와 세무 오류 위험이 있다.
- 토큰: in 8 / out 3154 · $0.0518

### 16. [freemoa:48488] [상주] AI Agent 구축 상주 인력 모집

- 예산: 5,000,000원 ~ 10,000,000원 · 기간: 240일
- 분류: **ai_service** (LLM/RAG/영상·음성 AI 기능이 중심) / 금융사 AI Agent 개발 · staffing · finance · reuse low
- complexity_types: integration_heavy, high_risk_domain · technology_assets: ai_llm, rag_embeddings, ai_agents, external_api_integration, backend_api
- 요약: 부산 소재 금융회사의 업무 혁신을 위해 SDS FabriX 플랫폼 위에서 공통 Agent 12종과 업무 Agent 26종을 개발하는 8개월 상주 인력 투입 건입니다.
- 기능: llm_generation, rag_search, search_filter, document_generation, llm_chatbot
- 연동: erp_external
- 플랫폼: backend_api · 기술: backend, llm_integration, ai_ml, legacy_tech
- 추천 스택: Python, FabriX, MCP, LLM API, Vector DB
- 점수: 난이도 58 · 시간 1100~1400h · 학습 60 · 재사용 30 · 시장 55 · 위험 50 · 명확성 50
- 근거:
  - vibe_coding_difficulty: 사내 플랫폼 FabriX 종속, 금융권 폐쇄환경 상주로 난이도 중상.
  - estimated_hours: 1인 8개월 상주 기준(약 160~175시간/월) 범위로 추정.
  - learning_value: LLM/RAG/MCP Agent 개발 경험은 가치 있으나 특정 플랫폼 중심.
  - reusability_value: SDS FabriX와 고객 전용 환경에 묶여 재사용 제한적.
  - market_value: 기업용 AI Agent 수요는 높으나 FabriX 특화 수요는 제한적.
  - technical_risk: 폐쇄망, 플랫폼 문서 부족, 금융권 보안 요건 불확실.
- 토큰: in 6 / out 1145 · $0.0253

### 17. [freemoa:48487] AI 기반 주거형 종합공조 토탈 플랫폼 신규 구축

- 예산: 10,000,000원 ~ 20,000,000원 · 기간: 90일
- 분류: **platform_marketplace** (중개/매칭/마켓플레이스/커뮤니티 플랫폼) / 공조 판매·시공 플랫폼 · new_build · real_estate · reuse medium
- complexity_types: integration_heavy, workflow_complex · technology_assets: core_web, backend_api, database, authentication_authorization, admin_system, payments, external_api_integration, analytics_dashboard
- 요약: 주거형 종합공조 견적·판매·시공 파트너 매칭·A/S를 잇는 반응형 웹 플랫폼을 신규 구축한다. 고객/판매자/파트너/관리자 권한 분리, PG 결제, 고객사 AI 시스템 3종 API 연동을 포함한다.
- 기능: authentication, user_management, role_permission, product_catalog, cart_checkout, order_management, payment, matching, scheduling_calendar, settlement, admin_dashboard, statistics_reporting, cms, external_api_integration
- 연동: payment_gateway
- 플랫폼: web, mobile_web, admin_web · 기술: frontend, backend, database, authentication, payment, ui_design, project_management
- 추천 스택: Next.js, TypeScript, Supabase, Tailwind, 토스페이먼츠, Vercel
- 점수: 난이도 48 · 시간 300~480h · 학습 50 · 재사용 62 · 시장 66 · 위험 42 · 명확성 52
- 근거:
  - vibe_coding_difficulty: 다중 권한 커머스·정산·AI API 연동이 결합된 중간 난이도.
  - estimated_hours: 4개 역할 화면과 결제·정산·기획·디자인 포함 범위 기준.
  - learning_value: 멀티롤 마켓플레이스와 PG 연동 경험은 유용하나 새 기술은 적음.
  - reusability_value: 커머스·권한·관리자는 재사용 가능하나 공조 도메인 커스텀이 큼.
  - market_value: 멀티롤 커머스·O2O 매칭 플랫폼 수요는 반복적임.
  - technical_risk: AI API 명세 미확정과 범위 불명확, 예산 대비 범위 위험이 있음.
- 토큰: in 8 / out 3235 · $0.0537

### 18. [freemoa:48479] 삼성 안드로이드 태블릿 웹사이트 출력 연동 APK 개발

- 예산: 800,000원 ~ 1,000,000원 · 기간: 7일
- 분류: **iot_device** (실제 물리 장치(센서/장비/프린터/락커/키오스크/주변기기/산업장비)와의 통신·제어가 핵심인 시스템) / 웹-프린터 출력 브릿지 APK · new_build · general · reuse low
- complexity_types: hardware_iot · technology_assets: mobile, hardware_iot
- 요약: 기존 웹사이트를 삼성 Android 태블릿 WebView APK로 실행하고, 출력 버튼 클릭 시 생성된 PDF를 JavaScript Bridge로 전달받아 지정된 삼성 무선 레이저 프린터로 팝업 없이 바로 출력하는 경량 앱을 개발한다.
- 기능: hardware_integration, file_upload, bug_fix_maintenance
- 연동: hardware_device
- 플랫폼: android · 기술: mobile_native, frontend
- 추천 스택: Kotlin, Android WebView, Android Print Framework, Samsung Mobile Print SDK
- 점수: 난이도 52 · 시간 30~60h · 학습 40 · 재사용 35 · 시장 40 · 위험 55 · 명확성 65
- 근거:
  - vibe_coding_difficulty: WebView 자체는 쉬우나 무팝업 프린터 직접 출력과 실기기 의존이 있다.
  - estimated_hours: WebView·브릿지·PDF 전달·프린터 연동·실기기 테스트로 30~60시간.
  - learning_value: Android 프린트 연동은 배우나 적용 범위가 좁다.
  - reusability_value: WebView 브릿지는 재사용되나 프린터 연동은 장비에 종속된다.
  - market_value: 웹-프린터 브릿지 수요는 있으나 틈새 영역이다.
  - technical_risk: 프린터 모델 미정이고 무팝업 출력 가능 여부가 불확실하다.
- 토큰: in 6 / out 1137 · $0.0268

### 19. [freemoa:48472] 해외(태국) 무인 생수 락커 SW 및 제어보드 통합 개발

- 예산: 50,000,000원 ~ 100,000,000원 · 기간: 180일
- 분류: **iot_device** (실제 물리 장치(센서/장비/프린터/락커/키오스크/주변기기/산업장비)와의 통신·제어가 핵심인 시스템) / 무인 락커 판매 시스템 · new_build · commerce · reuse low
- complexity_types: hardware_iot, integration_heavy, workflow_complex, high_risk_domain, multi_platform · technology_assets: core_web, backend_api, database, authentication_authorization, admin_system, payments, external_api_integration, realtime, hardware_iot, security, cloud_infra, ci_cd
- 요약: 태국 콘도 설치용 30칸 무인 생수 락커의 고객 결제 PWA, 주문·관제 서버, 관리자 대시보드, ESP32-S3 펌웨어, PCB 설계와 부품 조달까지 통합 개발한다.
- 기능: authentication, multilingual, payment, order_management, admin_dashboard, role_permission, inventory_management, statistics_reporting, notification_push, iot_device_control, hardware_integration, security_hardening, infra_devops, product_catalog
- 연동: payment_gateway, easy_pay, hardware_device, aws, slack
- 플랫폼: mobile_web, admin_web, backend_api, embedded · 기술: frontend, backend, database, payment, security, embedded, devops_infra, realtime
- 추천 스택: Next.js, TypeScript, Node.js, PostgreSQL, Redis, MQTT(EMQX), ESP32-S3 FreeRTOS
- 점수: 난이도 72 · 시간 700~1100h · 학습 70 · 재사용 35 · 시장 35 · 위험 75 · 명확성 80
- 근거:
  - vibe_coding_difficulty: 펌웨어·PCB·mTLS·결제 상태머신·현지 검증이 결합되어 AI 단독 수행이 어렵다.
  - estimated_hours: SW 전체에 펌웨어, PCB, 부품 조달, 통합시험까지 포함해 범위가 크다.
  - learning_value: MQTT 보안, 결제 웹훅, ESP32 OTA 등 재활용 가능한 기술을 익힌다.
  - reusability_value: 결제·관리자 부분은 재사용되나 장비와 PCB는 이 프로젝트에 종속된다.
  - market_value: 무인 락커 IoT 결제는 수요가 제한적이고 틈새 시장이다.
  - technical_risk: 실기기 의존, 해외 결제 연동, 현지 인증, 반옥외 환경 때문에 위험이 크다.
- 토큰: in 10 / out 4219 · $0.0739

### 20. [freemoa:48470] 거래소 신규 공지사항 실시간 감지 파이썬 코드 개발

- 예산: 10,000원 ~ 1,000,000원 · 기간: -
- 분류: **crawler_data_collection** (크롤러/데이터 수집기) / 거래소 공지 감지기 · new_build · finance · reuse low
- complexity_types: algorithmic_specialized, integration_heavy · technology_assets: web_crawling, backend_api, external_api_integration
- 요약: 업비트·빗썸의 신규 공지가 목록에 노출되기 전 선생성되는 공지번호를 선제 탐색해 1초 이내에 제목 등을 감지하는 Python 모니터링 프로그램을 개발한다. 차단 회피와 24시간 안정 동작, 출력/알림 파이프라인을 포함한다.
- 기능: crawling_scraping, data_pipeline, notification_push
- 연동: -
- 플랫폼: backend_api · 기술: backend, crawling
- 추천 스택: Python, asyncio, aiohttp, httpx, Redis, Docker
- 점수: 난이도 62 · 시간 30~80h · 학습 45 · 재사용 35 · 시장 40 · 위험 75 · 명확성 50
- 근거:
  - vibe_coding_difficulty: 비공개 번호 패턴 역분석과 1초 이내 감지, 차단 회피가 필요해 어렵다.
  - estimated_hours: 두 거래소 패턴 분석, 고속 비동기 수집기, 알림 구현으로 30~80시간.
  - learning_value: 비동기 고속 수집과 차단 회피는 유용하나 도메인이 좁다.
  - reusability_value: 거래소별 패턴에 종속되어 비동기 수집 골격만 재사용 가능하다.
  - market_value: 거래소 공지 감지 수요는 있으나 틈새 시장이다.
  - technical_risk: 패턴 재현 보장이 없고 거래소 차단 정책과 변경에 취약하다.
- 토큰: in 8 / out 2921 · $0.0501

## 분포

- vibe_coding_difficulty: 평균 57 / 중앙 62 / 범위 8~80
- estimated_hours_max: 평균 881 / 중앙 480 / 범위 40~4500
- learning_value: 평균 46 / 중앙 45 / 범위 8~72
- reusability_value: 평균 34 / 중앙 35 / 범위 10~78
- market_value: 평균 47 / 중앙 48 / 범위 25~80

## 권장 어휘 밖 코드 (다음 버전 taxonomy 후보)

- features: external_api_integration(1)
- integrations: 없음
- skills: 없음
