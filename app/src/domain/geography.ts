import { z } from "zod"
import { sourceSchema } from "./coverage"
import { geographicFacilityReferenceSchema } from "./geographic-facility"
import { geographicReferenceAssetSchema } from "./geographic-attribution"

// Companion evidence layer: never substitutes into Project.location or strict candidates.
export const geographicPositionSchema = z.tuple([z.number().min(-180).max(180), z.number().min(-90).max(90)])
const evidence = z.array(sourceSchema).min(1)
const common = {
  label: z.string().min(1), evidence, limitations: z.array(z.string()).min(1),
  accuracyMeters: z.number().nonnegative().nullable(), // null unless the cited source states numeric accuracy
}
export const geographicRepresentationSchema = z.discriminatedUnion("kind", [
  z.object({ ...common, kind: z.literal("point"), method: z.enum(["source-point", "matched-facility", "single-endpoint"]),
    position: geographicPositionSchema, precision: z.enum(["project", "facility", "locality", "unknown"]) }),
  z.object({ ...common, kind: z.literal("endpoints"), method: z.literal("endpoint-estimate"),
    positions: z.array(geographicPositionSchema).min(2), precision: z.literal("endpoints") }),
  z.object({ ...common, kind: z.literal("area"), method: z.literal("geographic-area"),
    bounds: z.tuple([z.number().min(-180).max(180), z.number().min(-90).max(90), z.number().min(-180).max(180), z.number().min(-90).max(90)])
      .refine(([west, south, east, north]) => west < east && south < north, "Area bounds must enclose a nonzero extent"),
    precision: z.enum(["town", "county", "state", "region"]), boundaryMeaning: z.literal("bounding-extent") }),
])
export const geographicClueSchema = z.object({
  kind: z.enum(["facility", "endpoint", "town", "county", "state", "source-id"]),
  text: z.string().min(1), normalized: z.string().min(1), field: z.string().min(1), evidence,
})
export const geographicReferenceSchema = z.object({
  id: z.string().min(1), names: z.array(z.string().min(1)).min(1), kind: z.enum(["facility", "town", "county", "state"]),
  stateCodes: z.array(z.string()), sourceKeys: z.array(z.string()), projectIds: z.array(z.string()),
  representation: geographicRepresentationSchema,
  projectFingerprints: z.record(z.string(), z.string().regex(/^[a-f0-9]{64}$/)).optional(),
  facility: geographicFacilityReferenceSchema.optional(), // Reference metadata only; no new active representation.
})
export const geographicReferenceBundleSchema = z.object({
  version: z.literal(1), revision: z.string().min(1), retrievedOn: z.iso.date(),
  sources: z.array(z.object({ id: z.string(), evidence: sourceSchema, permittedUse: z.string().min(1), sha256: z.string().regex(/^[a-f0-9]{64}$/) })),
  references: z.array(geographicReferenceSchema), limitations: z.array(z.string()),
  referenceAssets: z.array(geographicReferenceAssetSchema).optional(),
}).refine(bundle => new Set(bundle.references.map(row => row.id)).size === bundle.references.length, "Reference IDs must be unique")
  .superRefine((bundle, ctx) => {
    const assets = new Map((bundle.referenceAssets ?? []).map(asset => [asset.assetId, asset]))
    if (assets.size !== (bundle.referenceAssets?.length ?? 0)) ctx.addIssue({ code: "custom", path: ["referenceAssets"], message: "Reference asset identities must be unique" })
    for (const reference of bundle.references) {
      if (!reference.facility) continue
      const facility = reference.facility, asset = assets.get(facility.assetId)
      if (reference.kind !== "facility" || reference.id !== facility.id) ctx.addIssue({ code: "custom", path: ["references"], message: "Facility metadata must retain its reference kind and native identity" })
      if (!asset || asset.revision !== facility.assetRevision || asset.sourceUse.id !== facility.sourceUseId) ctx.addIssue({ code: "custom", path: ["referenceAssets"], message: "Facility metadata needs its exact reference asset revision and source-use manifest" })
    }
  })
export const GEOGRAPHIC_STATUSES = ["located", "approximate", "ambiguous", "unsupported", "not-processed"] as const
export const geographicRecordSchema = z.object({
  projectId: z.string().min(1), inputFingerprint: z.string().regex(/^[a-f0-9]{64}$/),
  status: z.enum(GEOGRAPHIC_STATUSES), reason: z.string().min(1),
  clues: z.array(geographicClueSchema), representation: geographicRepresentationSchema.nullable(),
  referenceIds: z.array(z.string()), candidateReferenceIds: z.array(z.string()),
  review: z.object({ decision: z.enum(["accepted", "corrected", "rejected"]), updatedAt: z.iso.datetime(),
    basedOnFingerprint: z.string(), reason: z.string().min(1), representation: geographicRepresentationSchema.nullable() }).optional(),
}).refine(row => (["located", "approximate"].includes(row.status)) === (row.representation !== null), "Located/approximate outcomes require a representation; unresolved outcomes cannot supply one")
export const geographicRunSchema = z.object({
  version: z.literal(1), pipelineVersion: z.string().min(1), referenceRevision: z.string().min(1),
  mode: z.enum(["real", "demo"]), generatedAt: z.iso.datetime(), collectionTitle: z.string(),
  records: z.array(geographicRecordSchema),
  retainedReviews: z.array(geographicRecordSchema).optional(), // Removed records keep analyst decisions outside active coverage.
}).refine(run => new Set(run.records.map(row => row.projectId)).size === run.records.length, "One geographic outcome per stable project ID")
export type GeographicRepresentation = z.infer<typeof geographicRepresentationSchema>
export type GeographicClue = z.infer<typeof geographicClueSchema>
export type GeographicReference = z.infer<typeof geographicReferenceSchema>
export type GeographicReferenceBundle = z.infer<typeof geographicReferenceBundleSchema>
export type GeographicRecord = z.infer<typeof geographicRecordSchema>
export type GeographicRun = z.infer<typeof geographicRunSchema>
export type GeographicStatus = typeof GEOGRAPHIC_STATUSES[number]
