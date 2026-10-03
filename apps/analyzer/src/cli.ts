import { writeFileSync, mkdirSync, readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { parseArgs } from "node:util";
import { createServiceClient } from "@fr/db";
import {
  ANALYSIS_JSON_SCHEMA,
  ANALYSIS_VERSION,
  DEFAULT_OUTPUT_TOKENS,
  SYSTEM_PROMPT,
  approxTokens,
  buildProjectInput,
  buildUserMessage,
  computeDistribution,
  computeMarketReport,
  renderMarketReport,
  sampleValidationMarkdown,
  selectStratifiedSample,
  validateStratifiedSample,
  type StratifiedSampleFile,
  estimateCostUsd,
  estimateRun,
  renderDistribution,
  renderEstimate,
  validateAnalysis,
  type AnalysisSourceProject,
  type TokenUsage,
  computeOpportunityScoreReport,
  renderOpportunityScoreReport,
  FEATURE_VERSION,
  analysisSegment,
  computeRepetitionReport,
  extractFeatures,
  renderRepetitionReport,
  type FeatureRow,
  buildOpportunityV02Report,
  buildStarterKitReport,
  renderOpportunityV02Report,
  renderStarterKitReport,
  type FeatureV01Json,
  type OpportunityV01Json,
  HAIKU_VALIDATION_ANALYSIS_VERSION,
  HAIKU_VALIDATION_SAMPLE_SCHEMA,
  selectHaikuValidationSample,
  validateHaikuValidationSample,
  renderHaikuValidationSelection,
  buildHaikuValidationReport,
  renderHaikuValidationReport,
  type HaikuValidationSampleFile,
  type HaikuValidationSource,
  type HaikuValidationRunStats,
} from "@fr/analysis";
import { LlmClient, llmBackend, loadLlmConfig, type SyncLlm } from "./llm";
import { ClaudeCliClient } from "./llm-cli";
import { runSample, type SampleRunProgress } from "./sample-runner";

const CLI_BACKEND_NOTE =
  "backend=claude-cli (claude -p, Claude 구독제). 비용은 API 단가 환산 추정치이며 실제 청구되지 않음 (구독 사용량 한도에 반영)";

/** 동기 분석용 클라이언트: ANALYZER_BACKEND=claude-cli 면 구독제 claude -p, 아니면 Messages API */
function createSyncLlm(): SyncLlm {
  const cfg = loadLlmConfig();
  return llmBackend() === "claude-cli" ? new ClaudeCliClient(cfg) : new LlmClient(cfg);
}

/** Batch API 는 API 키 경로에서만 가능 */
function createBatchLlm(): LlmClient {
  if (llmBackend() === "claude-cli") throw new Error("Batch 는 ANALYZER_BACKEND=claude-cli 에서 지원하지 않습니다 (API 키 필요)");
  return new LlmClient(loadLlmConfig());
}
import { OUT_DIR, readResults, renderComparison, summarizeUsage, writeResults, type ResultItem, type ResultsFile } from "./results";
import { analyzeProjectsSync, toItemProject } from "./runner";
import { AnalyzerStore } from "./store";

const USAGE = `
freelance-radar analyzer (${ANALYSIS_VERSION})

사용법: pnpm analyzer <command> [options]

commands:
  sample          플랫폼별 최신 프로젝트 n 건을 동기 분석 → DB 저장 + 리포트 (기본 wishket 10, freemoa 10)
  sample-select    v3.3 미분석 전체에서 고정 seed 층화 시장 표본을 선정·검증
  haiku-validate-select  기존 Sonnet v3.3 성공 분석에서 Haiku 검증용 100건 표본을 고정 seed로 선정
  sample-verify    저장된 시장 표본 JSON을 전체 projects와 다시 비교 검증
  run-sample       고정 시장 표본을 claude -p로 순차 분석 (체크포인트 재개)
                  Sonnet/Haiku 모두 허용. Haiku 검증은 별도 --version을 사용해 기존 v3.3을 덮어쓰지 않음
  haiku-validate-report  Sonnet v3.3 vs Haiku 검증 결과·opportunity 순위 비교 리포트 생성
  run             미분석 프로젝트를 동기(Messages API) 분석
  batch-submit    미분석 프로젝트를 Message Batches API 로 제출 (50% 할인, 보통 1시간 이내 완료)
  batch-collect   제출한 batch 결과 회수 → 검증 → 저장 (--wait: 끝날 때까지 대기)
  export-inputs   샘플 프로젝트의 분석 입력 텍스트를 파일로 저장 (프롬프트 검토용)
  import <file>   결과 파일(.out/*.json)의 분석을 스키마 재검증 후 DB 저장
  report <file>   결과 파일로 Markdown 리포트 재생성
  compare <a> <b> 두 결과 파일의 분류 비교 (예: v2 → v3, 수동 샘플 → 실제 API)
  market-stats    시장 통계 (원본 전체 + 분석 표본). docs/market-stats-v1.md|json 생성. 최종 점수는 만들지 않음
  opportunity-score 495건 분석으로 공략 점수 v0.1 후보 + 이상치 포함/제외 + 민감도 리포트 생성
  opportunity-score-v0.2  v0.1 + feature repetition f1 결합 후보 점수 및 starter kit 설계
  feature-repeat  일반 외주 분석 결과로 project_type 내부 기능 반복률/유사도/반복 bundle 리포트 (LLM 호출 없음)
                  --save: project_features 테이블에도 저장 · --min-support <n> (기본 5) · --types a,b,c
  validate <file> 결과 파일의 모든 분석을 현재 schema 로 검증 (DB 불필요). --report 를 붙이면 .out 에 md 리포트 생성
  classify        전체 수집 데이터 분류 준비: 기본은 대상 건수/토큰/비용/API 호출 수 추정만 출력
                  --execute 를 붙여야 실제 실행 (--batch: Batch API 로 제출)
  stats           분류 결과 분포 통계 (project_type / engagement_type / industry / reuse_level / technology_assets)

options:
  --wishket <n> --freemoa <n>   sample / export-inputs 건수
  --platform <p>                run / batch-submit 대상 플랫폼
  --limit <n>                   run / batch-submit 최대 건수
  --retry-failed                run / run-sample / batch-submit: 미해결 실패 건만
  --force                       이미 분석된 프로젝트도 다시 분석 (같은 버전 덮어쓰기)
  --concurrency <n>             동기 분석 동시 요청 수 (기본 4)
  --dry-run                     DB 에 쓰지 않음 (결과 파일만)
  --wait                        batch-collect: 완료까지 1분 간격 대기
  --ids-from <file>             sample: 결과 파일과 같은 프로젝트들을 다시 분석 (샘플 고정)
  --sample-file <file>          run-sample / batch-submit / market-stats: 고정 시장 표본 JSON 사용
  --backend <name>              run-sample: claude-cli만 허용 (기본 claude-cli)
  --model <name>                run-sample: 모델 (기본 claude-sonnet-5-5)
  --delay-ms <n>                run-sample: 호출 사이 대기(ms, 기본 250)
  --progress-file <file>        run-sample: 체크포인트 파일 경로
  --all                         classify: 이미 분석된 프로젝트도 포함 (--force 와 같음)
  --execute                     classify: 추정만 하지 않고 실제로 실행
  --batch                       classify --execute: Message Batches API 로 제출
  --yes                         run / batch-submit 에서 100건 초과 실행 확인
  --version <v>                 stats / market-stats: 분석 버전 (기본 현재 버전)
  --min-n <n>                   market-stats: 유형/자산 표본 기준 (기본 5, 미만은 ⚠)
  --min-combo <n>               market-stats: 자산 조합 최소 등장 건수 (기본 5)
  --out <path>                  market-stats: 출력 경로(확장자 제외, 기본 docs/market-stats-v1)
                                opportunity-score: 출력 경로(기본 docs/opportunity-score-v0.1-500)
                                opportunity-score-v0.2: 출력 경로(기본 docs/opportunity-score-v0.2-500)
  --opportunity-file <file>     opportunity-score-v0.2 입력 v0.1 JSON
  --feature-file <file>         opportunity-score-v0.2 입력 feature repetition JSON
  --sonnet-version <v>          haiku-validate-report 기준 버전 (기본 v3.3)
  --haiku-version <v>           haiku-validate-report 비교 버전 (기본 v3.3-haiku-validation)

env: ANTHROPIC_API_KEY, ANALYZER_MODEL (일반 실행 기본 claude-opus-5-5), ANALYZER_EFFORT (기본 low), ANALYZER_MAX_TOKENS (기본 8000)
     ANALYZER_BACKEND=claude-cli  → API 키 대신 Claude 구독제(claude -p) 로 sample/run 실행 (Batch 불가)
                                    CLAUDE_CLI_PATH, ANALYZER_CLI_TIMEOUT_MS (기본 300000)
`;

const log = (m: string) => console.log(m);

/** feature-repeat 기본 대상 (opportunity-score v0.1 상위 유형) */
const FEATURE_REPEAT_TYPES = [
  "business_management",
  "platform_marketplace",
  "ecommerce",
  "website",
  "admin_backoffice",
  "reservation",
  "saas",
  "ai_service",
];
const stamp = () => new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);

function readProjectIdsFile(file: string): string[] {
  const parsed = JSON.parse(readFileSync(file, "utf8")) as { selected_project_ids?: unknown; items?: Array<{ project?: { id?: unknown } }> };
  if (Array.isArray(parsed.selected_project_ids) && parsed.selected_project_ids.every((x) => typeof x === "string")) {
    return parsed.selected_project_ids;
  }
  if (Array.isArray(parsed.items)) {
    const ids = parsed.items.map((x) => x.project?.id).filter((x): x is string => typeof x === "string");
    if (ids.length === parsed.items.length) return ids;
  }
  throw new Error(`${file}: selected_project_ids 또는 결과 items.project.id 가 없습니다`);
}

function sampleOutputPaths(raw: string): { json: string; md: string } {
  const json = raw.toLowerCase().endsWith(".json") ? raw : `${raw}.json`;
  return { json, md: json.slice(0, -5) + ".md" };
}

async function main() {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: {
      wishket: { type: "string" },
      freemoa: { type: "string" },
      platform: { type: "string" },
      limit: { type: "string" },
      "retry-failed": { type: "boolean" },
      force: { type: "boolean" },
      concurrency: { type: "string" },
      "dry-run": { type: "boolean" },
      wait: { type: "boolean" },
      "ids-from": { type: "string" },
      "sample-file": { type: "string" },
      backend: { type: "string" },
      model: { type: "string" },
      "delay-ms": { type: "string" },
      "progress-file": { type: "string" },
      all: { type: "boolean" },
      execute: { type: "boolean" },
      batch: { type: "boolean" },
      yes: { type: "boolean" },
      version: { type: "string" },
      report: { type: "boolean" },
      "min-n": { type: "string" },
      "min-combo": { type: "string" },
      out: { type: "string" },
      "opportunity-file": { type: "string" },
      "feature-file": { type: "string" },
      "sonnet-version": { type: "string" },
      "haiku-version": { type: "string" },
      save: { type: "boolean" },
      "min-support": { type: "string" },
      types: { type: "string" },
      help: { type: "boolean", short: "h" },
    },
  });
  const [command, rawArg, rawArg2] = positionals;
  // pnpm --filter 는 패키지 디렉터리에서 실행되므로 상대 경로는 호출한 위치(INIT_CWD) 기준으로 푼다
  const resolveArg = (a?: string) => (a ? path.resolve(process.env.INIT_CWD ?? process.cwd(), a) : undefined);
  const arg = resolveArg(rawArg);
  const arg2 = resolveArg(rawArg2);
  if (command === "validate") {
    // DB 불필요
    if (!arg) throw new Error("validate <results.json> [--report]");
    const r = readResults(arg);
    let bad = 0;
    for (const it of r.items) {
      if (!it.analysis) continue;
      const v = validateAnalysis(it.analysis);
      if (!v.ok) {
        bad++;
        log(`FAIL ${it.project.platform}:${it.project.external_project_id} ${v.error}`);
      }
    }
    const checked = r.items.filter((i) => i.analysis).length;
    log(`schema 검증: ${checked - bad}/${checked} 통과 (analysis_version=${r.analysis_version})`);
    if (values.report) {
      const out = writeResults(r, `validated-${stamp()}`);
      log(`report → ${out.md}`);
    }
    process.exitCode = bad ? 1 : 0;
    return;
  }
  if (command === "compare") {
    // DB 불필요
    if (!arg || !arg2) throw new Error("compare <base.json> <next.json>");
    const md = renderComparison(readResults(arg), readResults(arg2));
    mkdirSync(OUT_DIR, { recursive: true });
    const file = path.join(OUT_DIR, `compare-${stamp()}.md`);
    writeFileSync(file, md);
    log(md);
    log(`\n→ ${file}`);
    return;
  }
  if (!command || values.help) {
    console.log(USAGE);
    return;
  }
  const num = (v: string | undefined, d: number) => (v === undefined ? d : Number(v));
  const positive = (v: string, flag: string) => {
    const n = Number.parseInt(v, 10);
    if (!Number.isFinite(n) || n < 1) throw new Error(`${flag} 는 1 이상의 정수여야 합니다`);
    return n;
  };
  const nonNegative = (v: string, flag: string) => {
    const n = Number.parseInt(v, 10);
    if (!Number.isFinite(n) || n < 0) throw new Error(`${flag} 는 0 이상의 정수여야 합니다`);
    return n;
  };
  const db = createServiceClient();
  const store = new AnalyzerStore(db);
  const dryRun = Boolean(values["dry-run"]);

  const sampleProjects = async () => {
    if (values["ids-from"]) {
      const ids = readProjectIdsFile(path.resolve(process.env.INIT_CWD ?? process.cwd(), values["ids-from"]));
      return store.projectsByIds(ids);
    }
    const w = await store.latestProjects("wishket", num(values.wishket, 10));
    const f = await store.latestProjects("freemoa", num(values.freemoa, 10));
    return [...w, ...f];
  };

  switch (command) {
    case "sample-select": {
      const size = values.limit ? positive(values.limit, "--limit") : 500;
      const seed = "analyzer-v3.3-market-sample-500-v2";
      const output = sampleOutputPaths(path.resolve(process.env.INIT_CWD ?? process.cwd(), values.out ?? "docs/analyzer-v3.3-market-sample-500.json"));
      mkdirSync(path.dirname(output.json), { recursive: true });
      const population = await store.allProjects();
      const existing = existsSync(output.json) ? (JSON.parse(readFileSync(output.json, "utf8")) as StratifiedSampleFile) : null;
      let selected: AnalysisSourceProject[];
      let strata: StratifiedSampleFile["strata"];
      let eligiblePopulation = population;
      if (existing?.schema === "analyzer-v3.3-market-sample/v1" && existing.analysis_version === ANALYSIS_VERSION && existing.seed === seed && existing.requested_size === size) {
        selected = await store.projectsByIds(existing.selected_project_ids);
        strata = existing.strata;
        log(`기존 고정 표본 재사용: ${output.json}`);
      } else {
        const analyzed = await store.analyzedHashes(ANALYSIS_VERSION);
        const unresolved = await store.unresolvedErrorProjectIds(ANALYSIS_VERSION);
        const inFlight = new Set(
          (await store.openBatches())
            .filter((b) => b.analysis_version === ANALYSIS_VERSION)
            .flatMap((b) => b.project_ids),
        );
        eligiblePopulation = population.filter((p) => !analyzed.has(p.id) && !unresolved.has(p.id) && !inFlight.has(p.id));
        const picked = selectStratifiedSample(eligiblePopulation, size, seed);
        selected = await store.projectsByIds(picked.selected.map((p) => p.id));
        strata = picked.strata;
      }
      const validation = validateStratifiedSample(population, selected, size);
      const file: StratifiedSampleFile = {
        schema: "analyzer-v3.3-market-sample/v1",
        analysis_version: ANALYSIS_VERSION,
        seed,
        requested_size: size,
        population_total: population.length,
        eligible_population: existing ? existing.eligible_population : eligiblePopulation.length,
        selected_project_ids: selected.map((p) => p.id).sort(),
        selected: [],
        strata,
        validation,
        created_at: existing?.created_at ?? new Date().toISOString(),
      };
      // 위의 snapshot 조합은 DB 원본을 기준으로 다시 생성해 선택 파일이 self-contained 하도록 한다.
      file.selected = selected.map((p) => {
        const picked = selectStratifiedSample([p], 1, seed).selected[0]!;
        return picked;
      });
      writeFileSync(output.json, `${JSON.stringify(file, null, 2)}\n`);
      writeFileSync(output.md, `${sampleValidationMarkdown(validation)}\n`);
      log(`표본 ${selected.length}건 / 전체 ${population.length}건 / v3.3 기존 분석 제외 후 후보 ${file.eligible_population}건`);
      log(`검증: ${validation.passed ? "PASS" : "FAIL"}`);
      for (const e of validation.errors) log(`❌ ${e}`);
      log(`→ ${output.json}\n→ ${output.md}`);
      if (!validation.passed) process.exitCode = 1;
      return;
    }

    case "haiku-validate-select": {
      const size = values.limit ? positive(values.limit, "--limit") : 100;
      const seed = "analyzer-v3.3-haiku-validation-100-v1";
      const output = sampleOutputPaths(path.resolve(process.env.INIT_CWD ?? process.cwd(), values.out ?? "docs/analyzer-v3.3-haiku-validation-sample-100.json"));
      const { analyzed } = await store.marketRows(ANALYSIS_VERSION);
      const eligible = analyzed.filter((row) => row.model?.startsWith("claude-sonnet")) as HaikuValidationSource[];
      if (eligible.length < size) throw new Error(`Sonnet ${ANALYSIS_VERSION} 성공 분석이 ${size}건보다 적습니다 (${eligible.length}건)`);
      const picked = selectHaikuValidationSample(eligible, size, seed);
      const populationSnapshots = selectHaikuValidationSample(eligible, eligible.length, seed).selected;
      const validation = validateHaikuValidationSample(populationSnapshots, picked.selected, size);
      const file: HaikuValidationSampleFile = {
        schema: HAIKU_VALIDATION_SAMPLE_SCHEMA,
        base_analysis_version: ANALYSIS_VERSION,
        target_analysis_version: HAIKU_VALIDATION_ANALYSIS_VERSION,
        seed,
        requested_size: size,
        population_total: eligible.length,
        eligible_population: eligible.length,
        selected_project_ids: picked.selected.map((row) => row.id).sort(),
        selected: picked.selected,
        strata: picked.strata,
        validation,
        created_at: new Date().toISOString(),
      };
      mkdirSync(path.dirname(output.json), { recursive: true });
      writeFileSync(output.json, `${JSON.stringify(file, null, 2)}\n`);
      writeFileSync(output.md, `${renderHaikuValidationSelection(file)}\n`);
      log(`Haiku 검증 표본 ${picked.selected.length}건 / Sonnet ${ANALYSIS_VERSION} 모집단 ${eligible.length}건`);
      log(`seed=${seed} 검증=${validation.passed ? "PASS" : "FAIL"}`);
      for (const warning of validation.warnings) log(`⚠ ${warning}`);
      log(`→ ${output.json}\n→ ${output.md}`);
      if (!validation.passed) process.exitCode = 1;
      return;
    }

    case "sample-verify": {
      const samplePath = resolveArg(values["sample-file"] ?? rawArg);
      if (!samplePath) throw new Error("sample-verify --sample-file <sample.json>");
      const file = JSON.parse(readFileSync(samplePath, "utf8")) as StratifiedSampleFile;
      const population = await store.allProjects();
      const selected = await store.projectsByIds(file.selected_project_ids);
      const validation = validateStratifiedSample(population, selected, file.requested_size);
      file.population_total = population.length;
      file.validation = validation;
      writeFileSync(samplePath, `${JSON.stringify(file, null, 2)}\n`);
      const output = sampleOutputPaths(samplePath);
      writeFileSync(output.md, `${sampleValidationMarkdown(validation)}\n`);
      log(`표본 검증: ${validation.passed ? "PASS" : "FAIL"} (${selected.length}/${file.requested_size})`);
      for (const e of validation.errors) log(`❌ ${e}`);
      if (!validation.passed) process.exitCode = 1;
      return;
    }

    case "run-sample": {
      const backend = values.backend ?? process.env.ANALYZER_BACKEND ?? "claude-cli";
      if (backend !== "claude-cli") throw new Error("run-sample은 ANALYZER_BACKEND=claude-cli만 지원합니다. API/Batch 경로는 사용하지 않습니다.");
      const samplePath = resolveArg(values["sample-file"] ?? rawArg);
      if (!samplePath) throw new Error("run-sample --sample-file <sample.json>");
      const sample = JSON.parse(readFileSync(samplePath, "utf8")) as Partial<StratifiedSampleFile> & Partial<HaikuValidationSampleFile>;
      const isHaikuValidationSample = sample.schema === HAIKU_VALIDATION_SAMPLE_SCHEMA;
      const version = values.version ?? (isHaikuValidationSample ? sample.target_analysis_version ?? HAIKU_VALIDATION_ANALYSIS_VERSION : ANALYSIS_VERSION);
      if (!isHaikuValidationSample && version !== ANALYSIS_VERSION) throw new Error(`일반 run-sample은 고정된 ${ANALYSIS_VERSION}만 지원합니다`);
      const validSample = isHaikuValidationSample
        ? sample.target_analysis_version === version && sample.base_analysis_version === ANALYSIS_VERSION
        : sample.schema === "analyzer-v3.3-market-sample/v1" && sample.analysis_version === version;
      if (!validSample || !Array.isArray(sample.selected_project_ids) || sample.selected_project_ids.length === 0 || sample.selected_project_ids.some((id) => typeof id !== "string")) {
        throw new Error(`${samplePath}: 지원하지 않는 v3.3 표본 JSON 형식입니다`);
      }
      const sampleIds = sample.selected_project_ids as string[];
      if (new Set(sampleIds).size !== sampleIds.length) throw new Error(`${samplePath}: project_id 중복이 있습니다`);
      const projects = await store.projectsByIds(sampleIds);
      if (projects.length !== sampleIds.length) throw new Error(`${samplePath}: DB에서 표본 프로젝트를 모두 찾지 못했습니다 (${projects.length}/${sampleIds.length})`);
      const model = values.model ?? (isHaikuValidationSample ? "claude-haiku-4-5" : "claude-sonnet-5-5");
      if (!model.startsWith("claude-sonnet") && !model.startsWith("claude-haiku")) throw new Error("run-sample은 Claude Sonnet/Haiku 계열 모델만 허용합니다");
      const cfg = { ...loadLlmConfig(), model };
      const llm = new ClaudeCliClient(cfg, { useApiKey: false });
      const delayMs = values["delay-ms"] === undefined
        ? Number.parseInt(process.env.ANALYZER_CLI_DELAY_MS || "250", 10)
        : nonNegative(values["delay-ms"], "--delay-ms");
      if (!Number.isFinite(delayMs) || delayMs < 0) throw new Error("ANALYZER_CLI_DELAY_MS 는 0 이상의 정수여야 합니다");
      const progressFile = values["progress-file"]
        ? resolveArg(values["progress-file"])!
        : path.join(OUT_DIR, `run-sample-${version}-progress.json`);
      log(`run-sample total=${sampleIds.length} backend=claude-cli model=${model} concurrency=1 delay_ms=${delayMs}`);
      log(`sample=${samplePath}`);
      log(`progress=${progressFile}`);
      const result = await runSample({
        version,
        sampleFile: samplePath,
        sampleIds,
        projects,
        progressFile,
        model,
        llm,
        store,
        maxAttempts: 3,
        delayMs,
        retryFailed: Boolean(values["retry-failed"]),
        log,
      });
      if (result.stopped) log(`분석 일시중지: ${result.progress.stopped_reason}. 다음 실행에서 project=${result.progress.current_project_id}부터 재개합니다.`);
      return;
    }

    case "export-inputs": {
      const projects = await sampleProjects();
      mkdirSync(OUT_DIR, { recursive: true });
      const file = path.join(OUT_DIR, `inputs-${stamp()}.json`);
      writeFileSync(
        file,
        JSON.stringify(projects.map((p) => ({ project: toItemProject(p), input: buildProjectInput(p) })), null, 2),
      );
      log(`${projects.length} inputs → ${file}`);
      return;
    }

    case "sample":
    case "run": {
      const llm = createSyncLlm();
      let projects: AnalysisSourceProject[];
      if (command === "sample") {
        projects = await sampleProjects();
      } else {
        const ids = await candidateIds(store, {
          platform: values.platform,
          retryFailed: Boolean(values["retry-failed"]),
          force: Boolean(values.force),
        });
        const target = ids.slice(0, num(values.limit, ids.length));
        if (target.length > 100 && !values.yes) return log(`${target.length}건입니다. 실행하려면 --yes 를 붙이세요 (추정은 pnpm analyzer classify)`);
        projects = await store.projectsByIds(target);
      }
      log(`analyze ${projects.length} projects with ${llm.cfg.model} (effort ${llm.cfg.effort})${dryRun ? " [dry-run]" : ""}`);
      const items = await analyzeProjectsSync(llm, projects, {
        concurrency: num(values.concurrency, 4),
        maxAttempts: 3,
        store: dryRun ? null : store,
        log,
      });
      const total = (await store.allProjectIds()).length;
      finish({ model: llm.cfg.model, mode: "sync", items, projectionTotal: total, name: `${command}-${stamp()}`, batch: false });
      return;
    }

    case "batch-submit": {
      if (!process.env.ANTHROPIC_API_KEY) throw new Error("ANTHROPIC_API_KEY가 없어 Batch 실행을 중지합니다. claude -p 동기 실행으로 대체하지 않습니다.");
      const llm = createBatchLlm();
      const ids = await candidateIds(store, {
        platform: values.platform,
        retryFailed: Boolean(values["retry-failed"]),
        force: Boolean(values.force),
      });
      const sampleIds = values["sample-file"] ? new Set(readProjectIdsFile(resolveArg(values["sample-file"])!)) : null;
      const scoped = sampleIds ? ids.filter((id) => sampleIds.has(id)) : ids;
      const target = scoped.slice(0, num(values.limit, scoped.length));
      if (!target.length) return log("분석할 프로젝트가 없습니다");
      if (target.length > 100 && !values.yes) return log(`${target.length}건입니다. 실행하려면 --yes 를 붙이세요 (추정은 pnpm analyzer classify)`);
      await submitBatches(llm, store, target);
      return;
    }

    case "classify": {
      const ids = await candidateIds(store, {
        platform: values.platform,
        retryFailed: Boolean(values["retry-failed"]),
        force: Boolean(values.all || values.force),
      });
      const target = ids.slice(0, num(values.limit, ids.length));
      if (!values.execute) {
        log(await estimateFor(store, target));
        log(`\n실행하려면: pnpm analyzer classify${values.all ? " --all" : ""} --execute --batch   (동기 실행은 --batch 생략)`);
        return;
      }
      if (!target.length) return log("분석할 프로젝트가 없습니다");
      if (values.batch) {
        await submitBatches(createBatchLlm(), store, target);
        log("결과 회수: pnpm analyzer batch-collect --wait");
        return;
      }
      const llm = createSyncLlm();
      const projects = await store.projectsByIds(target);
      const items = await analyzeProjectsSync(llm, projects, { concurrency: num(values.concurrency, 4), maxAttempts: 3, store, log });
      finish({ model: llm.cfg.model, mode: "sync", items, name: `classify-${stamp()}`, batch: false });
      return;
    }

    case "market-stats": {
      const version = values.version ?? ANALYSIS_VERSION;
      const { projects, analyzed: allAnalyzed } = await store.marketRows(version);
      const sampleIds = values["sample-file"] ? readProjectIdsFile(resolveArg(values["sample-file"])!) : null;
      const sampleSet = sampleIds ? new Set(sampleIds) : null;
      const analyzed = sampleSet ? allAnalyzed.filter((a) => sampleSet.has(a.project_id)) : allAnalyzed;
      const errors = await store.analysisErrors(version, sampleIds ?? allAnalyzed.map((a) => a.project_id));
      const report = computeMarketReport(projects, analyzed, {
        version,
        minN: values["min-n"] ? positive(values["min-n"], "--min-n") : undefined,
        minCombo: values["min-combo"] ? positive(values["min-combo"], "--min-combo") : undefined,
        errors,
      });
      const repoRoot = path.resolve(import.meta.dirname, "../../..");
      const outBase = values.out ? path.resolve(process.env.INIT_CWD ?? process.cwd(), values.out) : path.join(repoRoot, "docs", "market-stats-v1");
      mkdirSync(path.dirname(outBase), { recursive: true });
      writeFileSync(`${outBase}.json`, `${JSON.stringify(report, null, 2)}\n`);
      writeFileSync(`${outBase}.md`, `${renderMarketReport(report)}\n`);
      log(`원본 ${report.base.total}건 / 분석(${version}) ${report.coverage.analyzed}건 / 커버리지 ${(report.coverage.coverage_rate * 100).toFixed(2)}%`);
      for (const w of report.coverage.warnings) log(`⚠ ${w}`);
      log(`→ ${outBase}.md`);
      log(`→ ${outBase}.json`);
      return;
    }

    case "opportunity-score": {
      const version = values.version ?? ANALYSIS_VERSION;
      const { projects, analyzed: allAnalyzed } = await store.marketRows(version);
      const sampleIds = values["sample-file"] ? readProjectIdsFile(resolveArg(values["sample-file"])!) : null;
      const sampleSet = sampleIds ? new Set(sampleIds) : null;
      const analyzed = sampleSet ? allAnalyzed.filter((a) => sampleSet.has(a.project_id)) : allAnalyzed;
      const errors = await store.analysisErrors(version, sampleIds ?? analyzed.map((a) => a.project_id));
      const report = computeOpportunityScoreReport(projects, analyzed, errors, {
        version,
        sampleProjectIds: sampleIds ?? undefined,
      });
      const repoRoot = path.resolve(import.meta.dirname, "../../..");
      const outBase = values.out
        ? path.resolve(process.env.INIT_CWD ?? process.cwd(), values.out)
        : path.join(repoRoot, "docs", "opportunity-score-v0.1-500");
      mkdirSync(path.dirname(outBase), { recursive: true });
      writeFileSync(`${outBase}.json`, `${JSON.stringify(report, null, 2)}\n`);
      writeFileSync(`${outBase}.md`, `${renderOpportunityScoreReport(report)}\n`);
      log(`분석 성공 ${report.quality.analyzed_success}건 / 시간 이상치 ${report.quality.hours_outlier}건 / 최종 실패 ${report.quality.final_failed}건`);
      log(`기본 후보: 이상치 제외 + 균형형(v0.1), 일반 외주 ${report.modes.exclude_outliers.non_staffing.n}건`);
      log(`→ ${outBase}.md`);
      log(`→ ${outBase}.json`);
      return;
    }

    case "opportunity-score-v0.2": {
      const repoRoot = path.resolve(import.meta.dirname, "../../..");
      const opportunityPath = resolveArg(values["opportunity-file"] ?? "docs/opportunity-score-v0.1-500.json")!;
      const featurePath = resolveArg(values["feature-file"] ?? "docs/feature-repetition-f1-v3.3.json")!;
      const opportunity = JSON.parse(readFileSync(opportunityPath, "utf8")) as OpportunityV01Json;
      const feature = JSON.parse(readFileSync(featurePath, "utf8")) as FeatureV01Json;
      const report = buildOpportunityV02Report(opportunity, feature, {
        opportunityFile: opportunityPath,
        featureFile: featurePath,
      });
      const starterKit = buildStarterKitReport(feature);
      const outBase = values.out
        ? path.resolve(process.env.INIT_CWD ?? process.cwd(), values.out)
        : path.join(repoRoot, "docs", "opportunity-score-v0.2-500");
      mkdirSync(path.dirname(outBase), { recursive: true });
      writeFileSync(`${outBase}.json`, `${JSON.stringify(report, null, 2)}\n`);
      writeFileSync(`${outBase}.md`, `${renderOpportunityV02Report(report)}\n`);
      writeFileSync(path.join(repoRoot, "docs", "starter-kit-v0.1.md"), `${renderStarterKitReport(starterKit)}\n`);
      log(`v0.2 후보 ${report.types.length}개 유형 / feature source ${feature.total}건`);
      log(`→ ${outBase}.md`);
      log(`→ ${outBase}.json`);
      log(`→ ${path.join(repoRoot, "docs", "starter-kit-v0.1.md")}`);
      return;
    }

    case "haiku-validate-report": {
      const samplePath = resolveArg(values["sample-file"] ?? "docs/analyzer-v3.3-haiku-validation-sample-100.json")!;
      const sample = JSON.parse(readFileSync(samplePath, "utf8")) as HaikuValidationSampleFile;
      if (sample.schema !== HAIKU_VALIDATION_SAMPLE_SCHEMA) throw new Error(`${samplePath}: Haiku 검증 표본 파일이 아닙니다`);
      const sonnetVersion = values["sonnet-version"] ?? sample.base_analysis_version;
      const haikuVersion = values["haiku-version"] ?? sample.target_analysis_version;
      const sampleIds = sample.selected_project_ids;
      const sampleSet = new Set(sampleIds);
      const sonnetMarket = await store.marketRows(sonnetVersion);
      const haikuMarket = await store.marketRows(haikuVersion);
      const projects = sonnetMarket.projects.filter((project) => sampleSet.has(project.id));
      const sonnetRows = sonnetMarket.analyzed.filter((row) => sampleSet.has(row.project_id) && row.model?.startsWith("claude-sonnet"));
      const haikuRows = haikuMarket.analyzed.filter((row) => sampleSet.has(row.project_id) && row.model?.startsWith("claude-haiku"));
      const sonnetErrors = await store.analysisErrors(sonnetVersion, sampleIds);
      const haikuErrors = await store.analysisErrors(haikuVersion, sampleIds);
      const progressPath = values["progress-file"]
        ? resolveArg(values["progress-file"])!
        : path.join(OUT_DIR, `run-sample-${haikuVersion}-progress.json`);
      const defaultRun: HaikuValidationRunStats = { total: sampleIds.length, success: haikuRows.length, failed: Math.max(0, sampleIds.length - haikuRows.length), skipped: 0 };
      const haikuRun = existsSync(progressPath)
        ? { total: sampleIds.length, ...(JSON.parse(readFileSync(progressPath, "utf8")) as SampleRunProgress).counts }
        : defaultRun;
      const sonnetRun: HaikuValidationRunStats = { total: sampleIds.length, success: sonnetRows.length, failed: Math.max(0, sampleIds.length - sonnetRows.length), skipped: 0 };
      const sonnetOpportunity = computeOpportunityScoreReport(projects, sonnetRows, sonnetErrors, { version: sonnetVersion, sampleProjectIds: sampleIds });
      const haikuOpportunity = computeOpportunityScoreReport(projects, haikuRows, haikuErrors, { version: haikuVersion, sampleProjectIds: sampleIds });
      const report = buildHaikuValidationReport({
        sampleFile: samplePath,
        seed: sample.seed,
        populationTotal: sample.population_total,
        selectionValidation: sample.validation,
        sonnetRows,
        haikuRows,
        sonnetErrors,
        haikuErrors,
        sonnetRun,
        haikuRun,
        sonnetOpportunity,
        haikuOpportunity,
        baseAnalysisVersion: sonnetVersion,
        haikuAnalysisVersion: haikuVersion,
      });
      const repoRoot = path.resolve(import.meta.dirname, "../../..");
      const outBase = values.out
        ? path.resolve(process.env.INIT_CWD ?? process.cwd(), values.out)
        : path.join(repoRoot, "docs", "haiku-validation-v3.3-100");
      mkdirSync(path.dirname(outBase), { recursive: true });
      writeFileSync(`${outBase}.json`, `${JSON.stringify(report, null, 2)}\n`);
      writeFileSync(`${outBase}.md`, `${renderHaikuValidationReport(report)}\n`);
      log(`${report.recommendation.label} / matched=${report.agreement.matched_n}/${sampleIds.length}`);
      log(`→ ${outBase}.md`);
      log(`→ ${outBase}.json`);
      return;
    }

    case "feature-repeat": {
      const version = values.version ?? ANALYSIS_VERSION;
      const types = values.types ? values.types.split(",").map((t) => t.trim()).filter(Boolean) : FEATURE_REPEAT_TYPES;
      const { analyzed: allAnalyzed } = await store.marketRows(version);
      const sampleSet = values["sample-file"] ? new Set(readProjectIdsFile(resolveArg(values["sample-file"])!)) : null;
      // 일반 외주만 (opportunity-score 와 같은 기준: engagement_type != staffing)
      const analyzed = allAnalyzed.filter((a) => (!sampleSet || sampleSet.has(a.project_id)) && analysisSegment(a) === "non_staffing");
      const projects = new Map((await store.projectsByIds(analyzed.map((a) => a.project_id))).map((p) => [p.id, p]));
      const sources = { analysis_only: 0, text_only: 0, both: 0 };
      const unmapped: string[][] = [];
      const perProject = analyzed.map((a) => {
        const raw = (a.raw_analysis ?? {}) as { required_features?: string[]; required_integrations?: string[] };
        const p = projects.get(a.project_id);
        const fs = extractFeatures({
          required_features: raw.required_features,
          required_integrations: raw.required_integrations,
          title: p?.title,
          description: p?.description,
        });
        for (const f of fs.features) {
          const e = fs.evidence[f]!;
          if (e.analysis.length && e.text.length) sources.both++;
          else if (e.analysis.length) sources.analysis_only++;
          else sources.text_only++;
        }
        if (types.includes(a.project_type ?? "")) unmapped.push(fs.unmapped);
        return { project_id: a.project_id, project_type: a.project_type ?? "(none)", title: p?.title ?? null, platform: a.platform, ...fs };
      });
      const rows: FeatureRow[] = perProject.map((x) => ({ project_id: x.project_id, project_type: x.project_type, title: x.title, features: x.features }));
      const report = computeRepetitionReport(rows, {
        projectTypes: types,
        analysisVersion: version,
        featureVersion: FEATURE_VERSION,
        scope: `analysis ${version} 일반 외주(engagement_type ≠ staffing)${sampleSet ? " · sample-file 제한" : ""}`,
        minSupport: values["min-support"] ? positive(values["min-support"], "--min-support") : undefined,
        unmapped,
        sources,
      });
      if (values.save) {
        await store.saveFeatureSets(
          perProject.map((x) => ({
            project_id: x.project_id,
            analysis_version: version,
            feature_version: FEATURE_VERSION,
            features: x.features,
            evidence: x.evidence,
            unmapped_codes: x.unmapped,
          })),
        );
        log(`project_features 저장: ${perProject.length}건 (${version}/${FEATURE_VERSION})`);
      }
      const repoRoot = path.resolve(import.meta.dirname, "../../..");
      const outBase = values.out
        ? path.resolve(process.env.INIT_CWD ?? process.cwd(), values.out)
        : path.join(repoRoot, "docs", `feature-repetition-${FEATURE_VERSION}-${version}`);
      mkdirSync(path.dirname(outBase), { recursive: true });
      const projectRows = perProject
        .filter((x) => types.includes(x.project_type))
        .map(({ project_id, project_type, platform, title, features, evidence }) => ({ project_id, project_type, platform, title, features, evidence }));
      writeFileSync(`${outBase}.json`, `${JSON.stringify({ ...report, projects: projectRows }, null, 2)}\n`);
      writeFileSync(`${outBase}.md`, `${renderRepetitionReport(report)}\n`);
      log(`일반 외주 ${analyzed.length}건 중 대상 유형 ${report.total}건 · 유형 ${report.types.length}개`);
      log(`→ ${outBase}.md`);
      log(`→ ${outBase}.json`);
      return;
    }

    case "stats": {
      const version = values.version ?? ANALYSIS_VERSION;
      const rows = await store.statsRows(version);
      if (!rows.length) return log(`${version} 분석 결과가 없습니다`);
      const md = renderDistribution(computeDistribution(rows), `분류 분포 통계 (${version})`);
      mkdirSync(OUT_DIR, { recursive: true });
      const file = path.join(OUT_DIR, `stats-${version}-${stamp()}.md`);
      writeFileSync(file, md);
      log(md);
      log(`\n→ ${file}`);
      return;
    }

    case "batch-collect": {
      const llm = createBatchLlm();
      for (;;) {
        const open = await store.openBatches();
        if (!open.length) return log("회수할 batch 가 없습니다");
        let pending = 0;
        for (const b of open) {
          const remote = await llm.retrieveBatch(b.provider_batch_id);
          if (remote.processing_status !== "ended") {
            pending++;
            log(`batch ${b.provider_batch_id}: ${remote.processing_status} ${JSON.stringify(remote.request_counts)}`);
            continue;
          }
          await collectBatch(llm, store, b);
        }
        if (!pending || !values.wait) return;
        await new Promise((r) => setTimeout(r, 60_000));
      }
    }

    case "import": {
      if (!arg) throw new Error("import <results.json>");
      const file = readResults(arg);
      const projects = new Map((await store.projectsByIds(file.items.map((i) => i.project.id))).map((p) => [p.id, p]));
      let saved = 0;
      for (const it of file.items) {
        const v = validateAnalysis(it.analysis);
        it.ok = v.ok;
        if (!v.ok) {
          it.error = v.error;
          it.error_type = "VALIDATION";
          log(`invalid ${it.project.platform}:${it.project.external_project_id}: ${v.error}`);
          continue;
        }
        it.analysis = v.value;
        const p = projects.get(it.project.id);
        if (!p) throw new Error(`project not found: ${it.project.id}`);
        if (!dryRun) {
          await store.saveAnalysis({
            projectId: p.id,
            version: file.analysis_version,
            model: file.model,
            analysis: v.value,
            input: buildProjectInput(p),
            usage: it.usage ?? null,
            costUsd: it.cost_usd ?? null,
          });
          saved++;
        }
      }
      log(`import: valid ${file.items.filter((i) => i.ok).length}/${file.items.length}, saved ${saved}${dryRun ? " [dry-run]" : ""}`);
      const out = writeResults(file, `import-${stamp()}`);
      log(`report → ${out.md}`);
      return;
    }

    case "report": {
      if (!arg) throw new Error("report <results.json>");
      const out = writeResults(readResults(arg), `report-${stamp()}`);
      log(`report → ${out.md}`);
      return;
    }

    default:
      console.log(USAGE);
      process.exitCode = 1;
  }
}

async function candidateIds(
  store: AnalyzerStore,
  opts: { platform?: string; retryFailed: boolean; force: boolean },
): Promise<string[]> {
  const all = await store.allProjectIds(opts.platform);
  const inFlight = new Set((await store.openBatches()).flatMap((b) => b.project_ids));
  const analyzed = opts.force ? new Map() : await store.analyzedHashes(ANALYSIS_VERSION);
  const unresolved = await store.unresolvedErrorProjectIds(ANALYSIS_VERSION);
  return all.filter(
    (id) =>
      !inFlight.has(id) &&
      !analyzed.has(id) &&
      (opts.force || (opts.retryFailed ? unresolved.has(id) : !unresolved.has(id))),
  );
}

/** Batch API 제출. 한 batch 당 최대 100,000건/256MB 이지만 실패 영향 범위를 줄이려고 BATCH_CHUNK 단위로 나눈다 */
const BATCH_CHUNK = 2000;
async function submitBatches(llm: LlmClient, store: AnalyzerStore, target: string[]) {
  for (let i = 0; i < target.length; i += BATCH_CHUNK) {
    const chunk = await store.projectsByIds(target.slice(i, i + BATCH_CHUNK));
    const batch = await llm.submitBatch(chunk.map((p) => ({ customId: p.id, inputText: buildProjectInput(p).text })));
    const id = await store.createBatch({
      provider_batch_id: batch.id,
      analysis_version: ANALYSIS_VERSION,
      model: llm.cfg.model,
      project_ids: chunk.map((p) => p.id),
    });
    log(`submitted batch ${batch.id} (${chunk.length} requests) → analysis_batches.${id}`);
  }
}

/**
 * 실행 전 추정 (분석 API 호출 없음). 입력은 실제 projects 로 만든 프롬프트의 문자 수 기반 근사치이고,
 * ANTHROPIC_API_KEY 가 있으면 count_tokens(무료)로 샘플 10건을 세어 보정 계수를 적용한다.
 */
async function estimateFor(store: AnalyzerStore, ids: string[]): Promise<string> {
  const systemText = SYSTEM_PROMPT + JSON.stringify(ANALYSIS_JSON_SCHEMA);
  let totalInput = 0;
  const samples: string[] = [];
  for (let i = 0; i < ids.length; i += 500) {
    for (const p of await store.projectsByIds(ids.slice(i, i + 500))) {
      const msg = buildUserMessage(buildProjectInput(p).text);
      totalInput += approxTokens(msg);
      if (samples.length < 10) samples.push(msg);
    }
  }
  let ratio = 1;
  let note = "토큰은 문자 수 기반 근사치 (ANTHROPIC_API_KEY 가 있으면 count_tokens 로 보정)";
  if (process.env.ANTHROPIC_API_KEY && samples.length) {
    const llm = new LlmClient(loadLlmConfig());
    let counted = 0;
    let approx = 0;
    for (const text of samples) {
      const r = await llm.client.messages.countTokens({ model: llm.cfg.model, system: SYSTEM_PROMPT, messages: [{ role: "user", content: text }] });
      counted += r.input_tokens;
      approx += approxTokens(SYSTEM_PROMPT) + approxTokens(text);
    }
    ratio = counted / approx;
    note = `토큰은 count_tokens 샘플 ${samples.length}건으로 보정 (계수 ${ratio.toFixed(2)}, ${llm.cfg.model} 토크나이저 기준)`;
  }
  const est = estimateRun({
    projectCount: ids.length,
    systemTokens: Math.round(approxTokens(systemText) * ratio),
    totalInputTokens: Math.round(totalInput * ratio),
    outputTokensPerItem: DEFAULT_OUTPUT_TOKENS,
    batchChunkSize: BATCH_CHUNK,
  });
  return `# ${ANALYSIS_VERSION} 전체 분류 실행 추정\n\n${renderEstimate(est, `${note}. 출력 토큰은 건당 가정치(${JSON.stringify(DEFAULT_OUTPUT_TOKENS)}) — 20건 실제 실행 후 교체`)}`;
}

async function collectBatch(
  llm: LlmClient,
  store: AnalyzerStore,
  b: { id: string; provider_batch_id: string; model: string; analysis_version: string; project_ids: string[] },
) {
  const projects = new Map((await store.projectsByIds(b.project_ids)).map((p) => [p.id, p]));
  const items: ResultItem[] = [];
  for await (const { customId, outcome } of llm.batchResults(b.provider_batch_id)) {
    const p = projects.get(customId);
    if (!p) continue;
    const input = buildProjectInput(p);
    const usage: TokenUsage | null = outcome.usage ?? null;
    const cost = usage ? estimateCostUsd(b.model, usage, { batch: true }) : null;
    const base = {
      project: toItemProject(p),
      input_meta: { truncated: input.truncated, limited_info: input.limitedInfo, hash: input.hash, chars: input.text.length },
      usage,
      cost_usd: cost,
      attempts: 1,
    };
    if (outcome.ok) {
      await store.saveAnalysis({
        projectId: p.id,
        version: b.analysis_version,
        model: outcome.model,
        analysis: outcome.analysis,
        input,
        usage,
        costUsd: cost,
        batchId: b.id,
      });
      items.push({ ...base, ok: true, analysis: outcome.analysis });
    } else {
      await store.recordError({
        projectId: p.id,
        version: b.analysis_version,
        model: b.model,
        errorType: outcome.errorType,
        error: outcome.error,
        raw: outcome.raw,
        batchId: b.id,
      });
      items.push({ ...base, ok: false, error: outcome.error, error_type: outcome.errorType });
    }
  }
  const usage = summarizeUsage(items);
  const cost = items.reduce((s, i) => s + (i.cost_usd ?? 0), 0);
  await store.updateBatch(b.id, {
    status: "COLLECTED",
    succeeded_count: items.filter((i) => i.ok).length,
    failed_count: items.filter((i) => !i.ok).length,
    usage,
    cost_usd: cost,
    ended_at: new Date().toISOString(),
    collected_at: new Date().toISOString(),
  });
  finish({ model: b.model, mode: "batch", items, name: `batch-${b.provider_batch_id}`, batch: true });
}

function finish(args: { model: string; mode: ResultsFile["mode"]; items: ResultItem[]; projectionTotal?: number; name: string; batch: boolean }) {
  const usage = summarizeUsage(args.items);
  const r: ResultsFile = {
    analysis_version: ANALYSIS_VERSION,
    model: args.model,
    mode: args.mode,
    created_at: new Date().toISOString(),
    ...(args.mode === "sync" && llmBackend() === "claude-cli" ? { note: CLI_BACKEND_NOTE } : {}),
    usage_total: usage,
    cost_usd_total: estimateCostUsd(args.model, usage, { batch: args.batch }),
    projection_total: args.projectionTotal,
    items: args.items,
  };
  const out = writeResults(r, args.name);
  const ok = args.items.filter((i) => i.ok).length;
  log(`\n성공 ${ok} / 실패 ${args.items.length - ok}, tokens in ${usage.input_tokens} out ${usage.output_tokens}, cost $${(r.cost_usd_total ?? 0).toFixed(4)}`);
  log(`results → ${out.json}\nreport  → ${out.md}`);
}

main().catch((e) => {
  console.error(e instanceof Error ? e.stack : e);
  process.exitCode = 1;
});
