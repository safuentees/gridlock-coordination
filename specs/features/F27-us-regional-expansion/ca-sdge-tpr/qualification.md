# SDG&E July 2026 public TPR qualification

Status: propose a finite public inventory for coordinator acceptance; no adapter or runtime dataset produced. The targeted source pass ran **11:22:10–11:28:27 UTC on September 30, 2026 (6m 17s)**. Original XLSX/HTML bytes are preserved unchanged under ignored `inputs/originals/F27-ca-sdge-tpr/`. Only public text/cell data was read; no NDA copy, credentials, map/image interpretation, geocoding or application checks.

## Source and edition

The [CPUC TPR index](https://www.cpuc.ca.gov/industries-and-topics/electrical-energy/electric-costs/transmission-project-review-process) identifies the July 1, 2026 release. The [SDG&E TPR page](https://www.sdge.com/sdge-tpr-process) separately links the [public workbook](https://www.sdge.com/sites/default/files/JULY26-SDG%26E-Public%20-%20Resolution%20E-5252%20TPR%20Process%20Data.xlsx) and describes the NDA route for confidential material. Only the public workbook is in scope. Publisher filename: `JULY26-SDG&E-Public - Resolution E-5252 TPR Process Data.xlsx`; the preserved local filename replaces punctuation for convenience.

| Original bytes | Size | SHA-256 |
| --- | ---: | --- |
| Public XLSX | 297,133 | `0e800beb097adc26be9669c841808ced2c18542c9a499465144b41399c3dd157` |
| SDG&E index HTML | 80,878 | `9a77fbfd955b0962a3f6aff2f746311f14bd3cf610d1fc26f37568537aceb8c0` |
| CPUC index HTML | 72,849 | `1e3dfc920b9586e9cf380886574a1bf22daaee9596830e947d2543e31c715a15` |

Propose source/reporting group `sdge-tpr`, edition `2026-07`, label “SDG&E public July 2026 TPR portfolio”, published July 1 and retrieved September 30. **July 1 is an edition date, not a known row modification or database-extraction date.** Map lifecycleAsOf to this day with `source-edition` meaning; sourceUpdatedOn remains null. The index schedule update is not project freshness evidence.

## Complete declared boundary

`Project List` has headers in rows 1–3, **367 data rows at A4:CO370**, sequential A Row No. 1–367, and blank rows 371–372. `Options List` and `Definitions` are dictionaries, not projects. The scope rule in `Definitions!G2` selects FERC transmission capital work meeting a $1m threshold at parent-work-order level (or most-specific ID if no parent), with expenditure history over five years or current/next four-year forecasts. It includes interconnection network upgrades and project subparts. This is not every utility project, every California project, or a deduplicated asset inventory.

| Proposed disposition | Rows |
| --- | ---: |
| Retained nonterminal row units | 137 |
| Excluded `[Programmatic]` summaries | 40 |
| Excluded other Operational rows | 187 |
| Excluded Canceled rows | 3 |
| **Complete declared rows** | **367** |

Exclusion precedence is summary, then operational/canceled; summaries contain 32 Operational and 8 nonterminal statuses. The three canceled rows are 56, 197, 200. Program summaries are recorded in the full ledger rather than expanded by their AF parent-project count. AF counts do not equal the children visible in this expenditure-bounded sheet and cannot establish missing invented rows.

Retain **93 explicit line/substation rows** as proposed transmission-project units and **44 supporting/program/Other rows** conservatively as capital-project-context. The latter designation preserves useful work while avoiding automatic physical-transmission qualification from a FERC filing alone. Raw equipment type is retained for subsequent accepted refinement. Of particular importance, Excel rows 121, 161, 163 are unprefixed distribution blanket budgets underneath excluded summaries 120, 160, 162. Keep each as context, omit its recordUnit, and disclose overlapping program/cost scope; do not claim three independent engineering assets.

Retained lifecycle counts: 83 planned, 40 under construction, 14 on hold. These source statuses remain authoritative even where service dates have passed or an actual/expected construction-start date lies after the release. `sample.json` contains all 367 exact row/name/ID/status/type/disposition entries, six mapped diagnostic proposals, date/identity conflicts, source hashes and sizing. Zero pending qualification rows does not mean ingestion is complete.

## C2/C3 mapping and identity

- `AD` is SDG&E's most-specific Project ID; `AE` is parent work order; `AG` is budget code (`Definitions!D31:G33`). 122 retained rows have unique non-placeholder AD values. Trim outer whitespace only, preserve raw aliases, and use `sdge-tpr:<AD>` with native-id meaning. Broader grouped descriptions remain one published row.
- Fifteen retained rows have AD=`NA` or `TBD`. Use an explicitly curated source-locator such as `project-list-row-009`, derived from A Row No. 9 / Excel row 12, with evidence of its exact sheet row. Do not call a budget code or parent work order a missing project ID. Future-edition continuity for these locators is unproven and needs an explicit crosswalk.
- Preserve parentProgramId from valid AE, AG budget aliases and AH identifier-change history. AH reports actual prior identifiers at rows 243, 248, 292, 330, 343; rows 121, 161, 163 provide a date with NA former IDs. Do not infer a change from that date alone. Three reused AD values appear in excluded operational rows; this already demonstrates why unconditional global deduplication is unsafe.
- `sponsor` may name the reporting utility; `owner` remains **null**. There is no asset-owner column. X is a person responsible for implementation, per `Definitions!D25:G25`, and every public X cell is blank. Publishing, reporting and ownership are distinct.
- Explicit physical work can use recordUnit project; broad budget/program scope omits that optional field. Source rows and parent/subparts can overlap. No silent merge with SCE or another source is authorized.

## Dates, locations and numerical fields

BG is **Current Projected or Actual In-Service Date**, not an assured completion date. 119 retained rows provide exact day values (strings or Excel date cells); 18 are unknown: 9 NA, 6 TBD, 3 Multiple. Keep raw unknown text and the projected-or-actual label. BF is the original planned in-service date, never a fallback for unknown BG. BE explicitly means when construction began **or is expected to begin** (`Definitions!D57:G59`); 115 retained rows give days, 22 do not. Propose a supplementary labeled BE milestone with date kind unknown and null constructionStart/buildWindow. No end of construction is supplied. The original BF forecast is another supplementary in-service milestone.

Preserve conflicts: 9 nonterminal rows have BG before the release (12, 41, 53, 61, 92, 116, 249, 307, 322); 3 construction-status rows have BE after release (106, 254, 347). The form's actual/expected ambiguity prevents silently correcting these. On Hold remains on hold even with a utility-approval checkbox. AH change dates and internal approval dates do not establish whole-record freshness.

All 367 C/D latitude/longitude pairs are blank. Definitions describe decimal coordinates, possible pipe-separated multiple locations and public redaction, but give no per-row position, CRS, accuracy or qualified point role. All retained location/nativeGeometry values remain null and centerRole unknown. E retains literal city/county/Multiple source text; it is not evidence for a coordinate or a state field. No geographic lookup or image interpretation is needed or allowed by this increment.

AA is transmission voltage in kV. AB mixes substation/transformer **MVA and kV**; do not treat MVA as voltage. Numeric AA values can be used directly; retain ambiguous/multiple text as evidence. Y is line length in miles; Z is footprint in acres; neither establishes shape/route/center. BK is original projected cost/range at parent-work-order scope (`Definitions!G63`), and BM is current projected fully-loaded or actual final cost (`Definitions!G65`); both are **$000**. These costs are not safely additive across parent/child/grouped units and are not the user's hypothetical land-sharing inputs. Preserve labels/raw units in evidence; no shared cost-schema change is proposed.

## Six diagnostic rows and representative output

| Excel row / A number | Diagnostic | Proposed identity/type | Current service date |
| --- | --- | --- | --- |
| 20 / 17 | San Onofre 230 kV disconnect work | `2026-4802`; transmission | 2028-05-31, projected or actual |
| 12 / 9 | San Onofre RTV coating | source-locator row 009; transmission | 2026-06-30 while still construction |
| 121 / 118 | HFTD Undergrounding | source-locator row 118; budget context | unknown; raw Multiple |
| 334 / 331 | FERC Order 881 | source-locator row 331; IT context | 2027-10-31, projected or actual |
| 342 / 339 | Pacific Beach–Rose Canyon | `2025-4180`; transmission, on hold | unknown; raw TBD |
| 356 / 353 | Mission 138 kV rebuild | source-locator row 353; transmission | unknown; raw TBD |

For row 20, the future producer would map AD 2026-4802 and parent QBL0003 to `sdge-tpr:2026-4802`, preserve engineering <50% as planned, retain BG 2028-05-31 with its projected-or-actual meaning, and expose the expected/actual BE 2027-10-11 separately. It would map AA 230 to voltageKv[230], keep AB 230 kV / 69 kV distinct, and leave owner/location/nativeGeometry/buildWindow unknown. The result is an explorable inventory record with evidence; it creates no geographic candidate until independent qualified location/owner evidence exists. `sample.json` is a qualification proposal, not an applied runtime revision.

## Acceptance proposal and payload planning

Accept the finite 137-unit unlocated scope with the 230 documented exclusions, the 93/44 conservative record-kind split, explicit blanket-budget limitations, native/source-locator identity policy and unknown owner/date/location rules above. Then commit an exact producer contract, connect these six diagnostics first and complete the remaining 131 only after coordinator connection. No public access blocker remains; the material unknowns are location, ownership and some scope/date/identity meanings, which remain explicitly unknown rather than blocking an honest contextual inventory.

Six proposed Project objects in a projects wrapper serialize to **14,666 compact / 20,746 formatted bytes**; largest individually formatted diagnostic is 3,204 bytes. This excludes qualification ledger/sourceFacts and is not a production payload claim. A conservative full formatted allowance is **894,280 bytes** (137 × twice that largest record +16 KiB for manifest/coverage), assuming concise paraphrases and no repeated whole-row dumps. Actual sample/full adapter payloads must be reported after acceptance. Against the coordinator's supplied 58,904,460-byte current revision, this allowance totals 59,798,740 bytes, below 64 MiB; this is sizing arithmetic, not an integrated build or import check.
