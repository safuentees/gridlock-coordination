import type { LatLngTuple } from "leaflet"
import type { Opportunity, Project } from "@/domain/schema"

export function getMapLocations(projects: readonly Project[], focusIds?: readonly string[]): LatLngTuple[] {
  return projects.flatMap((project): LatLngTuple[] => {
    if (!project.location || (focusIds && !focusIds.includes(project.id))) return []
    return [[project.location.lat, project.location.lon]]
  })
}

interface MapConnection { opportunity: Opportunity; positions: [LatLngTuple, LatLngTuple] }

export function getMapConnections(
  projectsById: ReadonlyMap<string, Project>,
  opportunities: readonly Opportunity[],
  selectedOpportunity: Opportunity | null,
  showBackground: boolean,
): MapConnection[] {
  // Retain the existing first-100 cap and selected-pair-only behavior.
  const candidates = selectedOpportunity ? [selectedOpportunity] : showBackground ? opportunities.slice(0, 100) : []
  return candidates.flatMap((opportunity): MapConnection[] => {
    const left = projectsById.get(opportunity.projectIds[0])?.location
    const right = projectsById.get(opportunity.projectIds[1])?.location
    if (!left || !right) return []
    return [{ opportunity, positions: [[left.lat, left.lon], [right.lat, right.lon]] }]
  })
}
