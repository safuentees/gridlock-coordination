# NV Energy public 2026 IRP adapter

The full selected inventory contains all 90 accepted source units: 21 approved-table entries from Volume 9 Figure TP-131 (PDF 54–55), plus 69 new construction-approval bullets from Volume 2 Exhibit B TRANSMISSION — IRP (PDF 46–50 / Exhibit B 4–8). This is a complete enumeration of those two selected scopes, not all Nevada utilities or 90 unique engineering projects. The coordinator connected the first six records at 048a9cf, then accepted the full request policy at d108589. The six connected records and all 21 approved entries retain their values and identities.

Originals remain unchanged and ignored in the coordinator checkout at `inputs/originals/F27-nv-nvenergy/`. The adapter pins SHA256 for public redacted Volumes 2/8/9; complete hashes, URLs and byte sizes accompany the row ledger. It reads table/bullet text using pypdf, with no network, rendering, map interpretation, restricted appendix or contact extraction.

```sh
python3 scripts/ingest/coverage/nv-nvenergy/extract.py \
  --input-dir '/absolute/path/inputs/originals/F27-nv-nvenergy' \
  --output-dir app/src/data/real/coverage/nv-nvenergy \
  --stage full \
  --generated-at 2026-09-30T10:36:00+00:00
```

Use the committed Dataset's generatedAt for exact reproduction; this value is not source freshness. The adapter checks source hashes/structure and accepted raw request text during generation. These guards are not a separate test suite. It extracts 12 approved rows on PDF 54 and nine on PDF 55; docket starts locate row boundaries but do not identify projects. Request page counts are 4/17/18/17/13; start after TRANSMISSION — IRP and stop before DEMAND SIDE PROGRAMS. The `sample` and `approved` stages retain partial scope and pending requests; only `full` reconciles all 90 units.

`policy.json` preserves accepted approved-row rules. `request-policy.json` preserves every reviewed request decision from f6efcb6 and records acceptance at d108589; the existing proposed* field names remain for review traceability, and the accepted status governs them. `request-policy.md` explains classification and relationship choices. Full counts are 90 imported, zero excluded/pending/failed/located: 67 transmission and 23 capital context; 69 planned, 18 approved, two on-hold, one partially under-construction.

Approved identities use `nv-nvenergy:2026-05-06:tp-131:row-<two digits>`; requests use `nv-nvenergy:2026-05-06:exhibit-b:request-<two digits>`. They identify source observations, not native engineering assets. Eleven relationship groups remain cited evidence and notes rather than parent IDs or duplicate suppression. Walker River 53/64 remain unresolved observations; Mackay's incremental work remains separate from prior approval. Narrative parents/components and economic-benefit totals never add records.

May 6, 2026 is the dated application/source edition; publication remains null. Approved primary dates retain 19 day forecasts and two unknowns. All 69 request forecasts retain year precision. Sapphire's earlier required year is a separate need milestone. Greenlink West's main 2027-12-31 and segment 4 2028-12-31 remain distinct with an unknown parent date; explicit segment 1 work supports partial construction only. Six conflicting request voltages stay unknown with cited raw alternatives. Every qualified owner, location/native geometry and construction interval remains unknown; joint applicants are reporting context only.

Outputs are source-only Dataset 2, manifest, complete raw ledger with relationship evidence and exact payload sizes. Full Dataset uses compact JSON: 289,496 UTF-8 bytes; its formatted download is 365,375 bytes, including final newline. Source availability is not a redistribution-license claim. Coordinator owns integration and bounded checks; generation is not runtime verification and no worker checks ran.
