# NV Energy public 2026 IRP adapter

Current output is the accepted 21-row approved slice, not a completed Nevada inventory. The coordinator connected the six-record sample at048a9cf before this expansion. Accepted source universe: Volume9 Figure TP-131 (PDF54–55), 21 approved-table entries; Volume2 Exhibit B TRANSMISSION — IRP (PDF46–50 / Exhibit B4–8), 69 new construction-approval request bullets. Together these are 90 source units, not 90 unique engineering projects. The 21-row slice alone must never be marked full.

Originals remain unchanged and ignored in the coordinator checkout at `inputs/originals/F27-nv-nvenergy/`. The adapter pins SHA256 for public Volumes2/8/9; full hashes, URLs and byte sizes accompany the row ledger. It reads table/bullet text only using pypdf, with no network, rendering, map interpretation, confidential appendix or contact extraction.

```sh
python3 scripts/ingest/coverage/nv-nvenergy/extract.py \
  --input-dir '/absolute/path/inputs/originals/F27-nv-nvenergy' \
  --output-dir app/src/data/real/coverage/nv-nvenergy \
  --stage approved \
  --generated-at 2026-09-30T10:36:00+00:00
```

Use the committed Dataset's generatedAt to reproduce bytes. The adapter checks source identity during generation and fails on changed row/bullet structure; these guards are not a separate runtime test suite. It extracts 12 approved rows on PDF54 and nine on PDF55. Docket starts establish row boundaries, not project identity. Request page counts are 4/17/18/17/13; start after TRANSMISSION — IRP and stop before DEMAND SIDE PROGRAMS. All 69 raw bullets have stable one-based locators even while pending.

`policy.json` captures contract f674be0. Approved sample rows1/6/13/14/20/21 produce 4 transmission and 2 conservative capital-context records. The current complete ledger reconciles90 =21 imported +69 pending, zero exclusions/failed. Approved records are15 transmission and6 capital context, with18 approved/2 on-hold/1 partially under-construction. All69 requests remain pending. `request-policy.json` and `request-policy.md` propose their exact classifications, field meanings and related-scope treatment; coordinator acceptance is required before request normalization. This adapter has sample/approved stages, with scope=sample for both, and no full-output mode yet. Use `--stage sample` to reproduce the original six projects; their values/IDs are unchanged.

Approved identities use `nv-nvenergy:2026-05-06:tp-131:row-<two digits>`; pending requests use `2026-05-06:exhibit-b:request-<two digits>`. These are edition-specific source references, not native engineering IDs. Parent headings, economic-benefit totals and narrative components do not add records. Joint applicants are sponsor/reporting context only; every qualified owner and center remains unknown.

May6,2026 is the dated application/source edition; publishedOn is null. Exact table ISDs remain day forecasts, NA stays unknown. Greenlink North's narrative supplies December31,2028. Greenlink West's main December31,2027 and segment4 December31,2028 are distinct milestones with no aggregate date; explicit segment1 work supports partial under-construction status. No construction-start day or interval is invented. All output is source-only Dataset2 plus manifest, full raw ledger and measured compact/formatted payload sizes. Coordinator owns connection, acceptance and checks; no worker checks ran.
