/**
 * 위시캣 페이지 컨텍스트에서 실행되는 스크립트 (문자열).
 * 빌드 도구의 변환을 거치지 않도록 순수 JS 문자열로 둔다.
 * 반환값은 JSON 직렬화 가능해야 한다.
 */

const HELPERS = String.raw`
  const T = (el) => (el ? el.textContent.replace(/\s+/g, " ").trim() || null : null);
  const all = (root, sel) => (root ? Array.from(root.querySelectorAll(sel)) : []);
  const BLOCK = new Set(["P","DIV","LI","H1","H2","H3","H4","SECTION","TR","UL","OL","FORM"]);
  const textOf = (el) => {
    if (!el) return null;
    const c = el.cloneNode(true);
    c.querySelectorAll("script,style,svg,img").forEach((n) => n.remove());
    c.querySelectorAll("br").forEach((n) => n.replaceWith("\n"));
    c.querySelectorAll("*").forEach((n) => { if (BLOCK.has(n.tagName)) n.append("\n"); });
    const t = c.textContent.replace(/[ \t ]+/g, " ").replace(/ *\n */g, "\n").replace(/\n{3,}/g, "\n\n").trim();
    return t || null;
  };
  const hasLogout = (doc) => !!doc.querySelector('a[href*="logout"]');
  /** 텍스트 노드 사이에 공백을 넣어 이어붙임 (하위 요소 값이 붙어버리는 것 방지) */
  const spacedText = (el) => {
    if (!el) return null;
    const parts = [];
    const walker = el.ownerDocument.createTreeWalker(el, 4);
    for (let n = walker.nextNode(); n; n = walker.nextNode()) parts.push(n.textContent);
    return parts.join(" ").replace(/\s+/g, " ").trim() || null;
  };
  /** 툴팁 등 하위 요소를 제외한 직접 텍스트 (없으면 전체 텍스트) */
  const ownText = (el) => {
    if (!el) return null;
    const own = Array.from(el.childNodes).filter((n) => n.nodeType === 3).map((n) => n.textContent).join(" ").replace(/\s+/g, " ").trim();
    return own || T(el);
  };
`;

/** 최신 등록순 목록 페이지 */
export function listScript(page: number): string {
  return String.raw`(async () => {
  ${HELPERS}
  if (typeof LZString === "undefined") return { status: -1, count: null, hasNext: false, cards: [], loggedIn: null };
  const d = encodeURIComponent(LZString.compressToBase64("srt=new&page=" + ${JSON.stringify(page)}));
  const res = await fetch("/project/?d=" + d, { headers: { "X-Requested-With": "XMLHttpRequest" }, credentials: "include" });
  if (!res.ok) return { status: res.status, count: null, hasNext: false, cards: [], loggedIn: null };
  const data = await res.json();
  const doc = new DOMParser().parseFromString(data.result || "", "text/html");
  const cards = all(doc, ".project-info-box").map((box) => {
    const link = box.querySelector("a.project-link[href]");
    const path = link ? link.getAttribute("href") : null;
    const m = path ? path.match(/\/project\/(\d+)\//) : null;
    const coreRows = all(box, ".project-core-info > p");
    const pick = (cls) => { const p = box.querySelector(".project-core-info ." + cls); return T(p); };
    const proposal = all(box, ".proposal-info .info-detail").map(T);
    return {
      id: m ? m[1] : null,
      path,
      title: T(box.querySelector(".project-link p")) || T(link),
      statusMarks: all(box, ".project-organic-info > .project-status-label .status-mark").map(ownText).filter(Boolean),
      budgetText: pick("budget") || T(coreRows[0]),
      termText: pick("term"),
      startText: pick("launch-date"),
      roleOrCategory: T(box.querySelector(".project-category-or-role")),
      level: T(box.querySelector(".project-level")),
      typeMark: T(box.querySelector(".project-type-mark")),
      skills: all(box, ".project-skills-info .skill-chip").map(T).filter(Boolean),
      location: T(box.querySelector(".location-data")),
      registeredText: T(box.querySelector(".start-recruitment-data")),
      deadlineText: proposal.find((t) => t && t.startsWith("마감")) || null,
      applicantText: proposal.find((t) => t && t.startsWith("지원자")) || null,
      clientName: T(box.querySelector(".client-info .username")),
      clientRating: T(box.querySelector(".client-info .client-badge span")),
      clientBadges: all(box, ".client-info .badge-box img[alt]").map((i) => i.getAttribute("alt")),
    };
  }).filter((c) => c.id);
  const next = all(doc, ".pagination .page-link").some((a) => (a.textContent || "").trim() === "다음");
  return { status: res.status, count: typeof data.count === "number" ? data.count : null, hasNext: next, cards, loggedIn: null };
})()`;
}

/** 상세 페이지를 fetch 해서 DOM 에서 구조화 */
export function detailScript(path: string): string {
  return String.raw`(async () => {
  ${HELPERS}
  const res = await fetch(${JSON.stringify(path)}, { credentials: "include" });
  const html = await res.text();
  const doc = new DOMParser().parseFromString(html, "text/html");
  const root = doc.querySelector(".project-detail-view");
  const base = {
    source: "wishket.detail.dom",
    status: res.status,
    finalUrl: res.url,
    loggedIn: hasLogout(doc),
    locked: html.includes("로그인하고 "),
    captcha: !root && /captcha|challenge-platform|cf-chl/i.test(html),
  };
  if (!res.ok || !root) return { ...base, notFound: !root, pageTitle: doc.title || null };
  const section = root.querySelector(".detail-section") || root;

  const fields = {};
  const fieldNotes = {};
  const addField = (label, valueEl) => {
    const key = T(label);
    if (!key || !valueEl) return;
    const v = valueEl.cloneNode(true);
    const accents = all(v, ".condition-accent").map((a) => { const t = T(a); a.remove(); return t; }).filter(Boolean);
    const value = spacedText(v);
    if (value === null) return;
    const k = fields[key] !== undefined ? key + " (2)" : key;
    fields[k] = value;
    if (accents.length) fieldNotes[k] = accents.join(" ");
  };
  const ROWS = [
    [".project-condition-box", ".condition-box-name", ".project-condition-data"],
    [".project-detail-condition-row", ".condition-label", ".condition-data"],
    [".target-condition-row", ".condition-row-title", ".condition-row-data"],
    [".meeting-condition-row", ".meeting-condition-title", ".meeting-condition-data"],
  ];
  for (const [row, lab, val] of ROWS) for (const r of all(section, row)) addField(r.querySelector(lab), r.querySelector(val));

  const targetEl = section.querySelector(".project-target-info");
  const target = targetEl ? {
    role: T(targetEl.querySelector(".project-target-role")),
    level: T(targetEl.querySelector(".project-target-detail-row-info.level")),
    experience: T(targetEl.querySelector(".project-target-detail-row-info.experience")),
    budget: T(targetEl.querySelector(".project-target-detail-row-info.budget")),
  } : null;

  const skills = all(section, ".project-content-layer .skill-stack, .project-content-layer .skill-chip").map((el) => {
    const full = T(el) || "";
    const m = full.match(/^(.*?)\s*(?:·\s*)?(경력 무관|\d+\s*년.*)$/);
    return m ? { name: m[1].trim(), detail: m[2] } : { name: full, detail: null };
  }).filter((s) => s.name);

  const clientWrap = root.querySelector(".client-section-wrap");
  const clientStats = {};
  for (const r of all(clientWrap, ".client-project-info-row, .client-project-info-sub-row")) {
    const k = T(r.querySelector(".client-project-info-title"));
    if (k) clientStats[k] = T(r.querySelector(".client-project-info-data"));
  }
  const ratingEl = clientWrap && clientWrap.querySelector(".client-rating-point");
  const ratingCount = clientWrap && T(clientWrap.querySelector(".client-rating-count"));
  const client = clientWrap ? {
    name: T(clientWrap.querySelector("[class*=username], .client-name, .client-profile-name")),
    rating: ratingEl ? (T(ratingEl) || "").replace(ratingCount || "", "").trim() || null : null,
    ratingCount,
    badges: all(clientWrap, "img[alt], [class*=badge] [class*=text]").map((e) => e.getAttribute("alt") || T(e)).filter((b) => b && !/평점/.test(b)),
    stats: clientStats,
  } : null;

  const textRoot = section.cloneNode(true);
  textRoot.querySelectorAll(".project-comment-layer, .project-similar-layer, .project-consultation-container, form, .tooltip-text, .project-detail-nav").forEach((n) => n.remove());

  return {
    ...base,
    statusMarks: all(section, ".project-content-title .status-mark").map(ownText).filter(Boolean),
    registeredText: T(section.querySelector(".project-content-title .project-recruit-guide")),
    title: T(section.querySelector(".project-content-title h1")),
    categoryGroups: all(section, ".project-classification .project-category").map((p) => all(p, ".category-wrapper").map(T).filter(Boolean)).filter((g) => g.length),
    fields,
    fieldNotes,
    target,
    skills,
    description: textOf(section.querySelector(".project-description-box")),
    workConditions: all(section, ".project-work-condition-box").map((b) => ({ title: T(b.querySelector(".work-condition-box-title")), values: all(b, ".work-condition-data").map(T).filter(Boolean) })),
    recruitConditions: all(section, ".recruit-condition-detail-box").map((b) => ({ title: T(b.querySelector("h3")), values: all(b, ".recruit-condition-data").map(T).filter(Boolean) })),
    targetLevelInfo: T(section.querySelector(".target-level-info")),
    client,
    commentCount: T(root.querySelector(".comment-layer-count")),
    text: textOf(textRoot),
  };
})()`;
}

/** 로그인 여부: 프로젝트 목록 HTML 을 새로 받아 로그아웃 링크 존재 확인 */
export const LOGIN_CHECK_SCRIPT = String.raw`(async () => {
  const res = await fetch("/project/", { credentials: "include" });
  const html = await res.text();
  const doc = new DOMParser().parseFromString(html, "text/html");
  return {
    status: res.status,
    loggedIn: !!doc.querySelector('a[href*="logout"]'),
    captcha: /captcha|challenge-platform|cf-chl/i.test(html) && !doc.querySelector(".project-list-view, .search-result, #projectListView"),
  };
})()`;
