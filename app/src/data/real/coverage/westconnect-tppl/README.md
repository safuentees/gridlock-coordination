# WestConnect public TPPL sample

Provider-ready Dataset v2 from the accepted February 10, 2026 public TPPL. Six retained diagnostic records precede full normalization; all remain unlocated with unknown asset owners. The complete row ledger reconciles 389 source records as six imported, 85 excluded and 298 pending.

`dataset.json` and `manifest.json` share the source manifest. `row-ledger.json` preserves each source disposition and citation. `source-quality.json` records accepted full totals, identity discrepancies and classification/date meanings. `payload-sizes.json` records actual Dataset sizes: 18,431 compact / 24,270 formatted UTF-8 bytes.

See the source-only producer and reproduction command in `scripts/ingest/coverage/westconnect-tppl/README.md`. Originals remain ignored. Coordinator provider connection is pending; no source worker checks or full output have run.
