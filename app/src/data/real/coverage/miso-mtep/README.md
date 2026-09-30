# MISO Appendix A — full accepted scope

The status report through August 4, 2026 contributes 3,042 facility components under 1,497 parent Project IDs: 2,850 transmission records, 162 capital-context records and 30 planning-context records. The complete 3,211-row ledger records 3,042 imported / 169 M4 in-service exclusions / zero pending or failed. All locations and construction windows remain unknown.

Facility Owner(s) provides 1,791 qualified source-scoped identities; 1,251 records retain unknown ownership (870 blank, 234 unresolved aliases and 147 joint/generic values). Raw owners and separate submitting TO remain available as source context. Explicit planning-context decisions, forecast precision and source status meanings are unchanged from the connected sample.

`dataset.json` is source-only Dataset 2; `manifest.json` duplicates its source edition; `row-ledger.json` records every source row. `payload-sizes.json` measures 7,815,166 compact / 10,565,671 formatted UTF-8 bytes, before aggregate/export overhead. The committed full Dataset uses compact JSON.

Reproduction and exact field meanings are in `scripts/ingest/coverage/miso-mtep/README.md`; accepted source decisions are beside the adapter in `policy.json`. Original workbook and internal metadata remain outside application data. The six-record sample was connected at `faf5c03` before full generation. Source extraction ran without workbook modification; coordinator alone checks integration. No worker tests or visual work were run.
