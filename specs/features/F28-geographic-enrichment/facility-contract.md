# F28-C2 — Facility extents, context and source-use agreement

The coordinator has approved an optional reference-side contract, implemented by core. [B2 qualification](osm-qualification.md) supports a complete public OSM `power=substation` inventory, not a set of verified transmission projects. C2 defines reusable validation and the next interfaces. It emits no facilities, acquires no PBFs and changes no current source, calculation, map, accepted review or unfinished draft.

## Schema boundary

| File/export | Meaning |
| --- | --- |
| `domain/geographic-facility.ts`: `geographicFacilityGeometrySchema`, `GeographicFacilityGeometry` | Native community node, supported Polygon/MultiPolygon footprint, or explicit facility bounding extents |
| Same: `geographicOsmIdentitySchema`, `geographicCommunityProvenanceSchema` and inferred types | Native element type, decimal-string ID, version/edit timestamp, extract identities, cited unverified provenance and permitted contextual tags |
| Same: `geographicFacilityContextSchema`, `GeographicFacilityContext` | Authoritative full Census polygon edition/hash, actual evaluated geometry, containment/intersection matches and ambiguity |
| Same: `geographicFacilityReferenceSchema`, `GeographicFacilityReference` | Standalone facility evidence with asset/revision/source-use identities; names may be empty |
| Same: extract, ledger-entry, accounting and asset schemas/types prefixed `geographicFacility` / `GeographicFacility` | Four-extract scope and reconciled native-identity inventory; asset version 1 |
| `domain/geographic-attribution.ts`: `geographicSourceUseSchema`, `GeographicSourceUse` | ODbL-derived reference-database attribution, supplier, derivation, notices and output obligations |
| Same: `geographicReferenceAssetSchema`, `GeographicReferenceAsset` | Separately identified asset/revision, source-use policy and pending or available machine-readable download offer |
| `domain/geography.ts`: optional `GeographicReference.facility` and `GeographicReferenceBundle.referenceAssets` | Additive metadata only, absent on every existing reference and bundle |

`GeographicRepresentation`, geographic run/review/restore/draft schemas, Dataset, source locations, strict eligibility and precision ranking stay unchanged. No migration, defaults or replacement records. The old reference's required `representation` is unchanged: do not fabricate a town/state area or point to wrap a facility footprint. New facilities remain in the standalone asset until the coordinated runtime follow-ups below. Optional metadata alone does not authorize the old matcher to consume OSM references.

Exact C2 ownership is `app/src/domain/geography.ts`, new `geographic-facility.ts` and `geographic-attribution.ts`, this spec and `changes/F28-C2.md`. Coordinator retains agreement, integration and named checking. No C2 writes to draft/coverage schemas, mission/roadmap/tech-stack, runtime producer/export, dependencies, UI or maps.

## Geometry and evidence

Coordinates are EPSG:4326 longitude/latitude. `node` retains the native node position and meaning `community-facility-position`. `footprint` retains native supported Polygon/MultiPolygon coordinates, exterior/hole rings and separate sites; it is a community-mapped footprint, not a surveyed project boundary. `extent` retains one or more bounding parts derived from supported native area geometry, explicitly labelled `facility-bounding-extent`, with Polygon/MultiPolygon origin and a derivation explanation. Preserve separate sites and split antimeridian-crossing extents; do not envelope the globe or join sites into a manufactured corridor. No route, center, midpoint, centroid or numeric accuracy is created; `accuracyMeters` is always null.

Schemas validate finite coordinate ranges, closed rings with three distinct vertices, nonzero bounds, native node versus area roles, mandatory evidence and limitations. Structural validation does **not** prove topology, completeness, containment, ring nesting or bounds correctness. The producer must reject/retain unresolved invalid topology or incomplete geometry with a reason before emission; it must derive context from the actual supported footprint before any bounds reduction. Core remains the owner of later matching/proximity policy, with no second calculation engine in the producer or UI.

Identity is `osm:<node|way|relation>:<decimal ID>`, independent of extract and revision. Native version and timestamp are observation/edit provenance, never construction/service dates. References retain their exact asset revision and all reconciled extract identities, whose manifest entries hold complete original SHA-256/bytes/snapshot time. Evidence locates the native element/version and extract. The tag allowlist retains name/alternate/official name, ref, operator, voltage, substation, disused, abandoned and construction context alongside `power=substation`. Omit contributor/contact fields. `operator` is not an evidenced asset owner; voltage/type/lifecycle tags are not engineering verification. Unnamed facilities remain in the inventory; no fabricated matching name. Different native IDs, including node/way/relation descriptions of a possible same facility, are never silently merged. Record possible duplicate physical identity in limitations and withhold an ambiguous planning match.

## Authoritative geographic context

Initial context uses the retained full Census ACS2025 EPSG:4326 state/territory polygon asset, with its edition ID, exact SHA-256 and source locator. Evaluate all supported polygons, preserving islands and holes. The 56 supported postal identities are explicit in `GEOGRAPHIC_CENSUS_AREAS`; the producer must use the Census GEOID/postal crosswalk, not merely satisfy string validation. Geofabrik clipping boxes, `addr:state`, publisher footprint and the erroneous American Oceania index ISO value do not establish state identity.

`method` is `point-in-polygon` for a native node, or `geometry-intersection` for a native footprint (including containment assessment). `matches` records exact Census GEOID, state code and `contained`, `intersects` or `boundary-touch` relationship. Status meanings:

- `contained`: exactly one polygon contains the full native geometry. This is the only unique state-context assignment for automatic name matching.
- `cross-boundary`: multiple supported areas intersect/touch the geometry; retain all matches, never pick a primary state.
- `ambiguous`: available matches do not establish one safe context, including boundary-touch or unresolved topology interpretation; the reason explains it.
- `outside-supported`: the valid geometry has no match within the 56 supported areas; minor outlying islands are not silently assigned to a nearby territory.
- `unresolved`: context could not be established; no asserted matches.

A footprint extent is not the input to containment. Ambiguous or outside context may be retained as cited standalone geometry; it cannot become an automatic context-resolved project match. Missing/invalid native geometry remains an unresolved ledger identity rather than an invented reference position.

## Complete acquisition and accounting

The complete tag scope is every native node/way/relation with `power=substation` in four synchronized extracts: `us`, `puerto-rico`, `us-virgin-islands`, `american-oceania`. Preserve `disused=yes`; lifecycle-prefix-only tags, legacy `power=station`, untagged facilities and individual transformers are outside this declared tag scope. The qualified October 2 originals total 12,263,617,346 published bytes; acquire that common snapshot or document a replacement common edition. Actual PBF header time/SHA-256/bytes, not web-page/Taginfo totals, identify the inputs.

`geographicFacilityAssetSchema` contains all four extract declarations. `pending` extracts state the missing input; acquired extracts carry snapshot time/hash/bytes and primary/helper occurrence counts. Each acquired extract's entire candidate identity enumeration must be in the ledger even for an early sample; unprocessed identities are `pending`. Native geometry helpers that do not themselves satisfy the retained tag are counted separately and are not facility rows. A tagged member remains one candidate identity even when also needed as geometry support.

One ledger row per native type/ID retains every extract occurrence with version, timestamp and a SHA-256 of its canonical retained tag/native-geometry payload (sorted object keys, preserved coordinate/member order, no contributor metadata). Cross-extract identical occurrences deduplicate by native type/ID/version/content. Conflicting version/time/content remains `unresolved`; no arbitrary latest-wins rule. Every emitted identity links exactly one reference with the same provenance; excluded/unresolved/pending identities have a specific reason and no reference. Do not silently discard unnamed, outside-scope or invalid/incomplete geometry records.

The asset schema reconciles per-extract occurrences, unique ledger identities, duplicate occurrences, emitted node/footprint/extent references and excluded/unresolved/pending outcomes. `rawOccurrences = uniqueElements + duplicateOccurrences`; unique elements equal the three emitted geometry counts plus excluded, unresolved and pending. Helpers are separate. `scope: full` requires all four inputs acquired at the declared snapshot and zero pending identities. Explained unresolved cases are final accounted limitations, not usable matches. A processing failure remains pending and cannot close full scope. Reference counts do not establish match yield or nationwide planned-transmission coverage.

## Source use, offers and mixed outputs

Treat the systematic reference extraction as an OSM-derived database under [ODbL 1.0](https://opendatacommons.org/licenses/odbl/1-0/), following the qualified source notices. `GeographicSourceUse` records `licenseId: ODbL-1.0`, the licence URL, visible **© OpenStreetMap contributors** credit linked to [OSM copyright](https://www.openstreetmap.org/copyright), Geofabrik as supplier, derivation, notices and machine-readable output obligations. These describe required behavior; parsing a policy is not evidence that downstream output has complied.

Publish/offer the reusable reference-only asset separately from private analyst work. Its external `GeographicReferenceAsset` manifest names asset/revision/source-use and an available public HTTP(S) JSON download with byte count and exact file SHA-256; the digest is outside the downloaded envelope to avoid self-hashing. Before hosting, `download.status: pending` records the concrete reason and **blocks public runtime distribution of those references**. The offer must cover the applicable derived database or satisfy the equivalent ODbL offer; the initial implementation uses the complete emitted reference asset plus ledger/notices. Do not imply a pending link fulfills that obligation.

Future consumers must implement the frozen output policy before facility activation:

- Companion JSON retains source-use metadata, contributing facility/native/asset identities, geometry meaning and the reference download offer, including when accepted/corrected/rejected review metadata retains community evidence.
- CSV retains attribution/licence/reference-asset columns and ships a machine-readable metadata sidecar with source-use/offer information. If the exporter cannot supply both, it must withhold this export action with an actionable explanation rather than silently omit notices.
- Reports and relevant map/detail views show linked attribution and the reference offer beside or through a clearly reachable source details control; reports retain the credit in the produced document.
- Independent source Project fields retain original provenance. Joining/relabeling output does not establish that it is legally independent of the derived database; preserve the distinction and apply the reference notices to the derived portion. App/code licensing does not relicense reference data.
- Do not automatically publish user inputs, private source snapshots, saved findings or review/draft notes to fulfill the offer. Existing source-only exports remain unchanged.

## Exact follow-ups and activation order

| Increment / owner | Files and prerequisites | Completion before activation |
| --- | --- | --- |
| B2 producer / source_discovery, coordinator resources | New `scripts/ingest/geography/osm-facilities/*` and `app/src/data/geography/osm-facilities/*`; no current bundle overwrite. C2 plus coordinator-confirmed disk for 12.26 GB originals/intermediates and isolated approved Osmium runtime | Stream/filter the four pinned public extracts with geometry members, validate topology/full Census context, emit validated asset/ledger/manifest. Preserve ignored originals. First coherent batch then entire declared inventory; no node-only completion |
| C2 runtime representation agreement / coordinator | `domain/geography.ts`, `geographic-drafts.ts`, `geographic-coverage.ts`, `geographic-restore.ts` and any affected draft/restore interfaces, plus exact follow-up specs | Add an explicit community facility representation/attribution contract and backward-compatible consumers. No generic town/point masquerade, defaults or source-location migration. Freeze same-input source/review precedence and stale/dirty guards before parallel consumers |
| Matching, precision and exploratory core / core | `enrichment/clues.ts`, `pipeline.ts`, `review.ts`, `restore.ts`, `coverage.ts`, `core/exploratory.ts` only as separately assigned | Unique name/native context matching with ambiguity; source-provided evidence and existing accepted/corrected/rejected decisions win. No silently weaker replacement; changed evidence/references require conflict review. Canonical extent/node geometry policy only; strict core unchanged |
| Persistence and exports / coordinator, then named exporter owner | `data/geography-session.ts`, `features/readiness/use-geography.ts`, `data/geography-drafts.ts`, `data/geographic-draft-restore.ts`, affected companion/export callers and `features/briefs/export.ts` only if separately assigned | Preserve old stored runs/drafts and new provenance through save/download/restore; current fingerprints and dirty drafts remain protected. Implement JSON/CSV/report notices/offer without publishing private material |
| Presentation / ui | `features/readiness/GeographyPanel.tsx`, `features/readiness/GeographyCoverage.tsx`, `features/explorer/GeographicEvidence.tsx` and exact new helpers under separate handoff | Show community/unverified method, facility geometry/context and attribution; coverage separates usable facility matches from unresolved inventory. Retain review and unfinished draft state |
| Map / map-ui after F29 releases ownership | Existing `features/explorer/ProjectMap.tsx`, `geography-map.ts` and `density-map/{MapLibreProjectMap.tsx,geography-layers.ts}` under a separate exact handoff | Render actual supported geometry/extent parts and linked attribution; no inferred center, centroid marker or route. Both adapters preserve selection and current map contracts |
| Composition / coordinator | Reference loader/controller and shared bundle metadata only after the above consumers are ready | Connect a small real batch, then full asset. Named coordinator alone performs the bounded nonvisual composition case/build; workers run no checks |

C2 completion is this backward-compatible schema/spec increment. Facility acquisition, runtime matching, new review representations, public offers and map rendering remain explicit dependent work; no implementation or validation of those consumers is claimed here.
