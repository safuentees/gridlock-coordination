import { getChildren, pointToTile, quadkeyToTile, tileToBBOX, tileToGeoJSON, tileToQuadkey } from "@mapbox/tilebelt"
import { area } from "@turf/area"
import { MERCATOR_LATITUDE_LIMIT } from "../map-view"

export interface DensityPoint { id: string; position: [longitude: number, latitude: number] }
export type DensityBounds = [west: number, south: number, east: number, north: number]
export const DENSITY_MIN_DEPTH = 4
export const DENSITY_MAX_DEPTH = 14
interface CellGeometry { areaKm2: number; bounds: DensityBounds }
export interface DensityHierarchy {
  totalCount: number
  locatedCount: number
  excludedCount: number
  countsByDepth: ReadonlyMap<number, ReadonlyMap<string, number>>
  // Bounded by this input's occupied cells and immediate children; released with the input.
  geometryCache: Map<string, CellGeometry>
}
export interface DensityCell extends CellGeometry {
  quadkey: string
  parentQuadkey: string
  count: number // Observed integer count, never the interpolated mass.
  density: number // Displayed locations per 1,000 km².
  representedCount: number // Transition bookkeeping only; never a project-count label.
}
export interface DensityFrame {
  cells: DensityCell[]
  resolution: number
  cellDepth: number
  progress: number
  representedCount: number
}

export function smoothstep(value: number): number {
  const t = Number.isFinite(value) ? Math.min(1, Math.max(0, value)) : 0
  return t * t * (3 - 2 * t)
}

export function buildDensityHierarchy(points: readonly DensityPoint[]): DensityHierarchy {
  const countsByDepth = new Map<number, Map<string, number>>()
  let locatedCount = 0
  const tileCount = 2 ** DENSITY_MAX_DEPTH
  for (const { position: [longitude, latitude] } of points) {
    if (!Number.isFinite(longitude) || !Number.isFinite(latitude) || Math.abs(longitude) > 180 || Math.abs(latitude) > MERCATOR_LATITUDE_LIMIT) continue
    const tile = pointToTile(longitude, latitude, DENSITY_MAX_DEPTH)
    // Tilebelt floors indices: internal boundaries belong to the east/south cell;
    // +180 wraps to -180. Exact outer latitude edges belong to the first/last row.
    // Correct only edge-index roundoff; never move or clamp source coordinates.
    if (latitude === MERCATOR_LATITUDE_LIMIT) tile[1] = 0
    if (latitude === -MERCATOR_LATITUDE_LIMIT) tile[1] = tileCount - 1
    if (!Number.isInteger(tile[0]) || !Number.isInteger(tile[1]) || tile[0] < 0 || tile[0] >= tileCount || tile[1] < 0 || tile[1] >= tileCount) continue
    const leaf = tileToQuadkey(tile)
    locatedCount += 1
    for (let depth = DENSITY_MIN_DEPTH; depth <= DENSITY_MAX_DEPTH; depth += 1) {
      let counts = countsByDepth.get(depth)
      if (!counts) { counts = new Map(); countsByDepth.set(depth, counts) }
      const key = leaf.slice(0, depth)
      counts.set(key, (counts.get(key) ?? 0) + 1)
    }
  }
  return { totalCount: points.length, locatedCount, excludedCount: points.length - locatedCount, countsByDepth, geometryCache: new Map() }
}

function geometry(hierarchy: DensityHierarchy, quadkey: string): CellGeometry {
  const cached = hierarchy.geometryCache.get(quadkey)
  if (cached) return cached
  const tile = quadkeyToTile(quadkey)
  const [west, south, east, north] = tileToBBOX(tile)
  // Geographic spherical area, not projected metres or screen pixels.
  const areaKm2 = area(tileToGeoJSON(tile)) / 1_000_000
  if (!Number.isFinite(areaKm2) || areaKm2 <= 0) throw new Error("Density cell has no usable geographic area.")
  const result: CellGeometry = { areaKm2, bounds: [west, south, east, north] }
  hierarchy.geometryCache.set(quadkey, result)
  return result
}

export function getDensityFrame(hierarchy: DensityHierarchy, zoom: number): DensityFrame {
  const resolution = Math.max(DENSITY_MIN_DEPTH, Math.min(DENSITY_MAX_DEPTH, Number.isFinite(zoom) ? zoom + 2 : DENSITY_MIN_DEPTH))
  const parentDepth = Math.floor(resolution)
  const atMaximum = parentDepth === DENSITY_MAX_DEPTH
  const cellDepth = atMaximum ? DENSITY_MAX_DEPTH : parentDepth + 1
  const progress = atMaximum ? 1 : smoothstep(resolution - parentDepth)
  const parentCounts = hierarchy.countsByDepth.get(parentDepth)
  const childCounts = hierarchy.countsByDepth.get(cellDepth)
  const cells: DensityCell[] = []
  for (const [parentQuadkey, parentCount] of parentCounts ?? []) {
    const parent = geometry(hierarchy, parentQuadkey)
    if (atMaximum) {
      cells.push({ quadkey: parentQuadkey, parentQuadkey: parentQuadkey.slice(0, -1), count: parentCount, ...parent, density: parentCount / parent.areaKm2 * 1_000, representedCount: parentCount })
      continue
    }
    const parentDensity = parentCount / parent.areaKm2
    // Exactly one nonoverlapping partition, including empty children while resolving.
    // Sum(child area × blended density) equals parent count at every progress value.
    for (const tile of getChildren(quadkeyToTile(parentQuadkey))) {
      const quadkey = tileToQuadkey(tile)
      const child = geometry(hierarchy, quadkey)
      const count = childCounts?.get(quadkey) ?? 0
      const densityPerKm2 = (1 - progress) * parentDensity + progress * count / child.areaKm2
      cells.push({ quadkey, parentQuadkey, count, ...child, density: densityPerKm2 * 1_000, representedCount: densityPerKm2 * child.areaKm2 })
    }
  }
  cells.sort((left, right) => left.quadkey < right.quadkey ? -1 : left.quadkey > right.quadkey ? 1 : 0)
  return { cells, resolution, cellDepth, progress, representedCount: cells.reduce((sum, cell) => sum + cell.representedCount, 0) }
}
