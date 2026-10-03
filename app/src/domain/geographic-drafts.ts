import { z } from "zod"

// Raw unfinished fields remain strings; saving a draft never creates reviewed geography.
export const geographicReviewDraftSchema = z.object({
  inputFingerprint: z.string().regex(/^[a-f0-9]{64}$/),
  decision: z.enum(["accepted", "corrected", "rejected"]),
  reason: z.string(), kind: z.enum(["point", "endpoints", "area"]), label: z.string(),
  method: z.enum(["source-point", "matched-facility", "single-endpoint"]),
  pointPrecision: z.enum(["project", "facility", "locality", "unknown"]),
  areaPrecision: z.enum(["town", "county", "state", "region"]),
  longitude: z.string(), latitude: z.string(), endpoints: z.string(),
  west: z.string(), south: z.string(), east: z.string(), north: z.string(),
  accuracy: z.string(), limitations: z.string(),
  evidence: z.array(z.object({ file: z.string(), locator: z.string(), url: z.string() })),
})
export const geographicDraftSessionSchema = z.object({
  version: z.literal(1), mode: z.enum(["real", "demo"]),
  entries: z.array(z.object({ projectId: z.string().min(1), draft: geographicReviewDraftSchema,
    baseline: geographicReviewDraftSchema, updatedAt: z.iso.datetime() })),
}).refine(session => new Set(session.entries.map(entry => entry.projectId)).size === session.entries.length, "Keep one draft per source identity")
export type GeographicReviewDraft = z.infer<typeof geographicReviewDraftSchema>
export type GeographicDraftSession = z.infer<typeof geographicDraftSessionSchema>
