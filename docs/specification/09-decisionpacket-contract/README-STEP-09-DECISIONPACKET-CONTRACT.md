# Step 09 — DecisionPacket Contract

This pass implements a stable, versioned Titan `DecisionPacket` capable of representing decision recommendations across operations, finance, workforce, environment, CRM, assets, procurement, marketing, scheduling, and future domains.

## Constitutional rules

- `company_id` is the sole canonical company/tenant boundary.
- A DecisionPacket communicates analysis, alternatives, evidence, predicted outcomes, ranking, recommendation, confidence, and authority prerequisites.
- It never grants authority and never acts as an execution command.
- Domain-specific extensions live under `extension_data`; they cannot redefine the canonical boundary or authority model.
- IDs link evidence, outcomes, ranking and recommendation so packets remain auditable and machine-checkable.
- Packet revisions supersede prior packets; they do not silently rewrite historical decisions.

## Artifacts

- `DECISIONPACKET-CONTRACT.json` — normative contract semantics and invariants.
- `DECISIONPACKET.schema.json` — JSON Schema Draft 2020-12 structural contract.
- `DOMAIN-PROFILES.json` — domain-neutral profiles for the named Titan domains.
- `examples/*.decisionpacket.json` — ten contract fixtures covering every requested domain plus extensibility.
- `validate_decisionpacket.py` — semantic validator for cross-reference, authority, tenant-boundary, and recommendation invariants.
- `DECISIONPACKET-FIELD-MATRIX.csv` — field-level purpose/stability map.
- `STEP-09-ACCEPTANCE.json` — executed verification record.

## Relationship to Step 08

Step 08 defines the generalized conceptual decision model. Step 09 turns that model into a transportable, versioned packet contract that Titan surfaces, AI workers, domain providers, Omni, and governed execution bridges can exchange without transferring authority.
