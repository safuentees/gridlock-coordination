# Georgia Power public catalog normalizer

Accepted contract: `1bfe2dc8e96afb6bda0052c1b47b913781e25511`, `specs/features/F27-us-regional-expansion/ga-gpc-public/spec.md`. Source/group `ga-gpc-public`, edition `observed-2026-09-30`. The complete observed catalog has ten page observations: six transmission project/upgrade records and four capital-project contexts. It is a featured subset with unknown utility/statewide denominator; supporting notices and named components do not add records. Coordinator connected the six-record sample at `d7ef5cd69f1ea1964f383929ae3f79c6ef86cdd2` before dispatching the final four.

`catalog.json` contains all ten index rows, accepted classifications/lifecycles, all ten mappings, raw tentative milestones, possible historical review leads and the fifteen original hashes (index, ten pages, four notices). The normalizer consumes this curated factual catalog and requires exact hashes; it does not claim automatic reconstruction of the qualification. Originals acquired by the qualifying worker remain untouched at coordinator `inputs/originals/F27-ga-gpc-public/`. No reacquisition, overwriting, source rendering, contact fields or map-derived locations are used. Adjacent `.txt` and acquisition metadata are derived aids, not original publisher files.

```sh
python3 scripts/ingest/coverage/ga-gpc-public/extract.py \
  --originals-dir '/absolute/path/inputs/originals/F27-ga-gpc-public' \
  --output-dir app/src/data/real/coverage/ga-gpc-public \
  --scope full --generated-at 2026-09-30T13:01:47+00:00
```

Full reconciliation is **10 imported**, zero pending/excluded/failed/located. Classes are **six transmission records and four capital contexts**, with **three planned and seven unknown** lifecycles. Effingham, Grassy Hollow, Hatch and Conyers were added in index order. The six connected catalog mappings and normalizer were left unchanged, preserving project values, IDs and relative order; `--scope sample` still selects Tomochichi, Big Tazewell, Decatur, Callaway, Hills Bridge and Ashley. This completes the declared featured catalog, not a utility/statewide inventory.

Identity is the frozen page basename, independently of edition, with `ga-gpc-public:` runtime prefix and source-locator basis. Context records omit recordUnit; Decatur is an upgrade, other transmission records use project. All primary date values are null with unknown precision/kind. Exact raw quarter/season labels remain in milestones with null values; no quarter boundaries, year coercion or precise construction windows are invented. Dated July 6, 2026 Hills and October 3, 2025 Ashley notices remain supporting historical evidence, not catalog publication or current stage confirmation.

Owners, centers, native geometry, construction starts/windows and source-update dates remain null. Only Big Tazewell's explicit Alabama/Georgia state text is populated in this catalog. Index/detail county and program/voltage differences remain visible; approximate component miles stay descriptive and overlapping relocation lengths are not summed. Historical Georgia records remain separate: possible same-name review leads are notes, never aliases, shared identity or inherited dates/owners/locations.

Outputs are Dataset2, manifest, exhaustive row ledger and payload sizes. The manifest hash identifies the index; all fifteen source hashes remain in catalog/ledger. Full source JSON is **51,940 compact / 68,800 formatted UTF-8 bytes**, including final newline. `generatedAt` is a reproducibility timestamp, not source freshness. No worker tests/build, runtime/schema or visual checks ran. Coordinator owns integration and the combined milestone case.
