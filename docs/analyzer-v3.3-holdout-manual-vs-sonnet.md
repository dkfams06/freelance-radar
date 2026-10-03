# 분류 비교: v3.3 (claude-code-session (manual, API 미호출)) → v3.3 (claude-sonnet-5-5)

- 비교 대상: 20건

## 실행 결과 (이후 파일 기준)

- schema 성공: 20/20 (100%) · 최종 schema failure 0건 · 기타 실패 0건
- retry: 1회 (재시도한 프로젝트 1건)
- 토큰: input 198 · output 74,886 · cache write 115,123 · cache read 1,069,940
- 비용: $1.2511 (건당 $0.0626)

## taxonomy 일치율

| 필드 | 일치 | 일치율 |
|---|---|---|
| project_type | 16/20 | 80% |
| engagement_type | 19/20 | 95% |
| industry | 18/20 | 90% |
| reuse_level | 13/20 | 65% |
| complexity_types (완전 일치 / 평균 Jaccard) | 8/20 | 72% |
| technology_assets (완전 일치 / 평균 Jaccard) | 2/20 | 63% |

## 점수 차이 (이후 − 이전)

| 항목 | 이전 평균 | 이후 평균 | 평균 차이 | 평균 절대 차이 |
|---|---|---|---|---|
| vibe_coding_difficulty | 42.3 | 47.9 | +5.6 | 6.2 |
| learning_value | 39.8 | 46.5 | +6.8 | 6.8 |
| reusability_value | 33.7 | 44.0 | +10.3 | 12.3 |
| market_value | 45.0 | 55.5 | +10.5 | 11.2 |
| technical_risk | 39.4 | 44.1 | +4.8 | 6.3 |
| requirement_clarity | 56.6 | 53.7 | -2.9 | 6.4 |
| estimated_hours_min | 411.4 | 393.1 | -18.3 | 56.7 |
| estimated_hours_max | 665.5 | 599.9 | -65.6 | 100.8 |

## 차이가 큰 프로젝트 TOP 5

(거리 = 점수 5종 평균 절대 차이 + 분류 불일치 1개당 15)

- [wishket:155100] WordPress 기반 글로벌 B2B 홈페이지 신규 구축 — 거리 46.4: 점수 차 평균 16.4, 시간 95h → 160h, 분류 industry general→manufacturing, reuse_level low→high
- [wishket:149922] Sharetribe 기반 숙박 예약 플랫폼 결제/정산 기능 개발 — 거리 39.6: 점수 차 평균 9.6, 시간 130h → 180h, 분류 project_type reservation→platform_marketplace, reuse_level low→medium
- [freemoa:47955] (상주) 커스텀 Android 단말 및 기본 탑재 앱 QA엔지니어 — 거리 29.4: 점수 차 평균 14.4, 시간 165h → 165h, 분류 reuse_level one_off→low
- [wishket:150086] 쿠팡 API 연동 제품 판매량 및 재고 추적 자동화 (Excel VBA) — 거리 27.6: 점수 차 평균 12.6, 시간 21h → 24h, 분류 reuse_level low→medium
- [wishket:150884] Nest.js/React 기반 회계/인사 ERP 시스템 기능 개선 — 거리 24.6: 점수 차 평균 9.6, 시간 130h → 140h, 분류 industry hr→professional_services

## other 건수

| 필드 | 이전 | 이후 |
|---|---|---|
| project_type | 0 | 0 |
| engagement_type | 0 | 0 |
| industry | 2 | 2 |
| reuse_level | 0 | 0 |
| complexity_types (other 포함) | 0 | 0 |
| technology_assets (other 포함) | 0 | 0 |

## project_type 변경 (4건)

- [freemoa:48251] 별장/콘도 회원권 분양, 예약 관리 플랫폼 구축(Web/App): reservation → **platform_marketplace**
- [freemoa:47969] OpenClaw 설치 및 증권 HTS API 연동 설정 작업: crawler_data_collection → **automation_rpa**
- [wishket:149922] Sharetribe 기반 숙박 예약 플랫폼 결제/정산 기능 개발: reservation → **platform_marketplace**
- [wishket:153015] AI 기반 사용자 맞춤형 디지털 복지 앱 구축: mobile_app → **platform_marketplace**

## engagement_type 변경 (1건)

- [freemoa:48169] [도급/상주] 영어교육 플랫폼 차세대 아키텍처 전환 개발: migration → **renewal**

## industry 변경 (2건)

- [wishket:155100] WordPress 기반 글로벌 B2B 홈페이지 신규 구축: general → **manufacturing**
- [wishket:150884] Nest.js/React 기반 회계/인사 ERP 시스템 기능 개선: hr → **professional_services**

## reuse_level 변경 (7건)

- [freemoa:47955] (상주) 커스텀 Android 단말 및 기본 탑재 앱 QA엔지니어: one_off → **low**
- [freemoa:48311] [상주] PLM/BOM 고도화 개발 (Java/Vue3/Tibero): one_off → **low**
- [freemoa:47704] 크리에이터 주요 지표 분석 시각화 제공 플랫폼 웹 개발: high → **medium**
- [wishket:155100] WordPress 기반 글로벌 B2B 홈페이지 신규 구축: low → **high**
- [wishket:156240] Supabase 기반 사용자 게시판 및 관리자/광고주 대시보드 구축: high → **medium**
- [wishket:150086] 쿠팡 API 연동 제품 판매량 및 재고 추적 자동화 (Excel VBA): low → **medium**
- [wishket:149922] Sharetribe 기반 숙박 예약 플랫폼 결제/정산 기능 개발: low → **medium**

## complexity_types 변경 (12건)

- [freemoa:48251] 별장/콘도 회원권 분양, 예약 관리 플랫폼 구축(Web/App): + high_risk_domain
- [freemoa:48311] [상주] PLM/BOM 고도화 개발 (Java/Vue3/Tibero): + workflow_complex
- [freemoa:47704] 크리에이터 주요 지표 분석 시각화 제공 플랫폼 웹 개발: + integration_heavy
- [freemoa:48169] [도급/상주] 영어교육 플랫폼 차세대 아키텍처 전환 개발: + workflow_complex
- [wishket:158096] 글로벌 B2B 쇼핑몰 신규 구축 (WordPress + WooCommerce): + integration_heavy
- [wishket:156240] Supabase 기반 사용자 게시판 및 관리자/광고주 대시보드 구축: + multi_platform / - standard_crud
- [wishket:158628] React/Spring Boot 기반 대기업 PG 백오피스 풀스택 개발: + workflow_complex
- [wishket:154821] RPA 기반 대기업 업무 프로세스 자동화 개발 및 운영 지원: + integration_heavy
- [wishket:157477] EMS 연동 피크제어 및 Auto-DR 서버 백엔드 개발: + algorithmic_specialized / - realtime
- [wishket:157967] C#.Net WPF 기반 키오스크 배리어프리 기능 추가 개발: + hardware_iot
- [wishket:150884] Nest.js/React 기반 회계/인사 ERP 시스템 기능 개선: + workflow_complex
- [wishket:153015] AI 기반 사용자 맞춤형 디지털 복지 앱 구축: + integration_heavy

## technology_assets 변경 (18건)

- [freemoa:48251] 별장/콘도 회원권 분양, 예약 관리 플랫폼 구축(Web/App): + realtime, security
- [freemoa:48011] [신규/임베디드] Raspberry Pi 센서 연동 프로토타입 개발: + data_pipeline
- [freemoa:47955] (상주) 커스텀 Android 단말 및 기본 탑재 앱 QA엔지니어: + hardware_iot / - mobile
- [freemoa:48311] [상주] PLM/BOM 고도화 개발 (Java/Vue3/Tibero): + core_web
- [freemoa:47704] 크리에이터 주요 지표 분석 시각화 제공 플랫폼 웹 개발: + external_api_integration
- [freemoa:48169] [도급/상주] 영어교육 플랫폼 차세대 아키텍처 전환 개발: + data_pipeline, security, legacy_enterprise / - cloud_infra
- [wishket:158096] 글로벌 B2B 쇼핑몰 신규 구축 (WordPress + WooCommerce): + authentication_authorization, admin_system, external_api_integration, security
- [wishket:155100] WordPress 기반 글로벌 B2B 홈페이지 신규 구축: + backend_api, database, admin_system
- [wishket:156240] Supabase 기반 사용자 게시판 및 관리자/광고주 대시보드 구축: + ai_llm, cloud_infra, security / - external_api_integration
- [wishket:158628] React/Spring Boot 기반 대기업 PG 백오피스 풀스택 개발: + admin_system, data_pipeline / - payments
- [wishket:154821] RPA 기반 대기업 업무 프로세스 자동화 개발 및 운영 지원: + browser_automation, analytics_dashboard
- [wishket:150086] 쿠팡 API 연동 제품 판매량 및 재고 추적 자동화 (Excel VBA): + workflow_automation
- [wishket:157477] EMS 연동 피크제어 및 Auto-DR 서버 백엔드 개발: + data_pipeline / - realtime
- [wishket:149922] Sharetribe 기반 숙박 예약 플랫폼 결제/정산 기능 개발: + database / - admin_system
- [wishket:152942] Nest.js/AWS 기반 AI튜터 앱 백엔드 개발 (주 20시간 재택): + legacy_enterprise
- [wishket:157967] C#.Net WPF 기반 키오스크 배리어프리 기능 추가 개발: + hardware_iot
- [wishket:150884] Nest.js/React 기반 회계/인사 ERP 시스템 기능 개선: + admin_system
- [wishket:153015] AI 기반 사용자 맞춤형 디지털 복지 앱 구축: + authentication_authorization, core_web

## 애매 표시가 해소된 사례 (1건)

- [freemoa:47969] OpenClaw 설치 및 증권 HTS API 연동 설정 작업: 이전 애매 필드 project_type

## 아직 애매한 사례 (6건)

- [freemoa:48251] 별장/콘도 회원권 분양, 예약 관리 플랫폼 구축(Web/App) — complexity_types 4개; AI 판단 애매: project_type
- [freemoa:48169] [도급/상주] 영어교육 플랫폼 차세대 아키텍처 전환 개발 — 월 단가/상주 공고인데 engagement_type=renewal
- [wishket:153028] 클라우드 기반 전자차트 SaaS 플랫폼 MVP 개발 — industry=other
- [wishket:157477] EMS 연동 피크제어 및 Auto-DR 서버 백엔드 개발 — industry=other
- [wishket:157967] C#.Net WPF 기반 키오스크 배리어프리 기능 추가 개발 — AI 판단 애매: project_type
- [wishket:153015] AI 기반 사용자 맞춤형 디지털 복지 앱 구축 — AI 판단 애매: project_type
