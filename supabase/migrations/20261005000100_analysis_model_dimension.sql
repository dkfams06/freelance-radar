-- 같은 project/version에 여러 모델 결과를 보존한다.
-- Sonnet 감사 결과를 유지하면서 Haiku 결과를 추가 저장하기 위한 migration.

alter table public.project_analyses
  drop constraint if exists project_analyses_project_version_key;

create unique index if not exists project_analyses_project_version_model_key
  on public.project_analyses (project_id, analysis_version, model);

create index if not exists project_analyses_model_idx
  on public.project_analyses (analysis_version, model, analyzed_at desc);
