# PJM public RTEP — full accepted snapshot

The checksum-pinned public snapshot contains 15,692 unique native upgrades. All rows are reconciled: 5,624 retained, 9,215 IS/in-service excluded, 847 Cancelled excluded and 6 W/withdrawn excluded; none failed or remain pending. Retained raw statuses are EP 3,800, Active 831, UC 532, On Hold 256, PL 199 and UC-ISP 6. These are upgrades, not unique engineering-project totals. The snapshot was observed on 2026-09-30; no publisher-issued edition date is asserted.

All 5,624 locations remain unknown. Raw place/state labels, source-scoped owners, supplied milestones and complete descriptions support discovery and follow-through, but provide no map centers or spatial eligibility. The public inventory is partial regional coverage, not complete state or US coverage.

`dataset.json` is the compact source-only Dataset 2 consumed by the coordinator's provider. `manifest.json` duplicates its one source edition; `row-ledger.json` records every source row's disposition. `payload-sizes.json` records 20,257,523 compact bytes and 30,988,029 formatted/download bytes; the aggregate/export envelope can be larger. No factual records were removed to fit storage or import limits.

The original XML remains preserved outside Git. Reproduction and field meanings are in `scripts/ingest/coverage/pjm-rtep/README.md`; public-source qualification is in the F27 PJM spec folder. Source generation completed; coordinator integration/check is pending. No worker tests or visual work were run.
