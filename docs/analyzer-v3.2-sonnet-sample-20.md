# Analyzer v3.2 분석 리포트

- 생성: 2026-10-03T03:42:45.709Z
- 모델: `claude-sonnet-5-5` (mode: sync)
- 비고: backend=claude-cli (claude -p, Claude 구독제). 비용은 API 단가 환산 추정치이며 실제 청구되지 않음 (구독 사용량 한도에 반영)
- 결과: 성공 20 / 실패 0 / 전체 20
- 토큰: input 180 · output 63,265 · cache write 111,223 · cache read 914,996
- 비용: $1.0941 (건당 $0.0547)

## 전체 5,287건 분석 비용 추정 (건당 평균 in 51320 / out 3163 토큰 기준)

| 모델 | 동기 호출 | Batch API (50% 할인) |
|---|---|---|
| claude-opus-5-5 | $1419.80 | $709.90 |
| claude-sonnet-5-5 (이번 실행) | $709.90 | $354.95 |
| claude-haiku-4-5 | $354.95 | $177.47 |

※ 다른 모델 행은 같은 토큰 수를 가정한 단순 환산입니다. 모델마다 사고(thinking)·출력 길이가 달라 실제 비용은 다를 수 있습니다.

## 프로젝트별 분류

| # | 제목 | 예산 | project_type | engagement | industry | complexity_types | reuse | technology_assets | 난이도 | 예상시간 | 학습 | 재사용 | 시장 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | .NET 기반 기능 수정 및 보안 개발 | 350,000원 | admin_backoffice | feature_extension | professional_services | legacy_heavy, high_risk_domain | low | backend_api, database, security, legacy_enterprise, core_web | 50 | 24~40h | 25 | 30 | 40 |
| 2 | Spring Boot 기반 PG사 선불시스템 구축 개발 | 6,000,000원/월 | fintech_payment | staffing | finance | high_risk_domain, integration_heavy | low | backend_api, database, payments, external_api_integration, security | 68 | 1000~1400h | 65 | 35 | 55 |
| 3 | Java 기반 녹취 솔루션 구축 PL | 5,500,000원/월 | media_processing | staffing | general | hardware_iot, integration_heavy | low | backend_api, legacy_enterprise, speech_audio_ai | 62 | 800~1000h | 35 | 20 | 30 |
| 4 | 물류 자동화 설비 연동 WMS 반품 자동화 백엔드 개발 | 7,000,000원/월 | iot_device | staffing | logistics | hardware_iot, legacy_heavy | low | hardware_iot, backend_api, legacy_enterprise, core_web, external_api_integration | 72 | 450~700h | 45 | 30 | 40 |
| 5 | 스크린 파크골프 브랜드 신규 홈페이지 제작 | 1,000,000원 | website | design_publishing | sports | standard_crud | medium | core_web | 8 | 25~45h | 8 | 35 | 75 |
| 6 | Oracle 기반 생산계획 시스템 구축 PL | 8,000,000원/월 | business_management | staffing | manufacturing | workflow_complex, legacy_heavy | low | database, backend_api, analytics_dashboard, legacy_enterprise | 62 | 450~650h | 35 | 28 | 45 |
| 7 | 예약 플랫폼 프론트/백엔드 연동 및 해외 결제 시스템 구축 | 15,000,000원 | reservation | new_build | general | integration_heavy, realtime, high_risk_domain | high | core_web, backend_api, database, authentication_authorization, admin_system, payments, external_api_integration, cloud_infra | 48 | 200~320h | 72 | 78 | 80 |
| 8 | APM/DR 기반 금융권 차세대 인프라 관제 및 금융보안 분석 | 7,000,000원/월 | enterprise_infra | staffing | finance | high_risk_domain, legacy_heavy | low | legacy_enterprise, security, cloud_infra | 70 | 3000~4200h | 35 | 15 | 25 |
| 9 | EDW/CDC·ETL 기반 금융권 차세대 정보계 분석·설계 | 7,000,000원/월 | data_dashboard | staffing | finance | high_risk_domain, legacy_heavy | low | data_pipeline, database, legacy_enterprise, analytics_dashboard | 70 | 3000~4300h | 35 | 25 | 35 |
| 10 | 중등 온라인 교육 서비스 모바일 앱·반응형 웹 QA | 4,000,000원/월 | qa_testing | staffing | education | multi_platform | low | other | 20 | 320~400h | 25 | 25 | 55 |
| 11 | 유소년 스포츠 등번호 AI 하이라이트 웹 MVP 개발 | 5,000,000원 | ai_service | new_build | sports | algorithmic_specialized, workflow_complex | medium | computer_vision, ocr_document_ai, data_pipeline, core_web, backend_api, database, admin_system, cloud_infra | 62 | 140~240h | 72 | 50 | 50 |
| 12 | 언론 웹사이트 추가 개발 및 유지보수 | 10,000원 ~ 1,000,000원 | website | feature_extension | media_content | legacy_heavy, standard_crud | medium | core_web, backend_api, cloud_infra | 45 | 40~90h | 45 | 50 | 65 |
| 13 | 기존 웹/앱 서비스 고도화 및 추가 개발 | 2,500,000원 ~ 5,000,000원 | iot_device | feature_extension | general | legacy_heavy, hardware_iot, multi_platform | low | core_web, backend_api, database, mobile, hardware_iot, legacy_enterprise, cloud_infra | 68 | 110~200h | 45 | 30 | 40 |
| 14 | 자사 iOS 앱 승인 대응 | 18,000,000원 ~ 18,000,000원 | mobile_app | feature_extension | education | integration_heavy, high_risk_domain, legacy_heavy | medium | mobile, payments, external_api_integration, backend_api | 58 | 120~240h | 65 | 50 | 62 |
| 15 | 위하고 세무 업무 자동화 PC 프로그램 구축 | 25,000,000원 ~ 40,000,000원 | automation_rpa | new_build | professional_services | integration_heavy, high_risk_domain, legacy_heavy | medium | browser_automation, web_crawling, workflow_automation, security, database, external_api_integration, core_web | 62 | 350~600h | 65 | 50 | 50 |
| 16 | [상주] AI Agent 구축 상주 인력 모집 | 5,000,000원 ~ 10,000,000원 | ai_service | staffing | finance | integration_heavy, high_risk_domain | low | ai_llm, rag_embeddings, ai_agents, external_api_integration, backend_api | 55 | 1200~1500h | 60 | 35 | 55 |
| 17 | AI 기반 주거형 종합공조 토탈 플랫폼 신규 구축 | 10,000,000원 ~ 20,000,000원 | platform_marketplace | new_build | real_estate | workflow_complex, integration_heavy | medium | core_web, backend_api, database, authentication_authorization, admin_system, payments, external_api_integration, analytics_dashboard | 50 | 300~520h | 55 | 62 | 72 |
| 18 | 삼성 안드로이드 태블릿 웹사이트 출력 연동 APK 개발 | 800,000원 ~ 1,000,000원 | iot_device | new_build | general | hardware_iot | low | mobile, hardware_iot | 50 | 30~70h | 45 | 35 | 40 |
| 19 | 해외(태국) 무인 생수 락커 SW 및 제어보드 통합 개발 | 50,000,000원 ~ 100,000,000원 | iot_device | new_build | commerce | hardware_iot, integration_heavy, high_risk_domain, multi_platform | low | core_web, backend_api, database, authentication_authorization, admin_system, payments, external_api_integration, hardware_iot, realtime, security, cloud_infra, ci_cd | 72 | 900~1500h | 70 | 35 | 35 |
| 20 | 거래소 신규 공지사항 실시간 감지 파이썬 코드 개발 | 10,000원 ~ 1,000,000원 | crawler_data_collection | new_build | finance | algorithmic_specialized, realtime | low | web_crawling, backend_api, external_api_integration, data_pipeline | 62 | 30~80h | 45 | 35 | 40 |

## 분류가 애매한 케이스

- [freemoa:48487] AI 기반 주거형 종합공조 토탈 플랫폼 신규 구축 — AI 판단 애매: project_type
- [freemoa:48472] 해외(태국) 무인 생수 락커 SW 및 제어보드 통합 개발 — complexity_types 4개

## 분류별 샘플 건수

- project_type: iot_device 4, ai_service 2, website 2, admin_backoffice 1, automation_rpa 1, business_management 1, crawler_data_collection 1, data_dashboard 1, enterprise_infra 1, fintech_payment 1, media_processing 1, mobile_app 1, platform_marketplace 1, qa_testing 1, reservation 1
- engagement_type: staffing 8, new_build 7, feature_extension 4, design_publishing 1
- industry: finance 5, general 4, education 2, professional_services 2, sports 2, commerce 1, logistics 1, manufacturing 1, media_content 1, real_estate 1
- reuse_level: low 13, medium 6, high 1
- complexity_types: high_risk_domain 9, legacy_heavy 9, integration_heavy 8, hardware_iot 5, multi_platform 3, workflow_complex 3, algorithmic_specialized 2, realtime 2, standard_crud 2
- technology_assets: backend_api 14, core_web 10, database 10, external_api_integration 9, legacy_enterprise 7, cloud_infra 6, payments 5, security 5, admin_system 4, hardware_iot 4, analytics_dashboard 3, authentication_authorization 3, data_pipeline 3, mobile 3, web_crawling 2, ai_agents 1, ai_llm 1, browser_automation 1, ci_cd 1, computer_vision 1, ocr_document_ai 1, other 1, rag_embeddings 1, realtime 1, speech_audio_ai 1, workflow_automation 1

## 상세

### 1. [wishket:158857] .NET 기반 기능 수정 및 보안 개발

- 예산: 350,000원 · 기간: 3일
- 분류: **admin_backoffice** (관리자 시스템/백오피스) / 법조인 검색 보안 기능 · feature_extension · professional_services · reuse low
- complexity_types: legacy_heavy, high_risk_domain · technology_assets: backend_api, database, security, legacy_enterprise, core_web
- 요약: 운영 중인 .NET 기반 법조인 인명 검색 시스템에 IP·채널별 조회량 탐지, 단계적 접속 차단, 관리자 이메일 알림 및 현직 선택 항목 추가 기능을 개발한다.
- 기능: security_hardening, notification_email, admin_dashboard, statistics_reporting, bug_fix_maintenance
- 연동: email_service
- 플랫폼: web, backend_api · 기술: backend, database, security, legacy_tech
- 추천 스택: ASP.NET, C#, MSSQL, Visual Studio 2019, Windows Server
- 점수: 난이도 50 · 시간 24~40h · 학습 25 · 재사용 30 · 시장 40 · 위험 50 · 명확성 78
- 근거:
  - vibe_coding_difficulty: 기존 .NET 레거시 분석과 운영 서비스 무중단 수정이 필요하다.
  - estimated_hours: 레이트리밋, 단계 차단, 알림, 설정 DB, 항목 추가를 합쳐 24~40시간이다.
  - learning_value: 레이트리밋 개념은 배우지만 레거시 .NET 중심이라 낮다.
  - reusability_value: 차단 로직 아이디어는 쓰이나 고객 전용 코드라 제한적이다.
  - market_value: 레거시 .NET 보안·유지보수 수요는 있으나 범위가 좁다.
  - technical_risk: 짧은 기간에 운영 데이터 보호와 기존 코드 불확실성이 있다.
- 토큰: in 6 / out 1152 · $0.0545

### 2. [wishket:158882] Spring Boot 기반 PG사 선불시스템 구축 개발

- 예산: 6,000,000원/월 · 기간: 210일
- 분류: **fintech_payment** (PG/선불/결제 인프라/핀테크 시스템) / PG사 선불시스템 · staffing · finance · reuse low
- complexity_types: high_risk_domain, integration_heavy · technology_assets: backend_api, database, payments, external_api_integration, security
- 요약: PG사의 선불시스템 구축 프로젝트에 Spring Boot 개발자 1명이 공덕역 인근에 상주해 PG결제 영역을 개발한다.
- 기능: payment, authentication, settlement, admin_dashboard, security_hardening
- 연동: payment_gateway
- 플랫폼: backend_api · 기술: backend, database, payment, security
- 추천 스택: Spring Boot, Java, PostgreSQL, Redis, Docker
- 점수: 난이도 68 · 시간 1000~1400h · 학습 65 · 재사용 35 · 시장 55 · 위험 60 · 명확성 22
- 근거:
  - vibe_coding_difficulty: 금융 결제 도메인과 상주 환경, 범위 불명확로 어려움이 높음.
  - estimated_hours: 7~8개월 상주 인력 투입 기준으로 약 1000~1400시간 추정.
  - learning_value: PG·선불 결제 시스템 구축 경험은 가치가 높음.
  - reusability_value: 고객 전용 시스템이라 코드 재사용은 제한적임.
  - market_value: 결제 개발 수요는 있으나 PG사 선불은 특수 영역임.
  - technical_risk: 결제 정합성과 규제, 업무 범위 불명확이 위험 요소.
- 토큰: in 8 / out 2181 · $0.0631

### 3. [wishket:158896] Java 기반 녹취 솔루션 구축 PL

- 예산: 5,500,000원/월 · 기간: 180일
- 분류: **media_processing** (녹취/영상·음성 처리/미디어 분석 파이프라인) / 콜센터 녹취 솔루션 · staffing · general · reuse low
- complexity_types: hardware_iot, integration_heavy · technology_assets: backend_api, legacy_enterprise, speech_audio_ai
- 요약: 콜센터 녹취 솔루션 구축 사업에서 녹취 영역을 맡아 고객사 협의, 설계, 일정 조율, 내부 개발팀 커뮤니케이션을 리딩하는 시니어 PL을 상주로 투입한다.
- 기능: speech_processing, hardware_integration, project_management
- 연동: hardware_device
- 플랫폼: backend_api · 기술: backend, legacy_tech, project_management
- 추천 스택: Java, Spring Boot, PostgreSQL, Oracle
- 점수: 난이도 62 · 시간 800~1000h · 학습 35 · 재사용 20 · 시장 30 · 위험 55 · 명확성 40
- 근거:
  - vibe_coding_difficulty: 폐쇄망 상주, CTI·교환기 등 콜 인프라 이해가 필요한 PL 업무.
  - estimated_hours: 6개월 상주 기간제 PL 업무로 월 약 140~170시간 기준.
  - learning_value: 녹취·CTI 도메인 지식은 얻지만 범용성은 낮음.
  - reusability_value: 자체 엔진과 고객사 환경에 종속되어 코드 재사용이 제한적.
  - market_value: 녹취/콜센터 PL 수요는 특수 도메인이라 제한적.
  - technical_risk: 폐쇄망, 자체 엔진 의존, 고객사 협의 변수가 있음.
- 토큰: in 12 / out 4721 · $0.0710

### 4. [wishket:158891] 물류 자동화 설비 연동 WMS 반품 자동화 백엔드 개발

- 예산: 7,000,000원/월 · 기간: 120일
- 분류: **iot_device** (실제 물리 장치(센서/장비/프린터/락커/키오스크/주변기기/산업장비)와의 통신·제어가 핵심인 시스템) / WMS 반품 설비 연동 · staffing · logistics · reuse low
- complexity_types: hardware_iot, legacy_heavy · technology_assets: hardware_iot, backend_api, legacy_enterprise, core_web, external_api_integration
- 요약: LG CNS 발주 홈쇼핑 WMS의 반품 자동화 설비(소터, 바코드리더) 연동 백엔드와 관련 WMS 화면을 개발하고 설비 테스트·오픈까지 수행하는 상주 인력 투입 건입니다.
- 기능: hardware_integration, iot_device_control, order_management, inventory_management, legacy_migration
- 연동: hardware_device
- 플랫폼: web, backend_api · 기술: backend, frontend, legacy_tech, embedded
- 추천 스택: Java, Spring Boot, React, TypeScript, Oracle
- 점수: 난이도 72 · 시간 450~700h · 학습 45 · 재사용 30 · 시장 40 · 위험 68 · 명확성 50
- 근거:
  - vibe_coding_difficulty: 실기기 소켓/RS-232/PLC 연동과 현장 테스트 상주라 AI 활용이 제한적.
  - estimated_hours: 4개월 2인 중 1인 파트, 설비 연동·화면·통합테스트·오픈 포함.
  - learning_value: 설비 연동 프로토콜 경험은 있으나 특정 현장 지식 위주.
  - reusability_value: 고객 전용 설비 전문 규격에 묶여 코드 재사용 제한적.
  - market_value: 물류 설비 연동 수요는 있으나 범용성은 낮음.
  - technical_risk: 실설비 의존, 현장 테스트와 오픈 일정 리스크가 큼.
- 토큰: in 6 / out 1147 · $0.0239

### 5. [wishket:158892] 스크린 파크골프 브랜드 신규 홈페이지 제작

- 예산: 1,000,000원 · 기간: 14일
- 분류: **website** (기업/브랜드 홈페이지, 랜딩) / 브랜드 홍보 홈페이지 · design_publishing · sports · reuse medium
- complexity_types: standard_crud · technology_assets: core_web
- 요약: 스크린 파크골프 제조·판매 기업의 브랜드 소개, 제품 및 렌탈/판매 안내, 온라인 문의 접수용 홈페이지를 아임웹으로 기획·디자인·구축한다.
- 기능: landing_page, cms, admin_dashboard, file_upload
- 연동: -
- 플랫폼: web, mobile_web · 기술: frontend, ui_design
- 추천 스택: Imweb, Figma
- 점수: 난이도 8 · 시간 25~45h · 학습 8 · 재사용 35 · 시장 75 · 위험 12 · 명확성 55
- 근거:
  - vibe_coding_difficulty: 아임웹 기반 소규모 브랜드 홈페이지로 매우 쉬움.
  - estimated_hours: 기획·디자인 포함 슬라이드 4장과 약 5~8페이지 구성 기준.
  - learning_value: 웹빌더 작업이라 새로 배울 기술이 적음.
  - reusability_value: 웹빌더 템플릿과 디자인 감각은 재사용 가능하나 코드 자산은 적음.
  - market_value: 웹빌더 홈페이지 제작은 외주 시장에서 매우 흔함.
  - technical_risk: 기술 위험은 낮고 기한 엄수가 주된 위험임.
- 토큰: in 6 / out 1041 · $0.0240

### 6. [wishket:158884] Oracle 기반 생산계획 시스템 구축 PL

- 예산: 8,000,000원/월 · 기간: 90일
- 분류: **business_management** (사내 업무관리/ERP/그룹웨어/MES) / 생산계획 시스템 PL · staffing · manufacturing · reuse low
- complexity_types: workflow_complex, legacy_heavy · technology_assets: database, backend_api, analytics_dashboard, legacy_enterprise
- 요약: 제조사 생산계획 영역에서 납기 지연 사유 분석, 납기 시뮬레이션, Early Warning, 대시보드를 Oracle/PL/SQL 기반으로 구축하고 해당 영역을 리딩하는 상주 PL 인력 투입입니다.
- 기능: statistics_reporting, admin_dashboard, data_pipeline, notification_email
- 연동: -
- 플랫폼: web, backend_api · 기술: database, backend, data_engineering, project_management, legacy_tech
- 추천 스택: Oracle, PL/SQL, Java Spring, Grafana
- 점수: 난이도 62 · 시간 450~650h · 학습 35 · 재사용 28 · 시장 45 · 위험 55 · 명확성 35
- 근거:
  - vibe_coding_difficulty: 기존 MES/SCM 환경과 Oracle 로직, 상주 PL 업무로 난이도가 높음.
  - estimated_hours: 약 3.5개월 상주 기간제, 범위가 불명확해 450~650시간으로 추정.
  - learning_value: 제조 생산계획 도메인과 Oracle 중심이라 범용 학습 가치는 보통 이하.
  - reusability_value: 특정 기업 환경 종속이라 코드 재사용이 제한적.
  - market_value: 제조 Oracle 상주 PL 수요는 있으나 범용성은 낮음.
  - technical_risk: 기존 시스템 불확실성과 시뮬레이션 정확도, 짧은 투입 일정이 위험.
- 토큰: in 14 / out 5962 · $0.0867

### 7. [wishket:158850] 예약 플랫폼 프론트/백엔드 연동 및 해외 결제 시스템 구축

- 예산: 15,000,000원 · 기간: 60일
- 분류: **reservation** (예약/예약관리) / 시간 단위 예약 플랫폼 · new_build · general · reuse high
- complexity_types: integration_heavy, realtime, high_risk_domain · technology_assets: core_web, backend_api, database, authentication_authorization, admin_system, payments, external_api_integration, cloud_infra
- 요약: 고객과 파트너를 연결하는 시간 단위 예약 플랫폼의 React 프로토타입 3종(고객/파트너/관리자)에 백엔드를 구축해 연동합니다. 중복 예약 방지와 해외 결제 PG 통합 및 클라우드 배포까지 포함합니다.
- 기능: authentication, reservation, scheduling_calendar, payment, admin_dashboard, role_permission, order_management, infra_devops, multilingual
- 연동: payment_gateway, easy_pay, aws
- 플랫폼: web, admin_web, backend_api · 기술: frontend, backend, database, payment, devops_infra, authentication
- 추천 스택: Next.js, TypeScript, Supabase, PostgreSQL, Stripe, PayPal, Vercel
- 점수: 난이도 48 · 시간 200~320h · 학습 72 · 재사용 78 · 시장 80 · 위험 50 · 명확성 78
- 근거:
  - vibe_coding_difficulty: 3개 웹 연동, 동시성 제어, 다수 해외 PG 연동이 겹쳐 중상 난이도.
  - estimated_hours: 백엔드, 3종 연동, 5개 결제수단, 배포까지 약 200~320시간.
  - learning_value: 해외 결제와 예약 동시성 제어는 계속 쓸 수 있는 역량.
  - reusability_value: 예약, 결제, 관리자, 인증 구조를 다른 외주에 재사용 가능.
  - market_value: 예약 플랫폼과 결제 연동은 반복 수요가 많음.
  - technical_risk: 위챗페이, 라인페이 등 PG 심사와 계약 의존, 결제 중복 예약 위험.
- 토큰: in 10 / out 4363 · $0.0680

### 8. [wishket:158890] APM/DR 기반 금융권 차세대 인프라 관제 및 금융보안 분석·설계

- 예산: 7,000,000원/월 · 기간: 810일
- 분류: **enterprise_infra** (DR/관제/인프라 설계 등 엔터프라이즈 인프라) / 금융 APM/DR 관제 설계 · staffing · finance · reuse low
- complexity_types: high_risk_domain, legacy_heavy · technology_assets: legacy_enterprise, security, cloud_infra
- 요약: 예탁결제원 차세대 시스템의 APM, E2E 거래추적, 인프라 관제, 통합 로그, DR 시나리오, 금융보안 체계를 분석·설계하는 시니어 상주 인력 투입 건.
- 기능: infra_devops, security_hardening, statistics_reporting
- 연동: -
- 플랫폼: other · 기술: devops_infra, security, legacy_tech, project_management
- 추천 스택: SiteScope, APM, Unix, ELK
- 점수: 난이도 70 · 시간 3000~4200h · 학습 35 · 재사용 15 · 시장 25 · 위험 55 · 명확성 40
- 근거:
  - vibe_coding_difficulty: 금융 대형 인프라 설계, 상주 환경이라 AI 활용 제한적
  - estimated_hours: 27개월 상주 설계 업무를 월 약 110~155시간 기준으로 추정
  - learning_value: APM/DR 설계는 유용하나 특정 기관 종속이 큼
  - reusability_value: 설계 산출물 중심이라 코드 재사용 거의 없음
  - market_value: 금융 차세대 인프라 설계 인력 수요는 있으나 한정적
  - technical_risk: 제안 단계라 투입 불확실, 대규모 금융 규제 환경
- 토큰: in 10 / out 3395 · $0.0537

### 9. [wishket:158888] EDW/CDC·ETL 기반 금융권 차세대 정보계 분석·설계

- 예산: 7,000,000원/월 · 기간: 810일
- 분류: **data_dashboard** (BI/통계/대시보드/데이터 분석) / 금융 차세대 정보계 EDW · staffing · finance · reuse low
- complexity_types: high_risk_domain, legacy_heavy · technology_assets: data_pipeline, database, legacy_enterprise, analytics_dashboard
- 요약: 예탁결제원 차세대 정보계(EDW, OLAP, CDC/ETL) 개편 프로젝트에 분석·설계 테크 리드로 여의도에 상주 투입되는 기간제 인력 공고입니다.
- 기능: data_pipeline, statistics_reporting, legacy_migration
- 연동: -
- 플랫폼: backend_api · 기술: data_engineering, database, legacy_tech, project_management
- 추천 스택: Oracle GoldenGate, Oracle, ETL 도구, OLAP, ERwin
- 점수: 난이도 70 · 시간 3000~4300h · 학습 35 · 재사용 25 · 시장 35 · 위험 55 · 명확성 45
- 근거:
  - vibe_coding_difficulty: 금융 상주 분석·설계로 AI 활용 여지가 작고 레거시 의존이 큼
  - estimated_hours: 27개월 상주 기간제로 월 약 110~160시간 기준 추정
  - learning_value: 금융 데이터 설계 경험은 있으나 특정 기관 중심
  - reusability_value: 고객 전용 설계 산출물이라 코드 재사용이 제한적
  - market_value: 금융권 EDW 상주 수요는 있으나 시장이 좁음
  - technical_risk: 제안 단계라 투입이 불확실하고 대규모 금융 시스템임
- 토큰: in 8 / out 2665 · $0.0430

### 10. [wishket:158878] 중등 온라인 교육 서비스 모바일 앱·반응형 웹 QA

- 예산: 4,000,000원/월 · 기간: 60일
- 분류: **qa_testing** (QA/테스트/테스트 자동화/앱·웹 검수/품질보증/테스트 엔지니어 투입) / 교육 앱·웹 QA 상주 · staffing · education · reuse low
- complexity_types: multi_platform · technology_assets: other
- 요약: 중등 온라인 교육 서비스의 iOS/Android 앱과 사용자용 반응형 웹에 대해 QA 엔지니어가 상주하며 테스트 계획, 케이스 작성·수행, 결함 관리를 수행합니다.
- 기능: bug_fix_maintenance
- 연동: -
- 플랫폼: ios, android, web, mobile_web · 기술: qa_testing
- 추천 스택: Jira, TestRail, Playwright, BrowserStack
- 점수: 난이도 20 · 시간 320~400h · 학습 25 · 재사용 25 · 시장 55 · 위험 20 · 명확성 65
- 근거:
  - vibe_coding_difficulty: 주로 수동 기능·크로스디바이스 QA라 코딩 난이도는 낮음.
  - estimated_hours: 2개월 상주 풀타임 기준 약 320~400시간.
  - learning_value: 수동 QA 중심이라 신규 기술 습득은 제한적.
  - reusability_value: 테스트 케이스 양식 외 코드 자산은 거의 없음.
  - market_value: 앱·웹 QA 인력 수요는 꾸준히 반복됨.
  - technical_risk: 일정 압박 외 기술 위험은 낮음.
- 토큰: in 6 / out 1527 · $0.0275

### 11. [freemoa:48504] 유소년 스포츠 등번호 AI 하이라이트 웹 MVP 개발

- 예산: 5,000,000원 · 기간: 45일
- 분류: **ai_service** (LLM/RAG/영상·음성 AI 기능이 중심) / 등번호 AI 하이라이트 · new_build · sports · reuse medium
- complexity_types: algorithmic_specialized, workflow_complex · technology_assets: computer_vision, ocr_document_ai, data_pipeline, core_web, backend_api, database, admin_system, cloud_infra
- 요약: 유소년 축구 경기 영상을 업로드하면 등번호를 인식해 선수별 구간을 추출하고 하이라이트를 생성한다. 학부모는 앱형 모바일 웹(PWA)에서 자녀 영상을 시청하고, 관리자 웹과 확장형 비동기 처리 구조를 포함한다.
- 기능: admin_dashboard, file_upload, media_processing, computer_vision, video_streaming, data_pipeline, role_permission, document_generation
- 연동: aws
- 플랫폼: web, admin_web, mobile_web · 기술: frontend, backend, ai_ml, computer_vision, devops_infra, database
- 추천 스택: Next.js, TypeScript, Python FastAPI, YOLO, PaddleOCR, FFmpeg, AWS S3, Redis/Celery
- 점수: 난이도 62 · 시간 140~240h · 학습 72 · 재사용 50 · 시장 50 · 위험 68 · 명확성 72
- 근거:
  - vibe_coding_difficulty: 실경기 영상 등번호 인식 정확도 검증이 어렵고 비동기 영상 파이프라인 필요.
  - estimated_hours: AI 파이프라인, 관리자, PWA, 설계문서까지 포함해 140~240시간.
  - learning_value: CV/OCR, 비동기 영상 처리, PWA 등 재사용 가능한 기술 습득.
  - reusability_value: 업로드·큐·관리자 구조는 재사용 가능하나 인식 로직은 도메인 특화.
  - market_value: 스포츠 영상 AI는 수요가 있으나 범용 반복성은 중간 수준.
  - technical_risk: 작은 등번호·가림·저해상도로 정확도 불확실, 기준은 협의 필요.
- 토큰: in 22 / out 11134 · $0.1550

### 12. [freemoa:48502] 언론 웹사이트 추가 개발 및 유지보수

- 예산: 10,000원 ~ 1,000,000원 · 기간: 30일
- 분류: **website** (기업/브랜드 홈페이지, 랜딩) / 언론사 기사 웹사이트 · feature_extension · media_content · reuse medium
- complexity_types: legacy_heavy, standard_crud · technology_assets: core_web, backend_api, cloud_infra
- 요약: 해외 언론사 기사 발행 웹사이트의 기존 소스를 인수해 다중 이미지 횡스크롤/라이트박스 UI와 대용량 이미지 업로드(S3/CloudFront) 최적화를 구현하고, 이후 운영·장애 대응을 맡는다.
- 기능: cms, file_upload, media_processing, admin_dashboard, bug_fix_maintenance, infra_devops
- 연동: aws
- 플랫폼: web, admin_web · 기술: frontend, backend, devops_infra, legacy_tech
- 추천 스택: 기존 스택 유지, AWS S3, CloudFront, TypeScript, Tailwind
- 점수: 난이도 45 · 시간 40~90h · 학습 45 · 재사용 50 · 시장 65 · 위험 50 · 명확성 50
- 근거:
  - vibe_coding_difficulty: 미지의 기존 소스 인수와 대량 이미지 업로드 최적화가 포함됨.
  - estimated_hours: 소스 파악, 갤러리 UI, 업로드 최적화, 인프라 점검 범위로 추정.
  - learning_value: S3/CloudFront 대용량 미디어 처리는 유용하나 나머지는 일반적.
  - reusability_value: 이미지 업로드·갤러리 컴포넌트는 재사용 가능하나 기존 코드 종속.
  - market_value: 이전 개발자 인수 및 유지보수 건은 흔히 반복됨.
  - technical_risk: 소스 품질과 스택이 불명이고 명세서가 없음.
- 토큰: in 8 / out 2803 · $0.0518

### 13. [freemoa:48501] 기존 웹/앱 서비스 고도화 및 추가 개발

- 예산: 2,500,000원 ~ 5,000,000원 · 기간: 40일
- 분류: **iot_device** (실제 물리 장치(센서/장비/프린터/락커/키오스크/주변기기/산업장비)와의 통신·제어가 핵심인 시스템) / 장치연동 웹/앱 고도화 · feature_extension · general · reuse low
- complexity_types: legacy_heavy, hardware_iot, multi_platform · technology_assets: core_web, backend_api, database, mobile, hardware_iot, legacy_enterprise, cloud_infra
- 요약: 운영 중인 Vue 웹 2종과 AOS/iOS 앱, Supabase 백엔드 기반 장치 연동 서비스의 기능 추가, 오류 개선, TCP 세션 처리 개선과 스토어 배포를 수행한다.
- 기능: user_management, notification_push, hardware_integration, iot_device_control, bug_fix_maintenance, app_store_release, realtime_sync
- 연동: hardware_device, aws
- 플랫폼: web, ios, android, backend_api · 기술: frontend, backend, mobile_native, database, devops_infra, legacy_tech
- 추천 스택: Vue, Supabase, TypeScript, Naver Cloud, Android Studio, Xcode
- 점수: 난이도 68 · 시간 110~200h · 학습 45 · 재사용 30 · 시장 40 · 위험 70 · 명확성 65
- 근거:
  - vibe_coding_difficulty: 기존 코드 분석, 실장치 TCP 세션 디버깅, 웹2종+앱2종 배포가 겹침
  - estimated_hours: 소스 분석, 기능·오류 수정, 장치 테스트, 스토어 배포 포함 약 110~200시간
  - learning_value: TCP 세션·장치 연동·스토어 배포 경험은 유용하나 특정 서비스에 한정
  - reusability_value: 고객 전용 장치 프로토콜과 기존 코드 수정이라 재사용 제한적
  - market_value: 장치 연동 앱 유지보수는 있으나 특정 장비 의존이 큼
  - technical_risk: TCP 세션 원인이 불확실하고 실장치·스토어 심사에 의존하며 견적도 기술검토 후 확정
- 토큰: in 12 / out 5185 · $0.0801

### 14. [freemoa:48495] 자사 iOS 앱 승인 대응

- 예산: 18,000,000원 ~ 18,000,000원 · 기간: 30일 · ⚠ 공개 정보 제한
- 분류: **mobile_app** (iOS/Android 앱이 결과물의 중심) / iOS 인앱결제 도입 · feature_extension · education · reuse medium
- complexity_types: integration_heavy, high_risk_domain, legacy_heavy · technology_assets: mobile, payments, external_api_integration, backend_api
- 요약: 비상교육 온리원 중등 2.0 iOS 레슨 앱에 애플 인앱결제(상품 구매, 복원, 내역), 이용권 연동, 결제 서버 검증을 도입하고 앱 심사 승인에 대응한다.
- 기능: payment, subscription_billing, order_management, app_store_release, authentication, legacy_migration
- 연동: erp_external
- 플랫폼: ios, backend_api · 기술: mobile_native, backend, payment
- 추천 스택: Swift, StoreKit 2, Apple App Store Server API, 기존 백엔드 스택
- 점수: 난이도 58 · 시간 120~240h · 학습 65 · 재사용 50 · 시장 62 · 위험 55 · 명확성 60
- 근거:
  - vibe_coding_difficulty: 기존 앱 코드 이해와 StoreKit, 서버 검증, 이용권 연동이 필요하다.
  - estimated_hours: 결제 UI, 복원, 서버 검증, 이용권 연동, 심사 대응을 합쳐 추정했다.
  - learning_value: StoreKit 인앱결제와 심사 대응은 다른 앱에도 쓸 수 있다.
  - reusability_value: 인앱결제 패턴은 재사용할 수 있지만 이용권 연동은 고객 전용이다.
  - market_value: iOS 인앱결제 도입은 반복되는 수요다.
  - technical_risk: 애플 심사와 기존 시스템 연동에 외부 의존이 있다.
- 토큰: in 6 / out 1146 · $0.0222

### 15. [freemoa:48491] 위하고 세무 업무 자동화 PC 프로그램 구축

- 예산: 25,000,000원 ~ 40,000,000원 · 기간: 93일
- 분류: **automation_rpa** (브라우저 자동화/RPA/업무 자동화 프로그램) / 세무 업무 자동화 PC앱 · new_build · professional_services · reuse medium
- complexity_types: integration_heavy, high_risk_domain, legacy_heavy · technology_assets: browser_automation, web_crawling, workflow_automation, security, database, external_api_integration, core_web
- 요약: 세무사무소용으로 위하고·홈택스 업무(부가세/원천세 신고, 자료 조회)를 자동화하는 Windows PC 프로그램을, 클라이언트의 Claude 작성 스크립트를 리팩토링하고 GUI, 보안, 라이선스, 인스톨러까지 갖춰 상용화한다.
- 기능: crawling_scraping, authentication, role_permission, admin_dashboard, security_hardening, legacy_migration, statistics_reporting, bug_fix_maintenance
- 연동: hardware_device
- 플랫폼: desktop · 기술: desktop_app, backend, crawling, security, frontend, ui_design, legacy_tech
- 추천 스택: Electron, TypeScript, Playwright, SQLite, SQLCipher, electron-builder
- 점수: 난이도 62 · 시간 350~600h · 학습 65 · 재사용 50 · 시장 50 · 위험 65 · 명확성 50
- 근거:
  - vibe_coding_difficulty: 타사 시스템 자동화, 2차 인증, 세무 정확성, 기존 스크립트 분석이 겹침
  - estimated_hours: 스크립트 리팩토링, GUI, 라이선스, 암호화, 인스톨러, 예외처리 포함 범위
  - learning_value: 데스크톱 앱 상용화, 라이선스, 자동화 안정화 경험을 쌓을 수 있음
  - reusability_value: 인스톨러, 라이선스, 암호화 로컬DB 구조는 재사용 가능하나 세무 로직은 종속
  - market_value: RPA 데스크톱 앱 수요는 있으나 세무 특화 도메인은 한정적
  - technical_risk: 위하고/홈택스 UI 변경, 2차 인증, 약관 문제와 세무 오류 위험
- 토큰: in 10 / out 3950 · $0.0642

### 16. [freemoa:48488] [상주] AI Agent 구축 상주 인력 모집

- 예산: 5,000,000원 ~ 10,000,000원 · 기간: 240일
- 분류: **ai_service** (LLM/RAG/영상·음성 AI 기능이 중심) / 금융사 AI Agent 개발 · staffing · finance · reuse low
- complexity_types: integration_heavy, high_risk_domain · technology_assets: ai_llm, rag_embeddings, ai_agents, external_api_integration, backend_api
- 요약: 부산 소재 금융회사에서 SDS FabriX 플랫폼으로 공통 Agent 12종과 업무 Agent 26종을 개발하는 8개월 상주 인력 투입 건. 1인 개발자는 직무 하나(개발자 1명)로 투입된다.
- 기능: llm_generation, rag_search, llm_chatbot, document_generation, search_filter
- 연동: erp_external
- 플랫폼: backend_api · 기술: backend, llm_integration, ai_ml
- 추천 스택: Python, SDS FabriX, MCP, LangChain, PostgreSQL
- 점수: 난이도 55 · 시간 1200~1500h · 학습 60 · 재사용 35 · 시장 55 · 위험 45 · 명확성 50
- 근거:
  - vibe_coding_difficulty: 전용 플랫폼 FabriX와 금융사 상주 환경, MCP 연동으로 중상 난이도.
  - estimated_hours: 8개월 상주 1인 투입 기준 약 1200~1500시간으로 추정.
  - learning_value: Agent·RAG·MCP 경험은 유용하나 FabriX는 특정 플랫폼 종속.
  - reusability_value: 고객 전용 플랫폼과 환경이라 코드 재사용은 제한적.
  - market_value: AI Agent 개발 수요는 높지만 SDS 플랫폼 한정 요소가 있음.
  - technical_risk: FabriX 의존, 금융사 내부망 및 접근 제약 가능성.
- 토큰: in 6 / out 1147 · $0.0257

### 17. [freemoa:48487] AI 기반 주거형 종합공조 토탈 플랫폼 신규 구축

- 예산: 10,000,000원 ~ 20,000,000원 · 기간: 90일
- 분류: **platform_marketplace** (중개/매칭/마켓플레이스/커뮤니티 플랫폼) / 공조 시공 매칭 플랫폼 · new_build · real_estate · reuse medium
- complexity_types: workflow_complex, integration_heavy · technology_assets: core_web, backend_api, database, authentication_authorization, admin_system, payments, external_api_integration, analytics_dashboard
- 판단 애매: project_type
- 요약: 주거형 종합공조(시스템 에어컨 등)의 견적·판매·시공 파트너 매칭·A/S를 잇는 반응형 웹 플랫폼을 신규 구축한다. 고객사 자체 AI 시스템 3종은 API로 연동한다.
- 기능: authentication, role_permission, user_management, product_catalog, cart_checkout, order_management, payment, settlement, admin_dashboard, statistics_reporting, scheduling_calendar, matching, cms, search_filter
- 연동: payment_gateway
- 플랫폼: web, mobile_web, admin_web, backend_api · 기술: frontend, backend, database, authentication, payment, ui_design, project_management
- 추천 스택: Next.js, TypeScript, Supabase, Tailwind, 토스페이먼츠, Vercel
- 점수: 난이도 50 · 시간 300~520h · 학습 55 · 재사용 62 · 시장 72 · 위험 45 · 명확성 52
- 근거:
  - vibe_coding_difficulty: 4개 역할, 커머스·결제·정산, AI API 연동으로 중간 이상 난이도.
  - estimated_hours: 기획·디자인부터 개발, QA, 인수인계까지 포함한 범위 기준.
  - learning_value: 다중 역할 마켓플레이스, 결제, 외부 API 연동 경험이 남음.
  - reusability_value: 권한·커머스·결제·정산·관리자 모듈은 재사용 가능하나 AI 연동은 전용.
  - market_value: 커머스와 O2O 매칭 플랫폼은 반복 수요가 많음.
  - technical_risk: AI API 명세가 미확정이고 범위가 넓으며 협의로 바뀔 수 있음.
- 토큰: in 6 / out 1250 · $0.0303

### 18. [freemoa:48479] 삼성 안드로이드 태블릿 웹사이트 출력 연동 APK 개발

- 예산: 800,000원 ~ 1,000,000원 · 기간: 7일
- 분류: **iot_device** (실제 물리 장치(센서/장비/프린터/락커/키오스크/주변기기/산업장비)와의 통신·제어가 핵심인 시스템) / 태블릿 프린터 출력 APK · new_build · general · reuse low
- complexity_types: hardware_iot · technology_assets: mobile, hardware_iot
- 요약: 기존 웹사이트를 삼성 Android 태블릿 WebView로 실행하고, 출력 버튼 클릭 시 생성된 PDF를 JavaScript Bridge로 받아 지정된 삼성 무선 레이저 프린터로 팝업 없이 출력하는 APK를 개발한다.
- 기능: hardware_integration, file_upload, bug_fix_maintenance
- 연동: hardware_device
- 플랫폼: android · 기술: mobile_native, qa_testing
- 추천 스택: Kotlin, Android WebView, Android Print Framework, Samsung Mobile Print SDK, IPP
- 점수: 난이도 50 · 시간 30~70h · 학습 45 · 재사용 35 · 시장 40 · 위험 55 · 명확성 70
- 근거:
  - vibe_coding_difficulty: WebView 자체는 쉬우나 무팝업 무선 프린터 출력은 실기기 의존이다.
  - estimated_hours: WebView·브리지 구현과 프린터 연동 시행착오, 실기기 테스트 포함.
  - learning_value: Android 프린팅·JS 브리지를 익히나 범위가 좁다.
  - reusability_value: WebView 브리지는 재사용 가능하나 프린터 연동은 모델 종속적이다.
  - market_value: 웹-앱-프린터 브릿지 수요는 있으나 틈새 영역이다.
  - technical_risk: 프린터 모델 미정이고 무팝업 출력 가능 여부가 불확실하다.
- 토큰: in 8 / out 2858 · $0.0481

### 19. [freemoa:48472] 해외(태국) 무인 생수 락커 SW 및 제어보드 통합 개발

- 예산: 50,000,000원 ~ 100,000,000원 · 기간: 180일
- 분류: **iot_device** (실제 물리 장치(센서/장비/프린터/락커/키오스크/주변기기/산업장비)와의 통신·제어가 핵심인 시스템) / 무인 생수 락커 제어 · new_build · commerce · reuse low
- complexity_types: hardware_iot, integration_heavy, high_risk_domain, multi_platform · technology_assets: core_web, backend_api, database, authentication_authorization, admin_system, payments, external_api_integration, hardware_iot, realtime, security, cloud_infra, ci_cd
- 요약: 태국 콘도에 설치할 30칸 무인 생수 락커용 QR 결제 PWA, 주문/관제 서버, 관리자 대시보드, ESP32-S3 펌웨어, PCB 설계와 전장부품 조달까지 통합 개발합니다.
- 기능: authentication, payment, order_management, admin_dashboard, role_permission, inventory_management, statistics_reporting, multilingual, iot_device_control, hardware_integration, notification_push, security_hardening, realtime_sync, infra_devops
- 연동: payment_gateway, hardware_device, slack
- 플랫폼: mobile_web, admin_web, backend_api, embedded · 기술: frontend, backend, database, payment, embedded, security, devops_infra, realtime
- 추천 스택: Next.js, TypeScript, Node.js, PostgreSQL, Redis, MQTT(EMQX), ESP32-S3 FreeRTOS
- 점수: 난이도 72 · 시간 900~1500h · 학습 70 · 재사용 35 · 시장 35 · 위험 72 · 명확성 80
- 근거:
  - vibe_coding_difficulty: 펌웨어·PCB·mTLS·결제 상태머신·실기기 시험이 결합되어 어렵다.
  - estimated_hours: SW 전반에 펌웨어, PCB, 부품 조달, 현지 시험까지 포함되어 범위가 크다.
  - learning_value: MQTT mTLS, ESP32 OTA, QR 결제, 동시성 제어 등 폭넓게 배운다.
  - reusability_value: 결제·관리자 모듈은 재사용되나 락커 하드웨어 제어는 전용이다.
  - market_value: 무인 판매 IoT 수요는 있으나 이 조합은 반복성이 낮다.
  - technical_risk: 해외 결제 연동, 실기기 통전, 무선 인증 등 외부 의존이 크다.
- 토큰: in 8 / out 3259 · $0.0603

### 20. [freemoa:48470] 거래소 신규 공지사항 실시간 감지 파이썬 코드 개발

- 예산: 10,000원 ~ 1,000,000원 · 기간: -
- 분류: **crawler_data_collection** (크롤러/데이터 수집기) / 거래소 공지 감지 · new_build · finance · reuse low
- complexity_types: algorithmic_specialized, realtime · technology_assets: web_crawling, backend_api, external_api_integration, data_pipeline
- 요약: 업비트·빗썸에 신규 공지가 등록될 때 목록 노출 전 공지번호를 선제 탐색해 1초 이내에 제목 등 핵심 정보를 감지하는 Python 프로그램을 만든다. 차단·Rate Limit 대응과 출력/알림 파이프라인을 포함한다.
- 기능: crawling_scraping, data_pipeline, notification_push, security_hardening
- 연동: -
- 플랫폼: backend_api · 기술: backend, crawling, security
- 추천 스택: Python, asyncio, aiohttp, httpx, Redis, Docker
- 점수: 난이도 62 · 시간 30~80h · 학습 45 · 재사용 35 · 시장 40 · 위험 80 · 명확성 50
- 근거:
  - vibe_coding_difficulty: 비공개 공지번호 패턴 역분석과 1초 이내 감지, 차단 회피가 어렵다.
  - estimated_hours: 두 거래소 패턴 분석, 비동기 탐색기, 알림, 예외 처리 포함.
  - learning_value: 비동기 고속 수집과 차단 대응을 익히나 도메인이 좁다.
  - reusability_value: 비동기 수집 틀은 재사용 가능하나 로직은 거래소 전용이다.
  - market_value: 거래소 공지 선감지 수요는 있으나 틈새 시장이다.
  - technical_risk: 패턴이 재변경될 수 있고 차단과 약관 위험이 있으며 성공 보장이 어렵다.
- 토큰: in 8 / out 2379 · $0.0410

## 분포

- vibe_coding_difficulty: 평균 56 / 중앙 62 / 범위 8~72
- estimated_hours_max: 평균 905 / 중앙 520 / 범위 40~4300
- learning_value: 평균 47 / 중앙 45 / 범위 8~72
- reusability_value: 평균 38 / 중앙 35 / 범위 15~78
- market_value: 평균 49 / 중앙 50 / 범위 25~80

## 권장 어휘 밖 코드 (다음 버전 taxonomy 후보)

- features: project_management(1)
- integrations: 없음
- skills: 없음
