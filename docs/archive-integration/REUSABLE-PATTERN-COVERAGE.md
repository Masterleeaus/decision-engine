# Archive Pattern Coverage

**Scope:** Map reusable architecture from the Step 25 deep-scan archive to the decision-engine repository. This covers domain-neutral decision support; it does not promote the donor extension into the product.

**Authority and evidence:** The archive's pattern dispositions are in `07-donor-boundary-isolation/REUSABLE-ARCHITECTURAL-PATTERNS.csv`, capability contracts in `04-capability-deobfuscation/CAPABILITY-RUNTIME-CONTRACTS.csv`, and observable outcomes in `05-behavioural-capability-inventory/CANONICAL-BEHAVIOURAL-CAPABILITY-INVENTORY.json`. The row-by-row disposition of all 44 observable capabilities is recorded in [`CAPABILITY-COVERAGE.csv`](CAPABILITY-COVERAGE.csv). Step 07 marks browser, commerce, and vendor-specific code as adapter or excluded scope.

| Archive pattern | Decision-engine coverage | Boundary / remaining work |
|---|---|---|
| Browser observation adapter | Step 10 accepts browser or system observations as source inputs. | **Host adapter:** browser integration, source allowlists, page lifecycle, and collection permissions. |
| Page extension bridge | No extension message bridge is embedded in the engine. | **Host adapter:** validate origins and transport messages in the Interaction or browser layer. |
| Configurable extraction | Steps 10–11 turn supplied observations into evidence and preserve provenance. | **Host provider:** supply selectors, parsers, source configuration, and privacy rules. |
| Offscreen processing | No offscreen runtime is included. | **Out of core scope:** browser-specific runtime belongs to the host adapter. |
| Entity normalization | Step 12 normalizes source records and records evidence-linked resolution. | Provider adapters supply source identifiers and records. |
| Context enrichment | Step 13 accepts provider records with confidence, freshness, source class, and receipts. | Providers and their credentials/endpoints stay host-owned. |
| Alternative discovery | Step 14 accepts provider-neutral option candidates and preserves feasibility/provenance. | Domain providers discover candidate options. |
| Persistent memory | Steps 24–25 provide immutable decision history and verified-outcome learning revisions; Step 26 defines the watch-cycle store boundary. | **Host storage:** durable, encrypted, company-scoped retention and cross-run idempotency. |
| Watch condition | Step 26 evaluates fresh evidence and returns a stable rerun request; watch update and outbox commit are delegated to a host store. | Scheduler, store, outbox worker, and notification delivery remain host-owned. |
| Transaction-state observation | Step 10 can carry generic process-state evidence. | Donor shopping checkout and purchase detectors are not copied; domain detectors belong in adapters. |
| Evidence reliability telemetry | Step 26 emits ordered lifecycle events and output hashes. | **Host diagnostics:** aggregate provider health, parser latency, and operational telemetry under Titan policy. |
| Capability gating | Step 16 evaluates hard decision constraints; Step 27 checks the host's current capability assessment before preparing a request. | Capability registry, identity, authorization, entitlements, and policy enforcement remain authoritative in the host. |
| Network provider abstraction | Steps 13–14 consume injected provider records/candidates without vendor URLs. | Production connectors, secrets, retries, and rate limits belong to the host. |
| UI surface projection | No product-specific UI is included. | **Host application:** project recommendations into an approved interface. |
| Execution preparation | Step 27 builds a short-lived, idempotent, undispatched request from a constraint-eligible recommendation and a host capability assessment. | Approval, durable queuing, dispatch, execution, and receipts remain host-owned. |

## Capability outcomes retained or excluded

The archive's 44 donor-observed outcomes include generic decision patterns plus browser and commerce behavior. The engine retains neutral observation, evidence, entity, context, option, objective, constraint, preference, comparison, prediction, ranking, recommendation, explanation, confidence, history, learning, workflow, watch, capability-gating, and action-handoff patterns.

Commerce outcomes such as retailer-specific page detection, coupon entry, affiliate-link conversion, resale lookup, purchase recording, order tracking, seller-specific offers, and shopping collections remain outside the core. Their reusable shape is represented through provider and host-adapter boundaries; their donor-specific selectors, APIs, brands, and vendor dependencies are not imported.

## Remaining host integration

The repository provides reference engines and contracts. A host application still needs to supply providers, capability assessments, durable repositories, cross-run deduplication, scheduling, authorization, approvals, action dispatch, execution receipts, and operational telemetry. No capability assessment or prepared action request from this repository substitutes for those host authorities.
