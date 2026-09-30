# SCE June 2026 public inventory

Source-only Dataset version 2. The embedded source-edition manifest and `manifest.json` are the same import snapshot; `row-ledger.json` accounts for every raw public row. Coordinator combines this source with the unchanged legacy dataset.

Full declared inventory: **494 source rows = 167 imported + 327 excluded**, with zero pending or failed rows. Exclusions are 44 program aggregates, 279 operational leaves and four canceled leaves. On-hold and unknown/context records remain visible. This source portfolio does not establish complete California or national coverage.

There are **103 unverified centers and 64 records without a center**. Located is not distance-eligible: owners are unknown, and canonical core policy applies. Native endpoint collections remain source evidence; multiple/ambiguous point roles, unavailable coordinates and malformed coordinate pairs do not acquire invented centers. Original datum and positional accuracy remain unspecified. Source publication/retrieval dates differ from generation time.

Reproduce with `scripts/ingest/coverage/ca-sce-tpr/extract.py --scope full`; its README states exact options and source semantics. Use the generatedAt value in dataset.json to reproduce snapshot metadata. The earlier six-record connection slice remains in commit 088b92c and is reproducible with `--scope sample`.

The preserved original lives in the coordinator's ignored `inputs/originals/F25-california-tpr-2026/` directory. No originals, manager names or confidential data are included here. All source rows have ledger disposition/reason; work-order aliases never collapse native TPR identities.
