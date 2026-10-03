# 공략 점수 v0.2 후보 (analysis_version = v3.3)

- 최종 확정 전 후보 공식입니다.
- v0.1은 이상치 제외 일반 외주 모드, feature repetition은 f1 8개 유형 결과를 결합했습니다.

## 1. 점수 공식

```text
opportunity_score_v0_2 = frequency*0.15 + budget_per_hour*0.25 + ai_ease*0.15 + reusability*0.15 + templateability*0.15 + learning*0.08 + market_value*0.07
templateability_score = core_coverage*0.30 + core_fit*0.25 + jaccard*0.20 + bundle_strength*0.15 + feature_repetition*0.10
```

| project_type | n(v0.1) | n(f1) | confidence | v0.1 | v0.2 | v0.1 순위 | v0.2 순위 | 순위 변화 | templateability | 추천 label |
|---|---:|---:|---|---:|---:|---:|---:|---:|---:|---|
| admin_backoffice | 8 | 8 | low | 54.27 | 57.70 | 7 | 6 | ▲1 | 62.90 | template_product |
| ai_service | 15 | 16 | medium | 46.42 | 46.05 | 8 | 8 | - | 37.06 | learning_bet |
| business_management | 37 | 37 | high | 80.66 | 76.03 | 1 | 1 | - | 43.87 | core_business |
| ecommerce | 18 | 18 | medium | 59.77 | 58.56 | 4 | 5 | ▼1 | 56.41 | template_product |
| platform_marketplace | 38 | 39 | high | 74.20 | 67.62 | 2 | 3 | ▼1 | 40.73 | selective_high_value |
| reservation | 9 | 9 | low | 69.37 | 69.48 | 3 | 2 | ▲1 | 58.63 | template_product |
| saas | 8 | 9 | low | 57.45 | 59.30 | 6 | 4 | ▲2 | 69.13 | template_product |
| website | 37 | 37 | high | 59.23 | 51.58 | 5 | 7 | ▼2 | 34.59 | cashflow |

## 2. templateability 구성

| project_type | core coverage | core fit | 평균 Jaccard | 최대 bundle support | feature repetition | core 수 | ≥70% 수 |
|---|---:|---:|---:|---:|---:|---:|---:|
| admin_backoffice | 70.48 | 75.00 | 32.65 | 62.50 | 71.01 | 7 | 4 |
| ai_service | 57.25 | 25.00 | 25.80 | 31.25 | 37.93 | 8 | 0 |
| business_management | 42.58 | 67.57 | 29.95 | 16.22 | 57.83 | 5 | 3 |
| ecommerce | 50.65 | 83.33 | 36.02 | 33.33 | 81.82 | 6 | 6 |
| platform_marketplace | 46.43 | 51.28 | 28.37 | 23.08 | 48.42 | 9 | 3 |
| reservation | 59.86 | 77.78 | 35.48 | 55.56 | 57.97 | 11 | 5 |
| saas | 55.62 | 100.00 | 38.87 | 77.78 | 80.00 | 5 | 5 |
| website | 45.80 | 40.54 | 23.40 | 13.51 | 40.09 | 3 | 1 |

## 3. 역할 분류 후보

| 역할 | 유형 | 판단 근거 |
|---|---|---|
| template_product | admin_backoffice(low), ecommerce(medium), reservation(low), saas(low) | templateability 55+·core fit 75+·평균 Jaccard 30+ / templateability 55+·core fit 75+·평균 Jaccard 30+ / templateability 55+·core fit 75+·평균 Jaccard 30+ / templateability 55+·core fit 75+·평균 Jaccard 30+ |
| learning_bet | ai_service(medium) | 학습가치 60+·템플릿화 점수 50 미만 |
| core_business | business_management(high) | v0.2 상위 3위·n 30+·core 6개 이하·템플릿화 40+ |
| selective_high_value | platform_marketplace(high) | 경제성/재사용성은 있으나 전체 템플릿화 또는 표본 근거가 제한적 |
| cashflow | website(high) | AI 용이성 70+·템플릿화 점수 50 미만 |

## 4. 해석 주의

- v0.2는 v0.1과 feature repetition f1을 결합한 후보 공식이며 최종 확정 점수가 아니다.
- v0.1은 이상치 제외 일반 외주 모드의 정규화 지표를 재사용했다.
- v0.1/v0.2 순위 변화는 두 점수 모두 결합 대상 8개 유형 집합 안에서 다시 매긴 순위다.
- feature repetition은 지정된 8개 project_type 결과를 사용한다. 유형별 opportunity n과 feature n은 이상치 처리 차이로 다를 수 있다.
- templateability의 feature_repetition은 feature 개수 자체가 아니라 고빈도 core 비율과 core 밀도의 조합이다.
- reservation, saas, admin_backoffice는 n<10이므로 추천 label도 낮은 confidence로 해석해야 한다.
