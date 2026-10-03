# 분류 비교: v3.1 (claude-sonnet-5-5) → v3.2 (claude-sonnet-5-5)

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
| industry | 20/20 | 100% |
| reuse_level | 15/20 | 75% |
| complexity_types (완전 일치 / 평균 Jaccard) | 10/20 | 76% |
| technology_assets (완전 일치 / 평균 Jaccard) | 14/20 | 93% |

## 점수 차이 (이후 − 이전)

| 항목 | 이전 평균 | 이후 평균 | 평균 차이 | 평균 절대 차이 |
|---|---|---|---|---|
| vibe_coding_difficulty | 57.1 | 55.7 | -1.4 | 1.9 |
| learning_value | 46.3 | 47.4 | +1.1 | 1.6 |
| reusability_value | 34.4 | 37.6 | +3.3 | 3.5 |
| market_value | 47.2 | 49.5 | +2.3 | 3.8 |
| technical_risk | 55.5 | 54.3 | -1.3 | 2.8 |
| requirement_clarity | 53.9 | 55.4 | +1.4 | 2.5 |
| estimated_hours_min | 610.0 | 624.5 | +14.5 | 29.5 |
| estimated_hours_max | 881.3 | 904.8 | +23.5 | 57.5 |

## 차이가 큰 프로젝트 TOP 5

(거리 = 점수 5종 평균 절대 차이 + 분류 불일치 1개당 15)

- [wishket:158891] 물류 자동화 설비 연동 WMS 반품 자동화 백엔드 개발 — 거리 21.8: 점수 차 평균 6.8, 시간 550h → 575h, 분류 reuse_level one_off→low
- [wishket:158890] APM/DR 기반 금융권 차세대 인프라 관제 및 금융보안 분석·설계 — 거리 21.0: 점수 차 평균 6.0, 시간 3600h → 3600h, 분류 reuse_level one_off→low
- [wishket:158896] Java 기반 녹취 솔루션 구축 PL — 거리 20.2: 점수 차 평균 5.2, 시간 1000h → 900h, 분류 reuse_level one_off→low
- [freemoa:48495] 자사 iOS 앱 승인 대응 — 거리 20.0: 점수 차 평균 5.0, 시간 180h → 180h, 분류 reuse_level low→medium
- [wishket:158857] .NET 기반 기능 수정 및 보안 개발 — 거리 19.0: 점수 차 평균 4.0, 시간 32h → 32h, 분류 project_type maintenance→admin_backoffice

## other 건수

| 필드 | 이전 | 이후 |
|---|---|---|
| project_type | 0 | 0 |
| engagement_type | 0 | 0 |
| industry | 0 | 0 |
| reuse_level | 0 | 0 |
| complexity_types (other 포함) | 0 | 0 |
| technology_assets (other 포함) | 1 | 1 |

## project_type 변경 (1건)

- [wishket:158857] .NET 기반 기능 수정 및 보안 개발: maintenance → **admin_backoffice**

## engagement_type 변경 (0건)

- 없음

## industry 변경 (0건)

- 없음

## reuse_level 변경 (5건)

- [wishket:158896] Java 기반 녹취 솔루션 구축 PL: one_off → **low**
- [wishket:158891] 물류 자동화 설비 연동 WMS 반품 자동화 백엔드 개발: one_off → **low**
- [wishket:158890] APM/DR 기반 금융권 차세대 인프라 관제 및 금융보안 분석·설계: one_off → **low**
- [freemoa:48495] 자사 iOS 앱 승인 대응: low → **medium**
- [freemoa:48491] 위하고 세무 업무 자동화 PC 프로그램 구축: low → **medium**

## complexity_types 변경 (10건)

- [wishket:158857] .NET 기반 기능 수정 및 보안 개발: + high_risk_domain / - workflow_complex
- [wishket:158882] Spring Boot 기반 PG사 선불시스템 구축 개발: - workflow_complex
- [wishket:158896] Java 기반 녹취 솔루션 구축 PL: + hardware_iot / - legacy_heavy, workflow_complex
- [wishket:158891] 물류 자동화 설비 연동 WMS 반품 자동화 백엔드 개발: - integration_heavy
- [wishket:158884] Oracle 기반 생산계획 시스템 구축 PL: - algorithmic_specialized
- [wishket:158850] 예약 플랫폼 프론트/백엔드 연동 및 해외 결제 시스템 구축: + realtime / - workflow_complex
- [wishket:158888] EDW/CDC·ETL 기반 금융권 차세대 정보계 분석·설계: - integration_heavy
- [freemoa:48502] 언론 웹사이트 추가 개발 및 유지보수: + standard_crud / - integration_heavy
- [freemoa:48472] 해외(태국) 무인 생수 락커 SW 및 제어보드 통합 개발: - workflow_complex
- [freemoa:48470] 거래소 신규 공지사항 실시간 감지 파이썬 코드 개발: + realtime / - integration_heavy

## technology_assets 변경 (6건)

- [wishket:158891] 물류 자동화 설비 연동 WMS 반품 자동화 백엔드 개발: + external_api_integration
- [freemoa:48504] 유소년 스포츠 등번호 AI 하이라이트 웹 MVP 개발: - docker
- [freemoa:48502] 언론 웹사이트 추가 개발 및 유지보수: - external_api_integration, admin_system
- [freemoa:48495] 자사 iOS 앱 승인 대응: - legacy_enterprise
- [freemoa:48491] 위하고 세무 업무 자동화 PC 프로그램 구축: + core_web / - legacy_enterprise
- [freemoa:48470] 거래소 신규 공지사항 실시간 감지 파이썬 코드 개발: + data_pipeline

## 애매 표시가 해소된 사례 (1건)

- [freemoa:48501] 기존 웹/앱 서비스 고도화 및 추가 개발: 이전 애매 필드 engagement_type

## 아직 애매한 사례 (2건)

- [freemoa:48487] AI 기반 주거형 종합공조 토탈 플랫폼 신규 구축 — AI 판단 애매: project_type
- [freemoa:48472] 해외(태국) 무인 생수 락커 SW 및 제어보드 통합 개발 — complexity_types 4개
