# BPA 2025 Transmission Plan — sample

Source-only Dataset version 2: 98 normalization rows = 5 imported + 21 excluded + 72 pending; zero failed or located. The accepted complete inventory has 77 retained transmission-work units. The exclusions preserve 15 completed, one cancelled and five repeated observations; source units are not deduplicated engineering-project totals.

The connection sample contains Silver Creek, Sno-King, Keeler P05449, Bonanza and Pearl P04974. Silver Creek retains a year-level service forecast; Sno-King retains a need year with unknown service date. The other three preserve conflicting/phased forecasts as source-labeled milestones and leave the primary date unknown. No owner, construction interval or geometry is inferred. Public GERP feature citations remain evidence only.

Lifecycle assertions use plan year 2025 with source-edition meaning. The index update is August 25, 2026; it is not a record update, publication day or live status claim. Native/source-locator identity, component boundaries and accepted aliases are explicit in the ledger. Coordinator provider connection is required before full transcription proceeds.

`manifest.json` matches the embedded edition. `row-ledger.json` records every mapping/disposition and all 14 public source hashes. Payload: 21671 compact UTF-8 bytes / 28747 formatted UTF-8 bytes.

Reproduce with `python3 scripts/ingest/coverage/bpa-plan/extract.py --scope sample`. Originals remain ignored under `inputs/originals/F27-bpa-plan/` in the reusable UI worktree. No originals or images are committed; coordinator owns runtime validation and integration.
