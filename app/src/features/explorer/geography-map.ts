import type { LatLngTuple } from "leaflet"
import type { GeographicRecord } from "@/domain/geography"
import type { Project } from "@/domain/schema"
import { MERCATOR_LATITUDE_LIMIT } from "./map-view"

export interface GeographyMember { project: Project; record: GeographicRecord }
export interface GeographyPoint extends GeographyMember { key: string; position: [number, number] }
export interface GeographyArea { key: string; bounds: [number, number, number, number]; members: GeographyMember[] }
export interface MapGeography {
  points: GeographyPoint[]
  areas: GeographyArea[]
  sourceRecords: ReadonlyMap<string, GeographicRecord>
  representedIds: ReadonlySet<string>
  excludedCount: number
}
const positionKey = ([lon, lat]: readonly number[]) => `${lon === 180 ? -180 : lon}:${lat}`

/** Map-only companion adaptation. Original coordinates and strict inputs stay authoritative. */
export function getMapGeography(projects: readonly Project[], records: readonly GeographicRecord[] = []): MapGeography {
  const byId = new Map(projects.map(project => [project.id, project]))
  const points: GeographyPoint[] = []
  const areas = new Map<string, GeographyArea>()
  const sourceRecords = new Map<string, GeographicRecord>()
  const representedIds = new Set(projects.filter(project => project.location && Math.abs(project.location.lat) <= MERCATOR_LATITUDE_LIMIT).map(project => project.id))
  const seenIds = new Set<string>()
  let excludedCount = 0
  for (const record of records) {
    const project = byId.get(record.projectId)
    const representation = record.representation
    if (!project || seenIds.has(project.id) || !representation || !["located", "approximate"].includes(record.status)) continue
    seenIds.add(project.id)
    if (representation.kind === "area") {
      const [west, south, east, north] = representation.bounds
      if (Math.abs(south) > MERCATOR_LATITUDE_LIMIT || Math.abs(north) > MERCATOR_LATITUDE_LIMIT) { excludedCount += 1; continue }
      const key = JSON.stringify([west, south, east, north])
      let area = areas.get(key)
      if (!area) { area = { key, bounds: [west, south, east, north], members: [] }; areas.set(key, area) }
      area.members.push({ project, record })
      representedIds.add(project.id)
      continue
    }
    const positions = representation.kind === "point" ? [representation.position] : representation.positions
    const seenPositions = new Set<string>()
    const sourceKey = project.location ? positionKey([project.location.lon, project.location.lat]) : null
    let excluded = false
    for (const position of positions) {
      const key = positionKey(position)
      if (seenPositions.has(key)) continue
      seenPositions.add(key)
      if (Math.abs(position[1]) > MERCATOR_LATITUDE_LIMIT) { excluded = true; continue }
      if (key === sourceKey) sourceRecords.set(project.id, record)
      else points.push({ key: `${project.id}:${key}`, project, record, position: [position[0], position[1]] })
      representedIds.add(project.id)
    }
    if (excluded) excludedCount += 1
  }
  for (const area of areas.values()) area.members.sort((left, right) => left.project.id.localeCompare(right.project.id))
  return { points, areas: [...areas.values()], sourceRecords, representedIds, excludedCount }
}

export function geographyAreaRing(area: GeographyArea): [number, number][] {
  const [west, south, east, north] = area.bounds
  return [[west, south], [east, south], [east, north], [west, north], [west, south]]
}

/** Fit uses source positions, each endpoint and real area corners, never an area center. */
export function geographyFitLocations(projects: readonly Project[], geography: MapGeography, focusIds?: readonly string[]): LatLngTuple[] {
  const focus = focusIds ? new Set(focusIds) : null
  const positions: LatLngTuple[] = []
  const seen = new Set<string>()
  function add(lon: number, lat: number) {
    const key = positionKey([lon, lat])
    if (!seen.has(key)) { positions.push([lat, lon]); seen.add(key) }
  }
  for (const project of projects) if (project.location && (!focus || focus.has(project.id))) {
    positions.push([project.location.lat, project.location.lon])
    seen.add(positionKey([project.location.lon, project.location.lat]))
  }
  for (const point of geography.points) if (!focus || focus.has(point.project.id)) add(...point.position)
  for (const area of geography.areas) if (!focus || area.members.some(member => focus.has(member.project.id))) {
    const [west, south, east, north] = area.bounds
    add(west, south); add(east, north)
  }
  return positions
}

export function geographyLabel(record: GeographicRecord): string {
  const representation = record.representation
  if (!representation) return record.reason
  return `${record.status === "approximate" ? "Approximate" : "Geographic evidence"} · ${representation.label}\n${representation.method.replaceAll("-", " ")} · ${representation.precision} precision\n${representation.limitations.join("; ")}`
}
export function geographyAreaLabel(area: GeographyArea, focusIds: readonly string[] = []): string {
  const member = area.members.find(member => focusIds.includes(member.project.id)) ?? area.members[0]
  return `${geographyLabel(member.record)}\nBounding extent; no project center or route.\n${area.members.length.toLocaleString()} ${area.members.length === 1 ? "project" : "projects share this extent; choose any in the list"}`
}
export function geographyAreaProject(area: GeographyArea, focusIds: readonly string[]): string {
  return (area.members.find(member => focusIds.includes(member.project.id)) ?? area.members[0]).project.id
}
