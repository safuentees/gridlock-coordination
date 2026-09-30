# F26 UI — Source-qualified inventory consumers

- Dynamic reporting-group filters and labels preserve retained workspace state; mapped records and eligible comparison records are counted separately.
- Evidence displays source editions, lifecycle as-of dates, evidenced owners, location roles and published positions; raw milestone labels and unknowns remain intact.
- Bundled updates require preview and explicit apply; stale bundled previews invalidate after active-dataset changes. Revision previews include edition changes without cancellation inference.
- Added `inventoryDemoDataset`: 300 deterministic v2 synthetic records and manifests in three fictional groups; real data and existing demo IDs remain separate.
- Shared eligibility and import contracts remain authoritative. No worker checks or visual verification; coordinator integration review and bounded checks pending.
