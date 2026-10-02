/** /m4a/s41a 목록 응답의 항목 (민감 필드 제거 후) */
export interface FreemoaListRow {
  proj_idx: string;
  title: string | null;
  INS_TIME: string | null;
  edate?: string | null;
  endtime?: string | null;
  cost_min?: string | null;
  cost_max?: string | null;
  during?: string | null;
  isNowApply?: string | null;
  isviewable?: string | null;
  workType?: string | null;
  is_stay?: string | null;
  fld?: string | null;
  fld_nm_2nd?: string | null;
  proj_filed_new?: string | null;
  proj_language?: string | null;
  pv_smallnm?: string | null;
  plan_nm?: string | null;
  ALL_APPLY_COUNT?: string | null;
  txt?: string | null;
  [key: string]: unknown;
}

export interface FreemoaListResponse {
  status: number;
  errorNo: number | null;
  errorMsg: string | null;
  rows: FreemoaListRow[];
  pagination: { currentPage: number; nextPage: number | null; totalRows: string | number } | null;
}

/** /m4a/s41v 상세 응답 VIEW (민감 필드 제거 후) */
export interface FreemoaView {
  title?: string | null;
  projectType?: string | null;
  edate?: string | null;
  endtime?: string | null;
  cl_idx?: string | null;
  during?: string | null;
  cost_min?: string | null;
  cost_max?: string | null;
  costView?: string | null;
  proj_fld_json?: string | null;
  pvNmu?: string | null;
  plan_nm?: string | null;
  isescrow?: string | null;
  ispms?: string | null;
  ispm?: string | null;
  isnda?: string | null;
  BEGIN_EXPECT?: string | null;
  is_pro?: string | null;
  workType?: string | null;
  is_stay?: string | null;
  open_data?: string | null;
  cl_private_nm?: string | null;
  ALL_APPLY_COUNT?: string | null;
  isNowApply?: string | null;
  proj_fld_cd?: string | null;
  proj_language?: string | null;
  INS_TIME?: string | null;
  txt?: string | null;
  service?: string | null;
  reference_url?: string | null;
  proj_filed?: string | null;
  proj_filed_new?: string | null;
  LNGS?: unknown[];
  FILES?: unknown[];
  COMMENTS?: Array<{ txt?: string; INS_TIME?: string; usertype_cd?: string; is_hide?: string }>;
  APPLIERSINFO?: { total_count?: number };
  [key: string]: unknown;
}

export interface FreemoaDetailResponse {
  status: number;
  errorNo: number | null;
  errorMsg: string | null;
  view: FreemoaView | null;
  meta: Record<string, unknown> | null;
  commentCount: string | null;
}

export interface FreemoaRaw {
  source: "freemoa.api";
  listRow: FreemoaListRow | null;
  detail: FreemoaDetailResponse | null;
  /** 상세 열람 불가 (견적 요청을 받은 파트너만 열람 등) → 목록 데이터만 보존 */
  detailRestricted: boolean;
}
