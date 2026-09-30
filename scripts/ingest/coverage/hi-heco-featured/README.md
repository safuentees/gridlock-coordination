# Hawaiian Electric featured-topic normalizer

The deterministic adapter normalizes `source-records.json`, the accepted, cited factual transcription of the September 30, 2026 featured index. It uses Python's standard library and does not fetch changing live pages or infer facts from maps.

```sh
python3 scripts/ingest/coverage/hi-heco-featured/extract.py --scope sample
```

`--output-dir` can select another artifact directory. The initial two-record sample contains Kalaeloa and North Kohala. Its seven-topic ledger reports two imported, three excluded and two pending. Full mode refuses incomplete transcription. Connect this sample before continuing Downtown Honolulu and Waiau transmission structures.

The accepted complete scope is four retained topics: two transmission improvements, one capital network program and one unresolved planning context. Koa Ridge's explicit completion supersedes its future-tense index summary; Waiau generation and Waena storage are excluded. Topic ordinals are audit locators only; stable source IDs are explicit page slugs, with unproven future-edition continuity. Workstreams, phases, pole counts, historical Keahole content and conditional REZ alternatives are not additional index records.

Kalaeloa retains the index/detail conflict of 21/20 replacement poles, actual approval day, anticipated construction month and service month. The forecast does not establish actual construction, and no build interval is manufactured. North Kohala's page update and newer annual assessment remain separately cited; a closed BESS procurement is not project cancellation. Existing-line voltage is context, not a storage rating. Every owner and geometry stays null; sponsor/publisher is never an owner fallback.

Source hashes, URLs and ignored-original paths are copied into the generated ledger. The primary index has no established publication day. The nine sources include the index, seven linked topic pages and the June 30, 2026 annual filing used for North Kohala. Original HTML/PDF files remain under ignored `inputs/originals/F27-hi-heco-projects/` in the reusable UI worktree. Concise facts and citations are committed, not originals or images.

Running the normalizer creates source artifacts and reports payload sizes. No worker validation is run; the coordinator owns the bounded runtime-schema/composition case. Provider composition and broader Hawaii qualification are separate work.
