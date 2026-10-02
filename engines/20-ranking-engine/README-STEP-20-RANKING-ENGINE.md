> Runtime implementation language: **TypeScript** (Node.js / strict TypeScript).

# Step 20 — Ranking Engine

Ranks only alternatives that survive hard constraints. Each rank is decomposable into raw value, normalized comparison score, base and objective-adjusted weight, measurement confidence, prediction-confidence multiplier, assumptions, evidence and weighted contribution. The engine performs dimension and objective weight sensitivity analysis and reports when the leader/order changes. Ranking remains advisory and has `authority_effect: none`.
