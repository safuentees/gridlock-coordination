# F25 source qualification

Select **SCE public TPR, June 1, 2026** (`ca-sce-tpr`, edition `2026-06-01`). The anonymous workbook provides native project identities, lifecycle, source dates and location roles sufficient for a bounded first import. This qualifies one reporting portfolio, not California or national completeness.

## Comparison

| Approach | Evidence and decision |
|---|---|
| Existing-record enrichment | Reuse [completed F19 evidence](../../../app/src/data/evidence/README.md): one guarded permit-area proposal and nine unresolved records. Useful locally; no new regional inventory. No batch reopened. |
| Regional planned transmission | SCE qualifies below. SDG&E's July 2026 public workbook is accessible, but its 367 populated rows have blank latitude/longitude fields; no missing coordinate was recovered. PG&E exposes a public case-search page, but no workbook was acquired in this pass. |
| National expansion | Repeating source adapters with edition/identity/lifecycle reconciliation is the selected path. Prior screening identifies EIA-860 as a national generation comparator, not transmission coverage. MISO remains an untested fallback; accessible California records made fallback research unnecessary. |

## Source, access and meaning

- [CPUC TPR](https://www.cpuc.ca.gov/industries-and-topics/electrical-energy/electric-costs/transmission-project-review-process) identifies public and confidential submissions separately. [SCE's public index](https://www.sce.com/regulatory/regulatory-information/open-access-information/tpr-process) describes semiannual June/December reporting of FERC-jurisdictional transmission capital projects with historical/current/forecast spending and a $1 million threshold. This includes equipment and ancillary station work, not just new corridors. A 480V equipment item is not a 480V transmission line.
- [Exact SCE workbook](https://www.sce.com/sites/default/files/Regulatory/OpenAccessInformation/TPR/01%20Public_%28Public%29SCE%20TPR%20Process-June%202026.xlsx): edition June 1, 2026; retrieved September 30, 2026. Public download succeeded without authentication. No dataset-specific open reuse license was identified in the workbook/index; public availability is not a blanket license claim. No confidential counterpart was accessed.
- Original: `inputs/originals/F25-california-tpr-2026/sce-public-tpr-june-2026.xlsx` under the coordinator checkout, ignored by Git. SHA-256 `42f5ce7a686d08f3900d02eb5ebd09fe089dba39f6e04b1279038d6fde473118`. The JSON sample records its absolute path. [SDG&E public index](https://www.sdge.com/sdge-tpr-process) links the [July workbook](https://www.sdge.com/sites/default/files/JULY26-SDG%26E-Public%20-%20Resolution%20E-5252%20TPR%20Process%20Data.xlsx), retained beside it as `sdge-public-tpr-july-2026.xlsx`.

## Reproducible full enumeration

Read `CPUC TPR Public`, headers row 3, all populated project-name rows in `A4:CM497`. Observed: **494 rows and 494 unique TPR IDs**. Column A is the native TPR/SRP line ID (`TPR Notes!B4:C4`); AD/AE/AF are work-order/accounting aliases and repeat. Do not merge line IDs. Cross-edition stability has not been empirically compared; preserve ID-change field AG and reconcile refreshes explicitly.

There are 44 aggregate PB rows, 307 PB.xx subprojects and 143 SP projects. Seven aggregates have no child row in this edition. Keep every source row in reconciliation, but exclude aggregates from individual-project counts; do not manufacture their children.

| Raw lifecycle | All rows | Nonaggregate rows |
|---|---:|---:|
| Operational | 299 | 279 |
| Canceled | 4 | 4 |
| NA | 17 | 1 |
| Planning | 25 | 25 |
| Engineering less than 50% complete | 34 | 34 |
| Engineering more than 50% complete | 39 | 36 |
| Permitting | 17 | 17 |
| On Hold | 5 | 4 |
| Construction (under 10%) | 5 | 5 |
| Construction (10%-25%) | 5 | 5 |
| Construction (25%-50%) | 7 | 7 |
| Construction (50%-75%) | 13 | 13 |
| Construction (over 75%) | 24 | 20 |

Proposed full usable scope: **167 nonaggregate nonterminal/unknown project lines**: 166 with stated nonterminal lifecycle, plus PB-04.01 with NA lifecycle retained as unknown context. Reconcile 44 aggregates, 279 operational and 4 canceled rows as excluded from this future-work view. On Hold stays on-hold; NA stays unknown. These are source-as-of classifications, not current status inferred from dates. The inventory is not yet imported.

## Fields and geographic limits

- B/F/G identify name, purpose and work type. X is Project Manager, not asset owner; manager personal data is omitted. No owner field exists. Publisher/reporting group must not manufacture ownership.
- C/D are latitude/longitude. `TPR Notes!B5:C5` assigns substation centers, line beginnings/ends, or a single replaced-tower point. Multiple pipe-separated coordinates must remain paired and retain roles. No datum/CRS or positional accuracy is stated; neither WGS84 nor surveyed precision is claimed.
- BB retains raw lifecycle; `TPR Notes!B23:C23` explains that a specific project's status can summarize multiple work orders. BD is construction start; BF is projected-or-actual in-service. BF is not an explicit construction end. Preserve partial/ambiguous meanings and phase notes.
- The 166 known nonterminal leaves contain 83 numeric pairs, 59 textual location fields and 24 blank pairs. These are field forms, **not validated located counts**. The six-row sample has four coordinate-bearing rows and two unavailable locations; only the sample's missing-location rate is established (2/6). Three-point and unassigned-role collections require contract policy before deriving a center.

## Research accounting

Pass started `2026-09-30T07:28:47Z`; last source-reading/counting call ended at approximately `07:32:58Z`. Research was closed at `07:58:24Z`, after sample preparation: **29.62 minutes elapsed**, exceeding the requested 20-minute first-pass cap. No additional source queries followed. Earlier coordinator screening time is unknown, so cumulative usage and remaining time cannot be asserted; the original 60-minute/three-family/ten-row ceiling was not reset. Six representative rows are delivered; completed F19 evidence and national-comparator screening are reused by reference. Subsequent time is deliverable packaging only.
