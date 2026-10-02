# Step 15 — Objective Model

Titan now has an explicit, domain-neutral definition of what **better** means before options are compared or recommendations are made.

The model supports eight first-class objective scopes: **user, company, task, environmental, operational, financial, regulatory, and strategic**. Each objective records its metric, direction, priority, weight, hard/soft status, time horizon, thresholds, conflicts, provenance, and authority requirements.

## Rules

- `company_id` is the sole canonical tenant/company boundary.
- Hard objectives are acceptance constraints and cannot be averaged away by soft weights.
- Soft objectives are trade-off dimensions; normalized weights are deterministic and inspectable.
- Conflicts are explicit links between objectives rather than hidden inside one composite score.
- Regulatory objectives may require external authority and cannot be silently overridden.
- Objectives define evaluation intent only; they do not create permission, entitlement, approval, or execution authority.
- The model is upstream of prediction, comparison, ranking, recommendation, and best-action selection.


## TypeScript convergence
Runtime, tests, and validation for this layer are now TypeScript-first. Superseded Python runtime/test/validator files were removed during the Step 25 TypeScript convergence pass.
