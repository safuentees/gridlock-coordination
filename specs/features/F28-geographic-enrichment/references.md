# F28 geographic reference sources

The reference bundle is companion geographic context. It never changes Project.location, source records, ownership, lifecycle or strict distance candidates. Areas remain rectangular bounding extents. No Census centroid/internal point, estimated route or numeric accuracy is emitted.

The first connection contains 3,294 references: all 56 Census ACS2025 states/territories, all 3,235 county equivalents, and three accepted exact-ID BPA existing-yard general pins. The compact asset is 3,737,112 bytes; revision `census-acs2025-bpa-c0b18645cfa38960`. Incorporated-place/CDP acquisition is the next producer increment; this connection is not complete full-collection enrichment or a national facility index.

## Census ACS2025

Use the fixed January 1, 2025 vintage, not the moving Current service. Official layers: [states/territories 80](https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/tigerWMS_ACS2025/MapServer/80), [counties/equivalents 82](https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/tigerWMS_ACS2025/MapServer/82), [incorporated places 28](https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/tigerWMS_ACS2025/MapServer/28), [census-designated places 30](https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/tigerWMS_ACS2025/MapServer/30).

Anonymous acquisition stores metadata, source counts and complete polygon pages, sorted by GEOID. Queries are sequential with a short delay, five states or 100 counties per page; later place pages use 250 features. A single full-state geometry request returned a service error, so the producer uses smaller requests. No source feature was dropped or replaced with a simplified geometry. These are reference-layer downloads, never per-project geocoding requests. Cached originals are reused and hash-checked; mismatched/unregistered files are not overwritten. Source page/count guards stop incomplete acquisition from being published.

The service uses Web Mercator WKID 102100/latestWKID 3857. Each geometry query explicitly requests outSR=4326; its response must declare WKID 4326. The source server performs that transformation. Bounds are coordinate minima/maxima across every returned ring vertex, without simplification, rounding or a local CRS transform. They enclose irregular shapes, water, holes and disconnected areas. Alaska/Aleutian/dateline extents can be very broad; the contract cannot encode an antimeridian-wrapped rectangle, so the ordinary full extent remains broad rather than inventing a tighter box. This is approximate area context, not surveyed geometry or a project position. Accuracy remains null.

Reference IDs use `census-acs2025:<state|county|town>:<GEOID>`. NAME and BASENAME are retained as names; state entries also carry STUSAB. State codes come from the source state layer. All Census sourceKeys/projectIds allowlists are empty because these are reusable administrative references, not project-specific claims. Town references distinguish source layers through their citations while sharing the town kind; actual source GEOIDs remain stable identifiers. A name match must still respect source state/context and ambiguity. Places may cross counties; their names are not assumed to identify one county. Commonwealth/territory entities and county equivalents retain their source names.

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

Extend the same preserved source cache with `--layers incorporated-places census-designated-places`, then rerun the offline builder. In this run originals are under the coordinator checkout's ignored `inputs/originals/F28-geography/`; BPA originals remain in `inputs/originals/F27-bpa-plan/`. `acquisition.json` records exact request URLs, byte sizes, retrieval timestamps and SHA-256 hashes. Every used page/metadata/count is cited and hash-pinned in the emitted bundle; its revision changes with source inputs. The bundle's retrievedOn is the latest acquisition date, distinct from the January 1, 2025 area vintage. Accepted BPA artifact and original response hashes are separate.

Later facility matching remains an independent coverage gap. No gated California substation endpoint, legacy mirror, private model, national geocoder, OSM bulk request or new facility survey is included. The coordinator alone runs the combined application/data case; no worker build/tests/visual checks were run.
