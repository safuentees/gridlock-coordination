# F28-F1 — Geographic coverage details

- Added a supporting Coverage details dialog with collection-wide status/precision accounting and searchable per-source totals, source editions, precision groups and stale-review counts from the authoritative core report.
- The view distinguishes supplied points, approximate facilities/points, endpoints and town/county/state-or-region extents. It does not infer owners, compute coverage classifications or list individual projects; retained absent reviews stay outside active totals.
- GeographyPanel adds only the report memo/import and dialog trigger beside its heading. Primary totals, restore/reveal, review drafts and browsing remain unchanged; dialog content scrolls within a bounded viewport using default components.
- No worker build, tests, browser or visual checks. Coordinator integration and bounded checking pending.
