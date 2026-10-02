# Step 16 — Constraint Engine

Titan now has a domain-neutral Constraint Engine that evaluates whether candidate options are **eligible, ineligible, or unresolved** before later comparison, ranking, recommendation, or execution preparation.

## Supported constraints

Permissions, budget, deadlines, availability, jurisdiction, policy, environmental requirements, safety, privacy, capability, entitlement, and company boundaries are first-class categories. Constraints may be **hard** or **soft**. Hard failures cannot be compensated for by objective weights or expected utility. Soft failures produce an explicit penalty for later comparison rather than silently blocking the option.

## Constitutional boundaries

- `company_id` is the sole canonical Titan tenant/company boundary. A company-boundary constraint is automatically injected and is always hard, critical, non-relaxable and non-overridable.
- Unknown hard permission, jurisdiction, policy, safety, privacy, capability, entitlement, and company-boundary state fails closed by default.
- Legacy tenant identifiers are compatibility inputs only and must be normalized to trusted `company_id` before evaluation.
- The engine evaluates restrictions; it does not grant permission, entitlement, approval, capability or execution authority.
- Provenance, validity windows, source-policy references, severity and override authority requirements remain inspectable.

## Pipeline

`Objectives + Options + Context -> Constraint Set -> Hard Gate + Soft Penalties -> eligible/ineligible/needs_resolution -> later prediction/comparison/ranking`


## TypeScript convergence
Runtime, tests, and validation for this layer are now TypeScript-first. Superseded Python runtime/test/validator files were removed during the Step 25 TypeScript convergence pass.
