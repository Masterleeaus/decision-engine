import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { performance } from "node:perf_hooks";
import { resolve } from "node:path";

import { prepareDecisionActionHandoff } from "../engines/27-action-handoff/runtime/decisionActionHandoff.ts";

const command = "node --experimental-strip-types scripts/authority-gate-eval.mjs";
const fixtureBytes = readFileSync(new URL("../evaluations/authority-gate/scenarios.json", import.meta.url));
const fixture = JSON.parse(fixtureBytes.toString("utf8"));
const fixedNow = fixture.fixed_as_of;
const seed = Number(process.env.AUTHORITY_EVAL_SEED ?? fixture.seed);

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

function randomGenerator(initialSeed) {
  let state = initialSeed >>> 0;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

function seededOrder(items, initialSeed) {
  const result = [...items];
  const random = randomGenerator(initialSeed);
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapWith = Math.floor(random() * (index + 1));
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

const outcomes = new Map();
const elapsedById = new Map();

for (const scenario of seededOrder(fixture.scenarios, seed)) {
  const input = merge(baseInput, scenario.overrides ?? {});
  const started = performance.now();
  outcomes.set(scenario.id, { output: attempt(input), input });
  elapsedById.set(scenario.id, performance.now() - started);
}

const records = fixture.scenarios.map((scenario) => {
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

const actualPreparedOnNegative = records.filter((row) =>
  row.expected.status !== "prepared" && row.actual.status === "prepared",
).length;
const validPreparedCases = records.filter((row) => row.expected.status === "prepared").length;
const falseBlocks = records.filter((row) =>
  row.expected.status === "prepared" &&
  (row.actual.status !== "prepared" || !row.actual.request),
).length;
const wrongCompanyAttempts = records.filter((row) => row.wrong_company);
const wrongCompanyRequests = wrongCompanyAttempts.filter((row) => row.actual.request);
const baselineUnsafe = records.filter((row) => row.baseline_unsafe_dispatch).length;
const contractViolations = records.filter((row) =>
  (row.actual.authority_effect && row.actual.authority_effect !== "none") ||
  (row.actual.request && row.actual.dispatch_state !== "not_dispatched"),
).length;
const latencies = records.map((row) => row.latency_ms);
let evaluatedCommit = process.env.EVAL_COMMIT_SHA ?? process.env.GITHUB_SHA ?? "unknown";

if (evaluatedCommit === "unknown") {
  try {
    evaluatedCommit = execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
  } catch {}
}

const report = {
  schema_version: 1,
  evaluation_date: new Date().toISOString(),
  evaluated_commit: evaluatedCommit,
  command,
  seed,
  scenario_count: records.length,
  runtime: { node: process.version, platform: process.platform, architecture: process.arch },
  scenario_set_sha256: createHash("sha256").update(fixtureBytes).digest("hex"),
  baseline: {
    name: "recommendation-only illustrative baseline",
    definition: "Would dispatch any non-empty recommendation while ignoring constraint eligibility and host authorization.",
    unsafe_dispatches_on_blocked_or_unresolved_cases: {
      numerator: baselineUnsafe,
      denominator: records.length - validPreparedCases,
    },
  },
  metrics: {
    unsafe_ready_handoffs: { numerator: actualPreparedOnNegative, denominator: records.length - validPreparedCases },
    valid_recommendations_wrongly_blocked: { numerator: falseBlocks, denominator: validPreparedCases },
    wrong_company_attempts_with_request: { numerator: wrongCompanyRequests.length, denominator: wrongCompanyAttempts.length },
    dispatch_contract_violations: { numerator: contractViolations, denominator: records.length },
    idempotency_replay_stable: records.every((row) => row.replay_idempotency_stable),
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

const summary = [
  "# Authority gate evaluation",
  "",
  "- Date: " + report.evaluation_date,
  "- Evaluated commit: " + report.evaluated_commit,
  "- Command: `" + report.command + "`",
  "- Seed: " + report.seed,
  "- Scenarios: " + report.scenario_count,
  "- Runtime: Node " + report.runtime.node + " (" + report.runtime.platform + "/" + report.runtime.architecture + ")",
  "- Scenario SHA-256: " + report.scenario_set_sha256,
  "",
  "| Metric | Result |",
  "| --- | ---: |",
  "| Unsafe ready handoffs | " + report.metrics.unsafe_ready_handoffs.numerator + " / " + report.metrics.unsafe_ready_handoffs.denominator + " |",
  "| Valid recommendations wrongly blocked | " + report.metrics.valid_recommendations_wrongly_blocked.numerator + " / " + report.metrics.valid_recommendations_wrongly_blocked.denominator + " |",
  "| Wrong-company attempts producing a request | " + report.metrics.wrong_company_attempts_with_request.numerator + " / " + report.metrics.wrong_company_attempts_with_request.denominator + " |",
  "| Dispatch-contract violations | " + report.metrics.dispatch_contract_violations.numerator + " / " + report.metrics.dispatch_contract_violations.denominator + " |",
  "| Recommendation-only baseline unsafe dispatches | " + report.baseline.unsafe_dispatches_on_blocked_or_unresolved_cases.numerator + " / " + report.baseline.unsafe_dispatches_on_blocked_or_unresolved_cases.denominator + " |",
  "| Gate latency p50 / p95 (ms) | " + report.metrics.gate_latency_ms.p50 + " / " + report.metrics.gate_latency_ms.p95 + " |",
  "",
  "The baseline is a deliberately minimal comparator, not a competing product. Step 27 prepares requests; the host owns persistence, approval, revalidation, and dispatch.",
  "",
  "Scenario details: `eval-results/authority-gate-latest.json`.",
  "",
  "Overall: **" + (report.passed ? "PASS" : "FAIL") + "**",
].join("\n") + "\n";

writeFileSync(resolve(resultsDirectory, "authority-gate-latest.md"), summary);
console.log(summary);
if (!report.passed) process.exitCode = 1;
