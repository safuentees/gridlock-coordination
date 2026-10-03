# F28 geographic reference sources

The reference bundle is companion geographic context. It never changes Project.location, source records, ownership, lifecycle or strict distance candidates. Areas remain rectangular bounding extents. No Census centroid/internal point, estimated route or numeric accuracy is emitted.

The complete declared Census reference scope contains **35,936 references**: 56 states/territories, 3,235 county equivalents, 19,729 incorporated places, 12,913 census-designated places, and the same three accepted exact-ID BPA existing-yard general pins. The compact asset is **40,865,532 bytes**; revision `census-acs2025-bpa-0221b350b2cdfaf4`. All four source layers are fully enumerated, with no pending Census pages. This completes the declared area-reference acquisition, not full-collection enrichment or a national facility index. The first state/county/BPA connection remains preserved in commit `969fd6d55e247a4b4807b356600aee5204e7a8ee`.

## Census ACS2025

Use the fixed January 1, 2025 vintage, not the moving Current service. Official layers: [states/territories 80](https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/tigerWMS_ACS2025/MapServer/80), [counties/equivalents 82](https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/tigerWMS_ACS2025/MapServer/82), [incorporated places 28](https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/tigerWMS_ACS2025/MapServer/28), [census-designated places 30](https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/tigerWMS_ACS2025/MapServer/30).

Anonymous acquisition stores metadata, source counts and complete polygon pages, sorted by GEOID. Queries are sequential with a short delay, five states or 100 counties per page; later place pages use 250 features. A single full-state geometry request returned a service error, so the producer uses smaller requests. No source feature was dropped or replaced with a simplified geometry. These are reference-layer downloads, never per-project geocoding requests. Cached originals are reused and hash-checked; mismatched/unregistered files are not overwritten. Transient transport failures have at most three attempts with short backoff; rate-limit and access-denial responses stop acquisition and are not retried or bypassed. Source page/count guards stop incomplete acquisition from being published.

The service uses Web Mercator WKID 102100/latestWKID 3857. Each geometry query explicitly requests outSR=4326; its response must declare WKID 4326. The source server performs that transformation. Bounds are coordinate minima/maxima across every returned ring vertex, without simplification, rounding or a local CRS transform. They enclose irregular shapes, water, holes and disconnected areas. Alaska/Aleutian/dateline extents can be very broad; the contract cannot encode an antimeridian-wrapped rectangle, so the ordinary full extent remains broad rather than inventing a tighter box. This is approximate area context, not surveyed geometry or a project position. Accuracy remains null.

Reference IDs use `census-acs2025:<state|county|town>:<GEOID>`. NAME and BASENAME are retained as names; state entries also carry STUSAB. State codes come from the source state layer. All Census sourceKeys/projectIds allowlists are empty because these are reusable administrative references, not project-specific claims. Town references distinguish source layers through their citations while sharing the town kind; actual source GEOIDs remain stable identifiers. A name match must still respect source state/context and ambiguity. Places may cross counties; their names are not assumed to identify one county. Commonwealth/territory entities and county equivalents retain their source names. Complete coverage of these four declared layers does not mean every locally named town or settlement: county subdivisions, GNIS-only localities and historical boundary editions are outside this bundle. A source naming an older county or an unmatched locality therefore remains unresolved rather than being forced into a current name.

[Census 2025 Chapter 1](https://www2.census.gov/geo/pdfs/maps-data/data/tiger/tgrshp2025/TGRSHP2025_TechDoc_Ch1.pdf) permits reproduction with requested Census attribution, disclaims positional/attribute warranties and says statistical boundaries are not legal land descriptions. Its acquired file/hash is retained in provenance. The service's accessible metadata and the preserved responses are the exact source evidence; no account, form, payment or access workaround is used.

## Accepted BPA pins

Only these accepted Project IDs are emitted:

- `bpa-plan:P05449` — Keeler.
- `bpa-plan:sec-2-cross-cascades-north-olympia` — Olympia compensation child; alias P06219 remains a source identity detail.
- `bpa-plan:P04364` — Schultz series capacitors.

Read the accepted `app/src/data/evidence/f27-map-location-proposals.json`, not the earlier report's unaccepted substation-center proposal. Points preserve the original September 30, 2026 server-returned coordinates and citations. Companion method is matched-facility, precision facility. Limitations explicitly retain general-pin meaning, existing-yard center-or-baseline ambiguity, unknown accuracy and absence of a construction/equipment center. SourceKeys restrict them to bpa-plan and projectIds restrict them to the exact record. The additive `projectFingerprints` guard hashes the complete accepted expected Project with notes replaced by an empty array, recursively sorted object keys, original array order and JavaScript JSON number encoding. Core owns guard comparison and stale-scope handling.

No Buckley, Bonanza or Pearl withheld coordinates enter this bundle. BPA's original complete source response stays ignored; its hash is provenance, not permission to use every point. Neither availability of a pin nor its facility label supplies owner evidence or strict matching eligibility.

## Reproduce offline and extend

Run with Python 3 standard library and Node.js; no dependencies or application checks are required:

```sh
python3 scripts/enrichment/acquire_references.py --originals /absolute/path/to/inputs/originals/F28-geography --layers states counties
python3 scripts/enrichment/build_references.py --originals /absolute/path/to/inputs/originals/F28-geography --bpa-originals /absolute/path/to/inputs/originals/F27-bpa-plan
```

The complete place extension uses `--layers incorporated-places census-designated-places`. The October 3 continuation reused the six already cached incorporated-place pages and acquired every remaining page without a new source-access blocker. The resulting ignored cache has 185 files totaling 955,292,226 bytes, plus its acquisition manifest.

For an incremental extension, pass `--base-references /absolute/path/to/versioned/references.json`. The producer reuses only complete state/county entries when the base has the expected counts and all corresponding source hashes agree with the preserved acquisition manifest; other layers are derived from original polygons. Mismatches stop generation. This run reused the first-connection asset above after a full rebuild stalled reading an older local polygon file. The read was interrupted before output replacement; originals remain unchanged. This is a local input-read issue, not an official-source access restriction. Omitting the option retains the full offline rebuild path. In this run originals are under the coordinator checkout's ignored `inputs/originals/F28-geography/`; BPA originals remain in `inputs/originals/F27-bpa-plan/`. `acquisition.json` records exact request URLs, byte sizes, retrieval timestamps and SHA-256 hashes. Every used page/metadata/count is cited and hash-pinned in the emitted bundle; its revision covers both source hashes and emitted reference semantics, so producer corrections also invalidate cached enrichment. The bundle's retrievedOn is the latest acquisition date, distinct from the January 1, 2025 area vintage. Accepted BPA artifact and original response hashes are separate.

Later facility matching remains an independent coverage gap. No gated California substation endpoint, legacy mirror, private model, national geocoder, OSM bulk request or new facility survey is included. The coordinator alone runs the combined application/data case; no worker build/tests/visual checks were run.

## Facility/source-GIS continuation — October 3

The coordinator's first case (`changes/F28-first-connection.md`, commit `d2a1434`) records 68 located, 12,114 approximate, 680 ambiguous and 2,061 unsupported observations, with none unprocessed. Only aggregate outcomes were saved; this pass does not invent per-source unresolved counts or rerun the application pipeline. The [machine-readable source inventory](../../../scripts/enrichment/source-inventory.json) records exact candidate URLs, decisions, enabling inputs and preserved metadata hashes. Its five priority source inventories contain 13,270 observations; nonempty source fields are clues, not qualified matches. Coarse approximate areas also remain candidates for better evidence.

| Official reference candidate | Applicability and current decision |
| --- | --- |
| [EIA national reference](https://www.eia.gov/tools/faqs/faq.php?id=567&t=1) | No offered national substation-location dataset. Existing HIFLD mirrors and power-plant points are not substitutes. |
| [CEC substations](https://services3.arcgis.com/bWPjFyq029ChCGur/arcgis/rest/services/Substation/FeatureServer/0) | High California value, but the prior direct service response required a token. No private portal or legacy mirror used. |
| [Minnesota official utilities index](https://mn.gov/mngeo/gis-data-and-maps/info-by-topic/utilities-telecommunications/utilities.jsp) | MISO/SPP potential; current statewide named-facility download not established. Historical mentions alone do not qualify it. |
| [Arkansas official layer 18](https://gis.arkansas.gov/arcgis/rest/services/FEATURESERVICES/Utilities/MapServer/18) | Public statewide geometry, but only type/county/global ID fields: no facility-name/native-project crosswalk. No geometry fetched. |
| [ATC owner project map](https://www.atcllc.com/projects/) | Public GIS count is ten project pins; no MISO native ID or definition of a facility/construction center. Source geometry is EPSG:3071, but no geometry fetched. Project landing-page download returned HTTP 403; public index text remains readable. |
| [National Grid NY substations](https://systemdataportal.nationalgrid.com/arcgis/rest/services/NYSDP/Substations/MapServer/0) | Direct metadata request returned HTTP 403; portal-specific reuse remains unresolved. No feature download or denied-request workaround. |
| [Eversource NH/MA/CT substations](https://dghostingexternalmapprod.eversource.com/dghosting/rest/services/Substations/Substation_Locations/MapServer) | A regional owner-published lead, not yet qualified for reuse, transmission identity or general full-collection coverage. |
| [USGS GNIS populated places](https://www.usgs.gov/us-board-on-geographic-names/download-gnis-data) | Reusable national locality fallback; explicit state/county and NAD83 primary locality points. It cannot supply facility identity. The current pipeline accepts town areas only, so a later contract must establish locality-point meaning and Census-area precedence before insertion. |

No new runtime references are emitted by this qualification increment. That preserves the complete Census bundle and all existing guard semantics rather than treating availability of a point as proof of project identity. Arkansas/ATC metadata and the ATC count response are preserved under ignored `inputs/originals/F28-geography/facility-inventory-2026-10-03/`, totaling 19,386 bytes plus a manifest; each hash is in `scripts/enrichment/source-inventory.json`. No facility feature coordinates, people, original binaries or denied content enter Git. Public metadata is evidence for a qualification decision, not a reuse license for an unqualified dataset.

Next practical reusable source is GNIS locality context, conditional on the shared representation/matching handoff. It requires unknown-coordinate rejection, historical/duplicate treatment and explicit CRS handling; its point must not silently displace a more informative Census area. Broader facility coverage remains open until a source supplies permitted access plus sufficient native identity and point meaning. No worker application checks or visuals were run.

## New PJM utility pass — October 3, 17:48–17:55 UTC

A 6.8-minute pass inspected new utility leads, within its 20-minute ceiling. It adds no runtime points and does not repeat the earlier eight-source survey. The existing inventory JSON now records these four decisions and 15 preserved public metadata/explanation snapshots (5,496,597 bytes) under ignored `inputs/originals/F28-geography/pjm-utility-pass-2026-10-03/`, with exact URLs and SHA-256 hashes.

| Source | Missing input for reusable facility linkage |
| --- | --- |
| [AEP Ohio public hosting dashboard](https://www.aepohio.com/company/about/hosting-capacity) | Its directly linked layer carries SUBSTATION/CIRCUITID/STATE_ABBR but represents grid **polygons**, not station sites. It needs an authorized station point/footprint layer with role and CRS. A grid address, polygon center or upstream station label cannot supply that geometry. Layer CRS was not established; no geometry fetched. |
| [Potomac Edison public map](https://www.firstenergycorp.com/feconnect.html) | The point layer has only FID and two capacity fields; no station name/native identity. Metadata is WKID 102100/latestWKID 3857. It needs a facility crosswalk and point-role evidence; the separate territory polygon is not a facility footprint. |
| [PPL FAQ](https://www.pplelectric.com/site/More/About-Us/Electric-Rates-and-Rules/Customer-Owned-Generation/frequently-asked-questions) | PPL states it does not publish hosting maps; station details require a site-specific pre-application request. A public inventory or separately authorized material is needed; no form/contact request was made. |
| [Dominion linked disclaimer](https://cdn-dominionenergy-prd-001.azureedge.net/-/media/content/about/energy-grid-transformation/hosting-capacity-tool/pdfs/hosting-capacity-disclaimer.pdf?hash=9BF635AE2ADBDD6D410B118B86C7F66F&rev=7f1f87b4f7b548a78943d1fd511887dc) | Despite an advertised REST option, the linked terms restrict access/use and prohibit redistribution. No map/API acquisition followed. An authoritative public replacement or explicit permission is required. |

These were high-volume leads: current PJM source-scoped owner labels include 1,922 AEP, 774 Dominion and 357 PPL observations. Those counts are source context, not geographic matches, Ohio-only counts or unresolved-category totals. Empty/null portal license fields do not establish permission. No inferred construction centers, territory-derived facility positions or new coordinates were emitted. The connected 35,936-reference bundle remains unchanged; broader facility coverage is unresolved.
