# PJM public RTEP — connection sample

Six upgrades connect the C2 source contract before full ingestion. The manifest and ledger reconcile 15,692 source rows as 6 imported and 15,686 pending, with no exclusions claimed yet. All six locations are unknown. This is a retrieval snapshot of a regional public inventory, not a published edition or a count of unique engineering projects.

`dataset.json` is the source-only Dataset 2 consumed by the coordinator's provider. `manifest.json` duplicates its one source edition; `row-ledger.json` records every source row's disposition. `payload-sizes.json` records compact and formatted source-only sizes. The original XML is preserved outside Git. Reproduction and field meanings are in `scripts/ingest/coverage/pjm-rtep/README.md`; public-source qualification is in the F27 PJM spec folder.

Sample payload: 25,195 compact bytes / 38,091 formatted bytes. Integration and full-scope reconciliation remain pending; worker checks were not run.
