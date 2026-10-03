# 공략 점수 v0.1 후보 분석 (analysis_version = v3.3)

- 생성: 2026-10-03T18:54:26.877Z
- 기본 표시: **이상치 제외 + 균형형(v0.1)**
- 최종 공식 확정이 아닌 후보 공식 및 민감도 분석입니다.

## 1. 데이터 품질 분리

| 구분 | 건수 | 처리 |
|---|---:|---|
| 정상 분석 | 458 | 점수 계산 대상에 포함 |
| 시간 이상치 | 37 | 삭제하지 않고 hours_outlier flag |
| 최종 실패 | 5 | 점수 계산에서 제외 |

- 이상치 기준: estimated_hours midpoint의 IQR 1.5 fence (Q1 155, 중앙 365, Q3 673, 하한 -621, 상한 1449)
- 분석 성공 495건 + 최종 실패 5건 = 표본 위치 500건
- 이상치 세그먼트: 일반 외주 3건 / staffing 34건

### 이상치 flag 목록

| project_id | project_type | segment | midpoint hours | flag |
|---|---|---|---:|---|
| 00d0eed7-d99b-4213-9b5e-dee9b4e8d53c | qa_testing | staffing | 1750 | hours_outlier |
| 0197a5d8-e335-430d-b3e6-8bb27a7e83db | business_management | staffing | 1750 | hours_outlier |
| 06a77e3c-927b-4fd0-99a4-d6eb1d5519dd | saas | staffing | 1650 | hours_outlier |
| 070b0a31-6a0d-4237-a83f-7281825f46b8 | business_management | staffing | 2500 | hours_outlier |
| 1077812d-6811-4654-97ea-19fe82343845 | business_management | staffing | 2100 | hours_outlier |
| 17b22bab-670b-43b8-b4a7-c415f7f481b6 | iot_device | staffing | 2000 | hours_outlier |
| 24dae753-d2e7-4a53-b22c-c9fd208b917a | business_management | staffing | 2650 | hours_outlier |
| 3c04514f-37fd-4102-b8fe-bc9888e949be | fintech_payment | staffing | 1500 | hours_outlier |
| 43602028-71e9-4378-85b1-fbb655524698 | ai_service | staffing | 2300 | hours_outlier |
| 4699b832-a84b-4626-ab3d-5b77ae7fe997 | website | staffing | 1500 | hours_outlier |
| 4fe9da41-b255-416d-966e-858d0c1c06d9 | business_management | staffing | 2650 | hours_outlier |
| 53ceb8ec-852d-4cb8-a2f5-1d76ac10711d | ai_service | non_staffing | 2900 | hours_outlier |
| 5523de1f-c8cf-44d0-8b24-fa7997e6b5a0 | saas | staffing | 1850 | hours_outlier |
| 598cdc79-9ef7-4eac-bc44-768439ef17cc | business_management | staffing | 1750 | hours_outlier |
| 5c6caff7-8bd1-4ea7-97e0-ee3184090c9b | business_management | staffing | 1600 | hours_outlier |
| 6152b1c3-b9fe-4d7c-baeb-110c5b83f132 | business_management | staffing | 1950 | hours_outlier |
| 67c92164-3e27-49ee-a3f3-b80ed3c2540c | enterprise_infra | staffing | 1950 | hours_outlier |
| 6e5bbea7-8bab-476e-b51d-43aeb628d7f2 | enterprise_infra | staffing | 1950 | hours_outlier |
| 85d50a02-f9c1-4b7a-b590-a1e0c9d2cf40 | business_management | staffing | 1950 | hours_outlier |
| 868bdd88-79da-485e-b06b-5bec3d22493e | mobile_app | staffing | 1450 | hours_outlier |
| 8cd5764b-708b-47c8-9ebd-78ede722b64b | platform_marketplace | non_staffing | 1800 | hours_outlier |
| 8fbe3fc2-1fe2-44e0-97a6-e67f2faf2d6c | admin_backoffice | staffing | 1900 | hours_outlier |
| 95960476-f651-44c7-a20b-6ca58597132d | other | staffing | 1650 | hours_outlier |
| b0770aca-3ab4-46d0-8bcc-8b8578c409df | saas | non_staffing | 1700 | hours_outlier |
| c67d9f8d-2bbe-48a0-b9c4-4756d671ae73 | business_management | staffing | 1800 | hours_outlier |
| c85447bb-b2a7-4b36-ae78-8586e7d76c01 | ecommerce | staffing | 1650 | hours_outlier |
| cef0a1d0-5397-4a2c-98a5-2f611ebf9b8c | other | staffing | 1800 | hours_outlier |
| d309be9b-13f5-4b03-bf7f-21e7454b34c9 | business_management | staffing | 1900 | hours_outlier |
| d608e358-10b4-4bf5-8bc4-a67260126e80 | enterprise_infra | staffing | 1850 | hours_outlier |
| e13c6c38-1d25-472c-aca6-c8efec2f8e4d | fintech_payment | staffing | 1800 | hours_outlier |
| e1608376-3a15-42a0-9d22-7a48e340e8ac | fintech_payment | staffing | 1450 | hours_outlier |
| e228aad5-8057-4e00-a9af-b01927da0ed6 | saas | staffing | 1700 | hours_outlier |
| ecc31b7b-2824-49f8-8cba-dea69f05a288 | mobile_app | staffing | 1500 | hours_outlier |
| f7c6d94c-ce4f-4150-935a-6b0cee398b5e | business_management | staffing | 1750 | hours_outlier |
| fce2448d-4b4a-4393-9464-74951e369ef6 | other | staffing | 1700 | hours_outlier |
| fe3ca4b7-b197-47cd-8282-c276205c03bf | iot_device | staffing | 1450 | hours_outlier |
| ff14d98d-f381-4973-a143-5cae290c50b4 | saas | staffing | 2800 | hours_outlier |

- 최종 실패 project_id: 058332df-665d-4bdd-9149-1a0d20619a2a, 6494b2cf-6890-4006-9d06-d4e47860b395, 70f17e20-1768-4b56-8715-84e6dea7df1d, c6dede62-d590-4650-8549-ad7728883239, fcff42a9-bf9c-48e9-9f02-0ba743218b66

## 2. 후보 공식

```text
opportunity_score = frequency_score * 0.20 + budget_per_hour_score * 0.25 + ai_ease_score * 0.20 + reusability_score * 0.15 + learning_score * 0.10 + market_value_score * 0.10
```

| 지표 | 배점 | 정규화 방향 |
|---|---:|---|
| 시장 빈도 | 20 | 높을수록 좋음 |
| 시간당 예산 | 25 | 높을수록 좋음 |
| AI 구현 용이성 | 20 | 높을수록 좋음 |
| 재사용성 | 15 | 높을수록 좋음 |
| 학습 가치 | 10 | 높을수록 좋음 |
| 시장 활용성 | 10 | 높을수록 좋음 |

정규화는 각 모드의 project_type 지표 분포에서 p10 이하=0, p90 이상=100, 사이는 선형 변환입니다. 중앙 견적은 점수에 넣지 않습니다.

## 3. 일반 외주 · 이상치 제외 (기본 후보 점수)

- 분석 n: **278**

| project_type | n | confidence | 월평균 공고 | 중앙 견적 | 시간당 예산 중앙 | AI 용이성 | 재사용성 | 학습가치 | 시장가치 | opportunity_score |
|---|---:|---|---:|---:|---:|---:|---:|---:|---:|---:|
| platform_marketplace | 38 | high | 3.2 | 2,000만 | 5만 | 55.2 | 59.2 | 54.3 | 65.3 | 74.20 |
| business_management | 37 | high | 3.1 | 2,000만 | 8만 | 57.7 | 50.5 | 43.2 | 56.2 | 80.66 |
| website | 37 | high | 3.1 | 300만 | 4만 | 79.0 | 48.4 | 22.7 | 64.6 | 59.23 |
| iot_device | 30 | high | 2.5 | 1,000만 | 5만 | 33.9 | 30.8 | 47.0 | 35.6 | 28.51 |
| mobile_app | 28 | medium | 2.3 | 1,000만 | 5만 | 55.0 | 44.3 | 47.5 | 57.1 | 51.80 |
| ecommerce | 18 | medium | 1.3 | 900만 | 5만 | 60.1 | 55.4 | 44.7 | 67.3 | 59.77 |
| ai_service | 15 | medium | 1.3 | 1,500만 | 6만 | 42.0 | 48.3 | 67.9 | 54.1 | 46.42 |
| data_dashboard | 13 | low | 1.1 | 500만 | 4만 | 56.2 | 49.0 | 47.8 | 54.8 | 40.67 |
| other | 12 | low | 1.0 | 500만 | 5만 | 68.9 | 20.4 | 21.2 | 32.5 | 30.90 |
| automation_rpa | 10 | low | 0.8 | 350만 | 4만 | 61.4 | 45.5 | 40.5 | 53.2 | 37.01 |
| reservation | 9 | low | 0.8 | 3,000만 | 7만 | 55.6 | 67.3 | 55.6 | 71.9 | 69.37 |
| admin_backoffice | 8 | low | 0.7 | 1,000만 | 7만 | 57.0 | 44.4 | 36.3 | 55.0 | 54.27 |
| saas | 8 | low | 0.7 | 1,650만 | 6만 | 67.0 | 55.0 | 40.6 | 58.8 | 57.45 |
| enterprise_infra | 6 | low | 0.5 | 1,250만 | 5만 | 32.0 | 33.3 | 52.5 | 40.8 | 20.79 |
| fintech_payment | 5 | low | 0.4 | 700만 | 5만 | 48.0 | 48.0 | 52.0 | 48.0 | 34.84 |
| crawler_data_collection | 2 | insufficient | 0.2 | 400만 | 4만 | 58.5 | 52.5 | 47.5 | 60.0 | 41.20 |
| media_processing | 2 | insufficient | 0.2 | 2,400만 | 8만 | 50.0 | 40.0 | 52.5 | 50.0 | 50.59 |

### 정규화 p10 / p90

| 지표 | p10 | p90 |
|---|---:|---:|
| frequency | 0.32 | 3.08 |
| budget_per_hour | 42476.19 | 74036.23 |
| ai_ease | 38.77 | 67.77 |
| reusability | 32.33 | 56.91 |
| learning | 30.82 | 54.78 |
| market_value | 38.73 | 66.11 |

### 공략 점수 높은 유형 TOP 10

| 순위 | project_type | 값 | n | confidence | 이상치 n |
|---:|---|---:|---:|---|---:|
| 1 | business_management | 80.66 | 37 | high | 0 |
| 2 | platform_marketplace | 74.20 | 38 | high | 0 |
| 3 | reservation | 69.37 | 9 | low | 0 |
| 4 | ecommerce | 59.77 | 18 | medium | 0 |
| 5 | website | 59.23 | 37 | high | 0 |
| 6 | saas | 57.45 | 8 | low | 0 |
| 7 | admin_backoffice | 54.27 | 8 | low | 0 |
| 8 | mobile_app | 51.80 | 28 | medium | 0 |
| 9 | media_processing | 50.59 | 2 | insufficient | 0 |
| 10 | ai_service | 46.42 | 15 | medium | 0 |

### 시간당 예산 높은 유형 TOP 10

| 순위 | project_type | 값 | n | confidence | 이상치 n |
|---:|---|---:|---:|---|---:|
| 1 | media_processing | 82758.62 | 2 | insufficient | 0 |
| 2 | business_management | 76666.67 | 37 | high | 0 |
| 3 | admin_backoffice | 72282.61 | 8 | low | 0 |
| 4 | reservation | 67293.23 | 9 | low | 0 |
| 5 | ai_service | 57692.31 | 15 | medium | 0 |
| 6 | saas | 55357.14 | 8 | low | 0 |
| 7 | enterprise_infra | 53881.28 | 6 | low | 0 |
| 8 | platform_marketplace | 53101.50 | 38 | high | 0 |
| 9 | ecommerce | 52397.26 | 18 | medium | 0 |
| 10 | iot_device | 50000.00 | 30 | high | 0 |

### AI 용이성 높은 유형 TOP 10

| 순위 | project_type | 값 | n | confidence | 이상치 n |
|---:|---|---:|---:|---|---:|
| 1 | website | 78.97 | 37 | high | 0 |
| 2 | other | 68.92 | 12 | low | 0 |
| 3 | saas | 67.00 | 8 | low | 0 |
| 4 | automation_rpa | 61.40 | 10 | low | 0 |
| 5 | ecommerce | 60.06 | 18 | medium | 0 |
| 6 | crawler_data_collection | 58.50 | 2 | insufficient | 0 |
| 7 | business_management | 57.68 | 37 | high | 0 |
| 8 | admin_backoffice | 57.00 | 8 | low | 0 |
| 9 | data_dashboard | 56.15 | 13 | low | 0 |
| 10 | reservation | 55.56 | 9 | low | 0 |

### 재사용성 높은 유형 TOP 10

| 순위 | project_type | 값 | n | confidence | 이상치 n |
|---:|---|---:|---:|---|---:|
| 1 | reservation | 67.33 | 9 | low | 0 |
| 2 | platform_marketplace | 59.18 | 38 | high | 0 |
| 3 | ecommerce | 55.39 | 18 | medium | 0 |
| 4 | saas | 55.00 | 8 | low | 0 |
| 5 | crawler_data_collection | 52.50 | 2 | insufficient | 0 |
| 6 | business_management | 50.49 | 37 | high | 0 |
| 7 | data_dashboard | 49.00 | 13 | low | 0 |
| 8 | website | 48.35 | 37 | high | 0 |
| 9 | ai_service | 48.33 | 15 | medium | 0 |
| 10 | fintech_payment | 48.00 | 5 | low | 0 |

### 학습가치 높은 유형 TOP 10

| 순위 | project_type | 값 | n | confidence | 이상치 n |
|---:|---|---:|---:|---|---:|
| 1 | ai_service | 67.87 | 15 | medium | 0 |
| 2 | reservation | 55.56 | 9 | low | 0 |
| 3 | platform_marketplace | 54.26 | 38 | high | 0 |
| 4 | enterprise_infra | 52.50 | 6 | low | 0 |
| 5 | media_processing | 52.50 | 2 | insufficient | 0 |
| 6 | fintech_payment | 52.00 | 5 | low | 0 |
| 7 | data_dashboard | 47.85 | 13 | low | 0 |
| 8 | crawler_data_collection | 47.50 | 2 | insufficient | 0 |
| 9 | mobile_app | 47.46 | 28 | medium | 0 |
| 10 | iot_device | 47.03 | 30 | high | 0 |

### 민감도 분석 · 세 시나리오 TOP 10

| 시나리오 | TOP 10 |
|---|---|
| 수익 중심 | business_management(83.15, n=37), reservation(69.34, n=9), platform_marketplace(65.65, n=38), admin_backoffice(62.12, n=8), saas(60.06, n=8), ecommerce(56.84, n=18), media_processing(55.94, n=2), website(54.50, n=37), mobile_app(46.13, n=28), ai_service(42.30, n=15) |
| 균형형(v0.1) | business_management(80.66, n=37), platform_marketplace(74.20, n=38), reservation(69.37, n=9), ecommerce(59.77, n=18), website(59.23, n=37), saas(57.45, n=8), admin_backoffice(54.27, n=8), mobile_app(51.80, n=28), media_processing(50.59, n=2), ai_service(46.42, n=15) |
| 기술자산 중심 | platform_marketplace(82.75, n=38), reservation(77.83, n=9), business_management(75.56, n=37), ecommerce(68.40, n=18), saas(62.79, n=8), website(60.47, n=37), mobile_app(55.06, n=28), ai_service(53.68, n=15), crawler_data_collection(53.15, n=2), admin_backoffice(50.06, n=8) |

- 세 시나리오 TOP 10 교집합: **platform_marketplace, business_management, website, mobile_app, ecommerce, ai_service, reservation, admin_backoffice, saas**

### staffing · 이상치 제외 (점수 미산출)

| project_type | n | confidence | 이상치 n | 월평균 공고 | 중앙 견적 | 시간당 예산 중앙 | AI 용이성 | 재사용성 | 학습가치 | 시장가치 |
|---|---:|---|---:|---:|---:|---:|---:|---:|---:|---:|
| business_management | 45 | high | 0 | 3.8 | 600만 | 1만 | 48.7 | 30.2 | 36.9 | 49.9 |
| ai_service | 30 | high | 0 | 2.4 | 600만 | 1만 | 47.2 | 43.5 | 62.6 | 64.1 |
| other | 19 | medium | 0 | 1.6 | 500만 | 1만 | 69.9 | 22.4 | 22.7 | 42.4 |
| enterprise_infra | 18 | medium | 0 | 1.5 | 700만 | 1만 | 39.8 | 27.2 | 43.6 | 43.9 |
| data_dashboard | 12 | low | 0 | 1.0 | 690만 | 1만 | 49.4 | 30.0 | 43.8 | 46.7 |
| saas | 9 | low | 0 | 0.8 | 500만 | 1만 | 61.9 | 39.4 | 47.8 | 58.3 |
| platform_marketplace | 8 | low | 0 | 0.7 | 525만 | 1만 | 70.6 | 37.5 | 33.8 | 58.8 |
| website | 8 | low | 0 | 0.7 | 500만 | 1만 | 80.1 | 28.1 | 22.8 | 46.9 |
| iot_device | 7 | low | 0 | 0.6 | 550만 | 1만 | 30.0 | 20.3 | 38.6 | 28.6 |
| mobile_app | 6 | low | 0 | 0.5 | 450만 | 1만 | 65.2 | 40.0 | 42.5 | 56.2 |
| admin_backoffice | 5 | low | 0 | 0.4 | 665만 | 1만 | 62.0 | 40.0 | 35.0 | 55.0 |
| qa_testing | 5 | low | 0 | 0.4 | 735만 | 1만 | 62.0 | 25.0 | 34.0 | 46.0 |
| ecommerce | 3 | insufficient | 0 | 0.3 | 700만 | 3만 | 68.3 | 30.0 | 31.7 | 46.7 |
| fintech_payment | 3 | insufficient | 0 | 0.3 | 500만 | 1만 | 37.0 | 31.7 | 45.0 | 48.3 |
| automation_rpa | 1 | insufficient | 0 | 0.1 | 500만 | 4만 | 70.0 | 35.0 | 30.0 | 45.0 |
| media_processing | 1 | insufficient | 0 | 0.1 | 400만 | 3만 | 38.0 | 50.0 | 70.0 | 35.0 |

## 4. 일반 외주 · 이상치 포함 (민감도 비교)

- 분석 n: **281**

| project_type | n | confidence | 월평균 공고 | 중앙 견적 | 시간당 예산 중앙 | AI 용이성 | 재사용성 | 학습가치 | 시장가치 | opportunity_score |
|---|---:|---|---:|---:|---:|---:|---:|---:|---:|---:|
| platform_marketplace | 39 | high | 3.3 | 2,000만 | 5만 | 54.9 | 59.1 | 54.4 | 65.2 | 75.59 |
| business_management | 37 | high | 3.1 | 2,000만 | 8만 | 57.7 | 50.5 | 43.2 | 56.2 | 81.87 |
| website | 37 | high | 3.1 | 300만 | 4만 | 79.0 | 48.4 | 22.7 | 64.6 | 59.18 |
| iot_device | 30 | high | 2.5 | 1,000만 | 5만 | 33.9 | 30.8 | 47.0 | 35.6 | 28.49 |
| mobile_app | 28 | medium | 2.3 | 1,000만 | 5만 | 55.0 | 44.3 | 47.5 | 57.1 | 52.94 |
| ecommerce | 18 | medium | 1.3 | 900만 | 5만 | 60.1 | 55.4 | 44.7 | 67.3 | 61.03 |
| ai_service | 16 | medium | 1.3 | 1,600만 | 6만 | 40.8 | 48.1 | 68.6 | 54.5 | 49.78 |
| data_dashboard | 13 | low | 1.1 | 500만 | 4만 | 56.2 | 49.0 | 47.8 | 54.8 | 41.82 |
| other | 12 | low | 1.0 | 500만 | 5만 | 68.9 | 20.4 | 21.2 | 32.5 | 30.90 |
| automation_rpa | 10 | low | 0.8 | 350만 | 4만 | 61.4 | 45.5 | 40.5 | 53.2 | 38.40 |
| reservation | 9 | low | 0.8 | 3,000만 | 7만 | 55.6 | 67.3 | 55.6 | 71.9 | 70.58 |
| saas | 9 | low | 0.8 | 1,800만 | 6만 | 63.1 | 55.8 | 44.1 | 58.3 | 59.97 |
| admin_backoffice | 8 | low | 0.7 | 1,000만 | 7만 | 57.0 | 44.4 | 36.3 | 55.0 | 55.50 |
| enterprise_infra | 6 | low | 0.5 | 1,250만 | 5만 | 32.0 | 33.3 | 52.5 | 40.8 | 20.75 |
| fintech_payment | 5 | low | 0.4 | 700만 | 5만 | 48.0 | 48.0 | 52.0 | 48.0 | 35.66 |
| crawler_data_collection | 2 | insufficient | 0.2 | 400만 | 4만 | 58.5 | 52.5 | 47.5 | 60.0 | 42.43 |
| media_processing | 2 | insufficient | 0.2 | 2,400만 | 8만 | 50.0 | 40.0 | 52.5 | 50.0 | 51.53 |

### staffing · 이상치 포함 (점수 미산출)

| project_type | n | confidence | 이상치 n | 월평균 공고 | 중앙 견적 | 시간당 예산 중앙 | AI 용이성 | 재사용성 | 학습가치 | 시장가치 |
|---|---:|---|---:|---:|---:|---:|---:|---:|---:|---:|
| business_management | 57 | high | 12 | 4.7 | 650만 | 1만 | 45.3 | 27.9 | 35.7 | 48.0 |
| ai_service | 31 | high | 1 | 2.5 | 600만 | 1만 | 46.9 | 43.4 | 62.9 | 64.4 |
| other | 22 | medium | 3 | 1.8 | 500만 | 1만 | 72.2 | 22.0 | 22.8 | 41.8 |
| enterprise_infra | 21 | medium | 3 | 1.8 | 675만 | 1만 | 40.1 | 26.2 | 42.1 | 44.0 |
| saas | 13 | low | 4 | 1.1 | 500만 | 1만 | 62.5 | 38.5 | 44.2 | 57.3 |
| data_dashboard | 12 | low | 0 | 1.0 | 690만 | 1만 | 49.4 | 30.0 | 43.8 | 46.7 |
| iot_device | 9 | low | 2 | 0.8 | 550만 | 1만 | 27.4 | 19.4 | 37.2 | 28.3 |
| website | 9 | low | 1 | 0.8 | 450만 | 1만 | 81.0 | 27.2 | 22.4 | 46.1 |
| mobile_app | 8 | low | 2 | 0.7 | 450만 | 1만 | 60.1 | 36.3 | 41.9 | 54.0 |
| platform_marketplace | 8 | low | 0 | 0.7 | 525만 | 1만 | 70.6 | 37.5 | 33.8 | 58.8 |
| admin_backoffice | 6 | low | 1 | 0.5 | 600만 | 1만 | 58.3 | 36.7 | 33.3 | 53.3 |
| fintech_payment | 6 | low | 3 | 0.5 | 600만 | 0만 | 33.7 | 26.7 | 45.8 | 45.0 |
| qa_testing | 6 | low | 1 | 0.5 | 720만 | 1만 | 63.3 | 23.3 | 31.7 | 43.3 |
| ecommerce | 4 | insufficient | 1 | 0.3 | 600만 | 1만 | 65.0 | 36.3 | 37.5 | 52.5 |
| automation_rpa | 1 | insufficient | 0 | 0.1 | 500만 | 4만 | 70.0 | 35.0 | 30.0 | 45.0 |
| media_processing | 1 | insufficient | 0 | 0.1 | 400만 | 3만 | 38.0 | 50.0 | 70.0 | 35.0 |

## 5. 이상치 포함/제외 왜곡 비교

| project_type | n 포함 | n 제외 | 이상치 n | score 포함 | score 제외 | Δ score(제외-포함) | 시간당 예산 포함→제외 | AI 용이성 포함→제외 | 재사용성 포함→제외 |
|---|---:|---:|---:|---:|---:|---:|---|---|---|
| platform_marketplace | 39 | 38 | 1 | 75.59 | 74.20 | -1.39 | 5만 → 5만 | 54.9 → 55.2 | 59.1 → 59.2 |
| business_management | 37 | 37 | 0 | 81.87 | 80.66 | -1.21 | 8만 → 8만 | 57.7 → 57.7 | 50.5 → 50.5 |
| website | 37 | 37 | 0 | 59.18 | 59.23 | 0.05 | 4만 → 4만 | 79.0 → 79.0 | 48.4 → 48.4 |
| iot_device | 30 | 30 | 0 | 28.49 | 28.51 | 0.02 | 5만 → 5만 | 33.9 → 33.9 | 30.8 → 30.8 |
| mobile_app | 28 | 28 | 0 | 52.94 | 51.80 | -1.14 | 5만 → 5만 | 55.0 → 55.0 | 44.3 → 44.3 |
| ecommerce | 18 | 18 | 0 | 61.03 | 59.77 | -1.26 | 5만 → 5만 | 60.1 → 60.1 | 55.4 → 55.4 |
| ai_service | 16 | 15 | 1 | 49.78 | 46.42 | -3.36 | 6만 → 6만 | 40.8 → 42.0 | 48.1 → 48.3 |
| data_dashboard | 13 | 13 | 0 | 41.82 | 40.67 | -1.15 | 4만 → 4만 | 56.2 → 56.2 | 49.0 → 49.0 |
| other | 12 | 12 | 0 | 30.90 | 30.90 | 0.00 | 5만 → 5만 | 68.9 → 68.9 | 20.4 → 20.4 |
| automation_rpa | 10 | 10 | 0 | 38.40 | 37.01 | -1.39 | 4만 → 4만 | 61.4 → 61.4 | 45.5 → 45.5 |
| reservation | 9 | 9 | 0 | 70.58 | 69.37 | -1.21 | 7만 → 7만 | 55.6 → 55.6 | 67.3 → 67.3 |
| saas | 9 | 8 | 1 | 59.97 | 57.45 | -2.52 | 6만 → 6만 | 63.1 → 67.0 | 55.8 → 55.0 |
| admin_backoffice | 8 | 8 | 0 | 55.50 | 54.27 | -1.23 | 7만 → 7만 | 57.0 → 57.0 | 44.4 → 44.4 |
| enterprise_infra | 6 | 6 | 0 | 20.75 | 20.79 | 0.04 | 5만 → 5만 | 32.0 → 32.0 | 33.3 → 33.3 |
| fintech_payment | 5 | 5 | 0 | 35.66 | 34.84 | -0.82 | 5만 → 5만 | 48.0 → 48.0 | 48.0 → 48.0 |
| crawler_data_collection | 2 | 2 | 0 | 42.43 | 41.20 | -1.23 | 4만 → 4만 | 58.5 → 58.5 | 52.5 → 52.5 |
| media_processing | 2 | 2 | 0 | 51.53 | 50.59 | -0.94 | 8만 → 8만 | 50.0 → 50.0 | 40.0 → 40.0 |

## 6. 해석 주의

- 이 문서는 최종 공식이 아니라 v0.1 후보 공식을 검토하기 위한 분석이다.
- 시간 이상치는 estimated_hours_min/max 중앙값의 전체 분석표본 IQR 1.5 fence로 flag만 붙였으며 삭제하지 않았다.
- 기본 후보 점수는 이상치 제외 모드로 표시하고, 이상치 포함 모드는 민감도 비교용으로 함께 유지한다.
- 각 모드의 p10/p90은 해당 모드의 project_type 지표 분포에서 다시 계산한다. p10 이하 0, p90 이상 100, 중간은 선형 변환한다.
- 중앙 견적은 점수에서 제외하고 참고지표로만 유지한다. 시간당 예산은 budget / estimated_hours midpoint이다.
- confidence는 n만으로 표시하며 점수에 표본수 감점을 적용하지 않는다.
- staffing은 일반 외주 점수와 섞지 않고 별도 표로 유지한다.
- 최종 실패 5건은 현재 점수 계산 대상이 아니다. 재분석 후 결과가 바뀔 수 있다.
- 전체 5,287건의 시장 대표 점수나 최종 공략 공식으로 확정하지 않는다.
