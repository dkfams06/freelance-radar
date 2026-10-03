# v3.3 holdout 20건: 수동 기준 vs Sonnet 지표

`node scripts/holdout-metrics.cjs docs/analyzer-v3.3-holdout-manual-20.json docs/analyzer-v3.3-holdout-sonnet-20.json` 출력

```
== 분류 일치율 (수동 vs 모델)
project_type       16/20 (80%)
engagement_type    19/20 (95%)
industry           18/20 (90%)
reuse_level        13/20 (65%)
complexity_types   평균 Jaccard 0.72
technology_assets  평균 Jaccard 0.63
complexity 평균 개수: 수동 1.45 | 모델 1.95
uncertain_fields: 수동 2 건 | 모델 freemoa:48251:project_type, wishket:157967:project_type, wishket:153015:project_type

== reuse_level confusion matrix (행=수동, 열=모델)
manual \ sonnet       high  medium     low one_off   합계
high                     0       2       0       0      2
medium                   0       5       0       0      5
low                      1       2       8       0     11
one_off                  0       0       2       0      2
모델 합계                    1       9      10       0

reuse 오류 7건: 한 단계 6, 두 단계 1, 세 단계(high↔one_off) 0
   freemoa:47955    one_off  → low      | (상주) 커스텀 Android 단말 및 기본 탑재 앱 
   freemoa:48311    one_off  → low      | [상주] PLM/BOM 고도화 개발 (Java/Vue3
   freemoa:47704    high     → medium   | 크리에이터 주요 지표 분석 시각화 제공 플랫폼 웹 개발
   wishket:155100   low      → high     | WordPress 기반 글로벌 B2B 홈페이지 신규 구
   wishket:156240   high     → medium   | Supabase 기반 사용자 게시판 및 관리자/광고주 
   wishket:150086   low      → medium   | 쿠팡 API 연동 제품 판매량 및 재고 추적 자동화 (
   wishket:149922   low      → medium   | Sharetribe 기반 숙박 예약 플랫폼 결제/정산 
low/one_off 를 묶었을 때("재사용 낮음") 일치: 15/20 (75%)

== project_type / engagement_type 불일치
   project_type     freemoa:48251    reservation → platform_marketplace (모델 애매 표시)
   project_type     freemoa:47969    crawler_data_collection → automation_rpa 
   project_type     wishket:149922   reservation → platform_marketplace 
   project_type     wishket:153015   mobile_app → platform_marketplace (모델 애매 표시)
   engagement_type  freemoa:48169    migration → renewal 

== 작업시간/예산 (모델 hours min-max, 수동)
┌─────────┬──────────────────┬─────────────────────────────────┬─────────────┬─────────────┐
│ (index) │ k                │ budget                          │ manual      │ model       │
├─────────┼──────────────────┼─────────────────────────────────┼─────────────┼─────────────┤
│ 0       │ 'freemoa:48251'  │ '50,000,000원 ~ 100,000,000원'  │ '700-1300'  │ '700-1200'  │
│ 1       │ 'freemoa:48011'  │ '5,000,000원 ~ 7,000,000원'     │ '40-120'    │ '60-130'    │
│ 2       │ 'freemoa:47955'  │ '4,000,000원 ~ 5,000,000원'     │ '150-180'   │ '150-180'   │
│ 3       │ 'freemoa:48311'  │ '5,000,000원 ~ 10,000,000원'    │ '600-800'   │ '600-900'   │
│ 4       │ 'freemoa:47704'  │ '10,000,000원 ~ 20,000,000원'   │ '250-450'   │ '280-450'   │
│ 5       │ 'freemoa:47969'  │ '300,000원 ~ 800,000원'         │ '6-20'      │ '6-16'      │
│ 6       │ 'freemoa:48169'  │ '100,000,000원 ~ 200,000,000원' │ '1500-2800' │ '1400-2400' │
│ 7       │ 'wishket:158096' │ '15,000,000원'                  │ '150-330'   │ '220-360'   │
│ 8       │ 'wishket:155100' │ '12,000,000원'                  │ '60-130'    │ '120-200'   │
│ 9       │ 'wishket:156240' │ '15,000,000원'                  │ '200-380'   │ '280-420'   │
│ 10      │ 'wishket:158628' │ '6,000,000원/월'                │ '1200-1500' │ '900-1300'  │
│ 11      │ 'wishket:154821' │ '5,500,000원/월'                │ '650-800'   │ '700-850'   │
│ 12      │ 'wishket:153028' │ '40,000,000원'                  │ '450-900'   │ '400-650'   │
│ 13      │ 'wishket:150086' │ '1,000,000원'                   │ '12-30'     │ '16-32'     │
│ 14      │ 'wishket:157477' │ '5,000,000원'                   │ '350-650'   │ '220-400'   │
│ 15      │ 'wishket:149922' │ '5,000,000원'                   │ '80-180'    │ '130-230'   │
│ 16      │ 'wishket:152942' │ '3,000,000원/월'                │ '900-1100'  │ '900-1100'  │
│ 17      │ 'wishket:157967' │ '3,000,000원/월'                │ '450-560'   │ '400-520'   │
│ 18      │ 'wishket:150884' │ '6,000,000원'                   │ '80-180'    │ '100-180'   │
│ 19      │ 'wishket:153015' │ '20,000,000원'                  │ '400-900'   │ '280-480'   │
└─────────┴──────────────────┴─────────────────────────────────┴─────────────┴─────────────┘
평균 hours min/max: 수동 411 666 | 모델 393 600
```
