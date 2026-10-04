import assert from "node:assert/strict";

import { prepareDecisionActionHandoff } from "../engines/27-action-handoff/runtime/decisionActionHandoff.ts";

const asOf = "2026-10-04T00:00:00.000Z";

function baseInput() {
  return {
    company_id: "demo-company",
    decision_subject_id: "demo-subject",
    decision_id: "demo-decision",
    as_of: asOf,
    constraint_gate: {
      state: "ready",
      company_id: "demo-company",
      eligible_option_ids: ["option-1"],
    },
    recommendation: {
      company_id: "demo-company",
      decision_subject_id: "demo-subject",
      decision_id: "demo-decision",
      status: "recommend",
      recommended_option_id: "option-1",
      authority_effect: "none",
    },
    binding: {
      action_id: "apply-demo-option",
      option_id: "option-1",
      capability_id: "demo.apply",
      capability_version: "1",
      target_ref: "demo-target",
      parameters: {
        company_id: "demo-company",
        target_ref: "demo-target",
      },
      evidence_refs: ["demo-evidence"],
    },
    capability_assessment: {
      company_id: "demo-company",
      capability_id: "demo.apply",
      actor_id: "demo-actor",
      availability: "available",
      authorization: "allowed",
      policy_version: "demo-policy-1",
      assessed_at: "2026-10-03T23:59:00.000Z",
      expires_at: "2026-10-04T00:10:00.000Z",
    },
  };
}

const cases = [
  {
    name: "eligible recommendation",
    input: baseInput(),
    expected: { status: "prepared", request: true },
  },
  {
    name: "ineligible recommendation",
    input: {
      ...baseInput(),
      constraint_gate: {
        state: "ready",
        company_id: "demo-company",
        eligible_option_ids: ["option-2"],
      },
    },
    expected: { status: "blocked", request: false },
  },
  {
    name: "approval-required handoff",
    input: {
      ...baseInput(),
      capability_assessment: {
        ...baseInput().capability_assessment,
        authorization: "approval_required",
      },
    },
    expected: { status: "approval_required", request: true },
  },
];

const results = cases.map(({ name, input, expected }) => {
  const result = prepareDecisionActionHandoff(input, { clock: () => asOf });
  assert.equal(result.status, expected.status, name);
  assert.equal(Boolean(result.prepared_request), expected.request, name);
  assert.equal(result.authority_effect, "none", name);
  if (result.prepared_request) {
    assert.equal(result.prepared_request.dispatch_state, "not_dispatched", name);
  }
  return {
    name,
    status: result.status,
    reason_codes: result.reason_codes,
    request_prepared: Boolean(result.prepared_request),
    dispatch_state: result.prepared_request?.dispatch_state ?? null,
    authority_effect: result.authority_effect,
  };
});

console.log(JSON.stringify({ as_of: asOf, synthetic: true, results }, null, 2));
console.log("Authority gate demo passed: recommendations remain undispatched and host authority is unchanged.");
