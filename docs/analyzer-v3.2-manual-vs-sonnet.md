# 분류 비교: v3.2 (claude-code-session (manual, API 미호출)) → v3.2 (claude-sonnet-5-5)

- 비교 대상: 20건

## 실행 결과 (이후 파일 기준)

- schema 성공: 20/20 (100%) · 최종 schema failure 0건 · 기타 실패 0건
- retry: 1회 (재시도한 프로젝트 1건)
- 토큰: input 180 · output 63,265 · cache write 111,223 · cache read 914,996
- 비용: $1.0941 (건당 $0.0547)

## taxonomy 일치율

| 필드 | 일치 | 일치율 |
|---|---|---|
| project_type | 19/20 | 95% |
| engagement_type | 20/20 | 100% |
| industry | 18/20 | 90% |
| reuse_level | 12/20 | 60% |
| complexity_types (완전 일치 / 평균 Jaccard) | 9/20 | 71% |
| technology_assets (완전 일치 / 평균 Jaccard) | 7/20 | 77% |

## 점수 차이 (이후 − 이전)

| 항목 | 이전 평균 | 이후 평균 | 평균 차이 | 평균 절대 차이 |
|---|---|---|---|---|
| vibe_coding_difficulty | 63.1 | 55.7 | -7.5 | 9.8 |
| learning_value | 46.0 | 47.4 | +1.4 | 6.8 |
| reusability_value | 36.6 | 37.6 | +1.0 | 7.0 |
| market_value | 49.3 | 49.5 | +0.2 | 6.5 |
| technical_risk | 55.5 | 54.3 | -1.3 | 4.5 |
| requirement_clarity | 58.3 | 55.4 | -2.9 | 7.6 |
| estimated_hours_min | 551.7 | 624.5 | +72.8 | 77.8 |
| estimated_hours_max | 862.0 | 904.8 | +42.8 | 84.8 |

## 차이가 큰 프로젝트 TOP 5

(거리 = 점수 5종 평균 절대 차이 + 분류 불일치 1개당 15)

- [freemoa:48487] AI 기반 주거형 종합공조 토탈 플랫폼 신규 구축 — 거리 39.2: 점수 차 평균 9.2, 시간 365h → 410h, 분류 industry construction→real_estate, reuse_level high→medium
- [wishket:158891] 물류 자동화 설비 연동 WMS 반품 자동화 백엔드 개발 — 거리 37.0: 점수 차 평균 7.0, 시간 700h → 575h, 분류 project_type business_management→iot_device, reuse_level one_off→low
- [wishket:158890] APM/DR 기반 금융권 차세대 인프라 관제 및 금융보안 분석·설계 — 거리 27.0: 점수 차 평균 12.0, 시간 3650h → 3600h, 분류 reuse_level one_off→low
- [freemoa:48495] 자사 iOS 앱 승인 대응 — 거리 26.0: 점수 차 평균 11.0, 시간 100h → 180h, 분류 reuse_level low→medium
- [wishket:158896] Java 기반 녹취 솔루션 구축 PL — 거리 25.6: 점수 차 평균 10.6, 시간 800h → 900h, 분류 reuse_level one_off→low

## other 건수

| 필드 | 이전 | 이후 |
|---|---|---|
| project_type | 0 | 0 |
| engagement_type | 0 | 0 |
| industry | 0 | 0 |
| reuse_level | 0 | 0 |
| complexity_types (other 포함) | 0 | 0 |
| technology_assets (other 포함) | 0 | 1 |

## project_type 변경 (1건)

- [wishket:158891] 물류 자동화 설비 연동 WMS 반품 자동화 백엔드 개발: business_management → **iot_device**

## engagement_type 변경 (0건)

- 없음

## industry 변경 (2건)

- [wishket:158850] 예약 플랫폼 프론트/백엔드 연동 및 해외 결제 시스템 구축: travel_hospitality → **general**
- [freemoa:48487] AI 기반 주거형 종합공조 토탈 플랫폼 신규 구축: construction → **real_estate**

## reuse_level 변경 (8건)

- [wishket:158896] Java 기반 녹취 솔루션 구축 PL: one_off → **low**
- [wishket:158891] 물류 자동화 설비 연동 WMS 반품 자동화 백엔드 개발: one_off → **low**
- [wishket:158890] APM/DR 기반 금융권 차세대 인프라 관제 및 금융보안 분석·설계: one_off → **low**
- [freemoa:48502] 언론 웹사이트 추가 개발 및 유지보수: low → **medium**
- [freemoa:48495] 자사 iOS 앱 승인 대응: low → **medium**
- [freemoa:48491] 위하고 세무 업무 자동화 PC 프로그램 구축: low → **medium**
- [freemoa:48487] AI 기반 주거형 종합공조 토탈 플랫폼 신규 구축: high → **medium**
- [freemoa:48472] 해외(태국) 무인 생수 락커 SW 및 제어보드 통합 개발: medium → **low**

## complexity_types 변경 (11건)

- [wishket:158896] Java 기반 녹취 솔루션 구축 PL: + integration_heavy / - legacy_heavy
- [wishket:158891] 물류 자동화 설비 연동 WMS 반품 자동화 백엔드 개발: - integration_heavy
- [wishket:158884] Oracle 기반 생산계획 시스템 구축 PL: + workflow_complex / - algorithmic_specialized
- [wishket:158850] 예약 플랫폼 프론트/백엔드 연동 및 해외 결제 시스템 구축: + high_risk_domain
- [freemoa:48504] 유소년 스포츠 등번호 AI 하이라이트 웹 MVP 개발: + workflow_complex
- [freemoa:48502] 언론 웹사이트 추가 개발 및 유지보수: + standard_crud
- [freemoa:48501] 기존 웹/앱 서비스 고도화 및 추가 개발: - realtime
- [freemoa:48495] 자사 iOS 앱 승인 대응: + high_risk_domain, legacy_heavy
- [freemoa:48491] 위하고 세무 업무 자동화 PC 프로그램 구축: + high_risk_domain, legacy_heavy / - workflow_complex
- [freemoa:48488] [상주] AI Agent 구축 상주 인력 모집: + high_risk_domain
- [freemoa:48472] 해외(태국) 무인 생수 락커 SW 및 제어보드 통합 개발: + high_risk_domain, multi_platform / - realtime, workflow_complex

## technology_assets 변경 (13건)

- [wishket:158857] .NET 기반 기능 수정 및 보안 개발: + core_web
- [wishket:158882] Spring Boot 기반 PG사 선불시스템 구축 개발: + external_api_integration
- [wishket:158896] Java 기반 녹취 솔루션 구축 PL: + backend_api
- [wishket:158891] 물류 자동화 설비 연동 WMS 반품 자동화 백엔드 개발: + external_api_integration
- [wishket:158884] Oracle 기반 생산계획 시스템 구축 PL: + backend_api
- [wishket:158878] 중등 온라인 교육 서비스 모바일 앱·반응형 웹 QA: + other / - mobile
- [freemoa:48504] 유소년 스포츠 등번호 AI 하이라이트 웹 MVP 개발: + ocr_document_ai
- [freemoa:48501] 기존 웹/앱 서비스 고도화 및 추가 개발: + legacy_enterprise, cloud_infra / - realtime
- [freemoa:48495] 자사 iOS 앱 승인 대응: + external_api_integration
- [freemoa:48491] 위하고 세무 업무 자동화 PC 프로그램 구축: + web_crawling, external_api_integration, core_web / - authentication_authorization
- [freemoa:48488] [상주] AI Agent 구축 상주 인력 모집: + external_api_integration
- [freemoa:48472] 해외(태국) 무인 생수 락커 SW 및 제어보드 통합 개발: + authentication_authorization, external_api_integration, ci_cd
- [freemoa:48470] 거래소 신규 공지사항 실시간 감지 파이썬 코드 개발: + backend_api, external_api_integration, data_pipeline

## 애매 표시가 해소된 사례 (2건)

- [wishket:158857] .NET 기반 기능 수정 및 보안 개발: 이전 애매 필드 project_type
- [wishket:158891] 물류 자동화 설비 연동 WMS 반품 자동화 백엔드 개발: 이전 애매 필드 project_type

## 아직 애매한 사례 (2건)

- [freemoa:48487] AI 기반 주거형 종합공조 토탈 플랫폼 신규 구축 — AI 판단 애매: project_type
- [freemoa:48472] 해외(태국) 무인 생수 락커 SW 및 제어보드 통합 개발 — complexity_types 4개
