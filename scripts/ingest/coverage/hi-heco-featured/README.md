# Hawaiian Electric featured-topic normalizer

The deterministic adapter normalizes `source-records.json`, the accepted, cited factual transcription of the September 30, 2026 featured index. It uses Python's standard library and does not fetch changing live pages or infer facts from maps.

```sh
python3 scripts/ingest/coverage/hi-heco-featured/extract.py --scope full
```

`--output-dir` can select another artifact directory. Full mode emits all four retained topics with a reconciled seven-topic ledger: four imported, three excluded and zero pending/failed/located. It refuses incomplete transcription. The coordinator connected the initial Kalaeloa/North Kohala sample in PR87 before this increment. `--scope sample` still reproduces those two identities and reports the other two retained topics as pending in that smaller snapshot.

The accepted complete scope is four retained topics: two transmission improvements, one capital network program and one unresolved planning context. Koa Ridge's explicit completion supersedes its future-tense index summary; Waiau generation and Waena storage are excluded. Topic ordinals are audit locators only; stable source IDs are explicit page slugs, with unproven future-edition continuity. Workstreams, phases, pole counts, historical Keahole content and conditional REZ alternatives are not additional index records.

Kalaeloa retains the index/detail conflict of 21/20 replacement poles, actual approval day, anticipated construction month and service month. The forecast does not establish actual construction, and no build interval is manufactured. North Kohala's page update and newer annual assessment remain separately cited; a closed BESS procurement is not project cancellation. Existing-line voltage is context, not a storage rating. Every owner and geometry stays null; sponsor/publisher is never an owner fallback.

Downtown Honolulu remains one capital program with work underway and a 2030 horizon, not five invented child projects or a whole-program in-service date. Waiau structures remain planned transmission work with unknown numeric voltage; its 2030 survey/permitting forecast is a supplementary milestone, not construction start or completion.

Source hashes, URLs and ignored-original paths are copied into the generated ledger. The primary index has no established publication day. The nine sources include the index, seven linked topic pages and the June 30, 2026 annual filing used for North Kohala. Original HTML/PDF files remain under ignored `inputs/originals/F27-hi-heco-projects/` in the reusable UI worktree. Concise facts and citations are committed, not originals or images.

Running the normalizer creates source artifacts and reports payload sizes. No worker validation is run; the coordinator owns the bounded runtime-schema/composition case. Provider composition and broader Hawaii qualification are separate work.
