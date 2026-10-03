# 분류 비교: v2 (claude-code-session (manual, API 미호출)) → v3 (claude-code-session (manual, API 미호출))

- 비교 대상: 20건

## 실행 결과 (이후 파일 기준)

- schema 성공: 20/20 (100%) · 최종 schema failure 0건 · 기타 실패 0건
- retry: 0회 (재시도한 프로젝트 0건)
- 토큰: input 0 · output 0 · cache write 0 · cache read 0
- 비용: -

## taxonomy 일치율

| 필드 | 일치 | 일치율 |
|---|---|---|
| project_type | 15/20 | 75% |
| engagement_type | 20/20 | 100% |
| industry | 20/20 | 100% |
| reuse_level | 20/20 | 100% |
| complexity_types (완전 일치 / 평균 Jaccard) | 20/20 | 100% |
| technology_assets (완전 일치 / 평균 Jaccard) | 18/20 | 97% |

## 점수 차이 (이후 − 이전)

| 항목 | 이전 평균 | 이후 평균 | 평균 차이 | 평균 절대 차이 |
|---|---|---|---|---|
| vibe_coding_difficulty | 63.1 | 63.1 | +0.0 | 0.0 |
| learning_value | 46.0 | 46.0 | +0.0 | 0.0 |
| reusability_value | 40.5 | 40.5 | +0.0 | 0.0 |
| market_value | 49.3 | 49.3 | +0.0 | 0.0 |
| technical_risk | 55.5 | 55.5 | +0.0 | 0.0 |
| requirement_clarity | 58.3 | 58.3 | +0.0 | 0.0 |
| estimated_hours_min | 551.7 | 551.7 | +0.0 | 0.0 |
| estimated_hours_max | 862.0 | 862.0 | +0.0 | 0.0 |

## 차이가 큰 프로젝트 TOP 5

(거리 = 점수 5종 평균 절대 차이 + 분류 불일치 1개당 15)

- [wishket:158882] Spring Boot 기반 PG사 선불시스템 구축 개발 — 거리 15.0: 점수 차 평균 0.0, 시간 650h → 650h, 분류 project_type other→fintech_payment
- [wishket:158896] Java 기반 녹취 솔루션 구축 PL — 거리 15.0: 점수 차 평균 0.0, 시간 800h → 800h, 분류 project_type other→media_processing
- [wishket:158890] APM/DR 기반 금융권 차세대 인프라 관제 및 금융보안 분석·설계 — 거리 15.0: 점수 차 평균 0.0, 시간 3650h → 3650h, 분류 project_type other→enterprise_infra
- [freemoa:48501] 기존 웹/앱 서비스 고도화 및 추가 개발 — 거리 15.0: 점수 차 평균 0.0, 시간 130h → 130h, 분류 project_type maintenance→iot_device
- [freemoa:48472] 해외(태국) 무인 생수 락커 SW 및 제어보드 통합 개발 — 거리 15.0: 점수 차 평균 0.0, 시간 1250h → 1250h, 분류 project_type other→iot_device

## other 건수

| 필드 | 이전 | 이후 |
|---|---|---|
| project_type | 4 | 0 |
| engagement_type | 0 | 0 |
| industry | 0 | 0 |
| reuse_level | 0 | 0 |
| complexity_types (other 포함) | 0 | 0 |
| technology_assets (other 포함) | 0 | 0 |

## project_type 변경 (5건)

- [wishket:158882] Spring Boot 기반 PG사 선불시스템 구축 개발: other → **fintech_payment**
- [wishket:158896] Java 기반 녹취 솔루션 구축 PL: other → **media_processing**
- [wishket:158890] APM/DR 기반 금융권 차세대 인프라 관제 및 금융보안 분석·설계: other → **enterprise_infra**
- [freemoa:48501] 기존 웹/앱 서비스 고도화 및 추가 개발: maintenance → **iot_device**
- [freemoa:48472] 해외(태국) 무인 생수 락커 SW 및 제어보드 통합 개발: other → **iot_device**

## engagement_type 변경 (0건)

- 없음

## industry 변경 (0건)

- 없음

## reuse_level 변경 (0건)

- 없음

## complexity_types 변경 (0건)

- 없음

## technology_assets 변경 (2건)

- [wishket:158896] Java 기반 녹취 솔루션 구축 PL: + speech_audio_ai
- [freemoa:48504] 유소년 스포츠 등번호 AI 하이라이트 웹 MVP 개발: + computer_vision

## 애매 표시가 해소된 사례 (7건)

- [wishket:158882] Spring Boot 기반 PG사 선불시스템 구축 개발: 이전 애매 필드 project_type
- [wishket:158892] 스크린 파크골프 브랜드 신규 홈페이지 제작: 이전 애매 필드 engagement_type
- [wishket:158890] APM/DR 기반 금융권 차세대 인프라 관제 및 금융보안 분석·설계: 이전 애매 필드 project_type
- [freemoa:48504] 유소년 스포츠 등번호 AI 하이라이트 웹 MVP 개발: 이전 애매 필드 technology_assets
- [freemoa:48502] 언론 웹사이트 추가 개발 및 유지보수: 이전 애매 필드 engagement_type
- [freemoa:48491] 위하고 세무 업무 자동화 PC 프로그램 구축: 이전 애매 필드 engagement_type
- [freemoa:48472] 해외(태국) 무인 생수 락커 SW 및 제어보드 통합 개발: 이전 애매 필드 project_type

## 아직 애매한 사례 (5건)

- [wishket:158896] Java 기반 녹취 솔루션 구축 PL — AI 판단 애매: industry
- [wishket:158850] 예약 플랫폼 프론트/백엔드 연동 및 해외 결제 시스템 구축 — AI 판단 애매: industry
- [wishket:158878] 중등 온라인 교육 서비스 모바일 앱·반응형 웹 QA — AI 판단 애매: technology_assets
- [freemoa:48501] 기존 웹/앱 서비스 고도화 및 추가 개발 — complexity_types 4개; AI 판단 애매: industry, engagement_type
- [freemoa:48472] 해외(태국) 무인 생수 락커 SW 및 제어보드 통합 개발 — complexity_types 4개


