import type { Color, LayersList, PickingInfo } from "@deck.gl/core"
import { QuadkeyLayer } from "@deck.gl/geo-layers"
import { PolygonLayer, ScatterplotLayer } from "@deck.gl/layers"
import type { DensityCell, DensityPoint } from "./hierarchy"
import { DENSITY_PALETTE, DENSITY_MATERIAL, DENSITY_DISPLAY_HEIGHT_MAX_METERS } from "./density-style"

// Fixed logarithmic scale in locations per 1,000 km², shared across every level/source.
export const DENSITY_SCALE_MAX = 10_000
function unit(value: number): number { return Number.isFinite(value) ? Math.max(0, Math.min(1, value)) : 0 }
function strength(density: number): number { return unit(Math.log1p(Math.max(0, density)) / Math.log1p(DENSITY_SCALE_MAX)) }

function fillColor(cell: DensityCell): Color {
  const t = strength(cell.density)
  const [low, middle, high] = DENSITY_PALETTE
  const from = t < 0.5 ? low : middle
  const to = t < 0.5 ? middle : high
  const blend = t < 0.5 ? t * 2 : (t - 0.5) * 2
  return [from[0] + (to[0] - from[0]) * blend, from[1] + (to[1] - from[1]) * blend, from[2] + (to[2] - from[2]) * blend, 230 * Math.sqrt(t)]
}

function rectangle(cell: DensityCell): [number, number][] {
  const [west, south, east, north] = cell.bounds
  return [[west, south], [east, south], [east, north], [west, north], [west, south]]
}

export function densityLayers({ cells, columns, opacity, entranceProgress = 1, onCell }: {
  cells: DensityCell[]
  columns: boolean
  opacity: number
  entranceProgress?: number
  onCell: (cell: DensityCell) => void
}): LayersList {
  const alpha = unit(opacity)
  const common = {
    data: cells,
    // An imperceptible positive floor avoids alpha-zero shader discard during picking.
    // Visibility and pickability depend only on the existing zoom opacity.
    opacity: alpha * Math.max(0.000001, unit(entranceProgress)),
    elevationScale: columns ? unit(entranceProgress) : 1,
    visible: alpha > 0,
    filled: true,
    stroked: false,
    wireframe: false,
    material: columns ? DENSITY_MATERIAL : false,
    getFillColor: fillColor,
    getElevation: (cell: DensityCell) => DENSITY_DISPLAY_HEIGHT_MAX_METERS * strength(cell.density),
    pickable: alpha > 0.05,
    onClick: ({ object }: PickingInfo<DensityCell>) => {
      if (!object || !(object.density > 0)) return false
      onCell(object)
      return true
    },
    parameters: { depthWriteEnabled: columns },
  }
  // QuadkeyLayer 9.4 shrinks extruded footprints to 99%. Use exact tilebelt bounds
  // for columns so subdivision creates neither gutters nor overlapping parents.
  // No strokes/time transitions: inherited child values match the parent.
  // Flat cells remain unlit; raised faces use the shared density material.
  return columns
    ? [new PolygonLayer<DensityCell>({ ...common, id: "density-columns", extruded: true, getPolygon: rectangle })]
    : [new QuadkeyLayer<DensityCell>({ ...common, id: "density-cells", extruded: false, getQuadkey: (cell) => cell.quadkey })]
}

export function syntheticPointLayer(points: readonly DensityPoint[], opacity: number): ScatterplotLayer<DensityPoint> {
  const alpha = unit(opacity)
  return new ScatterplotLayer<DensityPoint>({
    id: "density-synthetic-points",
    data: points,
    opacity: alpha,
    visible: alpha > 0,
    getPosition: (point) => point.position,
    radiusUnits: "pixels",
    getRadius: 3,
    filled: true,
    stroked: false,
    billboard: true,
    getFillColor: [76, 29, 149, 220],
    pickable: alpha > 0.05, // Hover only; no project/opportunity callbacks exist here.
    parameters: { depthWriteEnabled: false, depthCompare: "always" },
  })
}
