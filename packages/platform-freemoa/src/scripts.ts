/**
 * 프리모아 페이지 컨텍스트에서 실행되는 스크립트 (문자열).
 * 사이트 자체가 쓰는 JSON API(/m4a/s41a 목록, /m4a/s41v 상세)를 세션 쿠키로 호출한다.
 * 내 계정 정보(myId, 내 지원 내역)와 다른 사용자의 이메일/ID 는 브라우저 밖으로 꺼내지 않는다.
 */

const POST_HELPER = String.raw`
  const post = async (uri, data) => {
    const body = new URLSearchParams();
    for (const [k, v] of Object.entries(data)) if (v !== undefined && v !== null) body.append(k, v);
    const res = await fetch(uri, { method: "POST", body, credentials: "include", headers: { "X-Requested-With": "XMLHttpRequest" } });
    let json = null;
    try { json = await res.json(); } catch {}
    return { status: res.status, json };
  };
  const err = (j) => (j && j.ERROR ? { errorNo: j.ERROR.NO === undefined ? null : j.ERROR.NO, errorMsg: j.ERROR.MSG || null } : { errorNo: null, errorMsg: null });
  const SENSITIVE_ROW = ["client_id", "company_info", "picture_url", "isclipped", "isapplied", "FACED_MEET_SCHEDULE", "LATEST_MEET_SCHEDULE", "MEETCOUNT", "TENDENCY_MAIL_COUNT", "unapped_count", "UNAPPED_COUNT_WITHOUT_NOCOUNT"];
  const scrubRow = (row) => { const r = { ...row }; for (const k of SENSITIVE_ROW) delete r[k]; return r; };
`;

/** 최신 등록순(sm=3) 목록 */
export function listScript(page: number): string {
  return String.raw`(async () => {
  ${POST_HELPER}
  const r = await post("/m4a/s41a", { sS: "", page: ${JSON.stringify(page)}, sm: 3, mp: 0, lp: 0, st2: "", st3: "" });
  const j = r.json;
  const P = j && j.DATA && j.DATA.PROJECT;
  return {
    status: r.status,
    ...err(j),
    rows: P && Array.isArray(P.LIST) ? P.LIST.map(scrubRow) : [],
    pagination: P && P.PAGINATION ? { currentPage: P.PAGINATION.currentPage, nextPage: P.PAGINATION.nextPage, totalRows: P.PAGINATION.totalRows } : null,
  };
})()`;
}

/** 상세 */
export function detailScript(pno: string): string {
  return String.raw`(async () => {
  ${POST_HELPER}
  const r = await post("/m4a/s41v", { pno: ${JSON.stringify(pno)}, anyView: "" });
  const j = r.json;
  const D = j && j.DATA;
  let view = null, meta = null;
  if (D && D.VIEW) {
    view = { ...D.VIEW };
    // 다른 사용자 식별정보 제거: 댓글 작성자 id/이메일, 지원자 목록
    view.COMMENTS = Array.isArray(view.COMMENTS) ? view.COMMENTS.map((c) => ({ txt: c.txt, INS_TIME: c.INS_TIME, usertype_cd: c.usertype_cd, is_hide: c.is_hide, replyCount: Array.isArray(c.reply) ? c.reply.length : 0 })) : [];
    view.APPLIERSINFO = { total_count: view.APPLIERSINFO ? view.APPLIERSINFO.total_count : null };
    delete view.my_pic_url;
  }
  if (D && D.META) {
    // 내 계정/클라이언트 연락처 제외
    const { myId, company_userid, PICTURE_URL, ismyapplied, ismyproject, isclipped, userType, ...rest } = D.META;
    meta = rest;
  }
  return {
    status: r.status,
    ...err(j),
    view,
    meta,
    commentCount: D && D.COMMET_CNT !== undefined ? String(D.COMMET_CNT) : null,
  };
})()`;
}

export const LOGIN_CHECK_SCRIPT = String.raw`(async () => {
  const res = await fetch("/m4/s41", { credentials: "include" });
  const html = await res.text();
  const doc = new DOMParser().parseFromString(html, "text/html");
  return {
    status: res.status,
    loggedIn: !!doc.querySelector('a[href="/m0/s05"], a[href*="logout"]'),
    captcha: /captcha|challenge-platform|cf-chl/i.test(html) && !doc.querySelector("#projectListNew, #projectViewWrap"),
  };
})()`;
