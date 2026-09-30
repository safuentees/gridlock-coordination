# TVA captured public-index normalizer

This deterministic standard-library adapter normalizes the accepted cited facts in `source-records.json`. It checks the pinned source bytes as part of ingestion, never fetches changing pages, geocodes, reads map images or infers complete ownership. Missing source artifacts or differing hashes stop generation.

```sh
python3 scripts/ingest/coverage/tva-public/extract.py --scope full
```

Full mode emits all 40 page work units from the frozen 41-placement index: 40 imported, one duplicate excluded, zero pending/failed/located. The coordinator connected New Liberty, Kentucky Phase II, Beulah Grove, Appalachia, Shooting Creek and Hardin Valley in PR123 before the other 34 records; their values and identities remain unchanged. `--scope sample` still emits those six with 34 pending. `--source-dir` can locate preserved artifacts, and `--output-dir` can select another artifact directory. Full mode refuses incomplete transcription.

Coordinator accepted the 41 web-tool text captures after normal public HTML requests returned 403. These are derived captured text, not publisher HTML. Every recorded hash identifies those exact capture bytes; do not claim original HTML preservation. The additional 14 public GIS JSON responses are original artifacts with separate capture labels. All remain ignored under `inputs/originals/F27-tva-public/` in the reusable UI worktree. No contact information, images or source text dumps are included in normalized records.

One canonical URL final slug identifies one page work unit via `source-locator`, not a native engineering ID. The duplicate Appalachia index placement has an explicit cross-reference. Compound programs, partner work and alternative routes are not silently split or merged. GIS PROJECT_ID values are scoped aliases; public proposed polylines and meeting addresses do not establish centers. The inventory is the complete declared public engagement index, not complete TVA or state-wide engineering coverage.

Publication day is unknown; edition is `observed-2026-09-30`. Lifecycle uses the month of the actual evidence statement, or retrieval/snapshot-observed for undated assertions. The full source has 36 planned, three on-hold and one historically under-construction record. North Dayton uses May 2019 proposal evidence rather than the later environmental-document heading. Expired forecasts do not establish completion.

Primary seasonal dates retain year precision only for an explicit single year. Cross-year winters, withdrawn schedules and unresolved conflicts remain unknown; source component/older dates are retained as cited supplemental milestones. Lexington, North Dayton, Hardin Valley and Tullahoma conflicts are preserved. Bristol's duplicated schedule heading follows the explicit component names in the dated update. RailHub-South has no published voltage or construction/service date. Construction forecasts are not actual starts/windows. All whole-page owners and runtime geometry stay null.

Adapter execution generates source artifacts and measures payload sizes. It is not a runtime schema/build check; coordinator alone owns those checks and provider connection.
