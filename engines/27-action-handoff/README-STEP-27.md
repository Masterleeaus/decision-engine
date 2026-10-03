# Step 27 — Capability-Gated Action Handoff

Step 27 connects a recommendation to a host-owned capability without giving the decision engine permission to perform the action. It prepares an expiring, idempotent request only when the selected option passed the Step 16 constraint gate and a fresh capability assessment from the host allows preparation.

## Workflow

1. The host maps a recommended option to an action and capability identifier.
2. Step 27 checks that the recommendation and constraint gate share the same company and decision scope.
3. Only a ready gate and an eligible recommended option can continue.
4. The host supplies capability availability, authorization state, policy version, actor, assessment time, and expiry.
5. The handoff emits a stable request for a host-owned approval or dispatch flow, or abstains, blocks, or asks for review.
6. The host persists the request, enforces idempotency, rechecks authority and expiry, dispatches through its capability owner, and records the execution receipt.

`prepared` means the host assessment allows the request to be prepared. It does not mean the request is approved, authorized at dispatch time, or executed. `approval_required` carries an undispatched request for the host approval flow. Unknown, disabled, denied, expired, or mismatched inputs never produce an executable request.

## Request contents

The host-provided binding contains the selected option, action and capability versions, optional opaque target reference, JSON parameters, and evidence references. The engine canonicalizes JSON, rejects cross-company fields and legacy tenant boundary keys, sorts evidence references, derives a stable idempotency key, and caps request expiry by both host-assessment expiry and the configured request lifetime.

The handoff does not include credentials, endpoint URLs, authorization tokens, or executor code. It does not call providers, persist records, create an outbox, request approval, notify a person, or dispatch an action.

## Archive evidence and implementation status

- **Observed:** The archive identifies `execution_preparation` and `capability_gating` as reusable patterns in `07-donor-boundary-isolation/REUSABLE-ARCHITECTURAL-PATTERNS.csv`; the same boundary calls for host-owned permissions and a governed execution bridge.
- **Observed:** Step 21's `BEST-ACTION-CONTRACT.json` states that selecting a recommendation does not approve, execute, entitle, authorize, or weaken constraints.
- **Inferred:** A domain-neutral request envelope can connect those patterns while keeping the host as the action authority.
- **Proposed:** Step 27 formalizes that envelope and fails closed on stale, unknown, denied, or cross-scope assessments.
- **Missing:** The repository has no production capability registry, durable request store, approval service, or executor. The capability assessment and action binding therefore remain host inputs.

Status: **Integration candidate**. Runtime acceptance scenarios pass under Node's TypeScript strip-types mode. Host-adapter integration, durable storage, and an authoritative capability service remain host responsibilities.

## Boundary

- `company_id` is the only company scope.
- The constraint engine remains the source of option eligibility; this step cannot restore a blocked option.
- The host capability owner remains authoritative for permissions, entitlements, approvals, execution, and receipts.
- Every result has `authority_effect: "none"`; every prepared request has `dispatch_state: "not_dispatched"`.
