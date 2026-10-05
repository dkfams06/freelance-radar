import type { AnalyzedProject, AnalysisErrorSummary, MarketProject, MarketReport, TypeStat } from "@fr/analysis";
import { computeMarketReport } from "@fr/analysis";
import { getDb, hasSupabaseEnv } from "@/lib/db";
import { AutoRefresh } from "../crawler/_components/AutoRefresh";

export const dynamic = "force-dynamic";
export const metadata = { title: "분석 · freelance-radar" };

const VERSION = "v3.3";
const MODEL = "claude-haiku-4-5-20251001";
const PAGE_SIZE = 1000;

const PROJECT_TYPE_LABEL: Record<string, string> = {
  website: "웹사이트",
  ecommerce: "이커머스",
  reservation: "예약 서비스",
  admin_backoffice: "관리자/백오피스",
  business_management: "업무관리",
  saas: "SaaS",
  platform_marketplace: "플랫폼/마켓플레이스",
  mobile_app: "모바일 앱",
  ai_service: "AI 서비스",
  crawler_data_collection: "크롤러/데이터 수집",
  automation_rpa: "자동화/RPA",
  data_dashboard: "데이터 대시보드",
  fintech_payment: "핀테크/결제",
  iot_device: "IoT/장치",
  media_processing: "미디어 처리",
  enterprise_infra: "엔터프라이즈 인프라",
  qa_testing: "QA/테스트",
  other: "기타",
  "(none)": "미분류",
};

function projectTypeLabel(key: string): string {
  return PROJECT_TYPE_LABEL[key] ?? "기타";
}

type ProjectDbRow = {
  id: string;
  platform: string;
  registered_at: string | null;
  duration_days: number | null;
  project_type: string | null;
  budget_type: string | null;
  budget_min: number | null;
  budget_max: number | null;
};

type AnalysisDbRow = Omit<AnalyzedProject, keyof MarketProject> & {
  project_id: string;
  model: string;
};

async function pageAll<T>(build: (from: number, to: number) => PromiseLike<{ data: T[] | null; error: unknown }>): Promise<T[]> {
  const rows: T[] = [];
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await build(from, from + PAGE_SIZE - 1);
    if (error) throw new Error(`Supabase: ${JSON.stringify(error)}`);
    rows.push(...(data ?? []));
    if (!data || data.length < PAGE_SIZE) return rows;
  }
}

async function loadReport(): Promise<MarketReport> {
  const db = getDb();
  const [projectRows, analysisRows, errorRows] = await Promise.all([
    pageAll<ProjectDbRow>((from, to) =>
      db
        .from("projects")
        .select("id,platform,registered_at,duration_days,project_type,budget_type,budget_min,budget_max")
        .order("id")
        .range(from, to) as unknown as PromiseLike<{ data: ProjectDbRow[] | null; error: unknown }>,
    ),
    pageAll<AnalysisDbRow>((from, to) =>
      db
        .from("project_analyses")
        .select(
          "project_id,model,project_type,engagement_type,industry,technology_assets,reuse_level," +
            "vibe_coding_difficulty,estimated_hours_min,estimated_hours_max,learning_value,reusability_value,market_value",
        )
        .eq("analysis_version", VERSION)
        .eq("model", MODEL)
        .order("project_id")
        .range(from, to) as unknown as PromiseLike<{ data: AnalysisDbRow[] | null; error: unknown }>,
    ),
    pageAll<AnalysisErrorSummary>((from, to) =>
      db
        .from("analysis_errors")
        .select("project_id,error_type,attempt,resolved_at")
        .eq("analysis_version", VERSION)
        .eq("model", MODEL)
        .order("project_id")
        .range(from, to) as unknown as PromiseLike<{ data: AnalysisErrorSummary[] | null; error: unknown }>,
    ),
  ]);

  const projects: MarketProject[] = projectRows.map((p) => ({
    id: p.id,
    platform: p.platform,
    registered_at: p.registered_at,
    duration_days: p.duration_days,
    raw_type: p.project_type,
    budget_type: p.budget_type,
    budget_min: p.budget_min,
    budget_max: p.budget_max,
  }));
  const byId = new Map(projects.map((p) => [p.id, p]));
  const analyzed: AnalyzedProject[] = analysisRows.flatMap((a) => {
    const project = byId.get(a.project_id);
    return project ? [{ ...project, ...a, project_id: a.project_id }] : [];
  });

  return computeMarketReport(projects, analyzed, {
    version: VERSION,
    minN: 10,
    minCombo: 10,
    errors: errorRows,
  });
}

function integer(value: number | null | undefined): string {
  return value === null || value === undefined ? "—" : Math.round(value).toLocaleString("ko-KR");
}

function money(value: number | null | undefined): string {
  return value === null || value === undefined ? "—" : `${integer(value)}원`;
}

function percent(value: number | null | undefined): string {
  return value === null || value === undefined ? "—" : `${(value * 100).toFixed(1)}%`;
}

function score(value: number | null | undefined): string {
  return value === null || value === undefined ? "—" : value.toFixed(1);
}

function TypeTable({ title, types }: { title: string; types: TypeStat[] }) {
  const rows = [...types].sort((a, b) => b.n - a.n);
  return (
    <section className="panel">
      <h2>{title} <span className="count">{rows.reduce((sum, row) => sum + row.n, 0)}</span></h2>
      {rows.length === 0 ? (
        <p className="empty">아직 분석 결과가 없습니다.</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>프로젝트 유형</th>
                <th>건수</th>
                <th>비율</th>
                <th>월평균</th>
                <th>중앙 견적</th>
                <th>시간당 예산</th>
                <th>AI 용이성</th>
                <th>재사용</th>
                <th>학습</th>
                <th>시장가치</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.key}>
                  <td><b>{projectTypeLabel(row.key)}</b>{row.low_sample && <span className="badge badge-warn" style={{ marginLeft: 6 }}>표본 적음</span>}</td>
                  <td className="num">{row.n}</td>
                  <td className="num">{percent(row.share)}</td>
                  <td className="num">{score(row.monthly_avg_estimated ?? row.monthly_avg_in_sample)}</td>
                  <td className="num">{money(row.budget.median)}</td>
                  <td className="num">{money(row.budget_per_estimated_hour.median)}</td>
                  <td className="num">{score(row.avg_ai_ease)}</td>
                  <td className="num">{score(row.avg_reusability_value)}</td>
                  <td className="num">{score(row.avg_learning_value)}</td>
                  <td className="num">{score(row.avg_market_value)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function RankedList({ title, items, formatter }: { title: string; items: Array<{ key: string; n: number; value: number }>; formatter: (value: number) => string }) {
  return (
    <div className="card">
      <h2>{title}</h2>
      {items.length === 0 ? <p className="empty">데이터 부족</p> : (
        <ol className="rank-list">
          {items.slice(0, 5).map((item) => (
            <li key={item.key}>
              <span><b>{projectTypeLabel(item.key)}</b> <span className="muted">표본 {item.n}건</span></span>
              <strong>{formatter(item.value)}</strong>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

export default async function AnalysisPage() {
  if (!hasSupabaseEnv()) {
    return <main className="wrap"><h1>분석 미리보기</h1><div className="notice">Supabase 환경변수가 없습니다.</div></main>;
  }

  const report = await loadReport();
  const lists = report.non_staffing.lists;
  const pending = Math.max(0, report.base.total - report.coverage.analyzed);

  return (
    <main className="wrap">
      <header className="page-head">
        <div>
          <p className="eyebrow">freelance-radar · 시장 분석 미리보기</p>
          <h1>Haiku v3.3 분석 미리보기</h1>
          <p className="muted">DB의 성공 분석만 사용합니다. 분석 중에는 15초마다 갱신됩니다.</p>
        </div>
        <AutoRefresh intervalMs={15000} />
      </header>

      <nav className="notice">
        <a href="/admin/crawler">← 수집 관리</a>
        <span className="muted" style={{ marginLeft: 12 }} title={MODEL}>사용 모델: Haiku 4.5</span>
      </nav>

      <section className="stats" aria-label="분석 커버리지">
        <Stat label="전체 프로젝트" value={integer(report.base.total)} />
        <Stat label="분석 완료" value={integer(report.coverage.analyzed)} sub={percent(report.coverage.coverage_rate)} />
        <Stat label="미분석" value={integer(pending)} />
        <Stat label="일반 외주" value={integer(report.non_staffing.n)} />
        <Stat label="인력 투입" value={integer(report.staffing.n)} />
        <Stat label="스키마 실패" value={integer(report.quality.schema_failure_projects)} tone={report.quality.schema_failure_projects ? "bad" : undefined} />
      </section>

      <section className="platforms">
        <div className="card">
          <h2>분석 품질</h2>
          <dl className="kv">
            <div><dt>재시도 기록</dt><dd>{integer(report.quality.retry_count)}건</dd></div>
            <div><dt>불확실한 필드</dt><dd>{integer(report.quality.uncertain_fields.projects_with_any)}건 ({percent(report.quality.uncertain_fields.rate)})</dd></div>
            <div><dt>기타 프로젝트 유형</dt><dd>{percent(report.quality.other_ratio.project_type)}</dd></div>
            <div><dt>기타 기술자산</dt><dd>{percent(report.quality.other_ratio.technology_assets)}</dd></div>
            <div><dt>시간 중앙값</dt><dd>{integer(report.quality.estimated_hours.midpoint_median)}시간</dd></div>
            <div><dt>결과 생성</dt><dd>{new Date(report.generated_at).toLocaleString("ko-KR")}</dd></div>
          </dl>
        </div>
        <div className="card">
          <h2>일반 외주 평균</h2>
          <dl className="kv">
            <div><dt>AI 용이성</dt><dd>{score(report.non_staffing.averages.avg_ai_ease)}</dd></div>
            <div><dt>재사용성</dt><dd>{score(report.non_staffing.averages.avg_reusability_value)}</dd></div>
            <div><dt>학습가치</dt><dd>{score(report.non_staffing.averages.avg_learning_value)}</dd></div>
            <div><dt>시장가치</dt><dd>{score(report.non_staffing.averages.avg_market_value)}</dd></div>
            <div><dt>시간당 예산 중앙값</dt><dd>{money(report.non_staffing.averages.median_budget_per_estimated_hour)}</dd></div>
            <div><dt>분석 버전</dt><dd>{report.analysis_version}</dd></div>
          </dl>
        </div>
      </section>

      {lists && (
        <section className="platforms">
          <RankedList title="빈도 높은 유형" items={lists.top_count} formatter={(v) => `${integer(v)}건`} />
          <RankedList title="시간당 예산 높은 유형" items={lists.top_budget_per_estimated_hour} formatter={money} />
          <RankedList title="AI 용이성 높은 유형" items={lists.top_ai_ease} formatter={score} />
          <RankedList title="재사용성 높은 유형" items={lists.top_reusability} formatter={score} />
        </section>
      )}

      <TypeTable title="일반 외주 유형별" types={report.non_staffing.types} />
      <TypeTable title="인력 투입 유형별" types={report.staffing.types} />
    </main>
  );
}

function Stat({ label, value, sub, tone }: { label: string; value: string; sub?: string; tone?: string }) {
  return (
    <div className={`stat ${tone ? `stat-${tone}` : ""}`}>
      <p className="stat-label">{label}</p>
      <p className="stat-value">{value}</p>
      {sub && <p className="stat-sub">{sub}</p>}
    </div>
  );
}
