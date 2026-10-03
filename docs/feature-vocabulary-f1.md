# 표준 기능 vocabulary (f1)

프로젝트 간 요구사항 비교·반복률 계산용 표준 기능 목록. 코드: `packages/analysis/src/features.ts`.

## 원칙
- taxonomy v3.3(분류)와 독립. 분류 코드·프롬프트를 바꾸지 않는다.
- LLM 호출 없이 근거가 있는 기능만 넣는다.
  1. **분석값**: v3.3 `required_features` / `required_integrations` 코드를 별칭(정확 일치) → 코드 패턴 순서로 매핑
  2. **설명/제목**: 명시적 키워드만. 다음 줄은 제외: 우대·자격 요건·지원/제안 방법·필수 기술 목록·근무/계약/예산 섹션, 계약/대금/경험 언급, 부정 표현(필요하지 않음/없음/없이/제외)
- 같은 의미는 하나로 통합 (예: 푸시·문자·알림톡·메일 → `notification`, 결제 PG·간편결제·인앱결제 → `payment`).
- 비기능 코드는 매핑하지 않는다: `bug_fix_maintenance`, `infra_devops`, `security_hardening`, `responsive_ui`, `responsive_web`, `aws`, `gcp`, `firebase`, `supabase`, `blockchain`, `game_logic`
- 기능별 근거(분석값 코드 / 일치 문구)를 `evidence` 로 저장한다. 매핑되지 않은 분석값 코드는 리포트에 보강 후보로 집계된다.
- vocabulary 를 바꾸면 `FEATURE_VERSION` 을 올린다 (`project_features` 는 버전별로 저장되어 덮어쓰지 않음).

## 기능 목록 (51개)

| 그룹 | 코드 | 의미 | 분석값 별칭 |
|---|---|---|---|
| 계정 | `authentication` | 회원가입/로그인 | authentication, login, signup, sign_up, membership, user_auth |
| 계정 | `social_login` | 소셜 로그인 | social_login, kakao_login, naver_login, google_login, apple_login |
| 계정 | `identity_verification` | 본인인증 | identity_verification, identity_verification_service |
| 계정 | `user_management` | 회원/사용자 관리 | user_management, member_management, account_management |
| 계정 | `role_permission` | 역할/권한 | role_permission, rbac, permission, permission_management, access_control |
| 관리 | `admin_dashboard` | 관리자 페이지 | admin_dashboard, admin_page, admin, backoffice, admin_panel, admin_system |
| 관리 | `crud_data_management` | 데이터 등록·수정·관리(CRUD) | crud, data_management, record_management, data_entry |
| 콘텐츠/커뮤니티 | `cms_content` | 콘텐츠 관리(CMS) | cms, content_management, article_management, banner_management |
| 콘텐츠/커뮤니티 | `board_community` | 게시판/커뮤니티 | board_community, community, bulletin_board, notice_board, notice |
| 콘텐츠/커뮤니티 | `comments_reviews` | 리뷰/후기/댓글 | comments_reviews, review, reviews, rating |
| 콘텐츠/커뮤니티 | `search_filter` | 검색/필터 | search_filter, search, filtering, advanced_search |
| 커머스 | `listing_catalog` | 상품/매물 목록·상세 | product_catalog, listing, catalog, product_management, listing_management |
| 커머스 | `cart_checkout` | 장바구니/주문서 | cart_checkout, cart, checkout |
| 커머스 | `order_management` | 주문/발주 관리 | order_management, order, order_processing, purchase_order |
| 커머스 | `payment` | 결제 | payment, payment_gateway, easy_pay, card_payment, in_app_purchase, apple_in_app_purchase, pg_integration |
| 커머스 | `subscription` | 정기결제/구독 | subscription_billing, subscription, recurring_billing, membership_billing |
| 커머스 | `settlement` | 정산 | settlement, payout, commission |
| 커머스 | `point_coupon` | 포인트/쿠폰 | point_coupon, coupon, point, mileage, reward_points |
| 예약/일정 | `reservation` | 예약 | reservation, booking, reservation_management |
| 예약/일정 | `scheduling_calendar` | 일정/캘린더 | scheduling_calendar, calendar, schedule, scheduling, schedule_management |
| 플랫폼 | `buyer_seller_roles` | 판매자/공급자 등 복수 회원 유형 | buyer_seller_roles, multi_vendor, seller_management, partner_portal, vendor_management, expert_profile |
| 플랫폼 | `matching` | 매칭/중개 | matching, brokerage, match_making |
| 커뮤니케이션 | `notification` | 알림 (푸시/문자/알림톡/메일) | notification_push, notification_sms_kakao, notification_email, push_service, sms_gateway, email_service, kakao_alimtalk, notification, push_notification |
| 커뮤니케이션 | `chat_messaging` | 채팅/메시지 | chat_messaging, chat, messaging, realtime_chat, direct_message |
| 커뮤니케이션 | `inquiry_support` | 문의/고객지원 | inquiry_form, customer_support, qna, faq, contact_form, inquiry |
| 데이터/자동화 | `file_upload` | 파일 업로드/첨부 | file_upload, file_management, attachment, document_upload, image_upload |
| 데이터/자동화 | `media_handling` | 이미지/영상 처리·재생 | media_processing, video_streaming, image_processing, video_player, live_streaming |
| 데이터/자동화 | `excel_import_export` | 엑셀/CSV 입출력 | data_export, excel_import_export, excel, csv_export, excel_upload, data_import |
| 데이터/자동화 | `statistics_dashboard` | 통계/대시보드 | statistics_reporting, statistics, dashboard, analytics, analytics_dashboard, sales_report |
| 데이터/자동화 | `report_generation` | 문서/보고서 생성·출력 | document_generation, report_generation, pdf_generation, printing, invoice_generation |
| 업무 | `workflow` | 업무 흐름/상태 관리 | workflow, approval_workflow, process_management, status_tracking, task_management, work_order |
| 업무 | `approval` | 결재/승인 | approval_workflow, approval, e_approval |
| 업무 | `e_signature` | 전자서명/전자계약 | e_signature, electronic_contract, e_contract |
| 업무 | `inventory_management` | 재고/입출고 | inventory_management, inventory, stock_management, warehouse_management |
| 업무 | `crm_customer` | 고객관리(CRM) | crm, customer_management, lead_management |
| 업무 | `hr_attendance` | 인사/근태/급여 | hr_attendance, attendance, payroll, hr_management |
| 업무 | `accounting` | 회계/세금계산서 | accounting, tax_invoice, accounting_software, invoice |
| 연동 | `map_location` | 지도/위치 | map_location, kakao_map, naver_map, google_maps, gps, geolocation |
| 연동 | `external_api_integration` | 외부 API/시스템 연동 | public_api, external_api, erp_external, marketplace_api, public_data_api, shopping_platform, logistics_api, sns_api, youtube_api, api_integration, google_workspace, slack, notion |
| 연동 | `multilingual` | 다국어 | multilingual, i18n, localization, translation |
| 연동 | `iot_device_integration` | 장비/IoT 연동 | iot_device_control, hardware_integration, hardware_device, bluetooth, printer_integration |
| 데이터/자동화 | `web_crawling` | 크롤링/데이터 수집 | crawling_scraping, crawler, scraping, web_crawling, data_collection |
| 데이터/자동화 | `task_automation` | 업무 자동화/배치 | rpa_automation, workflow_automation, batch_job, scheduler, automation, data_pipeline, auto_posting |
| 데이터/자동화 | `legacy_migration` | 데이터 이관/마이그레이션 | legacy_migration, data_migration, migration |
| AI | `ai_llm` | LLM/생성형 AI | llm_generation, llm_chatbot, openai, anthropic, google_ai, ai_chatbot, chatbot, llm |
| AI | `rag_search` | RAG/벡터 검색 | rag_search, vector_search, embedding, rag |
| AI | `ai_recognition` | AI 인식 (영상/OCR/음성) | computer_vision, speech_processing, cloud_ai_vision_ocr, ocr, object_detection, stt |
| AI | `recommendation` | 추천 | recommendation, recommender |
| 콘텐츠/커뮤니티 | `landing_seo` | 랜딩/SEO | landing_page, seo |
| 플랫폼 | `app_store_release` | 앱 스토어 배포 | app_store_release, app_release |
| 플랫폼 | `realtime_sync` | 실시간 동기화/모니터링 | realtime_sync, realtime, realtime_monitoring, websocket |
