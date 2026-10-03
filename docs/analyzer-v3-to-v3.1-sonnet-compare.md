# 분류 비교: v3 (claude-sonnet-5-5) → v3.1 (claude-sonnet-5-5)

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
| engagement_type | 19/20 | 95% |
| industry | 20/20 | 100% |
| reuse_level | 12/20 | 60% |
| complexity_types (완전 일치 / 평균 Jaccard) | 13/20 | 87% |
| technology_assets (완전 일치 / 평균 Jaccard) | 10/20 | 84% |

## 점수 차이 (이후 − 이전)

| 항목 | 이전 평균 | 이후 평균 | 평균 차이 | 평균 절대 차이 |
|---|---|---|---|---|
| vibe_coding_difficulty | 57.9 | 57.1 | -0.8 | 1.5 |
| learning_value | 45.6 | 46.3 | +0.6 | 3.4 |
| reusability_value | 40.0 | 34.4 | -5.6 | 8.1 |
| market_value | 48.8 | 47.2 | -1.6 | 3.3 |
| technical_risk | 55.4 | 55.5 | +0.1 | 1.9 |
| requirement_clarity | 54.3 | 53.9 | -0.4 | 2.1 |
| estimated_hours_min | 569.5 | 610.0 | +40.5 | 45.5 |
| estimated_hours_max | 912.6 | 881.3 | -31.4 | 52.6 |

## 차이가 큰 프로젝트 TOP 5

(거리 = 점수 5종 평균 절대 차이 + 분류 불일치 1개당 15)

- [freemoa:48501] 기존 웹/앱 서비스 고도화 및 추가 개발 — 거리 31.0: 점수 차 평균 1.0, 시간 180h → 185h, 분류 engagement_type maintenance→feature_extension, reuse_level one_off→low
- [freemoa:48495] 자사 iOS 앱 승인 대응 — 거리 22.0: 점수 차 평균 7.0, 시간 180h → 180h, 분류 reuse_level medium→low
- [freemoa:48488] [상주] AI Agent 구축 상주 인력 모집 — 거리 22.0: 점수 차 평균 7.0, 시간 1100h → 1250h, 분류 reuse_level medium→low
- [freemoa:48491] 위하고 세무 업무 자동화 PC 프로그램 구축 — 거리 21.4: 점수 차 평균 6.4, 시간 380h → 440h, 분류 reuse_level medium→low
- [freemoa:48472] 해외(태국) 무인 생수 락커 SW 및 제어보드 통합 개발 — 거리 20.6: 점수 차 평균 5.6, 시간 1000h → 900h, 분류 reuse_level medium→low

## other 건수

| 필드 | 이전 | 이후 |
|---|---|---|
| project_type | 1 | 0 |
| engagement_type | 0 | 0 |
| industry | 0 | 0 |
| reuse_level | 0 | 0 |
| complexity_types (other 포함) | 0 | 0 |
| technology_assets (other 포함) | 0 | 1 |

## project_type 변경 (2건)

- [wishket:158878] 중등 온라인 교육 서비스 모바일 앱·반응형 웹 QA: other → **qa_testing**
- [freemoa:48502] 언론 웹사이트 추가 개발 및 유지보수: maintenance → **website**

## engagement_type 변경 (1건)

- [freemoa:48501] 기존 웹/앱 서비스 고도화 및 추가 개발: maintenance → **feature_extension**

## industry 변경 (0건)

- 없음

## reuse_level 변경 (8건)

- [wishket:158857] .NET 기반 기능 수정 및 보안 개발: medium → **low**
- [wishket:158882] Spring Boot 기반 PG사 선불시스템 구축 개발: medium → **low**
- [wishket:158892] 스크린 파크골프 브랜드 신규 홈페이지 제작: low → **medium**
- [freemoa:48501] 기존 웹/앱 서비스 고도화 및 추가 개발: one_off → **low**
- [freemoa:48495] 자사 iOS 앱 승인 대응: medium → **low**
- [freemoa:48491] 위하고 세무 업무 자동화 PC 프로그램 구축: medium → **low**
- [freemoa:48488] [상주] AI Agent 구축 상주 인력 모집: medium → **low**
- [freemoa:48472] 해외(태국) 무인 생수 락커 SW 및 제어보드 통합 개발: medium → **low**

## complexity_types 변경 (7건)

- [wishket:158882] Spring Boot 기반 PG사 선불시스템 구축 개발: + workflow_complex
- [wishket:158884] Oracle 기반 생산계획 시스템 구축 PL: + algorithmic_specialized
- [wishket:158888] EDW/CDC·ETL 기반 금융권 차세대 정보계 분석·설계: + integration_heavy
- [wishket:158878] 중등 온라인 교육 서비스 모바일 앱·반응형 웹 QA: - workflow_complex
- [freemoa:48501] 기존 웹/앱 서비스 고도화 및 추가 개발: - integration_heavy
- [freemoa:48479] 삼성 안드로이드 태블릿 웹사이트 출력 연동 APK 개발: - integration_heavy
- [freemoa:48470] 거래소 신규 공지사항 실시간 감지 파이썬 코드 개발: - realtime

## technology_assets 변경 (10건)

- [wishket:158857] .NET 기반 기능 수정 및 보안 개발: + core_web
- [wishket:158891] 물류 자동화 설비 연동 WMS 반품 자동화 백엔드 개발: - database
- [wishket:158878] 중등 온라인 교육 서비스 모바일 앱·반응형 웹 QA: + other / - mobile, core_web
- [freemoa:48504] 유소년 스포츠 등번호 AI 하이라이트 웹 MVP 개발: + docker
- [freemoa:48502] 언론 웹사이트 추가 개발 및 유지보수: + external_api_integration, admin_system
- [freemoa:48495] 자사 iOS 앱 승인 대응: + legacy_enterprise
- [freemoa:48491] 위하고 세무 업무 자동화 PC 프로그램 구축: + workflow_automation, legacy_enterprise / - authentication_authorization
- [freemoa:48487] AI 기반 주거형 종합공조 토탈 플랫폼 신규 구축: - ai_llm
- [freemoa:48479] 삼성 안드로이드 태블릿 웹사이트 출력 연동 APK 개발: - external_api_integration
- [freemoa:48470] 거래소 신규 공지사항 실시간 감지 파이썬 코드 개발: - data_pipeline

## 애매 표시가 해소된 사례 (19건)

- [wishket:158857] .NET 기반 기능 수정 및 보안 개발: 이전 애매 필드 project_type, industry
- [wishket:158882] Spring Boot 기반 PG사 선불시스템 구축 개발: 이전 애매 필드 industry, reuse_level
- [wishket:158896] Java 기반 녹취 솔루션 구축 PL: 이전 애매 필드 industry, technology_assets
- [wishket:158891] 물류 자동화 설비 연동 WMS 반품 자동화 백엔드 개발: 이전 애매 필드 project_type, industry
- [wishket:158892] 스크린 파크골프 브랜드 신규 홈페이지 제작: 이전 애매 필드 engagement_type
- [wishket:158884] Oracle 기반 생산계획 시스템 구축 PL: 이전 애매 필드 project_type, reuse_level
- [wishket:158850] 예약 플랫폼 프론트/백엔드 연동 및 해외 결제 시스템 구축: 이전 애매 필드 engagement_type, industry
- [wishket:158890] APM/DR 기반 금융권 차세대 인프라 관제 및 금융보안 분석·설계: 이전 애매 필드 reuse_level
- [wishket:158888] EDW/CDC·ETL 기반 금융권 차세대 정보계 분석·설계: 이전 애매 필드 complexity_types
- [wishket:158878] 중등 온라인 교육 서비스 모바일 앱·반응형 웹 QA: 이전 애매 필드 project_type, technology_assets
- [freemoa:48504] 유소년 스포츠 등번호 AI 하이라이트 웹 MVP 개발: 이전 애매 필드 project_type, reuse_level
- [freemoa:48502] 언론 웹사이트 추가 개발 및 유지보수: 이전 애매 필드 project_type
- [freemoa:48495] 자사 iOS 앱 승인 대응: 이전 애매 필드 project_type, complexity_types
- [freemoa:48491] 위하고 세무 업무 자동화 PC 프로그램 구축: 이전 애매 필드 engagement_type, complexity_types
- [freemoa:48488] [상주] AI Agent 구축 상주 인력 모집: 이전 애매 필드 reuse_level
- [freemoa:48487] AI 기반 주거형 종합공조 토탈 플랫폼 신규 구축: 이전 애매 필드 project_type, industry
- [freemoa:48479] 삼성 안드로이드 태블릿 웹사이트 출력 연동 APK 개발: 이전 애매 필드 project_type, industry
- [freemoa:48472] 해외(태국) 무인 생수 락커 SW 및 제어보드 통합 개발: 이전 애매 필드 project_type, complexity_types
- [freemoa:48470] 거래소 신규 공지사항 실시간 감지 파이썬 코드 개발: 이전 애매 필드 reuse_level

## 아직 애매한 사례 (2건)

- [freemoa:48501] 기존 웹/앱 서비스 고도화 및 추가 개발 — AI 판단 애매: engagement_type
- [freemoa:48472] 해외(태국) 무인 생수 락커 SW 및 제어보드 통합 개발 — complexity_types 5개
