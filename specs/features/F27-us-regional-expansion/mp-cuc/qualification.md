# CNMI public grid-planning qualification

Two usable, separately reproducible scopes were found: **10 IRP network-reinforcement recommendations** and **26 citizen-report power-work bullets, of which eight are proposed for retention**. All 18 proposed records are planning context, not transmission-qualified projects. Six diagnostics and complete disposition lists are in [sample.json](sample.json). No producer has started. These are bounded public-source inventories, not a complete Northern Mariana Islands project census.

## Sources and preserved originals

CUC's [reports index](https://cucgov.org/reports/) supplies the current links. The assigned older `/cuc_content/` IRP URL returned HTTP 404; its replacement is accessible without credentials. The legislature's citizen-report copy is also accessible, but includes an extra cover page. Use the publisher copy for canonical page locators and do not import the copies twice.

| Original | Edition / page basis | Bytes | SHA256 |
|---|---|---:|---|
| [CNMI IRP](https://cucgov.org/wp-content/uploads/2025/06/CNMI-Integrated-Resource-Plan.032725.pdf) | Cover dated 2025-03-27; 124 PDF pages | 3459188 | `d0a509e70cf4a7c87295259dc00d61caa02e7bf4e6933eaa195e1381dc5cb92e` |
| [CUC FY2025 CCR](https://cucgov.org/wp-content/uploads/2025/10/CUC-FY-2025-Citizen-Centric-Report.pdf) | October 2025 publication; four PDF/printed pages | 1342765 | `ae36d91aecd55ae0bc236971ebd0387e462fcc8c84c1d074e80dc7b90e0a2c5f` |
| [Legislature CCR copy](https://cnmileg.net/resources/files/24th%20House/2025%20CCR/CUC2025CCR.pdf) | Five PDF pages; printed p4 is PDF5 | 13954569 | `b53da36edc0bed1495002412b139b37c068186f6dd69ebdb7df66d8bf3efd555` |

All four acquired originals, including the reports HTML, are preserved unchanged under ignored root `inputs/originals/F27-mp-cuc/`; the JSON contains their URLs/hashes. Retrieval was 2026-09-30. Neither an upload directory nor a retrieval date changes the source edition. The IRP's exact cover date is an edition date; its publication day was not independently established. The CCR's month-only publication cannot be padded to a day.

## Scope A: IRP recommended network reinforcement

The entire **Table 45, PDF69 / printed55**, contains **10 rows: six Saipan, two Tinian, two Rota**. Count each body row once; do not generate a project per circuit, model node, compensator option or generation facility.

| Row | Island | Network recommendation | Qualification detail |
|---:|---|---|---|
| 1 | Saipan | Naftan connection | 2 km; 13.8 kV |
| 2 | Saipan | As Gonno connection | 0.5 km; 13.8 kV |
| 3 | Saipan | Kalabera connections | Two 12 km circuits; 34.5 kV |
| 4 | Saipan | Kiya 1 reinforcement | 13.8 kV; reconductor or parallel line |
| 5 | Saipan | Feeder 2 reinforcement | 13.8 kV; reconductor or parallel line |
| 6 | Saipan | Reactive support | 17.5 MVAr; alternative existing-generator support |
| 7 | Tinian | Marpo Heights connection | 1.5 km; 13.8 kV |
| 8 | Tinian | Reactive support | 5.2 MVAr; alternative existing-generator support |
| 9 | Rota | PV/BESS network connection | 0.1 km; modeled 15 kV line type serving a 13.8 kV network terminal |
| 10 | Rota | Reactive support | 1 MVAr; alternative existing-generator support |

These are conditional recommendations from the steady-state study, not an approved construction register. Sections 4.1–4.7, PDF55–69, establish their modeled purpose and describe the network as distribution. Existing-generation reactive capability can substitute for the compensators. Proposed C3 kind is `planning-context`, lifecycle `unknown` for all ten. No continental voltage cutoff is applied, and no statement is made that low-voltage island infrastructure cannot have a transmission role. The evidence simply does not establish that role here.

The **separate aggressive-generation Table 25, PDF52–53 / printed38–39**, contains seven printed rows, six distinct option labels: a repeated Naftan-minimum row appears on the second page. The JSON accounts for all seven. Treat these as supplemental alternative scenarios, not additional unique construction projects: Naftan maximum, Tapochao and Kalabera minimum propose different connections, while Kalabera maximum uses 34.8 kV/52.5 MW rather than Table45's 34.5 kV/40 MW. The As Gonno aggressive case says no upgrades, unlike Table45's 0.5 km line. Preserve these scenario differences, rather than silently correcting numbers or merging options. This proposed initial source scope is explicitly the ten-row recommended-reinforcement table; it does not claim the optional scenarios were adopted or exhaust all IRP concepts.

PDF76 / printed62 separately reports feeder RTU upgrades underway, with remote control scope unresolved, but gives no individual asset list. Keep that narrative as supplemental evidence outside Table45. Existing lines/substations, demand additions, generic SCADA/fiber capability recommendations, generation choices and storage capacities elsewhere in the IRP are not extra Table45 rows. The model and GIS inputs cited by the report were not acquired; no private information was requested.

## Scope B: FY2025 citizen-report power work

The declared enumeration is every top-level bullet in the **power generation/T&D/renewables section, PDF4 / printed4**. There are exactly **26 bullets** before the water/wastewater section. The latter is outside the power boundary. Page2's T&D narrative supplements the bullets and adds no independent records.

| Bullet | Proposed retained source entry | Lifecycle proposal and limits |
|---:|---|---|
| 5 | Grid-modernization subaward | Unknown; submitted SCADA/T&D program, no approved asset list |
| 6 | Saipan PP1–CHCC underground supply | Planned; design finished, construction application pending approval; explicitly distribution on p2 |
| 8 | Tinian critical-facilities underground supply | Planned; procurement for design/construction, not evidence of construction begun |
| 16 | Tinian and Rota concrete poles | Planned; one combined source entry, designs finished, construction applications pending |
| 17 | Saipan concrete poles | Planned; design application pending; p2 identifies Saipan |
| 18 | Route 33 pole replacement | Unknown; physical work named, no lifecycle/island/voltage assigned |
| 19 | AMI/AMR meter program | Unknown; ongoing across the three islands, without construction detail |
| 20 | Streetlight-efficiency program | Unknown; ongoing across the three islands, scope not enumerated |

Reconciliation is **26 = eight retained + 18 excluded**, with one record per retained bullet. Do not split bullet16 into two invented engineering IDs, nor split meter/streetlight programs by island. All eight remain `planning-context`: distribution, broad T&D programs or unresolved asset role. Physical work is useful evidence without asserting a transmission project.

The full exclusion ledger preserves each locator/reason. Excluded bullets are **1–4, 7, 9–15, 21–26**: completed generation/study/interconnection work, standalone generation/storage or their controls, power-plant civil/fuel/environmental work, drills/maintenance/vegetation, vehicles and broad master planning. In particular, SCADA for two generation units in bullet9 is not a grid upgrade merely because it appears in a T&D-adjacent section. The named underground supplies are retained physical context; an unscoped procurement question would not be.

## Shared contract and evidence meanings

- Suggested separate groups are `mp-cuc-irp` (edition `2025-03-27`) and `mp-cuc-ccr` (edition `fy2025-2025-10`). Coordinator accepts exact IDs. Both have CUC as publisher; GHD is the IRP preparer. These labels do not establish ownership.
- Use `identityBasis=source-locator`: table/row and printed-page/bullet locators are reproducible source identities, not native engineering IDs. Model node names are aliases/evidence only. The IRP report number identifies the consulting document; the PV/BESS solicitation number identifies generation procurement. Neither is a grid-project ID. Future editions require explicit identity review.
- IRP lifecycle evidence is dated `2025-03-27`; CCR evidence is `2025-10`, both `source-edition`. `sourceUpdatedOn=null`. No event dates were found for the retained entries: comparison dates remain unknown, `constructionStart=null`, `buildWindow=null`. The IRP's FY25/FY30 capital assumptions, one-year modeled solar/BESS construction and forecast start are not grid in-service dates or construction windows.
- Island and node/terminal names belong in attributed source-location text. Do not infer a Route33 island, unnamed critical-load endpoints, model-node coordinates or geometry from lengths. `sourceState` can remain null; the manifest declares the CNMI/Saipan/Tinian/Rota source scope.
- The IRP's PDF76 distinguishes CUC ownership/maintenance of existing Saipan/Tinian networks and a former Tinian PPA from current operations. It does not establish every proposed asset's owner or future IPP structure. Initial row owner remains null; no source/global owner identity is inferred from publisher, operator, public land or funder.
- No selected entry has native numeric coordinates, CRS or accuracy. PDF network maps, single-line diagrams and modeled line lengths are not qualified centers. Set `location=null`, `nativeGeometry=null`, `centerRole=unknown`; no geocoding or image interpretation. All proposed records remain spatially ineligible.

## Scope limits, reuse and next handoff

This assessment is **accessible and qualified for bounded contextual inventory**, not inaccessible and not evidence of zero CNMI transmission projects. No transmission-qualified row was established within these declared scopes. A complete active utility grid register remains unassessed: the specific missing input is a public asset-level capital/implementation inventory identifying adopted work, current lifecycle, ownership and project geography. The CCR mentions a master plan in progress but supplies no such register. Acceptance can deliver the 18 useful records without pretending that missing input has been resolved.

The IRP's PDF2/15 restrict use to its commissioned purpose and disclaim third-party reliance; no open-data license was established. CUC's index reserves rights. Preserve originals outside Git and restrict this proposal to factual paraphrases/citations for private analysis, without claiming permission to publish PDFs/images or reuse source prose commercially. No contact names, phones, emails or hidden metadata appear in the derived qualification.

The targeted public text pass ran approximately 10:45–10:52 UTC on 2026-09-30, within the 15-minute bound. Coordinator acceptance is required before any producer; then connect six real examples before the full declared scopes. No producer, shared/core/UI edits, tests, builds, browser automation, images or visual checks were used.
