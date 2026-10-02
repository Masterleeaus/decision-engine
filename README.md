<p align="center">
  <img src="assets/decision-engine-banner.jpg" alt="Titan Decision Engine — evidence moves through a transparent decision pipeline" width="100%" />
</p>

<h1 align="center">Titan Decision Engine</h1>

<p align="center"><strong>Decision intelligence that can explain its recommendation, show its uncertainty, preserve its history, and learn from verified outcomes.</strong></p>

<p align="center">
  <a href="#the-architecture">Architecture</a> ·
  <a href="#what-makes-it-different">What makes it different</a> ·
  <a href="#engine-capabilities">Capabilities</a> ·
  <a href="#project-status">Project status</a>
</p>

---

## From raw signals to accountable decisions

Most decision software jumps from data to a score. Titan breaks that jump into explicit, inspectable stages: it observes, establishes evidence, resolves entities, enriches context, discovers alternatives, defines what “better” means, applies hard constraints, compares outcomes, ranks eligible choices, and explains its recommendation.

The result is a domain-neutral decision-intelligence architecture for business, workforce, environmental, financial, operational, procurement, scheduling, and other decision problems. The engine modules pair available TypeScript runtimes with contracts, schemas, validators, tests, acceptance artifacts, and examples where provided.

**Its defining boundary is simple:** the engine can reason and recommend; it does not grant permission or execute the recommendation. Authority stays in a separate governed system.

## The architecture

<p align="center">
  <img src="assets/decision-engine-architecture.svg" alt="Titan Decision Engine architecture from observed reality and evidence through options, constraints, comparison, recommendation, explanation, and verified learning" width="100%" />
</p>

The repository contains a cumulative 25-step research and implementation lineage. The current public source tree presents the canonical decision model and packet contract, plus the TypeScript engine chain from Step 10 through Step 25.

| Stage | Engine steps | What it contributes |
|---|---:|---|
| **Observe and establish facts** | 10–13 | Observation, evidence extraction, entity normalization, and context enrichment with provenance, freshness, confidence, and conflicts retained. |
| **Define the decision space** | 14–17 | Domain-neutral option discovery, explicit objectives, hard and soft constraints, and scoped actor or company preferences. |
| **Evaluate alternatives** | 18–20 | Multi-dimensional comparison, outcome prediction, and transparent ranking of feasible options. |
| **Recommend and communicate** | 21–23 | Best-action selection or abstention, evidence-linked explanations, and a separate confidence profile. |
| **Preserve and improve** | 24–25 | Append-only decision history and learning revisions derived only from verified outcomes. |

## What makes it different

### It defines “better” before it ranks

Objectives are first-class data: their scope, metric, direction, priority, weight, hard or soft status, time horizon, thresholds, conflicts, provenance, and authority requirements are explicit. Hard objectives remain eligibility gates; soft trade-offs cannot average away a hard failure.

### It keeps discovery, evaluation, and recommendation separate

Finding options does not rank them. Comparing options does not recommend one. Ranking does not authorize action. Each stage has a focused responsibility and a machine-readable contract, making the decision path easier to inspect, test, and evolve.

### It treats evidence and uncertainty as part of the result

Source identity, timestamps, provenance, freshness, confidence, assumptions, and conflicts can travel with the decision. Missing or unresolved information can remain explicitly unknown instead of being silently filled in.

### It can abstain

When evidence, feasibility, or confidence is insufficient, the best-action stage can return an abstention instead of manufacturing certainty. Explanations are rendered from explicit evidence, factors, assumptions, exclusions, and sensitivity scenarios; they do not expose or persist hidden chain-of-thought.

### It learns without rewriting history

Step 24 records new decision revisions append-only. Step 25 accepts verified outcomes and emits inspectable, reversible calibration revisions for forecasts, assumptions, recommendations, and confidence. Past evidence, forecasts, rankings, recommendations, and decisions remain unchanged.

### It does not confuse learning with authority

Learning may change future confidence or scoring assumptions. It cannot create permission, entitlement, approval, or execution rights. The canonical company boundary is `company_id`; decision-intelligence stages do not cross company scopes.

## Engine capabilities

| Capability | Practical value |
|---|---|
| **Observation and evidence** | Turn source records into traceable observations and evidence, keeping raw acquisition distinct from derived claims. |
| **Entity resolution** | Recognize records that refer to the same real-world entity while preserving source identities and match evidence. |
| **Context enrichment** | Combine multiple source classes with freshness, confidence, provenance, provider receipts, and unresolved conflicts. |
| **Option discovery** | Surface actions, resources, suppliers, assignments, interventions, schedules, strategies, tools, and resolutions without prematurely ranking them. |
| **Objective and constraint models** | Make trade-offs explicit while retaining non-negotiable eligibility rules. |
| **Comparison and prediction** | Compare unlike alternatives across cost, time, quality, risk, benefit, sustainability, reversibility, reliability, and strategic value. |
| **Ranking and best action** | Produce transparent ordering and a recommendation candidate—or abstain—without taking authority. |
| **Explanation and confidence** | Give users evidence-linked reasons, uncertainty, exclusions, and sensitivity context. |
| **Decision history and learning** | Preserve immutable history and use only verified outcomes to calibrate future decisions. |

## Where it can be applied

The architecture is deliberately not hard-coded to one industry. Included decision-packet examples cover assets, CRM, environment, finance, marketing, operations, procurement, scheduling, and workforce use cases. The same staged model can be adapted to other domains by supplying their entities, evidence, objectives, options, and constraints.

## Repository map

```text
engines/                       TypeScript engine modules, contracts, tests, examples
docs/specification/            Canonical decision model and DecisionPacket contract
assets/                         Original project banner and architecture graphic
archive/                         Original Step 25 research bundle
docs/DEEP-SCAN-PROMPT.md        Reusable repository-audit prompt
```

Each `engines/<step>-<name>/` folder keeps the implementation alongside its contract, schemas, examples, validator, tests, and acceptance artifacts where provided. `README-TYPESCRIPT-CONVERGENCE.md` explains why the active Steps 10–25 runtime chain is TypeScript-first.

## Project status

This is a **research-backed, modular TypeScript reference implementation and architecture package**. The archive’s Step 25 acceptance record reports 11 tests passed, rejects cross-company and unverified outcomes, and confirms historical decisions and evidence remain unchanged. The broader package also contains per-step tests and validation records.

Those records describe the supplied research snapshot; they are not a claim that this repository is a single production-ready npm package or that every module has been independently re-run in this checkout. The modules are presented as a coherent architecture with explicit integration and authority boundaries.

## Source bundle

The original cumulative Step 25 source and research package is preserved in [`archive/Titan Decision Engine Master Step 25.zip`](archive/Titan%20Decision%20Engine%20Master%20Step%2025.zip). The extracted public tree focuses on the canonical model and the TypeScript decision pipeline; donor runtime code and assets are not copied into the public engine modules.

## Further reading

- [Canonical Decision Model](docs/specification/08-canonical-decision-model/README-STEP-08-CANONICAL-DECISION-MODEL.md)
- [DecisionPacket contract](docs/specification/09-decisionpacket-contract/README-STEP-09-DECISIONPACKET-CONTRACT.md)
- [TypeScript convergence notes](README-TYPESCRIPT-CONVERGENCE.md)
- [Step 25 Learning Loop](engines/25-learning-loop/README-STEP-25.md)
- [Reusable deep-scan prompt](docs/DEEP-SCAN-PROMPT.md)

---

**Titan Decision Engine is part of the Titan Zero system architecture.** It turns evidence into inspectable decision support while keeping authority, approval, and execution governed outside the reasoning pipeline.
