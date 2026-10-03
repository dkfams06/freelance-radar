# Analyzer v3 분석 리포트

- 생성: 2026-10-03T03:20:26.893Z
- 모델: `claude-sonnet-5-5` (mode: sync)
- 비고: backend=claude-cli (claude -p, Claude 구독제). 비용은 API 단가 환산 추정치이며 실제 청구되지 않음 (구독 사용량 한도에 반영)
- 결과: 성공 20 / 실패 0 / 전체 20
- 토큰: input 202 · output 78,697 · cache write 116,804 · cache read 884,575
- 비용: $1.2563 (건당 $0.0628)

## 전체 5,287건 분석 비용 추정 (건당 평균 in 50079 / out 3935 토큰 기준)

| 모델 | 동기 호출 | Batch API (50% 할인) |
|---|---|---|
| claude-opus-5-5 | $1475.14 | $737.57 |
| claude-sonnet-5-5 (이번 실행) | $737.57 | $368.79 |
| claude-haiku-4-5 | $368.79 | $184.39 |

※ 다른 모델 행은 같은 토큰 수를 가정한 단순 환산입니다. 모델마다 사고(thinking)·출력 길이가 달라 실제 비용은 다를 수 있습니다.

## 프로젝트별 분류

| # | 제목 | 예산 | project_type | engagement | industry | complexity_types | reuse | technology_assets | 난이도 | 예상시간 | 학습 | 재사용 | 시장 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | .NET 기반 기능 수정 및 보안 개발 | 350,000원 | maintenance | feature_extension | professional_services | legacy_heavy, workflow_complex | medium | backend_api, database, security, legacy_enterprise | 48 | 20~32h | 25 | 40 | 45 |
| 2 | Spring Boot 기반 PG사 선불시스템 구축 개발 | 6,000,000원/월 | fintech_payment | staffing | finance | high_risk_domain, integration_heavy | medium | backend_api, database, payments, external_api_integration, security | 68 | 800~1400h | 65 | 50 | 55 |
| 3 | Java 기반 녹취 솔루션 구축 PL | 5,500,000원/월 | media_processing | staffing | general | legacy_heavy, integration_heavy, workflow_complex | one_off | legacy_enterprise, backend_api, speech_audio_ai | 70 | 800~1000h | 30 | 20 | 25 |
| 4 | 물류 자동화 설비 연동 WMS 반품 자동화 백엔드 개발 | 7,000,000원/월 | iot_device | staffing | logistics | hardware_iot, integration_heavy, legacy_heavy | one_off | hardware_iot, backend_api, legacy_enterprise, core_web, database | 72 | 480~760h | 35 | 25 | 35 |
| 5 | 스크린 파크골프 브랜드 신규 홈페이지 제작 | 1,000,000원 | website | design_publishing | sports | standard_crud | low | core_web | 8 | 20~40h | 8 | 25 | 70 |
| 6 | Oracle 기반 생산계획 시스템 구축 PL | 8,000,000원/월 | business_management | staffing | manufacturing | workflow_complex, legacy_heavy | low | database, analytics_dashboard, legacy_enterprise, backend_api | 62 | 400~600h | 30 | 28 | 40 |
| 7 | 예약 플랫폼 프론트/백엔드 연동 및 해외 결제 시스템 구축 | 15,000,000원 | reservation | new_build | general | integration_heavy, workflow_complex, high_risk_domain | high | core_web, backend_api, database, authentication_authorization, admin_system, payments, external_api_integration, cloud_infra | 50 | 180~320h | 70 | 78 | 78 |
| 8 | APM/DR 기반 금융권 차세대 인프라 관제 및 금융보안 분석 | 7,000,000원/월 | enterprise_infra | staffing | finance | high_risk_domain, legacy_heavy | one_off | legacy_enterprise, security, cloud_infra | 80 | 3000~4500h | 25 | 15 | 25 |
| 9 | EDW/CDC·ETL 기반 금융권 차세대 정보계 분석·설계 | 7,000,000원/월 | data_dashboard | staffing | finance | high_risk_domain, legacy_heavy | low | data_pipeline, database, legacy_enterprise, analytics_dashboard | 80 | 2800~4500h | 30 | 15 | 30 |
| 10 | 중등 온라인 교육 서비스 모바일 앱·반응형 웹 QA | 4,000,000원/월 | other | staffing | education | multi_platform, workflow_complex | low | mobile, core_web | 30 | 320~400h | 35 | 30 | 50 |
| 11 | 유소년 스포츠 등번호 AI 하이라이트 웹 MVP 개발 | 5,000,000원 | ai_service | new_build | sports | algorithmic_specialized, workflow_complex | medium | computer_vision, ocr_document_ai, data_pipeline, backend_api, core_web, database, cloud_infra, admin_system | 62 | 130~240h | 72 | 55 | 50 |
| 12 | 언론 웹사이트 추가 개발 및 유지보수 | 10,000원 ~ 1,000,000원 | maintenance | feature_extension | media_content | legacy_heavy, integration_heavy | medium | core_web, backend_api, cloud_infra | 45 | 40~90h | 45 | 50 | 60 |
| 13 | 기존 웹/앱 서비스 고도화 및 추가 개발 | 2,500,000원 ~ 5,000,000원 | iot_device | maintenance | general | legacy_heavy, hardware_iot, multi_platform, integration_heavy | one_off | core_web, backend_api, database, mobile, hardware_iot, cloud_infra, legacy_enterprise | 68 | 120~240h | 45 | 25 | 45 |
| 14 | 자사 iOS 앱 승인 대응 | 18,000,000원 ~ 18,000,000원 | mobile_app | feature_extension | education | integration_heavy, high_risk_domain, legacy_heavy | medium | mobile, payments, external_api_integration, backend_api | 55 | 120~240h | 65 | 60 | 65 |
| 15 | 위하고 세무 업무 자동화 PC 프로그램 구축 | 25,000,000원 ~ 40,000,000원 | automation_rpa | new_build | professional_services | integration_heavy, high_risk_domain, legacy_heavy | medium | browser_automation, web_crawling, security, authentication_authorization, external_api_integration, database | 62 | 280~480h | 68 | 55 | 55 |
| 16 | [상주] AI Agent 구축 상주 인력 모집 | 5,000,000원 ~ 10,000,000원 | ai_service | staffing | finance | integration_heavy, high_risk_domain | medium | ai_llm, rag_embeddings, ai_agents, backend_api, external_api_integration | 58 | 800~1400h | 65 | 50 | 65 |
| 17 | AI 기반 주거형 종합공조 토탈 플랫폼 신규 구축 | 10,000,000원 ~ 20,000,000원 | platform_marketplace | new_build | real_estate | integration_heavy, workflow_complex | medium | core_web, backend_api, database, authentication_authorization, admin_system, payments, external_api_integration, analytics_dashboard, ai_llm | 48 | 320~560h | 55 | 68 | 72 |
| 18 | 삼성 안드로이드 태블릿 웹사이트 출력 연동 APK 개발 | 800,000원 ~ 1,000,000원 | iot_device | new_build | general | hardware_iot, integration_heavy | low | mobile, hardware_iot, external_api_integration | 52 | 30~70h | 35 | 35 | 40 |
| 19 | 해외(태국) 무인 생수 락커 SW 및 제어보드 통합 개발 | 50,000,000원 ~ 100,000,000원 | iot_device | new_build | commerce | hardware_iot, integration_heavy, high_risk_domain, workflow_complex, multi_platform | medium | core_web, backend_api, database, authentication_authorization, admin_system, payments, external_api_integration, realtime, hardware_iot, security, cloud_infra, ci_cd | 78 | 700~1300h | 65 | 45 | 35 |
| 20 | 거래소 신규 공지사항 실시간 감지 파이썬 코드 개발 | 10,000원 ~ 1,000,000원 | crawler_data_collection | new_build | finance | algorithmic_specialized, integration_heavy, realtime | low | web_crawling, backend_api, data_pipeline, external_api_integration | 62 | 30~80h | 45 | 30 | 35 |

## 분류가 애매한 케이스

- [wishket:158857] .NET 기반 기능 수정 및 보안 개발 — AI 판단 애매: project_type, industry
- [wishket:158882] Spring Boot 기반 PG사 선불시스템 구축 개발 — AI 판단 애매: industry, reuse_level
- [wishket:158896] Java 기반 녹취 솔루션 구축 PL — AI 판단 애매: industry, technology_assets
- [wishket:158891] 물류 자동화 설비 연동 WMS 반품 자동화 백엔드 개발 — AI 판단 애매: project_type, industry
- [wishket:158892] 스크린 파크골프 브랜드 신규 홈페이지 제작 — AI 판단 애매: engagement_type
- [wishket:158884] Oracle 기반 생산계획 시스템 구축 PL — AI 판단 애매: project_type, reuse_level
- [wishket:158850] 예약 플랫폼 프론트/백엔드 연동 및 해외 결제 시스템 구축 — AI 판단 애매: engagement_type, industry
- [wishket:158890] APM/DR 기반 금융권 차세대 인프라 관제 및 금융보안 분석·설계 — AI 판단 애매: reuse_level
- [wishket:158888] EDW/CDC·ETL 기반 금융권 차세대 정보계 분석·설계 — AI 판단 애매: complexity_types
- [wishket:158878] 중등 온라인 교육 서비스 모바일 앱·반응형 웹 QA — project_type=other; AI 판단 애매: project_type, technology_assets
- [freemoa:48504] 유소년 스포츠 등번호 AI 하이라이트 웹 MVP 개발 — AI 판단 애매: project_type, reuse_level
- [freemoa:48502] 언론 웹사이트 추가 개발 및 유지보수 — AI 판단 애매: project_type
- [freemoa:48501] 기존 웹/앱 서비스 고도화 및 추가 개발 — complexity_types 4개; AI 판단 애매: project_type, engagement_type, industry
- [freemoa:48495] 자사 iOS 앱 승인 대응 — AI 판단 애매: project_type, complexity_types
- [freemoa:48491] 위하고 세무 업무 자동화 PC 프로그램 구축 — AI 판단 애매: engagement_type, complexity_types
- [freemoa:48488] [상주] AI Agent 구축 상주 인력 모집 — AI 판단 애매: reuse_level
- [freemoa:48487] AI 기반 주거형 종합공조 토탈 플랫폼 신규 구축 — AI 판단 애매: project_type, industry
- [freemoa:48479] 삼성 안드로이드 태블릿 웹사이트 출력 연동 APK 개발 — AI 판단 애매: project_type, industry
- [freemoa:48472] 해외(태국) 무인 생수 락커 SW 및 제어보드 통합 개발 — complexity_types 5개; AI 판단 애매: project_type, complexity_types
- [freemoa:48470] 거래소 신규 공지사항 실시간 감지 파이썬 코드 개발 — AI 판단 애매: reuse_level

## 분류별 샘플 건수

- project_type: iot_device 4, ai_service 2, maintenance 2, automation_rpa 1, business_management 1, crawler_data_collection 1, data_dashboard 1, enterprise_infra 1, fintech_payment 1, media_processing 1, mobile_app 1, other 1, platform_marketplace 1, reservation 1, website 1
- engagement_type: staffing 8, new_build 7, feature_extension 3, design_publishing 1, maintenance 1
- industry: finance 5, general 4, education 2, professional_services 2, sports 2, commerce 1, logistics 1, manufacturing 1, media_content 1, real_estate 1
- reuse_level: medium 9, low 6, one_off 4, high 1
- complexity_types: integration_heavy 13, legacy_heavy 10, high_risk_domain 8, workflow_complex 8, hardware_iot 4, multi_platform 3, algorithmic_specialized 2, realtime 1, standard_crud 1
- technology_assets: backend_api 14, database 11, core_web 9, external_api_integration 9, legacy_enterprise 7, cloud_infra 6, payments 5, security 5, admin_system 4, authentication_authorization 4, hardware_iot 4, mobile 4, analytics_dashboard 3, data_pipeline 3, ai_llm 2, web_crawling 2, ai_agents 1, browser_automation 1, ci_cd 1, computer_vision 1, ocr_document_ai 1, rag_embeddings 1, realtime 1, speech_audio_ai 1

## 상세

### 1. [wishket:158857] .NET 기반 기능 수정 및 보안 개발

- 예산: 350,000원 · 기간: 3일
- 분류: **maintenance** (기존 시스템 유지보수가 본질) / 법조인 검색 보안 기능 · feature_extension · professional_services · reuse medium
- complexity_types: legacy_heavy, workflow_complex · technology_assets: backend_api, database, security, legacy_enterprise
- 판단 애매: project_type, industry
- 요약: 운영 중인 .NET 법조인 인명 검색 시스템에 IP·채널별 과다 조회 탐지, 단계적 접속 차단(429), 관리자 이메일 알림 기능을 추가하고 현직 선택 항목 3종을 추가한다.
- 기능: security_hardening, notification_email, admin_dashboard, bug_fix_maintenance, statistics_reporting
- 연동: email_service
- 플랫폼: web, backend_api · 기술: backend, database, security, legacy_tech
- 추천 스택: ASP.NET, C#, MSSQL, Windows Server, Visual Studio 2019
- 점수: 난이도 48 · 시간 20~32h · 학습 25 · 재사용 40 · 시장 45 · 위험 50 · 명확성 78
- 근거:
  - vibe_coding_difficulty: 레거시 .NET 분석과 VPN 환경, 운영 서비스 수정 부담이 있음
  - estimated_hours: 레이트리밋, 차단 단계, 메일, DB 설정, 항목 추가로 약 20~32시간
  - learning_value: 레거시 .NET 중심이나 rate limiting 개념은 재사용 가능
  - reusability_value: 레이트리밋 로직은 일부 재사용되나 고객 코드에 종속됨
  - market_value: 레거시 .NET 유지보수 및 보안 요청은 꾸준히 있음
  - technical_risk: 기존 코드 불확실성, 운영 데이터 훼손 우려, 3.5일의 짧은 일정
- 토큰: in 10 / out 3981 · $0.0829

### 2. [wishket:158882] Spring Boot 기반 PG사 선불시스템 구축 개발

- 예산: 6,000,000원/월 · 기간: 210일
- 분류: **fintech_payment** (PG/선불/결제 인프라/핀테크 시스템) / PG사 선불결제 시스템 · staffing · finance · reuse medium
- complexity_types: high_risk_domain, integration_heavy · technology_assets: backend_api, database, payments, external_api_integration, security
- 판단 애매: industry, reuse_level
- 요약: PG사 선불결제 시스템 구축 프로젝트에 Spring Boot 개발자 1명이 공덕역 인근에 상주해 PG결제 영역을 개발하는 기간제 투입 건입니다.
- 기능: payment, authentication, settlement, admin_dashboard, order_management, security_hardening
- 연동: payment_gateway
- 플랫폼: backend_api, admin_web · 기술: backend, database, payment, security
- 추천 스택: Spring Boot, Java, PostgreSQL, Redis, Docker
- 점수: 난이도 68 · 시간 800~1400h · 학습 65 · 재사용 50 · 시장 55 · 위험 60 · 명확성 20
- 근거:
  - vibe_coding_difficulty: 금융 결제 도메인과 상주 환경, 범위 불명확으로 난도가 높음.
  - estimated_hours: 7~8개월 기간제이나 담당 범위가 PG결제 영역 일부로 추정됨.
  - learning_value: PG·선불 결제 구조 경험은 가치가 크나 상주 환경 제약이 있음.
  - reusability_value: 결제 모듈 경험은 재사용 가능하나 코드는 고객사에 종속됨.
  - market_value: 결제 시스템 구축 수요는 꾸준하나 PG사 선불은 특수 영역임.
  - technical_risk: 금전 오류 비용이 크고 기존 시스템과 범위가 불확실함.
- 토큰: in 6 / out 1125 · $0.0428

### 3. [wishket:158896] Java 기반 녹취 솔루션 구축 PL

- 예산: 5,500,000원/월 · 기간: 180일
- 분류: **media_processing** (녹취/영상·음성 처리/미디어 분석 파이프라인) / 콜센터 녹취 솔루션 PL · staffing · general · reuse one_off
- complexity_types: legacy_heavy, integration_heavy, workflow_complex · technology_assets: legacy_enterprise, backend_api, speech_audio_ai
- 판단 애매: industry, technology_assets
- 요약: 콜센터 녹취 솔루션 구축 사업에서 녹취 영역을 맡아 고객사 협의, 분석·설계, 일정 조율과 내부 개발 리딩을 수행하는 시니어 PL을 폐쇄망 환경에 상주 투입하는 6개월 기간제 공고.
- 기능: speech_processing, media_processing, hardware_integration
- 연동: -
- 플랫폼: backend_api · 기술: backend, project_management, legacy_tech
- 추천 스택: Java, Spring Boot, PostgreSQL
- 점수: 난이도 70 · 시간 800~1000h · 학습 30 · 재사용 20 · 시장 25 · 위험 55 · 명확성 35
- 근거:
  - vibe_coding_difficulty: 폐쇄망 상주, CTI·자체 엔진 의존으로 AI 활용이 제한됨.
  - estimated_hours: 6개월 상주 PL 업무, 월 140~170시간 기준 추정.
  - learning_value: 콜 인프라·녹취 도메인 지식은 특수해서 범용 가치가 낮음.
  - reusability_value: 특정 회사 엔진과 폐쇄망에 종속되어 재사용이 어려움.
  - market_value: 녹취 솔루션 PL 수요는 있으나 시장이 좁고 전문적임.
  - technical_risk: 산출물 범위가 불명확하고 엔진 연동 불확실성이 있음.
- 토큰: in 14 / out 6623 · $0.0994

### 4. [wishket:158891] 물류 자동화 설비 연동 WMS 반품 자동화 백엔드 개발

- 예산: 7,000,000원/월 · 기간: 120일
- 분류: **iot_device** (무인 기기/장치/센서 중심 시스템 (기기 + 서버/앱)) / WMS 반품 설비 연동 · staffing · logistics · reuse one_off
- complexity_types: hardware_iot, integration_heavy, legacy_heavy · technology_assets: hardware_iot, backend_api, legacy_enterprise, core_web, database
- 판단 애매: project_type, industry
- 요약: 홈쇼핑 WMS의 반품 자동화 설비(소터, 바코드리더기) 연동 백엔드와 관련 WMS 화면을 개발하는 상주 인력 투입 건입니다. 설비 테스트부터 시스템 오픈까지 수행하고, 마이플랫폼 UI는 React로 전환합니다.
- 기능: hardware_integration, iot_device_control, inventory_management, order_management, legacy_migration, admin_dashboard
- 연동: hardware_device
- 플랫폼: web, backend_api, embedded · 기술: backend, frontend, legacy_tech, embedded, qa_testing, database
- 추천 스택: Java, Spring Boot, React, TypeScript, Oracle, Netty
- 점수: 난이도 72 · 시간 480~760h · 학습 35 · 재사용 25 · 시장 35 · 위험 70 · 명확성 50
- 근거:
  - vibe_coding_difficulty: 실설비·PLC·시리얼 연동과 현장 테스트 의존으로 AI 단독 구현이 어렵다.
  - estimated_hours: 4개월 상주 2인 파트, 설비 연동·화면·통합테스트·오픈 포함 추정.
  - learning_value: 소켓/전문 파싱은 유용하나 특정 설비·레거시 지식 위주다.
  - reusability_value: 설비 프로토콜과 고객 WMS에 종속되어 재사용이 적다.
  - market_value: 물류 설비 연동 수요는 있으나 범용성은 낮다.
  - technical_risk: 실기기 테스트, 현장 상주, 오픈 일정 의존으로 위험이 크다.
- 토큰: in 18 / out 7854 · $0.1040

### 5. [wishket:158892] 스크린 파크골프 브랜드 신규 홈페이지 제작

- 예산: 1,000,000원 · 기간: 14일
- 분류: **website** (기업/브랜드 홈페이지, 랜딩) / 브랜드 홈페이지(아임웹) · design_publishing · sports · reuse low
- complexity_types: standard_crud · technology_assets: core_web
- 판단 애매: engagement_type
- 요약: 스크린 파크골프 제조·판매 기업의 브랜드 소개, 제품 및 렌탈/판매 안내, 온라인 문의 접수용 반응형 홈페이지를 아임웹 등 웹빌더로 기획·디자인·구축한다.
- 기능: landing_page, cms, admin_dashboard, notification_email
- 연동: -
- 플랫폼: web, mobile_web, admin_web · 기술: frontend, ui_design
- 추천 스택: 아임웹, Figma
- 점수: 난이도 8 · 시간 20~40h · 학습 8 · 재사용 25 · 시장 70 · 위험 12 · 명확성 55
- 근거:
  - vibe_coding_difficulty: 웹빌더 기반 소규모 홈페이지로 코딩 비중이 거의 없음.
  - estimated_hours: 기획·디자인·세팅 포함 20~40시간.
  - learning_value: 웹빌더 작업이라 새로 배울 기술이 적음.
  - reusability_value: 웹빌더 템플릿 노하우 외 재사용 코드 거의 없음.
  - market_value: 웹빌더 홈페이지 제작은 외주 시장에서 매우 흔함.
  - technical_risk: 기술 위험은 낮고 10/15 기한 준수만 관건.
- 토큰: in 6 / out 1043 · $0.0229

### 6. [wishket:158884] Oracle 기반 생산계획 시스템 구축 PL

- 예산: 8,000,000원/월 · 기간: 90일
- 분류: **business_management** (사내 업무관리/ERP/그룹웨어/MES) / 생산계획 시스템 PL · staffing · manufacturing · reuse low
- complexity_types: workflow_complex, legacy_heavy · technology_assets: database, analytics_dashboard, legacy_enterprise, backend_api
- 판단 애매: project_type, reuse_level
- 요약: 제조업 생산계획 영역의 납기 지연 사유 분석, 납기 시뮬레이션, Early Warning, 대시보드를 Oracle/PL-SQL로 구축하는 프로젝트의 상주 PL 인력 모집 공고입니다.
- 기능: statistics_reporting, admin_dashboard, scheduling_calendar, notification_email, data_pipeline
- 연동: -
- 플랫폼: web, admin_web · 기술: database, backend, legacy_tech, project_management, data_engineering
- 추천 스택: Oracle, PL/SQL, Java, Spring, Grafana
- 점수: 난이도 62 · 시간 400~600h · 학습 30 · 재사용 28 · 시장 40 · 위험 50 · 명확성 35
- 근거:
  - vibe_coding_difficulty: 기존 Oracle 시스템과 제조 도메인에 상주 PL 업무라 난이도가 높음.
  - estimated_hours: 약 3.5개월 상주 기간 중 개발 몫만 추정함.
  - learning_value: Oracle/PL-SQL과 제조 도메인 지식이 중심이라 확장성이 제한적임.
  - reusability_value: 고객사 전용 생산계획 로직이라 재사용이 적음.
  - market_value: 제조 생산계획/MES 상주 수요는 있으나 범위가 좁음.
  - technical_risk: 기존 시스템 상태와 시뮬레이션 정확도가 불명확하고 투입 일정이 촉박함.
- 토큰: in 10 / out 3932 · $0.0604

### 7. [wishket:158850] 예약 플랫폼 프론트/백엔드 연동 및 해외 결제 시스템 구축

- 예산: 15,000,000원 · 기간: 60일
- 분류: **reservation** (예약/예약관리) / 시간 단위 예약 플랫폼 · new_build · general · reuse high
- complexity_types: integration_heavy, workflow_complex, high_risk_domain · technology_assets: core_web, backend_api, database, authentication_authorization, admin_system, payments, external_api_integration, cloud_infra
- 판단 애매: engagement_type, industry
- 요약: 파트너와 글로벌 고객을 잇는 시간 단위 예약 플랫폼의 백엔드를 구축하고, 기존 React 프로토타입 3종(고객·파트너·관리자)을 연동하며 해외 결제 PG와 중복 예약 방지 로직을 구현한다.
- 기능: authentication, reservation, scheduling_calendar, payment, admin_dashboard, role_permission, order_management, infra_devops, multilingual
- 연동: payment_gateway, easy_pay, firebase, aws
- 플랫폼: web, admin_web, backend_api · 기술: frontend, backend, database, authentication, payment, devops_infra
- 추천 스택: Next.js, TypeScript, Supabase, Stripe, PayPal, Vercel
- 점수: 난이도 50 · 시간 180~320h · 학습 70 · 재사용 78 · 시장 78 · 위험 50 · 명확성 72
- 근거:
  - vibe_coding_difficulty: 예약 CRUD는 쉬우나 동시성 제어와 다중 해외 PG 연동이 난이도를 올림.
  - estimated_hours: 3개 웹 연동, 백엔드, 결제 5종, 배포를 포함해 약 180~320시간.
  - learning_value: 해외 결제 연동과 동시성 제어는 이후 프로젝트에도 계속 쓸 수 있음.
  - reusability_value: 예약·결제·관리자·권한 구조는 다른 프로젝트에서 재사용도가 높음.
  - market_value: 예약 플랫폼과 결제 연동은 외주에서 자주 반복되는 유형임.
  - technical_risk: 위챗페이·라인페이 가맹 심사와 중복 예약 방지, 기존 프로토타입 품질이 변수임.
- 토큰: in 8 / out 2591 · $0.0452

### 8. [wishket:158890] APM/DR 기반 금융권 차세대 인프라 관제 및 금융보안 분석·설계

- 예산: 7,000,000원/월 · 기간: 810일
- 분류: **enterprise_infra** (DR/관제/인프라 설계 등 엔터프라이즈 인프라) / 금융 APM/DR 관제 설계 · staffing · finance · reuse one_off
- complexity_types: high_risk_domain, legacy_heavy · technology_assets: legacy_enterprise, security, cloud_infra
- 판단 애매: reuse_level
- 요약: 예탁결제원 차세대 사업의 APM/E2E 거래추적, SiteScope 관제, 통합 로그, DR 시나리오 및 금융보안 체계를 분석·설계하는 시니어 상주 인력 투입 공고.
- 기능: infra_devops, security_hardening, statistics_reporting
- 연동: -
- 플랫폼: other · 기술: devops_infra, security, legacy_tech, project_management
- 추천 스택: SiteScope, APM(Scouter/Jennifer), ELK Stack, Unix/Linux
- 점수: 난이도 80 · 시간 3000~4500h · 학습 25 · 재사용 15 · 시장 25 · 위험 65 · 명확성 40
- 근거:
  - vibe_coding_difficulty: 코드보다 금융권 상주 설계 업무라 AI agent 활용 여지가 작고 폐쇄환경이다.
  - estimated_hours: 27개월 상주 설계 인력 투입이며 범위가 불명확해 폭넓게 추정했다.
  - learning_value: 금융 인프라 설계 지식은 있으나 코드 자산이 적고 도메인 특화다.
  - reusability_value: 특정 기관 설계 산출물 중심이라 재사용이 낮다.
  - market_value: 금융권 상주 인력 수요는 있으나 1인 개발자 외주와는 거리가 있다.
  - technical_risk: 제안 단계라 투입이 불확실하고 대형 금융 레거시 환경 의존이 크다.
- 토큰: in 6 / out 1140 · $0.0234

### 9. [wishket:158888] EDW/CDC·ETL 기반 금융권 차세대 정보계 분석·설계

- 예산: 7,000,000원/월 · 기간: 810일
- 분류: **data_dashboard** (BI/통계/대시보드/데이터 분석) / 금융 차세대 정보계 설계 · staffing · finance · reuse low
- complexity_types: high_risk_domain, legacy_heavy · technology_assets: data_pipeline, database, legacy_enterprise, analytics_dashboard
- 판단 애매: complexity_types
- 요약: 예탁결제원 InfoSAFE 차세대 정보계(EDW, OLAP, CDC/ETL) 개편의 분석·설계를 맡을 테크 리드급 인력을 여의도 상주로 모집한다. 제안 단계 프로젝트다.
- 기능: data_pipeline, statistics_reporting, legacy_migration
- 연동: -
- 플랫폼: backend_api · 기술: data_engineering, database, legacy_tech
- 추천 스택: Oracle GoldenGate, Oracle, ETL 도구, OLAP
- 점수: 난이도 80 · 시간 2800~4500h · 학습 30 · 재사용 15 · 시장 30 · 위험 65 · 명확성 40
- 근거:
  - vibe_coding_difficulty: 상주 금융 레거시 정보계 분석·설계로 AI 활용 여지가 작음.
  - estimated_hours: 27개월 상주 중 설계 단계 범위를 유추해 추정함.
  - learning_value: EDW/CDC 지식은 있으나 특정 레거시 중심이라 제한적.
  - reusability_value: 기관 종속 설계 산출물이라 재사용이 어려움.
  - market_value: 금융권 정보계 인력 수요는 있으나 1인 외주로는 드묾.
  - technical_risk: 제안 탈락 시 투입 불발, 금융 대용량 데이터 요건이 위험.
- 토큰: in 8 / out 2887 · $0.0438

### 10. [wishket:158878] 중등 온라인 교육 서비스 모바일 앱·반응형 웹 QA

- 예산: 4,000,000원/월 · 기간: 60일
- 분류: **other** (위 어디에도 정말 맞지 않음) / 교육 앱·웹 QA 상주 · staffing · education · reuse low
- complexity_types: multi_platform, workflow_complex · technology_assets: mobile, core_web
- 판단 애매: project_type, technology_assets
- 요약: 중학생 대상 온라인 동영상 강의 서비스의 iOS/Android 앱과 반응형 웹 품질 검증을 위해 QA 엔지니어 1명이 서초구에 2개월 상주하는 인력 투입 공고입니다.
- 기능: bug_fix_maintenance
- 연동: -
- 플랫폼: ios, android, web, admin_web · 기술: qa_testing, project_management
- 추천 스택: Jira, Playwright, BrowserStack, Appium, TestRail
- 점수: 난이도 30 · 시간 320~400h · 학습 35 · 재사용 30 · 시장 50 · 위험 25 · 명확성 65
- 근거:
  - vibe_coding_difficulty: 코드 작성보다 수동 QA 중심이며 자동화는 선택 사항입니다.
  - estimated_hours: 2개월 상주 기준 주 40시간 안팎으로 추정했습니다.
  - learning_value: QA 프로세스와 테스트 자동화 경험은 쌓지만 코드 자산은 적습니다.
  - reusability_value: 테스트 케이스 템플릿 정도만 재사용할 수 있습니다.
  - market_value: QA 인력 구인은 흔하지만 개발 외주와는 성격이 다릅니다.
  - technical_risk: 일정은 촉박하지만 기술적 위험은 낮습니다.
- 토큰: in 10 / out 3302 · $0.0513

### 11. [freemoa:48504] 유소년 스포츠 등번호 AI 하이라이트 웹 MVP 개발

- 예산: 5,000,000원 · 기간: 45일
- 분류: **ai_service** (LLM/RAG/영상·음성 AI 기능이 중심) / 등번호 AI 하이라이트 · new_build · sports · reuse medium
- complexity_types: algorithmic_specialized, workflow_complex · technology_assets: computer_vision, ocr_document_ai, data_pipeline, backend_api, core_web, database, cloud_infra, admin_system
- 판단 애매: project_type, reuse_level
- 요약: 유소년 축구 경기 영상을 업로드하면 등번호를 인식해 선수별 구간 추출·하이라이트를 생성하고, 학부모가 앱형 모바일 웹(PWA)에서 자녀 영상을 시청하는 MVP. 관리자 웹과 확장 가능한 비동기 처리 구조 설계 문서를 포함한다.
- 기능: admin_dashboard, user_management, file_upload, computer_vision, media_processing, video_streaming, data_pipeline, search_filter, public_api
- 연동: aws
- 플랫폼: admin_web, mobile_web, web, backend_api · 기술: frontend, backend, computer_vision, ai_ml, devops_infra, database
- 추천 스택: Next.js, TypeScript, Python FastAPI, YOLO/OpenCV/PaddleOCR, FFmpeg, AWS S3, Redis/Celery
- 점수: 난이도 62 · 시간 130~240h · 학습 72 · 재사용 55 · 시장 50 · 위험 65 · 명확성 72
- 근거:
  - vibe_coding_difficulty: 실제 경기영상 등번호 OCR 정확도 검증이 어렵고 영상 파이프라인이 필요하다.
  - estimated_hours: 관리자, PWA, 비동기 영상처리, 등번호 인식 튜닝, 설계문서를 포함한다.
  - learning_value: CV/OCR, FFmpeg, 비동기 영상 파이프라인 경험을 쌓을 수 있다.
  - reusability_value: 업로드·큐·관리자는 재사용 가능하나 인식 로직은 도메인 특화다.
  - market_value: 스포츠 영상 AI 수요는 있으나 시장이 한정적이다.
  - technical_risk: 작은 등번호·가림·저해상도로 정확도 미달 위험이 크고 GPU 비용도 변수다.
- 토큰: in 6 / out 1793 · $0.0358

### 12. [freemoa:48502] 언론 웹사이트 추가 개발 및 유지보수

- 예산: 10,000원 ~ 1,000,000원 · 기간: 30일
- 분류: **maintenance** (기존 시스템 유지보수가 본질) / 언론 사이트 인수·유지보수 · feature_extension · media_content · reuse medium
- complexity_types: legacy_heavy, integration_heavy · technology_assets: core_web, backend_api, cloud_infra
- 판단 애매: project_type
- 요약: 중단된 해외 언론사 기사 발행 웹사이트의 소스를 인수해 다중 이미지 횡스크롤 UI와 기사당 200장 이상 대용량 이미지 업로드(S3/CloudFront) 최적화를 개발하고, 이후 월 유지보수를 맡는다.
- 기능: file_upload, cms, admin_dashboard, media_processing, infra_devops, bug_fix_maintenance
- 연동: aws
- 플랫폼: web, admin_web · 기술: frontend, backend, devops_infra
- 추천 스택: 기존 스택 유지, AWS S3, CloudFront, TypeScript, Sharp
- 점수: 난이도 45 · 시간 40~90h · 학습 45 · 재사용 50 · 시장 60 · 위험 45 · 명확성 50
- 근거:
  - vibe_coding_difficulty: 미확인 기존 소스 인수와 대용량 이미지 업로드 최적화 포함.
  - estimated_hours: 소스 파악, 갤러리 UI, S3 업로드 최적화로 40~90시간 추정.
  - learning_value: S3/CloudFront 대용량 미디어 처리와 인수 경험을 얻음.
  - reusability_value: 이미지 업로드·갤러리 모듈은 재사용 가능하나 기존 코드 종속.
  - market_value: 인수인계·유지보수·이미지 최적화 요청은 흔함.
  - technical_risk: 스택·코드 품질 불명, 명세서 없음, 예산 낮음.
- 토큰: in 10 / out 4017 · $0.0658

### 13. [freemoa:48501] 기존 웹/앱 서비스 고도화 및 추가 개발

- 예산: 2,500,000원 ~ 5,000,000원 · 기간: 40일
- 분류: **iot_device** (무인 기기/장치/센서 중심 시스템 (기기 + 서버/앱)) / 장치 연동 앱 고도화 · maintenance · general · reuse one_off
- complexity_types: legacy_heavy, hardware_iot, multi_platform, integration_heavy · technology_assets: core_web, backend_api, database, mobile, hardware_iot, cloud_infra, legacy_enterprise
- 판단 애매: project_type, engagement_type, industry
- 요약: Vue 웹 2종과 AOS/iOS 앱, Supabase 백엔드로 운영 중인 장치 연동 서비스의 기능 추가와 오류 수정을 맡는 프로젝트입니다. 장치 동기화와 LTE 재접속 시 TCP 세션 오류를 개선하고, 앱 스토어 배포까지 진행합니다.
- 기능: user_management, notification_push, iot_device_control, hardware_integration, bug_fix_maintenance, app_store_release, realtime_sync
- 연동: supabase, hardware_device
- 플랫폼: web, admin_web, ios, android · 기술: frontend, backend, database, mobile_native, embedded, legacy_tech, devops_infra
- 추천 스택: Vue, Supabase, TypeScript, Naver Cloud, Android/iOS 기존 스택
- 점수: 난이도 68 · 시간 120~240h · 학습 45 · 재사용 25 · 시장 45 · 위험 70 · 명확성 62
- 근거:
  - vibe_coding_difficulty: 기존 코드 분석, 실기기 TCP 세션 디버깅, 앱 2종 배포가 겹침
  - estimated_hours: 웹 2종과 앱 2종 수정, TCP 디버깅, 스토어 배포를 합쳐 약 120~240시간
  - learning_value: TCP 세션과 장치 연동, 스토어 배포를 익히지만 특정 서비스에 한정됨
  - reusability_value: 특정 회사 장치와 레거시 코드에 종속되어 재사용이 적음
  - market_value: 장치 연동 앱 유지보수는 드물지 않지만 도메인이 특수함
  - technical_risk: TCP 오류 원인이 불확실하고 실기기에 의존하며 견적도 기술검토 후 확정됨
- 토큰: in 10 / out 3949 · $0.0618

### 14. [freemoa:48495] 자사 iOS 앱 승인 대응

- 예산: 18,000,000원 ~ 18,000,000원 · 기간: 30일 · ⚠ 공개 정보 제한
- 분류: **mobile_app** (iOS/Android 앱이 결과물의 중심) / iOS 인앱결제 도입 · feature_extension · education · reuse medium
- complexity_types: integration_heavy, high_risk_domain, legacy_heavy · technology_assets: mobile, payments, external_api_integration, backend_api
- 판단 애매: project_type, complexity_types
- 요약: 비상교육 온리원 중등 2.0 iOS 앱에 애플 인앱결제(상품 구매, 복원, 내역)와 이용권 연동, 결제 서버 검증을 추가해 앱 심사 승인에 대응한다.
- 기능: payment, order_management, user_management, notification_push, bug_fix_maintenance, app_store_release
- 연동: payment_gateway
- 플랫폼: ios, backend_api · 기술: mobile_native, backend, payment, legacy_tech
- 추천 스택: Swift, StoreKit 2, App Store Server API, 기존 백엔드 스택
- 점수: 난이도 55 · 시간 120~240h · 학습 65 · 재사용 60 · 시장 65 · 위험 55 · 명확성 60
- 근거:
  - vibe_coding_difficulty: 기존 앱 코드 이해와 StoreKit 결제·서버 검증 연동이 필요하다.
  - estimated_hours: 30일 도급, 앱 결제 UI와 이용권·서버 연동 포함해 120~240시간으로 추정.
  - learning_value: StoreKit 인앱결제와 영수증 검증은 다른 앱에도 쓸 수 있다.
  - reusability_value: 인앱결제 모듈은 재사용할 수 있지만 이용권 연동은 고객 종속이다.
  - market_value: 앱 심사 대응용 인앱결제 도입 수요는 꾸준하다.
  - technical_risk: 애플 심사 승인과 기존 이용권 시스템 연동의 불확실성이 있다.
- 토큰: in 14 / out 6515 · $0.0876

### 15. [freemoa:48491] 위하고 세무 업무 자동화 PC 프로그램 구축

- 예산: 25,000,000원 ~ 40,000,000원 · 기간: 93일
- 분류: **automation_rpa** (브라우저 자동화/RPA/업무 자동화 프로그램) / 세무 업무 자동화 PC앱 · new_build · professional_services · reuse medium
- complexity_types: integration_heavy, high_risk_domain, legacy_heavy · technology_assets: browser_automation, web_crawling, security, authentication_authorization, external_api_integration, database
- 판단 애매: engagement_type, complexity_types
- 요약: 세무사무소용 위하고·홈택스 업무(부가세·원천세 신고, 자료 조회) 자동화 Windows PC 프로그램을 만듭니다. 클라이언트가 AI로 작성한 로직을 리팩토링하고 GUI, 보안, 라이선스, 인스톨러까지 상용화합니다.
- 기능: crawling_scraping, authentication, role_permission, admin_dashboard, security_hardening, statistics_reporting, legacy_migration
- 연동: erp_external
- 플랫폼: desktop · 기술: desktop_app, backend, crawling, security, ui_design, qa_testing
- 추천 스택: Electron, TypeScript, Playwright, SQLite (SQLCipher), electron-builder
- 점수: 난이도 62 · 시간 280~480h · 학습 68 · 재사용 55 · 시장 55 · 위험 66 · 명확성 55
- 근거:
  - vibe_coding_difficulty: 기존 AI 스크립트 분석, 위하고·홈택스 2차 인증 자동화, 세무 오류 위험이 있음.
  - estimated_hours: 리팩토링, GUI, 라이선스, 설치 프로그램, 예외 처리와 테스트를 합쳐 약 280~480시간.
  - learning_value: 데스크톱 앱 상용화, 라이선스, 암호화, RPA 예외 처리 역량을 쌓을 수 있음.
  - reusability_value: 라이선스, 설치 프로그램, 자동화 프레임워크는 재사용 가능하나 세무 로직은 종속적임.
  - market_value: 세무·회계 자동화와 RPA 수요는 있으나 특정 시스템에 한정됨.
  - technical_risk: 대상 시스템 변경, 2차 인증, 약관 이슈, 신고 정확성 검증이 어려움.
- 토큰: in 10 / out 4065 · $0.0636

### 16. [freemoa:48488] [상주] AI Agent 구축 상주 인력 모집

- 예산: 5,000,000원 ~ 10,000,000원 · 기간: 240일
- 분류: **ai_service** (LLM/RAG/영상·음성 AI 기능이 중심) / 금융사 AI Agent 개발 · staffing · finance · reuse medium
- complexity_types: integration_heavy, high_risk_domain · technology_assets: ai_llm, rag_embeddings, ai_agents, backend_api, external_api_integration
- 판단 애매: reuse_level
- 요약: 부산 금융회사 프로젝트 룸에 상주하며 SDS FabriX 플랫폼으로 공통 Agent 12종과 업무 Agent 26종을 개발하는 기간제 인력 모집(8개월).
- 기능: llm_generation, rag_search, llm_chatbot, document_generation, search_filter
- 연동: openai
- 플랫폼: backend_api · 기술: llm_integration, backend, ai_ml
- 추천 스택: Python, FabriX, MCP, LangChain, PostgreSQL
- 점수: 난이도 58 · 시간 800~1400h · 학습 65 · 재사용 50 · 시장 65 · 위험 50 · 명확성 50
- 근거:
  - vibe_coding_difficulty: 폐쇄적 FabriX 플랫폼과 금융권 상주 환경, MCP 연동 의존.
  - estimated_hours: 1인 개발 몫으로 Agent 일부 담당 기준, 월 160시간 안팎 5~8개월 추정.
  - learning_value: LLM·RAG·MCP Agent 개발 경험은 가치가 크나 FabriX는 특화됨.
  - reusability_value: Agent 설계 패턴은 재사용되나 사내 플랫폼 종속이 큼.
  - market_value: 기업용 AI Agent 수요가 높고 반복적으로 나옴.
  - technical_risk: 플랫폼 제약, 금융 보안, 상세 범위 불명확.
- 토큰: in 8 / out 2395 · $0.0403

### 17. [freemoa:48487] AI 기반 주거형 종합공조 토탈 플랫폼 신규 구축

- 예산: 10,000,000원 ~ 20,000,000원 · 기간: 90일
- 분류: **platform_marketplace** (중개/매칭/마켓플레이스/커뮤니티 플랫폼) / 공조 시공 O2O 플랫폼 · new_build · real_estate · reuse medium
- complexity_types: integration_heavy, workflow_complex · technology_assets: core_web, backend_api, database, authentication_authorization, admin_system, payments, external_api_integration, analytics_dashboard, ai_llm
- 판단 애매: project_type, industry
- 요약: 주거형 종합공조 판매·시공·A/S를 연결하는 반응형 웹 플랫폼을 구축한다. 고객·판매자·파트너·관리자 권한, 커머스·PG 결제, 고객사 AI 3종 API 연동을 포함한다.
- 기능: authentication, user_management, role_permission, admin_dashboard, product_catalog, cart_checkout, order_management, payment, settlement, scheduling_calendar, matching, statistics_reporting, cms, search_filter
- 연동: payment_gateway
- 플랫폼: web, mobile_web, admin_web, backend_api · 기술: frontend, backend, database, authentication, payment, ui_design, project_management
- 추천 스택: Next.js, TypeScript, Supabase, Tailwind, 토스페이먼츠, Vercel
- 점수: 난이도 48 · 시간 320~560h · 학습 55 · 재사용 68 · 시장 72 · 위험 42 · 명확성 50
- 근거:
  - vibe_coding_difficulty: 4개 역할, 커머스, 결제, 외부 AI API 연동이 겹쳐 중간 난이도.
  - estimated_hours: 기획·디자인부터 개발·QA·인수인계까지 포함해 320~560시간으로 본다.
  - learning_value: 멀티롤 마켓플레이스, PG 결제, 외부 API 연동 경험을 쌓을 수 있다.
  - reusability_value: 커머스, 권한, 정산, 관리자 모듈은 재사용할 수 있고 AI 연동은 맞춤 작업이다.
  - market_value: 커머스와 O2O 매칭 플랫폼은 외주 시장에서 반복해서 나온다.
  - technical_risk: AI API 명세가 미확정이고 범위가 넓은데 예산이 빠듯하다.
- 토큰: in 8 / out 3175 · $0.0522

### 18. [freemoa:48479] 삼성 안드로이드 태블릿 웹사이트 출력 연동 APK 개발

- 예산: 800,000원 ~ 1,000,000원 · 기간: 7일
- 분류: **iot_device** (무인 기기/장치/센서 중심 시스템 (기기 + 서버/앱)) / 태블릿 프린터 출력 APK · new_build · general · reuse low
- complexity_types: hardware_iot, integration_heavy · technology_assets: mobile, hardware_iot, external_api_integration
- 판단 애매: project_type, industry
- 요약: 기존 웹사이트를 삼성 Android 태블릿 WebView로 띄우고, 출력 버튼 클릭 시 생성된 PDF를 JavaScript Bridge로 받아 지정된 삼성 무선 레이저 프린터로 팝업 없이 바로 출력하는 APK를 개발한다.
- 기능: hardware_integration, file_upload, bug_fix_maintenance
- 연동: hardware_device
- 플랫폼: android · 기술: mobile_native, frontend, qa_testing
- 추천 스택: Kotlin, Android WebView, Android Print Framework, Samsung Mobile Print SDK, IPP
- 점수: 난이도 52 · 시간 30~70h · 학습 35 · 재사용 35 · 시장 40 · 위험 55 · 명확성 72
- 근거:
  - vibe_coding_difficulty: WebView는 쉬우나 팝업 없는 무선 프린터 직접 출력과 실기기 검증이 까다롭다.
  - estimated_hours: WebView·브릿지·PDF 출력·실기기 테스트를 합쳐 30~70시간으로 본다.
  - learning_value: Android 프린터 연동과 WebView 브릿지는 배울 만하지만 범위가 좁다.
  - reusability_value: WebView 브릿지 패턴은 재사용되나 프린터 연동은 기기 종속이다.
  - market_value: 웹-앱-프린터 브릿지 수요는 있으나 틈새 시장이다.
  - technical_risk: 프린터 모델 미정이고 실기기 의존이라 조용한 출력 실패 위험이 있다.
- 토큰: in 14 / out 6097 · $0.0899

### 19. [freemoa:48472] 해외(태국) 무인 생수 락커 SW 및 제어보드 통합 개발

- 예산: 50,000,000원 ~ 100,000,000원 · 기간: 180일
- 분류: **iot_device** (무인 기기/장치/센서 중심 시스템 (기기 + 서버/앱)) / 무인 생수 락커 SW·제어보드 · new_build · commerce · reuse medium
- complexity_types: hardware_iot, integration_heavy, high_risk_domain, workflow_complex, multi_platform · technology_assets: core_web, backend_api, database, authentication_authorization, admin_system, payments, external_api_integration, realtime, hardware_iot, security, cloud_infra, ci_cd
- 판단 애매: project_type, complexity_types
- 요약: 태국 콘도에 설치할 30칸 무인 생수 락커의 고객용 PWA 결제, 주문·관제 서버, 관리자 대시보드, ESP32-S3 펌웨어, PCB 설계와 부품 조달까지 통합 개발한다.
- 기능: authentication, role_permission, admin_dashboard, payment, order_management, inventory_management, multilingual, iot_device_control, hardware_integration, notification_push, statistics_reporting, security_hardening, infra_devops, realtime_sync
- 연동: payment_gateway, hardware_device, aws, slack
- 플랫폼: mobile_web, admin_web, backend_api, embedded · 기술: frontend, backend, database, payment, security, embedded, devops_infra, realtime, authentication
- 추천 스택: Next.js, TypeScript, Node.js, PostgreSQL, Redis, MQTT(EMQX), ESP32-S3 FreeRTOS
- 점수: 난이도 78 · 시간 700~1300h · 학습 65 · 재사용 45 · 시장 35 · 위험 82 · 명확성 80
- 근거:
  - vibe_coding_difficulty: 펌웨어·PCB·mTLS·결제 웹훅·실기기 통합으로 AI 단독 검증이 어렵다.
  - estimated_hours: SW 웹·서버·관리자에 펌웨어, PCB, 부품 조달, 현지 시험까지 포함해 700~1300시간.
  - learning_value: MQTT mTLS, 결제 상태머신, ESP32 OTA 등 IoT 역량을 얻는다.
  - reusability_value: 웹·관리자·결제 모듈은 재사용되나 PCB·펌웨어는 장비에 종속된다.
  - market_value: 무인 판매 IoT 통합 외주는 수요가 있으나 반복성은 제한적이다.
  - technical_risk: 실기기 통전, 해외 결제·인증, 부품 조달, 현지 시험 의존이 커서 위험이 높다.
- 토큰: in 14 / out 7308 · $0.1117

### 20. [freemoa:48470] 거래소 신규 공지사항 실시간 감지 파이썬 코드 개발

- 예산: 10,000원 ~ 1,000,000원 · 기간: -
- 분류: **crawler_data_collection** (크롤러/데이터 수집기) / 거래소 공지 감지 · new_build · finance · reuse low
- complexity_types: algorithmic_specialized, integration_heavy, realtime · technology_assets: web_crawling, backend_api, data_pipeline, external_api_integration
- 판단 애매: reuse_level
- 요약: 업비트·빗썸에 신규 공지가 등록될 때 목록 노출 전 공지번호를 선제 탐색해 1초 이내에 제목 등 핵심 정보를 가져오는 Python 모니터링 프로그램을 만든다. 차단·Rate Limit 대응과 알림 출력도 포함한다.
- 기능: crawling_scraping, data_pipeline, notification_push, bug_fix_maintenance
- 연동: -
- 플랫폼: backend_api · 기술: backend, crawling, realtime
- 추천 스택: Python, asyncio, aiohttp, Redis, Docker
- 점수: 난이도 62 · 시간 30~80h · 학습 45 · 재사용 30 · 시장 35 · 위험 75 · 명확성 45
- 근거:
  - vibe_coding_difficulty: 비공개 번호 패턴 역분석과 1초 이내 감지, 차단 회피가 필요해 어렵다.
  - estimated_hours: 두 거래소의 패턴 분석, 비동기 수집기, 알림, 안정화를 합쳐 30~80시간으로 본다.
  - learning_value: 고속 비동기 수집과 차단 대응은 배울 만하지만 도메인이 좁다.
  - reusability_value: 거래소 전용 로직이 커서 재사용은 일부 수집 골격에 한정된다.
  - market_value: 거래소 공지 선감지 수요는 있지만 특수 니치다.
  - technical_risk: 패턴이 다시 바뀔 수 있고 차단·약관 문제와 성능 보장이 불확실하다.
- 토큰: in 12 / out 4905 · $0.0716

## 분포

- vibe_coding_difficulty: 평균 58 / 중앙 62 / 범위 8~80
- estimated_hours_max: 평균 913 / 중앙 480 / 범위 32~4500
- learning_value: 평균 46 / 중앙 45 / 범위 8~72
- reusability_value: 평균 40 / 중앙 40 / 범위 15~78
- market_value: 평균 49 / 중앙 50 / 범위 25~78

## 권장 어휘 밖 코드 (다음 버전 taxonomy 후보)

- features: 없음
- integrations: 없음
- skills: 없음
