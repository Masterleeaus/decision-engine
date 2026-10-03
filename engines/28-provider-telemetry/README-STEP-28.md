# Step 28 — Provider Reliability Telemetry

Step 28 turns the archive's evidence-telemetry pattern into a privacy-minimized provider reliability contract. A host can wrap provider calls to capture duration, outcome, record count, freshness summary, and a bounded failure class, then aggregate those observations into a company-scoped health snapshot.

## What it records

- Provider and operation identifiers, plus an invocation identifier for deduplication
- Start and completion timestamps and measured duration
- Success, partial, or failure outcome
- A host-supplied count and freshness summary
- A bounded failure class such as timeout, rate limiting, or invalid response

The observation omits returned values, URLs, actor identifiers, exception messages, and response payloads. The capture function returns the original value or error separately so the host can continue its provider workflow; only the observation is intended for diagnostics storage.

Typical adapter flow:

```ts
const capture = await captureProviderCall(
  { company_id, provider_id, operation_id, invocation_id },
  () => provider.fetchContext(request),
  { summarize_result: (facts) => ({ record_count: facts.length, freshness_state: "fresh" }) },
);
await diagnosticsStore.append(capture.observation);
if (!capture.ok) throw capture.error;
return capture.value;
```

The host should persist the observation separately from the returned provider value or exception. Avoid passing exception messages, entity IDs, URLs, or raw content into custom failure-classification logic.

For synchronous Step 13 style `enrich()` providers, use `captureSynchronousProviderCall` with the same request, result-summary, and failure-classification contract. It returns synchronously, so it can wrap the existing reference provider interface without converting the enrichment pipeline to async.

## Reliability snapshots

`summarizeProviderReliability` groups observations for exactly one `company_id` and `provider_id` over a bounded window. It deduplicates identical invocations, rejects conflicting duplicates and cross-company data, and reports success/failure rates, freshness counts, latency percentiles, and bounded failure classes.

Window membership uses `completed_at`. The success rate counts both full and partial calls as completed successfully, while keeping `partial_count` visible. With no samples, rates and percentiles are null and health is `insufficient_data`.

The health label is diagnostic. It does not alter the decision workflow, ranking, confidence, constraint evaluation, capability assessment, authorization, or provider routing. The host decides whether to alert, retry, switch providers, or request human review.

## Archive evidence and implementation status

- **Observed:** `07-donor-boundary-isolation/REUSABLE-ARCHITECTURAL-PATTERNS.csv` lists `evidence_telemetry` for parser/scrape reliability and requires operational, privacy-minimized telemetry.
- **Observed:** `13-context-enrichment-engine/runtime/contextEnrichmentEngine.ts` emits provider fact counts and errors but does not capture provider duration or aggregate reliability over time.
- **Observed:** `07-donor-boundary-isolation/PROHIBITED-DONOR-DEPENDENCIES.json` prohibits inheriting donor analytics, error telemetry, and feature-flag vendors.
- **Inferred:** A pure, provider-neutral observation and aggregation engine fills this gap while leaving collection policy, storage, and alerting with the host.
- **Proposed:** Step 28 provides a capture wrapper and bounded-window reliability summary without sending data to a telemetry vendor or steering recommendations.
- **Missing:** No durable diagnostics store, alerting policy, production provider adapter, or privacy-retention service is included.

Status: **Integration candidate**. Runtime, schema, examples, and acceptance scenarios are staged. Tests are deferred until the broader integration pass ends.

## Boundary

- `company_id` is the canonical company boundary.
- Provider identity and operation identifiers are host supplied and should be low-cardinality and privacy reviewed.
- Provider health is not a decision score or authorization result.
- The host owns retention, access, alerting, retries, routing, and vendor selection.
- Every observation and snapshot has `authority_effect: "none"`.
