-- 실패한 프로젝트 재수집 작업 유형 추가
alter table public.crawl_jobs drop constraint if exists crawl_jobs_job_type_check;
alter table public.crawl_jobs
  add constraint crawl_jobs_job_type_check
  check (job_type in ('BACKFILL', 'CHECK_NEW', 'RESUME', 'RETRY_ERRORS'));
