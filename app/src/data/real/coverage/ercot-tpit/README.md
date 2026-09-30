# ERCOT TPIT — first six retained records

This Dataset v2 sample contains three equipment-qualified transmission components and three planning-context records. IDs: `110733`, `90446`, `110174`, `80422`, `91626`, `85979`. They cover exact duplicate provenance, Planned/Under Construction/Conceptual/blank status, distribution context and conflicting supplementary actual-date evidence. Year-9999 cells are unknown/unusable rather than actual events; their raw values and locators remain preserved, with counts in `source-quality.json`. All six remain unlocated, with month-precision milestones and source-scoped owner tokens.

The source as-of date is July 13, 2026, publication July 17, retrieval September 30. The row ledger covers all 2,216 source project-table rows: 6 imported, 450 excluded and 1,760 retained-but-pending. Full normalization stops until the coordinator connects this small real batch. The accepted full target is 795 equipment-qualified plus 971 planning-context records, not 1,766 confirmed engineering projects.

The original remains unchanged outside Git. Contact fields are excluded. `rtp-context.json` is supplemental source evidence only; its rows must not be added as projects. Reproduce with the source-specific extractor and its README; actual compact/formatted Dataset bytes are in `payload-sizes.json`. Coordinator verification is pending; no worker checks were run.
