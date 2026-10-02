# Step 08 — Canonical Decision Model

## Purpose
Define Titan’s domain-neutral decision model. This is the semantic contract that future observation, evidence, comparison, prediction, ranking, recommendation, monitoring and approval systems can share. It deliberately does **not** encode donor shopping terminology.

## Canonical decision equation

**Subject + objectives + options + evidence + constraints + preferences → predicted outcomes → trade-offs → ranking → recommendation + confidence + authority requirements.**

The recommendation is advisory. Authority remains external and must be proven through governed execution before any real action occurs.

## Constitutional rules

1. `company_id` is the sole canonical tenant/company boundary.
2. The Decision Engine may understand, compare, predict, rank, recommend, explain, monitor and prepare execution requests.
3. It may not create identity, permission, entitlement, ownership, policy authority, financial authority or execution authority.
4. Hard constraints cannot be silently converted into scoring preferences.
5. Preferences never override permission, entitlement, policy, safety, privacy or company isolation.
6. Evidence remains independently traceable with provenance, freshness and confidence.
7. Predictions record assumptions and uncertainty.
8. Rankings record method/version/weights/scores so they can be reproduced and challenged.
9. `do nothing`, `investigate`, `defer`, `escalate`, `request approval`, `no safe action`, and `insufficient evidence` are first-class legitimate outcomes.
10. Historical decision records are not rewritten when later information changes the recommendation. New decisions supersede earlier ones while preserving lineage.

## Main objects

- **Subject** — what is being decided about.
- **Objective** — what success means. Multiple objectives are allowed.
- **Options** — candidate actions/choices, including non-action and investigation.
- **Evidence** — observations, facts and inferences with provenance.
- **Constraints** — hard or soft bounds on viable choices.
- **Preferences** — actor/company priorities that affect trade-offs but not authority.
- **Predicted outcomes** — modeled consequences per option and dimension.
- **Trade-offs** — explicit benefits and sacrifices.
- **Ranking** — reproducible ordering of viable options.
- **Recommendation** — proposed next-best action, not an execution command.
- **Confidence** — evidence/model uncertainty and missing-information state.
- **Authority requirements** — permissions/approvals/capabilities/risk/cost/privacy checks required before execution.

## Files

- `CANONICAL-DECISION-MODEL.json` — normative research model.
- `CANONICAL-DECISION-MODEL.schema.json` — machine-readable structural schema.
- `CANONICAL-DECISION-EXAMPLE.json` — domain-neutral example instance.
- `DECISION-LIFECYCLE.mmd` — lifecycle/authority separation graph.
- `DECISION-MODEL-FIELD-MATRIX.csv` — compact field/object inventory.
- `STEP-08-ACCEPTANCE.json` — pass acceptance evidence.

## Donor boundary

No donor runtime is made a Titan dependency by this step. The prior donor source, evidence and Step 07 isolation materials are preserved unchanged. Step 08 adds a Titan-owned semantic model alongside those research artifacts.
