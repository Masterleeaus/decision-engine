<p align="center">
  <img src="assets/decision-engine-banner.jpg" alt="Titan Decision Engine — evidence-led, transparent decision support" width="100%" />
</p>

<h1 align="center">Titan Decision Engine</h1>

<p align="center"><strong>Decision intelligence you can inspect, challenge, and govern.</strong></p>

<p align="center"><a href="https://github.com/Masterleeaus/decision-engine/actions/workflows/authority-gate-eval.yml"><img src="https://github.com/Masterleeaus/decision-engine/actions/workflows/authority-gate-eval.yml/badge.svg" alt="Authority gate evaluation"></a></p>

<p align="center">
  A domain-neutral architecture for turning evidence into constraint-aware recommendations—with uncertainty, provenance, and authority boundaries made explicit.
</p>

<p align="center">
  <a href="#architecture">Architecture</a> ·
  <a href="#capabilities">Capabilities</a> ·
  <a href="#trust-boundaries">Trust boundaries</a> ·
  <a href="#reproducible-authority-handoff-evaluation">Authority eval</a> ·
  <a href="#llm-in-the-loop-authority-gate-evaluation">LLM-in-loop eval</a> ·
  <a href="#quickstart-and-verification">Quickstart</a> ·
  <a href="#implementation-status">Implementation status</a>
</p>

---

## Decision intelligence that stays explainable

Teams make consequential choices with evidence scattered across systems, objectives pulling in different directions, and policy or approval requirements that are easy to lose in a score. Titan Decision Engine turns those inputs into a decision path that a reviewer can inspect from source evidence to recommendation.

**For product and platform teams**, it is a modular TypeScript decision layer for operational, workforce, financial, procurement, scheduling, environmental, and other AI-assisted workflows. It preserves evidence, uncertainty, constraints, trade-offs, provenance, and confidence so the next action is easier to evaluate and govern.

> **Value proposition:** turn complex evidence into constraint-aware recommendations with a clear boundary between analysis, host approval, and execution.

The engine can analyze and recommend. It does not authorize or execute the recommendation.

## Architecture

<p align="center">
  <img src="assets/decision-engine-architecture.svg" alt="Titan Decision Engine stages from evidence through verified learning, with event signal routing, provider reliability monitoring, and host action handoff" width="100%" />
</p>

The repository preserves a 25-step research bundle and extends its TypeScript reference engines through Step 30. The public source tree contains the canonical decision model and packet contract, Steps 10–25, workflow coordination, watch lifecycle management, event-to-watch signal routing, capability-gated action handoff, and provider reliability telemetry.

| Decision stage | Steps | Responsibility |
|---|---:|---|
| **Observe and ground** | 10–13 | Capture system or browser context, establish evidence, normalize entity references, and gather contextual facts with source and freshness metadata. |
| **Frame the choice** | 14–17 | Discover alternatives, state what success means, evaluate constraints, and apply scoped preferences. |
| **Compare and rank** | 18–20 | Compare unlike options, preserve missing data and trade-offs, attach provider-supplied forecasts, and calculate transparent rankings with sensitivity scenarios. |
| **Recommend and explain** | 21–23 | Recommend or abstain against configured thresholds, explain the result from explicit inputs, and apply observed-outcome confidence calibration. |
| **Preserve and learn** | 24–25 | Create hash-bound decision-history revisions and derive future calibration updates from verified outcomes. |
| **Orchestrate, manage watches, route, hand off, and monitor** | 26–30 | Coordinate ordered stages, manage watch lifecycle, route validated source changes to matching watches, request evidence-backed re-evaluation, prepare expiring host requests, and measure provider reliability. |

Steps 08 and 09 define the shared meaning and transport format for the pipeline:

- The **Canonical Decision Model** describes the subject, objectives, options, evidence, constraints, preferences, predictions, trade-offs, ranking, recommendation, confidence, and authority prerequisites.
- The versioned **DecisionPacket** carries those concepts between systems. Domain-specific fields belong in `extension_data`; they cannot redefine the canonical company boundary or authority rules.

## What makes the architecture different

### Hard requirements stay hard

Eligibility is decided before soft preferences and weighted scores. A hard constraint failure cannot be compensated for by a strong score elsewhere. Unknown hard requirements block eligibility by default, while soft violations remain visible as penalties.

### “Do nothing” and “not enough information” are valid outcomes

The canonical model can represent investigation, deferral, escalation, approval requests, and other non-action choices. The Best-Action Engine can abstain when there is no eligible candidate or configured confidence, coverage, or leader-margin thresholds are not met.

### Evidence and uncertainty travel with the result

Source references, timestamps, freshness, confidence, assumptions, missing measurements, and conflicts can remain explicit. A low-coverage comparison does not silently become complete, and forecast records carry their model, horizon, assumptions, and evidence references.

### A reviewer can see why the ranking changed

Rankings expose dimension-level contributions and support objective- and dimension-weight sensitivity scenarios. The explanation stage can show why an alternative leads, why others scored lower, which evidence mattered, what is uncertain, and what changes could move the result.

### Learning produces revisions; it does not rewrite the past

Decision history uses snapshots, hashes, and supersession links. The learning loop requires a verified outcome and verification references, then emits new forecast, assumption, recommendation, and confidence calibration statistics. Historical snapshots remain unchanged.

### Recommendation is separate from authority

The engine can describe prerequisites for action, but it does not create identity, permission, entitlement, ownership, approval, financial authority, or execution authority. A host system must apply its own governance before acting.

## Capabilities

| Step | Engine | Capability |
|---:|---|---|
| **10** | Observation | Accepts browser or system context, emits rule-based observations and candidate signals, and labels browser content as untrusted input. |
| **11** | Evidence extraction | Represents raw or derived evidence with source, timestamp, confidence, freshness, and optional derivation metadata. |
| **12** | Entity normalization | Groups source records within one `company_id` using strong identifiers and retains source-record references and evidence links. |
| **13** | Context enrichment | Collects facts from pluggable providers with source class, confidence, freshness, and per-provider receipts. |
| **14** | Option discovery | Collects and deduplicates candidate actions, resources, suppliers, assignments, interventions, schedules, strategies, tools, and resolutions while preserving provenance and feasibility state. |
| **15** | Objective model | Makes objective scope, direction, priority, weights, hardness, time horizon, thresholds, provenance, and conflicts explicit. |
| **16** | Constraint engine | Evaluates permission, budget, deadline, availability, jurisdiction, policy, environment, safety, privacy, capability, entitlement, and company-boundary constraints. |
| **17** | Preference model | Applies time-scoped company or actor preferences to trade-offs while rejecting authority-like preferences. |
| **18** | Comparison | Compares options across cost, time, quality, risk, benefit, sustainability, reversibility, confidence, reliability, and strategic value; reports coverage, pairwise trade-offs, and a descriptive Pareto frontier. |
| **19** | Outcome prediction | Validates and packages provider-supplied forecasts with horizons, bounds, confidence, assumptions, and evidence references. |
| **20** | Ranking | Produces decomposable scores, factor contributions, exclusions, confidence adjustments, and weight-sensitivity scenarios. |
| **21** | Best action | Selects a recommendation candidate or abstains based on candidate availability and configurable confidence, coverage, and margin thresholds. |
| **22** | Explanation | Produces structured evidence-linked reasons, lower-ranked alternatives, uncertainties, and sensitivity context; it does not include hidden chain-of-thought. |
| **23** | Confidence | Applies scoped calibration profiles based on observed-outcome bins, with raw confidence retained separately. |
| **24** | Decision history | Creates snapshot-hashed revisions and verifies supersession chains without editing earlier snapshots. |
| **25** | Learning loop | Uses verified outcomes to calculate forecast error, assumption reliability, recommendation performance, and confidence calibration updates. |
| **26** | Decision workflow | Composes Steps 10–25, emits hash-linked stage events, checks company scope, applies a fail-closed constraint gate, evaluates watches, and accepts learning updates only after external outcome verification. |
| **27** | Action handoff | Prepares an expiring, idempotent request only for a constraint-eligible recommendation and a fresh host capability assessment; approvals and dispatch remain with the host. |
| **28** | Provider reliability | Captures privacy-minimized provider outcomes, latency, freshness summaries, and reliability snapshots; health is diagnostic only. |
| **29** | Decision signal router | Maps host-validated field-change signals to active watches within the exact company and decision-subject scope; returns event-cycle requests without queueing or evaluating them. |
| **30** | Watch lifecycle | Plans watch creation, definition changes, pause, resume, and soft close with revision and event contracts; host authorization, listing, and atomic persistence remain external. |

## Domain-neutral by design

The DecisionPacket contract includes profiles and examples for:

- Operations
- Finance
- Workforce
- Environment
- CRM
- Assets
- Procurement
- Marketing
- Scheduling
- Other domains

A domain supplies its own entities, evidence, objectives, alternatives, and constraints. The shared packet keeps cross-domain semantics consistent while `extension_data` carries typed domain-specific detail.

## Trust boundaries

- **One company scope:** `company_id` is the canonical company boundary. The decision model does not create parallel tenant authority fields.
- **No authority transfer:** observations, evidence, provider facts, preferences, predictions, rankings, and learning updates carry no execution authority.
- **Fail closed on unknown hard constraints:** unresolved hard requirements remain visible and block eligibility by default.
- **Untrusted browser inputs:** page content can contribute evidence, but it cannot become policy or permission.
- **No hidden reasoning transcript:** explanations are generated from structured factors, evidence references, assumptions, uncertainty, and sensitivity data.
- **Governed execution stays external:** the calling product remains responsible for identity, authorization, approvals, risk, cost, privacy, receipts, and audit.
- **Provider health is diagnostic:** operational telemetry does not change recommendation ranking, confidence, constraint eligibility, authorization, or routing.

These are decision-support boundaries. They do not replace authentication, authorization, policy enforcement, or a governed execution service in the integrating application.

## Quickstart and verification

Node.js 22 or newer is required for the checked-in TypeScript reference runners (`--experimental-transform-types`). The repository intentionally has no root package manifest or dependency-install step: the runnable repository-level smoke test is the deterministic authority-gate evaluation.

Run the reproducible authority-gate evaluation documented below from the repository root. To run every reference-engine test without shell-specific globbing, use the portable entrypoint:

```bash
node scripts/reference-tests.mjs
```

The test entrypoint discovers `*.test.ts` and `*.test.mjs` files under `engines/*/tests/` and invokes Node's test runner with the same Node.js 22 transform-types flag used by CI.

## Reproducible authority handoff evaluation

**Claim tested:** Step 27 prepares a ready handoff only when the recommendation is constraint-eligible, the action binding matches, and the host capability assessment is fresh, available, and authorized. Requests remain undispatched; the host retains approval, persistence, revalidation, and execution.

Run from the repository root:

```bash
node --experimental-strip-types scripts/authority-gate-eval.mjs
```

The runner evaluates 20 labelled scenarios with fixed timestamp 2026-10-04T00:00:00.000Z and seed 20261004. It writes the full per-case report to [JSON](eval-results/authority-gate-latest.json) and [Markdown](eval-results/authority-gate-latest.md). CI runs on pushes and pull requests and uploads both files as an artifact.

**Measured 4 October 2026** against commit [7c05ddceaa818cf2bb87b7be7f1fe3f7468dac28](https://github.com/Masterleeaus/decision-engine/commit/7c05ddceaa818cf2bb87b7be7f1fe3f7468dac28); scenario SHA-256: 8e8516d4d2224ba2c5c2a240e084188d1620428ff1c0e8a5be42680eadd0afd6. The [GitHub Actions run](https://github.com/Masterleeaus/decision-engine/actions/runs/37170763045) passed.

| Measure | Recommendation-only illustrative baseline | Step 27 |
| --- | ---: | ---: |
| Blocked or unresolved scenarios accepted as actionable / emitted as ready handoffs | 15 / 17 | 0 / 17 |
| Valid eligible cases wrongly blocked | 0 / 3 | 0 / 3 |
| Wrong-company attempts producing a request | 2 / 2 | 0 / 2 |
| Scenario-level violations of the undispatched-request contract | Not applicable | 0 / 20 |

The baseline is a deliberately simple rule that would dispatch any non-empty recommendation while ignoring constraints and host authorization. It is a no-gate comparator, not a competing product. The approval-required case returns a request for the host approval flow; it remains undispatched and is not counted as a ready handoff.

Single-call timings are recorded in the JSON report for context only; they are not an incremental latency comparison. This evaluation tests the Step 27 reference function, not a deployed host's storage, approval, or dispatch integration.


## LLM-in-the-loop authority gate evaluation

A separate 200-case harness feeds untrusted model proposals to the Step 27 gate while keeping company identity, eligibility, authorization, capability state, and freshness host-owned. The model cannot call tools, and the harness never persists, approves, or executes a request.

Pushes and pull requests run a deterministic offline smoke check; they do not call a model. Run the workflow manually with `workflow_dispatch` for a live Responses API evaluation. The offline proposer fixture validates only the harness-to-gate wiring and is not an LLM test result. See the [evaluation method and run instructions](docs/llm-in-the-loop-authority-eval.md).

## Integration pattern

Steps 26–30 provide reference workflow, watch lifecycle, signal routing, monitoring, and action-handoff layers for a host application:

1. Adapt source systems into observations, evidence, canonical entities, and context.
2. Supply domain-specific providers for options and forecasts.
3. Provide objectives, constraints, and scoped preferences for the decision subject.
4. Run the ordered workflow; its constraint gate stops on missing, unknown, or ineligible hard requirements before scoring.
5. Use Step 30 to create, update, pause, resume, or close a watch. The host authorizes each command and atomically persists its revision and lifecycle event; watch-list queries remain host store operations.
6. For event-driven reevaluation, map authenticated source changes to canonical field paths and pass the host-validated signal and scoped watch candidates to Step 29. A host worker invokes Step 26 for each returned event-cycle request.
7. Keep scheduled watch checks in the host scheduler and use Step 26 to evaluate each due watch.
8. Pass the resulting DecisionPacket to the host product, where its governance decides whether a recommended action may proceed.
9. When action preparation is useful, call Step 27 with the eligible recommendation, host option-to-capability binding, and fresh host assessment; the host handles approval, rechecks authority, and dispatches.
10. Wrap provider calls with Step 28 to collect privacy-minimized reliability observations; the host stores them and defines alerting or routing policy.
The coordinator sequences injected stage adapters. Durable storage, cross-run idempotency, providers, scheduling, notifications, and governed execution remain host responsibilities.

## Implementation status

This repository is a **research-backed architecture package with modular TypeScript reference engines, decision workflow coordination, event-to-watch routing, action handoff, and provider reliability telemetry**. It is not yet a turnkey deployed service or a single installable SDK.

**Included**

- Canonical Decision Model and versioned DecisionPacket contract
- JSON Schema Draft 2020-12 definitions
- TypeScript runtime modules for Steps 10–30
- Step 26 workflow coordination, evidence-backed watch evaluation, and verified-outcome gating
- Step 27 capability-gated action request preparation without approval or dispatch
- Step 28 provider call capture and reliability aggregation without vendor telemetry
- Step 29 event-to-watch routing for host-validated normalized signals
- Step 30 revision-checked watch lifecycle planning and minimized transition events
- Per-stage contracts, validators, tests, examples, and acceptance artifacts where provided
- Architecture assets and the original cumulative Step 25 research bundle

**Host-application work still required**

- A root package manifest and supported public SDK/export surface
- Durable history, learning, watch, and provider-telemetry storage; cross-run idempotency; operational alerting; and a production scheduler
- Production adapters for business systems and forecasting providers
- Authentication, authorization, approval, and governed execution integrations

Steps 26–30 are reference composition, lifecycle, routing, and monitoring layers; they do not provide production connectors, durable watch listing or storage, command receipt retention, atomic persistence, cross-run queue deduplication, workflow/action/telemetry stores, a scheduler, approval service, alert delivery, or action execution. The checked-in acceptance and test-output files record staged development history. Some early step documents and logs refer to the pre-convergence Python implementation; `README-TYPESCRIPT-CONVERGENCE.md` describes the current TypeScript direction. Treat those records as historical artifacts and verify the current source and integration in the target application before relying on them as a release gate.

## Repository guide

| Path | What to find |
|---|---|
| [`docs/specification/08-canonical-decision-model/`](docs/specification/08-canonical-decision-model/) | Shared decision semantics, schema, example, and field matrix |
| [`docs/specification/09-decisionpacket-contract/`](docs/specification/09-decisionpacket-contract/) | Versioned packet contract, JSON Schema, domain profiles, and ten example packets |
| [`engines/10-observation-engine/`](engines/10-observation-engine/) – [`engines/30-watch-lifecycle/`](engines/30-watch-lifecycle/) | TypeScript reference engines, workflow coordination, watch lifecycle, signal routing, action handoff, provider reliability telemetry, contracts, schemas, tests, and examples |
| [`docs/archive-integration/REUSABLE-PATTERN-COVERAGE.md`](docs/archive-integration/REUSABLE-PATTERN-COVERAGE.md) | Deep-scan mapping from archive patterns to engine capabilities and host boundaries |
| [`docs/archive-integration/CAPABILITY-COVERAGE.csv`](docs/archive-integration/CAPABILITY-COVERAGE.csv) | Row-by-row disposition of all 44 archive-observed capabilities |
| [`README-TYPESCRIPT-CONVERGENCE.md`](README-TYPESCRIPT-CONVERGENCE.md) | Current runtime-language and convergence notes |
| [`archive/Titan Decision Engine Master Step 25.zip`](archive/Titan%20Decision%20Engine%20Master%20Step%2025.zip) | Original cumulative research and implementation bundle |
| [`docs/DEEP-SCAN-PROMPT.md`](docs/DEEP-SCAN-PROMPT.md) | Reusable repository-audit prompt |

## Explore the model

- [Canonical Decision Model](docs/specification/08-canonical-decision-model/README-STEP-08-CANONICAL-DECISION-MODEL.md)
- [DecisionPacket contract](docs/specification/09-decisionpacket-contract/README-STEP-09-DECISIONPACKET-CONTRACT.md)
- [DecisionPacket examples](docs/specification/09-decisionpacket-contract/examples/)
- [TypeScript convergence notes](README-TYPESCRIPT-CONVERGENCE.md)
- [Step 25 Learning Loop](engines/25-learning-loop/README-STEP-25.md)

---

**Titan Decision Engine is the decision-intelligence layer of the Titan architecture:** it makes reasoning inspectable and recommendations explainable while leaving real-world authority with the systems designed to govern action.
