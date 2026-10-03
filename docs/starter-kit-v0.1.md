# 범용 외주 Starter Kit v0.1 설계 후보

- feature vocabulary: f1
- 기준 feature 프로젝트: 173건
- 아직 실제 코드는 구현하지 않는다.

## 반드시 포함

| 기능 | 전체 등장 | 40% 이상 유형 수 | 대상 유형 |
|---|---:|---:|---|
| admin_dashboard (80%, 8개 유형) | 138 | 8 | business_management, platform_marketplace, ecommerce, website, admin_backoffice, reservation, saas, ai_service |
| authentication (73%, 7개 유형) | 127 | 7 | business_management, platform_marketplace, ecommerce, admin_backoffice, reservation, saas, ai_service |
| user_management (49%, 5개 유형) | 85 | 5 | business_management, platform_marketplace, admin_backoffice, reservation, saas |
| role_permission (43%, 5개 유형) | 75 | 5 | business_management, platform_marketplace, admin_backoffice, reservation, saas |
| statistics_dashboard (49%, 5개 유형) | 84 | 5 | business_management, platform_marketplace, reservation, saas, ai_service |

## 선택 모듈

| 기능 | 전체 등장 | 40% 이상 유형 수 | 대상 유형 |
|---|---:|---:|---|
| file_upload (42%, 3개 유형) | 72 | 3 | business_management, platform_marketplace, ai_service |
| search_filter (40%, 4개 유형) | 69 | 4 | platform_marketplace, ecommerce, admin_backoffice, reservation |
| notification (38%, 3개 유형) | 65 | 3 | platform_marketplace, admin_backoffice, reservation |
| payment (31%, 3개 유형) | 54 | 3 | platform_marketplace, ecommerce, reservation |
| excel_import_export (28%, 4개 유형) | 49 | 4 | business_management, admin_backoffice, saas, ai_service |

## 유형별 확장

| 유형 | 확장 모듈 |
|---|---|
| business_management | excel_import_export, workflow, approval, task_automation, report_generation, external_api_integration |
| ecommerce | listing_catalog, cart_checkout, order_management, payment, search_filter, notification |
| platform_marketplace | buyer_seller_roles, matching, search_filter, payment, notification, settlement, board_community |
| website | landing_seo, cms_content, board_community, inquiry_support, media_handling |
| reservation | reservation, scheduling_calendar, payment, notification, settlement |
| saas | file_upload, excel_import_export, payment, external_api_integration, subscription |
| ai_service | ai_llm, ai_recognition, external_api_integration, file_upload, task_automation, rag_search |
| admin_backoffice | excel_import_export, search_filter, notification, legacy_migration, report_generation |

## 설계 원칙

- 반드시 포함 모듈은 로그인·관리자·권한·사용자·통계의 공통 운영 백본으로 한정한다.
- 결제·알림·엑셀·검색·파일은 어댑터/모듈로 분리한다.
- 유형별 확장은 core를 복제하지 않고 도메인 기능만 추가한다.
- multi-tenancy, ERP 규칙, AI 모델별 파이프라인은 공통 백본에 넣지 않는다.
