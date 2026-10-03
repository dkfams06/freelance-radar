# Taxonomy v3.3 동결

`analysis_version = v3.3` 을 분류 기준 버전으로 **동결**한다. 전체 분석(Batch)도 이 기준으로 실행한다.

## 동결 범위
- 분류 코드: `project_type`(18) · `engagement_type`(10) · `industry`(18) · `complexity_types`(10) · `reuse_level`(4) · `technology_assets`(29)
- 시스템 프롬프트 전문과 점수 기준(rubric)
- 코드로 강제: `packages/analysis/src/taxonomy-freeze.test.ts` (분류 코드 목록 + 프롬프트 sha256). 깨지면 변경된 것이다.

## 변경 규칙
- 20건 샘플 결과에 맞춰 taxonomy/프롬프트를 더 수정하지 않는다.
- 바꿔야 한다면 새 `analysis_version` 으로 올리고 명시적으로 결정한 뒤 freeze 테스트 값을 함께 갱신한다.
  (결과는 `(project_id, analysis_version)` 으로 저장되어 이전 버전을 덮어쓰지 않는다.)

## reuse_level 집계
- 원본 4단계(`high / medium / low / one_off`)는 그대로 저장한다.
- 통계에서는 보조로 3단계도 집계한다: `high`, `medium`, `low_reuse`(= `low` + `one_off`). `reuseGroup()` 참고.
- 근거: v3.3 holdout 에서 `low`/`one_off` 경계 일치가 낮았고(모델은 `one_off` 를 쓰지 않음), 오류는 대부분 한 단계 이내였다.
  (`docs/analyzer-v3.3-holdout-metrics.md`)

## 알려진 한계 (동결 시점의 holdout 20건 기준)
- project_type 80%, engagement_type 95%, reuse_level 65% (high↔one_off 같은 큰 오류 없음)
- 불일치는 `platform_marketplace` 경계(예약/모바일 앱), `low`/`one_off` 경계에 집중
- 따라서 reuse_level 단독 사용은 피하고, 점수화는 기술자산·기능 중복 등 다른 신호와 함께 본다.
