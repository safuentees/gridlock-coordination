# MISO public Appendix A component adapter

Reads the unchanged public status workbook through August 4, 2026 using openpyxl read-only/cached values. Only `MTEP Approved (Appendix A) ...` A4:Y3214 is inventory; metadata sheets are never enumerated or copied. Original: coordinator checkout `inputs/originals/F27-miso-mtep/Appendix A Status Report575959.xlsx`. SHA256 `55b8a60fc0a4159d9de52a5c1f83be04cfaa2c60468126408d9968782eb0c9dc` is pinned. [Official public download](https://cdn.misoenergy.org/Appendix%20A%20Status%20Report575959.xlsx?v=20260514162226).

```sh
python3 scripts/ingest/coverage/miso-mtep/extract.py \
  --input '/absolute/path/Appendix A Status Report575959.xlsx' \
  --scope full \
  --output-dir app/src/data/real/coverage/miso-mtep \
  --generated-at 2026-09-30T00:00:00+00:00
```

Use the prior Dataset's generatedAt for exact reproduction. Sample first uses the six qualified Facility IDs; all 169 known M4 rows are immediately excluded, while the other 3,036 retained rows are pending in the exhaustive ledger. The coordinator connected this sample at `faf5c03` before full generation. The committed output contains the accepted 3,042 retained / 169 M4 excluded records, with zero pending or failed rows.

`policy.json` preserves the accepted 30 planning-context decisions with their cell citations and the exact unresolved owner-token families. Source `Misc.` rows retain capital context; other accepted physical facility types retain transmission kind. These records remain visible regardless of kind. No voltage threshold or keyword-only scope filter is used.

Facility ID is native identity; Project ID is an explicit parent, never an extra record. M1/M2/M3 source statuses map to planned/approved/construction; M4 is excluded. Target cycle and Current Appendix do not override status. Expected ISD is a forecast; every populated cell in this edition displays `mm-dd-yy`. The parser respects displayed calendar precision and leaves unresolved formats unknown. No date becomes a construction window or proof of completion.

Facility Owner(s) remains raw sponsor text. Qualified identity is source-scoped only, with blank, joint/generic and exact alias-hold families null. Submitting TO is separate context and never substituted. Raw state/substation/circuit, costs, miles and cost-sharing remain source context, not geometry or benefit calculations. All centers/geometry remain unknown. Publication remains null: the workbook's through date is a source-as-of, not a publication or row-update date.

Outputs are source-only Dataset 2, matching manifest, exhaustive ledger with kind/owner dispositions, and compact/formatted UTF-8 byte sizes. Full Dataset output is compact. Original binaries remain outside Git; no network, macros or workbook save is performed. openpyxl may warn that an unused validation extension is unsupported; read-only extraction does not modify the source. Source generation is not runtime verification; coordinator alone checks the integrated milestone.
