import type { DbClient } from "@fr/db";
import {
  ANALYSIS_SOURCE_COLUMNS,
  type AnalysisSourceProject,
  type BuiltInput,
  type ProjectAnalysis,
  type StatsSourceRow,
  type TokenUsage,
} from "@fr/analysis";

export interface SavedAnalysisRow {
  project_id: string;
  analysis_version: string;
  model: string;
  analyzed_at: string;
  project_type: string | null;
  project_subcategory: string | null;
  engagement_type: string | null;
  industry: string | null;
  complexity_types: string[];
  reuse_level: string | null;
  technology_assets: string[];
  summary: string;
  required_features: string[];
  required_integrations: string[];
  required_platforms: string[];
  required_skills: string[];
  suggested_stack: string[];
  vibe_coding_difficulty: number;
  estimated_hours_min: number;
  estimated_hours_max: number;
  learning_value: number;
  reusability_value: number;
  market_value: number;
  technical_risk: number;
  requirement_clarity: number;
  raw_analysis: ProjectAnalysis;
  usage: TokenUsage | null;
  cost_usd: number | null;
}

type StatsDbRow = Omit<StatsSourceRow, "platform" | "budget_min" | "budget_max" | "budget_type"> & {
  projects: Pick<StatsSourceRow, "platform" | "budget_min" | "budget_max" | "budget_type"> | null;
};

const PAGE = 1000;

export class AnalyzerStore {
  constructor(private readonly db: DbClient) {}

  private async pageAll<T>(build: (from: number, to: number) => PromiseLike<{ data: T[] | null; error: unknown }>): Promise<T[]> {
    const out: T[] = [];
    for (let from = 0; ; from += PAGE) {
      const { data, error } = await build(from, from + PAGE - 1);
      if (error) throw new Error(`supabase: ${JSON.stringify(error)}`);
      out.push(...(data ?? []));
      if (!data || data.length < PAGE) return out;
    }
  }

  /** 해당 버전으로 이미 성공 분석된 project_id → input_hash */
  async analyzedHashes(version: string): Promise<Map<string, string | null>> {
    const rows = await this.pageAll<{ project_id: string; input_hash: string | null }>((f, t) =>
      this.db.from("project_analyses").select("project_id,input_hash").eq("analysis_version", version).range(f, t),
    );
    return new Map(rows.map((r) => [r.project_id, r.input_hash]));
  }

  async unresolvedErrorProjectIds(version: string): Promise<Set<string>> {
    const rows = await this.pageAll<{ project_id: string }>((f, t) =>
      this.db.from("analysis_errors").select("project_id").eq("analysis_version", version).is("resolved_at", null).range(f, t),
    );
    return new Set(rows.map((r) => r.project_id));
  }

  async projectsByIds(ids: string[]): Promise<AnalysisSourceProject[]> {
    const out: AnalysisSourceProject[] = [];
    for (let i = 0; i < ids.length; i += 200) {
      const { data, error } = await this.db.from("projects").select(ANALYSIS_SOURCE_COLUMNS).in("id", ids.slice(i, i + 200));
      if (error) throw new Error(`supabase: ${JSON.stringify(error)}`);
      out.push(...((data ?? []) as unknown as AnalysisSourceProject[]));
    }
    const order = new Map(ids.map((id, i) => [id, i]));
    return out.sort((a, b) => order.get(a.id)! - order.get(b.id)!);
  }

  /** 최신 등록순 프로젝트 (설명이 있는 것만, 테스트 샘플용) */
  async latestProjects(platform: string, limit: number): Promise<AnalysisSourceProject[]> {
    const { data, error } = await this.db
      .from("projects")
      .select(ANALYSIS_SOURCE_COLUMNS)
      .eq("platform", platform)
      .not("description", "is", null)
      .order("registered_at", { ascending: false, nullsFirst: false })
      .limit(limit);
    if (error) throw new Error(`supabase: ${JSON.stringify(error)}`);
    return (data ?? []) as unknown as AnalysisSourceProject[];
  }

  /** 전체 프로젝트 id (최신 등록순) */
  async allProjectIds(platform?: string): Promise<string[]> {
    const rows = await this.pageAll<{ id: string }>((f, t) => {
      let q = this.db.from("projects").select("id").order("registered_at", { ascending: false, nullsFirst: false }).order("id");
      if (platform) q = q.eq("platform", platform);
      return q.range(f, t);
    });
    return rows.map((r) => r.id);
  }

  async saveAnalysis(args: {
    projectId: string;
    version: string;
    model: string;
    analysis: ProjectAnalysis;
    input: BuiltInput;
    usage: TokenUsage | null;
    costUsd: number | null;
    batchId?: string | null;
  }): Promise<void> {
    const a = args.analysis;
    const row = {
      project_id: args.projectId,
      analysis_version: args.version,
      model: args.model,
      analyzed_at: new Date().toISOString(),
      project_type: a.project_type,
      project_subcategory: a.project_subcategory,
      engagement_type: a.engagement_type,
      industry: a.industry,
      complexity_types: a.complexity_types,
      reuse_level: a.reuse_level,
      technology_assets: a.technology_assets,
      summary: a.summary,
      required_features: a.required_features,
      required_integrations: a.required_integrations,
      required_platforms: a.required_platforms,
      required_skills: a.required_skills,
      suggested_stack: a.suggested_stack,
      vibe_coding_difficulty: a.vibe_coding_difficulty,
      estimated_hours_min: a.estimated_hours_min,
      estimated_hours_max: a.estimated_hours_max,
      learning_value: a.learning_value,
      reusability_value: a.reusability_value,
      market_value: a.market_value,
      technical_risk: a.technical_risk,
      requirement_clarity: a.requirement_clarity,
      raw_analysis: a,
      input_hash: args.input.hash,
      input_meta: { truncated: args.input.truncated, limited_info: args.input.limitedInfo },
      usage: args.usage,
      cost_usd: args.costUsd,
      batch_id: args.batchId ?? null,
    };
    const { error } = await this.db.from("project_analyses").upsert(row, { onConflict: "project_id,analysis_version" });
    if (error) throw new Error(`save analysis: ${JSON.stringify(error)}`);
    await this.db
      .from("analysis_errors")
      .update({ resolved_at: new Date().toISOString() })
      .eq("project_id", args.projectId)
      .eq("analysis_version", args.version)
      .is("resolved_at", null);
  }

  async recordError(args: {
    projectId: string;
    version: string;
    model: string;
    errorType: string;
    error: string;
    raw?: string;
    batchId?: string | null;
  }): Promise<void> {
    const { count } = await this.db
      .from("analysis_errors")
      .select("id", { count: "exact", head: true })
      .eq("project_id", args.projectId)
      .eq("analysis_version", args.version);
    const { error } = await this.db.from("analysis_errors").insert({
      project_id: args.projectId,
      analysis_version: args.version,
      model: args.model,
      batch_id: args.batchId ?? null,
      error_type: args.errorType,
      error_message: args.error.slice(0, 2000),
      raw_response: args.raw?.slice(0, 20000) ?? null,
      attempt: (count ?? 0) + 1,
    });
    if (error) throw new Error(`record error: ${JSON.stringify(error)}`);
  }

  async createBatch(row: { provider_batch_id: string; analysis_version: string; model: string; project_ids: string[] }) {
    const { data, error } = await this.db
      .from("analysis_batches")
      .insert({ ...row, request_count: row.project_ids.length })
      .select("id")
      .single();
    if (error) throw new Error(`create batch: ${JSON.stringify(error)}`);
    return data.id as string;
  }

  async openBatches(): Promise<{ id: string; provider_batch_id: string; model: string; analysis_version: string; project_ids: string[] }[]> {
    const { data, error } = await this.db
      .from("analysis_batches")
      .select("id,provider_batch_id,model,analysis_version,project_ids")
      .in("status", ["SUBMITTED", "ENDED"])
      .order("submitted_at");
    if (error) throw new Error(`open batches: ${JSON.stringify(error)}`);
    return data ?? [];
  }

  async updateBatch(id: string, patch: Record<string, unknown>) {
    const { error } = await this.db.from("analysis_batches").update(patch).eq("id", id);
    if (error) throw new Error(`update batch: ${JSON.stringify(error)}`);
  }

  /** 통계용: 분석 결과 + 원본 예산 (projects join) */
  async statsRows(version: string): Promise<StatsSourceRow[]> {
    const rows = await this.pageAll<StatsDbRow>((f, t) =>
      this.db
        .from("project_analyses")
        .select(
          "project_id,project_type,engagement_type,industry,complexity_types,reuse_level,technology_assets," +
            "vibe_coding_difficulty,estimated_hours_min,estimated_hours_max,reusability_value,learning_value,market_value," +
            "projects(platform,budget_min,budget_max,budget_type)",
        )
        .eq("analysis_version", version)
        .order("project_id")
        .range(f, t) as unknown as PromiseLike<{ data: StatsDbRow[] | null; error: unknown }>,
    );
    return rows.map(({ projects, ...a }) => ({ ...a, ...(projects ?? { platform: null, budget_min: null, budget_max: null, budget_type: null }) }));
  }

  async analysesFor(version: string, projectIds?: string[]): Promise<SavedAnalysisRow[]> {
    return this.pageAll<SavedAnalysisRow>((f, t) => {
      let q = this.db.from("project_analyses").select("*").eq("analysis_version", version).order("analyzed_at").range(f, t);
      if (projectIds) q = q.in("project_id", projectIds);
      return q;
    });
  }
}
