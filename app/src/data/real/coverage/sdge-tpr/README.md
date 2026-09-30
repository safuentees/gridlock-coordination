# SDG&E public July 2026 TPR — full

Source version 2: 367 declared rows = 137 imported + 230 excluded + 0 pending. No failed, located or evidenced-owner records. Full accepted scope is 137 source units (93 transmission / 44 capital context), not statewide or deduplicated engineering coverage.

The six diagnostics are Excel rows 12, 20, 121, 334, 342 and 356. Native/source-locator IDs, parent orders, budget codes, raw unknown dates and source status conflicts remain distinct. Row 121 is an overlapping distribution blanket budget, not an independent known asset; its recordUnit is omitted, as for blanket budgets at rows 161 and 163 in the full source. Full descriptions preserve supporting-equipment categories, historical program text, prospective ownership and the Ash/Jamacha title-scope conflicts without automatic corrections or merges. All coordinates/owners/native geometry and construction windows remain null. July 1 is the edition date, not per-row freshness.

`manifest.json` is the same edition embedded in `dataset.json`; `row-ledger.json` preserves all 367 public dispositions and whitelisted field values. `source-catalog.json` records hashes of the preserved original workbook and index HTML. No person fields, hidden metadata or originals are included. `source-quality.json` records accepted/full counts and source conflicts.

Actual dataset payload: 430,886 compact / 585,106 formatted UTF-8 bytes. All 137 accepted units are emitted in source order; the six connected sample records keep their values and identities. Coordinator owns runtime validation and loader integration; no worker checks were run.

Reproduce with `python3 scripts/ingest/coverage/sdge-tpr/extract.py --scope full` using ignored originals under `inputs/originals/F27-ca-sdge-tpr/`. Hash mismatch stops generation; no network fetch or alternate-source fallback occurs.
