import { z } from "zod"
import { nativeGeometrySchema } from "@/domain/coverage"
import { projectSchema, sourceSchema, type Dataset, type Project } from "@/domain/schema"
import { matchesEvidenceBaseline } from "./evidence-baseline"
import { parseSourceDataset } from "./import"
import proposalsJson from "./evidence/f27-map-location-proposals.json"

const expectedSchema = projectSchema.refine(project => project.location === null && project.inventory?.nativeGeometry === null,
  "Map evidence requires a baseline with no location or native geometry")
const proposalSchema = z.object({
  decisionId: z.string().min(1), projectId: z.string().min(1), expected: expectedSchema,
  location: projectSchema.shape.location.unwrap().refine(location => location.method === "source-point" && location.confidence === "unverified" && location.evidence.length > 0,
    "Accepted yard locations must be cited, unverified source points"),
  nativeGeometry: nativeGeometrySchema.refine(geometry => geometry.type === "Point" && geometry.role === "general-pin",
    "Accepted native geometry must remain a general pin"),
  centerRole: z.literal("general-pin"), locationAssumptions: z.array(z.string()),
  caveat: z.string().min(1), limitations: z.array(z.string()),
}).refine(proposal => proposal.expected.id === proposal.projectId, "Proposal identity must match its source baseline")
  .refine(proposal => proposal.nativeGeometry.coordinates[0][0] === proposal.location.lon && proposal.nativeGeometry.coordinates[0][1] === proposal.location.lat,
    "The displayed pin must retain the exact native position")
const hintSchema = z.object({
  projectId: z.string().min(1), expected: expectedSchema, reason: z.string().min(1), needed: z.string().min(1),
  evidence: z.array(sourceSchema).min(1),
}).refine(hint => hint.expected.id === hint.projectId, "Research hint identity must match its source baseline")
const { proposals, unresolved } = z.object({
  version: z.literal(1), proposals: z.array(proposalSchema), unresolved: z.array(hintSchema),
}).parse(proposalsJson)

export type MapLocationProposal = z.infer<typeof proposalSchema>
export type MapLocationResearchHint = z.infer<typeof hintSchema>

function matches(project: Project, expected: Project): boolean {
  return project.id === expected.id && project.location === null && project.inventory?.nativeGeometry === null
    && matchesEvidenceBaseline(project, expected)
}

/** Explicit map-context revisions only; these general pins cannot qualify a comparison. */
export function getMapLocationProposals(dataset: Dataset): MapLocationProposal[] {
  if (dataset.mode !== "real") return []
  return proposals.filter(proposal => dataset.projects.some(project => matches(project, proposal.expected)))
}

export function getMapLocationResearchHint(dataset: Dataset, project: Project): MapLocationResearchHint | null {
  if (dataset.mode !== "real") return null
  const current = dataset.projects.find(item => item.id === project.id)
  if (!current) return null
  return unresolved.find(hint => matches(project, hint.expected) && matches(current, hint.expected)) ?? null
}

function appendUnique(original: string[], additions: string[]): string[] {
  const seen = new Set(original)
  return [...original, ...additions.filter(value => {
    if (seen.has(value)) return false
    seen.add(value)
    return true
  })]
}

export function createMapLocationRevision(dataset: Dataset, decisionId: string, generatedAt = new Date().toISOString()): Dataset {
  if (dataset.mode !== "real") throw new Error("Switch to source data to apply map location evidence. Demo records stay separate.")
  const proposal = proposals.find(item => item.decisionId === decisionId)
  if (!proposal) throw new Error("This map location proposal is not available. Choose a current suggestion.")
  const original = dataset.projects.find(project => matches(project, proposal.expected))
  if (!original?.inventory) throw new Error("The project evidence has changed or a location is already present. Review the current record before applying map location evidence.")
  const next = projectSchema.parse({
    ...original,
    location: proposal.location,
    inventory: {
      ...original.inventory,
      nativeGeometry: proposal.nativeGeometry,
      centerRole: proposal.centerRole,
      locationAssumptions: appendUnique(original.inventory.locationAssumptions, proposal.locationAssumptions),
    },
    notes: appendUnique(original.notes, [proposal.caveat, ...proposal.limitations]),
  })
  return parseSourceDataset(JSON.stringify({
    ...dataset, generatedAt,
    projects: dataset.projects.map(project => project.id === original.id ? next : project),
  }))
}
