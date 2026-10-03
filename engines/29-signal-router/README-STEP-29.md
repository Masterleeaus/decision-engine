# Step 29 — Decision Signal Router

Step 29 fills the gap between an external source change and Step 26's watch evaluator. Step 30 manages watch definitions and their lifecycle. A host maps an authenticated event into a small, payload-free `DecisionSignal`; this router finds active watches in the same company and decision-subject scope whose condition field overlaps a changed field path, then returns event-cycle requests for the host to process.

## Route flow

1. The host validates the source, transport, and collection permissions.
2. The host maps the event to a stable signal ID and canonical changed-field paths.
3. The host loads candidate watches for that company and decision subject.
4. `routeDecisionSignal` returns matching active watch IDs in stable order with a per-signal/per-watch idempotency hint.
5. The host durably deduplicates and enqueues accepted requests; its worker invokes Step 26 `runDecisionWatchCycle`.

An exact path match routes. A parent/child path change also routes (`inventory` matches `inventory.available`; `inventory.available.count` matches `inventory.available`). Matching uses path boundaries, so `price` does not match `unit_price`. The watch evaluator still checks fresh evidence and the actual condition before it can request a decision rerun.

An event with no changed-field metadata returns `review_required` with no requests rather than waking every watch. Paused and closed watches, and watches in another company or subject scope, are skipped. Duplicate identical index rows collapse to one request; conflicting duplicate rows fail closed.

## Idempotency and authority

The router's hash key is a stable correlation hint derived from `company_id`, `signal_id`, and `watch_id`. It is not a durable deduplication mechanism; the host must enforce event uniqueness and queue/outbox semantics across retries. Routed objects extend the Step 26 cycle request with source correlation fields while preserving `trigger: "event"`.

Routing does not evaluate watch conditions, read evidence, start workflows, persist state, write to an outbox, send notifications, or authorize or execute actions. Every result has `authority_effect: "none"`.

## Archive mapping and evidence

- **Observed:** `03-runtime-dependency-mapping/COMMUNICATION-PROTOCOL-CATALOG.md` documents the donor's page-world, content-script, and background bridge protocols. `07-donor-boundary-isolation/REUSABLE-ARCHITECTURAL-PATTERNS.csv` classifies `page_extension_bridge` for reimplementation in the Interaction/Omni adapter with message contracts and origin validation; it classifies `watch_condition` as a Watch & Trigger Engine pattern.
- **Inferred:** The reusable gap between those patterns is a host-neutral router from validated field-change signals to watches in the same company and decision-subject scope.
- **Proposed:** Step 29 implements that router as a pure mapping layer that returns Step 26 event-cycle requests. It copies no donor message names, page scripts, or commerce event detectors.
- **Missing:** The host still needs to validate source events, normalize field paths, persist watch indexes, deduplicate and enqueue requests, and invoke Step 26.

**Inputs inspected:** archive Step 03 communication catalog, Step 07 reusable-pattern matrix, current Step 26 watch contract/runtime, and the 44-row archive capability coverage. **Authority:** the Step 07 donor-boundary dispositions and the repository's company-scoped Step 26 contract. **Assumption:** the host supplies canonical dot-separated field paths. **Limitation:** no tests have been run in this integration pass.

## Status

Status: **Integration candidate**. Runtime, schemas, contract, example, and acceptance scenarios are staged. Final verification ran with Node.js 24.19.0: `node --experimental-strip-types tests/signalRouter.test.mjs` — 7 passed, 0 failed. TypeScript static compilation was unavailable in the workspace.
