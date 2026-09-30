# WestConnect public TPPL full inventory

Provider-ready Dataset v2 from the accepted February 10, 2026 public TPPL. The six-record sample was provider-connected at `adc2397` before expansion. All 304 retained records remain unlocated with unknown asset owners, and the six connected records retain the same projection and IDs.

The complete row ledger reconciles 389 source records as 304 imported, 85 excluded and zero pending/failed. Exclusions remain 65 In-Service, 16 Withdrawn (not necessarily cancelled) and four exact generation-only IDs. Retained kind totals are 300 transmission-project and four planning-context; lifecycle totals are 244 planned, 56 unknown Conceptual and four under-construction. Dates retain 254 year values and 50 unknown values.

`dataset.json` and `manifest.json` share the source manifest. `row-ledger.json` preserves every source disposition and citation. `source-quality.json` records scope, identity discrepancies and classification/date meanings. `payload-sizes.json` records actual Dataset sizes: 748,620 compact / 1,011,996 formatted UTF-8 bytes.

See the source-only producer and reproduction command in `scripts/ingest/coverage/westconnect-tppl/README.md`. Originals remain ignored. No source worker checks ran; coordinator owns integration and milestone verification.
