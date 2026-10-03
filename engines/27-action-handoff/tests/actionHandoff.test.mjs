import assert from "node:assert/strict";
import { prepareDecisionActionHandoff } from "../runtime/decisionActionHandoff.ts";

const now = "2026-10-02T12:00:00.000Z";
const base = () => ({
  company_id: "company-1",
  decision_subject_id: "subject-1",
  decision_id: "decision-1",
  constraint_gate: {
    state: "ready",
    company_id: "company-1",
    eligible_option_ids: ["option-1", "option-2"],
  },
  recommendation: {
    company_id: "company-1",
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
    parameters: { priority: "high", work_item_id: "work-item-7" },
    evidence_refs: ["evidence-2", "evidence-1", "evidence-2"],
  },
  capability_assessment: {
    company_id: "company-1",
    capability_id: "operations.apply",
    actor_id: "actor-1",
    availability: "available",
    authorization: "allowed",
    policy_version: "policy-9",
    assessed_at: "2026-10-02T11:59:00.000Z",
    expires_at: "2026-10-02T13:00:00.000Z",
  },
});

const clock = () => now;
const options = { clock };

const prepared = prepareDecisionActionHandoff(base(), options);
assert.equal(prepared.status, "prepared");
assert.equal(prepared.authority_effect, "none");
assert.equal(prepared.prepared_request.dispatch_state, "not_dispatched");
assert.equal(prepared.prepared_request.company_id, "company-1");
assert.deepEqual(prepared.prepared_request.evidence_refs, ["evidence-1", "evidence-2"]);
assert.equal(prepared.prepared_request.expires_at, "2026-10-02T12:05:00.000Z");
assert.equal(
  prepared.prepared_request.idempotency_key,
  prepareDecisionActionHandoff(base(), options).prepared_request.idempotency_key,
);

const changedPayload = base();
changedPayload.binding.parameters.priority = "urgent";
assert.notEqual(
  prepared.prepared_request.idempotency_key,
  prepareDecisionActionHandoff(changedPayload, options).prepared_request.idempotency_key,
);

const approval = base();
approval.capability_assessment.authorization = "approval_required";
const approvalResult = prepareDecisionActionHandoff(approval, options);
assert.equal(approvalResult.status, "approval_required");
assert.equal(approvalResult.prepared_request.dispatch_state, "not_dispatched");

const abstained = base();
abstained.recommendation.status = "abstain";
abstained.recommendation.recommended_option_id = null;
const abstentionResult = prepareDecisionActionHandoff(abstained, options);
assert.equal(abstentionResult.status, "abstained");
assert.equal("prepared_request" in abstentionResult, false);

const ineligible = base();
ineligible.constraint_gate.eligible_option_ids = ["option-2"];
const ineligibleResult = prepareDecisionActionHandoff(ineligible, options);
assert.equal(ineligibleResult.status, "blocked");
assert.equal(ineligibleResult.reason_codes[0], "recommendation_not_constraint_eligible");

const unknown = base();
unknown.capability_assessment.authorization = "unknown";
assert.equal(prepareDecisionActionHandoff(unknown, options).status, "review_required");

const expired = base();
expired.capability_assessment.expires_at = "2026-10-02T11:59:59.000Z";
assert.equal(prepareDecisionActionHandoff(expired, options).status, "review_required");

const crossCompany = base();
crossCompany.binding.parameters.related = { company_id: "company-2" };
assert.throws(
  () => prepareDecisionActionHandoff(crossCompany, options),
  (error) => error.code === "cross_company_action_parameters",
);

const legacyScope = base();
legacyScope.binding.parameters.tenant_id = "company-1";
assert.throws(
  () => prepareDecisionActionHandoff(legacyScope, options),
  (error) => error.code === "legacy_company_boundary",
);

console.log("Step 27 action handoff acceptance scenarios passed");
