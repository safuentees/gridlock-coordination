import { z } from "zod"

const text = z.string().trim().min(1)
const httpUrl = z.url().refine(value => /^https?:\/\//i.test(value), "Use a public HTTP or HTTPS source link")
const sha256 = z.string().regex(/^[a-f0-9]{64}$/)
const byteCount = z.number().int().positive().max(Number.MAX_SAFE_INTEGER)

/** Obligations carried with community reference data, not a licence for independent source records. */
export const geographicSourceUseSchema = z.object({
  id: text,
  databaseKind: z.literal("odbl-derived-database"),
  licenseId: z.literal("ODbL-1.0"),
  licenseUrl: z.literal("https://opendatacommons.org/licenses/odbl/1-0/"),
  attribution: z.object({
    text: z.literal("© OpenStreetMap contributors"),
    url: z.literal("https://www.openstreetmap.org/copyright"),
  }),
  supplier: z.object({ name: z.literal("Geofabrik"), url: httpUrl }),
  derivation: text,
  notices: z.array(text).min(1),
  publicUse: z.object({
    visibleAttribution: z.literal(true),
    retainNotices: z.literal(true),
    shareAlikeDerivedDatabase: z.literal(true),
    offerReferenceDatabase: z.literal(true),
  }),
  outputs: z.object({
    companionJson: z.literal("include-source-use-and-reference-offer"),
    csv: z.literal("attribution-columns-and-metadata-sidecar"),
    report: z.literal("visible-attribution-and-reference-offer"),
    independentSourceFields: z.literal("retain-original-provenance"),
    privateAnalystWork: z.literal("never-publish-automatically"),
  }),
})

/** Separate manifest: its hash describes the downloaded asset, avoiding a self-hashing envelope. */
export const geographicReferenceAssetSchema = z.object({
  assetId: text, revision: text, sourceUse: geographicSourceUseSchema,
  download: z.discriminatedUnion("status", [
    z.object({ status: z.literal("pending"), reason: text }),
    z.object({
      status: z.literal("available"), url: httpUrl,
      mediaType: z.literal("application/json"), sha256, bytes: byteCount,
      contents: z.literal("reference-database-only"),
    }),
  ]),
})

export type GeographicSourceUse = z.infer<typeof geographicSourceUseSchema>
export type GeographicReferenceAsset = z.infer<typeof geographicReferenceAssetSchema>
