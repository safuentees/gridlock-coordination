# F28-B2 — Full-US OSM substation reference qualification

**Decision: qualified source; runtime production deferred to coordinator contracts.** Public acquisition is repeatable and reuse is permitted under ODbL. A useful implementation needs community-evidence labelling, facility-area geometry, authoritative state context and licensed bundle/export handling. A node-only shortlist would miss nearly all mapped elements. No PBF inventory or runtime point was acquired/emitted.

Source discovery ran **19:13:21–19:21:37 UTC, October 3, 2026: 8.3 active minutes**, within the 20-minute ceiling; packaging followed without further research. [Machine-readable qualification](osm-qualification.json) contains exact URLs, source hashes, meanings and proposed task boundaries. The ignored originals directory is `inputs/originals/F28-geography/osm-qualification/`: **29 metadata/document snapshots, 4,920,815 bytes**, plus acquisition manifests. No application checks, images or dependency installations.

## Finite acquisition scope

Propose every node, way and relation with **`power=substation`**, across these four public dated PBF extracts. All four pages advertise OSM data through `2026-10-02T20:21:34Z`; actual PBF headers and SHA-256 must be recorded after producer authorization. This is a defined tag inventory, not every physical/planned substation. Lifecycle-prefix-only features, legacy `power=station`, untagged facilities and individual transformers remain outside the declared baseline. `disused=yes` on a retained tag must preserve that distinction.

| Public extract, dated October 2 | Published bytes | Intended coverage |
| --- | ---: | --- |
| [US](https://download.geofabrik.de/north-america/us.html) | 12,181,127,106 | 50 states and DC |
| [Puerto Rico](https://download.geofabrik.de/north-america/us/puerto-rico.html) | 73,992,835 | PR |
| [US Virgin Islands](https://download.geofabrik.de/north-america/us/us-virgin-islands.html) | 3,121,722 | VI |
| [American Oceania](https://download.geofabrik.de/australia-oceania/american-oceania.html) | 5,375,683 | AS, GU, MP, subject to authoritative territorial filtering |
| Total proposed downloads | **12,263,617,346** | Existing 56 state/territory application scope |

The published MD5 files are preserved; local SHA-256 remains **unknown because the PBFs were not downloaded**. Dated daily files can expire, so a future producer must either obtain that common edition or record a new synchronized snapshot. Use complete public PBFs, then filter locally; no Nominatim, national Overpass queries, tile scraping or authenticated contributor metadata. Free shapefiles are selective and cannot establish full tag enumeration. Geofabrik removes contributor user/uid/changeset fields from public extracts. [Distribution details](https://download.geofabrik.de/technical.html)

The [Geofabrik index](https://download.geofabrik.de/index-v1.json) treats PR/VI as separate North America extracts despite their placement in the US page table. American Oceania's index incorrectly advertises ISO `VU` relative to its name/clipping regions; do not use that field for assignment. Extract polygons are buffered clipping regions, not administrative borders, and may include neighboring territory. The proposed union therefore needs containment/intersection against the already preserved **full Census ACS2025 EPSG:4326 polygons**, including islands and holes. Current rectangular reference bounds cannot establish state membership. Unsupported minor outlying islands remain outside the existing 56-area runtime scope.

## Expected value and geometry limits

The preserved [US Taginfo aggregate](https://taginfo.geofabrik.de/north-america:us/api/4/tag/stats?key=power&value=substation), through `2026-10-02T20:21:23Z`, reports **73,305 elements: 671 nodes, 72,126 ways, 508 relations**. Nodes are at most **0.915%** before identity filtering. American Oceania reports 25 ways/no nodes; USVI four ways/no nodes; PR six nodes and 543 ways. These independently timed metadata counts are **not** a deduplicated or boundary-filtered full inventory.

The [US tag combinations](https://taginfo.geofabrik.de/north-america:us/api/4/tag/combinations?key=power&value=substation&filter=all&rp=30&page=1&sortname=together_count&sortorder=desc) show 29,746 `name`, 3,415 `addr:state`, 56,758 `voltage`, 31,505 `operator`, and 7,269 `substation=transmission` entries. These are community tag presence/classifications, not verified matches, owners or engineering status. Match yield is unknown.

[OSM tagging guidance](https://wiki.openstreetmap.org/wiki/Tag:power%3Dsubstation) normally represents substations as areas; some span multiple sites. The tag covers distribution and industrial facilities as well as transmission. Optional `name`, `ref`, operator and voltage information can help disambiguate, but there is no guaranteed planning-ID crosswalk. Preserve lifecycle tags; source observation/edit dates never become project commissioning dates.

[Element documentation](https://wiki.openstreetmap.org/wiki/Elements) defines node coordinates in WGS84, and separate native ID spaces for nodes/ways/relations. Store decimal ID strings with element type, version, timestamp and snapshot hash. A node may supply an **unverified community facility position**, never a construction/equipment center or known numeric accuracy. Ways/multipolygons need their actual supported footprint or an explicitly labelled bounding extent derived from it. No midpoint/centroid substitute. Missing members, invalid area geometry, cross-boundary features and duplicate physical-facility representations retain explicit uncertainty. A future contract must prevent OSM from overriding preferred native evidence, reviewed decisions or strict-distance gates.

## Licence and export contract required

[OSM's copyright page](https://www.openstreetmap.org/copyright/en) permits reuse under ODbL with attribution. Treat the systematic national reference extraction as an OSM-derived database; do not assume the exception for isolated geocoding results applies. The [geocoding guideline](https://osmfoundation.org/wiki/Licence/Community_Guidelines/Geocoding_-_Guideline) distinguishes individual results from systematic feature aggregation.

Proposed implementation: publish an identifiable, machine-readable OSM-derived companion under ODbL, including source edition, derivation and notices. [ODbL sections 4.2–4.6](https://opendatacommons.org/licenses/odbl/1-0/) govern notices, share-alike and a database/alterations offer upon public use. App/code licensing does not relicense those data. Independently sourced project fields should retain their provenance, but separate filenames alone do not prove independence of joined databases; the [Collective Database guideline](https://osmfoundation.org/wiki/Licence/Community_Guidelines/Collective_Database_Guideline_Guideline) makes the data relationship material.

[Attribution guidance](https://osmfoundation.org/wiki/Licence/Attribution_Guidelines) requires visible credit for relevant public output and notices within database metadata/documentation. Use “© OpenStreetMap contributors” linked to the copyright page, a direct ODbL link in data exports, and identify Geofabrik as extract supplier. Coordinator/core/UI must specify mixed JSON/CSV/report exports and the downloadable derivative offer **before** connecting runtime data. Do not publish private source/project material to satisfy a public reference-data offer, or silently label OSM-derived data as exclusively native evidence.

## Ready implementation plan after acceptance

1. **Coordinator/core:** accept unverified OSM provenance, node/footprint/extent representations, null accuracy, exact context/ambiguity rules, revision guards and licence/export boundaries.
2. **Source producer:** obtain four complete pinned public PBFs and preserve originals. Use an approved isolated Osmium Tool/pyosmium runtime. None of `osmium`, `osmconvert`, `osmfilter` was on PATH; nothing was installed. Required disk is the 12.26 GB input plus intermediates; peak RAM, output size and elapsed extraction time remain unmeasured.
3. **Source producer:** filter `nwr/power=substation` locally while retaining geometry members, then build supported geometry and Census context. [Osmium](https://osmcode.org/osmium-tool/manual.html#filtering-by-tags) supports tag filtering with referenced members; member nodes are helpers, not additional facilities. Streaming/filtering avoids a custom full-country node map in memory.
4. **Core/UI:** connect an early coherent batch while the full inventory proceeds, show unverified role/attribution and uncertainty, and preserve preferred source evidence. No node-only completion claim.
5. **Coordinator:** run the sole bounded combined case after composition.

Completion requires a full raw-occurrence ledger, cross-extract native-ID/version reconciliation, primary-versus-helper counts, emitted point/area counts and explicit exclusions/unresolved reasons. Every candidate must be accounted for, including absent names, invalid/incomplete geometry, conflicting versions, unsupported territory and ambiguous identity. Zero unexplained rows—not a sum of Taginfo statistics—closes the producer scope. No public access blocker remains; producer authorization, geometry/licence contracts and tooling are the concrete dependencies.
