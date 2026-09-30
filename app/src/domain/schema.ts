import { z } from "zod"
import { dateSchema, inventorySchema, sourceEditionSchema, sourceKeySchema, sourceSchema } from "./coverage"

export { sourceSchema } from "./coverage"
export const projectSchema = z.object({
  id: z.string().min(1), utilityId: sourceKeySchema,
  sponsor: z.string().nullable(), sourceId: z.string().nullable(),
  name: z.string().min(1), description: z.string(), status: z.string().nullable(),
  voltageKv: z.array(z.number().positive()),
  date: dateSchema,
  buildWindow: z.object({ start: z.iso.date(), end: z.iso.date() }).refine(window => window.start <= window.end, "Construction window must end on or after its start").nullable(),
  location: z.object({
    lat: z.number().min(-90).max(90), lon: z.number().min(-180).max(180),
    method: z.enum(["endpoint-midpoint", "single-endpoint", "source-point"]),
    confidence: z.enum(["confirmed", "unverified"]), evidence: z.array(sourceSchema),
  }).nullable(),
  sources: z.array(sourceSchema).min(1), notes: z.array(z.string()),
  inventory: inventorySchema.optional(),
}).superRefine((project, ctx) => {
  if (!project.inventory && !["desc", "gpc"].includes(project.utilityId)) ctx.addIssue({ code: "custom", path: ["inventory"], message: "New reporting groups require source-qualified inventory metadata" })
  if (project.inventory && (!project.sourceId || project.id !== `${project.inventory.sourceKey}:${project.sourceId}`)) ctx.addIssue({ code: "custom", path: ["id"], message: "Inventory identity must use sourceKey:nativeId independently of edition" })
  if (project.inventory && !project.location && project.inventory.centerRole !== "unknown") ctx.addIssue({ code: "custom", path: ["inventory", "centerRole"], message: "An unresolved center must retain unknown role" })
})
export const datasetSchema = z.object({
  schemaVersion: z.union([z.literal(1), z.literal(2)]), mode: z.enum(["demo", "real"]), title: z.string(),
  generatedAt: z.string(), projects: z.array(projectSchema),
  sourceEditions: z.array(sourceEditionSchema).optional(),
  coverage: z.object({ processed: z.number().int().nonnegative(), skipped: z.number().int().nonnegative(), failed: z.number().int().nonnegative(), notes: z.array(z.string()) }),
}).superRefine((dataset, ctx) => {
  const ids = new Set<string>()
  const editions = new Map((dataset.sourceEditions ?? []).map(edition => [`${edition.sourceKey}:${edition.editionId}`, edition]))
  if (editions.size !== (dataset.sourceEditions?.length ?? 0)) ctx.addIssue({ code: "custom", path: ["sourceEditions"], message: "Source editions must be unique" })
  if (dataset.schemaVersion === 2 && !editions.size) ctx.addIssue({ code: "custom", path: ["sourceEditions"], message: "Version 2 requires source edition manifests" })
  if (dataset.schemaVersion === 1 && (editions.size || dataset.projects.some(project => project.inventory))) ctx.addIssue({ code: "custom", path: ["schemaVersion"], message: "Source-qualified inventory requires version 2" })
  dataset.projects.forEach((project, index) => {
    if (ids.has(project.id)) ctx.addIssue({ code: "custom", message: "Project IDs must be unique", path: ["projects", index, "id"] })
    ids.add(project.id)
    if (project.inventory) {
      const edition = editions.get(`${project.inventory.sourceKey}:${project.inventory.editionId}`)
      if (!edition || edition.reportingGroupId !== project.utilityId || edition.reportingGroupName !== project.inventory.reportingGroupName) ctx.addIssue({ code: "custom", path: ["projects", index, "inventory"], message: "Inventory must reference its matching source edition and reporting group" })
    }
  })
})
export type SourceRef = z.infer<typeof sourceSchema>
export type Project = z.infer<typeof projectSchema>
export type Dataset = z.infer<typeof datasetSchema>
export type DataMode = Dataset["mode"]
export const UTILITIES = { desc: "Dominion Energy South Carolina", gpc: "Georgia Power filing" } as const
export interface AnalysisOptions { radiusMiles: number; maxDateGapDays: number | null; includeUnverified: boolean }
export const DEFAULT_OPTIONS: AnalysisOptions = { radiusMiles: 25, maxDateGapDays: null, includeUnverified: true }
export interface Opportunity {
  id: string; projectIds: [string, string]; distanceMiles: number; dateGapDays: number | null;
  timelineRelation: "confirmed-overlap" | "date-proximity" | "separate" | "unknown";
  locationConfidence: "confirmed" | "unverified"; rank: number; reasons: string[];
}
export interface AnalysisResult {
  opportunities: Opportunity[];
  summary: { totalProjects: number; locatedProjects: number; unlocatedProjects: number; comparedPairs: number; excludedUnverified: number; eligibleProjects: number; excludedByEligibility: number };
}
export interface ImpactInputs { sharedLengthMiles: number; corridorWidthFeet: number; costPerAcreUsd: number; shareFraction: number }
export interface ImpactResult { sharedAcres: number; indicativeSavingsUsd: number; assumptions: string[] }
