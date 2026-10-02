"use client";

import { useState, useTransition } from "react";
import type { RecentProject } from "@fr/db";
import { loadProject } from "../actions";
import { PLATFORM_NAME, formatDate, formatDateTime } from "@/lib/format";

type Detail = NonNullable<Awaited<ReturnType<typeof loadProject>>>;
type Tab = "normalized" | "raw" | "text";

export function ProjectTable({ projects }: { projects: RecentProject[] }) {
  const [detail, setDetail] = useState<Detail | null>(null);
  const [tab, setTab] = useState<Tab>("normalized");
  const [error, setError] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const open = (id: string) => {
    setLoadingId(id);
    setError(null);
    startTransition(async () => {
      try {
        const d = await loadProject(id);
        if (!d) setError("프로젝트를 찾을 수 없습니다");
        else {
          setDetail(d);
          setTab("normalized");
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      } finally {
        setLoadingId(null);
      }
    });
  };

  if (!projects.length) return <p className="empty">아직 수집된 프로젝트가 없습니다.</p>;

  return (
    <>
      {error && <p className="command-msg error">{error}</p>}
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>플랫폼</th>
              <th>제목</th>
              <th>예산</th>
              <th>등록일</th>
              <th>상태</th>
              <th>최초 수집</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((p) => (
              <tr key={p.id} className="clickable" onClick={() => open(p.id)} aria-busy={loadingId === p.id}>
                <td><span className={`chip chip-${p.platform}`}>{PLATFORM_NAME[p.platform] ?? p.platform}</span></td>
                <td className="title-cell">{p.title ?? "(제목 없음)"}</td>
                <td className="nowrap">{p.budget ?? "—"}</td>
                <td className="nowrap">{formatDate(p.registered_at)}</td>
                <td className="nowrap">{p.project_status ?? "—"}</td>
                <td className="nowrap muted">{formatDateTime(p.first_seen_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {detail && (
        <div className="modal-backdrop" onClick={() => setDetail(null)}>
          <div className="modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <header className="modal-head">
              <div>
                <p className="eyebrow">{PLATFORM_NAME[detail.normalized.platform]} · {detail.normalized.project_key}</p>
                <h3>{detail.normalized.title ?? "(제목 없음)"}</h3>
                <a href={detail.sourceUrl} target="_blank" rel="noreferrer" className="source-link">
                  원문 보기 ↗
                </a>
              </div>
              <button type="button" className="btn btn-ghost" onClick={() => setDetail(null)} aria-label="닫기">
                닫기
              </button>
            </header>
            <nav className="tabs">
              {(["normalized", "raw", "text"] as Tab[]).map((t) => (
                <button key={t} type="button" className={tab === t ? "tab active" : "tab"} onClick={() => setTab(t)}>
                  {t === "normalized" ? "Normalized" : t === "raw" ? "Raw" : "본문 텍스트"}
                </button>
              ))}
            </nav>
            <div className="modal-body">
              {tab === "normalized" && <pre>{JSON.stringify(detail.normalized, null, 2)}</pre>}
              {tab === "raw" && <pre>{detail.raw}</pre>}
              {tab === "text" && <pre className="wrap-text">{detail.rawText ?? "(없음)"}</pre>}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
