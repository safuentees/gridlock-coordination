# BPA accepted-plan normalizer

The deterministic, standard-library adapter normalizes the accepted factual table `source-records.json`; it does not scrape changing pages, infer values from maps or match project titles. The source table carries explicit mappings for all 98 accepted normalization rows, with five fully transcribed records and 72 retained units pending.

```sh
python3 scripts/ingest/coverage/bpa-plan/extract.py --scope sample
```

`--output-dir` selects another artifact directory. Full mode refuses incomplete transcription. Running the adapter creates source artifacts and reports their payload size; no separate worker checks are run. The coordinator connects this batch before dispatching full production and owns the bounded runtime-schema/composition check.

Sample IDs are `bpa-plan:P01092`, `bpa-plan:sec-8-1-3-sno-king-bank-3-bushing-ct`, `bpa-plan:P05449`, `bpa-plan:sec-8-6-1-bonanza-substation`, and `bpa-plan:P04974`. Missing or component-ambiguous native IDs use section/parent/named-component locators, never generated IDs presented as publisher IDs. Ledger IDs are audit references, not runtime identity. Future editions require explicit continuity review. Accepted native aliases remain separately visible, including Bonanza P05847/L0543 and P5470/P05470; P04632's planned breaker is not its completed line.

The complete accepted scope is 77 physical transmission work units, 15 completed units, one cancelled unit and five repeated observations. Combined bundles, the Warner/Hilltop split, named GERP children and the three Idaho/Wyoming proposals retain the coordinator-accepted boundaries. Existing asset lists, parent headings and unnamed conditional sub-options do not create extra projects. Morrow Flat remains an explicit cancellation despite its proposed-section placement. The source table reserves P03259 with unknown lifecycle despite the table's 2024 year.

Every sample record is unlocated with unknown owner. Source geometry remains cited evidence in the ledger, not runtime Point/MultiPoint data or a calculated center. Forecast conflicts/phases are preserved; primary dates stay unknown except Silver Creek. Sno-King's need year uses `kind=need`; estimated completion keeps unknown kind. No construction interval or exact day is manufactured.

Plan assertions use lifecycleAsOf `2025`, with source-edition meaning. The index's August 25, 2026 update is not a row update; sourceUpdatedOn stays null. GERP's January 2026 text and separately frozen public GIS evidence do not silently overwrite the selected plan scope. Publication day is unknown. `generatedAt` records the fixed source-review snapshot rather than execution time.

The table and output ledger preserve 14 public URLs/hashes and ignored-original paths. Frozen originals remain in the reusable worktree under `inputs/originals/F27-bpa-plan/`; public PDFs/HTML/GIS snapshots are not committed. Concise factual paraphrases, source citations and the normalizer are committed. Provider composition, UI and public-geometry qualification remain outside this adapter's ownership.
