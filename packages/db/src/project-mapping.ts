import { createHash } from "node:crypto";
import type { NormalizedProject } from "@fr/shared";
import type { ProjectWrite } from "./rows";

const iso = (d: Date | null) => (d ? d.toISOString() : null);

/** 변경 감지에 쓰는 정규화 필드 (raw 와 수집 시각은 제외) */
export function hashableFields(p: NormalizedProject): Record<string, unknown> {
  return {
    title: p.title,
    description: p.description,
    budget: p.budget,
    budgetMin: p.budgetMin,
    budgetMax: p.budgetMax,
    budgetType: p.budgetType,
    projectDuration: p.projectDuration,
    durationDays: p.durationDays,
    registeredAt: iso(p.registeredAt),
    deadlineAt: iso(p.deadlineAt),
    projectStatus: p.projectStatus,
    category: p.category,
    subcategory: p.subcategory,
    projectType: p.projectType,
    skills: p.skills,
    applicantCount: p.applicantCount,
    clientInfo: p.clientInfo,
    location: p.location,
    workMethod: p.workMethod,
    developmentScope: p.developmentScope,
    existingSystem: p.existingSystem,
    planningStatus: p.planningStatus,
    designStatus: p.designStatus,
    requiredStack: p.requiredStack,
    preferredStack: p.preferredStack,
    extra: p.extra,
  };
}

export function computeContentHash(p: NormalizedProject): string {
  return createHash("sha256").update(stableStringify(hashableFields(p))).digest("hex");
}

export function stableStringify(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value ?? null);
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  const entries = Object.entries(value as Record<string, unknown>)
    .filter(([, v]) => v !== undefined)
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
  return `{${entries.map(([k, v]) => `${JSON.stringify(k)}:${stableStringify(v)}`).join(",")}}`;
}

export function projectToWrite(p: NormalizedProject, now: Date): ProjectWrite {
  return {
    platform: p.platform,
    external_project_id: p.externalProjectId,
    project_url: p.projectUrl,
    title: p.title,
    description: p.description,
    budget: p.budget,
    budget_min: p.budgetMin,
    budget_max: p.budgetMax,
    budget_type: p.budgetType,
    project_duration: p.projectDuration,
    duration_days: p.durationDays,
    registered_at: iso(p.registeredAt),
    deadline_at: iso(p.deadlineAt),
    project_status: p.projectStatus,
    category: p.category,
    subcategory: p.subcategory,
    project_type: p.projectType,
    skills: p.skills,
    applicant_count: p.applicantCount,
    client_info: p.clientInfo,
    location: p.location,
    work_method: p.workMethod,
    development_scope: p.developmentScope,
    existing_system: p.existingSystem,
    planning_status: p.planningStatus,
    design_status: p.designStatus,
    required_stack: p.requiredStack,
    preferred_stack: p.preferredStack,
    extra: p.extra,
    raw_payload: p.rawPayload ?? null,
    raw_text: p.rawText,
    raw_metadata: p.rawMetadata,
    raw_html: p.rawHtml,
    content_hash: computeContentHash(p),
    last_seen_at: now.toISOString(),
  };
}

export interface ExistingProjectRef {
  id: string;
  content_hash: string | null;
}

export type ProjectUpsertPlan =
  | { action: "insert"; row: ProjectWrite; snapshot: true }
  | { action: "update"; id: string; row: ProjectWrite; changed: boolean; snapshot: boolean };

/**
 * platform + external_project_id 기준 upsert 계획.
 *  - 신규: insert (first_seen_at = now)
 *  - 기존: update (first_seen_at 유지, last_seen_at 갱신), 내용이 바뀌면 snapshot 기록
 */
export function planProjectUpsert(
  existing: ExistingProjectRef | null,
  project: NormalizedProject,
  now: Date,
): ProjectUpsertPlan {
  const row = projectToWrite(project, now);
  if (!existing) {
    return { action: "insert", row: { ...row, first_seen_at: now.toISOString() }, snapshot: true };
  }
  const changed = existing.content_hash !== row.content_hash;
  return { action: "update", id: existing.id, row, changed, snapshot: changed };
}
