const KST = "Asia/Seoul";

export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("ko-KR", { timeZone: KST, year: "2-digit", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false });
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("ko-KR", { timeZone: KST, year: "numeric", month: "2-digit", day: "2-digit" });
}

export function formatRelative(iso: string | null | undefined, now = Date.now()): string {
  if (!iso) return "—";
  const diff = Math.round((now - new Date(iso).getTime()) / 1000);
  if (diff < 0) return formatDateTime(iso);
  if (diff < 60) return `${diff}초 전`;
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
  return `${Math.floor(diff / 86400)}일 전`;
}

export function formatNumber(n: number | null | undefined): string {
  return n === null || n === undefined ? "—" : n.toLocaleString("ko-KR");
}

export const PLATFORM_NAME: Record<string, string> = { wishket: "위시캣", freemoa: "프리모아" };
