# SCE public TPR producer

Reads the preserved June 1, 2026 public workbook using bundled Python and `openpyxl` in read-only mode. The exact source checksum is pinned; another edition requires a reviewed adapter update. Originals are never modified. No network call, asset lookup or geocoding is performed.

```sh
python3 scripts/ingest/coverage/ca-sce-tpr/extract.py \
  --input /path/to/sce-public-tpr-june-2026.xlsx \
  --scope sample \
  --output-dir app/src/data/real/coverage/ca-sce-tpr \
  --generated-at 2026-09-30T08:20:00Z
```

Use `--scope full` for all 494 source rows. `--retrieved-on` defaults to the actual acquisition date, 2026-09-30. Fix the generation timestamp to reproduce bytes. The script emits source-specific `dataset.json`, `manifest.json`, and `row-ledger.json`; coordinator owns aggregation and runtime validation.

Sample mode imports SP-01, PB-02.01, SP-05, PB-32.03, PB-04.01 and SP-118; every other row is pending. Full mode excludes aggregate PB rows and operational/canceled leaf rows while retaining on-hold and unknown project lines. Native TPR IDs stay distinct; work-order/accounting IDs are prefixed aliases, never deduplication keys. Parent program IDs refer to native ledger IDs, including excluded aggregates.

Manager names and the general Notes text are omitted. Selected source phase/schedule caveats are paraphrased with exact row citations. Publisher does not establish asset ownership. Raw `Other` work types and the unknown PB-04.01 sharing program are capital-project context; Substation/Transmission Line work types are transmission projects.

Point roles follow the source's TPR Notes. Only explicit substation/tower points and two line endpoints produce centers; the two-endpoint arithmetic convention is source normalization, not distance/ranking. All centers remain unverified, with unknown datum/accuracy and a stated WGS84 display assumption. Multiple or malformed coordinate fields retain evidence/raw ledger fields without an invented center. A projected-or-actual in-service milestone is never a construction end.
