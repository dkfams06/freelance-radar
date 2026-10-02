import {
  type AdapterContext,
  type FreelancePlatformAdapter,
  type LoginCheckResult,
  type LoginResult,
  type NormalizedProject,
  type ProjectListItem,
  type ProjectListParams,
  type ProjectListResult,
  type RawProjectDetail,
} from "@fr/shared";

/** Phase 5/6 에서 실제 사이트 구조 조사 후 구현 */
export class FreemoaAdapter implements FreelancePlatformAdapter {
  readonly platform = "freemoa" as const;
  readonly displayName = "Freemoa";

  constructor(private readonly ctx: AdapterContext) {}

  async checkLogin(): Promise<LoginCheckResult> {
    throw new Error("not implemented");
  }
  async login(): Promise<LoginResult> {
    throw new Error("not implemented");
  }
  async getProjectList(_params: ProjectListParams): Promise<ProjectListResult> {
    throw new Error("not implemented");
  }
  async getProjectDetail(_project: ProjectListItem): Promise<RawProjectDetail> {
    throw new Error("not implemented");
  }
  async normalizeProject(_raw: RawProjectDetail): Promise<NormalizedProject> {
    throw new Error("not implemented");
  }
}
