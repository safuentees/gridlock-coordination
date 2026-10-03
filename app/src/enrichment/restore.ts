import type { GeographicRestoreAction, GeographicRestorePreview } from "@/domain/geographic-restore"
import { geographicRunSchema, type GeographicRecord, type GeographicRun } from "@/domain/geography"
import { precisionRank, requireCitation } from "./review"

type Entry = GeographicRestorePreview["entries"][number]
type Review = NonNullable<GeographicRecord["review"]>

function canonical(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonical)
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0).map(([key, item]) => [key, canonical(item)]))
  return value
}
const equal = (left: unknown, right: unknown): boolean => JSON.stringify(canonical(left)) === JSON.stringify(canonical(right))
const protectedIds = (ids: readonly string[]): string[] => [...new Set(ids.map(id => id.trim()).filter(Boolean))].sort()

function allRows(run: GeographicRun): GeographicRecord[] {
  return [...run.records, ...(run.retainedReviews ?? [])]
}

function validateRun(run: GeographicRun, label: string): GeographicRun {
  const parsed = geographicRunSchema.parse(run)
  const ids = new Set<string>()
  for (const row of allRows(parsed)) {
    if (ids.has(row.projectId)) throw new Error(`${label} contains duplicate active or retained identities for ${row.projectId}. Keep one unambiguous record per project.`)
    ids.add(row.projectId)
  }
  return parsed
}

function sameReview(left: Review, right: Review): boolean {
  // A different timestamp alone must neither replace a decision nor create a conflict.
  return equal({ ...left, updatedAt: null }, { ...right, updatedAt: null })
}

function consistencyIssue(row: GeographicRecord): string | null {
  const review = row.review!
  if (!review.reason.trim() || !/^[a-f0-9]{64}$/.test(review.basedOnFingerprint)) return "The imported review needs a reason and a valid source fingerprint."
  if (!review.representation) return "The imported decision has no cited representation to preserve."
  try { requireCitation(review.representation) }
  catch (error) { return error instanceof Error ? error.message : "The imported review lacks complete cited evidence." }
  if (review.decision === "rejected") {
    return row.status === "unsupported" && row.representation === null ? null : "A rejected review must keep its cited evidence in review metadata and remove active geometry."
  }
  if (!row.representation || !equal(row.representation, review.representation)) return "The imported active geometry differs from the reviewed evidence."
  if (review.decision === "corrected" && row.status !== "approximate") return "An analyst correction must remain an approximate representation."
  if (review.decision === "accepted" && !["located", "approximate"].includes(row.status)) return "An accepted representation needs a represented active status."
  if (row.status === "located" && (row.representation.kind !== "point" || row.representation.method !== "source-point")) return "The imported located status is inconsistent with its geographic representation."
  return null
}

function classify(row: GeographicRecord, current: GeographicRecord | undefined, active: boolean, protectedSet: Set<string>): Entry {
  const entry = (action: GeographicRestoreAction, reason: string): Entry => ({ projectId: row.projectId, action, reason })
  if (protectedSet.has(row.projectId)) return entry("conflict", "An unsaved local review draft protects this identity. Save or discard that draft before making a new preview.")
  if (!row.review) return entry("unreviewed", "This row has no analyst decision. Automatic results are not restored from a companion file.")
  if (row.review.basedOnFingerprint !== row.inputFingerprint) return entry("stale", "The imported decision predates its own source evidence and requires re-review.")
  const issue = consistencyIssue(row)
  if (issue) return entry("conflict", issue)
  if (current && current.inputFingerprint !== row.review.basedOnFingerprint) return entry("stale", active
    ? "The current source fingerprint differs from the imported review. Review the current evidence instead of restoring this decision."
    : "Existing retained evidence has a different source fingerprint. Its historical decision is preserved.")
  if (current?.review) return sameReview(current.review, row.review)
    ? entry("duplicate", "The same reviewed decision and cited evidence already exist. The current decision time is preserved.")
    : entry("conflict", "A different local analyst decision already exists. Import timestamps do not authorize replacing it.")
  if (current?.status === "not-processed") return entry("stale", "The current source outcome has not been processed. Finish processing before restoring a review.")
  if (current?.representation && precisionRank(row.review.representation!) < precisionRank(current.representation)) return entry("conflict", "The imported representation is less precise than current evidence; the finer evidence is preserved.")
  return active
    ? entry("restore-review", "The current source fingerprint matches and no local decision, draft or finer evidence would be replaced.")
    : entry("retain-review", "This reviewed identity is absent from the current collection. Keep its cited decision outside active coverage for a future return.")
}

/** A preview contains validated snapshots; no source rows, active geometry or storage are changed. */
export function previewGeographicRestore(current: GeographicRun, incoming: GeographicRun, protectedProjectIds: readonly string[] = []): GeographicRestorePreview {
  const base = validateRun(current, "Current geography"), imported = validateRun(incoming, "Imported geography")
  if (base.mode !== imported.mode) throw new Error("Geographic reviews must use the same source or demo mode as the active collection.")
  const normalized = protectedIds(protectedProjectIds), protectedSet = new Set(normalized)
  const activeIds = new Set(base.records.map(row => row.projectId))
  const existing = new Map(allRows(base).map(row => [row.projectId, row]))
  return {
    base, incoming: imported, protectedProjectIds: normalized,
    entries: allRows(imported).map(row => classify(row, existing.get(row.projectId), activeIds.has(row.projectId), protectedSet)),
  }
}

function applyReview(current: GeographicRecord, incoming: GeographicRecord): GeographicRecord {
  const review = structuredClone(incoming.review!)
  const changedRepresentation = !equal(current.representation, review.representation)
  return {
    ...current, review,
    status: review.decision === "rejected" ? "unsupported" : review.decision === "accepted" && current.status === "located" && !changedRepresentation ? "located" : "approximate",
    representation: review.decision === "rejected" ? null : review.representation,
    reason: `Restored analyst ${review.decision} geographic evidence: ${review.reason}`,
    ...(changedRepresentation || review.decision === "corrected" ? {
      referenceIds: [], candidateReferenceIds: [...new Set([...current.referenceIds, ...current.candidateReferenceIds])],
    } : {}),
  }
}

/** Apply only a recomputed compatible plan; the current run remains the authoritative collection. */
export function restoreGeographicReviews(current: GeographicRun, preview: GeographicRestorePreview, protectedProjectIds: readonly string[] = []): GeographicRun {
  const base = validateRun(current, "Current geography")
  if (!equal(base, validateRun(preview.base, "Preview base"))) throw new Error("The geographic collection or its reviews changed after this preview. Make a new preview before restoring.")
  const normalized = protectedIds(protectedProjectIds)
  if (!equal(normalized, protectedIds(preview.protectedProjectIds))) throw new Error("Unsaved review drafts changed after this preview. Make a new preview before restoring.")
  const plan = previewGeographicRestore(base, preview.incoming, normalized)
  const imported = new Map(allRows(plan.incoming).map(row => [row.projectId, row]))
  const actions = new Map(plan.entries.map(entry => [entry.projectId, entry.action]))
  const records = base.records.map(row => actions.get(row.projectId) === "restore-review" ? applyReview(row, imported.get(row.projectId)!) : row)
  const retained = new Map((base.retainedReviews ?? []).map(row => [row.projectId, row]))
  for (const entry of plan.entries) {
    if (entry.action !== "retain-review") continue
    const incoming = imported.get(entry.projectId)!, existing = retained.get(entry.projectId)
    retained.set(entry.projectId, existing ? applyReview(existing, incoming) : structuredClone(incoming))
  }
  return geographicRunSchema.parse({
    ...base, records,
    ...(base.retainedReviews !== undefined || retained.size ? { retainedReviews: [...retained.values()] } : {}),
  })
}
