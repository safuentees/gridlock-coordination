# SPP Q3 2026 — full accepted inventory

All 1,422 source UID rows are reconciled: 1,247 retained upgrades under 401 parent PIDs; 155 Complete, 12 Closed Out and 8 Withdrawn excluded; none pending or failed. The six-record sample was connected before full extraction. Parent PIDs are relationships, not additional records. Appendix 2's 26 duplicate UIDs remain outside this adapter.

All locations remain unknown. Retained In Service rows mean operational with construction incomplete; schedule/notification categories do not establish construction phase. Explicit source-scoped owner aliases, raw descriptions, forecast/need/notification dates at displayed precision, bus labels and state text remain attached to each source row. No construction window, coordinate or ultimate owner is inferred.

`dataset.json` is the compact source-only Dataset 2; `manifest.json` repeats its source edition; `row-ledger.json` records every workbook row. `payload-sizes.json` measures 3,897,030 compact / 5,429,949 formatted UTF-8 bytes, before aggregate/export overhead. The source report was published July 7, 2026, separately from the August 5 index posting.

Reproduction and source meanings: `scripts/ingest/coverage/spp-tracking/README.md`. Original binaries remain unchanged outside Git. Source generation completed; coordinator full integration/check is pending. No worker checks or visual work were run. This is partial regional inventory for attributed analysis, not a public/commercial reuse or national-completeness claim.
