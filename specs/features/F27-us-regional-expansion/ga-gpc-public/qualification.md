# Georgia Power public catalog qualification

Propose a separate `ga-gpc-public` reporting group with **10 retained page observations: 6 transmission projects and 4 capital-project contexts**, no excluded or pending index entries, and no supported centers or equipment owners. This is the complete ten-entry catalog observed on 2026-09-30, a **featured subset**, not a complete utility/state inventory. No runtime data or producer is included. The historical 208-record Georgia filing remains unchanged.

Public source pass: **12:36:08–12:41:42 UTC (5 minutes 34 seconds)**. Ordinary HTTPS acquired the index, all ten detail pages and four linked notices. Only HTML/PDF text was read; no image interpretation, map rendering, geocoding, restricted material or SERTP report access. Originals are unchanged under ignored `inputs/originals/F27-ga-gpc-public/`; adjacent text extracts/acquisition metadata are derived aids, not publisher originals.

## Declared enumeration and units

The [Current Projects index](https://www.georgiapower.com/about/grid-reliability/grid-improvements/grid-projects/transmission-projects.html) supplies the ten-row boundary. Keep one observation per linked page. Named subcomponents remain supporting scope inside that observation; do not create a parent plus extra counted components. In particular, the index calls Hills Bridge a new line, but its detail enumerates a program. `capital-project-context` with omitted `recordUnit` avoids claiming one engineering asset. The other six use project units except the Decatur rebuild, which uses `upgrade`.

| # | Source locator / index title | Proposed kind | Scope and disposition |
|---|---|---|---|
| 1 | [Tomochichi - Towaliga River 230 kV](https://www.georgiapower.com/about/grid-reliability/grid-improvements/grid-projects/transmission-projects/tomochichi-towaliga.html) (`tomochichi-towaliga`) | capital-project-context | Retain. Two roughly 5-mile 230 kV lines plus Tomochichi substation. Planning text coexists with a substation construction-began milestone; do not assign one component stage to the program. |
| 2 | [Big Tazewell - Farley 500 kV](https://www.georgiapower.com/about/grid-reliability/grid-improvements/grid-projects/transmission-projects/big-tazewell-farley.html) (`big-tazewell-farley`) | transmission-project | Retain. Approximately 102-mile line to a new Big Tazewell substation. Detail adds Houston County, Alabama; index lists Georgia counties only. FAQ construction wording conflicts with future line-construction schedule. |
| 3 | [Decatur - Scottdale 115 kV](https://www.georgiapower.com/about/grid-reliability/grid-improvements/grid-projects/transmission-projects/decatur-scottdale.html) (`decatur-scottdale`) | transmission-project | Retain. Rebuild of approximately 2.5 miles and relocation of approximately 0.7 miles. Do not sum these as independent route lengths; 1965 is existing infrastructure history, not the project date. |
| 4 | [Callaway Road - Thomson Primary 500 kV](https://www.georgiapower.com/about/grid-reliability/grid-improvements/grid-projects/transmission-projects/callaway-thomson.html) (`callaway-thomson`) | capital-project-context | Retain. Callaway Road 500/230 kV substation plus two 500 kV lines, approximately 10 and 7 miles. Preserve the area-program unit; timeline uses seasons and publishes no completion milestone. |
| 5 | [Effingham County 500 kV](https://www.georgiapower.com/about/grid-reliability/grid-improvements/grid-projects/transmission-projects/effingham-county.html) (`effingham-county`) | capital-project-context | Retain. Expected 500/230 kV substation, 500 kV infrastructure and associated facilities. Components/routes remain under planning; no project map or completion milestone published. |
| 6 | [Hills Bridge – Speedway 500/230 kV](https://www.georgiapower.com/about/grid-reliability/grid-improvements/grid-projects/transmission-projects/hills-bridge-speedway.html) (`hills-bridge-speedway`) | capital-project-context | Retain. Detail scope is two substations and three lines, not one line: a 500 kV loop and two 230 kV links. Planning prose, Q2 2026 construction schedule and July clearing notice are retained separately. |
| 7 | [Grassy Hollow – Great Valley 230 kV](https://www.georgiapower.com/about/grid-reliability/grid-improvements/grid-projects/transmission-projects/grassy-hollow-great-valley.html) (`grassy-hollow-great-valley`) | transmission-project | Retain. Approximately 10.4-mile 230 kV line plus new Grassy Hollow substation. Undated construction notice describes a range of possible work; elapsed tentative schedule does not establish current stage. |
| 8 | [Hatch – Wadley Primary 500 kV](https://www.georgiapower.com/about/grid-reliability/grid-improvements/grid-projects/transmission-projects/hatch-wadley.html) (`hatch-wadley`) | transmission-project | Retain. Approximately 75-mile 500 kV line. Undated project-information notice says route surveys are underway; preserve that source observation without treating the entire line as under construction. |
| 9 | [Conyers – Klondike 230 kV](https://www.georgiapower.com/about/grid-reliability/grid-improvements/grid-projects/transmission-projects/conyers-klondike.html) (`conyers-klondike`) | transmission-project | Retain. New approximately 8.5-mile 230 kV line uses portions of an existing corridor plus new corridor. Existing and proposed lines share names; no historical-record merge is supported. |
| 10 | [Ashley Park – Wansley 500 kV](https://www.georgiapower.com/about/grid-reliability/grid-improvements/grid-projects/transmission-projects/ashley-park.html) (`ashley-park`) | transmission-project | Retain. New approximately 35-mile 500 kV line; detail adds Fulton and Coweta counties. Dated 2025 letter distinguishes line surveying from substation construction; do not transfer the substation stage to the line. |

All county/index-type strings are preserved in `sample.json`. Index/detail differences include Big Tazewell’s Alabama endpoint omitted by the index, Ashley’s two intermediate counties omitted there, and Hills Bridge’s program/voltage distinctions. The latter title uses 500/230 kV while introductory prose shortens it to 500 kV; its component list explains both voltage classes. Preserve both, not a silent correction.

## Six diagnostic observations

`sample.json` contains Tomochichi, Big Tazewell, Decatur, Callaway, Hills Bridge and Ashley. Each carries exact page identity, cited sections, proposed C2/C3 fields and representative raw milestones. It is a qualification payload, **not a Dataset-schema fixture**. Other four pages are fully enumerated above and preserved locally.

- Tomochichi shows why a component start must not make a whole program “under construction.” Its timeline says the substation began construction, while other components remain prospective.
- Big Tazewell carries explicit Alabama–Georgia geography, a new substation, and differing generic construction prose versus future scheduled construction.
- Decatur separates an asset’s historical construction year, a rebuild and a partial relocation; no arithmetic route-total or relay-record merge.
- Callaway has seasonal construction forecasts and no published completion date.
- Hills Bridge preserves its July 6, 2026 clearing notice beside the page schedule. The notice describes site preparation before future construction; do not resolve the discrepancy through today’s date.
- Ashley preserves October 3, 2025 surveying status separately from substation construction and the current tentative line schedule.

## Mapping and accepted-meaning proposal

| Field | Proposal / limit |
|---|---|
| Identity | `sourceKey=ga-gpc-public`; `sourceId` equals the observed page basename without `.html`; `identityBasis=source-locator`. A proposed application prefix may namespace it, but neither is a publisher-native engineering ID. Freeze locators independent of edition and review future URL/title changes. |
| Edition | `observed-2026-09-30`; catalog/page `publishedOn` and per-record `sourceUpdatedOn` null. Retrieval and lifecycle observation use 2026-09-30 with `snapshot-observed`. HTTP Last-Modified exists but is transport/cache metadata, not confirmed publication or project progress. |
| Scope | Full within the observed ten-entry catalog; featured subset with unknown regional/utility denominator. Four linked notices and the index are supporting documents, not additional record rows. |
| Lifecycle | Conservative proposal: `planned` only for Callaway/Effingham explicit planning and Hatch’s explicit survey/planning description. The other seven are `unknown`, preserving raw stage text and tentative milestones. Do not infer progress from an elapsed schedule or convert “constructing” marketing into a confirmed stage when its schedule disagrees. |
| Dates | Current schema has no quarter/season precision. Keep exact raw labels in milestones with null value, unknown precision/kind; keep `constructionStart=null`. Completion is not evidenced in-service or need. Do not manufacture quarter-start/end dates or silently coarsen to a year. Callaway/Effingham publish no completion. |
| Historical notices | Hills letter is dated 2026-07-06; Ashley letter is dated 2025-10-03. These are supporting-document publication dates, not catalog publication or revised project milestone dates. Grassy and Hatch notices are undated. |
| Geography | Text-only county/region and explicitly stated state text. Big Tazewell explicitly spans Alabama and Georgia; do not manufacture per-record state fields from the publisher or index footprint. Preserve source county spellings. |
| Owner | Null for all ten. Georgia Power is reporter/developer; none of the reviewed text establishes specific equipment ownership, shared title or present/planned owner scope. A customer’s land, an easement holder, an existing plant’s name and a utility mailing identity are insufficient. |
| Location | All `location`/`nativeGeometry` null, `centerRole=unknown`. HTML/link text exposed no qualifying native coordinates/service with exact record identity, role, CRS and accuracy. Pages warn their route depictions use pre-engineering data; Effingham has no map. No map/image was examined. |
| Quantities | Retain only explicitly scoped approximate miles in descriptive evidence; do not sum overlapping relocation lengths or treat the index’s global investment/mileage/BESS numbers as record quantities or savings. |
| Contacts | Exclude email, phone and personal/contact fields from normalized observations. |

## Historical relationships: review leads only

Local inspection compared the ten page identities/content against the preserved Georgia filing plus the 24 Santee and 98 CTPC observations. No publisher-native IDs or explicit cross-reference to these records was found. No Santee/CTPC relationship was evidenced. Name similarity is only a review lead:

| Public locator | Historical observation | Limit |
|---|---|---|
| `ashley-park` | `gpc-21062` / ASHLEY PARK-WANSLEY 500KV | Similar name; no authoritative continuity/crosswalk. |
| `conyers-klondike` | `gpc-21142` / CONYERS - KLONDIKE 230 KV SECOND LINE | Proposed and existing lines share endpoint names. |
| `big-tazewell-farley` | `gpc-21063` / FARLEY (APC)-TAZEWELL 500KV | APC text in the historical title does not prove current asset ownership. |
| `hatch-wadley` | `gpc-20756` / HATCH - WADLEY 500 KV LINE STRATEGIC PROJECT | Similar endpoints/voltage only. |
| `tomochichi-towaliga` | `gpc-20717` / CC - TOMOCHICHI 500/230KV SOLUTION | Different stated scope/voltage; potential relationship only. |
| `grassy-hollow-great-valley` | `gpc-20150` / CC - HILL VIEW & GRASSY HOLLOW SUB | Substation/program reference does not establish line identity. |

Scottdale/Klondike relay-modernization records and Sandersville–Wadley 115 kV work have differing work scopes; do not merge because a shared facility name appears. New page observations must not replace old filing records, inherit their dates/owners/locations, or support a deduplicated distinct-project total.

## Preserved originals

Hashes below are SHA-256 of the exact downloaded bytes. The linked document is the evidence; local derived text is only an extraction aid.

| Original | Bytes | SHA-256 |
|---|---:|---|
| [index.html](https://www.georgiapower.com/about/grid-reliability/grid-improvements/grid-projects/transmission-projects.html) | 322,065 | `8188831eae7426228620ba3a8219e88306b47eba95505c32ac7d131efb736192` |
| [tomochichi-towaliga.html](https://www.georgiapower.com/about/grid-reliability/grid-improvements/grid-projects/transmission-projects/tomochichi-towaliga.html) | 304,900 | `d6c5a359eae9183fa3dcf72cea957c2c048af67f48d910441144c8897fa70be1` |
| [big-tazewell-farley.html](https://www.georgiapower.com/about/grid-reliability/grid-improvements/grid-projects/transmission-projects/big-tazewell-farley.html) | 265,496 | `4d28a92e98a1ac53af0e08d76ed57e975262523de04c6f1164408ccfbdad095c` |
| [decatur-scottdale.html](https://www.georgiapower.com/about/grid-reliability/grid-improvements/grid-projects/transmission-projects/decatur-scottdale.html) | 275,820 | `e9ffcbb71c12a2d8bec0818e23336b80a362ce5aa17c8845bc9b1396103e2905` |
| [callaway-thomson.html](https://www.georgiapower.com/about/grid-reliability/grid-improvements/grid-projects/transmission-projects/callaway-thomson.html) | 276,989 | `fb729fea410327a7a83757b9e0ef22a71535e9fb7bd32ef41316de81397adca5` |
| [effingham-county.html](https://www.georgiapower.com/about/grid-reliability/grid-improvements/grid-projects/transmission-projects/effingham-county.html) | 261,279 | `3b6fcdce932f6d3f777e0372746c572ec06f671ce71d8f8a6ef7784dd8cf83e2` |
| [hills-bridge-speedway.html](https://www.georgiapower.com/about/grid-reliability/grid-improvements/grid-projects/transmission-projects/hills-bridge-speedway.html) | 363,172 | `e37a969992b149014159c24f3073ea3093159916382092ca7a56be8a2a24dfae` |
| [grassy-hollow-great-valley.html](https://www.georgiapower.com/about/grid-reliability/grid-improvements/grid-projects/transmission-projects/grassy-hollow-great-valley.html) | 263,979 | `e4d07f49e856fce68947beaafeaeb0f9360674c518264c6273be87316aab45ac` |
| [hatch-wadley.html](https://www.georgiapower.com/about/grid-reliability/grid-improvements/grid-projects/transmission-projects/hatch-wadley.html) | 266,212 | `8a588810d833260556a251dab3c32d66a3b168d290be90ef5821fc80ee18da12` |
| [conyers-klondike.html](https://www.georgiapower.com/about/grid-reliability/grid-improvements/grid-projects/transmission-projects/conyers-klondike.html) | 282,339 | `afe408c84bd83d10b11dfd280355b3e6f4331600bed014a8a489bcc894464ac8` |
| [ashley-park.html](https://www.georgiapower.com/about/grid-reliability/grid-improvements/grid-projects/transmission-projects/ashley-park.html) | 293,169 | `f6cdc770c3f4278670d85edc73b63ce4385ff7b4306765226423d3896ca16dd8` |
| [hills-bridge-letter-to-residents.pdf](https://www.georgiapower.com/content/dam/georgia-power/pdfs/about/hills-bridge-letter-to-residents.pdf) | 134,807 | `abd348fefb0daa4959b1c702b29614431f24407a3091df9e3ed2cf959b1668eb` |
| [grassy-hollow-great-valley-pre-construction-postcards.pdf](https://www.georgiapower.com/content/dam/georgia-power/pdfs/about/grassy-hollow-great-valley-pre-construction-postcards.pdf) | 2,372,473 | `b8e9e184d8bb3e97832298028bf87bac9fbcc95d061553f0fe59b20006a70b3b` |
| [external-project-overview-hatch-wadley-500k-kv.pdf](https://www.georgiapower.com/content/dam/georgia-power/pdfs/about/external-project-overview-hatch-wadley-500k-kv.pdf) | 254,907 | `0d169b00768874aff392b1300d7554f50960ef365c0a0b084b987615fda9f552` |
| [ashley-park-wansley-500-kv-project-letter-to-residents-100325.pdf](https://www.georgiapower.com/content/dam/georgia-power/pdfs/about/ashley-park-wansley-500-kv-project-letter-to-residents-100325.pdf) | 140,644 | `79d950995bc9db226aa810979ae0c4ff25a1e7248d7470de0bfeb58336b9d678` |

## Acceptance required before production

Accept the ten-page boundary, 4-context/6-project unit policy, edition-independent locator identities, conservative lifecycle mapping, raw quarter/season date preservation and unknown owners/centers. Then a separately assigned producer can connect a small six-record batch before the remaining four. No missing artifact blocks this bounded text inventory; qualified asset ownership, native geometry, confirmed current stages and a historical crosswalk remain unavailable in the reviewed public evidence.

No worker application checks were run. Coordinator owns acceptance and any later runtime checks.
