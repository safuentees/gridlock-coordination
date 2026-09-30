import { z } from "zod"

export const sourceSchema = z.object({
  file: z.string(), locator: z.string(), url: z.string().nullable(),
})
export const projectSchema = z.object({
  id: z.string().min(1), utilityId: z.enum(["desc", "gpc"]),
  sponsor: z.string().nullable(), sourceId: z.string().nullable(),
  name: z.string().min(1), description: z.string(), status: z.string().nullable(),
  voltageKv: z.array(z.number().positive()),
  date: z.object({ value: z.string().nullable(), precision: z.enum(["day", "month", "year", "unknown"]), kind: z.enum(["in-service", "need", "unknown"]), label: z.string() }),
  buildWindow: z.object({ start: z.string(), end: z.string() }).nullable(),
  location: z.object({
    lat: z.number().min(-90).max(90), lon: z.number().min(-180).max(180),
    method: z.enum(["endpoint-midpoint", "single-endpoint", "source-point"]),
    confidence: z.enum(["confirmed", "unverified"]), evidence: z.array(sourceSchema),
  }).nullable(),
  sources: z.array(sourceSchema).min(1), notes: z.array(z.string()),
})
export const datasetSchema = z.object({
  schemaVersion: z.literal(1), mode: z.enum(["demo", "real"]), title: z.string(),
  generatedAt: z.string(), projects: z.array(projectSchema),
  coverage: z.object({ processed: z.number().int().nonnegative(), skipped: z.number().int().nonnegative(), failed: z.number().int().nonnegative(), notes: z.array(z.string()) }),
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
  summary: { totalProjects: number; locatedProjects: number; unlocatedProjects: number; comparedPairs: number; excludedUnverified: number };
}
export interface ImpactInputs { sharedLengthMiles: number; corridorWidthFeet: number; costPerAcreUsd: number; shareFraction: number }
export interface ImpactResult { sharedAcres: number; indicativeSavingsUsd: number; assumptions: string[] }
