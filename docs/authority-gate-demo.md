# Authority-gate demo

Run this deterministic, credential-free demo from the repository root:

```bash
node --experimental-strip-types examples/authority-gate-demo.mjs
```

The demo uses synthetic data and the Step 27 runtime to show three bounded outcomes:

| Case | Expected result | What it demonstrates |
|---|---|---|
| Eligible recommendation | `prepared` | A fresh, allowed host capability can produce a request. |
| Ineligible recommendation | `blocked` | The handoff refuses an option absent from the constraint gate. |
| Approval-required handoff | `approval_required` | The host can require approval without dispatching anything. |

Every case asserts `authority_effect: none`. Any prepared request must report `dispatch_state: not_dispatched`. The script prints only synthetic identifiers and outcome fields; it does not call a provider, persist state, request approval, or execute an action.

This is a focused behavior demo, not a live LLM result, production integration, latency benchmark, or screenshot of a running product. The implementation is [Step 27](../engines/27-action-handoff/runtime/decisionActionHandoff.ts), and the demo source is [authority-gate-demo.mjs](../examples/authority-gate-demo.mjs). CI runs the same command in the [Authority-gate demo workflow](../.github/workflows/authority-gate-demo.yml).
