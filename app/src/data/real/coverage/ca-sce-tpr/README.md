# SCE June 2026 public inventory

Source-only Dataset version 2. The embedded source-edition manifest and `manifest.json` are the same import snapshot; `row-ledger.json` accounts for every raw public row. Coordinator combines this source with the unchanged legacy dataset.

Current slice: six qualified records, two unverified centers, 488 remaining rows pending. This is a sample, not the full source inventory or nationwide completion. Owner data is unknown. Endpoint collections remain source evidence; unresolved centers stay null. Source publication and retrieval dates are separate from generation time.

Reproduce with `scripts/ingest/coverage/ca-sce-tpr/extract.py`; its README states the source semantics. Preserved original lives in the coordinator's ignored `inputs/originals/F25-california-tpr-2026/` directory. No originals, manager names or confidential data are included here.
