# ISO-NE RSP producer

Run with Python and openpyxl against the unchanged public June 2026 workbook:

```
python3 scripts/ingest/coverage/iso-ne-rsp/extract.py --input /path/to/final_rsp_project_list_jun_2026.xlsx --scope sample --output-dir app/src/data/real/coverage/iso-ne-rsp --generated-at 2026-09-30T08:35:00Z
```

Use `--scope full` for all 1,024 current rows. The source checksum is pinned; another edition requires reviewed mapping. Only the RSP_sortable current list is enumerated, not duplicate formatted/topical/history sheets. Latest BF status controls retention; major-project grouping and original Part categories do not determine lifecycle. Raw IDs and row dispositions are retained. No workbook changes, macros, network access, geocoding or restricted documents.

Projected in-service H has month precision regardless of stored Excel day. Explicit approval cells are separate milestones using their displayed precision; non-date No/NR remains a note. Proposed retains unknown normalized lifecycle, and all centers/construction windows remain null. Seven exact Primary Equipment Owner names map to documented source-scoped IDs; no corporate alias inference. Source descriptions/state and original row/field references remain accessible. Costs are not impact estimates. Originals stay ignored.
