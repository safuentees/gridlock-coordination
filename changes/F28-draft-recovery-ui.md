# F28-R3 — Restore downloaded unfinished drafts
- Implemented a separate Restore drafts dialog with retained per-mode files/previews, six recovery outcomes, filtering and bounded 25-record pagination; coordinator integration/check pending.
- Core parse/preview/merge owns classification and guards. Changed current drafts/source fingerprints invalidate Apply; hydration, processing and active review/restore operations gate recovery.
- The hook exposes the current dirty session and applies merged work through its raw setter, preserving imported fields, baselines and timestamps. Existing dirty work stays unchanged; clean opened forms may receive a restored draft.
- Recovery changes unfinished state only. Ordinary autosave persists it; storage errors keep imported work in-session and downloadable. Absent records retain drafts until return, stale drafts require explicit re-review, and present unprocessed records wait for processing and a new preview.
- Existing navigation, evidence/review restore, browsing, reveal and storage guards retained. No worker builds, tests, browser or visual checks run.
