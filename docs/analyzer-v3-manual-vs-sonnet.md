# 분류 비교: v3 (claude-code-session (manual, API 미호출)) → v3 (claude-sonnet-5-5)

- 비교 대상: 20건

## 실행 결과 (이후 파일 기준)

- schema 성공: 20/20 (100%) · 최종 schema failure 0건 · 기타 실패 0건
- retry: 1회 (재시도한 프로젝트 1건)
- 토큰: input 202 · output 78,697 · cache write 116,804 · cache read 884,575
- 비용: $1.2563 (건당 $0.0628)

## taxonomy 일치율

| 필드 | 일치 | 일치율 |
|---|---|---|
| project_type | 17/20 | 85% |
| engagement_type | 19/20 | 95% |
| industry | 18/20 | 90% |
| reuse_level | 13/20 | 65% |
| complexity_types (완전 일치 / 평균 Jaccard) | 6/20 | 60% |
| technology_assets (완전 일치 / 평균 Jaccard) | 6/20 | 78% |

## 점수 차이 (이후 − 이전)

| 항목 | 이전 평균 | 이후 평균 | 평균 차이 | 평균 절대 차이 |
|---|---|---|---|---|
| vibe_coding_difficulty | 63.1 | 57.9 | -5.3 | 7.5 |
| learning_value | 46.0 | 45.6 | -0.3 | 6.7 |
| reusability_value | 40.5 | 40.0 | -0.6 | 4.8 |
| market_value | 49.3 | 48.8 | -0.5 | 4.5 |
| technical_risk | 55.5 | 55.4 | -0.1 | 3.9 |
| requirement_clarity | 58.3 | 54.3 | -4.0 | 8.0 |
| estimated_hours_min | 551.7 | 569.5 | +17.8 | 79.8 |
| estimated_hours_max | 862.0 | 912.6 | +50.6 | 98.6 |

## 차이가 큰 프로젝트 TOP 5

(거리 = 점수 5종 평균 절대 차이 + 분류 불일치 1개당 15)

- [freemoa:48487] AI 기반 주거형 종합공조 토탈 플랫폼 신규 구축 — 거리 37.0: 점수 차 평균 7.0, 시간 365h → 440h, 분류 industry construction→real_estate, reuse_level high→medium
- [freemoa:48501] 기존 웹/앱 서비스 고도화 및 추가 개발 — 거리 35.6: 점수 차 평균 5.6, 시간 130h → 180h, 분류 engagement_type feature_extension→maintenance, reuse_level low→one_off
- [freemoa:48479] 삼성 안드로이드 태블릿 웹사이트 출력 연동 APK 개발 — 거리 33.4: 점수 차 평균 3.4, 시간 32h → 50h, 분류 project_type mobile_app→iot_device, reuse_level medium→low
- [wishket:158882] Spring Boot 기반 PG사 선불시스템 구축 개발 — 거리 25.4: 점수 차 평균 10.4, 시간 650h → 1100h, 분류 reuse_level low→medium
- [freemoa:48495] 자사 iOS 앱 승인 대응 — 거리 23.0: 점수 차 평균 8.0, 시간 100h → 180h, 분류 reuse_level high→medium

## other 건수

| 필드 | 이전 | 이후 |
|---|---|---|
| project_type | 0 | 1 |
| engagement_type | 0 | 0 |
| industry | 0 | 0 |
| reuse_level | 0 | 0 |
| complexity_types (other 포함) | 0 | 0 |
| technology_assets (other 포함) | 0 | 0 |

## project_type 변경 (3건)

- [wishket:158891] 물류 자동화 설비 연동 WMS 반품 자동화 백엔드 개발: business_management → **iot_device**
- [wishket:158878] 중등 온라인 교육 서비스 모바일 앱·반응형 웹 QA: mobile_app → **other**
- [freemoa:48479] 삼성 안드로이드 태블릿 웹사이트 출력 연동 APK 개발: mobile_app → **iot_device**

## engagement_type 변경 (1건)

- [freemoa:48501] 기존 웹/앱 서비스 고도화 및 추가 개발: feature_extension → **maintenance**

## industry 변경 (2건)

- [wishket:158850] 예약 플랫폼 프론트/백엔드 연동 및 해외 결제 시스템 구축: travel_hospitality → **general**
- [freemoa:48487] AI 기반 주거형 종합공조 토탈 플랫폼 신규 구축: construction → **real_estate**

## reuse_level 변경 (7건)

- [wishket:158857] .NET 기반 기능 수정 및 보안 개발: low → **medium**
- [wishket:158882] Spring Boot 기반 PG사 선불시스템 구축 개발: low → **medium**
- [wishket:158892] 스크린 파크골프 브랜드 신규 홈페이지 제작: medium → **low**
- [freemoa:48501] 기존 웹/앱 서비스 고도화 및 추가 개발: low → **one_off**
- [freemoa:48495] 자사 iOS 앱 승인 대응: high → **medium**
- [freemoa:48487] AI 기반 주거형 종합공조 토탈 플랫폼 신규 구축: high → **medium**
- [freemoa:48479] 삼성 안드로이드 태블릿 웹사이트 출력 연동 APK 개발: medium → **low**

## complexity_types 변경 (14건)

- [wishket:158857] .NET 기반 기능 수정 및 보안 개발: + workflow_complex / - high_risk_domain
- [wishket:158896] Java 기반 녹취 솔루션 구축 PL: + integration_heavy, workflow_complex / - hardware_iot
- [wishket:158884] Oracle 기반 생산계획 시스템 구축 PL: + workflow_complex / - algorithmic_specialized
- [wishket:158850] 예약 플랫폼 프론트/백엔드 연동 및 해외 결제 시스템 구축: + workflow_complex, high_risk_domain / - realtime
- [wishket:158878] 중등 온라인 교육 서비스 모바일 앱·반응형 웹 QA: + workflow_complex
- [freemoa:48504] 유소년 스포츠 등번호 AI 하이라이트 웹 MVP 개발: + workflow_complex
- [freemoa:48502] 언론 웹사이트 추가 개발 및 유지보수: + integration_heavy
- [freemoa:48501] 기존 웹/앱 서비스 고도화 및 추가 개발: + integration_heavy / - realtime
- [freemoa:48495] 자사 iOS 앱 승인 대응: + high_risk_domain, legacy_heavy
- [freemoa:48491] 위하고 세무 업무 자동화 PC 프로그램 구축: + high_risk_domain, legacy_heavy / - workflow_complex
- [freemoa:48488] [상주] AI Agent 구축 상주 인력 모집: + high_risk_domain
- [freemoa:48479] 삼성 안드로이드 태블릿 웹사이트 출력 연동 APK 개발: + integration_heavy
- [freemoa:48472] 해외(태국) 무인 생수 락커 SW 및 제어보드 통합 개발: + high_risk_domain, multi_platform / - realtime
- [freemoa:48470] 거래소 신규 공지사항 실시간 감지 파이썬 코드 개발: + integration_heavy

## technology_assets 변경 (14건)

- [wishket:158882] Spring Boot 기반 PG사 선불시스템 구축 개발: + external_api_integration
- [wishket:158896] Java 기반 녹취 솔루션 구축 PL: + backend_api
- [wishket:158891] 물류 자동화 설비 연동 WMS 반품 자동화 백엔드 개발: + database
- [wishket:158884] Oracle 기반 생산계획 시스템 구축 PL: + backend_api
- [wishket:158878] 중등 온라인 교육 서비스 모바일 앱·반응형 웹 QA: + core_web
- [freemoa:48504] 유소년 스포츠 등번호 AI 하이라이트 웹 MVP 개발: + ocr_document_ai
- [freemoa:48501] 기존 웹/앱 서비스 고도화 및 추가 개발: + cloud_infra, legacy_enterprise / - realtime
- [freemoa:48495] 자사 iOS 앱 승인 대응: + external_api_integration
- [freemoa:48491] 위하고 세무 업무 자동화 PC 프로그램 구축: + web_crawling, external_api_integration / - workflow_automation
- [freemoa:48488] [상주] AI Agent 구축 상주 인력 모집: + external_api_integration
- [freemoa:48487] AI 기반 주거형 종합공조 토탈 플랫폼 신규 구축: + ai_llm
- [freemoa:48479] 삼성 안드로이드 태블릿 웹사이트 출력 연동 APK 개발: + external_api_integration
- [freemoa:48472] 해외(태국) 무인 생수 락커 SW 및 제어보드 통합 개발: + authentication_authorization, external_api_integration, ci_cd
- [freemoa:48470] 거래소 신규 공지사항 실시간 감지 파이썬 코드 개발: + backend_api, data_pipeline, external_api_integration

## 애매 표시가 해소된 사례 (0건)

- 없음

## 아직 애매한 사례 (20건)

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
