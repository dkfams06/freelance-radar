# Starter Kit v0.1 기술 아키텍처 설계

상태: 구현 전 설계 후보

이 문서는 외주 프로젝트를 시작할 때 반복 기능을 다시 만들지 않도록 하기 위한 Starter Kit의 경계를 정의한다. 아직 실제 패키지, 애플리케이션, 데이터베이스를 구현하지 않는다.

## 1. 설계 목표

주력 타깃은 `business_management`이다. 다만 인증·사용자·권한·관리자·CRUD·통계라는 공통 백본은 ecommerce, platform, reservation, SaaS에서도 그대로 사용할 수 있어야 한다.

설계의 우선순위는 다음과 같다.

1. 반복 기능은 독립 모듈로 빠르게 재사용한다.
2. 고객사별 업무 규칙은 core를 오염시키지 않고 custom layer에 둔다.
3. Next.js/Supabase를 기본 실행 환경으로 사용하되, domain logic은 DB·backend 교체가 가능하게 한다.
4. Claude Code/Codex가 한 모듈만 읽고 안전하게 수정할 수 있도록 의존성과 폴더 역할을 명확히 한다.

## 2. 분석 근거와 설계 해석

현재 500건 표본의 feature repetition f1은 8개 유형, 일반 외주 173건을 대상으로 했다.

| 관찰 | 결과 | 설계 반영 |
|---|---:|---|
| `admin_dashboard` | 138/173, 80% | core-admin |
| `authentication` | 127/173, 73% | core-auth |
| `user_management` | 85/173, 49% | core-users |
| `statistics_dashboard` | 84/173, 49% | core-analytics |
| `role_permission` | 75/173, 43% | core-rbac |
| business_management | v0.2 76.03, high | 첫 적용 대상 |
| ecommerce | templateability 56.41, medium | core + extension 후보 |
| platform_marketplace | v0.2 67.62, high | core 재사용, 도메인 확장은 선택 |

`business_management`의 core coverage는 42.58%, core fit은 67.57%, 평균 Jaccard는 29.95%였다. 따라서 화면 전체나 업무 프로세스 전체를 미리 고정하는 것이 아니라, 반복되는 운영 백본을 선구축하는 전략이 적절하다.

## 3. 전체 구조

```text
apps/client-xxx                 고객별 Next.js 앱
  ├─ presentation               화면, route handler, server action
  ├─ application                고객별 use case 조합
  └─ custom                     고객사 업무 규칙·외부 연동

packages/core-*                 프로젝트 유형과 무관한 공통 백본
packages/module-*               설치 여부를 선택하는 기능 모듈
packages/extension-*            유형별 도메인 기능
packages/platform-*             Supabase, Vercel, 외부 서비스 adapter

                         ┌────────────────────┐
                         │ apps/client-xxx    │
                         │ UI / app use cases │
                         └─────────┬──────────┘
                                   │
             ┌─────────────────────┼─────────────────────┐
             │                     │                     │
       ┌─────▼─────┐       ┌───────▼──────┐       ┌──────▼─────┐
       │   core    │       │   modules    │       │ extensions │
       │ auth/rbac │       │ files/search │       │ business   │
       │ crud/...  │       │ payment/... │       │ ecommerce  │
       └─────┬─────┘       └───────┬──────┘       └──────┬─────┘
             │                     │                     │
             └─────────────────────┼─────────────────────┘
                                   │ ports
                         ┌─────────▼──────────┐
                         │ adapters           │
                         │ Supabase/Postgres  │
                         │ Storage/Providers  │
                         └────────────────────┘
```

의존성 방향은 `core → ports`, `modules → core`, `extensions → core/modules`, `custom → extensions/modules`로 제한한다. core가 특정 extension이나 고객 앱을 import하면 안 된다.

## 4. 계층별 책임

### core

모든 유형에서 의미가 비교적 안정적인 인증, 사용자, 권한, 관리자 shell, CRUD, analytics를 둔다. core는 업무 상태나 고객사별 승인 규칙을 알지 않는다.

각 core 패키지는 다음을 함께 가진다.

- domain type과 validation
- application service 또는 명시적 use case
- repository/provider interface
- 기본 PostgreSQL repository adapter를 연결할 수 있는 mapping
- 최소 단위 테스트와 README

### modules

파일, 검색, 알림, 결제, 엑셀처럼 여러 유형에서 반복되지만 모든 프로젝트에 필요하지 않은 기능이다. 모듈이 빠져도 core가 컴파일되고 core의 기본 use case가 동작해야 한다.

모듈의 migration, provider 설정, UI route는 별도 entrypoint로 둔다. `payment` 모듈을 설치하지 않은 앱이 결제 provider 환경변수를 요구해서는 안 된다.

### extensions

프로젝트 유형의 업무 언어와 데이터 관계를 둔다. `extension-business`는 work item, workflow, approval 등을 제공하지만 고객사의 실제 승인 조건, 계산식, ERP 매핑은 제공하지 않는다.

### custom

고객별 상태코드, 필드, 승인 조건, 외부 API payload, 예외적인 화면 흐름을 둔다. custom은 extension의 public API를 사용하며 core 내부를 직접 수정하지 않는다.

## 5. 기본 기술 선택

| 영역 | 기본 선택 | 교체 경계 |
|---|---|---|
| Web/UI | Next.js + TypeScript | presentation adapter |
| 실행 | Vercel | deployment adapter |
| DB | PostgreSQL via Supabase | repository + SQL migration |
| 인증 | Supabase Auth | `AuthProvider` interface |
| 파일 | Supabase Storage | `FileStorage` interface |
| 서버 데이터 접근 | Next.js server action/route handler | application boundary |
| 검증 | TypeScript domain type + schema validator | domain validation boundary |

Supabase는 기본 adapter일 뿐 domain layer의 타입이 아니다. `@supabase/supabase-js`의 row 타입을 core service의 인자로 넘기지 않고, repository에서 domain object로 변환한다.

브라우저에는 anon key만 노출하고 service role key는 server-only 환경에서만 사용한다. 조직별 데이터는 PostgreSQL RLS를 기본 방어선으로 두되, server use case에서도 `organization_id` scope를 명시적으로 검사한다.

## 6. 예상 디렉터리

```text
apps/
  client-business-demo/
    app/
    src/
      application/             use case 조합
      custom/                  고객사 규칙
      ui/
    starter-kit.config.ts

packages/
  core-auth/
  core-users/
  core-rbac/
  core-admin/
  core-crud/
  core-analytics/
  module-files/
  module-search/
  module-notifications/
  module-payments/
  module-excel/
  extension-business/
  extension-ecommerce/
  extension-marketplace/
  extension-reservation/
  extension-saas/
  platform-supabase/
  platform-storage/

docs/
  architecture.md
  modules/<module>.md
  decisions/
```

`apps/client-xxx`는 고객별 route와 조합만 소유한다. 공통 로직을 빠르게 고치기 위해 고객 앱 내부에 core 복사본을 만들지 않는다.

## 7. 모듈 계약

모듈은 다음 public surface만 외부에 제공한다.

```text
public/
  domain-types.ts
  commands.ts
  queries.ts
  ports.ts
  config.ts
  index.ts
```

내부 SQL, provider SDK 호출, UI 세부 구현은 public surface가 아니다. 새 모듈을 추가할 때는 다음을 명시한다.

- 필요한 core/module 의존성
- 적용해야 하는 migration
- 환경변수
- route/server action 등록 방법
- 제거 시 rollback 또는 데이터 보존 정책
- 최소 smoke test

## 8. business_management 선구축 범위

기능 표면 기준으로는 인증·관리자·사용자·권한·통계와 공통 CRUD를 먼저 준비할 수 있다. f1 결과상 business_management의 core coverage가 42.58%, core fit이 67.57%이므로, 전체 요구사항의 절반 이상을 자동 해결한다고 가정하면 안 된다.

현실적인 초기 목표는 다음과 같다.

- 기능 표면 기준: 공통 운영 백본과 기본 CRUD까지 약 40~60% 선구축
- 개발 시간 기준: 프로젝트 초기 설정·반복 화면·기본 권한 작업의 약 25~40% 단축을 목표로 검증
- 나머지: 고객사 업무 규칙, 상태 전이, 승인 조건, 리포트 계산, 외부 시스템 연동

위 비율은 500건에서 직접 측정한 개발시간이 아니라, 현재 feature 반복률을 바탕으로 한 설계 가설이다. 실제 첫 2~3개 프로젝트에서 작업 로그로 보정해야 한다.

## 9. 다른 유형으로의 확장

- ecommerce: core를 그대로 사용하고 catalog, cart, order, payment를 extension/module로 추가한다.
- platform_marketplace: core와 search/payment/notification을 재사용하지만 buyer-seller, matching, settlement는 별도 domain으로 둔다.
- reservation: core와 notification/payment를 재사용하고 resource, calendar, availability, cancellation을 extension으로 둔다.
- SaaS: core의 조직·권한을 재사용하고 subscription, tenant limits, billing provider를 별도 module/extension으로 둔다.

확장 시 core API를 유형별로 분기하지 않는다. 유형별 차이는 extension의 domain object와 application use case에서 해결한다.

## 10. 과도한 범용화 방지

다음은 초기 core에 넣지 않는다.

- 모든 업무를 표현하려는 universal workflow engine
- 고객별 필드를 모두 담는 JSON 만능 테이블
- 모든 provider를 하나의 거대한 service로 추상화
- 모든 화면을 자동 생성하는 CRUD framework
- ERP/회계/정산 규칙
- AI 모델별 pipeline

두 개 이상의 실제 프로젝트에서 같은 형태가 반복되고, public API를 설명할 수 있을 때만 core/module 승격을 검토한다. 한 프로젝트에서만 필요한 코드는 custom에 남긴다.

## 11. 구현 전 결정이 필요한 항목

1. 실제 첫 고객 앱을 `business_management` 샘플로 선정
2. core CRUD가 지원할 schema 범위와 금지할 복잡한 field 정의
3. 조직/사용자/역할의 tenant 경계와 RLS 정책 검증
4. workflow를 상태머신으로 둘지, business extension의 제한된 상태 전이로 시작할지 결정
5. 첫 프로젝트에서 재사용 시간과 custom 시간을 측정하는 작업 로그 형식 결정

이 문서 기준으로 다음 단계는 구현이 아니라, 첫 고객 요구사항을 core/module/extension/custom으로 분해하는 설계 검증이다.
