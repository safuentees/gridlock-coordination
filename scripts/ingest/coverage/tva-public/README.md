# TVA captured public-index normalizer

This deterministic standard-library adapter normalizes the accepted cited facts in `source-records.json`. It checks the pinned source bytes as part of ingestion, never fetches changing pages, geocodes, reads map images or infers complete ownership. Missing source artifacts or differing hashes stop generation.

```sh
python3 scripts/ingest/coverage/tva-public/extract.py --scope sample
```

The first increment emits New Liberty, Kentucky Phase II, Beulah Grove, Appalachia, Shooting Creek and Hardin Valley. The full 41-placement ledger reconciles six imported, one duplicate excluded and 34 pending. Stop for coordinator provider connection before the full 40-page increment; `--scope full` refuses incomplete transcription. `--source-dir` can locate the preserved artifacts, and `--output-dir` can select another artifact directory.

Coordinator accepted the 41 web-tool text captures after normal public HTML requests returned 403. These are derived captured text, not publisher HTML. Every recorded hash identifies those exact capture bytes; do not claim original HTML preservation. The additional 14 public GIS JSON responses are original artifacts with separate capture labels. All remain ignored under `inputs/originals/F27-tva-public/` in the reusable UI worktree. No contact information, images or source text dumps are included in normalized records.

One canonical URL final slug identifies one page work unit via `source-locator`, not a native engineering ID. The duplicate Appalachia index placement has an explicit cross-reference. Compound programs, partner work and alternative routes are not silently split or merged. GIS PROJECT_ID values are scoped aliases; public proposed polylines and meeting addresses do not establish centers.

Publication day is unknown; edition is `observed-2026-09-30`. Lifecycle uses the month of the actual evidence statement, or retrieval/snapshot-observed for undated assertions. Primary seasonal dates retain year precision only for an explicit single year. Cross-year winters, withdrawn schedules and unresolved conflicts remain unknown; source component/older dates are retained as cited supplemental milestones. Construction forecasts are not actual starts/windows. All initial whole-page owners and runtime geometry stay null.

Adapter execution generates source artifacts and measures payload sizes. It is not a runtime schema/build check; coordinator alone owns those checks and provider connection.
