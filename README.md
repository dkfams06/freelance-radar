# freelance-radar — Collector V1 / Analyzer V1

위시캣(Wishket)과 프리모아(Freemoa)의 외주 프로젝트를 수집해 Supabase(PostgreSQL)에 저장하는 수집기입니다.
분석 기능(유형별 빈도/견적/난이도/반복률)은 이후 Phase 에서 이 데이터를 기반으로 진행합니다.

## 구조

```
apps/
  collector/            장시간 실행되는 Node.js 수집 프로세스 (CLI + worker)
    src/core/           플랫폼을 모르는 실행 코어 (JobRunner, retry, rate limiter, checkpoint, cutoff, logger)
    src/browser/        Aside Browser 드라이버 (aside mcp → repl 도구)
    src/adapters.ts     플랫폼 → Adapter 레지스트리 (플랫폼 이름을 아는 유일한 곳)
    e2e/                실제 브라우저를 쓰는 스크립트 (기본 테스트에서 제외)
  dashboard/            Next.js 내부 관리화면 (/admin/crawler)
  analyzer/             projects → AI 구조화 분석 CLI (동기 / Message Batches)
packages/
  analysis/             분석 스키마(zod + JSON schema), 분류 체계, 프롬프트, 입력 변환, 비용 계산
  shared/               공통 타입, Adapter 인터페이스, 오류 분류, 파싱 유틸
  db/                   Supabase 클라이언트, 저장소(CollectorStore), 대시보드 쿼리
  platform-wishket/     위시캣 Adapter (목록 XHR + 상세 DOM 추출 → 정규화)
  platform-freemoa/     프리모아 Adapter (사이트 JSON API → 정규화)
supabase/migrations/    SQL migration (ORM 없음)
```

### 수집 방식 요약

| | 위시캣 | 프리모아 |
|---|---|---|
| 목록 | `/project/?d=<LZString("srt=new&page=N")>` XHR → `{result: html, count}` (최신 등록순, 10건/페이지) | `POST /m4a/s41a {sm:3, page:N}` JSON (최신 등록순, 10건/페이지) |
| 상세 | 상세 페이지를 페이지 컨텍스트에서 `fetch` → `DOMParser` 로 구조화 | `POST /m4a/s41v {pno}` JSON |
| 로그인 필요 | 상세의 업무 내용/모집 요건 | 상세 API 전체 |
| 1년치 규모(2026-10 기준) | 약 495 페이지 / ~4,950건 | 약 40 페이지 / ~400건 |

- 모든 요청은 Aside 브라우저의 로그인 세션(쿠키)으로 같은 origin 에서 실행됩니다. 비밀번호는 이 프로젝트 어디에도 저장하지 않습니다.
- 마감된 프로젝트도 접근 가능한 한 저장합니다.
- 위시캣 "프라이빗 매칭"(상위 등급 파트너 전용) 프로젝트는 본문이 공개되지 않아 공개 필드만 저장하고 `extra.privateMatching=true` 로 표시합니다.
- 프리모아 "견적 요청을 받은 파트너만 열람" 프로젝트는 목록 데이터로 저장하고 `extra.detailRestricted=true` 로 표시합니다.
- 원본(raw)에서 **내 계정 정보**(아이디, 내 지원 내역/통계)와 **다른 사용자의 식별정보**(댓글 작성자 아이디/이메일, 지원자 목록, 클라이언트 이메일)는 브라우저 밖으로 꺼내기 전에 제거합니다.

## 준비

1. Node.js 22.12+ / pnpm 10
2. Aside 브라우저 + Aside CLI (`%LOCALAPPDATA%\Aside\CLI\current\aside.exe`). 확인: `aside --version`
3. Aside 브라우저에서 위시캣·프리모아에 **직접 로그인** (Collector 는 이 세션을 재사용)
4. Supabase 프로젝트 생성 후 migration 적용
   - SQL Editor 에 `supabase/migrations/20261002000000_collector_v1.sql` 내용을 실행하거나
   - Supabase CLI: `supabase link --project-ref <ref>` → `supabase db push`
5. 루트에 `.env` 작성 (`.env.example` 참고)

```bash
pnpm install
cp .env.example .env   # SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY 입력
```

## Collector CLI

```bash
pnpm collector wishket backfill --max 20     # 소량 검증 (성공 20건 후 종료)
pnpm collector all backfill                  # 2025-10-02 이후 전체 백필 (최신 → 과거)
pnpm collector freemoa resume                # 중단된 백필을 checkpoint 부터 재개
pnpm collector wishket retry-failed          # 미해결 오류가 남은 프로젝트만 다시 수집 (성공 시 오류 해결 처리)
pnpm collector all retry-failed --queue      # worker 에 맡김 (진행 중인 백필이 끝난 뒤 실행)
pnpm collector all new                       # 신규 프로젝트 확인 (기존 프로젝트를 연속 5건 만나면 종료)
pnpm collector all new --refresh-known       # 만난 기존 프로젝트도 다시 조회해 상태 변화 반영
pnpm collector all login-check               # 로그인 상태만 확인
pnpm collector wishket backfill --queue      # 실행하지 않고 crawl_jobs 에 등록만 (worker 가 처리)
pnpm collector wishket backfill --max 20 --dry-run   # DB 없이 실행, 결과를 apps/collector/.debug/dry-run 에 저장

pnpm crawl:wishket | pnpm crawl:freemoa | pnpm crawl:all   # backfill 단축 명령
```

옵션: `--cutoff <ISO>`, `--start-page <n>`, `--max-pages <n>`.
`Ctrl+C` 한 번: 현재 프로젝트 처리 후 checkpoint 를 저장하고 `PAUSED` 로 종료 (다시 누르면 강제 종료).

### Worker (대시보드 연동)

```bash
pnpm collector:worker                       # crawl_jobs polling (COLLECTOR_POLL_INTERVAL)
pnpm collector worker --schedule-new 10     # + 10분마다 CHECK_NEW 자동 생성 (진행/대기 작업이 있으면 건너뜀)
```

- 동시성 1: 한 번에 한 작업, 한 프로젝트씩. 요청 간 1.5~3초 랜덤 지연.
- 429/403/timeout/network 오류나 느린 응답(>8초)이 감지되면 지연 배수를 2배씩(최대 16배) 늘리고, 연속 성공 시 회복.
- 일반 실패는 10초 → 30초 → 90초 간격으로 최대 3회 재시도 후 `crawl_errors` 에 기록하고 다음 프로젝트로 진행.
- 목록 페이지가 끝내 실패하면 데이터 누락을 막기 위해 작업을 `FAILED` 로 멈추고 checkpoint 를 유지 (재개 가능).
- 세션 만료 → `login()` (페이지 새로고침으로 세션 복구 → 선택: Aside 에이전트 자동입력) → 실패했던 프로젝트 재시도.
  CAPTCHA/OTP/2차 인증이거나 자동 로그인 실패 시 `LOGIN_REQUIRED` 로 전환하고 중단. Aside 에서 직접 로그인 후 대시보드 **재개**.
- 시작 시 이전 프로세스가 남긴 `RUNNING` 작업은 checkpoint 를 유지한 채 다시 대기열로 돌립니다(단일 worker 전제).

OS 스케줄러를 쓸 경우 worker 대신 `pnpm collector all new` 를 10분 간격으로 실행해도 됩니다.
(Windows 작업 스케줄러 / cron `*/10 * * * *` / systemd timer)

## Dashboard

```bash
pnpm dashboard:dev     # http://localhost:3100/admin/crawler
```

- 모든 DB 접근은 서버 컴포넌트/서버 액션에서 service role 로 수행합니다. 브라우저에 키가 내려가지 않습니다.
- 버튼은 `crawl_jobs` row 를 만들거나(백필 시작/재개/신규 확인) 진행 중 작업에 `requested_action=PAUSE` 를 남깁니다(중지). 실제 실행은 worker 가 합니다.
- Vercel 배포 시 `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `DASHBOARD_BASIC_AUTH_USER`, `DASHBOARD_BASIC_AUTH_PASSWORD` 를 설정하세요.
  프로덕션에서 Basic Auth 값이 없으면 503 을 반환합니다.

## 데이터 모델

| 테이블 | 용도 |
|---|---|
| `projects` | 정규화 데이터 + raw (`raw_payload` JSON 우선, `raw_text`, `raw_metadata`, 필요 시 `raw_html`). unique `(platform, external_project_id)`, `project_key = platform:id` |
| `project_snapshots` | 정규화 내용이 바뀔 때마다 이력 (지원자 수, 모집 마감, 예산/일정 변경 추적) |
| `crawl_jobs` | BACKFILL / CHECK_NEW / RESUME 작업 큐와 상태 |
| `crawl_checkpoints` | 작업별 재개 지점 (last_page, last_project_id, 카운트, oldest_registered_at) |
| `crawl_errors` | 실패 기록 (재수집 성공 시 resolved_at 자동 기록) |
| `collector_status` | 플랫폼별 런타임 상태 / 로그인 상태 / heartbeat |
| `crawl_logs` | 핵심 실행 이벤트 |

- `first_seen_at` 은 최초 insert 시에만 설정, 재수집 시 `last_seen_at` 과 정규화 필드를 갱신합니다.
- 공통 컬럼에 매핑되지 않는 값은 버리지 않고 `extra` 에 보존합니다 (위시캣 상세 라벨 전체, 근무 환경, 모집 요건 등).
- `duplicate_group_id` 는 플랫폼 간 중복 묶음용으로 준비만 되어 있습니다 (분석 단계에서 채움).
- RLS 는 모든 테이블에 켜져 있고 anon/authenticated 정책이 없습니다 → service role 만 접근.

## 테스트

```bash
pnpm db:verify     # Collector 종료 검증: 건수/중복/crawl_errors/cutoff/checkpoint/멈춘 job (읽기 전용)
pnpm test          # 단위 테스트 (normalize, upsert, checkpoint/resume, retry, rate limiter, cutoff, login 처리)
pnpm typecheck

# 실제 브라우저 (Aside 실행 + 로그인 필요)
pnpm --filter @fr/collector exec tsx e2e/aside-smoke.ts
pnpm --filter @fr/collector exec tsx e2e/adapter-probe.ts wishket 3 [page]
pnpm --filter @fr/collector exec tsx e2e/list-dates.ts freemoa 30 40 50
```

## Analyzer V1

수집한 `projects` 를 읽어 프로젝트마다 비교 가능한 구조화 데이터(`project_analyses`)를 만든다. `projects` 는 수정하지 않는다.

```bash
pnpm db:migrate                                   # analyzer_v1 + analyzer_v2_classification migration 적용
pnpm analyzer sample                              # wishket 10 + freemoa 10 동기 분석 → DB 저장 + 리포트
pnpm analyzer sample --dry-run                    # DB 에 쓰지 않고 리포트만
pnpm analyzer batch-submit                        # 미분석 전체를 Message Batches API 로 제출 (50% 할인)
pnpm analyzer batch-collect --wait                # 결과 회수 → 검증 → 저장
pnpm analyzer run --retry-failed                  # 실패 건만 동기 재시도
pnpm analyzer sample --ids-from docs/analyzer-v3-sample-20.json   # 같은 20건을 실제 API 로 재분석
pnpm analyzer compare docs/analyzer-v3.1-manual-sample-20.json apps/analyzer/.out/sample-*.json   # 두 결과의 분류 비교
pnpm analyzer validate docs/analyzer-v3.1-manual-sample-20.json   # 결과 파일 schema 검증 (DB 불필요)
pnpm analyzer classify                            # 전체 분류 추정만 (대상 건수/토큰/비용/API 호출 수)
pnpm analyzer classify --execute --batch          # 실제 전체 분류 (승인 후에만)
pnpm analyzer stats                               # 분류 분포 통계 (project_type/engagement/industry/reuse/technology_assets)
pnpm analyzer feature-repeat                      # 일반 외주 v3.3 분석 → project_type 내부 기능 반복률/유사도/반복 bundle (LLM 호출 없음)
pnpm analyzer feature-repeat --save               # + project_features 테이블 저장 (migration 20261005000000 필요)
```

API 키 대신 **Claude 구독제**로 동기 분석(`sample` / `run` / `classify --execute`)을 돌릴 수 있다. Claude Code 헤드리스 모드(`claude -p`)를 같은 시스템 프롬프트·JSON 스키마로 호출한다.

```bash
claude            # 처음 한 번: 터미널에서 /login 으로 구독 계정 로그인
ANALYZER_BACKEND=claude-cli ANALYZER_MODEL=claude-sonnet-5-5 pnpm analyzer sample --ids-from docs/analyzer-v3-sample-20.json --concurrency 2
```

- `ANTHROPIC_API_KEY` 는 자식 프로세스에서 제거해 구독 인증을 쓴다. 리포트의 비용은 API 단가 환산 추정치이며 실제 청구는 없다 (구독 사용량 한도에 반영).
- Batch API(`batch-submit`, `classify --batch`)는 API 키가 필요하다.

- 현재 기준은 `v3.3` (v3.2 에서 reuse_level 규칙만 수정: medium 은 구체적 모듈 필요, one_off 는 아주 특수한 고객 종속만. v3.2 = v3.1 에 project_type `maintenance` 제거·`test_automation` 추가·complexity_types 규칙 강화·reuse low/medium 경계. v3.1 = v3 에 project_type `qa_testing` 추가, reuse_level 기준 강화, iot_device 경계, 예산과 작업시간 분리, uncertain_fields 조건 강화). v3 = v2 에 project_type 4종·technology_assets 3종·engagement 경계 규칙 추가: 통계용 6개 분류 `project_type`, `engagement_type`, `industry`, `complexity_types[]`, `reuse_level`, `technology_assets[]`
  (enum 은 `packages/analysis/src/taxonomy.ts`). 판단이 애매한 분류는 `uncertain_fields` 로 표시되고 리포트 "분류가 애매한 케이스"에 모인다.
- 점수(종합점수·빈도/견적/구현 용이성/반복률 점수)는 아직 만들지 않는다. 수집 → 분류 → 분포 확인 → 배점 결정 → 전체 점수화 순서.
- 표준 기능 vocabulary(f1, 51개)는 `docs/feature-vocabulary-f1.md`. taxonomy v3.3 과 독립이며 결과는 `docs/feature-repetition-f1-v3.3.md|json`.
- `run` / `batch-submit` 은 100건을 넘으면 `--yes` 가 있어야 실행된다.
- `docs/analyzer-v1-sample-20.*`, `docs/analyzer-v2-sample-20.*` 는 이전 기준 참고 자료. v1/v2/v3 결과는 `(project_id, analysis_version)` 로 따로 저장되어 서로 덮어쓰지 않는다.

- 리포트/결과 파일: `apps/analyzer/.out/*.md|json` (gitignore)

### 시장 통계 (market-stats)

taxonomy 는 `v3.3` 으로 동결 (`docs/taxonomy-v3.3-freeze.md`). 전체 AI 분석 전에 원본 `projects` 와 현재 분석된 표본으로 분포부터 본다.

```bash
pnpm analyzer market-stats                       # docs/market-stats-v1.md + .json 생성 (DB 읽기 전용)
pnpm analyzer market-stats --min-n 5 --min-combo 5 --version v3.3
```

- 원본 전체: 총계·플랫폼·월별·외주/staffing 비율·예산 존재율과 중앙값/p25/p75 (평균은 보조)
- 일반 외주(staffing 제외)가 기본 화면이고 staffing(월 단가)은 따로 집계
- 분석 표본 기반: project_type·technology_assets·자산 조합(최소 5건) 통계, reuse 4단계 + 보조 3단계(low_reuse = low + one_off)
- 리포트는 원본 수 / 분석 수 / 커버리지 %를 항상 구분해 보여주고, 표본 부족은 ⚠ 로 표시. 최종 점수(매력도/수익성/공략)는 만들지 않는다.
- 분류 체계·점수 기준: `packages/analysis/src/taxonomy.ts`, `prompt.ts`. 바꾸면 `ANALYSIS_VERSION` 을 올린다.
  `(project_id, analysis_version)` 단위로 저장되므로 원본 재수집 없이 새 기준으로 재분석할 수 있다.
- 모든 응답은 structured output(JSON schema, enum 강제) + zod 재검증(점수 0~100 정수, 시간 min ≤ max, 코드 형식)을 거친다.
  실패는 `analysis_errors` 에 남고 `--retry-failed` 로 재시도한다. 같은 버전으로 성공하면 `resolved_at` 기록.
- 기능/연동/기술 코드는 권장 어휘를 우선 쓰고, 어휘 밖 코드는 리포트에 집계되어 다음 버전 어휘 후보가 된다.

| 테이블 | 용도 |
|---|---|
| `project_analyses` | 분류, 요약, 기능/연동/플랫폼/기술, 추천 스택, 점수 7종, 예상 시간, `raw_analysis`(근거 포함), 토큰/비용 |
| `analysis_batches` | Batch API 제출 기록 (프로세스가 죽어도 `batch-collect` 로 회수) |
| `analysis_errors` | 실패한 분석 (재시도 대상) |

## 범위 밖 (Collector V1 에서 구현하지 않음)

AI 프로젝트 평가, Vibe Coding 가능성/수익성/학습가치 점수, 기술 재사용성, 요구사항 반복률, 임베딩/유사도, Telegram, CRM, 지원서 작성.
