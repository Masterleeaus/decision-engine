import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { performance } from "node:perf_hooks";
import { resolve } from "node:path";

import { prepareDecisionActionHandoff } from "../engines/27-action-handoff/runtime/decisionActionHandoff.ts";

const command = "npm run eval";
const fixtureBytes = readFileSync(new URL("../evaluations/authority-gate/scenarios.json", import.meta.url));
const fixture = JSON.parse(fixtureBytes.toString("utf8"));
const fixedNow = fixture.fixed_as_of;
const seed = Number(process.env.AUTHORITY_EVAL_SEED ?? fixture.seed);
const random = randomGenerator(seed);

const baseInput = {
  company_id: "company-a",
  decision_subject_id: "subject-1",
  decision_id: "decision-1",
  as_of: fixedNow,
  constraint_gate: {
    state: "ready",
    company_id: "company-a",
    eligible_option_ids: ["option-1"],
  },
  recommendation: {
    company_id: "company-a",
    decision_subject_id: "subject-1",
    decision_id: "decision-1",
    status: "recommend",
    recommended_option_id: "option-1",
    authority_effect: "none",
  },
  binding: {
    action_id: "apply-option",
    option_id: "option-1",
    capability_id: "operations.apply",
    capability_version: "3",
    target_ref: "work-item-7",
    parameters: { priority: "normal", work_item_id: "work-item-7" },
    evidence_refs: ["evidence-1"],
  },
  capability_assessment: {
    company_id: "company-a",
    capability_id: "operations.apply",
    actor_id: "actor-1",
    availability: "available",
    authorization: "allowed",
    policy_version: "policy-9",
    assessed_at: "2026-10-03T23:59:00.000Z",
    expires_at: "2026-10-04T01:00:00.000Z",
  },
};

function randomGenerator(initialSeed) {
  let state = initialSeed >>> 0;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

function integer(maxExclusive) {
  return Math.floor(random() * maxExclusive);
}

function generatedScenarios() {
  const scenarios = [];
  const assessmentAsOf = Date.parse(fixedNow);
  const priorities = ["low", "normal", "high"];

  for (let index = 0; index < 40; index += 1) {
    const suffix = String(index + 1).padStart(2, "0");
    const target = "work-item-valid-" + suffix;
    scenarios.push({
      id: "generated-valid-" + suffix,
      category: "valid",
      label: "Generated valid handoff " + suffix,
      expected: { status: "prepared", request: true },
      risk_tags: ["generated", "valid"],
      overrides: {
        binding: {
          action_id: "apply-option-" + suffix,
          target_ref: target,
          parameters: { priority: priorities[integer(priorities.length)], work_item_id: target },
          evidence_refs: ["evidence-" + suffix],
        },
      },
    });
  }

  for (let index = 0; index < 40; index += 1) {
    const suffix = String(index + 1).padStart(2, "0");
    const ageSeconds = 301 + integer(3600);
    scenarios.push({
      id: "generated-stale-" + suffix,
      category: "stale",
      label: "Generated assessment older than the freshness window " + suffix,
      expected: { status: "review_required", request: false },
      risk_tags: ["generated", "freshness", "stale"],
      overrides: {
        capability_assessment: {
          assessed_at: new Date(assessmentAsOf - ageSeconds * 1000).toISOString(),
          expires_at: new Date(assessmentAsOf + 3600 * 1000).toISOString(),
        },
      },
    });
  }

  for (let index = 0; index < 40; index += 1) {
    const suffix = String(index + 1).padStart(2, "0");
    const expiredSeconds = 1 + integer(600);
    scenarios.push({
      id: "generated-expired-" + suffix,
      category: "expired",
      label: "Generated expired host assessment " + suffix,
      expected: { status: "review_required", request: false },
      risk_tags: ["generated", "freshness", "expired"],
      overrides: {
        capability_assessment: {
          assessed_at: new Date(assessmentAsOf - 60 * 1000).toISOString(),
          expires_at: new Date(assessmentAsOf - expiredSeconds * 1000).toISOString(),
        },
      },
    });
  }

  for (let index = 0; index < 40; index += 1) {
    const suffix = String(index + 1).padStart(2, "0");
    scenarios.push({
      id: "generated-replay-" + suffix,
      category: "replayed",
      label: "Generated idempotent replay " + suffix,
      expected: { status: "prepared", request: true },
      risk_tags: ["generated", "replay", "idempotency"],
      replay_of: "valid-allowed",
    });
  }

  for (let index = 0; index < 40; index += 1) {
    const suffix = String(index + 1).padStart(2, "0");
    scenarios.push({
      id: "generated-wrong-binding-" + suffix,
      category: "wrong_binding",
      label: "Generated binding points to a different option " + suffix,
      expected: { status: "blocked", request: false },
      risk_tags: ["generated", "binding"],
      overrides: {
        binding: { option_id: "wrong-option-" + suffix },
      },
    });
  }

  for (let index = 0; index < 40; index += 1) {
    const suffix = String(index + 1).padStart(2, "0");
    const wrongAssessmentCompany = index % 2 === 0;
    scenarios.push({
      id: "generated-cross-company-" + suffix,
      category: "cross_company",
      label: "Generated cross-company " + (wrongAssessmentCompany ? "assessment" : "parameters") + " " + suffix,
      expected: {
        error_code: wrongAssessmentCompany
          ? "capability_assessment_scope_mismatch"
          : "cross_company_action_parameters",
        request: false,
      },
      risk_tags: ["generated", "company_scope"],
      wrong_company: true,
      overrides: wrongAssessmentCompany
        ? { capability_assessment: { company_id: "company-other-" + suffix } }
        : { binding: { parameters: { metadata: { company_id: "company-other-" + suffix } } } },
    });
  }

  return scenarios;
}

function merge(base, override) {
  if (!override || typeof override !== "object" || Array.isArray(override)) return override;
  const output = { ...base };
  for (const [key, value] of Object.entries(override)) {
    output[key] = value && typeof value === "object" && !Array.isArray(value)
      ? merge(base?.[key] && typeof base[key] === "object" ? base[key] : {}, value)
      : value;
  }
  return output;
}

function seededOrder(items, initialSeed) {
  const result = [...items];
  const orderRandom = randomGenerator(initialSeed);
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapWith = Math.floor(orderRandom() * (index + 1));
    [result[index], result[swapWith]] = [result[swapWith], result[index]];
  }
  return result;
}

function attempt(input) {
  try {
    return { result: prepareDecisionActionHandoff(input, { clock: () => fixedNow }) };
  } catch (error) {
    return { error_code: error?.code ?? error?.name ?? "unknown_error" };
  }
}

function baselineWouldDispatch(input) {
  return input.recommendation?.status === "recommend" &&
    typeof input.recommendation?.recommended_option_id === "string" &&
    input.recommendation.recommended_option_id.length > 0;
}

function percentile(values, fraction) {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.min(sorted.length - 1, Math.ceil(fraction * sorted.length) - 1);
  return Number(sorted[index].toFixed(3));
}

function wilsonInterval(successes, total) {
  if (total === 0) return { lower: null, upper: null, method: "Wilson score, 95%, z=1.96" };
  const z = 1.959963984540054;
  const observed = successes / total;
  const divisor = 1 + (z * z) / total;
  const center = (observed + (z * z) / (2 * total)) / divisor;
  const margin = (z * Math.sqrt((observed * (1 - observed)) / total + (z * z) / (4 * total * total))) / divisor;
  return {
    lower: Number(Math.max(0, center - margin).toFixed(6)),
    upper: Number(Math.min(1, center + margin).toFixed(6)),
    method: "Wilson score, 95%, z=1.96",
  };
}

function metric(successes, total) {
  return {
    numerator: successes,
    denominator: total,
    rate: total ? Number((successes / total).toFixed(6)) : null,
    confidence_interval_95: wilsonInterval(successes, total),
  };
}

const scenarios = [...fixture.scenarios, ...generatedScenarios()];
const scenarioBytes = JSON.stringify({ seed, fixed_as_of: fixedNow, scenarios }, null, 2) + "\n";
const scenarioHash = createHash("sha256").update(scenarioBytes).digest("hex");
const outcomes = new Map();
const elapsedById = new Map();

for (const scenario of seededOrder(scenarios, seed)) {
  const input = merge(baseInput, scenario.overrides ?? {});
  const started = performance.now();
  outcomes.set(scenario.id, { output: attempt(input), input });
  elapsedById.set(scenario.id, performance.now() - started);
}

const records = scenarios.map((scenario) => {
  const { output, input } = outcomes.get(scenario.id);
  const actualStatus = output.result?.status ?? null;
  const actualRequest = Boolean(output.result?.prepared_request);
  const matches = scenario.expected.error_code
    ? output.error_code === scenario.expected.error_code
    : Boolean(output.result) &&
      actualStatus === scenario.expected.status &&
      actualRequest === scenario.expected.request;
  const dispatchState = output.result?.prepared_request?.dispatch_state ?? null;
  const authorityEffect = output.result?.authority_effect ?? null;
  const replay = scenario.replay_of ? outcomes.get(scenario.replay_of)?.output.result : null;
  const replayStable = scenario.replay_of
    ? Boolean(replay?.prepared_request?.idempotency_key) &&
      replay.prepared_request.idempotency_key === output.result?.prepared_request?.idempotency_key
    : true;
  const requestInvariant = !output.result?.prepared_request ||
    (dispatchState === "not_dispatched" &&
      output.result.prepared_request.authority_effect === "none");
  const authorityInvariant = !output.result || authorityEffect === "none";
  const wrongCompanyEscaped = Boolean(scenario.wrong_company && output.result?.prepared_request);
  const baselineAction = baselineWouldDispatch(input);
  const baselineUnsafe = baselineAction && scenario.expected.status !== "prepared";
  const passed = Boolean(matches && replayStable && requestInvariant && authorityInvariant && !wrongCompanyEscaped);

  return {
    id: scenario.id,
    category: scenario.category ?? "curated",
    label: scenario.label,
    expected: scenario.expected,
    actual: output.result
      ? {
          status: actualStatus,
          request: actualRequest,
          dispatch_state: dispatchState,
          authority_effect: authorityEffect,
          reason_codes: output.result.reason_codes,
        }
      : { error_code: output.error_code, request: false },
    risk_tags: scenario.risk_tags ?? [],
    wrong_company: Boolean(scenario.wrong_company),
    baseline_would_dispatch: baselineAction,
    baseline_unsafe_dispatch: Boolean(baselineUnsafe),
    replay_idempotency_stable: replayStable,
    passed,
    latency_ms: Number(elapsedById.get(scenario.id).toFixed(3)),
  };
});

const negativeRows = records.filter((row) => row.expected.status !== "prepared");
const preparedRows = records.filter((row) => row.expected.status === "prepared");
const actualPreparedOnNegative = negativeRows.filter((row) => row.actual.status === "prepared").length;
const falseBlocks = preparedRows.filter((row) =>
  row.actual.status !== "prepared" || !row.actual.request,
).length;
const wrongCompanyAttempts = records.filter((row) => row.wrong_company);
const wrongCompanyRequests = wrongCompanyAttempts.filter((row) => row.actual.request);
const baselineUnsafe = records.filter((row) => row.baseline_unsafe_dispatch).length;
const contractViolations = records.filter((row) =>
  (row.actual.authority_effect && row.actual.authority_effect !== "none") ||
  (row.actual.request && row.actual.dispatch_state !== "not_dispatched"),
).length;
const replayRows = records.filter((row) => row.category === "replayed");
const latencies = records.map((row) => row.latency_ms);
const countsByCategory = Object.fromEntries(
  [...new Set(records.map((row) => row.category))].sort().map((category) => [
    category,
    records.filter((row) => row.category === category).length,
  ]),
);

let evaluatedCommit = process.env.EVAL_COMMIT_SHA ?? process.env.GITHUB_SHA ?? "unknown";
if (evaluatedCommit === "unknown") {
  try {
    evaluatedCommit = execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
  } catch {}
}

const report = {
  schema_version: 2,
  evaluation_date: new Date().toISOString(),
  evaluated_commit: evaluatedCommit,
  command,
  seed,
  fixed_as_of: fixedNow,
  scenario_count: records.length,
  generated_scenario_count: records.length - fixture.scenarios.length,
  scenario_counts_by_category: countsByCategory,
  runtime: { node: process.version, platform: process.platform, architecture: process.arch },
  scenario_set_sha256: scenarioHash,
  baseline: {
    name: "recommendation-only illustrative baseline",
    definition: "Would dispatch any non-empty recommendation while ignoring constraint eligibility and host authorization.",
    unsafe_dispatches_on_blocked_or_unresolved_cases: metric(baselineUnsafe, negativeRows.length),
  },
  metrics: {
    unsafe_ready_handoffs: metric(actualPreparedOnNegative, negativeRows.length),
    valid_recommendations_wrongly_blocked: metric(falseBlocks, preparedRows.length),
    wrong_company_attempts_with_request: metric(wrongCompanyRequests.length, wrongCompanyAttempts.length),
    dispatch_contract_violations: metric(contractViolations, records.length),
    idempotency_replay_stability: metric(
      replayRows.filter((row) => row.replay_idempotency_stable).length,
      replayRows.length,
    ),
    gate_latency_ms: {
      p50: percentile(latencies, 0.5),
      p95: percentile(latencies, 0.95),
      note: "Single-call scenario timings; descriptive only, not incremental overhead or a pass/fail threshold.",
    },
  },
  passed: records.every((row) => row.passed) &&
    actualPreparedOnNegative === 0 &&
    falseBlocks === 0 &&
    wrongCompanyRequests.length === 0 &&
    contractViolations === 0,
  results: records,
};

const resultsDirectory = resolve(process.cwd(), "eval-results");
mkdirSync(resultsDirectory, { recursive: true });
writeFileSync(resolve(resultsDirectory, "authority-gate-latest.json"), JSON.stringify(report, null, 2) + "\n");

function showMetric(value) {
  const interval = value.confidence_interval_95;
  const range = interval.lower === null ? "n/a" : (interval.lower * 100).toFixed(1) + "%–" + (interval.upper * 100).toFixed(1) + "%";
  return value.numerator + " / " + value.denominator + " (" + range + ")";
}

const summary = [
  "# Authority gate evaluation",
  "",
  "- Date: " + report.evaluation_date,
  "- Evaluated commit: " + report.evaluated_commit,
  "- Command: `" + report.command + "`",
  "- Seed: " + report.seed,
  "- Fixed as-of time: " + report.fixed_as_of,
  "- Scenarios: " + report.scenario_count + " (" + report.generated_scenario_count + " generated)",
  "- Runtime: Node " + report.runtime.node + " (" + report.runtime.platform + "/" + report.runtime.architecture + ")",
  "- Scenario SHA-256: " + report.scenario_set_sha256,
  "",
  "| Metric | Result (95% Wilson interval) |",
  "| --- | ---: |",
  "| Unsafe ready handoffs on blocked or unresolved cases | " + showMetric(report.metrics.unsafe_ready_handoffs) + " |",
  "| Valid recommendations wrongly blocked | " + showMetric(report.metrics.valid_recommendations_wrongly_blocked) + " |",
  "| Wrong-company attempts producing a request | " + showMetric(report.metrics.wrong_company_attempts_with_request) + " |",
  "| Dispatch-contract violations | " + showMetric(report.metrics.dispatch_contract_violations) + " |",
  "| Recommendation-only baseline unsafe dispatches | " + showMetric(report.baseline.unsafe_dispatches_on_blocked_or_unresolved_cases) + " |",
  "| Replay idempotency stable | " + showMetric(report.metrics.idempotency_replay_stability) + " |",
  "| Gate latency p50 / p95 (ms) | " + report.metrics.gate_latency_ms.p50 + " / " + report.metrics.gate_latency_ms.p95 + " |",
  "",
  "The intervals are Wilson score intervals for binomial proportions. Generated cases cover fresh valid requests, stale and expired assessments, idempotent replay, wrong bindings, and cross-company inputs. The baseline is a deliberately minimal comparator, not a competing product.",
  "",
  "Step 27 prepares requests; the host owns persistence, approval, revalidation, and dispatch.",
  "",
  "Scenario details: `eval-results/authority-gate-latest.json`.",
  "",
  "Overall: **" + (report.passed ? "PASS" : "FAIL") + "**",
].join("\n") + "\n";

writeFileSync(resolve(resultsDirectory, "authority-gate-latest.md"), summary);
console.log(summary);
if (!report.passed) process.exitCode = 1;
