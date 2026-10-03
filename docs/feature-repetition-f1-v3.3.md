# project_type 내부 요구사항 반복률 (feature f1, analysis v3.3)

- 대상: analysis v3.3 일반 외주(engagement_type ≠ staffing) · sample-file 제한 — 173건
- 기능 추출: LLM 호출 없음. v3.3 분석값(required_features/integrations) 매핑 + 설명/제목의 명시적 키워드. 근거 없는 기능은 넣지 않음
- 기능 근거 구성: 분석값만 1151 · 설명만 283 · 둘 다 877 (프로젝트×기능 단위)
- bundle 최소 support 5건, n < 10 유형은 ⚠ 표본 부족 (결론 순위에서 제외)

## 요약표

| project_type | n | 평균 기능 수 | 평균 유사도 | 중앙 | p75 | 70%↑ 유사 쌍 | ≥50% 기능 | ≥70% 기능 | 템플릿 coverage | core 적합 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| business_management | 37 | 9.2 | 30% | 30% | 39% | 1% | 5 | 3 | 43% | 68% |
| platform_marketplace | 39 | 12.7 | 28% | 29% | 39% | 0% | 9 | 3 | 46% | 51% |
| ecommerce | 18 | 11.0 | 36% | 33% | 43% | 3% | 6 | 6 | 51% | 83% |
| website | 37 | 6.0 | 23% | 20% | 33% | 2% | 3 | 1 | 46% | 41% |
| admin_backoffice ⚠ | 8 | 7.6 | 33% | 32% | 42% | 0% | 7 | 4 | 70% | 75% |
| reservation ⚠ | 9 | 14.3 | 35% | 36% | 40% | 0% | 11 | 5 | 60% | 78% |
| saas ⚠ | 9 | 10.0 | 39% | 37% | 50% | 0% | 5 | 5 | 56% | 100% |
| ai_service | 16 | 8.4 | 26% | 25% | 33% | 0% | 8 | 0 | 57% | 25% |

- 평균 유사도: 같은 유형 프로젝트 쌍의 feature set Jaccard 평균
- 템플릿 coverage: 프로젝트 기능 중 core(등장률 ≥50%) 기능 비율의 평균 · core 적합: core 의 70% 이상을 포함하는 프로젝트 비율

## 결론

- 요구사항 반복률이 가장 높은 유형: ecommerce, business_management, platform_marketplace
- 템플릿화가 가장 쉬운 유형: ai_service, ecommerce, platform_marketplace
- 공고마다 차이가 커서 전문화 가치가 낮은 유형: website, ai_service, platform_marketplace
- 미리 만들어두면 여러 유형에서 반복 사용할 기능 (3개 이상 유형에서 등장률 ≥40%): admin_dashboard (관리자 페이지), authentication (회원가입/로그인), user_management (회원/사용자 관리), statistics_dashboard (통계/대시보드), role_permission (역할/권한), search_filter (검색/필터), excel_import_export (엑셀/CSV 입출력), file_upload (파일 업로드/첨부), notification (알림 (푸시/문자/알림톡/메일)), payment (결제)

## 유형 공통 기능 (전체 대상 기준)

| 기능 | 프로젝트 수 | 비율 | 등장률≥40% 유형 수 | 유형 |
|---|---:|---:|---:|---|
| admin_dashboard (관리자 페이지) | 138 | 80% | 8 | business_management, platform_marketplace, ecommerce, website, admin_backoffice, reservation, saas, ai_service |
| authentication (회원가입/로그인) | 127 | 73% | 7 | business_management, platform_marketplace, ecommerce, admin_backoffice, reservation, saas, ai_service |
| user_management (회원/사용자 관리) | 85 | 49% | 5 | business_management, platform_marketplace, admin_backoffice, reservation, saas |
| statistics_dashboard (통계/대시보드) | 84 | 49% | 5 | business_management, platform_marketplace, reservation, saas, ai_service |
| role_permission (역할/권한) | 75 | 43% | 5 | business_management, platform_marketplace, admin_backoffice, reservation, saas |
| search_filter (검색/필터) | 69 | 40% | 4 | platform_marketplace, ecommerce, admin_backoffice, reservation |
| excel_import_export (엑셀/CSV 입출력) | 49 | 28% | 4 | business_management, admin_backoffice, saas, ai_service |
| file_upload (파일 업로드/첨부) | 72 | 42% | 3 | business_management, platform_marketplace, ai_service |
| notification (알림 (푸시/문자/알림톡/메일)) | 65 | 38% | 3 | platform_marketplace, admin_backoffice, reservation |
| payment (결제) | 54 | 31% | 3 | platform_marketplace, ecommerce, reservation |
| board_community (게시판/커뮤니티) | 48 | 28% | 2 | platform_marketplace, website |
| cms_content (콘텐츠 관리(CMS)) | 42 | 24% | 2 | website, reservation |
| task_automation (업무 자동화/배치) | 37 | 21% | 2 | business_management, ai_service |
| social_login (소셜 로그인) | 25 | 14% | 2 | platform_marketplace, reservation |
| external_api_integration (외부 API/시스템 연동) | 53 | 31% | 1 | ai_service |
| order_management (주문/발주 관리) | 45 | 26% | 1 | ecommerce |
| landing_seo (랜딩/SEO) | 42 | 24% | 1 | website |
| listing_catalog (상품/매물 목록·상세) | 37 | 21% | 1 | ecommerce |
| multilingual (다국어) | 28 | 16% | 1 | reservation |
| settlement (정산) | 25 | 14% | 1 | reservation |
| cart_checkout (장바구니/주문서) | 21 | 12% | 1 | ecommerce |
| reservation (예약) | 21 | 12% | 1 | reservation |
| ai_llm (LLM/생성형 AI) | 18 | 10% | 1 | ai_service |
| scheduling_calendar (일정/캘린더) | 17 | 10% | 1 | reservation |
| ai_recognition (AI 인식 (영상/OCR/음성)) | 15 | 9% | 1 | ai_service |

## business_management (n=37)

- 평균 기능 수 9.2 · 기능 0개 프로젝트 0건
- 유사도(666쌍): 평균 30% · 중앙 30% · p75 39% · 70% 이상 쌍 1%
- 70% 이상 등장: admin_dashboard, authentication, role_permission
- 50% 이상 등장: admin_dashboard, authentication, role_permission, statistics_dashboard, excel_import_export

| 순위 | 기능 | 프로젝트 수 | 등장률 |
|---:|---|---:|---:|
| 1 | admin_dashboard (관리자 페이지) | 34 | 92% |
| 2 | authentication (회원가입/로그인) | 31 | 84% |
| 3 | role_permission (역할/권한) | 26 | 70% |
| 4 | statistics_dashboard (통계/대시보드) | 25 | 68% |
| 5 | excel_import_export (엑셀/CSV 입출력) | 24 | 65% |
| 6 | user_management (회원/사용자 관리) | 16 | 43% |
| 7 | file_upload (파일 업로드/첨부) | 15 | 41% |
| 8 | task_automation (업무 자동화/배치) | 15 | 41% |
| 9 | report_generation (문서/보고서 생성·출력) | 14 | 38% |
| 10 | external_api_integration (외부 API/시스템 연동) | 13 | 35% |
| 11 | notification (알림 (푸시/문자/알림톡/메일)) | 13 | 35% |
| 12 | workflow (업무 흐름/상태 관리) | 12 | 32% |
| 13 | approval (결재/승인) | 10 | 27% |
| 14 | order_management (주문/발주 관리) | 10 | 27% |
| 15 | search_filter (검색/필터) | 10 | 27% |

- 대표 반복 bundle (support ≥ 5, 3개 이상 기능, maximal):
  - [admin_dashboard, approval, authentication, excel_import_export, role_permission, statistics_dashboard, task_automation, workflow] — 5건 (14%)
  - [admin_dashboard, authentication, excel_import_export, file_upload, role_permission, statistics_dashboard, task_automation] — 6건 (16%)
  - [admin_dashboard, approval, authentication, excel_import_export, external_api_integration, role_permission, workflow] — 5건 (14%)
  - [admin_dashboard, approval, authentication, excel_import_export, file_upload, role_permission, workflow] — 5건 (14%)
  - [admin_dashboard, approval, authentication, excel_import_export, role_permission, user_management, workflow] — 5건 (14%)
- 템플릿 후보: core [admin_dashboard, authentication, role_permission, statistics_dashboard, excel_import_export] + optional [user_management, file_upload, task_automation, report_generation, external_api_integration, notification, workflow] · coverage 43% · core 적합 68%

## platform_marketplace (n=39)

- 평균 기능 수 12.7 · 기능 0개 프로젝트 0건
- 유사도(741쌍): 평균 28% · 중앙 29% · p75 39% · 70% 이상 쌍 0%
- 70% 이상 등장: admin_dashboard, authentication, user_management
- 50% 이상 등장: admin_dashboard, authentication, user_management, notification, search_filter, payment, statistics_dashboard, role_permission, file_upload

| 순위 | 기능 | 프로젝트 수 | 등장률 |
|---:|---|---:|---:|
| 1 | admin_dashboard (관리자 페이지) | 34 | 87% |
| 2 | authentication (회원가입/로그인) | 34 | 87% |
| 3 | user_management (회원/사용자 관리) | 31 | 79% |
| 4 | notification (알림 (푸시/문자/알림톡/메일)) | 27 | 69% |
| 5 | search_filter (검색/필터) | 23 | 59% |
| 6 | payment (결제) | 22 | 56% |
| 7 | statistics_dashboard (통계/대시보드) | 22 | 56% |
| 8 | role_permission (역할/권한) | 21 | 54% |
| 9 | file_upload (파일 업로드/첨부) | 20 | 51% |
| 10 | board_community (게시판/커뮤니티) | 19 | 49% |
| 11 | social_login (소셜 로그인) | 16 | 41% |
| 12 | external_api_integration (외부 API/시스템 연동) | 15 | 38% |
| 13 | matching (매칭/중개) | 15 | 38% |
| 14 | app_store_release (앱 스토어 배포) | 14 | 36% |
| 15 | comments_reviews (리뷰/후기/댓글) | 13 | 33% |

- 대표 반복 bundle (support ≥ 5, 3개 이상 기능, maximal):
  - [admin_dashboard, authentication, board_community, notification, payment, search_filter, statistics_dashboard, user_management] — 9건 (23%)
  - [admin_dashboard, authentication, payment, role_permission, search_filter, settlement, statistics_dashboard, user_management] — 9건 (23%)
  - [admin_dashboard, authentication, board_community, notification, payment, social_login, statistics_dashboard, user_management] — 8건 (21%)
  - [admin_dashboard, authentication, board_community, notification, search_filter, social_login, statistics_dashboard, user_management] — 8건 (21%)
  - [admin_dashboard, authentication, notification, payment, role_permission, search_filter, statistics_dashboard, user_management] — 8건 (21%)
- 템플릿 후보: core [admin_dashboard, authentication, user_management, notification, search_filter, payment, statistics_dashboard, role_permission, file_upload] + optional [board_community, social_login, external_api_integration, matching, app_store_release, comments_reviews, map_location, order_management] · coverage 46% · core 적합 51%

## ecommerce (n=18)

- 평균 기능 수 11.0 · 기능 0개 프로젝트 0건
- 유사도(153쌍): 평균 36% · 중앙 33% · p75 43% · 70% 이상 쌍 3%
- 70% 이상 등장: authentication, payment, listing_catalog, order_management, admin_dashboard, cart_checkout
- 50% 이상 등장: authentication, payment, listing_catalog, order_management, admin_dashboard, cart_checkout

| 순위 | 기능 | 프로젝트 수 | 등장률 |
|---:|---|---:|---:|
| 1 | authentication (회원가입/로그인) | 17 | 94% |
| 2 | payment (결제) | 17 | 94% |
| 3 | listing_catalog (상품/매물 목록·상세) | 16 | 89% |
| 4 | order_management (주문/발주 관리) | 16 | 89% |
| 5 | admin_dashboard (관리자 페이지) | 15 | 83% |
| 6 | cart_checkout (장바구니/주문서) | 13 | 72% |
| 7 | search_filter (검색/필터) | 8 | 44% |
| 8 | external_api_integration (외부 API/시스템 연동) | 7 | 39% |
| 9 | notification (알림 (푸시/문자/알림톡/메일)) | 7 | 39% |
| 10 | user_management (회원/사용자 관리) | 7 | 39% |
| 11 | file_upload (파일 업로드/첨부) | 6 | 33% |
| 12 | landing_seo (랜딩/SEO) | 5 | 28% |
| 13 | statistics_dashboard (통계/대시보드) | 5 | 28% |
| 14 | board_community (게시판/커뮤니티) | 4 | 22% |
| 15 | report_generation (문서/보고서 생성·출력) | 4 | 22% |

- 대표 반복 bundle (support ≥ 5, 3개 이상 기능, maximal):
  - [admin_dashboard, authentication, cart_checkout, listing_catalog, order_management, payment, search_filter] — 6건 (33%)
  - [admin_dashboard, authentication, cart_checkout, file_upload, listing_catalog, order_management, payment] — 5건 (28%)
  - [admin_dashboard, authentication, cart_checkout, listing_catalog, order_management, payment, user_management] — 5건 (28%)
  - [authentication, cart_checkout, listing_catalog, notification, order_management, search_filter] — 5건 (28%)
  - [admin_dashboard, authentication, listing_catalog, notification, order_management] — 5건 (28%)
- 템플릿 후보: core [authentication, payment, listing_catalog, order_management, admin_dashboard, cart_checkout] + optional [search_filter, external_api_integration, notification, user_management, file_upload] · coverage 51% · core 적합 83%

## website (n=37)

- 평균 기능 수 6.0 · 기능 0개 프로젝트 0건
- 유사도(666쌍): 평균 23% · 중앙 20% · p75 33% · 70% 이상 쌍 2%
- 70% 이상 등장: landing_seo
- 50% 이상 등장: landing_seo, cms_content, admin_dashboard

| 순위 | 기능 | 프로젝트 수 | 등장률 |
|---:|---|---:|---:|
| 1 | landing_seo (랜딩/SEO) | 32 | 86% |
| 2 | cms_content (콘텐츠 관리(CMS)) | 22 | 59% |
| 3 | admin_dashboard (관리자 페이지) | 20 | 54% |
| 4 | board_community (게시판/커뮤니티) | 17 | 46% |
| 5 | authentication (회원가입/로그인) | 13 | 35% |
| 6 | file_upload (파일 업로드/첨부) | 13 | 35% |
| 7 | inquiry_support (문의/고객지원) | 11 | 30% |
| 8 | search_filter (검색/필터) | 8 | 22% |
| 9 | media_handling (이미지/영상 처리·재생) | 7 | 19% |
| 10 | multilingual (다국어) | 7 | 19% |
| 11 | map_location (지도/위치) | 6 | 16% |
| 12 | notification (알림 (푸시/문자/알림톡/메일)) | 6 | 16% |
| 13 | statistics_dashboard (통계/대시보드) | 6 | 16% |
| 14 | user_management (회원/사용자 관리) | 6 | 16% |
| 15 | external_api_integration (외부 API/시스템 연동) | 5 | 14% |

- 대표 반복 bundle (support ≥ 5, 3개 이상 기능, maximal):
  - [admin_dashboard, authentication, board_community, cms_content, file_upload, inquiry_support] — 5건 (14%)
  - [admin_dashboard, authentication, board_community, cms_content, file_upload, landing_seo] — 5건 (14%)
  - [admin_dashboard, authentication, board_community, file_upload, inquiry_support, landing_seo] — 5건 (14%)
  - [admin_dashboard, board_community, cms_content, file_upload, inquiry_support, landing_seo] — 5건 (14%)
  - [admin_dashboard, authentication, cms_content, inquiry_support, landing_seo] — 5건 (14%)
- 템플릿 후보: core [landing_seo, cms_content, admin_dashboard] + optional [board_community, authentication, file_upload] · coverage 46% · core 적합 41%

## admin_backoffice (n=8) ⚠ 표본 부족

- 평균 기능 수 7.6 · 기능 0개 프로젝트 0건
- 유사도(28쌍): 평균 33% · 중앙 32% · p75 42% · 70% 이상 쌍 0%
- 70% 이상 등장: admin_dashboard, excel_import_export, search_filter, user_management
- 50% 이상 등장: admin_dashboard, excel_import_export, search_filter, user_management, authentication, role_permission, notification

| 순위 | 기능 | 프로젝트 수 | 등장률 |
|---:|---|---:|---:|
| 1 | admin_dashboard (관리자 페이지) | 8 | 100% |
| 2 | excel_import_export (엑셀/CSV 입출력) | 6 | 75% |
| 3 | search_filter (검색/필터) | 6 | 75% |
| 4 | user_management (회원/사용자 관리) | 6 | 75% |
| 5 | authentication (회원가입/로그인) | 5 | 63% |
| 6 | role_permission (역할/권한) | 5 | 63% |
| 7 | notification (알림 (푸시/문자/알림톡/메일)) | 4 | 50% |
| 8 | file_upload (파일 업로드/첨부) | 3 | 38% |
| 9 | report_generation (문서/보고서 생성·출력) | 3 | 38% |
| 10 | legacy_migration (데이터 이관/마이그레이션) | 2 | 25% |
| 11 | statistics_dashboard (통계/대시보드) | 2 | 25% |
| 12 | task_automation (업무 자동화/배치) | 2 | 25% |
| 13 | ai_llm (LLM/생성형 AI) | 1 | 13% |
| 14 | board_community (게시판/커뮤니티) | 1 | 13% |
| 15 | crud_data_management (데이터 등록·수정·관리(CRUD)) | 1 | 13% |

- 대표 반복 bundle (support ≥ 5, 3개 이상 기능, maximal):
  - [admin_dashboard, authentication, excel_import_export] — 5건 (63%)
  - [admin_dashboard, excel_import_export, search_filter] — 5건 (63%)
  - [admin_dashboard, search_filter, user_management] — 5건 (63%)
- 템플릿 후보: core [admin_dashboard, excel_import_export, search_filter, user_management, authentication, role_permission, notification] + optional [file_upload, report_generation] · coverage 70% · core 적합 75%

## reservation (n=9) ⚠ 표본 부족

- 평균 기능 수 14.3 · 기능 0개 프로젝트 0건
- 유사도(36쌍): 평균 35% · 중앙 36% · p75 40% · 70% 이상 쌍 0%
- 70% 이상 등장: admin_dashboard, authentication, reservation, payment, search_filter
- 50% 이상 등장: admin_dashboard, authentication, reservation, payment, search_filter, notification, role_permission, statistics_dashboard, user_management, cms_content, scheduling_calendar

| 순위 | 기능 | 프로젝트 수 | 등장률 |
|---:|---|---:|---:|
| 1 | admin_dashboard (관리자 페이지) | 9 | 100% |
| 2 | authentication (회원가입/로그인) | 9 | 100% |
| 3 | reservation (예약) | 9 | 100% |
| 4 | payment (결제) | 7 | 78% |
| 5 | search_filter (검색/필터) | 7 | 78% |
| 6 | notification (알림 (푸시/문자/알림톡/메일)) | 6 | 67% |
| 7 | role_permission (역할/권한) | 6 | 67% |
| 8 | statistics_dashboard (통계/대시보드) | 6 | 67% |
| 9 | user_management (회원/사용자 관리) | 6 | 67% |
| 10 | cms_content (콘텐츠 관리(CMS)) | 5 | 56% |
| 11 | scheduling_calendar (일정/캘린더) | 5 | 56% |
| 12 | multilingual (다국어) | 4 | 44% |
| 13 | settlement (정산) | 4 | 44% |
| 14 | social_login (소셜 로그인) | 4 | 44% |
| 15 | crm_customer (고객관리(CRM)) | 3 | 33% |

- 대표 반복 bundle (support ≥ 5, 3개 이상 기능, maximal):
  - [admin_dashboard, authentication, notification, payment, reservation, search_filter] — 5건 (56%)
  - [admin_dashboard, authentication, notification, payment, reservation, statistics_dashboard] — 5건 (56%)
  - [admin_dashboard, authentication, payment, reservation, role_permission] — 5건 (56%)
  - [admin_dashboard, authentication, payment, reservation, user_management] — 5건 (56%)
  - [admin_dashboard, authentication, reservation, role_permission, statistics_dashboard] — 5건 (56%)
- 템플릿 후보: core [admin_dashboard, authentication, reservation, payment, search_filter, notification, role_permission, statistics_dashboard, user_management, cms_content, scheduling_calendar] + optional [multilingual, settlement, social_login, crm_customer, legacy_migration, listing_catalog, map_location, order_management] · coverage 60% · core 적합 78%

## saas (n=9) ⚠ 표본 부족

- 평균 기능 수 10.0 · 기능 0개 프로젝트 0건
- 유사도(36쌍): 평균 39% · 중앙 37% · p75 50% · 70% 이상 쌍 0%
- 70% 이상 등장: admin_dashboard, authentication, statistics_dashboard, user_management, role_permission
- 50% 이상 등장: admin_dashboard, authentication, statistics_dashboard, user_management, role_permission

| 순위 | 기능 | 프로젝트 수 | 등장률 |
|---:|---|---:|---:|
| 1 | admin_dashboard (관리자 페이지) | 9 | 100% |
| 2 | authentication (회원가입/로그인) | 9 | 100% |
| 3 | statistics_dashboard (통계/대시보드) | 9 | 100% |
| 4 | user_management (회원/사용자 관리) | 9 | 100% |
| 5 | role_permission (역할/권한) | 7 | 78% |
| 6 | excel_import_export (엑셀/CSV 입출력) | 4 | 44% |
| 7 | file_upload (파일 업로드/첨부) | 3 | 33% |
| 8 | media_handling (이미지/영상 처리·재생) | 3 | 33% |
| 9 | payment (결제) | 3 | 33% |
| 10 | board_community (게시판/커뮤니티) | 2 | 22% |
| 11 | cms_content (콘텐츠 관리(CMS)) | 2 | 22% |
| 12 | external_api_integration (외부 API/시스템 연동) | 2 | 22% |
| 13 | identity_verification (본인인증) | 2 | 22% |
| 14 | listing_catalog (상품/매물 목록·상세) | 2 | 22% |
| 15 | report_generation (문서/보고서 생성·출력) | 2 | 22% |

- 대표 반복 bundle (support ≥ 5, 3개 이상 기능, maximal):
  - [admin_dashboard, authentication, role_permission, statistics_dashboard, user_management] — 7건 (78%)
- 템플릿 후보: core [admin_dashboard, authentication, statistics_dashboard, user_management, role_permission] + optional [excel_import_export, file_upload, media_handling, payment] · coverage 56% · core 적합 100%

## ai_service (n=16)

- 평균 기능 수 8.4 · 기능 0개 프로젝트 0건
- 유사도(120쌍): 평균 26% · 중앙 25% · p75 33% · 70% 이상 쌍 0%
- 70% 이상 등장: 없음
- 50% 이상 등장: ai_llm, ai_recognition, file_upload, admin_dashboard, authentication, external_api_integration, statistics_dashboard, task_automation

| 순위 | 기능 | 프로젝트 수 | 등장률 |
|---:|---|---:|---:|
| 1 | ai_llm (LLM/생성형 AI) | 11 | 69% |
| 2 | ai_recognition (AI 인식 (영상/OCR/음성)) | 10 | 63% |
| 3 | file_upload (파일 업로드/첨부) | 10 | 63% |
| 4 | admin_dashboard (관리자 페이지) | 9 | 56% |
| 5 | authentication (회원가입/로그인) | 9 | 56% |
| 6 | external_api_integration (외부 API/시스템 연동) | 9 | 56% |
| 7 | statistics_dashboard (통계/대시보드) | 9 | 56% |
| 8 | task_automation (업무 자동화/배치) | 8 | 50% |
| 9 | excel_import_export (엑셀/CSV 입출력) | 7 | 44% |
| 10 | report_generation (문서/보고서 생성·출력) | 6 | 38% |
| 11 | iot_device_integration (장비/IoT 연동) | 5 | 31% |
| 12 | media_handling (이미지/영상 처리·재생) | 5 | 31% |
| 13 | search_filter (검색/필터) | 5 | 31% |
| 14 | multilingual (다국어) | 4 | 25% |
| 15 | rag_search (RAG/벡터 검색) | 4 | 25% |

- 대표 반복 bundle (support ≥ 5, 3개 이상 기능, maximal):
  - [admin_dashboard, ai_llm, authentication, statistics_dashboard] — 5건 (31%)
  - [admin_dashboard, ai_llm, external_api_integration] — 5건 (31%)
  - [ai_llm, excel_import_export, file_upload] — 5건 (31%)
  - [ai_llm, external_api_integration, statistics_dashboard] — 5건 (31%)
- 템플릿 후보: core [ai_llm, ai_recognition, file_upload, admin_dashboard, authentication, external_api_integration, statistics_dashboard, task_automation] + optional [excel_import_export, report_generation, iot_device_integration, media_handling, search_filter] · coverage 57% · core 적합 25%

