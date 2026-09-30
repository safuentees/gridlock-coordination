import { z } from "zod"
import { inventorySchema } from "@/domain/coverage"
import { projectSchema, type Dataset, type Project } from "@/domain/schema"
import { parseSourceDataset } from "./import"
import proposalsJson from "./evidence/f27-owner-proposals.json"

const proposalSchema = z.object({
  decisionId: z.string(), projectId: z.string(), expected: projectSchema,
  owner: inventorySchema.shape.owner.unwrap(), caveat: z.string(), limitations: z.array(z.string()),
})
const proposals = z.object({ version: z.literal(1), proposals: z.array(proposalSchema) }).parse(proposalsJson).proposals
export type OwnerProposal = z.infer<typeof proposalSchema>

function canonical(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonical)
  if (value !== null && typeof value === "object") return Object.fromEntries(
    Object.entries(value).sort(([left], [right]) => left < right ? -1 : left > right ? 1 : 0).map(([key, item]) => [key, canonical(item)]),
  )
  return value
}

function matches(project: Project, proposal: OwnerProposal) {
  // Every source/evidence field must still match. Analyst notes are allowed and retained.
  return project.id === proposal.projectId && project.inventory?.owner === null
    && JSON.stringify(canonical({ ...project, notes: [] })) === JSON.stringify(canonical({ ...proposal.expected, notes: [] }))
}

/** Suggestions are explicit local revisions, never silent changes to the bundled inventory. */
export function getOwnerProposals(dataset: Dataset): OwnerProposal[] {
  if (dataset.mode !== "real") return []
  return proposals.filter(proposal => dataset.projects.some(project => matches(project, proposal)))
}

export function createOwnerRevision(dataset: Dataset, decisionId: string, generatedAt = new Date().toISOString()): Dataset {
  if (dataset.mode !== "real") throw new Error("Switch to source data to apply ownership evidence. Demo records stay separate.")
  const proposal = proposals.find(item => item.decisionId === decisionId)
  const original = proposal && dataset.projects.find(project => matches(project, proposal))
  if (!proposal || !original?.inventory) throw new Error("The project evidence has changed or this proposal is no longer available. Review the current record before applying ownership evidence.")
  const next = projectSchema.parse({
    ...original, inventory: { ...original.inventory, owner: proposal.owner },
    notes: [...original.notes, ...[proposal.caveat, ...proposal.limitations].filter(note => !original.notes.includes(note))],
  })
  return parseSourceDataset(JSON.stringify({
    ...dataset, generatedAt,
    projects: dataset.projects.map(project => project.id === original.id ? next : project),
  }))
}
