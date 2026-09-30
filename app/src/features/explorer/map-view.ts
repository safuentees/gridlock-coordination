import type { LatLngTuple } from "leaflet"
import type { Opportunity, Project } from "@/domain/schema"
import type { MapViewportInsets } from "./ProjectMap"

export function getMapLocations(projects: readonly Project[], focusIds?: readonly string[]): LatLngTuple[] {
  return projects.flatMap((project): LatLngTuple[] => {
    if (!project.location || (focusIds && !focusIds.includes(project.id))) return []
    return [[project.location.lat, project.location.lon]]
  })
}

export interface MapConnection { opportunity: Opportunity; positions: [LatLngTuple, LatLngTuple] }

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

// Internal renderer contract; the public ProjectMap input shape is unchanged.
export interface ProjectMapProps {
  visible: boolean
  projects: Project[]
  opportunities: Opportunity[]
  selectedProjectId: string | null
  selectedOpportunity: Opportunity | null
  onProject: (id: string) => void
  onOpportunity: (id: string) => void
  viewportInsets?: MapViewportInsets
}

export interface MapRendererControls {
  showConnections: boolean
  onShowConnections: (show: boolean) => void
  onChangeRenderer: () => void
}

export type LocatedMapProject = Project & { location: NonNullable<Project["location"]> }
export const MERCATOR_LATITUDE_LIMIT = 85.0511287798066
export const ZERO_INSETS: MapViewportInsets = { top: 0, right: 0, bottom: 0, left: 0 }

export function isMappableProject(project: Project): project is LocatedMapProject {
  return project.location !== null && Math.abs(project.location.lat) <= MERCATOR_LATITUDE_LIMIT
}

// Only pixel occlusion is bounded here. Geographic fitting belongs to the renderer.
export function boundedInsets(insets: MapViewportInsets, width: number, height: number): MapViewportInsets {
  const finite = (value: number) => Number.isFinite(value) ? Math.max(0, value) : 0
  function axis(start: number, end: number, size: number): [number, number] {
    const leading = finite(start)
    const trailing = finite(end)
    const maximum = Math.max(0, size - 1)
    const scale = leading + trailing > maximum ? maximum / (leading + trailing) : 1
    return [Math.floor(leading * scale), Math.floor(trailing * scale)]
  }
  const [left, right] = axis(insets.left, insets.right, width)
  const [top, bottom] = axis(insets.top, insets.bottom, height)
  return { left, right, top, bottom }
}
