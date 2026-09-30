import { z } from "zod"
import type { DataMode } from "@/domain/schema"
import { savedOpportunitySchema, type SavedOpportunity } from "./storage"

export const MAX_BRIEF_BYTES = 10 * 1024 * 1024
const briefSchema = z.object({
  format: z.literal("gridlock-coordination-brief"),
  version: z.literal(1),
  exportedAt: z.iso.datetime(),
  mode: z.enum(["real", "demo"]),
  opportunities: z.array(z.unknown()),
})
export interface RejectedBriefRecord { position: number; id: string | null; reason: string }
export interface ParsedBrief {
  mode: DataMode
  exportedAt: string
  records: SavedOpportunity[]
  rejected: RejectedBriefRecord[]
}
export interface RestorePreview {
  additions: SavedOpportunity[]
  duplicates: { incoming: SavedOpportunity; existing: SavedOpportunity; dirty: boolean }[]
  blockedAdditions: SavedOpportunity[]
  rejected: RejectedBriefRecord[]
}

export function parseBrief(text: string, mode: DataMode): ParsedBrief {
  if (new TextEncoder().encode(text).length > MAX_BRIEF_BYTES) throw new Error("Choose a JSON brief no larger than 10 MB.")
  let raw: unknown
  try { raw = JSON.parse(text) } catch { throw new Error("This file is not valid JSON.") }
  const parsed = briefSchema.safeParse(raw)
  if (!parsed.success) {
    const issue = parsed.error.issues[0]
    throw new Error(`Use a version 1 Gridlock coordination brief. ${issue.path.join(".") || "Brief"}: ${issue.message}`)
  }
  const brief = parsed.data
  if (brief.mode !== mode) throw new Error(`This is a ${brief.mode === "demo" ? "demo" : "source"} brief. Switch to the matching collection before restoring it.`)
  const records: SavedOpportunity[] = []
  const rejected: RejectedBriefRecord[] = []
  const seen = new Set<string>()
  for (const [index, candidate] of brief.opportunities.entries()) {
    const fields = candidate && typeof candidate === "object" ? candidate as Record<string, unknown> : null
    const id = typeof fields?.id === "string" ? fields.id : null
    if ((fields?.mode === "real" || fields?.mode === "demo") && fields.mode !== brief.mode) {
      throw new Error("This brief mixes source and demo findings. Restore a brief containing only one collection.")
    }
    if (id !== null) {
      if (seen.has(id)) throw new Error(`This brief repeats pair ID ${id}. Each finding must appear only once.`)
      seen.add(id)
    }
    const result = savedOpportunitySchema.safeParse(candidate)
    if (!result.success) {
      const issue = result.error.issues[0]
      rejected.push({ position: index + 1, id, reason: `${issue.path.join(".") || "Saved finding"}: ${issue.message}` })
      continue
    }
    // The saved schema strips export-only context/results. Inputs remain authoritative.
    records.push(result.data)
  }
  return { mode: brief.mode, exportedAt: brief.exportedAt, records, rejected }
}

export function previewRestore(brief: ParsedBrief, records: SavedOpportunity[], dirtyIds: ReadonlySet<string>): RestorePreview {
  if (records.some(record => record.mode !== brief.mode)) throw new Error("Restore findings into their matching source or demo collection.")
  const existing = new Map(records.map(record => [record.id, record]))
  const preview: RestorePreview = { additions: [], duplicates: [], blockedAdditions: [], rejected: brief.rejected }
  for (const incoming of brief.records) {
    const previous = existing.get(incoming.id)
    if (previous) preview.duplicates.push({ incoming, existing: previous, dirty: dirtyIds.has(incoming.id) })
    else if (dirtyIds.has(incoming.id)) preview.blockedAdditions.push(incoming)
    else preview.additions.push(incoming)
  }
  return preview
}

export function mergeRestored(records: SavedOpportunity[], brief: ParsedBrief, replacementIds: ReadonlySet<string>, dirtyIds: ReadonlySet<string>): SavedOpportunity[] {
  const preview = previewRestore(brief, records, dirtyIds)
  const replacements = new Map(preview.duplicates
    .filter(({ incoming, dirty }) => !dirty && replacementIds.has(incoming.id))
    .map(({ incoming }) => [incoming.id, incoming]))
  return [
    ...records.map(record => replacements.has(record.id) ? structuredClone(replacements.get(record.id)!) : record),
    ...preview.additions.map(record => structuredClone(record)),
  ]
}
