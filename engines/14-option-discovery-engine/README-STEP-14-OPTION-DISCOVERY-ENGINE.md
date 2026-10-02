# Step 14 — Option Discovery Engine

This pass generalizes donor alternative-product discovery into Titan's domain-neutral option discovery layer. The engine generates candidate **actions, resources, suppliers, assignments, interventions, schedules, strategies, tools and resolutions** for any decision subject.

## Constitutional boundaries

- `company_id` is the sole canonical tenant/company boundary.
- Discovery finds and constructs **alternatives**; it does not rank, recommend, approve or execute them.
- Every candidate has provenance, discovery rationale, confidence, evidence/constraint references and an explicit feasibility state.
- Hard failures yield `ineligible`; unresolved required information yields `unknown`; only candidates with neither are `eligible`.
- Duplicate alternatives discovered through multiple providers are consolidated while preserving all provenance.
- Canonical entity identity is referenced, never rewritten.
- Context Enrichment can seed discovery, but enriched facts do not manufacture authority.
- `do nothing`, `investigate`, `defer`, `escalate`, or other non-execution choices can be represented where they are meaningful alternatives.

## Runtime

`runtime/option_discovery_engine.py` supplies a provider interface, normalized candidate contract, company guard, feasibility classification, duplicate consolidation and discovery receipts.

`runtime/adapters.py` bridges Step 10 observations and Step 13 context envelopes into option-discovery requests and converts `OptionSet` candidates into the canonical decision model's option shape.


## TypeScript convergence
Runtime, tests, and validation for this layer are now TypeScript-first. Superseded Python runtime/test/validator files were removed during the Step 25 TypeScript convergence pass.
