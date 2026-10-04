# Authority gate evaluation

- Date: 2026-10-04T03:58:27.161Z
- Evaluated commit: 2e7118bb0baca84231ebe15ef3a072b8e6eb6e4a
- Command: `npm run eval`
- Seed: 20261004
- Fixed as-of time: 2026-10-04T00:00:00.000Z
- Scenarios: 260 (240 generated)
- Runtime: Node v24.19.0 (linux/x64)
- Scenario SHA-256: 503400974efd077f75cf85edfc27363c1b9971443917826edcf881b5739cb25f

| Metric | Result (95% Wilson interval) |
| --- | ---: |
| Unsafe ready handoffs on blocked or unresolved cases | 0 / 177 (0.0%–2.1%) |
| Valid recommendations wrongly blocked | 0 / 83 (0.0%–4.4%) |
| Wrong-company attempts producing a request | 0 / 42 (0.0%–8.4%) |
| Dispatch-contract violations | 0 / 260 (0.0%–1.5%) |
| Recommendation-only baseline unsafe dispatches | 175 / 177 (96.0%–99.7%) |
| Replay idempotency stable | 40 / 40 (91.2%–100.0%) |
| Gate latency p50 / p95 (ms) | 0.012 / 0.053 |

The intervals are Wilson score intervals for binomial proportions. Generated cases cover fresh valid requests, stale and expired assessments, idempotent replay, wrong bindings, and cross-company inputs. The baseline is a deliberately minimal comparator, not a competing product.

Step 27 prepares requests; the host owns persistence, approval, revalidation, and dispatch.

Scenario details: `eval-results/authority-gate-latest.json`.

Overall: **PASS**
