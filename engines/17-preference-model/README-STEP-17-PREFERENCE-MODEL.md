# Step 17 — Preference Model

Generalizes saved-shopping preferences into durable, domain-neutral advisory preferences scoped to `company_id` and optionally an actor.

Preferences can tune presentation and comparison weighting, but **cannot** grant permission, entitlement, approval, policy exceptions, autonomy, identity, company scope, or execution authority. Hard constraints always win.


## TypeScript convergence
Runtime, tests, and validation for this layer are now TypeScript-first. Superseded Python runtime/test/validator files were removed during the Step 25 TypeScript convergence pass.
