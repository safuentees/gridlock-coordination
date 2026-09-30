import { z } from "zod"
import { projectSchema, type AnalysisOptions, type DataMode, type Dataset, type Opportunity, type Project } from "@/domain/schema"

export const REVIEW_STATES = ["Unreviewed", "Investigating", "Ready for discussion", "Dismissed"] as const
const savedOpportunitySchema = z.object({
  id: z.string().min(1), mode: z.enum(["real", "demo"]),
  dataset: z.object({ title: z.string(), generatedAt: z.string(), schemaVersion: z.literal(1) }),
  savedAt: z.iso.datetime(), updatedAt: z.iso.datetime(),
  reviewState: z.enum(REVIEW_STATES), notes: z.string(),
  options: z.object({ radiusMiles: z.number().finite().positive(), maxDateGapDays: z.number().finite().nonnegative().nullable(), includeUnverified: z.boolean() }),
  opportunity: z.object({
    id: z.string(), projectIds: z.tuple([z.string(), z.string()]), distanceMiles: z.number().finite().nonnegative(), dateGapDays: z.number().finite().nonnegative().nullable(),
    timelineRelation: z.enum(["confirmed-overlap", "date-proximity", "separate", "unknown"]), locationConfidence: z.enum(["confirmed", "unverified"]), rank: z.number().int().positive(), reasons: z.array(z.string()),
  }),
  projects: z.tuple([projectSchema, projectSchema]),
}).refine((record) => record.id === record.opportunity.id && record.projects.every((project, index) => project.id === record.opportunity.projectIds[index]), "Saved evidence must match its pair identity")
const savedStoreSchema = z.object({ version: z.literal(1), records: z.array(savedOpportunitySchema) }).refine((store) => new Set(store.records.map((record) => record.id)).size === store.records.length, "Saved pair identities must be unique")
export type SavedOpportunity = z.infer<typeof savedOpportunitySchema>
export type ReviewState = SavedOpportunity["reviewState"]
export type SavedStore = { records: SavedOpportunity[]; error: string | null; writeBlocked: boolean }
const keyFor = (mode: DataMode) => `gridlock.saved-opportunities.v1.${mode}`

export function readSaved(mode: DataMode): SavedStore {
  try {
    const raw = localStorage.getItem(keyFor(mode))
    if (raw === null) return { records: [], error: null, writeBlocked: false }
    const parsed = savedStoreSchema.parse(JSON.parse(raw))
    if (parsed.records.some((record) => record.mode !== mode)) throw new Error("Saved mode does not match its namespace")
    return { records: parsed.records, error: null, writeBlocked: false }
  } catch {
    return { records: [], error: "Existing saved data could not be loaded. It has been preserved; new edits will remain in this tab. Export your selected records to keep them.", writeBlocked: true }
  }
}
export function writeSaved(mode: DataMode, records: SavedOpportunity[], writeBlocked: boolean): string | null {
  if (writeBlocked) return "Existing saved data could not be loaded. New edits remain in this tab; export your selected records to keep them."
  try {
    localStorage.setItem(keyFor(mode), JSON.stringify({ version: 1, records }))
    return null
  } catch {
    return "Local storage is unavailable or full. Changes remain in this tab; export your selected records to keep them."
  }
}
export function snapshotOpportunity(dataset: Dataset, opportunity: Opportunity, options: AnalysisOptions, previous?: SavedOpportunity): SavedOpportunity {
  const projects = opportunity.projectIds.map((id) => dataset.projects.find((project) => project.id === id))
  if (!projects[0] || !projects[1]) throw new Error("Both projects must be available to save their evidence.")
  const now = new Date().toISOString()
  return {
    id: opportunity.id, mode: dataset.mode, dataset: { title: dataset.title, generatedAt: dataset.generatedAt, schemaVersion: dataset.schemaVersion },
    savedAt: previous?.savedAt ?? now, updatedAt: now,
    reviewState: previous?.reviewState ?? "Unreviewed", notes: previous?.notes ?? "",
    options: { ...options }, opportunity: structuredClone(opportunity), projects: structuredClone([projects[0], projects[1]]) as [Project, Project],
  }
}
export function savedAvailability(record: SavedOpportunity, currentProjects: Map<string, Project>, activePairIds: Set<string>) {
  const current = record.projects.map((project) => currentProjects.get(project.id))
  const missing = current.filter((project) => project === undefined).length
  if (missing) return `${missing} project${missing === 1 ? "" : "s"} unavailable in current dataset`
  if (current.some((project, index) => JSON.stringify(project) !== JSON.stringify(record.projects[index]))) return "Source records changed; showing saved evidence"
  return activePairIds.has(record.id) ? "Matches current scenario" : "Outside current scenario; saved evidence retained"
}
