# Railbelt text inventory normalizer

This adapter normalizes the reviewed factual table `source-records.json`. It does not infer project details from PDF maps or scrape live source revisions. The coordinator accepted the explicit chapter-3 text scope and identity mapping in F27-AK-Q/C3.

From the repository root:

```sh
python3 scripts/ingest/coverage/ak-aea-rstp/extract.py --scope full
```

Python standard library only. `--output-dir` can select an output directory. Full mode emits all 26 accepted retained records, a full manifest and the complete 28-leaf ledger. `--scope sample` reproduces the six-record connection subset; its other 20 retained leaves are reported as pending in that smaller snapshot. Full mode refuses any future incomplete transcription. Running the generator produces the source artifacts and reports payload sizes; runtime schema validation belongs to the coordinator's bounded case.

The first sample contains `map-B`, `map-C`, `map-F`, `sec-3-3-1-item-2`, `sec-3-4-2-item-1`, and `sec-3-4-4-item-1`. The source table preserves section/page/child references and companion map keys. The 12 parent groups and repeated presentations do not create more records. G/H are standalone BESS exclusions; the one mixed transmission/distribution leaf is capital-project-context. The coordinator connected the initial sample in PR80 before this full transcription.

Every retained record has `identityBasis=source-locator`. Published map keys are not engineering project IDs; other locators are curated section/child references. Do not regenerate continuity by ordinal or title for a later edition. A/B's duplicated cost titles are not assigned amounts. Keep the Bradley–Soldotna alternatives in one record; preserve North Pole/Fairbanks wording, the 138/139 kV discrepancies and conditional Fossil Creek context.

Normalization is conservative: unknown lifecycle except explicitly scheduled CIPLink; source-scoped owner IDs only for accepted single table owners; composite/unspecified owners stay null. Only the literal CIPLink completion statement supplies a month-level milestone with unknown kind. Range-like timeline values and the 2050 horizon are contextual notes, never absolute dates. All geometry/location/construction-window fields remain unknown. Descriptions are concise factual paraphrases, not reproduced report passages.

Official main and companion URLs, SHA256 values and ignored original paths are recorded in `source-records.json` and copied into the ledger. The main report is dated February 26, 2026; the companion cover says February 2026 without a day. Originals are preserved in the reusable UI worktree under ignored `inputs/originals/F27-ak-railbelt/`. No originals, images, private source material or manager/person names are committed.
