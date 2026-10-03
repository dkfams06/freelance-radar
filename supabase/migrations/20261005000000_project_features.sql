-- 프로젝트별 표준 기능 set (feature vocabulary, packages/analysis/src/features.ts)
-- taxonomy(project_analyses) 와 분리된 확장 결과. (project_id, analysis_version, feature_version) 당 1행.
-- 추가만 하며 여러 번 실행해도 안전하다.

create table if not exists public.project_features (
  id                uuid primary key default gen_random_uuid(),
  project_id        uuid not null references public.projects (id) on delete cascade,
  analysis_version  text not null,            -- 기능 추출에 사용한 분석 버전 (예: v3.3)
  feature_version   text not null,            -- vocabulary 버전 (예: f1)
  features          jsonb not null default '[]'::jsonb,
  evidence          jsonb not null default '{}'::jsonb,   -- 기능별 근거 { analysis: [코드], text: [문구] }
  unmapped_codes    jsonb not null default '[]'::jsonb,   -- vocabulary 에 매핑되지 않은 분석값 코드
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  constraint project_features_key unique (project_id, analysis_version, feature_version),
  constraint project_features_features_array check (jsonb_typeof(features) = 'array')
);

create index if not exists project_features_version_idx on public.project_features (feature_version, analysis_version);
create index if not exists project_features_features_gin on public.project_features using gin (features);

drop trigger if exists project_features_set_updated_at on public.project_features;
create trigger project_features_set_updated_at
before update on public.project_features
for each row execute function public.set_updated_at();

alter table public.project_features enable row level security;
