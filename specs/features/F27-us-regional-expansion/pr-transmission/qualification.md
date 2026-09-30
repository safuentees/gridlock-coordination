# Puerto Rico public transmission qualification

Qualified for a complete, bounded **Table 1** inventory, pending coordinator mapping acceptance. The [Energy Bureau public docket](https://energia.pr.gov/en/dockets/?docket=nepr-mi-2024-0005) lists the [August 27, 2026 monthly collaborative filing](https://energia.pr.gov/wp-content/uploads/sites/7/2026/09/20260827-MI20240005-Motion-to-Submit-August-2026-Monthly-Collaborative-Report-in-Compliance-with-Resolutions-and-Orders-of-March-2028-2025-and-February-18-2026-and-Request-for-Clarification-and-Exhibits.pdf), the newest comparable monthly inventory visible in the docket during this pass. September filings concern other matters or extensions. Ordinary anonymous public access succeeded; no conflicting confidentiality/redaction marking was found in this filing. Separate confidential comprehensive-plan filings were not accessed. The LUMA transparency index did not return usable text; it was unnecessary after the docket supplied a complete scope.

Preserved original: coordinator checkout `inputs/originals/F27-pr-transmission/20260827-MI20240005-Monthly-Report-public.pdf`, 63 pages, 2,367,226 bytes, SHA256 `d1bc3b2e3a42fca0f41c5d2ad52b136700cf5ae580d048b213a484f4e24b5cc5`. Public availability is not an open-data license. The original and extracted text stay outside Git; legal personnel details are not product inputs.

## Scope and complete reconciliation

Exhibit 1, **Table 1, PDF pages 12–15 / printed pages 5–8**, contains numbered rows **1–32**. It follows the physical hardening discussion, separate from the 51-segment inspections/corrective-maintenance program described on printed page 4. The declared scope is this complete table, not the whole report or all Puerto Rico transmission projects.

Propose **32 = 22 retained + 10 excluded**:

- Rows 1, 2, 3, 9, 10, 11, 12 and 13 explicitly completed/closed: exclude eight.
- Rows 6 and 8 describe energized lines with no remaining scope: exclude two.
- Rows 4, 5 and 7 retain additional physical hardening despite prior energization. The report's thirteen energized/completed summary includes such original scopes; it cannot replace row-level remaining-work decisions.
- Retained kinds: **21 transmission-project**, plus **one capital-project-context** at row 21, where structure replacement changed to critical repair.

Lifecycle proposal: planned rows 4/5/7/16/17/18/19/20/32 (9); on-hold 14/15 (2); unknown 21/22 (2); under-construction 23–26 (4); approved/reactivated 27–31 (5). Rows 21/22 report construction not completed without establishing how much began; preserve that uncertainty. Rows 23–26 explicitly report partially completed FIDs, without turning FID counts into separate projects. Procurement and funding do not establish construction.

Eight preceding descoped bullets on printed pages 4–5 are disclosed outside this table's scope; they are not additional source rows. Vegetation, 51-segment maintenance, BESS/generation, RTU and substation tables are separate, unqualified scopes. Do not use their totals to inflate this inventory.

## Identity, forecasts and unknowns

Source/group `pr-transmission`, edition `2026-08-27-table1`; published/filed August 27, retrieval September 30. Lifecycle as-of **2026-08**, with source-edition meaning, reflects the monthly report rather than a claimed row-status-change day. Some maintenance data explicitly lags a month and is outside Table 1.

No native engineering project ID is established. Funding Source mixes DOE/NFC/TBD and numeric tokens; those numbers cannot silently become project IDs. Line numbers repeat across scopes/segments. Use `sourceId=2026-08-27:table1:<two-digit-row>`, internal ID `pr-transmission:<sourceId>`, `identityBasis=source-locator`, `recordUnit=project`, with exact PDF/printed/table/row citation. Row 20 continues across PDF13–14; join that continuation once. Do not merge rows by line number, create asset-level children, infer parent programs or promise cross-edition continuity.

Dates are **expected construction** start/completion months, not in-service dates. For Project.date, preserve remaining construction completion with `kind=unknown` and an explicit label: rows 4/5/7 use their October 2026 narrative forecast, retaining historical table dates separately. Other retained rows use the table month, or unknown for dash/TBD. Keep both expected columns as labeled milestones. Preserve fiscal-quarter narrative without converting it to days. All `constructionStart` and `buildWindow` fields stay null; monthly estimates and reverse historical dates cannot establish exact day intervals.

LUMA is reporting/operator context, not automatic asset-owner evidence: all qualified owners remain null. No voltage column or native coordinates/geometry exist in the selected table; voltage arrays are empty, locations/centers/accuracy unknown. Named lines and terminal names remain context. No explicit cross-source links support deduplication or distinct-project claims.

Six raw examples cover incremental work, on-hold status, cross-page scope, critical-repair context, explicit approval and unknown completion. Text table extraction can enumerate all 32 rows reproducibly; preserve split-cell continuations and raw source wording. No production implementation is authorized by this artifact. Targeted pass: September 30, 2026 **09:49:58–09:52:44 UTC, 2.77 minutes** of the 15-minute ceiling. No worker checks or visual work.
