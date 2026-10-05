import {
  getOverview,
  getPlatformPanels,
  getRecentErrors,
  getRecentJobs,
  getRecentProjects,
  type PlatformPanel,
} from "@fr/db";
import { getDb, hasSupabaseEnv } from "@/lib/db";
import { PLATFORM_NAME, formatDateTime, formatNumber, formatRelative } from "@/lib/format";
import { AutoRefresh } from "./_components/AutoRefresh";
import { CommandButtons } from "./_components/CommandButtons";
import { ProjectTable } from "./_components/ProjectTable";

export const dynamic = "force-dynamic";
export const metadata = { title: "수집 관리 · freelance-radar" };

const ONLINE_WINDOW_MS = 90_000;

const STATUS_LABEL: Record<string, string> = {
  IDLE: "대기",
  RUNNING: "실행 중",
  PAUSED: "일시정지",
  LOGIN_REQUIRED: "로그인 필요",
  ERROR: "오류",
  OFFLINE: "오프라인",
  PENDING: "대기열",
  COMPLETED: "완료",
  FAILED: "실패",
  CANCELLED: "취소",
};

const LOGIN_LABEL: Record<string, string> = {
  LOGGED_IN: "로그인됨",
  LOGGED_OUT: "로그아웃",
  LOGIN_REQUIRED: "로그인 필요",
  UNKNOWN: "확인 전",
};

const JOB_TYPE_LABEL: Record<string, string> = {
  BACKFILL: "백필",
  CHECK_NEW: "신규 확인",
  RESUME: "재개",
  RETRY_ERRORS: "실패 재시도",
};

const ERROR_TYPE_LABEL: Record<string, string> = {
  UNKNOWN: "알 수 없음",
};

const REQUESTED_BY_LABEL: Record<string, string> = {
  scheduler: "자동 스케줄러",
  dashboard: "대시보드",
  cli: "명령줄",
};

function tone(status: string | null | undefined): string {
  switch (status) {
    case "RUNNING":
    case "LOGGED_IN":
    case "COMPLETED":
      return "ok";
    case "PAUSED":
    case "PENDING":
      return "warn";
    case "LOGIN_REQUIRED":
    case "ERROR":
    case "FAILED":
    case "LOGGED_OUT":
      return "bad";
    default:
      return "neutral";
  }
}

function Badge({ value, labels = STATUS_LABEL }: { value: string | null | undefined; labels?: Record<string, string> }) {
  return <span className={`badge badge-${tone(value)}`}>{value ? (labels[value] ?? value) : "—"}</span>;
}

function isOnline(heartbeat: string | null | undefined, now: number) {
  return !!heartbeat && now - new Date(heartbeat).getTime() < ONLINE_WINDOW_MS;
}

export default async function CrawlerPage() {
  if (!hasSupabaseEnv()) {
    return (
      <main className="wrap">
        <h1>수집 관리</h1>
        <div className="notice">
          <p>
            Supabase 환경변수가 없습니다. 프로젝트 루트 <code>.env</code> 또는 배포 환경에 <code>SUPABASE_URL</code>,{" "}
            <code>SUPABASE_SERVICE_ROLE_KEY</code> 를 설정하세요.
          </p>
        </div>
      </main>
    );
  }

  const db = getDb();
  const [overview, panels, projects, errors, jobs] = await Promise.all([
    getOverview(db),
    getPlatformPanels(db),
    getRecentProjects(db, 50),
    getRecentErrors(db, 30),
    getRecentJobs(db, 15),
  ]);

  const now = Date.now();
  const online = panels.some((p) => isOnline(p.status?.heartbeat_at, now));
  const collectorState = !online
    ? "OFFLINE"
    : panels.some((p) => p.status?.status === "LOGIN_REQUIRED")
      ? "LOGIN_REQUIRED"
      : panels.some((p) => p.status?.status === "RUNNING")
        ? "RUNNING"
        : "IDLE";

  return (
    <main className="wrap">
      <header className="page-head">
        <div>
          <p className="eyebrow">freelance-radar · 수집기 V1</p>
          <h1>수집 관리</h1>
        </div>
        <div className="command-row">
          <a className="btn" href="/admin/analysis">분석 미리보기</a>
          <AutoRefresh />
        </div>
      </header>

      <section className="stats" aria-label="요약">
        <Stat label="총 수집 프로젝트" value={formatNumber(overview.total)} />
        <Stat label="위시캣" value={formatNumber(overview.wishket)} />
        <Stat label="프리모아" value={formatNumber(overview.freemoa)} />
        <Stat label="최근 수집" value={formatRelative(overview.lastCollectedAt, now)} sub={formatDateTime(overview.lastCollectedAt)} />
        <Stat label="미해결 실패" value={formatNumber(overview.unresolvedErrors)} tone={overview.unresolvedErrors ? "bad" : undefined} />
        <div className="stat">
          <p className="stat-label">수집기</p>
          <p className="stat-value">
            <Badge value={collectorState} />
          </p>
        </div>
      </section>

      <section className="platforms">
        {panels.map((p) => (
          <PlatformCard key={p.platform} panel={p} now={now} />
        ))}
      </section>

      <section className="panel">
        <h2>최근 수집 프로젝트 <span className="count">{projects.length}</span></h2>
        <ProjectTable projects={projects} />
      </section>

      <section className="panel">
        <h2>최근 오류 <span className="count">{errors.length}</span></h2>
        {errors.length === 0 ? (
          <p className="empty">오류가 없습니다.</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>플랫폼</th>
                  <th>프로젝트</th>
                  <th>유형</th>
                  <th>메시지</th>
                  <th>재시도</th>
                  <th>시각</th>
                </tr>
              </thead>
              <tbody>
                {errors.map((e) => (
                  <tr key={e.id} className={e.resolved_at ? "resolved" : ""}>
                    <td><span className={`chip chip-${e.platform}`}>{PLATFORM_NAME[e.platform]}</span></td>
                    <td className="nowrap">
                      {e.url ? (
                        <a href={e.url} target="_blank" rel="noreferrer">{e.external_project_id ?? `page ${e.page}`}</a>
                      ) : (
                        (e.external_project_id ?? `page ${e.page ?? "—"}`)
                      )}
                    </td>
                    <td><span className={`badge badge-${e.resolved_at ? "neutral" : "bad"}`}>{ERROR_TYPE_LABEL[e.error_type] ?? e.error_type}</span></td>
                    <td className="msg-cell" title={e.error_message}>{e.error_message}</td>
                    <td className="num">{e.retry_count}</td>
                    <td className="nowrap muted">{formatDateTime(e.occurred_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="panel">
        <h2>최근 작업</h2>
        {jobs.length === 0 ? (
          <p className="empty">작업 이력이 없습니다.</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>플랫폼</th>
                  <th>유형</th>
                  <th>상태</th>
                  <th>결과</th>
                  <th>요청</th>
                  <th>생성</th>
                  <th>종료</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((j) => (
                  <tr key={j.id}>
                    <td><span className={`chip chip-${j.platform}`}>{PLATFORM_NAME[j.platform]}</span></td>
                    <td className="nowrap">{JOB_TYPE_LABEL[j.job_type] ?? j.job_type}</td>
                    <td><Badge value={j.status} /></td>
                    <td className="msg-cell" title={j.error_message ?? String(j.result?.reason ?? "")}>
                      {j.result ? `성공 ${j.result.success ?? 0} · 실패 ${j.result.failure ?? 0} · 신규 ${j.result.inserted ?? 0}` : ""}
                      {j.error_message ? ` — ${j.error_message}` : ""}
                    </td>
                    <td className="muted">{j.requested_by ? (REQUESTED_BY_LABEL[j.requested_by] ?? j.requested_by) : "—"}</td>
                    <td className="nowrap muted">{formatDateTime(j.created_at)}</td>
                    <td className="nowrap muted">{formatDateTime(j.finished_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}

function Stat({ label, value, sub, tone: t }: { label: string; value: string; sub?: string; tone?: string }) {
  return (
    <div className={`stat ${t ? `stat-${t}` : ""}`}>
      <p className="stat-label">{label}</p>
      <p className="stat-value">{value}</p>
      {sub && <p className="stat-sub">{sub}</p>}
    </div>
  );
}

function PlatformCard({ panel, now }: { panel: PlatformPanel; now: number }) {
  const s = panel.status;
  const cp = panel.backfillCheckpoint;
  const progress = panel.backfillProgress;
  const online = isOnline(s?.heartbeat_at, now);
  return (
    <article className="card">
      <header className="card-head">
        <h2>{PLATFORM_NAME[panel.platform]}</h2>
        <div className="badges">
          <Badge value={s?.login_state ?? "UNKNOWN"} labels={LOGIN_LABEL} />
          <Badge value={online ? (s?.status ?? "IDLE") : "OFFLINE"} />
        </div>
      </header>

      {s?.status === "LOGIN_REQUIRED" && (
        <p className="notice notice-bad">
          로그인이 필요합니다{ s.login_detail ? ` — ${s.login_detail}` : ""}. Aside 브라우저에서 직접 로그인한 뒤 <b>재개</b>를 누르세요.
        </p>
      )}

      <div className="progress-block">
        <div className="progress-label">
          <span>백필 진행률</span>
          <span className="num">{progress === null ? "—" : `${Math.round(progress * 100)}%`}</span>
        </div>
        <div className="progress" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress === null ? undefined : Math.round(progress * 100)}>
          <div className="progress-fill" style={{ width: `${Math.round((progress ?? 0) * 100)}%` }} />
        </div>
        <p className="progress-sub">
          {panel.backfillJob
            ? `${STATUS_LABEL[panel.backfillJob.status] ?? panel.backfillJob.status} · 가장 오래된 등록일 ${formatDateTime(cp?.oldest_registered_at)}`
            : "백필 이력 없음"}
        </p>
      </div>

      <dl className="kv">
        <div><dt>현재 작업</dt><dd>{panel.currentJob ? `${JOB_TYPE_LABEL[panel.currentJob.job_type] ?? panel.currentJob.job_type} (${STATUS_LABEL[panel.currentJob.status] ?? panel.currentJob.status})` : "—"}</dd></div>
        <div><dt>현재 페이지</dt><dd className="num">{s?.current_page ?? "—"}</dd></div>
        <div><dt>성공</dt><dd className="num">{formatNumber(s?.success_count)}</dd></div>
        <div><dt>실패</dt><dd className="num">{formatNumber(s?.failure_count)}</dd></div>
        <div><dt>마지막 성공</dt><dd>{formatRelative(s?.last_success_at, now)}</dd></div>
        <div><dt>상태 신호</dt><dd>{formatRelative(s?.heartbeat_at, now)}</dd></div>
      </dl>
      {s?.last_error_message && (
        <p className="last-error" title={s.last_error_message}>
          최근 오류 ({formatRelative(s.last_error_at, now)}): {s.last_error_message}
        </p>
      )}

      <CommandButtons platform={panel.platform} />
    </article>
  );
}
