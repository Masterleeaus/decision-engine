<p align="center">
  <img src="assets/decision-engine-banner.jpg" alt="Titan Decision Engine — evidence-led, transparent decision support" width="100%" />
</p>

<h1 align="center">Titan Decision Engine</h1>

<p align="center"><strong>Decision intelligence you can inspect, challenge, and govern.</strong></p>

<p align="center">
  A domain-neutral architecture for turning evidence into constraint-aware recommendations—with uncertainty, provenance, and authority boundaries made explicit.
</p>

<p align="center">
  <a href="#architecture">Architecture</a> ·
  <a href="#capabilities">Capabilities</a> ·
  <a href="#trust-boundaries">Trust boundaries</a> ·
  <a href="#implementation-status">Implementation status</a>
</p>

---

## Make the path to a decision visible

A single score can hide missing evidence, policy limits, competing objectives, or fragile assumptions. Titan separates those concerns into explicit stages so a reviewer can see what is known, what remains uncertain, which options are eligible, why one leads, and what approval is still required.

**Titan Decision Engine** is a modular decision-support layer for AI-assisted and human-reviewed systems. It is designed for business, operational, workforce, environmental, financial, procurement, scheduling, and other decision domains.

> **Decision model:** subject + objectives + options + evidence + constraints + preferences → predicted outcomes and trade-offs → ranking → recommendation + confidence + authority requirements.

The engine can analyze and recommend. It does not authorize or execute the recommendation.

## Architecture

<p align="center">
  <img src="assets/decision-engine-architecture.svg" alt="Titan Decision Engine stages from evidence through recommendation and verified learning, with provider reliability monitoring and an undispatched host action request" width="100%" />
</p>

The repository preserves a 25-step research bundle and extends its TypeScript reference engines through Step 28. The public source tree contains the canonical decision model and packet contract, Steps 10–25, workflow coordination, capability-gated action handoff, and provider reliability telemetry.

| Decision stage | Steps | Responsibility |
|---|---:|---|
| **Observe and ground** | 10–13 | Capture system or browser context, establish evidence, normalize entity references, and gather contextual facts with source and freshness metadata. |
| **Frame the choice** | 14–17 | Discover alternatives, state what success means, evaluate constraints, and apply scoped preferences. |
| **Compare and rank** | 18–20 | Compare unlike options, preserve missing data and trade-offs, attach provider-supplied forecasts, and calculate transparent rankings with sensitivity scenarios. |
| **Recommend and explain** | 21–23 | Recommend or abstain against configured thresholds, explain the result from explicit inputs, and apply observed-outcome confidence calibration. |
| **Preserve and learn** | 24–25 | Create hash-bound decision-history revisions and derive future calibration updates from verified outcomes. |
| **Orchestrate, hand off, and monitor** | 26–28 | Run ordered stages, request evidence-backed re-evaluation, prepare an expiring host request after the hard gate, and measure provider reliability without changing recommendations. |

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

## Integration pattern

Steps 26–27 provide reference workflow and action-handoff layers for a host application:

1. Adapt source systems into observations, evidence, canonical entities, and context.
2. Supply domain-specific providers for options and forecasts.
3. Provide objectives, constraints, and scoped preferences for the decision subject.
4. Run the ordered workflow; its constraint gate stops on missing, unknown, or ineligible hard requirements before scoring.
5. Use event or scheduled watch checks to request a new run when fresh evidence meets a condition.
6. Pass the resulting DecisionPacket to the host product, where its governance decides whether a recommended action may proceed.
7. When action preparation is useful, call Step 27 with the eligible recommendation, host option-to-capability binding, and fresh host assessment; the host handles approval, rechecks authority, and dispatches.
8. Wrap provider calls with Step 28 to collect privacy-minimized reliability observations; the host stores them and defines alerting or routing policy.

The coordinator sequences injected stage adapters. Durable storage, cross-run idempotency, providers, scheduling, notifications, and governed execution remain host responsibilities.

## Implementation status

This repository is a **research-backed architecture package with modular TypeScript reference engines, decision workflow coordination, action handoff, and provider reliability telemetry**. It is not yet a turnkey deployed service or a single installable SDK.

**Included**

- Canonical Decision Model and versioned DecisionPacket contract
- JSON Schema Draft 2020-12 definitions
- TypeScript runtime modules for Steps 10–28
- Step 26 workflow coordination, evidence-backed watch evaluation, and verified-outcome gating
- Step 27 capability-gated action request preparation without approval or dispatch
- Step 28 provider call capture and reliability aggregation without vendor telemetry
- Per-stage contracts, validators, tests, examples, and acceptance artifacts where provided
- Architecture assets and the original cumulative Step 25 research bundle

**Host-application work still required**

- A root package manifest and supported public SDK/export surface
- Durable history, learning, watch, and provider-telemetry storage; cross-run idempotency; operational alerting; and a production scheduler
- Production adapters for business systems and forecasting providers
- Authentication, authorization, approval, and governed execution integrations

Steps 26–28 are reference composition and monitoring layers; they do not provide production connectors, durable workflow/action/telemetry stores, a scheduler, approval service, alert delivery, or action execution. The checked-in acceptance and test-output files record staged development history. Some early step documents and logs refer to the pre-convergence Python implementation; `README-TYPESCRIPT-CONVERGENCE.md` describes the current TypeScript direction. Treat those records as historical artifacts and verify the current source and integration in the target application before relying on them as a release gate.

## Repository guide

| Path | What to find |
|---|---|
| [`docs/specification/08-canonical-decision-model/`](docs/specification/08-canonical-decision-model/) | Shared decision semantics, schema, example, and field matrix |
| [`docs/specification/09-decisionpacket-contract/`](docs/specification/09-decisionpacket-contract/) | Versioned packet contract, JSON Schema, domain profiles, and ten example packets |
| [`engines/10-observation-engine/`](engines/10-observation-engine/) – [`engines/28-provider-telemetry/`](engines/28-provider-telemetry/) | TypeScript reference engines, workflow coordination, action handoff, provider reliability telemetry, contracts, schemas, tests, and examples |
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
