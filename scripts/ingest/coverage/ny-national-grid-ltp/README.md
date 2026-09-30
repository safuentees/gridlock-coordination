# National Grid New York local-plan producer

Reads the accepted historical 2025-10-30 PDF, SHA256 `5f13264b522f017649867bc9f217568935a80f2a648c2d851c8aaccdcba27a33`, preserved unchanged under ignored root `inputs/originals/F27-ny-local/national-grid-local-transmission-plan-2025.pdf`. Uses the existing bundled Python/pdfplumber runtime; no application dependency is added. Read-only table extraction does not render or interpret maps.

```sh
python3 scripts/ingest/coverage/ny-national-grid-ltp/extract.py \
  --input inputs/originals/F27-ny-local/national-grid-local-transmission-plan-2025.pdf \
  --output-dir app/src/data/real/coverage/ny-national-grid-ltp \
  --generated-at 2026-09-30T09:38:21.619461+00:00
```

The producer emits only the six accepted retained rows and the full 152-row disposition ledger. `--generated-at` may pin the Dataset generation timestamp for byte-for-byte reproduction; generation time is not source freshness. Hash, header, per-page row-count and lifecycle guards stop changed source material before output. These are extraction safeguards, not worker tests. Coordinator owns schema/build checks and the next full-scope handoff after provider connection.

| Source locator | Diagnostic purpose | Kind | Lifecycle |
|---|---|---|---|
| `2025-p007-r01` | Lockport station and transmission-line work | transmission-project | planned |
| `2025-p012-r04` | 34.5 kV breaker; no voltage-based type inference | planning-context | unknown |
| `2025-p014-r05` | Transmission taps plus distribution-substation context | transmission-project | unknown |
| `2025-p029-r03` | Indian River line and station work | transmission-project | under-construction |
| `2025-p031-r02` | Permit-like phrase in Project Status | planning-context | unknown |
| `2025-p050-r02` | Conceptual transmission loop | transmission-project | unknown |

Stable Project IDs prefix those locators with `ny-national-grid-ltp:`. Row numbers exclude the table header and pages are one based. The first five retained diagnostics from qualification plus Lockport form this sample; the cancelled qualification example `2025-p030-r02` remains in the cited exclusion ledger. None uses a queue ID or project title as identity. A new edition requires explicit identity review, not page/title matching.

Accepted scope: 152 rows across 40 project-table pages; 12 explicitly In-Service and four Cancelled rows excluded; 136 nonterminal rows retained eventually. This sample reconciles **6 imported + 16 excluded + 130 pending**, zero failed/located. Do not emit the remaining records before coordinator provider connection. The exact accepted transmission set is p7/r1, p13/r4, p14/r5, p24/r1, p25/r1, p29/r3, p42/r3 and p50/r2; all other nonterminal rows remain planning-context. This is a conservative evidence minimum, not a finding that other rows are non-transmission.

Name/status and study/permit/driver facts are source text with whitespace normalized. Six scope descriptions are concise factual summaries rather than a reproduction of the PDF. Voltage values come only from explicit kV expressions in the source name/scope and do not classify projects. Month/year service dates remain month precision. Firm flags, completed studies and permit states do not imply approved/construction lifecycle. Source `Concept`, `Initiated`, `N/A` and the permit-like status stay unknown. The full target lifecycle counts are 90 planned, 15 under-construction and 31 unknown.

All owners, sponsors, geometry, locations and construction windows remain null. Planning-area labels are location context; New York jurisdiction is manifest footprint, not an invented row state. Source-locator identity, source-edition lifecycle date, unknown publication/row-update dates and exact page/row/field citations are retained. No geocoding, contacts, PDF images, parent inference or calculations are added.

`dataset.json` is the provider-ready Dataset v2; `manifest.json` duplicates its source manifest; `row-ledger.json` accounts for every source row; `source-quality.json` distinguishes full-source/accepted counts from this sample and preserves the field anomaly; `payload-sizes.json` records actual UTF-8 Dataset sizes. Current sample: **17,822 compact / 23,003 formatted bytes**.

This is National Grid's historical New York local plan, not statewide or current coverage. Both public utility indexes linked the 2025 inventory during qualification; a newer referenced August 2026 update was not located. The [source](https://www.nationalgridus.com/media/pdfs/microsites/wholesale-interconnections/national_grid_local_transmission_plan_2025.pdf) is cited for authorized private factual analysis; [US terms](https://www.nationalgridus.com/our-company/terms-conditions) impose reuse restrictions. The original stays outside Git. No PDF publication, open/commercial license or public release is asserted.
