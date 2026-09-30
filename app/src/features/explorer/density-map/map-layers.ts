import type { Color, LayersList } from "@deck.gl/core"
import { PathLayer, ScatterplotLayer } from "@deck.gl/layers"
import { PathStyleExtension, type PathStyleExtensionProps } from "@deck.gl/extensions"
import type { LocatedMapProject, MapConnection } from "../map-view"

const filingColors: Record<LocatedMapProject["utilityId"], Color> = {
  desc: [37, 99, 235, 217], gpc: [180, 83, 9, 217],
}
const dashedPaths = new PathStyleExtension({ dash: true })

export function projectLayers({ projects, connections, focusIds, candidateIds, selectedPair, pointOpacity = 1, onProject, onOpportunity }: {
  projects: LocatedMapProject[]
  connections: MapConnection[]
  focusIds: readonly string[]
  candidateIds: ReadonlySet<string>
  selectedPair: boolean
  pointOpacity?: number
  onProject: (id: string) => void
  onOpportunity: (id: string) => void
}): LayersList {
  const selected = new Set(focusIds)
  const opacity = Math.max(0, Math.min(1, pointOpacity))
  const connectionOpacity = selectedPair ? 1 : opacity
  return [
    new PathLayer<MapConnection, PathStyleExtensionProps<MapConnection>>({
      id: "project-connections",
      data: connections,
      getPath: (connection) => connection.positions.map(([lat, lon]): [number, number] => [lon, lat]),
      getColor: [82, 82, 82, selectedPair ? 230 : 77],
      getWidth: selectedPair ? 3 : 1.5,
      widthUnits: "pixels",
      extensions: [dashedPaths],
      getDashArray: [5, 5],
      dashUnits: "pixels",
      dashGapPickable: true,
      opacity: connectionOpacity,
      visible: connectionOpacity > 0,
      pickable: connectionOpacity > 0.05,
      onClick: ({ object }) => { if (object) onOpportunity(object.opportunity.id) },
      parameters: { depthWriteEnabled: false, depthCompare: "always" },
    }),
    // Separate disjoint point sets keep the selected anchors visible at every scale.
    ...[false, true].map((isSelected) => new ScatterplotLayer<LocatedMapProject>({
      id: isSelected ? "selected-project-locations" : "project-locations",
      data: projects.filter((project) => selected.has(project.id) === isSelected),
      opacity: isSelected ? 1 : opacity,
      visible: isSelected || opacity > 0,
      getPosition: (project) => [project.location.lon, project.location.lat],
      radiusUnits: "pixels",
      getRadius: (project) => focusIds.includes(project.id) ? 8 : 5,
      getFillColor: (project) => filingColors[project.utilityId],
      stroked: true,
      lineWidthUnits: "pixels",
      getLineColor: (project) => focusIds.includes(project.id) || candidateIds.has(project.id) ? [23, 23, 23, 255] : filingColors[project.utilityId],
      getLineWidth: (project) => focusIds.includes(project.id) ? 3 : candidateIds.has(project.id) ? 2 : 1,
      updateTriggers: { getRadius: [focusIds], getLineColor: [focusIds, candidateIds], getLineWidth: [focusIds, candidateIds] },
      pickable: isSelected || opacity > 0.05,
      onClick: ({ object }) => { if (object) onProject(object.id) },
      parameters: { depthWriteEnabled: false, depthCompare: "always" },
    })),
  ]
}
