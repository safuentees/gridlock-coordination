import { z } from "zod"
import type { Dataset, Project } from "@/domain/schema"
import proposalsJson from "./evidence/f19-location-proposals.json"
import decisionsJson from "./evidence/f19-location-decisions.json"

const proposalSchema = z.object({
  decisionId: z.string(), projectId: z.string(), sourceId: z.string(), expectedCurrentLocation: z.null(), caveat: z.string(),
  draft: z.object({
    latitude: z.string(), longitude: z.string(), method: z.enum(["source-point", "single-endpoint", "endpoint-midpoint"]),
    sourceFile: z.string(), sourceLocator: z.string(), sourceUrl: z.url(),
  }),
})
const proposals = z.object({ version: z.literal(1), proposals: z.array(proposalSchema) }).parse(proposalsJson).proposals

/** A suggestion is applicable only to the exact native identity and still-missing location. */
export function getLocationProposals(dataset: Dataset) {
  if (dataset.mode !== "real") return []
  return proposals.filter(proposal => dataset.projects.some(project =>
    project.id === proposal.projectId && project.sourceId === proposal.sourceId && project.location === proposal.expectedCurrentLocation))
}

export function getLocationResearchHint(dataset: Dataset, project: Project) {
  if (dataset.mode !== "real" || project.location !== null || !project.sourceId) return null
  return decisionsJson.decisions.find(decision => decision.decision === "unresolved"
    && decision.projectId === project.id && decision.sourceIdentity.startsWith(`${project.sourceId}:`)) ?? null
}
