-- freelance-radar Analyzer V1 schema
-- projects 를 읽어 AI 구조화 분석 결과를 별도 테이블에 저장한다. projects 는 수정하지 않는다.
-- 접근 모델은 Collector 와 동일: service_role 만 접근 (RLS on, 정책 없음).

-- ---------------------------------------------------------------------------
-- project_analyses: 프로젝트 × 분석 버전 당 1행 (성공한 분석만)
-- ---------------------------------------------------------------------------
create table public.project_analyses (
  id                      uuid primary key default gen_random_uuid(),
  project_id              uuid not null references public.projects (id) on delete cascade,

  project_category        text not null,       -- packages/analysis taxonomy 코드 (확장 가능하도록 check 없음)
  project_subcategory     text,
  engagement_type         text,

  summary                 text not null,

  required_features       text[] not null default '{}',
  required_integrations   text[] not null default '{}',
  required_platforms      text[] not null default '{}',
  required_skills         text[] not null default '{}',
  suggested_stack         text[] not null default '{}',

  vibe_coding_difficulty  smallint not null check (vibe_coding_difficulty between 0 and 100),
  estimated_hours_min     integer  not null check (estimated_hours_min > 0),
  estimated_hours_max     integer  not null check (estimated_hours_max >= estimated_hours_min),

  learning_value          smallint not null check (learning_value between 0 and 100),
  reusability_value       smallint not null check (reusability_value between 0 and 100),
  market_value            smallint not null check (market_value between 0 and 100),
  technical_risk          smallint not null check (technical_risk between 0 and 100),
  requirement_clarity     smallint not null check (requirement_clarity between 0 and 100),

  analysis_version        text not null,
  model                   text not null,
  analyzed_at             timestamptz not null default now(),

  raw_analysis            jsonb not null,      -- 검증된 모델 출력 전체 (rationale 포함)
  input_hash              text,                -- 분석 입력 텍스트 hash: projects 내용이 바뀌면 재분석 대상
  input_meta              jsonb,               -- truncated / limited_info 등
  usage                   jsonb,               -- input/output/cache 토큰
  cost_usd                numeric(10, 6),
  batch_id                uuid,

  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now(),

  constraint project_analyses_project_version_key unique (project_id, analysis_version)
);

create index project_analyses_version_idx on public.project_analyses (analysis_version, analyzed_at desc);
create index project_analyses_category_idx on public.project_analyses (analysis_version, project_category);
create index project_analyses_features_gin on public.project_analyses using gin (required_features);
create index project_analyses_integrations_gin on public.project_analyses using gin (required_integrations);

create trigger project_analyses_set_updated_at
before update on public.project_analyses
for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- analysis_batches: Message Batches API 제출 기록 (프로세스가 죽어도 결과 회수 가능)
-- ---------------------------------------------------------------------------
create table public.analysis_batches (
  id                  uuid primary key default gen_random_uuid(),
  provider            text not null default 'anthropic',
  provider_batch_id   text unique,
  analysis_version    text not null,
  model               text not null,
  status              text not null default 'SUBMITTED'
                      check (status in ('SUBMITTED', 'ENDED', 'COLLECTED', 'FAILED', 'CANCELLED')),
  request_count       integer not null default 0,
  succeeded_count     integer not null default 0,
  failed_count        integer not null default 0,
  project_ids         uuid[] not null default '{}',
  usage               jsonb,
  cost_usd            numeric(10, 6),
  error_message       text,
  submitted_at        timestamptz not null default now(),
  ended_at            timestamptz,
  collected_at        timestamptz,
  updated_at          timestamptz not null default now()
);

create trigger analysis_batches_set_updated_at
before update on public.analysis_batches
for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- analysis_errors: 실패한 분석 (재시도 대상). 같은 버전으로 성공하면 resolved_at 기록
-- ---------------------------------------------------------------------------
create table public.analysis_errors (
  id                  uuid primary key default gen_random_uuid(),
  project_id          uuid not null references public.projects (id) on delete cascade,
  analysis_version    text not null,
  model               text,
  batch_id            uuid references public.analysis_batches (id) on delete set null,
  error_type          text not null,   -- API_ERROR / VALIDATION / REFUSAL / MAX_TOKENS / EXPIRED
  error_message       text not null,
  raw_response        text,
  attempt             integer not null default 1,
  occurred_at         timestamptz not null default now(),
  resolved_at         timestamptz
);

create index analysis_errors_unresolved_idx on public.analysis_errors (analysis_version, project_id) where resolved_at is null;

alter table public.project_analyses enable row level security;
alter table public.analysis_batches enable row level security;
alter table public.analysis_errors  enable row level security;
