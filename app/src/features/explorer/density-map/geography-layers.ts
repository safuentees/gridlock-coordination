import type { Color, LayersList } from "@deck.gl/core"
import { PathLayer, PolygonLayer, ScatterplotLayer } from "@deck.gl/layers"
import { PathStyleExtension, type PathStyleExtensionProps } from "@deck.gl/extensions"
import { geographyAreaProject, geographyAreaRing, type GeographyArea, type GeographyPoint, type MapGeography } from "../geography-map"
import { mapReportingGroupColor } from "../map-colors"

const dashedExtents = new PathStyleExtension({ dash: true })
export function geographyLayers(geography: MapGeography, focusIds: readonly string[], onProject: (id: string) => void): LayersList {
  const selectedArea = (area: GeographyArea) => area.members.some(member => focusIds.includes(member.project.id))
  return [
    new PolygonLayer<GeographyArea>({
      id: "geographic-area-fill", data: geography.areas,
      getPolygon: geographyAreaRing, stroked: false, filled: true,
      getFillColor: (area): Color => [100, 116, 139, selectedArea(area) ? 20 : 6],
      updateTriggers: { getFillColor: [focusIds] },
      pickable: true, onClick: ({ object }) => { if (object) onProject(geographyAreaProject(object, focusIds)) },
      parameters: { depthWriteEnabled: false, depthCompare: "always" },
    }),
    new PathLayer<GeographyArea, PathStyleExtensionProps<GeographyArea>>({
      id: "geographic-area-bounds", data: geography.areas,
      getPath: geographyAreaRing,
      getColor: (area): Color => selectedArea(area) ? [23, 23, 23, 255] : [100, 116, 139, 220],
      getWidth: (area) => selectedArea(area) ? 3 : 1.5, widthUnits: "pixels",
      extensions: [dashedExtents], getDashArray: [6, 4], dashUnits: "pixels", dashGapPickable: true,
      updateTriggers: { getColor: [focusIds], getWidth: [focusIds] },
      pickable: true, onClick: ({ object }) => { if (object) onProject(geographyAreaProject(object, focusIds)) },
      parameters: { depthWriteEnabled: false, depthCompare: "always" },
    }),
    new ScatterplotLayer<GeographyPoint>({
      id: "geographic-evidence-points", data: geography.points,
      getPosition: point => point.position, radiusUnits: "pixels",
      getRadius: point => focusIds.includes(point.project.id) ? 8 : 5,
      filled: false, stroked: true, lineWidthUnits: "pixels",
      getLineColor: (point): Color => focusIds.includes(point.project.id) ? [23, 23, 23, 255] : [...mapReportingGroupColor(point.project.utilityId).rgb, 255],
      getLineWidth: point => focusIds.includes(point.project.id) ? 3 : 2,
      updateTriggers: { getRadius: [focusIds], getLineColor: [focusIds], getLineWidth: [focusIds] },
      pickable: true, onClick: ({ object }) => { if (object) onProject(object.project.id) },
      parameters: { depthWriteEnabled: false, depthCompare: "always" },
    }),
  ]
}
