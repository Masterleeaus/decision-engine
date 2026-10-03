# Step 30 — Decision Watch Lifecycle

Step 30 fills the watch-management gap around the Step 26 evaluator and Step 29 signal router. It plans company-scoped watch creation, definition updates, pause, resume, and soft close. The host authorizes commands, lists and stores watches, commits lifecycle events, and updates its scheduler.

## Lifecycle commands

- `create` builds an active watch at revision 0 from a decision subject, condition, and optional timing rules.
- `update` changes a condition or timing fields while preserving the company and decision subject. Changing the condition resets the last-trigger time; changing the condition or interval clears the next-evaluation time.
- `pause` and `resume` stop and restart evaluation; resume rejects a watch whose expiry has passed.
- `close` is the removal operation. It preserves the closed definition and its history; closed watches cannot be resumed or edited.

Every change carries an expected revision. `runDecisionWatchLifecycleCommand` hashes a canonical form of the command and checks the host's company-scoped receipt before reading mutable watch state. On commit, the host atomically checks the receipt and expected revision, then stores the watch revision, event, command fingerprint, and result receipt. A stale revision returns `conflict` without changing the watch. Repeating a stored command with the same ID and payload returns `duplicate`; reusing an ID with a different payload returns `conflict`. Repeat operations already in their target state can return `unchanged` without incrementing the revision.

The host handles watch-list queries and permissions. Lifecycle events carry the changed field names and scope identifiers while omitting condition expected values and source payloads. The engine does not schedule evaluations, enqueue reruns, notify users, authorize actions, or execute recommendations.

## Archive evidence and generalization

- **Observed:** `04-capability-deobfuscation/CAPABILITY-RUNTIME-CONTRACTS.csv#price_drop_watch` records create, list, update, and remove operations for persistent alerts.
- **Observed:** `05-behavioural-capability-inventory/CANONICAL-BEHAVIOURAL-CAPABILITY-INVENTORY.csv#REMEMBER-03` covers persistent watch conditions; `#TRIGGER-04` covers watch creation, update, and removal from user or system actions.
- **Observed:** `07-donor-boundary-isolation/REUSABLE-ARCHITECTURAL-PATTERNS.csv#persistent_memory` requires company scope and host retention controls.
- **Inferred:** A lifecycle state machine around the existing generic `DecisionWatch` type supplies the reusable create/update/remove workflow without bringing donor product alerts or notification delivery into the engine.
- **Proposed:** Step 30 keeps persistence behind an atomic host compare-and-swap interface and represents removal as a reversible-audit soft close.
- **Missing:** The host must supply watch indexing/listing, command authorization, durable idempotency receipts, event storage, scheduling, and notifications.

**Assumption:** hosts use stable `command_id` values across retries and provide a stable timestamp for each command. **Limitation:** no tests have run during this integration pass.

## Status

Status: **Integration candidate**. Runtime, command and plan schemas, contract, example, and acceptance scenarios are staged. Tests remain deferred until the broader archive integration pass ends.
