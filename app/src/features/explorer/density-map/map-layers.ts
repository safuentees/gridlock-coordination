import type { Color, LayersList } from "@deck.gl/core"
import { PathLayer, ScatterplotLayer } from "@deck.gl/layers"
import { PathStyleExtension, type PathStyleExtensionProps } from "@deck.gl/extensions"
import type { LocatedMapProject, MapConnection } from "../map-view"

const filingColors: Record<LocatedMapProject["utilityId"], Color> = {
  desc: [37, 99, 235, 217], gpc: [180, 83, 9, 217],
}
const dashedPaths = new PathStyleExtension({ dash: true })

export function projectLayers({ projects, connections, focusIds, candidateIds, selectedPair, onProject, onOpportunity }: {
  projects: LocatedMapProject[]
  connections: MapConnection[]
  focusIds: readonly string[]
  candidateIds: ReadonlySet<string>
  selectedPair: boolean
  onProject: (id: string) => void
  onOpportunity: (id: string) => void
}): LayersList {
  return [
    new PathLayer<MapConnection, PathStyleExtensionProps<MapConnection>>({
      id: "project-connections",
      data: connections,
      getPath: (connection) => connection.positions.map(([lat, lon]) => [lon, lat]),
      getColor: [82, 82, 82, selectedPair ? 230 : 77],
      getWidth: selectedPair ? 3 : 1.5,
      widthUnits: "pixels",
      extensions: [dashedPaths],
      getDashArray: [5, 5],
      dashUnits: "pixels",
      dashGapPickable: true,
      pickable: true,
      onClick: ({ object }) => { if (object) onOpportunity(object.opportunity.id) },
      parameters: { depthWriteEnabled: false },
    }),
    new ScatterplotLayer<LocatedMapProject>({
      id: "project-locations",
      data: projects,
      getPosition: (project) => [project.location.lon, project.location.lat],
      radiusUnits: "pixels",
      getRadius: (project) => focusIds.includes(project.id) ? 8 : 5,
      getFillColor: (project) => filingColors[project.utilityId],
      stroked: true,
      lineWidthUnits: "pixels",
      getLineColor: (project) => focusIds.includes(project.id) || candidateIds.has(project.id) ? [23, 23, 23, 255] : filingColors[project.utilityId],
      getLineWidth: (project) => focusIds.includes(project.id) ? 3 : candidateIds.has(project.id) ? 2 : 1,
      updateTriggers: { getRadius: [focusIds], getLineColor: [focusIds, candidateIds], getLineWidth: [focusIds, candidateIds] },
      pickable: true,
      onClick: ({ object }) => { if (object) onProject(object.id) },
      parameters: { depthWriteEnabled: false },
    }),
  ]
}
