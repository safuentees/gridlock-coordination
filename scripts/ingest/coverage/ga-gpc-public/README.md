# Georgia Power public catalog normalizer

Accepted contract: `1bfe2dc8e96afb6bda0052c1b47b913781e25511`, `specs/features/F27-us-regional-expansion/ga-gpc-public/spec.md`. Source/group `ga-gpc-public`, edition `observed-2026-09-30`. The complete observed catalog has ten page observations: six transmission project/upgrade records and four capital-project contexts. It is a featured subset with unknown utility/statewide denominator; supporting notices and named components do not add records.

`catalog.json` contains all ten index rows, accepted classifications/lifecycles, six diagnostic mappings, raw tentative milestones, possible historical review leads and the fifteen original hashes (index, ten pages, four notices). The normalizer consumes this curated factual catalog and requires exact hashes; it does not claim automatic reconstruction of the qualification. Originals acquired by the qualifying worker remain untouched at coordinator `inputs/originals/F27-ga-gpc-public/`. No reacquisition, overwriting, source rendering, contact fields or map-derived locations are used. Adjacent `.txt` and acquisition metadata are derived aids, not original publisher files.

```sh
python3 scripts/ingest/coverage/ga-gpc-public/extract.py \
  --originals-dir '/absolute/path/inputs/originals/F27-ga-gpc-public' \
  --output-dir app/src/data/real/coverage/ga-gpc-public \
  --scope sample --generated-at 2026-09-30T12:57:22+00:00
```

Connection sample: Tomochichi, Big Tazewell, Decatur, Callaway, Hills Bridge and Ashley, in index order. Reconciliation is **10 = 6 imported + 4 pending**, zero excluded/failed/located. Sample classes are three transmission records and three capital contexts, with one planned/five unknown lifecycles. Full accepted policy is six transmission/four context, three planned/seven unknown. Remaining four mappings and full generation wait for coordinator provider connection and dispatch.

Identity is the frozen page basename, independently of edition, with `ga-gpc-public:` runtime prefix and source-locator basis. Context records omit recordUnit; Decatur is an upgrade, other transmission records use project. All primary date values are null with unknown precision/kind. Exact raw quarter/season labels remain in milestones with null values; no quarter boundaries, year coercion or precise construction windows are invented. Dated July 6, 2026 Hills and October 3, 2025 Ashley notices remain supporting historical evidence, not catalog publication or current stage confirmation.

Owners, centers, native geometry, construction starts/windows and source-update dates remain null. Only Big Tazewell's explicit Alabama/Georgia state text is populated in this sample. Index/detail county and program/voltage differences remain visible; approximate component miles stay descriptive and overlapping relocation lengths are not summed. Historical Georgia records remain separate: possible same-name review leads are notes, never aliases, shared identity or inherited dates/owners/locations.

Outputs are Dataset2, manifest, exhaustive row ledger and payload sizes. The manifest hash identifies the index; all fifteen source hashes remain in catalog/ledger. Sample source JSON is **30,369 compact / 39,629 formatted UTF-8 bytes**, including final newline. `generatedAt` is a reproducibility timestamp, not source freshness. No worker tests/build, runtime/schema or visual checks ran. Coordinator owns connection, integration and the combined milestone case.
