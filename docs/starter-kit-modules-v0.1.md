# Starter Kit v0.1 모듈 설계

상태: 구현 전 모듈 경계 후보

## 1. 모듈 분류

| 계층 | 모듈 | 역할 | 기본 설치 |
|---|---|---|---|
| core | `core-auth` | 로그인, 세션, 인증 provider 경계 | 예 |
| core | `core-users` | 사용자 프로필, 조직 소속, 사용자 lifecycle | 예 |
| core | `core-rbac` | 역할·권한·권한 검사 | 예 |
| core | `core-admin` | 관리자 shell, 운영 메뉴, 공통 admin 화면 계약 | 예 |
| core | `core-crud` | schema 기반 목록·상세·생성·수정·삭제 use case | 예 |
| core | `core-analytics` | 지표 정의, 집계 query, 통계 카드 계약 | 예 |
| module | `module-files` | 파일 metadata, storage upload/download | 선택 |
| module | `module-search` | 검색·필터·정렬·페이지네이션 | 선택 |
| module | `module-notifications` | 인앱/이메일 알림과 읽음 상태 | 선택 |
| module | `module-payments` | 결제 provider 경계, 결제 상태 | 선택 |
| module | `module-excel` | Excel import/export, validation 결과 | 선택 |
| extension | `extension-business` | 업무 항목·workflow·approval·report | business_management 우선 |
| extension | `extension-ecommerce` | catalog·cart·order | ecommerce |
| extension | `extension-marketplace` | buyer/seller·matching·settlement | platform |
| extension | `extension-reservation` | resource·availability·booking | reservation |
| extension | `extension-saas` | subscription·tenant limits·billing 연결 | SaaS |

## 2. Core 모듈

### `core-auth`

책임:

- sign in, sign out, session refresh
- 현재 사용자 식별
- 이메일/소셜 provider 연결 지점
- 인증이 필요한 route와 server action의 공통 guard

재사용성은 가장 높다. UI는 프로젝트별로 달라도 `CurrentUser`, `Session`, `AuthProvider` 계약은 유지한다. Supabase Auth 구현은 adapter에 둔다.

금지:

- 고객 업무 권한을 인증 모듈에 넣기
- 각 화면에서 직접 Supabase client로 session을 해석하기

### `core-users`

책임:

- 사용자 profile
- organization membership
- 활성/비활성 상태
- 사용자 검색과 관리자용 lifecycle

조직 초대 UI나 프로필 필드는 설정으로 확장할 수 있지만, 고객사별 인사규칙은 custom으로 둔다.

### `core-rbac`

책임:

- role, permission, user-role 연결
- `can(user, permission, resource)` 검사
- 조직 단위 권한 scope
- 관리자 메뉴 visibility 계약

권한 code는 명시적인 문자열/상수로 관리하고, role에 권한을 부여하는 설정을 고객 앱에서 선언한다. 권한 엔진이 고객별 승인 조건까지 판단하지 않게 한다.

### `core-admin`

책임:

- admin layout과 navigation slot
- 공통 list/detail/form 화면 계약
- audit log 접근 지점
- dashboard card와 table의 UI adapter

관리자 shell은 재사용하지만, 실제 메뉴·column·action은 app config와 extension이 공급한다.

### `core-crud`

책임:

- 명시된 schema의 list/get/create/update/archive
- validation과 pagination contract
- 기본 audit event hook
- repository interface

CRUD를 모든 업무의 만능 생성기로 만들지 않는다. 단순 master data와 운영 목록만 대상으로 하고, workflow·결제·정산처럼 상태 의미가 있는 것은 별도 use case로 구현한다.

### `core-analytics`

책임:

- metric definition
- 기간·조직 scope가 있는 aggregate query
- dashboard card/table에 제공할 read model

지표의 수학적 정의는 domain/application에 두고, 차트 라이브러리와 화면 layout은 app에 둔다.

## 3. Optional modules

### `module-files`

공통으로 재사용할 부분은 file metadata, ownership, organization scope, upload/download authorization이다. 실제 파일 변환, OCR, 이미지 처리, 외부 문서 provider는 custom 또는 별도 adapter다.

### `module-search`

field whitelist 기반 검색, filter, sort, pagination을 제공한다. 검색 engine을 처음부터 추상화하지 않고 PostgreSQL query로 시작하며, 전문 검색이나 외부 search engine이 필요할 때 port를 추가한다.

### `module-notifications`

notification record, 읽음 처리, template key, delivery status를 제공한다. 알림을 발생시키는 업무 규칙은 extension이 소유하고, 이메일/SMS/push provider는 adapter가 소유한다.

### `module-payments`

결제 intent, transaction, refund 상태의 최소 계약만 제공한다. PG별 webhook payload와 정산 규칙은 provider adapter/custom으로 격리한다. 결제가 없는 앱에는 package와 migration을 설치하지 않는다.

### `module-excel`

column mapping, row validation, import preview, export를 제공한다. 고객별 엑셀 양식과 업무 규칙은 extension/custom에서 mapping으로 공급한다.

## 4. Business Management Extension

`extension-business`의 초기 public domain은 다음과 같다.

| 기능 | extension이 제공하는 것 | custom으로 남기는 것 |
|---|---|---|
| organization | 조직 scope와 기본 membership 연결 | 고객사 조직 체계·부서 규칙 |
| workflow | workflow/step/version 모델 | 실제 단계·전이 조건 |
| approval | 승인 요청·승인자·결정 상태 | 금액별 결재선·예외 승인 |
| task_management | work item, assignee, due date | 업무 배정 알고리즘 |
| status_management | 상태 code와 전이 command | 고객별 상태·자동 전이 |
| report_generation | report query와 export hook | KPI 계산식·문서 양식 |
| external_api_integration | adapter/connection port | ERP/CRM payload·재처리 정책 |

고객 업무 규칙은 다음 순서로 연결한다.

```text
extension-business domain
  → customer policy interface
    → apps/client-xxx/src/custom/business-rules
      → 외부 API / 고객사 데이터
```

custom layer가 extension 내부 테이블을 직접 수정하지 않고 command/query와 policy interface만 사용하도록 한다.

## 5. 유형별 확장 조합

| 유형 | core | optional 기본 후보 | extension |
|---|---|---|---|
| business_management | 전부 | files, search, notifications, excel | business |
| ecommerce | 전부 | files, search, notifications, payments | ecommerce |
| platform_marketplace | 전부 | files, search, notifications, payments | marketplace |
| reservation | 전부 | search, notifications, payments | reservation |
| SaaS | 전부 | files, notifications, payments, excel | saas |

`optional 기본 후보`는 설치를 강제한다는 뜻이 아니라, 요구사항 확인 시 먼저 검토할 모듈이라는 뜻이다.

## 6. 설치와 제거 원칙

모듈 설치는 다음 세 가지를 함께 다룬다.

1. package dependency
2. database migration
3. route/server action/provider registration

모듈은 `starter-kit.config.ts`에 명시적으로 등록한다.

```ts
export const starterKitConfig = {
  modules: {
    files: true,
    search: true,
    notifications: true,
    payments: false,
    excel: true,
  },
  extensions: ["business"],
};
```

이 설정은 기능을 자동 생성하는 magic framework가 아니다. 어떤 모듈을 앱에 연결했는지를 문서화하고, 초기 route 등록을 명시적으로 확인하기 위한 manifest다.

제거 시 데이터 삭제를 자동화하지 않는다. 사용 중단, read-only 전환, migration rollback 여부를 프로젝트별로 결정한다.

## 7. AI coding agent 작업 규칙

각 모듈은 다음 파일을 갖는다.

```text
packages/module-files/
  README.md
  src/domain.ts
  src/commands.ts
  src/queries.ts
  src/ports.ts
  src/adapters/
  src/index.ts
  migrations/
  tests/
```

README에는 책임, 비책임, 의존성, 환경변수, migration, 테스트 명령을 적는다. AI agent가 한 모듈을 수정할 때 다른 모듈의 내부 파일을 추측하지 않도록 public entrypoint를 우선 사용한다.

## 8. 모듈 승격 기준

custom 코드를 core/module로 승격하는 조건은 다음과 같다.

- 서로 다른 프로젝트 2개 이상에서 같은 domain 의미로 반복됨
- public API와 데이터 소유권을 한 문단으로 설명할 수 있음
- 고객사 예외 규칙 없이 기본 동작이 성립함
- migration과 테스트를 독립적으로 유지할 수 있음

한 프로젝트에서만 필요하거나, 고객사 정책이 중심인 기능은 extension/custom에 남긴다.
