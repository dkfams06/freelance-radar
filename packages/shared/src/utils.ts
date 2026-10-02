export function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) return reject(signal.reason);
    const timer = setTimeout(() => {
      signal?.removeEventListener("abort", onAbort);
      resolve();
    }, ms);
    const onAbort = () => {
      clearTimeout(timer);
      reject(signal?.reason);
    };
    signal?.addEventListener("abort", onAbort, { once: true });
  });
}

export function randomBetween(min: number, max: number, rand: () => number = Math.random): number {
  return min + (max - min) * rand();
}

export function cleanText(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  const text = String(value).replace(/ /g, " ").replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();
  return text.length ? text : null;
}

export function uniqueStrings(values: Iterable<unknown>): string[] {
  const out = new Set<string>();
  for (const v of values) {
    const t = cleanText(v);
    if (t) out.add(t);
  }
  return [...out];
}

export function parseIntSafe(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  if (typeof value === "number") return Number.isFinite(value) ? Math.trunc(value) : null;
  const digits = String(value).replace(/[^\d-]/g, "");
  if (!digits || digits === "-") return null;
  const n = Number.parseInt(digits, 10);
  return Number.isFinite(n) ? n : null;
}

const KRW_UNITS: Array<[RegExp, number]> = [
  [/억/, 100_000_000],
  [/천만/, 10_000_000],
  [/백만/, 1_000_000],
  [/만/, 10_000],
  [/천/, 1_000],
];

/**
 * "1,500만원", "300만 원", "1억 2,000만원", "5,000,000원" 같은 한국어 금액 표현을 원 단위 정수로 변환.
 */
export function parseKrwAmount(text: string | null | undefined): number | null {
  if (!text) return null;
  const s = text.replace(/\s/g, "").replace(/원$/, "");
  if (!/\d/.test(s)) return null;

  // "1억2,000만" 같은 복합 표현
  let total = 0;
  let matched = false;
  const re = /([\d,.]+)(억|천만|백만|만|천)?/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(s)) !== null) {
    const num = Number.parseFloat(m[1]!.replace(/,/g, ""));
    if (!Number.isFinite(num)) continue;
    const unitText = m[2];
    const unit = unitText ? (KRW_UNITS.find(([r]) => r.test(unitText))?.[1] ?? 1) : 1;
    total += num * unit;
    matched = true;
  }
  return matched ? Math.round(total) : null;
}

/**
 * 예산 문자열에서 min/max 를 추출한다.
 * "500만원 ~ 1,000만원", "1,000만원", "협의" 등
 */
export function parseBudgetRange(text: string | null | undefined): { min: number | null; max: number | null } {
  if (!text) return { min: null, max: null };
  const parts = text.split(/~|∼|〜|-(?=\s*[\d])/).map((p) => p.trim()).filter(Boolean);
  if (parts.length >= 2) {
    // "500~1,000만원" 처럼 앞쪽 단위가 생략된 경우 뒤쪽 단위를 공유
    const unitMatch = parts[1]!.match(/(억|천만|백만|만|천)/);
    const first = /[억만천]/.test(parts[0]!) || !unitMatch ? parts[0]! : `${parts[0]}${unitMatch[1]}`;
    return { min: parseKrwAmount(first), max: parseKrwAmount(parts[1]) };
  }
  const v = parseKrwAmount(text);
  return { min: v, max: v };
}

/** "3개월", "45일", "2주", "1년" 같은 기간 표현을 일 수로 변환 */
export function parseDurationDays(text: string | null | undefined): number | null {
  if (!text) return null;
  const s = text.replace(/\s/g, "");
  const m = s.match(/([\d.]+)(일|주|개월|달|년)/);
  if (!m) return null;
  const n = Number.parseFloat(m[1]!);
  if (!Number.isFinite(n)) return null;
  const unit = m[2];
  const days = unit === "일" ? n : unit === "주" ? n * 7 : unit === "년" ? n * 365 : n * 30;
  return Math.round(days);
}

/**
 * 한국 사이트의 날짜 문자열을 KST 기준으로 해석한다.
 * "2025.10.02", "2025-10-02", "2025.10.02 14:30", "25.10.02", "2025년 10월 2일"
 */
export function parseKstDate(text: string | null | undefined): Date | null {
  if (!text) return null;
  const s = text.trim();
  const m =
    s.match(/(\d{4}|\d{2})\s*[.\-/년]\s*(\d{1,2})\s*[.\-/월]\s*(\d{1,2})\s*일?(?:\D+(\d{1,2}):(\d{2})(?::(\d{2}))?)?/) ?? null;
  if (!m) {
    const d = new Date(s);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  let year = Number(m[1]);
  if (year < 100) year += 2000;
  const month = Number(m[2]);
  const day = Number(m[3]);
  const hh = m[4] ? Number(m[4]) : 0;
  const mm = m[5] ? Number(m[5]) : 0;
  const ss = m[6] ? Number(m[6]) : 0;
  const iso = `${year}-${pad(month)}-${pad(day)}T${pad(hh)}:${pad(mm)}:${pad(ss)}+09:00`;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** "3일 전", "2시간 전", "방금 전" 같은 상대 시간 */
export function parseRelativeKoreanTime(text: string | null | undefined, now = new Date()): Date | null {
  if (!text) return null;
  if (/방금/.test(text)) return now;
  const m = text.match(/(\d+)\s*(초|분|시간|일|주|개월|달|년)\s*전/);
  if (!m) return null;
  const n = Number(m[1]);
  const unitMs: Record<string, number> = {
    초: 1_000,
    분: 60_000,
    시간: 3_600_000,
    일: 86_400_000,
    주: 7 * 86_400_000,
    개월: 30 * 86_400_000,
    달: 30 * 86_400_000,
    년: 365 * 86_400_000,
  };
  return new Date(now.getTime() - n * unitMs[m[2]!]!);
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

export function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
