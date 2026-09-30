# MISO MTEP quarterly inventory qualification

Qualified for inventory discovery with **3,042 retained facility components**, all unlocated. Select the [public Appendix A status workbook](https://cdn.misoenergy.org/Appendix%20A%20Status%20Report575959.xlsx?v=20260514162226) linked from MISO's [MTEP page](https://www.misoenergy.org/planning/transmission-planning/mtep/), rather than combining annual, project-level and facility-level inventories. This is a declared quarterly source scope, not complete MISO or state coverage.

## Source and enumeration

Original: coordinator checkout `inputs/originals/F27-miso-mtep/Appendix A Status Report575959.xlsx`, 537,983 bytes, SHA256 `55b8a60fc0a4159d9de52a5c1f83be04cfaa2c60468126408d9968782eb0c9dc`. Public CDN download succeeded anonymously. An ordinary request to the main HTML page returned 403; the web text tool could read that page and expose its official download links. No portal/login, NDA, CEII model, access workaround or asset-map substitute was used.

Read only visible sheet `MTEP Approved (Appendix A) ...`: headers A3:Y3, data A4:Y3214. There are **3,211 unique Facility IDs (H)** under **1,497 Project IDs (E)**, with no blank/duplicate facility identity. The workbook's internal metadata sheet is not inventory and must never enter application data. Source D1 says the report is through **August 4, 2026**, displayed as a day; it is not a publication date. Proposed source/group `miso-mtep`, edition `appendix-a-2026-08-04`, publishedOn null, lifecycleAsOf 2026-08-04 with source-edition meaning, retrieval 2026-09-30. The URL's older cache parameter is not source freshness.

| Raw facility status | Rows | Proposed treatment |
|---|---:|---|
| M2 - Appendix A Approved | 2,824 | approved |
| M3 - Under Construction | 217 | under-construction |
| M1 - Proposed | 1 | planned, with conflicting Current Appendix A caveat |
| M4 - Project in Service | 169 | exclude as completed/in service |

Retained rows still span all 1,497 parents. IDs are `miso-mtep:<Facility ID>`, `recordUnit=component`, `identityBasis=native-id`; explicit parent `miso-mtep:project:<Project ID>` is never a second imported record. Keep each component's name, description, type, target cycle, current appendix, planning region and raw status. Cycles span MTEP10–26: **176 rows target MTEP26 but are not uniformly draft**. Approval follows the row status, not the cycle year or source container.

The current [BPM-020 r34 archive](https://cdn.misoenergy.org/BPM-020%20Transmission%20Planning113822.zip?v=20250124144741) was preserved. `BPM-020-r34 Transmission Planning CLEAN.pdf`, effective July 1, 2026, pp.32–34 and 76 distinguishes project/facility fields and status meanings. M2 includes engineering/procurement after approval; M3 means construction has begun; M4 means completion/energization. No construction interval is implied.

## Scope and field proposal

Keep all 3,042 nonterminal records visible, with C3 distinctions: **2,850 transmission-project**, **162 capital-project-context** for `Facility Type=Misc.`, and **30 planning-context** decisions for explicit distribution equipment/connection scope. Exact IDs/locators are in sample.json. This is conservative source interpretation, not a voltage cutoff or keyword-only filter: other descriptions mentioning distribution also explicitly construct transmission lines or line-side equipment. No source records disappear because of these kinds. Ancillary fiber/control-house work is not a new transmission corridor.

Expected ISD (N) is a facility forecast; all 3,211 populated cells display `mm-dd-yy`, including old forecasts. Preserve that precision and never infer completion from elapsed dates. SourceUpdatedOn, buildWindow, constructionStart and all coordinates remain null. Keep labeled From/To Sub, Circuit ID, State 1/2 and positive max/min kV; zero voltage placeholders are not values. Costs/miles are source context, never savings or inferred routes. Six samples cover construction, proposed/approved inconsistency, a single owner, joint owners, ancillary fiber and distribution context.

`Facility Owner(s)` (K) is distinct from `Submitting TO` (C). Sponsor preserves the former raw token; the latter is separate context and never fills an absent owner. Of retained rows, 870 owner fields are blank, 147 are joint/generic and 234 belong to alias families needing reconciliation. Proposed qualified owners for the other 1,791 rows use source-scoped token IDs only, after whitespace/punctuation normalization. Preserve every raw owner. Null the exact unresolved families listed in sample.json (Ameren variants, NIPS/NIPSCO, SIGE/CPEI, DPC/full-name variants, ATXI/full name); no parent-company or cross-source identity is guessed. This keeps owner research bounded and future reconciliation explicit.

No native coordinates, CRS or positional accuracy are supplied. Sixteen State 1 labels occur in retained rows, including seam work outside MISO's core footprint; these counts do not establish jurisdiction completeness. Manual-described portal coordinate fields are not present in this public export. No attempt was made to obtain them through gated maps/models.

## Alternatives and limits

The separately linked [Projects Under Evaluation workbook](https://cdn.misoenergy.org/MTEP%20Projects%20Under%20Evaluation368757.xlsx) is also public and preserved (SHA256 `40f325fe4ce7cb4dbc24207219725f623956efafdf6febb2e67a90accb24e72e`). Its July 31, 2026 edition has 597 project rows: M1 506, M2 77, M3 2, M4 12. Defer this distinct scope; it is neither all draft nor safely additive to the component inventory without parent/edition reconciliation. The annual MTEP25 archive is an official alternative but was unnecessary once full public quarterly enumeration succeeded. Appendix H/existing assets were not used.

[MISO's terms](https://www.misoenergy.org/meet-miso/legal-and-privacy/) reserve rights and restrict redistribution/automated use; public download is not an open-data or commercial license. No permission, public publication or legal conclusion is asserted. Acquired originals remain outside Git; only factual samples and provenance are proposed here.

Public acquisition/meaning pass: **09:07:09–09:13:34 UTC, 6.42 minutes**, within the 15-minute bound; subsequent work only packages findings. Next: coordinator accepts exact mapping and source paths, then connects six components before full reconciliation. No adapter, worker checks or visual work were performed.
