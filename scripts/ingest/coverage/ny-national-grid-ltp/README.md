# National Grid New York local-plan producer — full accepted inventory

Reads the accepted historical 2025-10-30 PDF, SHA256 `5f13264b522f017649867bc9f217568935a80f2a648c2d851c8aaccdcba27a33`, preserved unchanged under ignored root `inputs/originals/F27-ny-local/national-grid-local-transmission-plan-2025.pdf`. Uses the existing bundled Python/pdfplumber runtime; no application dependency is added. Read-only table extraction does not render or interpret maps.

```sh
python3 scripts/ingest/coverage/ny-national-grid-ltp/extract.py \
  --input inputs/originals/F27-ny-local/national-grid-local-transmission-plan-2025.pdf \
  --output-dir app/src/data/real/coverage/ny-national-grid-ltp --scope full \
  --generated-at 2026-09-30T09:46:40.681405+00:00
```

The six-record sample was provider-connected at `1a2b5d8` before this full output. `--scope full` emits all 136 accepted retained rows and the complete 152-row disposition ledger; the default `--scope sample` retains the initial six-record increment. `--generated-at` may pin the Dataset generation timestamp for byte-for-byte reproduction; generation time is not source freshness. Hash, header, per-page row-count and lifecycle guards stop changed source material before output. These are extraction safeguards, not worker tests. Coordinator owns schema/build checks and integration; workers do not run them.

| Source locator | Diagnostic purpose | Kind | Lifecycle |
|---|---|---|---|
| `2025-p007-r01` | Lockport station and transmission-line work | transmission-project | planned |
| `2025-p012-r04` | 34.5 kV breaker; no voltage-based type inference | planning-context | unknown |
| `2025-p014-r05` | Transmission taps plus distribution-substation context | transmission-project | unknown |
| `2025-p029-r03` | Indian River line and station work | transmission-project | under-construction |
| `2025-p031-r02` | Permit-like phrase in Project Status | planning-context | unknown |
| `2025-p050-r02` | Conceptual transmission loop | transmission-project | unknown |

Stable Project IDs prefix those locators with `ny-national-grid-ltp:`. Row numbers exclude the table header and pages are one based. The first five retained diagnostics from qualification plus Lockport formed the connected sample, whose identities and descriptions remain unchanged; the cancelled qualification example `2025-p030-r02` remains in the cited exclusion ledger. None uses a queue ID or project title as identity. A new edition requires explicit identity review, not page/title matching.

Accepted scope: 152 rows across 40 project-table pages; 12 explicitly In-Service and four Cancelled rows excluded; 136 nonterminal rows retained. The full output reconciles **136 imported + 16 excluded + 0 pending + 0 failed**, with zero located records. Sample mode still reconciles six imported, 16 excluded and 130 pending. The exact accepted transmission set is p7/r1, p13/r4, p14/r5, p24/r1, p25/r1, p29/r3, p42/r3 and p50/r2; all other nonterminal rows remain planning-context. This is a conservative evidence minimum, not a finding that other rows are non-transmission.

Name/status and study/permit/driver facts are source text with whitespace normalized. `scope-summaries.json` contains concise factual scope summaries for all 136 retained rows; the producer requires an exact locator-key match before output. It preserves conditional and unspecified scope instead of reproducing the PDF. Source queue references and recognizable equipment labels remain labeled aliases, never identities or inferred parent projects. Voltage values come only from explicit kV expressions in the source name/scope and do not classify projects. The known extracted `kVsubstation` joined word retains its explicit voltage; no name or source text is silently rewritten. Month/year service dates remain month precision. Firm flags, completed studies and permit states do not imply approved/construction lifecycle. Source `Concept`, `Initiated`, `N/A` and the permit-like status stay unknown. The full retained lifecycle counts are 90 planned, 15 under-construction and 31 unknown.

All owners, sponsors, geometry, locations and construction windows remain null. Planning-area labels are location context; New York jurisdiction is manifest footprint, not an invented row state. Source-locator identity, source-edition lifecycle date, unknown publication/row-update dates and exact page/row/field citations are retained. No geocoding, contacts, PDF images, parent inference or calculations are added.

`dataset.json` is the provider-ready Dataset v2; `manifest.json` duplicates its source manifest; `row-ledger.json` accounts for every source row; `source-quality.json` distinguishes full-source/accepted counts from the emitted scope and preserves the field anomaly; `payload-sizes.json` records actual UTF-8 Dataset sizes. Full Dataset: **337,793 compact / 444,115 formatted bytes**.

This is National Grid's historical New York local plan, not statewide or current coverage. Both public utility indexes linked the 2025 inventory during qualification; a newer referenced August 2026 update was not located. The [source](https://www.nationalgridus.com/media/pdfs/microsites/wholesale-interconnections/national_grid_local_transmission_plan_2025.pdf) is cited for authorized private factual analysis; [US terms](https://www.nationalgridus.com/our-company/terms-conditions) impose reuse restrictions. The original stays outside Git. No PDF publication, open/commercial license or public release is asserted.
