# PG&E public May 2026 TPR qualification

The public portfolio is accessible and reproducible: **2,671 native-ID rows, with 1,591 nonterminal entries proposed for retention and 1,080 terminal exclusions**. It combines physical project components, programs and forecast allocations. It is not a northern/central California engineering-project census. All public coordinate cells are blank. Six factual diagnostics and the exact proposed mapping/counts are in [sample.json](sample.json); no producer has started.

## Public source, edition and preservation

The [CPUC index](https://www.cpuc.ca.gov/industries-and-topics/electrical-energy/electric-costs/transmission-project-review-process) identifies the May 1, 2026 release. The linked [PG&E public regulatory library](https://pgera.azurewebsites.net/Regulation/) exposes case `14605`, “Transmission Project Review (TPR) Process [Res.E-5252].” A normal public search for April25–May5 returns the transmittal and an explicitly **PUBLIC Attachment11**. Its [published document link](https://pgera.azurewebsites.net/Regulation/ValidateDocAccess?docID=871875) downloads the XLSX without login. The separately labeled confidential workbook and confidential archives were not requested, nor were credentials/NDA access or alternate restricted endpoints used.

| Preserved original | Bytes | SHA256 |
|---|---:|---|
| `pge-may2026-public.xlsx` | 10402079 | `917464588f082e2239726479b331dff6ffda97436af9daa5372332a734d4b94e` |
| [Public transmittal](https://pgera.azurewebsites.net/Regulation/ValidateDocAccess?docID=871864), `pge-may2026-transmittal.pdf` | 327001 | `50b35533feee7eecb1c8da83269716390227559bb74412a558aeed3f62937393` |

The CPUC index, PG&E form and two public result pages are also preserved unchanged under ignored root `inputs/originals/F27-ca-pge-tpr/`; all six hashes/URLs are in the JSON. The search result identifies the workbook's original filename as `TransmissionProjectReviewTPR-Process_Other-Doc_PGE_20260501_871864Atch11_871875.xlsx`. No original workbook, contact details, hidden metadata or source prose is proposed for publication.

Three dates have different meanings: **publication/edition May1,2026; automated-field extraction March10,2026; project status through March2026** (transmittal pp2–3). Use `lifecycleAsOf=2026-03`, source-edition meaning; do not replace it with May publication or September retrieval. The transmittal also references an April22 notice of incomplete information. This qualification does not claim that public disclosure includes all underlying fields or that it is a current operational register.

## Complete declared enumeration and native units

The visible sheet **`CPUC TPR PUBLIC`** has header row4 and exactly **2,671 body rows5:2675**, source line numbers1:2671, columnsB:CV. Row1 financial totals and rows2–3 grouping/field labels are not records. Two other visible sheets are references: `Data Field Descriptions` (91 rows) and `Options Lists` (80 rows). The public project table is the entire proposed denominator; there is no paging/sample truncation.

ColumnAI, Utility Unique ID#1, contains **2,671 distinct nonblank native tokens**. Preserve token case, including `Ex112888` versus uppercase `EX...`; no artificial row IDs or title-based deduplication. Use `ca-pge-tpr:<exact AI token>` as the suggested identity. ColumnB is a locator, not the stable identity.

The definitions sheet rows32–34 distinguishes AI planning order (PO), AJ less-specific T.Dot and AM major work category. The transmittal pp5–7 adds investment codes and explains program buckets/forecast placeholders. The cost threshold is at ID#2 when available, otherwise ID#1; a low-cost PO can therefore legitimately appear. Historical spending and anticipated current/four-year spending define inclusion, regardless of service date. This is neither all assets nor only new projects.

Among retained rows, **192 native tokens are investment codes**, **148 descriptions identify buckets**, **48 descriptions identify forecast placeholders**, and **116 names are public redaction placeholders**; these sets overlap and must not be added. AJ has 1,200 T.Dot values, 267 NA, 123 TBD and one non-T.Dot value, `P.05271` (line2467, AI5744742). Preserve that supplied identifier without changing its spelling or inventing a T.Dot. AL is a parent PO count, not a list of extra rows. Names/descriptions may cover an entire parent, so they cannot establish that each PO is a separate engineering project.

Proposed physical-row units: **977 components with supplied ID#2 and 24 equipment-work upgrades without ID#2**. Preserve parent/group evidence, but do not synthesize imported parent records. Omit `recordUnit` for unsupported program/budget units; do not label buckets as projects or extend the enum. Cross-source overlaps with CAISO or other utility plans require evidence of exact identity and scope; names alone never trigger a merge.

## Lifecycle and disposition

| Raw BI status | Rows | Proposed treatment |
|---|---:|---|
| Operational | 1079 | Exclude terminal; ledger retains native ID/locator |
| Cancelled | 1 | Exclude terminal |
| Planning | 390 | Retain, planned |
| Engineering less than 50% complete | 234 | Retain, planned |
| Engineering more than 50% complete | 521 | Retain, planned |
| Five Construction percentage bands | 138 | Retain, under-construction |
| On Hold | 123 | Retain, on-hold |
| Programmatic Work | 185 | Retain, unknown lifecycle |

Thus **2,671 = 1,591 retained +1,080 excluded**, without source deduplication. Retained lifecycle totals are 1,145 planned, 138 under-construction, 123 on-hold and 185 unknown. Construction bands are 9 under10%, 24 at10–25%, 17 at25–50%, 37 at50–75% and 51 over75%. Definitions row62 warns the percentages are derived from milestone timing because PG&E does not track engineering/construction percentages directly; preserve the stated lifecycle without presenting a measured percentage of physical completion.

The transmittal separately says 1,434 in-progress projects in its five-year plan. That is **not substituted for** the reproducible 1,591 nonterminal-row count; the two definitions do not reconcile from this bounded pass. No public row is silently dropped to force a match. Utility-approval booleans, internal approval years, CAISO inclusion, in-flight rate-base flags and future service dates remain separate facts; none overrides BI or promotes an entry to construction.

## Conservative type proposal

The same ordered rules produce exact totals and are recorded in JSON:

1. After terminal exclusion, classify **planning-context** when G contains `forecast placeholder` or `redact`, AI begins EX (all matching case-insensitive, original values preserved), or C contains one of the four public replacement names identified on transmittal p8. Result: **312**.
2. Otherwise classify **capital-project-context** for G containing `bucket for`, BI=`Programmatic Work`, H=`Transmission Line - Right of Way`, or H outside the explicit `Substation -`, `Transmission Line -`, `Transmission Line/Substation` equipment classes. Result: **278**. These are reported capital allocations/programs or supporting scope; no engineering-project unit is asserted.
3. The remaining **1,001** rows have explicit physical transmission equipment classes within the FERC-transmission portfolio and can be **transmission-project** components/upgrades. This is source scope evidence, not a voltage threshold or a claim of 1,001 independent projects.

Public replacement names preserve disclosure limits; blanks are not reconstructed from the confidential version. The physical diagnostic for AI5771718 is especially useful: its parent description covers both HWT-owned and PG&E-owned assets. There is **no row-owner column**, and publisher/operator identity does not establish one owner for every PO. Proposed initial `owner=null` for all retained rows; any later source-scoped owner assignment needs row-specific ownership evidence. No global corporate aliases are inferred.

## Dates, voltage, cost and locations

- BM is current projected or actual in-service: **1,306 retained Excel day dates and 285 `OAI` values**. Preserve explicit day precision; OAI means operative as installed and remains unknown, not zero or an invented date. Use BM for comparison; do not backfill OAI from an obsolete original milestone. BL supplies 817 original day dates, 755 NA and19 TBD, retained as a labeled supplementary milestone.
- BK supplies 1,289 actual/expected construction-start day values and302 NA. Preserve that mixed actual/expected meaning. There is no explicit construction-end field, so **all buildWindow values remain null**; service date is not an end-of-construction event. Nonterminal BM dates span 2022–2042, without implying past dates are completed. AP is an approval year, not a service date or fresh lifecycle observation.
- AB contains line kV ratings; AC contains labeled substation/transformer capacity. All non-NA AC values in retained rows are explicit pipe-separated kV values in this edition. Retain field provenance and never treat MVA as kV in future editions. NA stays unknown. Z lengths and AA footprints describe supplied project scope, not mapped corridors or usable shared land.
- BQ/BR/BS/BT and annual cost columns use **$000**, not dollars. BQ's definition is the original ID#2 project total/range, while other fields have different cost/time meanings. Preserve labels, ranges and parent scope; do not sum repeated parent figures, infer savings or substitute these forecasts into the user's hypothetical impact calculation. The supplied prioritization/CBR scores do not become Gridlock scores.
- **D and E are blank for all2,671 rows.** Definitions rows7–8 describe line coordinates as endpoints and warn of public redaction, but provide no usable points, CRS or accuracy. The 1,591 retained rows have 1,070 city/county text values, 269 NA, 240 blank and12 TBD. Keep F as attributed sourceLocation; no city centroid, county centroid or geometry from text. `location=null`, `nativeGeometry=null`, `centerRole=unknown` for every retained entry. CNMI/continental eligibility rules do not change.

## Payload estimate and acceptance handoff

A non-persisted serialization model of the 1,591 retained rows, using the ordinary Project-shaped fields, public description/notes, selected labeled costs, two source references and original-service milestone, measures **4,698,884 compact /6,036,916 formatted UTF-8 bytes** before the manifest and extra Dataset nesting. This is a sizing estimate, not a produced/validated Dataset. The current aggregate of58,904,460 bytes plus this model is64,941,376 bytes, about2,167,488 below the64MiB limit. Actual fully normalized output must be measured before connection/cap decisions; the estimate alone does not justify raising or claiming compliance with the guard.

Suggested acceptance is group `ca-pge-tpr`, edition/publication `2026-05-01`, exact native AI IDs, the complete1,591-row nonterminal scope, the ordered classification above, March lifecycle evidence, and all-null ownership/geometry initially. Connect six diagnostic rows first, then normalize the full accepted scope with all2,671 rows reconciled. No enabling application change is proposed by this qualification.

PG&E's public library reserves rights and no open-data/commercial reuse license was established. Use factual paraphrases and citations for the authorized private analysis; do not publish the original XLSX/PDF or restricted material. Omit Y (Project Manager), contact sections and hidden metadata from every derived artifact. The targeted public pass ran11:22–11:29 UTC on2026-09-30, within15minutes. No producer, application/shared/core/UI/map/package changes or worker checks were made. This qualifies a substantial utility-limited public inventory; complete California transmission coverage remains unestablished.
