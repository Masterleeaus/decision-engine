# Step 13 — Context Enrichment Engine

This pass implements Titan's domain-neutral context enrichment layer. It augments an already-normalized canonical entity with contextual facts from internal systems, external providers, historical records, current state, environmental context, operational signals, financial information and Knowledge Authority.

## Constitutional boundaries

- `company_id` remains the sole canonical tenant/company boundary.
- `entity_id` is referenced; enrichment never rewrites canonical identity.
- Every fact retains provider/source provenance, timestamps, confidence and freshness.
- Raw and derived/asserted values remain distinguishable.
- Conflicting active facts are retained and surfaced. A `resolved_view` is a projection produced by explicit precedence, not destructive overwrite.
- Provider class alone does not create authority. `authoritativeness`, freshness, confidence and field-scoped policy remain inspectable inputs.
- Knowledge Authority may contribute policies, constraints and canonical knowledge; it does not authorize execution.
- Financial, environmental and operational enrichments are context for future decisions, not actions.

## Runtime

`runtime/context_enrichment_engine.py` implements pluggable enrichment providers, company/entity isolation, normalized `EnrichmentFact` creation, freshness evaluation, provider receipts, conflict retention and deterministic resolved-context projection.

`runtime/adapters.py` provides bridges from canonical entities, observations and evidence records without creating duplicate identity or authority models.

## Source classes

`internal`, `external`, `historical`, `current_state`, `environmental`, `operational`, `financial`, `knowledge_authority`.


## TypeScript convergence
Runtime, tests, and validation for this layer are now TypeScript-first. Superseded Python runtime/test/validator files were removed during the Step 25 TypeScript convergence pass.
