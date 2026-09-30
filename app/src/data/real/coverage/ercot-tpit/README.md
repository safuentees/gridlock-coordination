# ERCOT TPIT — full accepted inventory

The six-record sample was connected at `ed07698` before this full producer output. This Dataset v2 retains all 1,766 accepted TPIT components: 795 with explicit transmission-equipment quantities and 971 distribution/unresolved planning-context records. These are source component counts, not 1,766 confirmed engineering projects. The source as-of date is July 13, 2026, publication July 17, retrieval September 30.

All 2,216 project-table rows reconcile: 1,766 imported, 450 excluded, zero pending or failed. Exclusions comprise five exact non-contact duplicate rows, 262 Completed-tab rows, 78 Cancelled-tab rows, 14 other explicitly In-Service rows, two model-only entries and 89 supplemental RTP rows. `rtp-context.json` preserves those regional-plan references without adding projects or inventing links.

All records remain unlocated. Native IDs, source-scoped owner evidence, displayed month precision and classification fields/locators are retained. Year-9999 cells are unknown/unusable: `source-quality.json` records 19 across raw source rows and 10 on retained records, with exact raw values and cell locators. There are no inferred centers, construction windows or benefits, and contact fields are excluded.

Dataset UTF-8 sizes: **5,825,541 compact bytes; 8,032,160 formatted bytes** (`payload-sizes.json`). The original remains unchanged outside Git. Reproduce using the source-specific extractor README. Coordinator integration check is pending; no worker builds, tests, browser or visual checks ran.
