# Step 26 — Decision Workflow and Monitoring

Step 26 connects the existing TypeScript reference engines into one ordered, company-scoped workflow. It adds a pure watch evaluator that can request a fresh decision run when a condition is met.

The archive deep scan identified 44 observable donor capabilities across observation, recognition, extraction, comparison, memory, prediction, ranking, recommendation, monitoring, and triggering. Steps 10–25 already cover the reusable decision stages. Step 26 adds the missing cross-stage workflow and the generic monitoring loop while keeping donor-specific browser and commerce behavior behind host adapters.

## Decision lifecycle

1. Observe source context and create observations.
2. Extract evidence, normalize entity references, and enrich context.
3. Discover options and define objectives.
4. Evaluate hard constraints before scoring.
5. Apply scoped preferences, compare options, and attach provider-supplied forecasts.
6. Rank eligible options, recommend or abstain, explain the result, and calibrate confidence.
7. Append the decision history revision.
8. After a verified outcome, append a learning revision for future decisions.

The coordinator accepts manual, event, scheduled, or watch-triggered requests. It records ordered stage lifecycle events with output hashes and carries the run and idempotency keys into every adapter. Host storage is responsible for enforcing cross-run idempotency and retaining the event log.

## Constraint gate

The constraints adapter must return a workflow_gate with one of three states:

- ready — one or more eligible option identifiers are supplied and evaluation continues.
- abstain — no safe eligible option remains; later scoring stages are skipped.
- review_required — uncertainty or a missing/malformed gate prevents evaluation.

A ready gate with no eligible options becomes review_required. This keeps unknown hard requirements from being treated as satisfied.

## Watch and re-evaluation

DecisionWatch supports changed, equality, numeric threshold, containment, and existence conditions. Step 30 creates, updates, pauses, resumes, and closes watch definitions through a revision-checked host store contract. Step 29 routes validated source signals to relevant active watches. Each Step 26 evaluation still requires fresh evidence for the watched field and verifies the company and decision-subject scope. Expired, stale, missing, or ambiguous inputs return unknown and do not request a run.

A satisfied condition returns a rerun_decision request with evidence references and a stable trigger identifier. The watch-cycle adapter contract commits the watch update and rerun request to an idempotent outbox in one transaction. A host scheduler or event adapter owns the store and outbox worker; the worker can start a new workflow run. The watch engine never sends notifications, applies changes, or executes the recommended action.

## Verified-outcome learning

recordVerifiedOutcome requires a verification adapter before it calls the learning adapter. Only a verified result with at least one verification reference reaches the learning loop. The new learning event must be appended as a revision; earlier decisions and evidence remain immutable.

## Adapter mapping

| Workflow stage | Existing reference stage |
|---|---|
| observation | Step 10 Observation Engine |
| evidence | Step 11 Evidence Extraction Engine |
| entity_normalization | Step 12 Entity Normalization Engine |
| context_enrichment | Step 13 Context Enrichment Engine |
| option_discovery | Step 14 Option Discovery Engine |
| objectives | Step 15 Objective Model |
| constraints | Step 16 Constraint Engine |
| preferences | Step 17 Preference Model |
| comparison | Step 18 Comparison Engine |
| prediction | Step 19 Outcome Prediction Engine |
| ranking | Step 20 Ranking Engine |
| best_action | Step 21 Best-Action Engine |
| explanation | Step 22 Explanation Engine |
| confidence | Step 23 Confidence Engine |
| history | Step 24 Decision History |
| verified outcome | Step 25 Learning Loop |

Adapters translate the shared workflow context into each engine's current function signatures. Providers, authorization, durable storage, scheduling, and business-system access remain host responsibilities.

## Running the reference tests

With Node.js 22.6 or later, run:

    node --experimental-strip-types tests/workflow.test.mjs

## Boundaries

- company_id is the sole company boundary. Legacy tenant_id and tenant_company_id fields are rejected.
- Every artifact carrying company_id must match the workflow request.
- Watch triggers and recommendations have authority_effect none.
- The workflow engine does not include a root package, production connectors, durable store, scheduler, notification delivery, or governed execution.
- Browser page hooks, shopping-specific features, coupon actions, transformed merchant links, and order tracking remain outside the domain-neutral engine.
