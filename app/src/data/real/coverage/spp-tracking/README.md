# SPP Q3 2026 — connection sample

Six real UID upgrades under five parent PIDs connect C2 before full ingestion. All 1,422 source rows are reconciled as 6 imported / 1,416 pending, with no exclusions claimed yet. Every location remains unknown.

`dataset.json` is the source-only Dataset 2; `manifest.json` repeats its source edition; `row-ledger.json` records every workbook row. `payload-sizes.json` measures 21,155 compact / 28,695 formatted UTF-8 bytes, before aggregate/export overhead. The source report was published July 7, 2026, separately from the August 5 index posting.

Reproduction and source meanings: `scripts/ingest/coverage/spp-tracking/README.md`. Source generation completed; coordinator sample connection and full-scope extraction are pending. No worker checks or visual work were run.
