"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

/** 서버 컴포넌트 데이터를 주기적으로 다시 불러온다 */
export function AutoRefresh({ intervalMs = 5000 }: { intervalMs?: number }) {
  const router = useRouter();
  const [enabled, setEnabled] = useState(true);
  const [tick, setTick] = useState(() => new Date());

  useEffect(() => {
    try {
      const saved = localStorage.getItem("crawler.autoRefresh");
      if (saved === "0") setEnabled(false);
    } catch {}
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const id = setInterval(() => {
      router.refresh();
      setTick(new Date());
    }, intervalMs);
    return () => clearInterval(id);
  }, [enabled, intervalMs, router]);

  const toggle = () => {
    setEnabled((v) => {
      try {
        localStorage.setItem("crawler.autoRefresh", v ? "0" : "1");
      } catch {}
      return !v;
    });
  };

  return (
    <button type="button" className="refresh" onClick={toggle} aria-pressed={enabled}>
      <span className={`dot ${enabled ? "live" : ""}`} />
      {enabled ? `자동 새로고침 · ${tick.toLocaleTimeString("ko-KR", { hour12: false })}` : "자동 새로고침 꺼짐"}
    </button>
  );
}
