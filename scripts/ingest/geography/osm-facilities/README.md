# Full-scope OSM facility producer

This isolated offline pipeline implements the [C2 contract](../../../../specs/features/F28-geographic-enrichment/facility-contract.md). It does not modify project records, the current geographic reference bundle, matching, providers or maps. Code delivery precedes acquisition: no PBF was downloaded or producer/check executed for B3.

## Inputs and resource gate

`plan.json` freezes four dated Geofabrik URLs, publisher MD5/bytes and the common expected PBF replication timestamp, **2026-10-02T20:21:34Z**. Total originals: **12,263,617,346 bytes**. Dated files can expire; HTTP failures stop. Never silently substitute `latest`, another edition or a partial regional scope. MD5 checks the publisher transfer; locally calculated SHA-256 pins the retained original. Every stage reuses those originals. It does not query Nominatim, Overpass, tiles or private services.

The installed producer-only Python 3.12.14 venv is ignored at `inputs/tools/F28-osm-facilities/venv` in the coordinator checkout. Its measured allocation is **62,648 KiB** (about 61 MiB). The exact binary-wheel versions, public URLs and SHA-256 values are in `requirements.lock` and `runtime-provenance.json`; these wheels are for macOS arm64/Python 3.12. Reproduction uses `python3.12 -m venv <ignored-runtime>` followed by its `python -m pip install --only-binary=:all: --require-hashes -r requirements.lock`. Do not install into the app or globally. Other platforms require a reviewed compatible wheel lock.

The retained 12 full Census state/territory pages are already present under `inputs/originals/F28-geography/`; `plan.json` pins every page. Data-page bytes are specified there; metadata plus pages were previously measured at 39,609,230 bytes. Full Census polygons are used, not the existing bounds-only reference bundle.

Proposed guard: originals plus **3 GiB total scratch cap**, **5 GiB untouched free-space reserve**, and **3 GiB combined producer/validator resident-memory cap**. The additional bytes needed before acquisition are 20,853,551,938 (originals + scratch + reserve), excluding already installed runtime and Census inputs. Current free space is volatile: the October 4 preparation observed 21,680,000 KiB, versus the coordinator's earlier 18,840,000 KiB. Neither observation approves transfer. The scratch cap is deliberately bounded and **not an empirical claim that it is sufficient**. Filtered PBF, SQLite, full boundary artifact, candidate/final assets, temporary writer files and validation all count toward it. Native-helper/index/output peak and actual runtime remain unmeasured until an approved run.

`plan` prints a no-acquisition resource summary and confirmation template. The coordinator must save a confirmation for the exact plan SHA-256 and original/work directory paths. `acquire`, `enumerate` and `build` refuse it otherwise. The same-volume original/work layout is intended; a different disk needs explicit coordinator authorization. No unrelated files are deleted. The resource supervisor monitors the full process tree and scratch/free bytes each second, including native writer finalization and the Node generation gate. Limits terminate processing and leave the stage pending. Chunked intake also reserves space for all remaining original bytes. A cap hit requires a revised resource decision, not automatic growth or cleanup.

## Authorized run sequence

Paths below are explicit parameters; no command starts automatically. Use the isolated venv's Python and an existing approved Node/tsx installation, not new application dependencies.

```sh
FACILITY_SCRIPT=scripts/ingest/geography/osm-facilities/producer.py
FACILITY_ORIGINALS=/absolute/coordinator/inputs/originals/F28-geography/osm-facilities
FACILITY_WORK=/absolute/coordinator/inputs/extracted/F28-osm-facilities/2026-10-02
FACILITY_APPROVAL=/absolute/coordinator/inputs/extracted/F28-osm-facilities/resource-confirmation.json
FACILITY_PYTHON=/absolute/coordinator/inputs/tools/F28-osm-facilities/venv/bin/python

"$FACILITY_PYTHON" "$FACILITY_SCRIPT" plan --originals "$FACILITY_ORIGINALS" --work "$FACILITY_WORK"
# Coordinator fills and approves the returned confirmation template before continuing.
"$FACILITY_PYTHON" "$FACILITY_SCRIPT" acquire --originals "$FACILITY_ORIGINALS" --work "$FACILITY_WORK" --approval "$FACILITY_APPROVAL"
"$FACILITY_PYTHON" "$FACILITY_SCRIPT" enumerate --originals "$FACILITY_ORIGINALS" --work "$FACILITY_WORK" --approval "$FACILITY_APPROVAL"
"$FACILITY_PYTHON" "$FACILITY_SCRIPT" build --originals "$FACILITY_ORIGINALS" --work "$FACILITY_WORK" --approval "$FACILITY_APPROVAL" \
  --census-originals /absolute/coordinator/inputs/originals/F28-geography \
  --schema-root /absolute/repository-with-C2-and-existing-dependencies \
  --node /absolute/approved/node --tsx /absolute/repository/app/node_modules/tsx/dist/cli.mjs
```

Intake is sequential, uses HTTP Range/If-Range to resume `.part` files, refuses server resume mismatches/changed identities/oversize transfers, and verifies publisher bytes/MD5, local SHA-256 and actual PBF header before promoting an original. Interrupted or rejected originals remain preserved. No download happens in `plan`.

Enumeration streams all native element types. Pyosmium's `BackReferenceWriter` completes geometry references (nested relation reference retrieval depth 10), then a second filtered pass indexes only candidates and their helpers in SQLite. No full-country node-location index is built. Complete candidate enumeration is atomic per extract: interruption replays that extract, preserving originals and other completed extract checkpoints. Only this producer's named incomplete scratch outputs are replaced. Use `enumerate --extract <id>` to resume one extract. Native duplicate IDs inside a source are a processing error, not silently overwritten. Helper tags remain only in ignored intermediate PBFs; serialized records retain an explicit tag allowlist and no contributor/contact fields.

Build results are checkpointed by native identity, every occurrence's content signature, producer code/plan and Census boundary hash. `build --limit <positive-count>` permits a first connection batch while the **entire enumerated identity ledger** retains other rows as pending; rerunning without a limit completes all identities. Missing extracts remain explicitly pending. No enumerated extract produces `pending.json` with unknown counts and no empty facility asset. A failed processing operation remains pending and retryable. A full asset requires four synchronized complete enumerations and zero pending identities, with any explained geometry limitations retained as unresolved.

`validate.ts` loads the actual shared C2 Zod schemas using the existing repository's tsx; it runs only as the generation gate. No schemas are copied and no test infrastructure added. Candidate filenames are promoted to `asset.json`/`manifest.json` only after acceptance. `generation.json` records the external exact asset SHA-256/bytes, counts, boundary and producer hashes. `manifest.json` retains a pending public offer: local generation cannot establish an available public download.

## Geometry, identity and context

Every native `node/way/relation:id` remains separate, including unnamed and disused tagged elements. Ledger occurrences retain each extract, version, edit timestamp and canonical content SHA-256. Content uses sorted UTF-8 compact JSON with original native coordinate/node/member order; raw coordinates use exact OSM E7 integers. Recursive helper geometry payloads preserve geometry changes even if a parent version is unchanged. Helper cycles/missing objects have explicit hash markers. Cross-extract version/time/content differences remain unresolved; no newest/source-preference merge occurs. Names/operator/voltage are community tags, never project ownership or engineering verification.

Native nodes retain only their actual positions with unknown accuracy. Closed ways and explicit multipolygon outer/inner way members use native coordinates. Ways join by exact endpoint IDs; branching, missing/unclosed/degenerate/self-intersecting rings, unsupported/nested relation roles and contradictory `area=no` remain unresolved. Holes require a unique containing outer. No polygon repair, simplification, inferred relation role, hull or center is used. Multi-site components and holes remain distinct. Valid antimeridian geometry is unwrapped, split into world-band components and represented by separate supported extents; context still evaluates the actual split footprint, not those bounds.

Census Esri rings retain clockwise exteriors/counterclockwise holes. All 56 exact GEOID/postal identities and every original hash must reconcile; invalid boundary topology blocks generation instead of claiming incomplete context as complete. The generated `census-full-state-polygons.json` carries the exact input page identities and has its own SHA-256 referenced by each context record. Strict containment without boundary contact is the only unique-area assertion. Cross-boundary, touching/partial/conflicting and outside-supported cases retain their explicit meanings; Geofabrik labels, erroneous regional ISO metadata and `addr:state` are not context evidence. The complete Census artifact stays alongside the local asset for reproducibility.

Public distribution requires an accepted ODbL reference-database offer, attribution and notices. The emitted database is separate from private analyst work and independent project records; this packaging does not itself prove compliance. Reference production alone establishes neither project matching nor nationwide planned-project coverage.

Primary API/meaning references: [Pyosmium backward-reference writer](https://docs.osmcode.org/pyosmium/latest/reference/Data-Writers/), [streaming file processor](https://docs.osmcode.org/pyosmium/latest/reference/File-Processing/), [Shapely topology predicates](https://shapely.readthedocs.io/en/stable/manual.html), [Esri polygon ring semantics](https://developers.arcgis.com/rest/services-reference/enterprise/geometry-objects/), [OSM substation tag](https://wiki.openstreetmap.org/wiki/Tag:power%3Dsubstation), [OSM copyright/ODbL](https://www.openstreetmap.org/copyright), and the frozen qualified Geofabrik/Census URLs in `plan.json`.
