# Starter Kit v0.1 재사용성 매트릭스

상태: 구현 전 재사용 목표

아래의 재사용률은 500건 분석에서 개발시간을 측정한 값이 아니다. feature repetition f1과 v0.2 결과를 바탕으로 설정한 초기 설계 목표이며, 첫 2~3개 프로젝트의 작업 로그로 검증해야 한다.

## 1. 재사용 수준 정의

| 수준 | 의미 |
|---|---|
| 거의 완전 재사용 | provider/config와 UI branding 정도만 바꾸고 domain 의미를 그대로 사용 |
| 설정 기반 재사용 | schema, role, field, menu, template 설정을 바꾸면 사용 가능 |
| 부분 재사용 | 공통 command/data model은 재사용하지만 workflow·UI·provider 일부를 다시 구현 |
| custom 중심 | 공통 port 정도만 재사용하고 업무 규칙·데이터·화면은 프로젝트별 개발 |

## 2. 기능별 재사용 매트릭스

| 기능 | 초기 수준 | 설계 목표 | 그대로 재사용 | 설정으로 바꾸는 부분 | 프로젝트별 custom |
|---|---|---:|---|---|---|
| authentication | 거의 완전 재사용 | 90~100% | 세션, guard, auth command | provider, 로그인 화면, branding | 특수 SSO/MFA 정책 |
| user_management | 설정 기반 재사용 | 75~90% | profile lifecycle, membership | 필드, 초대 flow, 메뉴 | 인사/조직 규칙 |
| role_permission | 설정 기반 재사용 | 80~95% | permission check, role model | role·permission 목록 | 리소스별 예외, 결재자 계산 |
| admin_dashboard | 설정 기반 재사용 | 70~90% | layout, card/table 계약 | 메뉴, column, widget | 특수 dashboard 계산 |
| common_crud | 설정 기반 재사용 | 60~85% | pagination, validation hook, repository contract | schema, field, filter | 복합 command, 상태 전이 |
| statistics_dashboard | 부분 재사용 | 50~75% | metric contract, query scope, chart adapter | 기간, metric, widget 배치 | KPI 계산식, materialized view |
| file_upload | 설정 기반 재사용 | 70~90% | metadata, storage authorization | file type, size, ownership | OCR, 변환, 외부 문서 연동 |
| search_filter | 설정 기반 재사용 | 60~80% | filter/pagination contract | 검색 field, sort, index | 전문검색, ranking, 외부 engine |
| notification | 부분 재사용 | 60~80% | record, read state, delivery port | template, channel, recipient | 발송 정책, provider payload |
| payment | 부분 재사용 | 30~60% | intent/status/refund contract | provider 설정, 금액 표시 | PG webhook, 정산, 세금 |
| excel_import_export | 설정 기반 재사용 | 60~85% | preview, row validation, export pipeline | column mapping, 양식 | 고객별 계산식·오류 처리 |
| organization | 설정 기반 재사용 | 70~90% | org scope, membership | 부서/조직 depth | 고객사 조직 정책 |
| workflow | 부분 재사용 | 40~70% | workflow/step envelope | step 명칭, 기본 순서 | 전이 조건, 자동화, 예외 |
| approval | 부분 재사용 | 40~70% | request/decision/audit | 승인자 role | 금액별 결재선, 대결 |
| task_management | 부분 재사용 | 50~80% | work item, assignee, due date | priority, status | 배정 알고리즘, SLA |
| status_management | 설정 기반 재사용 | 50~80% | status command contract | status code, 표시색 | 상태별 side effect |
| report_generation | 부분 재사용 | 40~70% | export hook, report job contract | 기간, column | KPI·문서 양식 |
| external_api_integration | custom 중심 | 20~60% | adapter/connection/error port | endpoint credentials | payload, retry, mapping, 업무 의미 |
| 고객 업무 규칙 | custom 중심 | 0~30% | policy interface 정도 | 일부 threshold | 핵심 계산·승인·예외 |

## 3. project_type별 적용성

| 유형 | core 백본 | optional module | extension | custom 위험 | 초기 전략 |
|---|---|---|---|---|---|
| business_management | 높음 | files/search/notifications/excel | business | 높음 | core를 먼저 고정하고 업무 규칙을 custom으로 분리 |
| ecommerce | 높음 | files/search/notifications/payments | ecommerce | 중간~높음 | catalog/order를 extension으로만 추가 |
| platform_marketplace | 높음 | search/notifications/payments/files | marketplace | 높음 | matching/settlement를 core에 넣지 않음 |
| reservation | 높음 | search/notifications/payments | reservation | 중간~높음 | availability와 cancellation을 domain으로 격리 |
| SaaS | 높음 | files/notifications/payments/excel | saas | 중간~높음 | tenant limit/billing을 core RBAC과 분리 |

## 4. business_management 선구축 판단

### 100%에 가깝게 재사용할 후보

- authentication의 session/guard/기본 provider 경계
- audit log 기록 계약
- organization scope와 기본 membership
- 공통 notification record/read state
- 파일 metadata와 storage authorization 계약

### 설정만 바꾸면 재사용할 후보

- role/permission 목록
- admin menu와 dashboard widget 배치
- CRUD field/schema, list filter, pagination
- 엑셀 column mapping
- status code의 표시명·색상

### custom 개발이 필요한 후보

- 고객사별 workflow 전이 조건
- 승인자 계산, 금액/부서/직급별 결재선
- 업무 item의 핵심 필드와 validation
- ERP/회계/CRM 연동 payload와 재처리
- KPI와 보고서 계산식

## 5. 평균 외주에서 선구축 가능한 범위

business_management 표본은 core feature 5개가 50% 이상 등장하고, 70% 이상 등장 feature는 3개였다. 하지만 평균 Jaccard가 29.95%로 기능 집합 전체가 동일하지는 않다.

따라서 다음을 현실적인 초기 가설로 둔다.

| 범위 | 선구축 판단 |
|---|---|
| 공통 인증·사용자·권한·관리자 shell | 대부분 선구축 가능 |
| 단순 master CRUD와 기본 통계 | schema/config 기반 선구축 가능 |
| 업무 workflow·approval·report | envelope와 hook까지만 선구축 |
| 고객사 업무 규칙 | 대부분 custom |
| 전체 프로젝트 | 첫 버전에서 완성형 템플릿으로 가정하지 않음 |

기능 표면 기준으로 약 40~60%의 초기 뼈대를 준비할 수 있다는 설계 가설은 가능하지만, 개발시간의 40~60%를 바로 절약한다고 해석하면 안 된다. 초기 목표는 반복 boilerplate와 설정 작업을 줄여 실제 custom 요구사항에 집중하는 것이다.

## 6. 질문별 결론

### 어떤 기능을 core에 넣고 어떤 기능을 extension으로 빼는가?

여러 유형에서 의미가 거의 변하지 않는 인증·사용자·권한·관리자·CRUD·기본 analytics는 core다. 업무 항목, workflow, approval, catalog, matching, booking처럼 유형별 domain language가 필요한 것은 extension이다. 결제·파일·엑셀처럼 여러 유형에 걸치지만 사용 여부가 다른 것은 optional module이다.

### business_management 외주에서 평균적으로 어느 정도까지 선구축 가능한가?

운영 백본과 기본 CRUD까지가 핵심 선구축 대상이다. 현재 표본 근거로 기능 표면 40~60%의 초기 뼈대는 합리적인 가설이지만, 업무 규칙까지 일반화할 수 있다는 의미는 아니다.

### 프로젝트별 custom 영역은 어디인가?

상태 전이, 승인 조건, 업무 계산식, report/KPI, ERP·CRM·외부 API 매핑, 고객사별 조직·예외 정책이 custom의 중심이다.

### ecommerce/platform/reservation으로 얼마나 확장 가능한가?

core는 높은 수준으로 공유할 수 있다. ecommerce는 catalog/order/payment, platform은 buyer-seller/matching/settlement, reservation은 resource/availability/booking을 extension으로 붙인다. 이 도메인 기능을 core에 넣지 않으면 확장은 충분히 가능하지만, 화면과 업무 규칙까지 동일하게 재사용할 수는 없다.

### 너무 범용화해서 개발이 느려질 위험은 어디인가?

universal workflow, JSON 만능 schema, 모든 provider를 감싸는 거대한 abstraction, 자동 CRUD generator가 주요 위험이다. 실제 반복이 확인되기 전에는 명시적인 domain code와 작은 interface를 우선한다.

## 7. 다음 검증 단계

아직 코딩하지 않는다. 다음 실제 프로젝트 하나를 선정해 요구사항을 feature 단위로 분해하고 각 항목에 다음 label을 붙인다.

```text
core_reuse | module_reuse | extension_reuse | config_only | custom
```

프로젝트 완료 후 예상치와 실제 작업시간을 비교한다. 두 프로젝트 이상에서 같은 custom이 반복될 때만 core/module/extension 승격을 검토한다.
