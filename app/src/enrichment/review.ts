import { z } from "zod"
import { geographicRepresentationSchema, geographicRunSchema, type GeographicRepresentation, type GeographicRun } from "@/domain/geography"

const inputSchema = z.object({
  inputFingerprint: z.string().regex(/^[a-f0-9]{64}$/, "The review needs the current source fingerprint."),
  decision: z.enum(["accepted", "corrected", "rejected"]),
  reason: z.string().trim().min(1, "Add a reason for this review."),
  representation: geographicRepresentationSchema.optional(),
}).superRefine((input, context) => {
  if (input.decision === "corrected" && !input.representation) context.addIssue({ code: "custom", path: ["representation"], message: "A correction needs complete cited geographic evidence." })
  if (input.decision !== "corrected" && input.representation) context.addIssue({ code: "custom", path: ["representation"], message: "Only a correction can supply a different representation." })
})

export type GeographicReviewInput = z.infer<typeof inputSchema>

export function precisionRank(representation: GeographicRepresentation): number {
  return ({ project: 6, facility: 5, endpoints: 4, locality: 3, unknown: 3, town: 2, county: 1, state: 0, region: 0 })[representation.precision]
}

export function requireCitation(representation: GeographicRepresentation): void {
  if (!representation.label.trim() || representation.limitations.some(limitation => !limitation.trim())
    || representation.evidence.some(source => !source.file.trim() || !source.locator.trim())) {
    throw new Error("Geographic evidence needs a label, meaningful limitations, and a source title with an exact locator for every citation.")
  }
}

/** Review the current companion outcome; source records and strict locations are never changed. */
export function reviewGeographicOutcome(run: GeographicRun, projectId: string, input: GeographicReviewInput): GeographicRun {
  const current = geographicRunSchema.parse(run)
  const decision = inputSchema.parse(input)
  const record = current.records.find(item => item.projectId === projectId)
  if (!record) throw new Error("This project is not in the active geographic run. Select a current result.")
  if (record.inputFingerprint !== decision.inputFingerprint) throw new Error("The source evidence changed after this review was opened. Review the current result before saving.")
  if (record.status === "not-processed") throw new Error("Process this project's geographic evidence before reviewing it.")

  const representation = decision.decision === "corrected" ? decision.representation! : record.representation
  if (!representation) throw new Error("There is no current geographic representation to accept or reject. Supply a cited correction instead.")
  requireCitation(representation)
  if (decision.decision === "corrected" && record.review?.representation
    && precisionRank(representation) < precisionRank(record.review.representation)) {
    throw new Error("This correction is less precise than the existing reviewed evidence. Keep that evidence or supply a correction at the same or finer precision.")
  }

  const review = {
    decision: decision.decision, updatedAt: new Date().toISOString(),
    basedOnFingerprint: record.inputFingerprint, reason: decision.reason,
    representation,
  }
  const updated = {
    ...record, review,
    status: decision.decision === "rejected" ? "unsupported" as const : decision.decision === "corrected" ? "approximate" as const : record.status,
    representation: decision.decision === "rejected" ? null : representation,
    reason: `Analyst ${decision.decision} geographic evidence: ${decision.reason}`,
    ...(decision.decision === "corrected" ? {
      referenceIds: [],
      candidateReferenceIds: [...new Set([...record.referenceIds, ...record.candidateReferenceIds])],
    } : {}),
  }
  return geographicRunSchema.parse({ ...current, records: current.records.map(item => item.projectId === projectId ? updated : item) })
}
