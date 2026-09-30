# Puerto Rico public Table 1 adapter

Reads only Exhibit 1, Table 1, PDF pages 12–15 / printed pages 5–8 of the unchanged August 27, 2026 public filing. Original: coordinator checkout `inputs/originals/F27-pr-transmission/20260827-MI20240005-Monthly-Report-public.pdf`. SHA256 `d1bc3b2e3a42fca0f41c5d2ad52b136700cf5ae580d048b213a484f4e24b5cc5` is pinned; actual public download URL is in the manifest. No network, rendering, source edits, legal-personnel extraction or confidential-plan access occurs during generation.

```sh
python3 scripts/ingest/coverage/pr-transmission/extract.py \
  --input '/absolute/path/20260827-MI20240005-Monthly-Report-public.pdf' \
  --scope sample \
  --output-dir app/src/data/real/coverage/pr-transmission \
  --generated-at 2026-09-30T00:00:00+00:00
```

Use the existing Dataset's generatedAt for exact reproduction. `pdfplumber` text tables expose nested split cells; select the single table with the numbered-row header on each source page, retain numbered rows 1–32, and join unnumbered continuations to the preceding row. Row 20 continues from PDF 13 to 14 once. The funding legend is not an inventory row. No visual or geographic interpretation is performed.

`policy.json` captures the accepted exact row decisions. The six retained diagnostic rows are 4/14/20/21/27/32. Sample scope reconciles 32 = 6 imported + 10 excluded + 16 pending. Known exclusions apply immediately across the ledger. Coordinator connects this sample before authorizing `--scope full` for 22 retained (21 transmission and one row 21 critical-repair capital context). The ledger always preserves every numbered row's raw title/funding/status/forecast and reason, including exclusions.

`sourceId=2026-08-27:table1:<two-digit-row>` is an edition-specific source reference; `id` prefixes `pr-transmission:`. Repeated line numbers, funding tokens and continuations never create or merge engineering-project identities. LUMA is reporting/operator context, never a qualified owner. All owners/voltage/locations/geometry/construction day bounds remain unknown.

Project.date means remaining **construction completion**, with kind unknown and month precision. Rows 4/5/7 prefer the explicit October 2026 narrative forecast while preserving original table start/completion and original line energization as distinct milestones. Other rows retain table month or unknown dash/TBD. Fiscal-quarter narrative stays text. Incomplete-work rows 21/22 have unknown lifecycle; rows 23–26 report actual partial work. Source edition is August 2026, filed August 27, not live status. These choices do not add construction days, in-service forecasts or calculation implementations.

Outputs are source-only Dataset 2, matching manifest, exhaustive ledger and exact compact/formatted UTF-8 payload sizes. Full Dataset uses compact JSON. Original binary remains outside Git; public access does not establish a redistribution license. Coordinator alone runs bounded milestone checks; generation is not runtime verification.
