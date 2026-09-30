# ISO-NE RSP public inventory qualification

Qualified on 2026-09-30 within the assigned 15-minute source timebox. **The public June 2026 RSP list supports a 46-record nonterminal transmission inventory across six states, with zero native located records.** Six source examples accompany this note in [sample.json](sample.json). This is a qualification handoff, not an importer or accepted shared contract.

## Source and preserved original

- Publisher: ISO New England. Exact edition: **Final RSP Project List — June 2026**, published **2026-07-09** according to the official public document listing. The workbook itself is marked ISO-NE Public at `06_2026_RSP!A1`.
- [Official index](https://www.iso-ne.com/system-planning/system-plans-studies/rsp); [direct XLSX](https://www.iso-ne.com/static-assets/documents/100037/final_rsp_project_list_jun_2026.xlsx). The listing was resolved through the site's public documents API with `type=doc`, excluding CEII. Download required no login. No restricted documents were requested.
- Unchanged original: ignored root `inputs/originals/F27-iso-ne-rsp-2026/final_rsp_project_list_jun_2026.xlsx`; 1,967,096 downloaded bytes; SHA256 `adfe05f5c0f24e260acca3b10c692785b4298a2067fa2e79efcf1d079953190d`. Listing/index metadata is preserved beside it. The listing's approximate size is not substituted for the downloaded byte count.
- Retrieved edition is a dated planning snapshot, not a current-status guarantee. Workbook creation/modification metadata is July 9, 2026. A later notice about upcoming list changes is not a replacement project-list edition.

## Inventory scope and full enumeration

The RSP list covers transmission work arising from ISO-NE regional planning. Generator-interconnection upgrades here are transmission additions/modifications, not an inventory of proposed generators. Asset-condition work has a separate list and is outside this handoff. These distinctions are documented in ISO-NE's [list description](https://www.iso-ne.com/system-planning/system-plans-studies/rsp/rsp-project-list-and-the-asset-condition-list).

Use `RSP_sortable!A2:DE1025`: exactly **1,024 project rows, 1,024 distinct numeric Project IDs**, one header row and no other nonempty rows in that table. The formatted `06_2026_RSP` sheet has the same 1,024 distinct IDs and no additional IDs. It is a duplicate presentation, not another source. The Boston 2033, UME 2029 and SEMARI sheets are topical views; hidden historical/calculation sheets are not additional current inventory. No macros were executed.

| Latest source status, normalized only for whitespace/case | Rows | Proposed disposition |
|---|---:|---|
| Planned | 37 | Retain as planned |
| Under Construction | 7 | Retain as under-construction |
| Proposed | 2 | Retain with raw status; conservative unknown lifecycle pending acceptance |
| In-service | 643 | Exclude from prospective inventory; retain ledger reason |
| Cancelled | 335 | Exclude from prospective inventory; retain ledger reason |
| **Total** | **1,024** | **46 retained + 978 excluded; zero pending/failed classification** |

The 46 retained records comprise 24 generator-interconnection upgrades, 13 reliability upgrades and 9 elective upgrades. Their source State fields allocate CT 5, MA 20, ME 9, NH 3, RI 2 and VT 7. These are source-edition counts, not all planned work in each state. ISO-NE's [operating footprint](https://www.iso-ne.com/markets-operations/transmission-operations-services) covers Connecticut, Massachusetts, New Hampshire, Rhode Island, Vermont and most of Maine; do not imply all of Maine or exhaustive local-utility coverage.

A production adapter must emit one ledger disposition for every row 2–1025, use only latest status column BF, and reconcile the above counts. Do not use historical status columns, elapsed dates or original Part categories to decide current lifecycle. The workbook explicitly retains original Part categories after cancellation or completion (`06_2026_RSP!C1075`).

## Field meanings and proposed mapping

| Field | Exact source | Meaning / handling |
|---|---|---|
| Native identity | `RSP_sortable!C`, Project ID | Preserve the published integer as a string. Unique at the individual listed-work-item level in this edition. Never key by row, title, Queue Position or Major Project. Cross-edition stability is a reasonable adapter assumption, not established by this one-edition qualification. |
| Grouping | I Major Project, B Part#, A Primary Driver | Major Project repeats across component work items; retain as context, not an invented parent ID or deduplication key. Part# indicates need category and can outlive lifecycle changes. |
| Publisher vs owner | E Primary Equipment Owner, F Other Equipment Owner(s) | ISO-NE is publisher. E explicitly evidences equipment ownership. All 46 retained rows have E populated; F is empty on all 46. Trim surrounding whitespace while preserving raw text and exact field evidence. Canonical owner IDs need an explicit coordinator-approved mapping; do not infer legal aliases, owner identity from publisher, or project sponsors from Queue Position. |
| Latest lifecycle | BF Jun-26 Status | Planned and Under Construction map directly. Proposed is less mature: source definitions distinguish studies/proposals from planning or interconnection agreement milestones (`06_2026_RSP!D1077:D1087`). Preserve Proposed visibly; recommended conservative normalized unknown avoids claiming approval or changing shared enums. Coordinator may choose a documented broader planned mapping. |
| Projected in-service | H Projected In-Service Month/Year | All 46 retained values are Excel dates displayed `mm/yyyy`. Preserve **month precision**. Stored days include 1, 2 and 31; they are not evidence of exact in-service days. Label projected in-service, not construction end. |
| Approval milestones | BH PPA (I.3.9) Approval; BI TCA Approval | Separate approval evidence, sometimes dates and sometimes No/NR. They do not supply construction boundaries. No/NR are not dates or zero values. |
| Place and geometry | D State; place references in J Project | State is jurisdiction context, not a coordinate. No native latitude/longitude or geometry fields were found in the enumerated table. Retain `nativeGeometry=null`, `location=null`, `centerRole=unknown`; no geocoding or centers inferred from descriptions, named substations, lines or states. |
| Construction window | No explicit start/end fields | `constructionStart=null`, `buildWindow=null`; Under Construction does not establish its start date. |
| Costs | DE Jun-26 Estimated PTF Costs | Optional source cost evidence, not savings or resource-sharing benefit. Preserve NR/unknown; ignore the adjacent derived DIFF error cells. No impact estimate is established by these costs. |

The retained owner names, after trimming, are Eversource (21), Central Maine Power Company (7), Vermont Electric Power Company (7), National Grid, USA (6), Rhode Island Energy (2), Versant Power (2) and United Illuminating Company (1). Their names do not themselves resolve cross-source corporate identity.

## Six representative records

`sample.json` preserves raw owner/status/date fields and cell locators for CT 1938 (Planned), MA 1934 (Proposed), RI 1928 (Planned), ME 1914 (Under Construction), VT 1813 (Planned), and NH 1758 (Planned). It intentionally includes the RI raw day 2 versus displayed month and NH trailing owner whitespace. Description summaries are explanatory paraphrases, not substitute source fields. Null geometry is explicit on every example.

## Acceptance boundary and reuse

Inventory qualification succeeds independently of spatial eligibility: **46 useful nonterminal records; 0 native located records; 0 currently eligible distance-matching records**. Even evidenced owners cannot compensate for absent locations. No geometry investigation, local-system-plan expansion, CEII access or geocoding is part of this qualification.

ISO-NE's [website terms](https://www.iso-ne.com/legal-privacy) identify copyright protection, restrict some reuse and provide content without accuracy/completeness/timeliness guarantees. No dataset-specific open license was found. Public unauthenticated access establishes availability, not unrestricted redistribution rights. Coordinator must resolve the intended publication/reuse basis before production redistribution; no permission was requested or assumed.

Before dispatching production work, coordinator accepts the exact source key/reporting group and output paths, the treatment of Proposed, explicit owner-name mapping and reuse basis. Preserve all 46 unlocated records if accepted; do not require invented coordinates. Then deliver the six real records before full extraction, followed by complete row-ledger reconciliation. No shared schema, importer, map or production-data changes were made. No builds, tests, browser automation or visual checks were run.
