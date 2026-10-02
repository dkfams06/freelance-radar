import { describe, expect, it } from "vitest";
import { emptyNormalizedProject } from "@fr/shared";
import { computeContentHash, planProjectUpsert } from "./project-mapping";
import { MemoryCollectorStore } from "./memory-store";

function project(overrides: Partial<ReturnType<typeof emptyNormalizedProject>> = {}) {
  return { ...emptyNormalizedProject("wishket", "123456", "https://www.wishket.com/project/123456/"), title: "앱 개발", ...overrides };
}

describe("planProjectUpsert", () => {
  const t1 = new Date("2026-10-01T00:00:00Z");
  const t2 = new Date("2026-10-02T00:00:00Z");

  it("신규 프로젝트는 insert + first_seen_at/last_seen_at = now", () => {
    const plan = planProjectUpsert(null, project(), t1);
    expect(plan.action).toBe("insert");
    expect(plan.row.first_seen_at).toBe(t1.toISOString());
    expect(plan.row.last_seen_at).toBe(t1.toISOString());
    expect(plan.snapshot).toBe(true);
  });

  it("기존 프로젝트는 update 하고 first_seen_at 은 건드리지 않는다", () => {
    const p = project();
    const plan = planProjectUpsert({ id: "uuid-1", content_hash: computeContentHash(p) }, p, t2);
    expect(plan.action).toBe("update");
    expect(plan.row.first_seen_at).toBeUndefined();
    expect(plan.row.last_seen_at).toBe(t2.toISOString());
    if (plan.action === "update") {
      expect(plan.changed).toBe(false);
      expect(plan.snapshot).toBe(false);
    }
  });

  it("지원자 수 등 내용이 바뀌면 changed + snapshot", () => {
    const before = project({ applicantCount: 3 });
    const after = project({ applicantCount: 7 });
    const plan = planProjectUpsert({ id: "uuid-1", content_hash: computeContentHash(before) }, after, t2);
    expect(plan.action === "update" && plan.changed).toBe(true);
    expect(plan.snapshot).toBe(true);
  });

  it("raw 데이터만 바뀌면 changed 로 보지 않는다", () => {
    const a = project({ rawPayload: { v: 1 } });
    const b = project({ rawPayload: { v: 2 } });
    expect(computeContentHash(a)).toBe(computeContentHash(b));
  });
});

describe("MemoryCollectorStore.upsertProject", () => {
  it("platform + external_project_id 로 중복 row 를 만들지 않는다", async () => {
    const store = new MemoryCollectorStore();
    const r1 = await store.upsertProject(project(), new Date("2026-10-01T00:00:00Z"));
    const r2 = await store.upsertProject(project({ projectStatus: "모집마감" }), new Date("2026-10-02T00:00:00Z"));
    expect(store.projects.size).toBe(1);
    expect(r1.inserted).toBe(true);
    expect(r2.inserted).toBe(false);
    expect(r2.id).toBe(r1.id);
    const row = [...store.projects.values()][0]!;
    expect(row.first_seen_at).toBe("2026-10-01T00:00:00.000Z");
    expect(row.last_seen_at).toBe("2026-10-02T00:00:00.000Z");
    expect(row.project_status).toBe("모집마감");
    expect(store.snapshots).toHaveLength(2);
  });

  it("같은 external id 라도 플랫폼이 다르면 별도 프로젝트", async () => {
    const store = new MemoryCollectorStore();
    await store.upsertProject(project(), new Date());
    await store.upsertProject({ ...project(), platform: "freemoa" }, new Date());
    expect(store.projects.size).toBe(2);
  });
});
