# Deep-Scan Prompt: Titan Decision Engine

Use this prompt when auditing or extending the repository.

```text
You are auditing Masterleeaus/decision-engine as a serious software product and portfolio project.

MISSION
Deep-scan the complete repository and its source archive before changing anything. Produce an evidence-based technical and product assessment, then improve the public-facing README and repository presentation without inventing capabilities or overstating production readiness.

REPOSITORY SCAN
1. Inventory every tracked file, directory, language, engine, contract, schema, test, example, validation artifact, archive, and generated output.
2. Unpack all relevant archives in a temporary workspace. Compare the archive contents with tracked source; identify duplicate, stale, missing, generated, donor-origin, and canonical files. Preserve source provenance and do not publish donor-specific or third-party material unless the repository's rights and license permit it.
3. Trace the decision pipeline end to end. Verify how observation, evidence, entity resolution, context, option discovery, objectives, constraints, preferences, comparison, prediction, ranking, best-action/abstention, explanation, confidence, decision history, and learning connect.
4. Read implementation, tests, contracts, JSON Schemas, examples, acceptance records, architecture diagrams, and manifests. Treat reports and prior test outputs as historical evidence, not as freshly run results.
5. Identify tenant boundaries, provenance and freshness rules, hard/soft constraint handling, uncertainty and abstention behavior, history immutability, learning eligibility, authority separation, dependency assumptions, and any security or privacy issues.
6. Run the available checks that can be run reproducibly. Record exact commands and outcomes. Do not install unpinned packages or claim a test passed unless it was executed in this run.

PRODUCT AND PORTFOLIO ANALYSIS
7. Identify the genuinely distinctive architecture and user value: what problem it solves, why its staged design matters, which capabilities are implemented versus specified, what makes it safer or more explainable, and what is still experimental or incomplete.
8. Compare the README claims against the source. Remove generic slogans, unsupported benchmarks, invented integrations, false production claims, and vague feature lists.
9. Write a polished product README with an original visual identity. Explain the architecture, core benefits, engine capabilities, stage-by-stage flow, practical use cases, repository map, maturity/status, and limitations in clear buyer- and recruiter-friendly language.
10. Create original repository graphics (banner and architecture illustration) that match the real architecture. Keep diagrams accurate, legible, accessible, and self-hosted in the repository.
11. Improve repository organization only when safe. Preserve authoritative source and provenance; do not delete or overwrite files merely to make the tree look cleaner. Move archives with history where possible and exclude restricted donor material from public extraction.

REQUIRED OUTPUT
- A concise scan report with repository scope, key evidence paths, distinctive features, verified checks, risks/gaps, and implementation maturity.
- The updated README and original visuals.
- A file-by-file change summary and commit/PR link.

QUALITY GATES
- Every claim in the README maps to code, a contract, a test, or clearly labeled design documentation.
- Explain that recommendations do not grant authority or execute actions.
- Explain that `company_id` is the company boundary and that verified outcomes alone can update learning revisions.
- Distinguish current runtime code from research artifacts, generated outputs, and historical validation records.
- Validate Markdown links, SVG syntax, JSON files, and all checks that were reported as run.
```
