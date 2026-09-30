# Florida municipal additions adapter

Reads only Table II-1, printed II-1 / PDF page 67, in the unchanged public TCRPC copy of the FMPA April 1, 2026 site plan. Original: coordinator checkout `inputs/originals/F27-fl-fmpa/FMPA Municipal Power.pdf`. SHA256 `dce5c6ec57b598c3bf98013881f64751914ef960253f839fa4e6b341f348a4af` is pinned. [Public copy](https://files.tcrpc.org/Programs_Services/Energy%20Planning/FMPA%20Municipal%20Power.pdf?t=202609031318390). No network access or source modification occurs during generation; no original binary enters Git.

```sh
python3 scripts/ingest/coverage/fl-fmpa/extract.py \
  --input '/absolute/path/FMPA Municipal Power.pdf' \
  --scope full \
  --output-dir app/src/data/real/coverage/fl-fmpa \
  --generated-at 2026-09-30T00:00:00+00:00
```

Use the Dataset's existing `generatedAt` to reproduce exact bytes. `pdfplumber` reads table cells and matches scalar words to each description's baseline. The five grouped City rows contain 59 work items (11/17/23/2/6); compound descriptions stay intact. Baseline alignment preserves Ocala entry 6's genuinely blank MVA/Circuit cells. These are text coordinates on a PDF page, not geographic coordinates or map interpretation.

`policy.json` records accepted group counts, six sample entries and ten exact context decisions. Sample scope emits six records and leaves 53 pending, with no exclusions. The coordinator connected the sample at `dca96d8` before full generation. The committed full output contains all 59 records: 49 transmission and 10 planning context, with zero pending, failed or excluded rows. The complete ledger records every item, raw values, classification and imported/pending reason.

`sourceId` is `2026-04-01:ii-1:<group-slug>:<two-digit-child>`; internal ID prefixes `fl-fmpa:`. It is an edition-specific source reference, not a native engineering ID. Full source references cite page/table/group/child. City is sponsor context; every qualified owner remains null. Dates are estimated in-service months, never construction windows or completion evidence. Named facilities and participant labels do not become coordinates; all native geometry/centers remain null. Report date anchors planned lifecycle, without individual approval/construction assertions. Raw MVA/Circuit/Voltage and unknowns remain available; no benefit or ownership inference is made.

Outputs: source-only Dataset 2, matching manifest, exhaustive row ledger and exact compact/formatted UTF-8 payload sizes. Full Dataset uses compact JSON. The actual accessible TCRPC copy is cited; binary equality with the unavailable PSC copy is not asserted. Original remains preserved. Coordinator alone runs the bounded integration checks; generation is not a runtime verification claim.
