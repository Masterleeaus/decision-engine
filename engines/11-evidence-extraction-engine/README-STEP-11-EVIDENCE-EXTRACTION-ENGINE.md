# Step 11 — Evidence Extraction Engine

This cumulative research workspace adds Titan's governed evidence acquisition layer on top of the Step 10 Observation Engine.

## Implemented
- Versioned `EVIDENCE.schema.json` and constitutional contract.
- Runtime `EvidenceExtractionEngine` for raw acquisition, governed derivation, freshness reassessment and integrity verification.
- Browser and system adapters that convert specialized extraction into domain-neutral evidence records.
- Mandatory source provenance, observed/retrieved timestamps, confidence, freshness and SHA-256 content integrity.
- Hard raw-versus-derived separation. Derived records retain parent evidence IDs, transform version, assumptions and formula/method.
- `company_id` is the sole canonical company boundary; cross-company derivation is rejected.
- Evidence is explicitly non-authoritative. Browser/page content remains untrusted.
- Donor extraction patterns are generalized without introducing donor services, selectors, branding, telemetry or infrastructure as Titan dependencies.

## Key invariant
Evidence answers **“what supports this?”** It does not answer **“may Titan do this?”** and cannot grant execution authority.


## TypeScript convergence
Runtime, tests, and validation for this layer are now TypeScript-first. Superseded Python runtime/test/validator files were removed during the Step 25 TypeScript convergence pass.
