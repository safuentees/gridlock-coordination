# BPA 2025 Transmission Plan — full

Source-only Dataset version 2: 98 normalization rows = 77 imported + 21 excluded + 0 pending; zero failed or located. The accepted complete inventory has 77 retained transmission-work units. The exclusions preserve 15 completed, one cancelled and five repeated observations; source units are not deduplicated engineering-project totals.

The preserved connection sample contains Silver Creek, Sno-King, Keeler P05449, Bonanza and Pearl P04974. Full mode adds the remaining 72 accepted units, including grouped GERP work and corrective-action components. Silver Creek retains a year-level service forecast; Sno-King retains a need year with unknown service date. The other three preserve conflicting/phased forecasts as source-labeled milestones and leave the primary date unknown. No owner, construction interval or geometry is inferred. Public GERP feature citations remain evidence only.

Lifecycle assertions use plan year 2025 with source-edition meaning. The index update is August 25, 2026; it is not a record update, publication day or live status claim. Native/source-locator identity, component boundaries and accepted aliases are explicit in the ledger. The coordinator connected the initial five records in PR100 before this full transcription. All five sample records retain their original identities and facts.

Source scopes may overlap: the Schultz–Raver narrative includes separate capacitor/Olympia units. Plan and GIS disagree on a North of Marion crossing assignment. P03259 stays unknown lifecycle; East Omak retains its 21/28.8 Mvar discrepancy. Exact sources and milestones preserve these limits. The two never-imported reserved locator corrections are explicit in the ledger.

`manifest.json` matches the embedded edition. `row-ledger.json` records every mapping/disposition and all 14 public source hashes. Payload: 190744 compact UTF-8 bytes / 253043 formatted UTF-8 bytes.

Reproduce with `python3 scripts/ingest/coverage/bpa-plan/extract.py --scope full`. Originals remain ignored under `inputs/originals/F27-bpa-plan/` in the reusable UI worktree. No originals or images are committed; coordinator owns runtime validation and integration.
