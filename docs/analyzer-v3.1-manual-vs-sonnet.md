# 분류 비교: v3.1 (claude-code-session (manual, API 미호출)) → v3.1 (claude-sonnet-5-5)

- 비교 대상: 20건

## 실행 결과 (이후 파일 기준)

- schema 성공: 20/20 (100%) · 최종 schema failure 0건 · 기타 실패 0건
- retry: 0회 (재시도한 프로젝트 0건)
- 토큰: input 160 · output 51,583 · cache write 108,823 · cache read 739,615
- 비용: $0.9361 (건당 $0.0468)

## taxonomy 일치율

| 필드 | 일치 | 일치율 |
|---|---|---|
| project_type | 18/20 | 90% |
| engagement_type | 20/20 | 100% |
| industry | 18/20 | 90% |
| reuse_level | 16/20 | 80% |
| complexity_types (완전 일치 / 평균 Jaccard) | 6/20 | 63% |
| technology_assets (완전 일치 / 평균 Jaccard) | 7/20 | 75% |

## 점수 차이 (이후 − 이전)

| 항목 | 이전 평균 | 이후 평균 | 평균 차이 | 평균 절대 차이 |
|---|---|---|---|---|
| vibe_coding_difficulty | 63.1 | 57.1 | -6.0 | 8.2 |
| learning_value | 46.0 | 46.3 | +0.3 | 6.0 |
| reusability_value | 38.8 | 34.4 | -4.4 | 6.4 |
| market_value | 49.3 | 47.2 | -2.0 | 5.5 |
| technical_risk | 55.5 | 55.5 | +0.0 | 4.4 |
| requirement_clarity | 58.3 | 53.9 | -4.3 | 6.8 |
| estimated_hours_min | 551.7 | 610.0 | +58.3 | 83.3 |
| estimated_hours_max | 862.0 | 881.3 | +19.3 | 108.3 |

## 차이가 큰 프로젝트 TOP 5

(거리 = 점수 5종 평균 절대 차이 + 분류 불일치 1개당 15)

- [freemoa:48487] AI 기반 주거형 종합공조 토탈 플랫폼 신규 구축 — 거리 38.4: 점수 차 평균 8.4, 시간 365h → 390h, 분류 industry construction→real_estate, reuse_level high→medium
- [freemoa:48488] [상주] AI Agent 구축 상주 인력 모집 — 거리 27.4: 점수 차 평균 12.4, 시간 1150h → 1250h, 분류 reuse_level medium→low
- [freemoa:48472] 해외(태국) 무인 생수 락커 SW 및 제어보드 통합 개발 — 거리 22.6: 점수 차 평균 7.6, 시간 1250h → 900h, 분류 reuse_level medium→low
- [freemoa:48491] 위하고 세무 업무 자동화 PC 프로그램 구축 — 거리 21.6: 점수 차 평균 6.6, 시간 375h → 440h, 분류 reuse_level medium→low
- [wishket:158891] 물류 자동화 설비 연동 WMS 반품 자동화 백엔드 개발 — 거리 20.0: 점수 차 평균 5.0, 시간 700h → 550h, 분류 project_type business_management→iot_device

## other 건수

| 필드 | 이전 | 이후 |
|---|---|---|
| project_type | 0 | 0 |
| engagement_type | 0 | 0 |
| industry | 0 | 0 |
| reuse_level | 0 | 0 |
| complexity_types (other 포함) | 0 | 0 |
| technology_assets (other 포함) | 0 | 1 |

## project_type 변경 (2건)

- [wishket:158891] 물류 자동화 설비 연동 WMS 반품 자동화 백엔드 개발: business_management → **iot_device**
- [freemoa:48502] 언론 웹사이트 추가 개발 및 유지보수: maintenance → **website**

## engagement_type 변경 (0건)

- 없음

## industry 변경 (2건)

- [wishket:158850] 예약 플랫폼 프론트/백엔드 연동 및 해외 결제 시스템 구축: travel_hospitality → **general**
- [freemoa:48487] AI 기반 주거형 종합공조 토탈 플랫폼 신규 구축: construction → **real_estate**

## reuse_level 변경 (4건)

- [freemoa:48491] 위하고 세무 업무 자동화 PC 프로그램 구축: medium → **low**
- [freemoa:48488] [상주] AI Agent 구축 상주 인력 모집: medium → **low**
- [freemoa:48487] AI 기반 주거형 종합공조 토탈 플랫폼 신규 구축: high → **medium**
- [freemoa:48472] 해외(태국) 무인 생수 락커 SW 및 제어보드 통합 개발: medium → **low**

## complexity_types 변경 (14건)

- [wishket:158857] .NET 기반 기능 수정 및 보안 개발: + workflow_complex / - high_risk_domain
- [wishket:158882] Spring Boot 기반 PG사 선불시스템 구축 개발: + workflow_complex
- [wishket:158896] Java 기반 녹취 솔루션 구축 PL: + integration_heavy, workflow_complex / - hardware_iot
- [wishket:158884] Oracle 기반 생산계획 시스템 구축 PL: + workflow_complex
- [wishket:158850] 예약 플랫폼 프론트/백엔드 연동 및 해외 결제 시스템 구축: + high_risk_domain, workflow_complex / - realtime
- [wishket:158888] EDW/CDC·ETL 기반 금융권 차세대 정보계 분석·설계: + integration_heavy
- [freemoa:48504] 유소년 스포츠 등번호 AI 하이라이트 웹 MVP 개발: + workflow_complex
- [freemoa:48502] 언론 웹사이트 추가 개발 및 유지보수: + integration_heavy
- [freemoa:48501] 기존 웹/앱 서비스 고도화 및 추가 개발: - realtime
- [freemoa:48495] 자사 iOS 앱 승인 대응: + legacy_heavy, high_risk_domain
- [freemoa:48491] 위하고 세무 업무 자동화 PC 프로그램 구축: + legacy_heavy, high_risk_domain / - workflow_complex
- [freemoa:48488] [상주] AI Agent 구축 상주 인력 모집: + high_risk_domain
- [freemoa:48472] 해외(태국) 무인 생수 락커 SW 및 제어보드 통합 개발: + high_risk_domain, multi_platform / - realtime
- [freemoa:48470] 거래소 신규 공지사항 실시간 감지 파이썬 코드 개발: + integration_heavy / - realtime

## technology_assets 변경 (13건)

- [wishket:158857] .NET 기반 기능 수정 및 보안 개발: + core_web
- [wishket:158882] Spring Boot 기반 PG사 선불시스템 구축 개발: + external_api_integration
- [wishket:158896] Java 기반 녹취 솔루션 구축 PL: + backend_api
- [wishket:158884] Oracle 기반 생산계획 시스템 구축 PL: + backend_api
- [wishket:158878] 중등 온라인 교육 서비스 모바일 앱·반응형 웹 QA: + other / - mobile
- [freemoa:48504] 유소년 스포츠 등번호 AI 하이라이트 웹 MVP 개발: + ocr_document_ai, docker
- [freemoa:48502] 언론 웹사이트 추가 개발 및 유지보수: + external_api_integration, admin_system
- [freemoa:48501] 기존 웹/앱 서비스 고도화 및 추가 개발: + legacy_enterprise, cloud_infra / - realtime
- [freemoa:48495] 자사 iOS 앱 승인 대응: + external_api_integration, legacy_enterprise
- [freemoa:48491] 위하고 세무 업무 자동화 PC 프로그램 구축: + web_crawling, external_api_integration, legacy_enterprise / - authentication_authorization
- [freemoa:48488] [상주] AI Agent 구축 상주 인력 모집: + external_api_integration
- [freemoa:48472] 해외(태국) 무인 생수 락커 SW 및 제어보드 통합 개발: + authentication_authorization, external_api_integration, ci_cd
- [freemoa:48470] 거래소 신규 공지사항 실시간 감지 파이썬 코드 개발: + backend_api, external_api_integration

## 애매 표시가 해소된 사례 (1건)

- [wishket:158891] 물류 자동화 설비 연동 WMS 반품 자동화 백엔드 개발: 이전 애매 필드 project_type

## 아직 애매한 사례 (2건)

- [freemoa:48501] 기존 웹/앱 서비스 고도화 및 추가 개발 — AI 판단 애매: engagement_type
- [freemoa:48472] 해외(태국) 무인 생수 락커 SW 및 제어보드 통합 개발 — complexity_types 5개
