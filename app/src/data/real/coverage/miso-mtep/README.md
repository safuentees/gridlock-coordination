# MISO Appendix A — connection sample

Six real Facility IDs under six parent Project IDs connect C2/C3: four transmission records, one capital-context record and one planning-context record. The complete 3,211-row ledger records 6 imported / 169 known M4 exclusions / 3,036 retained pending. All locations remain unknown; only one sample owner identity is qualified from an explicit single source token.

`dataset.json` is source-only Dataset 2; `manifest.json` duplicates its source edition; `row-ledger.json` records every source row. `payload-sizes.json` measures 18,053 compact / 23,658 formatted UTF-8 bytes, before aggregate/export overhead.

Reproduction and exact field meanings are in `scripts/ingest/coverage/miso-mtep/README.md`; accepted source decisions are beside the adapter in `policy.json`. Original workbook and internal metadata remain outside application data. Coordinator sample connection and full extraction are pending. No worker tests or visual work were run.
