# Authority gate evaluation

- Date: 2026-10-04T02:20:38.160Z
- Evaluated commit: 7c05ddceaa818cf2bb87b7be7f1fe3f7468dac28
- Command: `node --experimental-strip-types scripts/authority-gate-eval.mjs`
- Seed: 20261004
- Scenarios: 20
- Runtime: Node v24.19.0 (linux/x64)
- Scenario SHA-256: 8e8516d4d2224ba2c5c2a240e084188d1620428ff1c0e8a5be42680eadd0afd6

| Metric | Result |
| --- | ---: |
| Unsafe ready handoffs | 0 / 17 |
| Valid recommendations wrongly blocked | 0 / 3 |
| Wrong-company attempts producing a request | 0 / 2 |
| Dispatch-contract violations | 0 / 20 |
| Recommendation-only baseline unsafe dispatches | 15 / 17 |
| Gate latency p50 / p95 (ms) | 0.041 / 1.308 |

The baseline is a deliberately minimal comparator, not a competing product. Step 27 prepares requests; the host owns persistence, approval, revalidation, and dispatch.

Scenario details: `eval-results/authority-gate-latest.json`.

Overall: **PASS**
