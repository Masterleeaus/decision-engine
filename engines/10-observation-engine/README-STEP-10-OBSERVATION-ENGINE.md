# Step 10 — Observation Engine

This pass implements Titan's domain-neutral **Observation Engine**. It generalizes the donor's page/product sensing patterns into a reusable perception layer for browser and system context.

## Constitutional boundary

An Observation answers **what is present or changing?** It does not answer **what should we do?** and it never answers **are we authorized to do it?**

- `company_id` is the sole canonical company boundary.
- Browser/page content is treated as untrusted input and recorded with provenance.
- System records may be authenticated or authoritative for specific facts, but source authority does not transfer execution authority.
- `opportunity`, `problem`, and `decision_subject` observations are candidates for downstream evaluation—not recommendations.
- No observation can grant approval, entitlement, financial authority, policy authority, identity authority, or execution authority.
- Raw, normalized, and derived evidence remain distinguishable.

## Implemented runtime

`runtime/observation_engine.py` provides a dependency-free reference engine with:

1. company-boundary validation and rejection of legacy tenant keys;
2. browser and system ingestion paths;
3. fact extraction and conservative browser lexical signals;
4. domain-neutral entity recognition;
5. generic state derivation;
6. configurable rule-based signal/problem/opportunity/decision-subject detection;
7. evidence IDs and provenance;
8. confidence and limitations;
9. immutable observation IDs and lifecycle fields;
10. no networking, action execution, or recommendation generation.

Adapters expose browser and authenticated-system entry points without coupling the engine to Chrome, a specific CRM, or donor infrastructure.

## Artifacts

- `OBSERVATION-CONTRACT.json` — normative semantics/invariants.
- `OBSERVATION.schema.json` — JSON Schema Draft 2020-12.
- `runtime/` — executable reference engine and adapters.
- `examples/` — ten cross-domain input contexts and generated observation outputs.
- `DONOR-TO-OBSERVATION-GENERALIZATION.csv` — explicit donor-pattern → Titan-pattern boundary mapping.
- `OBSERVATION-FIELD-MATRIX.csv` — canonical field semantics.
- `OBSERVATION-PIPELINE.mmd` — flow graph.
- `tests/test_observation_engine.py` — executable tests.
- `STEP-10-ACCEPTANCE.json` — verification record.

## Relationship to DecisionPacket

Step 09 defines the recommendation transport contract. Step 10 supplies a lower-level evidence/perception layer. Later passes may transform observations into DecisionPacket subjects/evidence/options, but this engine deliberately does not rank or recommend.

CODEE_STEP: `3f8fffac-07d9-413f-b0b2-100f7d0fa1d5|run-1788359991344-80b410c98cb94|step-10|s10-mtk7d4q8-ly4rhjnh`


## TypeScript convergence
Runtime, tests, and validation for this layer are now TypeScript-first. Superseded Python runtime/test/validator files were removed during the Step 25 TypeScript convergence pass.
