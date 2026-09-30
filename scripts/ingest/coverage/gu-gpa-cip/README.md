# GPA capital-budget detail normalizer

The deterministic, standard-library adapter normalizes the accepted cited factual table in `source-records.json`. It does not fetch changing sources, interpret maps, geocode, invent asset owners or infer project milestones from fiscal spending years.

```sh
python3 scripts/ingest/coverage/gu-gpa-cip/extract.py --scope sample
```

The first snapshot emits six diagnostics C.1/G.6/G.15/G.1/G.7/G.12 and reconciles all 44 entries: six imported, 17 excluded, 21 pending; no failed or located records. `--output-dir` may select another artifact directory. Full mode refuses incomplete transcription. The coordinator must connect this small sample before the remaining 21 accepted entries are produced.

The full accepted scope is 27 retained budget work units (two explicit transmission, 14 capital context, 11 unresolved planning context), not a complete current Guam register or deduplicated engineering-project total. Use only August 26, 2025 slides 36–40, packet pages 57–61, PDF pages 725–729. Earlier August 21 copies are not extra rows. Summary-only F/H/I categories, totals and separate IRP/annual-report observations are outside the declared detail boundary.

Curated IDs encode section and frozen row position, not native publisher project IDs. Preserve combined scopes, individual exclusions and possible program overlap; do not silently merge category C/G.8 or similarly named older plans. Omit optional recordUnit on these source work units. Asset labels such as T7/P-087 are aliases and do not resolve unknown voltage, location or transmission/distribution role.

The proposed-budget status belongs in Project.status. Lifecycle is planned as of the August 26, 2025 source edition. Budget approval is not individual engineering authorization, current construction or completion. FY2026/FY2027 remain fiscal context and never become milestones; all primary dates, construction windows, owners and geometry remain unknown. SourceState is null because the rows supply no geographic state field. GPA is reporting/budget sponsor only. The two explicitly named 115 kV line upgrades alone have numeric voltage; mixed protection work keeps its component voltages in notes.

The single public original is `inputs/originals/F27-gu-gpa/2025-08-26-ccu-legislature.pdf`, SHA256 `70bba24f62b1a56d855472307eb03483c1c2928c4eb8b512858a97002be15db8`. It remains ignored in the reusable UI worktree. Exact row citations, source URL and byte size accompany the factual table and generated ledger. No original PDF, images or long report passages are committed.

Adapter execution generates source artifacts and measures compact/formatted payload sizes. Coordinator alone owns runtime validation and provider integration; no worker checks are run.
