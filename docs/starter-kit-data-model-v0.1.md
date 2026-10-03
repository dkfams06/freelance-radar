# Starter Kit v0.1 공통 데이터 모델 설계

상태: 구현 전 schema 후보

## 1. 모델링 원칙

- 모든 tenant-owned row는 `organization_id`를 가진다.
- domain layer는 Supabase row 타입을 직접 사용하지 않는다.
- 외부 공개 ID와 내부 join 키를 분리할 필요가 있으면 UUID를 내부 기본키로 사용한다.
- 삭제보다 `status`/`archived_at`을 우선한다. 감사 로그와 업무 이력의 보존을 깨뜨리지 않는다.
- created/updated 시각은 UTC로 저장하고, 화면 표시 timezone은 조직 설정에서 처리한다.
- RLS와 application authorization을 함께 사용한다.

## 2. 공통 schema

### `organizations`

| 컬럼 | 타입 후보 | 설명 |
|---|---|---|
| id | uuid PK | 조직 ID |
| name | text | 조직명 |
| slug | text unique | URL/식별용 slug |
| status | text | active, suspended, archived |
| settings | jsonb | 표시 timezone 등 저위험 설정만 저장 |
| created_at | timestamptz | 생성 시각 |
| updated_at | timestamptz | 수정 시각 |

`settings`에 업무 규칙을 몰아넣지 않는다. 조회·검증이 필요한 값은 별도 column/table로 승격한다.

### `users`

| 컬럼 | 타입 후보 | 설명 |
|---|---|---|
| id | uuid PK | 앱 사용자 ID |
| auth_user_id | uuid unique | Supabase Auth user ID |
| display_name | text | 표시명 |
| email | text | 동기화된 연락처, auth가 원본인지 명시 |
| status | text | invited, active, suspended, withdrawn |
| last_seen_at | timestamptz nullable | 마지막 활동 |
| created_at/updated_at | timestamptz | lifecycle |

사용자와 조직의 다대다 관계는 `user_roles`가 직접 대체하지 않도록 별도 membership 개념을 둔다. 실제 구현에서는 `organization_memberships`를 추가하는 것을 권장한다.

### `organization_memberships` 권장 추가

| 컬럼 | 타입 후보 | 설명 |
|---|---|---|
| organization_id | uuid FK | 조직 |
| user_id | uuid FK | 사용자 |
| status | text | invited, active, suspended |
| joined_at | timestamptz | 참여 시각 |

PK는 `(organization_id, user_id)`로 둔다. role 부여는 아래 `user_roles`에서 관리한다.

### `roles`

| 컬럼 | 타입 후보 | 설명 |
|---|---|---|
| id | uuid PK | role ID |
| organization_id | uuid nullable FK | null이면 시스템 role, 값이 있으면 조직 role |
| code | text | 안정적인 role code |
| name | text | 표시명 |
| is_system | boolean | 삭제 보호 여부 |

`organization_id + code` unique를 기본으로 한다. 고객사별 role 이름은 바꿀 수 있어도 permission code는 앱 계약으로 관리한다.

### `permissions`

| 컬럼 | 타입 후보 | 설명 |
|---|---|---|
| id | uuid PK | permission ID |
| code | text unique | 예: `work_item.read` |
| description | text | 운영 설명 |
| resource | text | resource 분류 |
| action | text | read, create, update, delete, approve 등 |

role과 permission의 연결을 위해 `role_permissions(role_id, permission_id)`를 둔다.

### `user_roles`

| 컬럼 | 타입 후보 | 설명 |
|---|---|---|
| organization_id | uuid FK | 권한 scope |
| user_id | uuid FK | 사용자 |
| role_id | uuid FK | role |
| valid_from/valid_until | timestamptz nullable | 임시 role 필요 시 |

PK는 최소 `(organization_id, user_id, role_id)`로 잡는다. 리소스별 개별 권한은 초기 core 범위에서 제외하고, 필요하면 별도 policy table로 추가한다.

### `audit_logs`

| 컬럼 | 타입 후보 | 설명 |
|---|---|---|
| id | uuid PK | 로그 ID |
| organization_id | uuid FK | 조직 |
| actor_user_id | uuid nullable FK | 실행 주체, system 가능 |
| action | text | 예: work_item.updated |
| resource_type | text | 대상 타입 |
| resource_id | uuid/text | 대상 ID |
| before_data | jsonb nullable | 민감정보 제외 변경 전 snapshot |
| after_data | jsonb nullable | 민감정보 제외 변경 후 snapshot |
| request_id | text nullable | 추적용 |
| created_at | timestamptz | immutable |

감사 로그는 수정/삭제하지 않고 보존 정책을 별도로 둔다. 비밀번호·access token·결제 원문을 저장하지 않는다.

### `files`

| 컬럼 | 타입 후보 | 설명 |
|---|---|---|
| id | uuid PK | file metadata ID |
| organization_id | uuid FK | 조직 |
| owner_user_id | uuid nullable FK | 업로드 주체 |
| storage_provider | text | supabase 등 |
| storage_key | text | 실제 object key |
| file_name | text | 표시명 |
| mime_type | text | 허용 목록 검증 대상 |
| size_bytes | bigint | 크기 제한 검증 |
| checksum | text nullable | 중복/무결성 검토 |
| status | text | pending, ready, quarantined, deleted |
| created_at | timestamptz | 생성 시각 |

도메인 row와의 연결은 처음부터 범용 polymorphic foreign key로 만들지 않는다. 필요한 extension에서 `work_item_attachments` 같은 명시적 link table을 둔다.

### `notifications`

| 컬럼 | 타입 후보 | 설명 |
|---|---|---|
| id | uuid PK | 알림 ID |
| organization_id | uuid FK | 조직 |
| recipient_user_id | uuid FK | 수신자 |
| type | text | 알림 template key |
| title/body | text | 표시 내용 또는 render input |
| data | jsonb | 링크·resource 정보 |
| read_at | timestamptz nullable | 읽음 시각 |
| delivery_status | text | in_app, queued, sent, failed |
| created_at | timestamptz | 생성 시각 |

알림 생성은 업무 domain이 직접 이메일 provider를 호출하지 않고 notification command를 호출한다.

## 3. Business extension schema

### `work_items`

업무의 공통 envelope만 extension이 소유한다.

| 컬럼 | 타입 후보 | 설명 |
|---|---|---|
| id | uuid PK | 업무 항목 |
| organization_id | uuid FK | 조직 |
| workflow_id | uuid nullable FK | 적용 workflow |
| workflow_step_id | uuid nullable FK | 현재 단계 |
| type | text | 고객 업무 유형 code |
| title | text | 제목 |
| description | text | 설명 |
| status_code | text | 고객 또는 extension이 정의 |
| priority | text nullable | low/normal/high 등 |
| assignee_user_id | uuid nullable FK | 담당자 |
| due_at | timestamptz nullable | 기한 |
| metadata | jsonb | 초기에는 비핵심 부가값만 허용 |
| created_by/created_at/updated_at | uuid/timestamptz | lifecycle |

고객 업무의 핵심 숫자와 검색 대상 필드를 metadata에만 넣지 않는다. 반복되어 query가 필요해지면 명시적 column/table로 승격한다.

### `workflows`

| 컬럼 | 타입 후보 | 설명 |
|---|---|---|
| id | uuid PK | workflow |
| organization_id | uuid FK | 조직 |
| code | text | workflow code |
| name | text | 표시명 |
| version | integer | 변경 이력 |
| status | text | draft, active, archived |
| created_at | timestamptz | 생성 |

### `workflow_steps`

| 컬럼 | 타입 후보 | 설명 |
|---|---|---|
| id | uuid PK | step |
| workflow_id | uuid FK | workflow |
| code | text | 안정적인 step code |
| name | text | 표시명 |
| sequence | integer | 기본 표시 순서 |
| config | jsonb | timeout 등 제한된 설정 |

전이 규칙은 단순한 초기 버전에서는 application command에 명시한다. 범용 transition DSL은 실제 반복 사례가 생긴 뒤 검토한다.

### `approvals`

| 컬럼 | 타입 후보 | 설명 |
|---|---|---|
| id | uuid PK | 승인 요청 |
| organization_id | uuid FK | 조직 |
| work_item_id | uuid FK | 대상 업무 |
| requested_by | uuid FK | 요청자 |
| approver_user_id | uuid nullable FK | 승인자 |
| status | text | pending, approved, rejected, cancelled |
| decision_note | text nullable | 결정 사유 |
| decided_at | timestamptz nullable | 결정 시각 |
| created_at | timestamptz | 생성 |

금액별 결재선, 부서 순차 승인, 대결 규칙은 별도 custom policy가 `approval command`를 호출하는 구조로 시작한다.

### `comments`

| 컬럼 | 타입 후보 | 설명 |
|---|---|---|
| id | uuid PK | 댓글 |
| organization_id | uuid FK | 조직 |
| work_item_id | uuid FK | 업무 |
| author_user_id | uuid FK | 작성자 |
| body | text | 본문 |
| created_at/updated_at | timestamptz | lifecycle |
| deleted_at | timestamptz nullable | soft delete |

### `attachments`

초기에는 업무에 붙는 첨부를 명시적으로 둔다.

| 컬럼 | 타입 후보 | 설명 |
|---|---|---|
| work_item_id | uuid FK | 업무 |
| file_id | uuid FK | `files` |
| attached_by | uuid FK | 첨부자 |
| created_at | timestamptz | 생성 |

복수 도메인에 같은 파일을 붙이는 요구가 실제로 반복될 때만 다른 link table을 추가한다.

## 4. 관계 요약

```text
organizations
  ├─ organization_memberships ─ users
  ├─ roles ─ role_permissions ─ permissions
  ├─ user_roles ─ users
  ├─ audit_logs
  ├─ files ─ attachments ─ work_items
  ├─ notifications ─ users
  └─ workflows ─ workflow_steps
                         └─ work_items ─ approvals
                                      └─ comments
```

## 5. RLS와 접근 정책

1. `organization_id`가 있는 모든 table은 organization membership을 기준으로 select/insert/update/delete policy를 둔다.
2. 사용자가 조직을 바꿔 요청하는 경우를 막기 위해 server use case에서 route param과 session scope를 비교한다.
3. service role은 migration, 제한된 background job에서만 사용한다.
4. audit_logs는 일반 사용자가 직접 insert하지 않고 server-side command가 기록한다.
5. `files.storage_key`는 직접 공개하지 않고 signed URL 또는 authorized download command를 사용한다.

## 6. DB 교체 가능성

domain/application은 다음 interface만 안다.

```text
UserRepository
OrganizationRepository
RoleRepository
WorkItemRepository
AuditLogWriter
FileStorage
NotificationDispatcher
```

Supabase repository는 `packages/platform-supabase` 또는 각 adapter에 두고, domain 객체로 변환한다. PostgreSQL이 아닌 DB로 바꿀 경우 migration과 repository/transaction adapter를 교체하되, core command/query의 의미는 유지하는 것을 목표로 한다.

## 7. 아직 확정하지 않는 부분

- metadata를 언제 정규화 table로 승격할지
- workflow 전이 DSL의 필요 여부
- organization membership과 user_roles의 UI/초대 flow
- 결제·정산 domain의 별도 schema
- 고객사별 report materialized view

이 항목은 첫 business_management 프로젝트의 실제 요구사항과 query 패턴을 확인한 뒤 결정한다.
