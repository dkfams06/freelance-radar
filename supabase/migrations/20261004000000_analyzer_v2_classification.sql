-- Analyzer v2: 통계용 6개 분류 컬럼
-- project_type / engagement_type / complexity_types / reuse_level / technology_assets / industry
--
-- * 추가만 한다 (기존 v1 행/컬럼 보존). 여러 번 실행해도 안전하다.
-- * enum 값은 packages/analysis/src/taxonomy.ts + schema validation 으로 강제한다.
--   분류 체계 확장(analysis_version 증가) 때 migration 없이 값을 늘릴 수 있도록 DB 에는 check 를 두지 않는다.
--   단, 4단계로 고정된 reuse_level 과 배열 형태만 DB 에서도 확인한다.
-- * engagement_type 컬럼은 v1 에도 있으므로 그대로 쓴다 (v2 부터 새 enum 값).
-- * project_category 는 v1 전용. v2 행은 project_type 을 쓰므로 NOT NULL 을 푼다.

alter table public.project_analyses add column if not exists project_type      text;
alter table public.project_analyses add column if not exists engagement_type   text;
alter table public.project_analyses add column if not exists complexity_types  jsonb not null default '[]'::jsonb;
alter table public.project_analyses add column if not exists reuse_level       text;
alter table public.project_analyses add column if not exists technology_assets jsonb not null default '[]'::jsonb;
alter table public.project_analyses add column if not exists industry          text;

alter table public.project_analyses alter column project_category drop not null;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'project_analyses_reuse_level_check') then
    alter table public.project_analyses
      add constraint project_analyses_reuse_level_check
      check (reuse_level is null or reuse_level in ('high', 'medium', 'low', 'one_off'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'project_analyses_complexity_types_array') then
    alter table public.project_analyses
      add constraint project_analyses_complexity_types_array check (jsonb_typeof(complexity_types) = 'array');
  end if;
  if not exists (select 1 from pg_constraint where conname = 'project_analyses_technology_assets_array') then
    alter table public.project_analyses
      add constraint project_analyses_technology_assets_array check (jsonb_typeof(technology_assets) = 'array');
  end if;
end $$;

create index if not exists project_analyses_type_idx       on public.project_analyses (analysis_version, project_type);
create index if not exists project_analyses_engagement_idx on public.project_analyses (analysis_version, engagement_type);
create index if not exists project_analyses_industry_idx   on public.project_analyses (analysis_version, industry);
create index if not exists project_analyses_tech_assets_gin on public.project_analyses using gin (technology_assets);
create index if not exists project_analyses_complexity_gin  on public.project_analyses using gin (complexity_types);
