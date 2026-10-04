import { z } from "zod"
import { sourceSchema } from "./coverage"
import { geographicSourceUseSchema } from "./geographic-attribution"

const text = z.string().trim().min(1)
const sha256 = z.string().regex(/^[a-f0-9]{64}$/)
const count = z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER)
const citation = sourceSchema.extend({ file: text, locator: text })
const evidence = z.array(citation).min(1)
const position = z.tuple([z.number().min(-180).max(180), z.number().min(-90).max(90)])
const bounds = z.tuple([z.number().min(-180).max(180), z.number().min(-90).max(90), z.number().min(-180).max(180), z.number().min(-90).max(90)])
  .refine(([west, south, east, north]) => west < east && south < north, "Bounds need a nonzero extent; split antimeridian crossings into parts")
const ring = z.array(position).min(4).refine(points => {
  if (points.length < 4) return false
  const first = points[0], last = points[points.length - 1]
  return first[0] === last[0] && first[1] === last[1]
    && new Set(points.slice(0, -1).map(point => point.join(","))).size >= 3
}, "Rings must close and contain at least three distinct vertices")
const polygon = z.array(ring).min(1) // First ring is exterior; subsequent rings remain holes.

export const GEOGRAPHIC_FACILITY_EXTRACTS = ["us", "puerto-rico", "us-virgin-islands", "american-oceania"] as const
export const GEOGRAPHIC_CENSUS_AREAS = ["AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "DC", "FL", "GA", "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ", "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY", "AS", "GU", "MP", "PR", "VI"] as const
const extractId = z.enum(GEOGRAPHIC_FACILITY_EXTRACTS)
const nativeIdentity = z.object({ type: z.enum(["node", "way", "relation"]), id: z.string().regex(/^[1-9]\d*$/) })
export const geographicOsmIdentitySchema = nativeIdentity.extend({ version: z.number().int().positive().max(Number.MAX_SAFE_INTEGER), timestamp: z.iso.datetime() })

/** Structural validation only: the producer must validate topology before publishing a footprint. */
export const geographicFacilityGeometrySchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("node"), position, meaning: z.literal("community-facility-position"), crs: z.literal("EPSG:4326"), accuracyMeters: z.null() }),
  z.object({
    kind: z.literal("footprint"), meaning: z.literal("community-mapped-footprint"), crs: z.literal("EPSG:4326"), accuracyMeters: z.null(),
    geometry: z.discriminatedUnion("type", [
      z.object({ type: z.literal("Polygon"), coordinates: polygon }),
      z.object({ type: z.literal("MultiPolygon"), coordinates: z.array(polygon).min(1) }),
    ]),
  }),
  z.object({
    kind: z.literal("extent"), parts: z.array(bounds).min(1), meaning: z.literal("facility-bounding-extent"),
    derivedFrom: z.enum(["Polygon", "MultiPolygon"]), derivation: text,
    crs: z.literal("EPSG:4326"), accuracyMeters: z.null(),
  }),
])

export const geographicFacilityContextSchema = z.object({
  boundary: z.object({ authority: z.literal("US Census Bureau"), editionId: text, sha256,
    geometry: z.literal("full-polygon"), crs: z.literal("EPSG:4326"), evidence }),
  method: z.enum(["point-in-polygon", "geometry-intersection"]),
  evaluatedGeometry: z.enum(["native-node", "native-footprint"]),
  status: z.enum(["contained", "cross-boundary", "ambiguous", "outside-supported", "unresolved"]),
  matches: z.array(z.object({ geoid: z.string().regex(/^\d{2}$/), stateCode: z.enum(GEOGRAPHIC_CENSUS_AREAS),
    relationship: z.enum(["contained", "intersects", "boundary-touch"]) })),
  reason: text,
}).superRefine((context, ctx) => {
  const fail = (message: string) => ctx.addIssue({ code: "custom", message })
  if (new Set(context.matches.map(match => match.geoid)).size !== context.matches.length
    || new Set(context.matches.map(match => match.stateCode)).size !== context.matches.length) fail("Context matches must have distinct Census identities")
  if (context.status === "contained" && (context.matches.length !== 1 || context.matches[0].relationship !== "contained")) fail("Contained context needs exactly one containing Census area")
  if (context.status === "cross-boundary" && (context.matches.length < 2 || context.matches.some(match => match.relationship === "contained"))) fail("Cross-boundary context needs multiple intersecting or touched Census areas")
  if ((context.status === "outside-supported" || context.status === "unresolved") && context.matches.length) fail("Outside or unresolved context cannot assert Census matches")
  if ((context.evaluatedGeometry === "native-node") !== (context.method === "point-in-polygon")) fail("Context method must describe the actual native geometry evaluated")
})

export const geographicCommunityProvenanceSchema = z.object({
  source: z.literal("openstreetmap"), verification: z.literal("unverified"),
  native: geographicOsmIdentitySchema, extractIds: z.array(extractId).min(1), evidence,
  // An explicit allowlist excludes contributor/contact metadata. Tags do not establish asset ownership.
  tags: z.object({ power: z.literal("substation"), name: text.optional(), alt_name: text.optional(), official_name: text.optional(),
    ref: text.optional(), operator: text.optional(), voltage: text.optional(), substation: text.optional(),
    disused: text.optional(), abandoned: text.optional(), construction: text.optional() }),
}).refine(value => new Set(value.extractIds).size === value.extractIds.length, "Extract IDs must be unique")

/** A standalone reference, not a Project location or an active GeographicRepresentation. */
export const geographicFacilityReferenceSchema = z.object({
  id: text, assetId: text, assetRevision: text, sourceUseId: text, names: z.array(text),
  geometry: geographicFacilityGeometrySchema, context: geographicFacilityContextSchema,
  provenance: geographicCommunityProvenanceSchema, limitations: z.array(text).min(1),
}).superRefine((reference, ctx) => {
  const native = reference.provenance.native
  if (reference.id !== `osm:${native.type}:${native.id}`) ctx.addIssue({ code: "custom", path: ["id"], message: "Use the native type/ID identity, independent of extract and version" })
  if ((native.type === "node") !== (reference.geometry.kind === "node")) ctx.addIssue({ code: "custom", path: ["geometry"], message: "Only native nodes supply node positions; ways/relations need supported area geometry" })
  if ((reference.geometry.kind === "node") !== (reference.context.evaluatedGeometry === "native-node")) ctx.addIssue({ code: "custom", path: ["context"], message: "Context must use the native node or footprint, never its derived extent" })
})

export const geographicFacilityExtractSchema = z.discriminatedUnion("status", [
  z.object({ status: z.literal("pending"), id: extractId, source: citation, reason: text }),
  z.object({ status: z.literal("acquired"), id: extractId, source: citation, snapshotAsOf: z.iso.datetime(),
    sha256, bytes: count.positive(), candidateOccurrences: count, helperOccurrences: count }),
])
export const geographicFacilityLedgerEntrySchema = z.object({
  native: nativeIdentity,
  occurrences: z.array(z.object({ extractId, version: z.number().int().positive().max(Number.MAX_SAFE_INTEGER), timestamp: z.iso.datetime(), contentSha256: sha256 })).min(1),
  disposition: z.enum(["emitted", "excluded", "unresolved", "pending"]),
  reason: text, referenceId: text.nullable(),
}).superRefine((entry, ctx) => {
  const fail = (message: string) => ctx.addIssue({ code: "custom", message })
  if (new Set(entry.occurrences.map(item => item.extractId)).size !== entry.occurrences.length) fail("Each extract contributes at most one occurrence of a native element")
  if (entry.disposition === "emitted" ? entry.referenceId !== `osm:${entry.native.type}:${entry.native.id}` : entry.referenceId !== null) fail("Only emitted identities link to a facility reference")
  const versions = new Set(entry.occurrences.map(item => `${item.version}:${item.timestamp}:${item.contentSha256}`))
  if (versions.size > 1 && entry.disposition !== "unresolved") fail("Conflicting versions or content remain unresolved; do not choose an arbitrary extract")
})

export const geographicFacilityAccountingSchema = z.object({
  rawOccurrences: count, uniqueElements: count, duplicateOccurrences: count, helperOccurrences: count,
  emittedNodes: count, emittedFootprints: count, emittedExtents: count, excluded: count, unresolved: count, pending: count,
}).refine(value => value.rawOccurrences === value.uniqueElements + value.duplicateOccurrences
  && value.uniqueElements === value.emittedNodes + value.emittedFootprints + value.emittedExtents + value.excluded + value.unresolved + value.pending,
"Raw occurrences and all unique native identities must reconcile")

export const geographicFacilityAssetSchema = z.object({
  version: z.literal(1), assetId: text, revision: text, snapshotAsOf: z.iso.datetime(), retrievedOn: z.iso.date(),
  scope: z.enum(["sample", "full"]), tag: z.literal("power=substation"), sourceUse: geographicSourceUseSchema,
  extracts: z.array(geographicFacilityExtractSchema).length(4),
  references: z.array(geographicFacilityReferenceSchema), ledger: z.array(geographicFacilityLedgerEntrySchema),
  counts: geographicFacilityAccountingSchema, limitations: z.array(text).min(1),
}).superRefine((asset, ctx) => {
  const fail = (message: string) => ctx.addIssue({ code: "custom", message })
  const extracts = new Map(asset.extracts.map(extract => [extract.id, extract]))
  const references = new Map(asset.references.map(reference => [reference.id, reference]))
  const identities = new Set(asset.ledger.map(entry => `${entry.native.type}:${entry.native.id}`))
  if (extracts.size !== 4 || references.size !== asset.references.length || identities.size !== asset.ledger.length) fail("Extract, reference and ledger identities must be unique")
  if (asset.scope === "full" && (asset.counts.pending || asset.extracts.some(extract => extract.status === "pending"))) fail("Full scope requires all four extracts and no pending identities")
  const occurrences = new Map<string, number>(), linked = new Set<string>()
  let excluded = 0, unresolved = 0, pending = 0
  for (const entry of asset.ledger) {
    for (const occurrence of entry.occurrences) {
      occurrences.set(occurrence.extractId, (occurrences.get(occurrence.extractId) ?? 0) + 1)
      if (extracts.get(occurrence.extractId)?.status !== "acquired") fail("Ledger occurrences require acquired extracts")
    }
    if (entry.disposition !== "emitted") {
      if (entry.disposition === "excluded") excluded++
      if (entry.disposition === "unresolved") unresolved++
      if (entry.disposition === "pending") pending++
      continue
    }
    const reference = references.get(entry.referenceId!)
    if (!reference) { fail("Every emitted identity needs its reference"); continue }
    linked.add(reference.id)
    const native = reference.provenance.native
    if (entry.occurrences.some(item => item.version !== native.version || item.timestamp !== native.timestamp)
      || reference.provenance.extractIds.length !== entry.occurrences.length
      || reference.provenance.extractIds.some(id => !entry.occurrences.some(item => item.extractId === id))) fail("Reference provenance must retain every reconciled native occurrence")
  }
  if (linked.size !== references.size) fail("Every reference must be backed by one emitted ledger identity")
  let raw = 0, helpers = 0
  for (const extract of asset.extracts) {
    if (extract.status !== "acquired") continue
    raw += extract.candidateOccurrences; helpers += extract.helperOccurrences
    if (extract.snapshotAsOf !== asset.snapshotAsOf) fail("All acquired extracts must use the same declared snapshot")
    if ((occurrences.get(extract.id) ?? 0) !== extract.candidateOccurrences) fail("Each acquired extract's candidate occurrences must reconcile with the ledger")
  }
  const actual = { rawOccurrences: raw, uniqueElements: identities.size, duplicateOccurrences: raw - identities.size, helperOccurrences: helpers,
    emittedNodes: asset.references.filter(reference => reference.geometry.kind === "node").length,
    emittedFootprints: asset.references.filter(reference => reference.geometry.kind === "footprint").length,
    emittedExtents: asset.references.filter(reference => reference.geometry.kind === "extent").length, excluded, unresolved, pending }
  if (Object.entries(actual).some(([key, value]) => asset.counts[key as keyof typeof actual] !== value)) fail("Accounting must equal the extracts, complete identity ledger and emitted geometries")
  if (asset.references.some(reference => reference.assetId !== asset.assetId || reference.assetRevision !== asset.revision || reference.sourceUseId !== asset.sourceUse.id)) fail("Facility references must identify this asset revision and its source-use policy")
})

export type GeographicFacilityGeometry = z.infer<typeof geographicFacilityGeometrySchema>
export type GeographicFacilityContext = z.infer<typeof geographicFacilityContextSchema>
export type GeographicCommunityProvenance = z.infer<typeof geographicCommunityProvenanceSchema>
export type GeographicOsmIdentity = z.infer<typeof geographicOsmIdentitySchema>
export type GeographicFacilityReference = z.infer<typeof geographicFacilityReferenceSchema>
export type GeographicFacilityExtract = z.infer<typeof geographicFacilityExtractSchema>
export type GeographicFacilityLedgerEntry = z.infer<typeof geographicFacilityLedgerEntrySchema>
export type GeographicFacilityAccounting = z.infer<typeof geographicFacilityAccountingSchema>
export type GeographicFacilityAsset = z.infer<typeof geographicFacilityAssetSchema>
