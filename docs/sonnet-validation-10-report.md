# Sonnet v3.3 10건 교차검증

- 모델: **claude-sonnet-5-5** (Sonnet, Codex CLI 구독)
- 기준: **claude-haiku-4-5-20251001** 기존 DB 결과
- 표본: 10/10건 · seed=luna-validation-v3.3-10-v1
- Sonnet 저장 오류 복구를 위해 고정 10건의 Haiku 기준만 재실행했고, 그 외 Haiku 결과는 재분석하지 않았습니다.
- API/Batch API는 사용하지 않았습니다.

## 일관성 지표

| 지표 | 결과 |
|---|---:|
| project_type 일치율 | 90.0% |
| engagement_type 일치율 | 90.0% |
| reuse_level 4단계 일치율 | 40.0% |
| reuse_level 3단계 일치율 | 40.0% |
| complexity_types Jaccard 평균/중앙/p75 | 0.42 / 0.33 / 0.63 |
| technology_assets Jaccard 평균/중앙/p75 | 0.64 / 0.69 / 0.82 |
| vibe_coding_difficulty MAE | 10.00 |
| estimated_hours midpoint 중앙 상대오차 | 16.2% |
| learning_value MAE | 21.30 |
| reusability_value MAE | 12.50 |
| market_value MAE | 16.60 |
| uncertain_fields Haiku/Sonnet/either | 0.0% / 10.0% / 10.0% |

## 숫자 항목 세부

| 항목 | MAE | 중앙 절대차 | 최대 차이 | Sonnet-Haiku 평균 부호차 |
|---|---:|---:|---:|---:|
| vibe_coding_difficulty | 10.00 | 6.00 | 45.00 | -7.00 |
| estimated_hours_min | 111.50 | 85.00 | 400.00 | +44.50 |
| estimated_hours_max | 110.50 | 70.00 | 430.00 | +68.50 |
| learning_value | 21.30 | 22.50 | 50.00 | -21.30 |
| reusability_value | 12.50 | 7.50 | 40.00 | -8.50 |
| market_value | 16.60 | 13.00 | 45.00 | -14.00 |
| technical_risk | 13.70 | 8.50 | 60.00 | -7.30 |
| requirement_clarity | 20.00 | 22.50 | 35.00 | -20.00 |
| estimated_hours_midpoint 상대차 | 110.50 | 16.2% | 140.0% | +56.50 |

## 프로젝트별 비교

| project_id | project_type H/Sonnet | engagement H/Sonnet | reuse H/Sonnet | 난이도 H/Sonnet | 시간 중앙 H/Sonnet | learning H/Sonnet | reuse H/Sonnet | market H/Sonnet |
|---|---|---|---|---:|---:|---:|---:|---:|
| 6e511f64-cc55-4541-a9ce-1f7f213292bd | business_management / business_management | staffing / staffing | low / low | 50 / 62 | 875 / 800 | 70 / 40 | 45 / 25 | 45 / 40 |
| 501a527d-ebdd-470d-9aa4-5fb4aecb3e9e | platform_marketplace / platform_marketplace | new_build / new_build | medium / medium | 50 / 42 | 325 / 360 | 60 / 60 | 65 / 65 | 65 / 78 |
| 48ee13f5-8763-49ce-bced-995a50664fa4 | ecommerce / ecommerce | new_build / new_build | high / medium | 45 / 48 | 330 / 230 | 82 / 55 | 78 / 55 | 85 / 60 |
| b11ce3d9-d0e1-4166-9fa2-90b51f5d979e | website / website | new_build / new_build | low / medium | 15 / 12 | 55 / 55 | 50 / 22 | 40 / 45 | 75 / 70 |
| e92aee11-0b86-41d0-9f5c-30c152084cc9 | ai_service / ai_service | staffing / staffing | low / medium | 40 / 30 | 300 / 235 | 65 / 45 | 35 / 45 | 70 / 60 |
| 0acc3238-f043-451e-9ae6-6f941a81ca07 | business_management / other | staffing / staffing | medium / low | 60 / 15 | 600 / 900 | 75 / 25 | 60 / 20 | 80 / 35 |
| 95773a7f-3ca9-4266-a6cd-dc17a7abe802 | platform_marketplace / platform_marketplace | new_build / new_build | high / medium | 42 / 35 | 300 / 270 | 58 / 50 | 72 / 60 | 68 / 55 |
| d510f93c-45e1-431b-b6fa-842b397432ba | other / other | new_build / new_build | medium / low | 72 / 68 | 250 / 600 | 75 / 50 | 35 / 30 | 60 / 35 |
| aa34a867-0993-4c78-86ba-33f8b715f94a | admin_backoffice / admin_backoffice | staffing / staffing | low / low | 48 / 45 | 475 / 520 | 55 / 45 | 40 / 35 | 65 / 50 |
| 6c1e032d-69d7-42aa-a57a-97f36bbe79e6 | mobile_app / mobile_app | feature_extension / maintenance | low / low | 60 / 55 | 275 / 380 | 60 / 45 | 35 / 40 | 75 / 65 |

## 편향 확인

- 난이도 평균 부호차(Sonnet-Haiku): **-7.00**
- 시간 중앙값 평균 부호차: **+56.50시간**
- learning 평균 부호차: **-21.30**
- reusability 평균 부호차: **-8.50**
- market 평균 부호차: **-14.00**
- Sonnet project_type 분포: business_management 1건, platform_marketplace 2건, ecommerce 1건, website 1건, ai_service 1건, other 2건, admin_backoffice 1건, mobile_app 1건

## 차이가 큰 프로젝트 근거

### 6e511f64-cc55-4541-a9ce-1f7f213292bd
- 차이 필드: 수치 편차
- 주요 수치 편차: estimated_hours_min -100, estimated_hours_max -50, learning_value -30
- Haiku 근거: 제조 관리 시스템은 반복적이나 반도체 MAPS는 매우 특화된 영역이어서 중간 수준. | C#, Java, Oracle 주류 기술 심화와 대규모 제조 시스템 경험의 높은 학습가치. | 기존 코드베이스 의존성, 멀티 스택 복잡성, 제조 시스템의 규제/정확성 요구로 중간~높음. | 150일 상주 근무(약 1200시간) 중 70~80%를 순수 개발로 추정. | 모듈/아키텍처 일부는 재사용 가능하나 비즈니스 로직이 특정 고객 시스템에 종속. | 기존 코드베이스 학습과 멀티 스택, 제조 도메인이 복잡하나 CRUD 중심이고 검증된 아키텍처에 참여.
- Sonnet 근거: 제조 IT 상주 수요는 있으나 도메인이 특수함 | 제조 MES 도메인 경험은 얻지만 기술 자체는 일반적임 | 측위 로직 범위가 불명확하고 기존 시스템에 의존함 | 5개월 상주 1인 기준 약 700~900시간으로 추정 | 특정 고객사 업무 로직 중심이라 재사용이 제한적임 | 반도체 공장 상주, C#/Java 연동과 기존 시스템 의존으로 난이도 높음

### 501a527d-ebdd-470d-9aa4-5fb4aecb3e9e
- 차이 필드: 수치 편차
- 주요 수치 편차: estimated_hours_max +40, estimated_hours_min +30, market_value +13
- Haiku 근거: 거래 플랫폼 기술 시장 반복성 높음(커머스, 예약), 미술품 도메인 특화는 낮음 | 결제/정산/다단계 승인 재학습 가치 있으나 기본 기술, 미술품 도메인 학습은 일회성 | PG 연동, 결제 정확성, 앱 스토어 심사 등 외부 의존성 중간, 기술적 미지수 적음 | 모바일 웹 개발 200시간, UI/UX 디자인 100시간, 앱·배포 50시간, AI 활용으로 속도 향상 | 거래 플랫폼 표준 모듈(결제, 권한, 워크플로우)은 높은 재사용성, 미술품 특화 정책 부분 낮음 | 표준 CRUD+워크플로우 구현은 AI 친화적이나, 디자인 품질 중시와 60일 일정 변수
- Sonnet 근거: 중개·마켓플레이스 신규 구축 수요가 많아 반복성이 높음. | 결제·정산과 웹뷰 앱 배포 경험은 쌓이지만 기술 자체는 표준적. | 정산 정확성, 에스크로·PG 계약, 스토어 심사와 디자인 기대치가 위험 요소. | 디자인, 모바일 웹 20화면, 관리자, 결제·정산, 앱 패키징, 인프라까지 포함. | 작가·상품·승인·결제·정산 구조는 다른 마켓플레이스에 재사용 가능. | 마켓플레이스 CRUD에 결제·정산·승인 흐름과 앱 패키징이 더해진 중간 난이도.

### 48ee13f5-8763-49ce-bced-995a50664fa4
- 차이 필드: reuse_level
- 주요 수치 편차: estimated_hours_max -110, estimated_hours_min -90, learning_value -27
- Haiku 근거: 쇼핑몰·주문·결제 시스템은 시장에서 매우 자주 반복되는 요구 | 쇼핑몰·결제·관리자 등 매우 실용적이고 반복적인 기술 습득 | 결제 연동·데이터 일관성이 중간 리스크, 기본 기술은 검증됨 | 40일 일정 대비 기획·디자인·프론트·백·인프라·관리자·테스트 전 범위 포함 | 인증·결제·주문·관리자 70% 이상 코드 다른 커머스 프로젝트 재사용 가능 | 표준 CRUD + 실시간 미리보기 + PDF 자동 생성 조합으로 중상 난이도
- Sonnet 근거: 주문제작·인쇄물 쇼핑몰 수요는 꾸준히 반복됨. | 캔버스 편집기와 인쇄 PDF 생성, 카페24 커스터마이징을 익힐 수 있음. | 카페24 솔루션 제약과 인쇄 품질(CMYK, 재단선) 요건이 불명확해 위험이 있음. | 기획·디자인 포함 쇼핑몰, 편집기, PDF 생성, 관리자 통계까지 약 170~290시간. | 주문제작 편집기와 PDF 출력 모듈은 재사용 가능하나 카페24 종속 부분이 있음. | 카페24 제약 속 템플릿 편집기와 인쇄용 PDF 생성이 핵심이라 중상 난이도.

### b11ce3d9-d0e1-4166-9fa2-90b51f5d979e
- 차이 필드: reuse_level
- 주요 수치 편차: learning_value -28, requirement_clarity -8, estimated_hours_min -5
- Haiku 근거: 상담 전환형 랜딩, 교육 타깃, GA4·네이버 추적은 매우 반복적인 시장 수요입니다. | 상담 전환 UI/UX, 교육 마케팅, GA4 기본 설정 등 실무 경험이 쌓이지만 새 기술은 제한적. | 신규 구축으로 레거시 위험 없고, GA4·네이버는 기본 설정이라 기술 위험 낮습니다. | 기획(15h) + 디자인(20h) + 개발(10h) + 설정(3h) + 테스트(3h) 기준으로 추정. | GA4·네이버 추적 설정, 상담폼 구조는 재사용 가능하지만 기획·디자인·콘텐츠는 고객 특화. | 아임웹/WordPress 기반 기본 CRUD 랜딩, 기획·디자인이 핵심이라 기술 난이도는 낮습니다.
- Sonnet 근거: 학원·상담형 랜딩 수요는 반복적으로 많음. | 전환추적·SEO 세팅은 유용하나 개발 학습은 적음. | 기술 위험 낮고 콘텐츠 자료 의존 정도만 있음. | 기획·카피·디자인·제작·추적 세팅 포함 약 40~70시간. | 랜딩 구조와 추적 세팅은 재사용 가능하나 콘텐츠는 고객 전용. | 노코드/CMS 기반 랜딩이며 코드 난이도 낮고 기획·카피 비중이 큼.

### e92aee11-0b86-41d0-9f5c-30c152084cc9
- 차이 필드: reuse_level
- 주요 수치 편차: estimated_hours_min -90, estimated_hours_max -40, requirement_clarity -35
- Haiku 근거: AI 상담 서비스는 법, 의료, 재정, 기술지원 등 다양한 산업에서 반복 요구됨 | AI 상담 서비스 설계 패턴은 다양한 도메인에 재적용 가능하나 법률 특화는 제한적 | LLM의 hallucination과 법률정보 정확성 보증, 규제 준수가 주요 기술 리스크 | 기획(40h) + UI/UX 설계(120h) + 수정/협업(100h) 합계 3개월 상주 | 설계 산출물 기반이므로 설계 개념은 참고 가능하지만 실제 코드 재사용 불가 | LLM API 연동과 채팅 UI는 표준 난이도, 설계 문서가 있으므로 중간 수준
- Sonnet 근거: AI 상담 서비스는 수요가 있으나 상주 디자이너 건은 제한적이다. | LLM 상담 서비스 기획 경험은 있으나 범위가 제한적이다. | 법률 답변 정확성과 범위 모호함이 위험 요소다. | 3개월 상주 기획·디자인에 LLM 연동 일부를 포함해 추정했다. | AI 챗 UI와 디자인 패턴은 재사용 가능하나 도메인 의존이 있다. | 기획·디자인 중심에 LLM 연동 챗 기능으로 난이도는 낮은 편이다.

### 0acc3238-f043-451e-9ae6-6f941a81ca07
- 차이 필드: project_type, reuse_level
- 주요 수치 편차: estimated_hours_min +400, estimated_hours_max +200, technical_risk -60
- Haiku 근거: 소매/외식/매장 운영 시장 규모 크고 POS 솔루션 수요 지속적 | POS 아키텍처, 실시간 동기화, 키오스크/터미널 연동 등 다른 매장 시스템에 재사용 가능 | 하드웨어 터미널 연동, 결제 시스템 PCI 규정, 실시간 동기화 성능, 외부 POS API 불확실성 | 기획 6개월 프로젝트의 개발+테스트+하드웨어 연동 포함, 범위 변경 예상 | 기본 CRUD/관리자/결제/실시간 구조는 재사용 가능하나 POS 비즈니스 로직은 특화 | 다중 플랫폼+실시간 동기화+하드웨어 연동 복잡도이나 기획 기반 구현으로 중상 수준
- Sonnet 근거: UX 기획 상주 공고는 있으나 개발 외주와는 거리가 있다. | POS/주문 UX 도메인 지식은 얻지만 개발 기술 학습은 적다. | 기술적 위험은 거의 없고 협업과 범위 모호성이 위험이다. | 6개월 상주 기간제로 월 약 140~170시간 기준 추정. | Figma 컴포넌트와 산출물은 특정 회사 제품에 종속된다. | 코딩 없는 Figma UX 기획 상주 업무라 구현 난이도는 낮다.

### 95773a7f-3ca9-4266-a6cd-dc17a7abe802
- 차이 필드: reuse_level
- 주요 수치 편차: estimated_hours_min -50, requirement_clarity -28, market_value -13
- Haiku 근거: 지도 기반 커뮤니티는 부동산, 여행, 로컬 서비스 등 다양한 산업에서 반복 | PWA와 지도 API 연동은 향후 재사용 가능하나 새로운 개념은 제한적 | 안정적인 지도 API와 표준 기술 스택으로 기술적 실패 위험 낮음 | 8주 프로젝트, 웹프론트 80-120h + 백엔드 40-60h + 지도/커뮤니티 50-100h + 테스트 30-50h | 회원/커뮤니티 구조 매우 표준화, 지도 API 통합 아키텍처도 다시 쓸 수 있음 | 표준 CRUD(회원, 커뮤니티) + 지도 API 연동, 기존 라이브러리로 대부분 해결 가능
- Sonnet 근거: 지도 기반 커뮤니티 웹앱은 외주 시장에서 반복적으로 등장 | PWA와 지도 기반 서비스 경험은 유용하나 범위는 일반적 | 상세 요구사항이 비공개이고 해양 데이터 연동 범위가 불명확함 | 지도, 커뮤니티, 회원, 관리자, 디자인 반영 포함 8주 범위로 추정 | 회원·게시판·지도 구조는 다른 프로젝트에 재사용 가능 | 지도·커뮤니티·회원 중심 PWA로 표준 CRUD에 지도 연동이 추가됨

### d510f93c-45e1-431b-b6fa-842b397432ba
- 차이 필드: reuse_level
- 주요 수치 편차: estimated_hours_max +430, estimated_hours_min +270, learning_value -25
- Haiku 근거: 3D 교육 시뮬레이션은 산업 전반에서 반복되는 수요입니다. | 3D 시뮬레이션, 게임 엔진, VR/AR 개발 역량을 새로 축적할 수 있습니다. | 기획 미확정, 성능 요구 높음, 파노라마/3D 기술 검증 필요합니다. | 기획부터 3D 모델링, 엔진 개발, 최적화까지 포함하면 180~320시간 필요합니다. | 3D 모델과 시나리오는 고객 특화이지만, DB, 인증, 평가는 재사용 가능합니다. | 3D 그래픽, 실시간 렌더링, 파노라마 처리는 AI 지원이 제한적이고 검증도 어렵습니다.
- Sonnet 근거: 교육용 XR 시뮬레이션 수요는 있으나 일반 외주보다 드묾. | Unity 3D 인터랙션과 시뮬레이션 경험은 얻지만 활용처가 제한적. | 기획 미확정, 현장 자료·촬영 의존, 정밀 조작 품질 불확실. | 기획, 3D 모델링, UI, Unity 개발, 채점, 암호화까지 범위가 넓음. | 도메인 특화 콘텐츠가 많고 일부 로그인·채점 구조만 재사용 가능. | 3D 정밀 인터랙션과 모델링, 시각 검증 필요로 AI 보조 한계가 큼.

### aa34a867-0993-4c78-86ba-33f8b715f94a
- 차이 필드: 수치 편차
- 주요 수치 편차: estimated_hours_max +90, requirement_clarity -25, market_value -15
- Haiku 근거: 포털·관리·배치는 반복적이나 광고 플랫폼 특화로 중상. | 배치 스케줄러·복잡한 상태 전이 경험 가능하나 광고 도메인 특화로 재사용성 낮음. | 금액 계산·정산 오류 비용, 미완성 기존 코드 품질 불명확, 광고 서버 연동 외부 의존. | 90일 상주 범위 내 광고주·관리자 포털·DB·API 4종·배치 개발 = 400~550시간. | 기본 포털 아키텍처만 재사용 가능, 광고·정산 로직은 도메인 특화로 낮음. | 표준 웹 포털 기반이지만 복잡한 비즈니스 로직(정산·심사·배치)과 API 4종 연동으로 중상.
- Sonnet 근거: 관리자 포털과 정산·배치는 흔하지만 광고 도메인은 한정적 | 광고 정산과 배치 설계 경험은 쌓이나 도메인 특수성이 있음 | 연동 규격과 금액 계산 정확성, 기존 코드 품질이 불확실 | 3개월 상주, 콘솔 2개와 연동 4종·배치 개발 범위 기준 | 권한·콘솔 구조는 재사용 가능하나 광고 서버 규격은 종속적 | 두 콘솔과 배치·정산 로직, 기존 AI 생성 코드 보완이 섞여 중간 난이도

### 6c1e032d-69d7-42aa-a57a-97f36bbe79e6
- 차이 필드: engagement_type
- 주요 수치 편차: estimated_hours_max +130, estimated_hours_min +80, learning_value -15
- Haiku 근거: 모바일 앱 결제·유지보수는 커머스 시장에서 매우 반복적인 요구 | PG 연동·OS 버전 대응 등 실무 경험 축적되나 특정 결제사·앱 환경 종속 | 금융 거래 오류의 금전 손실 위험 + 앱스토어 심사 의존 + 레거시 코드 호환성 관리 | 결제 개편 핵심 작업 200시간 + 3개월 유지보수 예상분 150시간 = 최대 350시간 | 특정 결제사 SDK와 앱에 종속적이며 다른 프로젝트에 코드 재사용 거의 불가 | 기존 네이티브 결제 로직 제거·신규 SDK 연동 + iOS/Android 동시 개발 + 실결제 테스트 검증 복잡성
- Sonnet 근거: PG 교체와 앱 유지보수는 시장에서 반복적으로 나오는 유형. | 네이티브 PG SDK 연동과 스토어 운영 경험은 쓸모 있으나 범위 한정적. | 기존 코드 불확실성과 실결제·스토어 심사 의존이 있음. | 결제 교체 약 150~250h, 3개월 유지보수 130~230h로 추정. | 결제 흐름 지식은 재사용되나 코드는 해당 앱에 종속됨. | 기존 네이티브 코드 두 벌에 결제 SDK 교체, 실결제 QA 필요.

## 임시 판단

**대체로 유사하지만 일부 편향 있음 → fallback 가능하나 보정 필요**

- 임시 기준 4/6개를 통과했습니다.
- 실패한 지표와 프로젝트별 근거를 확인해야 합니다.

| 임시 기준 | 통과 |
|---|---|
| project_type | PASS |
| engagement_type | PASS |
| reuse_level_3 | FAIL |
| vibe_difficulty_mae | PASS |
| value_mae | FAIL |
| hours_median_relative_error | PASS |

## Luna / Terra와 참고 비교

- Claude CLI 모델 확인: **claude-sonnet-5-5** (probe의 modelUsage에 동일 식별자 확인)
- 세 모델 모두 동일한 10개 project_id를 사용했고, Sonnet 저장 오류 복구를 위해 이 고정 10건의 Haiku 기준만 재실행했습니다.

| 지표 | Sonnet vs Haiku | Terra vs Haiku | Luna vs Haiku |
|---|---:|---:|---:|
| project_type 일치 | 90.0% | 80.0% | 90.0% |
| engagement 일치 | 90.0% | 80.0% | 100.0% |
| reuse 3단계 일치 | 40.0% | 50.0% | 30.0% |
| complexity Jaccard | 0.42 | 0.52 | 0.55 |
| technology_assets Jaccard | 0.64 | 0.70 | 0.75 |
| vibe MAE | 10.00 | 9.70 | 10.90 |
| 시간 중앙 상대오차 | 16.2% | 51.2% | 31.5% |
| learning MAE | 21.30 | 15.70 | 25.50 |
| reusability MAE | 12.50 | 12.20 | 15.40 |
| market MAE | 16.60 | 12.50 | 20.60 |

- 임시 기준 통과 수: Sonnet 4/6 · Terra 2/6 · Luna 2/6
- Haiku에 가장 가까운 모델(10개 지표의 상대 거리 승수): **Terra** (Sonnet 2, Terra 5, Luna 3)
