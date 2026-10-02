# Step 12 — Entity Normalization Engine

This pass implements Titan's domain-neutral entity identity layer. It recognizes source records that represent the same underlying person, item, asset, supplier, job, company, opportunity, intervention or resource while retaining every source identity and the evidence used to resolve the match.

## Core guarantees

- `company_id` is the sole tenant/company boundary and matching never crosses it.
- Strong identifiers can establish identity only when compatible and non-conflicting.
- Weak similarity creates candidates, not silent irreversible merges.
- Conflicts and ambiguity are explicit resolution states.
- Source-system IDs, aliases, locators and evidence references are retained.
- Merge/split lineage is preserved.
- Entity normalization creates no permission, ownership, authorization or execution authority.

## Runtime

`runtime/entity_normalization_engine.py` implements normalization, candidate scoring, safe resolution, canonical entity creation, source attachment, manual merge and reversible split lineage. `runtime/adapters.py` bridges Observation Engine and Evidence Extraction Engine records into normalization inputs.


## TypeScript convergence
Runtime, tests, and validation for this layer are now TypeScript-first. Superseded Python runtime/test/validator files were removed during the Step 25 TypeScript convergence pass.
