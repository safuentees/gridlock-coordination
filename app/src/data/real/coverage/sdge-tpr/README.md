# SDG&E public July 2026 TPR — sample

Source version 2: 367 declared rows = 6 imported + 230 excluded + 131 pending. No failed, located or evidenced-owner records. Full accepted scope is 137 source units (93 transmission / 44 capital context), not statewide or deduplicated engineering coverage.

The six diagnostics are Excel rows 12, 20, 121, 334, 342 and 356. Native/source-locator IDs, parent orders, budget codes, raw unknown dates and source status conflicts remain distinct. Row 121 is an overlapping distribution blanket budget, not an independent known asset; its recordUnit is omitted. All coordinates/owners/native geometry and construction windows remain null. July 1 is the edition date, not per-row freshness.

`manifest.json` is the same edition embedded in `dataset.json`; `row-ledger.json` preserves all 367 public dispositions and whitelisted field values. `source-catalog.json` records hashes of the preserved original workbook and index HTML. No person fields, hidden metadata or originals are included. `source-quality.json` records accepted/full counts and source conflicts.

Actual dataset payload: 22,697 compact / 30,016 formatted UTF-8 bytes. Full payload has not been generated at the sample connection milestone. Coordinator owns runtime validation and loader integration; no worker checks were run.

Reproduce with `python3 scripts/ingest/coverage/sdge-tpr/extract.py --scope sample` using ignored originals under `inputs/originals/F27-ca-sdge-tpr/`. Hash mismatch stops generation; no network fetch or alternate-source fallback occurs.
