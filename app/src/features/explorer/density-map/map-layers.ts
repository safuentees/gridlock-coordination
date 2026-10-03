import type { Color, LayersList } from "@deck.gl/core"
import { PathLayer, ScatterplotLayer } from "@deck.gl/layers"
import { PathStyleExtension, type PathStyleExtensionProps } from "@deck.gl/extensions"
import type { LocatedMapProject, MapConnection } from "../map-view"
import { mapReportingGroupColor } from "../map-colors"

const dashedPaths = new PathStyleExtension({ dash: true })

export function projectLayers({ projects, connections, focusIds, candidateIds, selectedPair, pointOpacity = 1, approximateIds, onProject, onOpportunity }: {
  projects: LocatedMapProject[]
  connections: MapConnection[]
  focusIds: readonly string[]
  candidateIds: ReadonlySet<string>
  selectedPair: boolean
  pointOpacity?: number
  approximateIds?: ReadonlySet<string>
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
      getFillColor: (project): Color => [...mapReportingGroupColor(project.utilityId).rgb, approximateIds?.has(project.id) ? 0 : 217],
      stroked: true,
      lineWidthUnits: "pixels",
      getLineColor: (project): Color => focusIds.includes(project.id) || candidateIds.has(project.id) ? [23, 23, 23, 255] : [...mapReportingGroupColor(project.utilityId).rgb, 217],
      getLineWidth: (project) => focusIds.includes(project.id) ? 3 : candidateIds.has(project.id) || approximateIds?.has(project.id) ? 2 : 1,
      updateTriggers: { getFillColor: [approximateIds], getRadius: [focusIds], getLineColor: [focusIds, candidateIds], getLineWidth: [focusIds, candidateIds, approximateIds] },
      pickable: isSelected || opacity > 0.05,
      onClick: ({ object }) => { if (object) onProject(object.id) },
      parameters: { depthWriteEnabled: false, depthCompare: "always" },
    })),
  ]
}
