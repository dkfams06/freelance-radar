-- freelance-radar Collector V1 schema
-- 접근 모델:
--   * Collector / Dashboard 서버 코드는 service_role 키로 접근 (RLS 우회)
--   * anon / authenticated 역할에는 정책을 부여하지 않음 → 브라우저에서 직접 접근 불가
--   * service_role 키는 서버 환경변수에만 둔다 (NEXT_PUBLIC_* 금지)

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- updated_at 자동 갱신
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- projects: 정규화 데이터 + raw 원본
-- ---------------------------------------------------------------------------
create table public.projects (
  id                   uuid primary key default gen_random_uuid(),
  platform             text not null check (platform in ('wishket', 'freemoa')),
  external_project_id  text not null,
  project_key          text generated always as (platform || ':' || external_project_id) stored,
  project_url          text not null,

  title                text,
  description          text,

  budget               text,          -- 사이트 표기 원문 (예: "500만원 ~ 1,000만원")
  budget_min           bigint,        -- 원 단위
  budget_max           bigint,
  budget_type          text,          -- fixed / hourly / monthly / negotiable 등

  project_duration     text,
  duration_days        integer,

  registered_at        timestamptz,
  deadline_at          timestamptz,

  project_status       text,

  category             text,
  subcategory          text,
  project_type         text,

  skills               text[] not null default '{}',
  applicant_count      integer,

  client_info          jsonb,
  location             text,
  work_method          text,
  development_scope    text,
  existing_system      text,
  planning_status      text,
  design_status        text,
  required_stack       text[] not null default '{}',
  preferred_stack      text[] not null default '{}',

  extra                jsonb not null default '{}'::jsonb,   -- 공통 컬럼에 없는 추가 정규화 필드

  raw_payload          jsonb,          -- JSON/API 원본 (우선)
  raw_text             text,
  raw_metadata         jsonb,
  raw_html             text,           -- JSON 이 없거나 디버깅 필요시에만

  content_hash         text,           -- 정규화 데이터 변경 감지용
  duplicate_group_id   uuid,           -- 플랫폼 간 중복 묶음 (분석 단계에서 채움)

  first_seen_at        timestamptz not null default now(),
  last_seen_at         timestamptz not null default now(),
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now(),

  constraint projects_platform_external_id_key unique (platform, external_project_id)
);

create index projects_registered_at_idx on public.projects (registered_at desc);
create index projects_first_seen_at_idx on public.projects (first_seen_at desc);
create index projects_platform_registered_idx on public.projects (platform, registered_at desc);
create index projects_duplicate_group_idx on public.projects (duplicate_group_id) where duplicate_group_id is not null;

create trigger projects_set_updated_at
before update on public.projects
for each row execute function public.set_updated_at();

-- 정규화 데이터가 바뀔 때마다 이력 보존 (지원자 수, 모집 종료, 예산/일정 변경 추적)
create table public.project_snapshots (
  id            bigint generated always as identity primary key,
  project_id    uuid not null references public.projects (id) on delete cascade,
  content_hash  text not null,
  normalized    jsonb not null,
  captured_at   timestamptz not null default now()
);

create index project_snapshots_project_idx on public.project_snapshots (project_id, captured_at desc);

-- ---------------------------------------------------------------------------
-- crawl_jobs: Dashboard/CLI 가 생성, Collector 가 polling 으로 처리
-- ---------------------------------------------------------------------------
create table public.crawl_jobs (
  id                uuid primary key default gen_random_uuid(),
  platform          text not null check (platform in ('wishket', 'freemoa')),
  job_type          text not null check (job_type in ('BACKFILL', 'CHECK_NEW', 'RESUME')),
  status            text not null default 'PENDING'
                    check (status in ('PENDING', 'RUNNING', 'PAUSED', 'COMPLETED', 'FAILED', 'CANCELLED', 'LOGIN_REQUIRED')),
  requested_action  text check (requested_action in ('PAUSE', 'CANCEL')),
  params            jsonb not null default '{}'::jsonb,   -- cutoff, max_projects, target_job_id ...
  requested_by      text,                                 -- dashboard / cli / scheduler
  worker_id         text,
  result            jsonb,
  error_message     text,
  heartbeat_at      timestamptz,
  created_at        timestamptz not null default now(),
  started_at        timestamptz,
  finished_at       timestamptz,
  updated_at        timestamptz not null default now()
);

create index crawl_jobs_status_created_idx on public.crawl_jobs (status, created_at);
create index crawl_jobs_platform_created_idx on public.crawl_jobs (platform, created_at desc);

create trigger crawl_jobs_set_updated_at
before update on public.crawl_jobs
for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- crawl_checkpoints: 백필 재개 지점 (job 당 1행)
-- ---------------------------------------------------------------------------
create table public.crawl_checkpoints (
  id                    uuid primary key default gen_random_uuid(),
  platform              text not null check (platform in ('wishket', 'freemoa')),
  job_id                uuid not null references public.crawl_jobs (id) on delete cascade,
  last_page             integer not null default 0,     -- 완전히 처리한 마지막 페이지
  current_page          integer,                         -- 처리 중인 페이지
  last_project_id       text,
  processed_count       integer not null default 0,
  success_count         integer not null default 0,
  failure_count         integer not null default 0,
  skipped_count         integer not null default 0,
  new_count             integer not null default 0,
  oldest_registered_at  timestamptz,                     -- 진행률 계산용
  cutoff_at             timestamptz,
  status                text not null default 'RUNNING',
  started_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),
  constraint crawl_checkpoints_job_key unique (job_id)
);

create trigger crawl_checkpoints_set_updated_at
before update on public.crawl_checkpoints
for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- crawl_errors
-- ---------------------------------------------------------------------------
create table public.crawl_errors (
  id                   uuid primary key default gen_random_uuid(),
  platform             text not null check (platform in ('wishket', 'freemoa')),
  job_id               uuid references public.crawl_jobs (id) on delete set null,
  external_project_id  text,
  url                  text,
  page                 integer,
  error_type           text not null,
  error_message        text not null,
  stack                text,
  retry_count          integer not null default 0,
  details              jsonb,
  occurred_at          timestamptz not null default now(),
  resolved_at          timestamptz
);

create index crawl_errors_occurred_idx on public.crawl_errors (occurred_at desc);
create index crawl_errors_unresolved_idx on public.crawl_errors (platform, external_project_id) where resolved_at is null;

-- ---------------------------------------------------------------------------
-- collector_status: 플랫폼별 런타임 상태 (1행/플랫폼)
-- ---------------------------------------------------------------------------
create table public.collector_status (
  platform            text primary key check (platform in ('wishket', 'freemoa')),
  status              text not null default 'OFFLINE'
                      check (status in ('IDLE', 'RUNNING', 'PAUSED', 'LOGIN_REQUIRED', 'ERROR', 'OFFLINE')),
  current_job_id      uuid references public.crawl_jobs (id) on delete set null,
  current_job_type    text,
  current_page        integer,
  processed_count     integer not null default 0,
  success_count       integer not null default 0,
  failure_count       integer not null default 0,
  last_success_at     timestamptz,
  last_error_at       timestamptz,
  last_error_message  text,
  login_state         text not null default 'UNKNOWN'
                      check (login_state in ('LOGGED_IN', 'LOGGED_OUT', 'LOGIN_REQUIRED', 'UNKNOWN')),
  login_detail        text,
  worker_id           text,
  heartbeat_at        timestamptz,
  updated_at          timestamptz not null default now()
);

create trigger collector_status_set_updated_at
before update on public.collector_status
for each row execute function public.set_updated_at();

insert into public.collector_status (platform) values ('wishket'), ('freemoa')
on conflict (platform) do nothing;

-- ---------------------------------------------------------------------------
-- crawl_logs: 핵심 실행 이벤트 (콘솔 로그 전체가 아니라 요약 이벤트만)
-- ---------------------------------------------------------------------------
create table public.crawl_logs (
  id          bigint generated always as identity primary key,
  platform    text,
  job_id      uuid references public.crawl_jobs (id) on delete cascade,
  level       text not null default 'info' check (level in ('debug', 'info', 'warn', 'error')),
  event       text not null,
  message     text,
  data        jsonb,
  created_at  timestamptz not null default now()
);

create index crawl_logs_job_idx on public.crawl_logs (job_id, created_at desc);
create index crawl_logs_created_idx on public.crawl_logs (created_at desc);

-- ---------------------------------------------------------------------------
-- 대시보드 집계용 view
-- ---------------------------------------------------------------------------
create or replace view public.project_counts
with (security_invoker = true)
as
select
  count(*)                                         as total,
  count(*) filter (where platform = 'wishket')     as wishket,
  count(*) filter (where platform = 'freemoa')     as freemoa,
  max(last_seen_at)                                as last_collected_at
from public.projects;

-- ---------------------------------------------------------------------------
-- RLS: 모든 테이블 활성화, anon/authenticated 정책 없음 (service_role 만 접근)
-- ---------------------------------------------------------------------------
alter table public.projects           enable row level security;
alter table public.project_snapshots  enable row level security;
alter table public.crawl_jobs         enable row level security;
alter table public.crawl_checkpoints  enable row level security;
alter table public.crawl_errors       enable row level security;
alter table public.collector_status   enable row level security;
alter table public.crawl_logs         enable row level security;

revoke all on public.project_counts from anon, authenticated;
