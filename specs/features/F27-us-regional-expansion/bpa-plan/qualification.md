# F27-BPA-Q — Bonneville full-plan qualification

Recommendation: accept the complete named transmission-work scope of the [final 2025 BPA Transmission Plan](https://www.bpa.gov/-/media/Aep/transmission/attachment-k/2025-BPA-Transmission-Plan_Final.pdf), with an explicit grouping contract before production. The proposal is **77 retained work units**, including one unresolved lifecycle, plus 15 completed units and one cancelled unit excluded. Five additional ledger rows point to retained units. These are curated source units, not a claim that BPA publishes 77 distinct engineering projects.

Source review: **9 minutes 48 seconds**, September 30, 2026, 09:29:26–09:39:14 UTC. HTML/PDF text and documented public ArcGIS JSON only; no maps/images, geocoding, application checks or producer. Originals remain ignored under `inputs/originals/F27-bpa-plan/`. Packaging followed the bounded review. `sample.json` contains all source hashes, the complete proposed normalization ledger and six diagnostic records; it is not a Dataset.

## Complete scope and counting proposal

| Normalization layer | Retained | Completed | Cancelled | Duplicate observations |
|---|---:|---:|---:|---:|
| §11.1 area table, pages 100–102, 68 rows | 53 | 14 | 1 | 0 |
| §11.2 path and §11.3 intertie tables, page 103, 5 rows | 2 | 0 | 0 | 3 |
| Page 103 six supplemental GERP bullets | 4 | 0 | 0 | 2 |
| Additional §2 GERP component scope, pages 13/16–17 | 13 | 1 | 0 | 0 |
| Additional §1.2.1 CAP/breaker work, pages 10–11 | 5 | 0 | 0 | 0 |
| **98 ledger rows** | **77** | **15** | **1** | **5** |

Pages are both printed and one-based PDF pages. Every table row and each added unit has an exact page/title locator in `sample.json`. §8 area, §9 path and §10 intertie narratives supply meanings to the table units; repeated mentions do not create projects. §1.2.1 has 17 CAP bullets plus four short-circuit replacements: five add work absent from the table, while the other CAP bullets attach evidence to existing units. No automatic fuzzy deduplication is proposed.

The 13 added GERP units are Olympia 230 kV, Big Eddy–Quenett Creek line, Central Oregon dynamic reactive, Lower Columbia–Bonanza, Bonanza–Nevada-Oregon Border line, the border substation, North of Pearl, Ostrander–Pearl, Hilltop reactive, North of Marion I, North of Marion II, Grand Coulee–Columbia–Schultz and Schultz–Olympia. The five additional CAP units are Driscoll UVLS, McNary Powerhouse 6/North Wasco breaker, Covington bus 1–2 breaker, Maple Valley SVC/bank 3 reactive breaker and Keeler group 2 reactive breaker.

**Grouping decisions needing acceptance:**

- Keep Schultz–Raver reconductoring and Paul capacitor together as the source table's bundle; Olympia is a separate named component. Keep the two Lower Columbia–Bonanza lines together, the three Central Oregon reactive sites together, and the named North of Pearl multi-facility scope together. Do not add their parent headings again.
- Split Reno–Alturas into the already-listed Warner work and the named Hilltop component to avoid repeating Warner. They share GERP P06539, so a bundle alone cannot identify each component. North of Marion I/II and the three named Lower Columbia-to-border children remain separate named units.
- Preserve the three numbered Southeast Idaho/Northwest Wyoming proposals on page 77 as three units, including their subordinate lines/transformers. Do not split every equipment item.
- Completed P02230 combines Toledo/Wendson and other table-listed sites; P00076 combines two completed narratives. Preserve source bundles. P05918 appears in two completed line rows; both observations remain traceable. The extra completed Keeler–Horizon line is not the separately planned Keeler breaker merely because GIS uses P04632 for it.

Existing facility/path inventories, area loads, study descriptions, portfolio parents and unnamed conditional connections are context, not extra project records. “May include” connections within Lower Columbia–Bonanza remain conditional scope. This is full **declared plan** scope, not all BPA capital work or complete state inventories. It covers BPA planning areas across Washington, Oregon, Idaho, western Montana, northern California and northwest Wyoming; geography is sourced per unit rather than inherited blindly from that footprint.

## Identity, lifecycle, dates and ownership

Use explicit native bundle numbers where their scope is unambiguous. Missing numbers use curated `source-locator` identities based on section/parent/title, not generated IDs mislabeled native. The ledger's row keys are qualification references, not final runtime IDs. Repeated bundles, title variants and future-edition continuity require explicit crosswalks. Page 103 prints `P5470`, while GERP uses `P05470`; do not silently zero-pad it. GERP Bundle_ID matches are proposed in the ledger, not automatic merges.

Proposed work maps to planned where the narrative says so; explicit completion/cancellation excludes work. P03259 Schultz–Wautoma has 2024 in the table without an established completion statement: retain unknown lifecycle, not operational by calendar. Morrow Flat is explicitly cancelled even under a proposed-work heading. GERP SCOPING/DESIGN/CONSTRUCTION/CLOSEOUT are supplementary snapshot labels, not evidence that the plan is current to retrieval day or an override across component boundaries.

“Expected energization” supports `in-service`; “estimated completion” remains a distinctly labeled milestone of unknown kind unless the source equates it with service. Year/month precision stays intact. Need years, early/mid/spring qualifiers, phases and index updates do not become exact days. A 2026–2028 phase envelope is not a construction window. Conflicting forecasts leave the primary date null and retain source-labeled supplementary milestones:

- Keeler P05449: area 2031, path 2029, GERP completion 2030.
- Bonanza: area 2030, supplemental bullet 2028, GERP completion 2031. The published Ponderosa point is an existing facility near the proposed new station.
- Pearl P04974: line 2026/breaker 2028, path 2027, GERP completion May 2026; GIS labels construction/year 2026. Retain phases and conflict.
- Buckley: plan energization 2030, GERP completion 2029; Schultz–Raver units and Ross–Rivergate also have differing summaries. South Tri-Cities has table 2027 versus narrative spring 2028. Preserve both instead of selecting the last-read source.

BPA as publisher, sponsor or operator is not blanket owner evidence. Joint BPA/PGE work has no exclusive owner; NWCPUD's line leased by BPA is not BPA-owned by inference; USBR funding at Grand Coulee is not ownership. Explicit facility ownership, such as BPA's Buckley or Grays Harbor PUD's South Elma, must be tied to the entire record's scope before filling owner. Owner stays null in all six diagnostics; no guessed global identities.

Propose edition `2025-updated-2026-08-25`: the [index](https://www.bpa.gov/energy-and-services/transmission/attachment-k) declares that update, not an original publication day. Preserve `publishedOn=null`, explicit update context and September 30 retrieval. Secondary GERP summaries say January 23, 2026 and GIS is a separately frozen snapshot. Neither establishes a live project feed.

## Native public geometry

The [official GERP page](https://www.bpa.gov/energy-and-services/transmission/grid-expansion-and-reinforcement-portfolio) links a public [ArcGIS experience](https://experience.arcgis.com/experience/06e44781378e48bab2cc352be7098c1c). Its documented [item data](https://developers.arcgis.com/rest/users-groups-and-items/item-data/) leads to webmap `7f85f964b05442dd960a15b001d0567d`, then public feature layers. Read-only [feature queries](https://developers.arcgis.com/rest/services-reference/enterprise/query-feature-service-layer/) returned **15 point features and 18 line features, 27 distinct Bundle_IDs**, without a transfer-limit flag. No image content or private system was inspected.

Native CRS is Web Mercator, WKID 102100/latest 3857; queries explicitly requested EPSG:4326. Point metadata describes yard centers or baseline intersections and an approximate-location field. Accuracy is unstated. Line metadata describes structure/span-derived transmission geometry, not proof of the proposed new route. Public-use notes describe informational display and disclaim legal/boundary precision.

Bundle_ID, project and group fields offer useful identity links, but points can represent just one part: P06546 has three stations, P06539 has two, P05470 has point plus line, and P06540/P06545 each have two lines. Bonanza is pinned at Ponderosa; Pearl's point does not locate the whole joint line upgrade; Buckley's existing yard does not establish the new AIS center. **Zero calculated centers are qualified by this pass.** Keep geometry as cited native evidence until the coordinator accepts a source-specific role/linkage contract. Do not average endpoints, convert these polylines into centers, or force polylines into the current Point/MultiPoint schema. A fully unlocated first batch remains useful.

## Acceptance and next increment

The source is accessible; the remaining decision is normalization scope and component identity, not access. Accept the 98-row/77-retained proposal and the explicit crosswalk/grouping rules, or revise those named boundaries before production. Recommended first small batch: Silver Creek, Sno-King, Keeler P05449, Bonanza and Pearl, with Morrow Flat as an exclusion. Start unlocated with unknown owner, connect it, then enumerate the full accepted scope. The six diagnostic records show that entire input-to-normalized-field reasoning. No adapter or runtime records are added here.

## Preserved sources

| Original | SHA256 |
|---|---|
| [attachment-k.html](https://www.bpa.gov/energy-and-services/transmission/attachment-k) | `f7f6c74acc34a8faec1359bd8d1d5c95111174fcdf2cfec965cb66b5c42b9635` |
| [gerp.html](https://www.bpa.gov/energy-and-services/transmission/grid-expansion-and-reinforcement-portfolio) | `a21139fe82a25e5ba5f610149251dcd091896f64ff7025353afadfbadc3993da` |
| [2025-BPA-Transmission-Plan_Final.pdf](https://www.bpa.gov/-/media/Aep/transmission/attachment-k/2025-BPA-Transmission-Plan_Final.pdf) | `246e6470dec8c7efcd8d31be29ac2a3dbb3a63a9b5669df9812d309beb4a2638` |
| [GERP-10-Project-Summaries.pdf](https://www.bpa.gov/-/media/Aep/transmission/Grid-Expansion-and-Reinforcement-Portfolio-GERP/GERP-10-Project-Summaries.pdf) | `2bb5cdd272123c3c2eeaf71f622ee38a2628906a6434cab5dfdfd7f89df2ecbe` |
| [GERP-20-Project-Summaries.pdf](https://www.bpa.gov/-/media/Aep/transmission/Grid-Expansion-and-Reinforcement-Portfolio-GERP/GERP-20-Project-Summaries.pdf) | `66433703556dd0db867e437dd837500bc7d7dc549515c0855891157896faa543` |
| [GERP-Interactive-Map-Guide.pdf](https://www.bpa.gov/-/media/Aep/transmission/Grid-Expansion-and-Reinforcement-Portfolio-GERP/GERP-Interactive-Map-Guide.pdf) | `8b8a92452285bbf89f3ca569e24142f181937737314ea9539ef00f2d4f42bed5` |
| [gerp-experience-metadata.json](https://www.arcgis.com/sharing/rest/content/items/06e44781378e48bab2cc352be7098c1c?f=pjson) | `d6e4c7379af92fc50d72437b73f4f62a418c21f4d1a4ed49aaada2026d5baced` |
| [gerp-experience-data.json](https://www.arcgis.com/sharing/rest/content/items/06e44781378e48bab2cc352be7098c1c/data?f=json) | `2db8135cae3b75604cf049e3caa4c31953d8afc71780a4418933aea82bb118ee` |
| [gerp-webmap-metadata.json](https://www.arcgis.com/sharing/rest/content/items/7f85f964b05442dd960a15b001d0567d?f=pjson) | `c13657d5dddf37dbe22211e0fd51b476c65895e1f29a68c9e500e05e80ff3e9d` |
| [gerp-webmap-data.json](https://www.arcgis.com/sharing/rest/content/items/7f85f964b05442dd960a15b001d0567d/data?f=json) | `7bd3fb67d8dba51e8185174e0453085e61261be764fe9af711555170b3f95992` |
| [gerp-lines-metadata.json](https://services3.arcgis.com/Iz3chmSt4P7oOoZy/arcgis/rest/services/Evolving_Grid_Transmission_Lines_Projects/FeatureServer/11?f=pjson) | `1adcbc3517d03492048fe463e0a4a54bd0342f4b8bd21b0f2565a33772ed2b5e` |
| [gerp-lines-features.json](https://services3.arcgis.com/Iz3chmSt4P7oOoZy/arcgis/rest/services/Evolving_Grid_Transmission_Lines_Projects/FeatureServer/11/query?where=1%3D1&outFields=%2A&returnGeometry=true&outSR=4326&f=json&resultRecordCount=2000) | `3a15c431b99e0f329444d126171c7e40dcdd04aecee8504d04027c1e7d1bde83` |
| [gerp-substations-metadata.json](https://services3.arcgis.com/Iz3chmSt4P7oOoZy/arcgis/rest/services/Evolving_Grid_Substation_Projects/FeatureServer/10?f=pjson) | `3a547c179a40ae3749cf25966de39442a1dabe24f21080d6244faa68c28920c3` |
| [gerp-substations-features.json](https://services3.arcgis.com/Iz3chmSt4P7oOoZy/arcgis/rest/services/Evolving_Grid_Substation_Projects/FeatureServer/10/query?where=1%3D1&outFields=%2A&returnGeometry=true&outSR=4326&f=json&resultRecordCount=2000) | `05afbfc66f638624d40291a185150d05cd70f6e3912566e51484488161fd83e6` |
