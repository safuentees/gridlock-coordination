import { useEffect, useMemo, useRef, useState } from "react"
import { CircleMarker, MapContainer, Polyline, TileLayer, useMap } from "react-leaflet"
import { DomEvent, type LatLngTuple } from "leaflet"
import { MinusIcon, PlusIcon } from "lucide-react"
import "leaflet/dist/leaflet.css"
import { Button } from "@/components/ui/button"
import type { Opportunity, Project } from "@/domain/schema"

export interface MapViewportInsets { top: number; right: number; bottom: number; left: number }
const ZERO_INSETS: MapViewportInsets = { top: 0, right: 0, bottom: 0, left: 0 }
const colors = { desc: "#2563eb", gpc: "#b45309" }

// Insets describe UI occlusion, not geographic distance. Keep Leaflet's fit area positive.
function boundedInsets(insets: MapViewportInsets, width: number, height: number): MapViewportInsets {
  const finite = (value: number) => Number.isFinite(value) ? Math.max(0, value) : 0
  function axis(start: number, end: number, size: number): [number, number] {
    const leading = finite(start)
    const trailing = finite(end)
    const maximum = Math.max(0, size - Math.min(120, size / 2))
    const scale = leading + trailing > maximum ? maximum / (leading + trailing) : 1
    return [Math.round(leading * scale), Math.round(trailing * scale)]
  }
  const [left, right] = axis(insets.left, insets.right, width)
  const [top, bottom] = axis(insets.top, insets.bottom, height)
  return { left, right, top, bottom }
}

function MapView({ projects, focusIds, fitRevision, visible, viewportInsets, tileError, connectionCount, selectedPair, onFit }: {
  projects: Project[]; focusIds: string[]; fitRevision: number; visible: boolean; viewportInsets: MapViewportInsets;
  tileError: boolean; connectionCount: number; selectedPair: boolean; onFit: () => void;
}) {
  const map = useMap()
  const controls = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ width: 0, height: 0 })
  const lastFit = useRef<{ projects: Project[]; focusKey: string; fitRevision: number; layoutKey: string } | null>(null)
  const locations = useMemo(() => projects.flatMap((project): LatLngTuple[] => project.location ? [[project.location.lat, project.location.lon]] : []), [projects])
  const insets = useMemo(() => boundedInsets(viewportInsets, size.width, size.height), [viewportInsets.top, viewportInsets.right, viewportInsets.bottom, viewportInsets.left, size.width, size.height])
  const focusKey = JSON.stringify(focusIds)
  const layoutKey = `${size.width}:${size.height}:${insets.top}:${insets.right}:${insets.bottom}:${insets.left}`

  useEffect(() => {
    const container = map.getContainer()
    let frame = 0
    const resize = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const width = container.clientWidth
        const height = container.clientHeight
        if (width > 0 && height > 0) {
          map.invalidateSize({ pan: false })
          setSize((previous) => previous.width === width && previous.height === height ? previous : { width, height })
        }
      })
    }
    const observer = new ResizeObserver(resize)
    observer.observe(container)
    resize()
    return () => { observer.disconnect(); cancelAnimationFrame(frame) }
  }, [map])

  useEffect(() => {
    const node = controls.current
    if (!node) return
    DomEvent.disableClickPropagation(node)
    DomEvent.disableScrollPropagation(node)
    DomEvent.on(node, "keydown", DomEvent.stopPropagation)
    return () => { DomEvent.off(node, "keydown", DomEvent.stopPropagation) }
  }, [])

  useEffect(() => {
    if (!visible || size.width <= 0 || size.height <= 0) return
    map.invalidateSize({ pan: false })
    const attribution = map.attributionControl.getContainer()
    if (attribution) {
      attribution.style.marginRight = `${insets.right + 8}px`
      attribution.style.marginBottom = `${insets.bottom + 8}px`
      attribution.style.maxWidth = `${Math.max(40, size.width - insets.left - insets.right - 16)}px`
      attribution.style.maxHeight = `${Math.max(24, (size.height - insets.top - insets.bottom) / 3)}px`
      attribution.style.overflow = "auto"
      attribution.style.whiteSpace = "normal"
    }
    const previous = lastFit.current
    const requestedFit = previous !== null && previous.fitRevision !== fitRevision
    const selectionChanged = previous === null || previous.focusKey !== focusKey
    const layoutChanged = previous === null || previous.layoutKey !== layoutKey
    const projectsChanged = previous === null || previous.projects !== projects
    if (requestedFit || selectionChanged || layoutChanged || projectsChanged) {
      const selected = projects.filter((project) => focusIds.includes(project.id)).flatMap((project): LatLngTuple[] => project.location ? [[project.location.lat, project.location.lon]] : [])
      const points = !requestedFit && selected.length ? selected : locations
      const padding = boundedInsets({ top: insets.top + 72, right: insets.right + 24, bottom: insets.bottom + 40, left: insets.left + 24 }, size.width, size.height)
      if (points.length) map.fitBounds(points, {
        paddingTopLeft: [padding.left, padding.top], paddingBottomRight: [padding.right, padding.bottom],
        maxZoom: !requestedFit && selected.length > 1 ? 12 : 10, animate: false,
      })
    }
    lastFit.current = { projects, focusKey, fitRevision, layoutKey }
  }, [map, locations, projects, focusIds, focusKey, fitRevision, visible, size, insets, layoutKey])

  return <div ref={controls} className="pointer-events-none absolute z-[1000] flex flex-wrap items-start gap-2" style={{ top: insets.top + 12, left: insets.left + 12, right: insets.right + 12 }}>
    <div className="pointer-events-auto flex flex-wrap items-center gap-1 rounded-lg border bg-background p-1">
      <Button type="button" variant="ghost" size="icon-sm" aria-label="Zoom in" title="Zoom in" onClick={() => map.zoomIn()}><PlusIcon /></Button>
      <Button type="button" variant="ghost" size="icon-sm" aria-label="Zoom out" title="Zoom out" onClick={() => map.zoomOut()}><MinusIcon /></Button>
      <Button type="button" variant="ghost" size="sm" onClick={onFit}>Fit projects</Button>
    </div>
    <details className="pointer-events-auto max-w-full rounded-lg border bg-background text-sm">
      <summary className="cursor-pointer px-3 py-2 font-medium">Map key</summary>
      <div className="max-w-72 space-y-2 overflow-auto px-3 pb-3 text-xs" style={{ maxHeight: Math.max(24, Math.min(192, size.height - insets.top - insets.bottom - 64)) }}>
        <p><span aria-hidden="true" className="mr-2 inline-block size-2 rounded-full bg-blue-600" />Dominion filing</p>
        <p><span aria-hidden="true" className="mr-2 inline-block size-2 rounded-full bg-amber-700" />Georgia filing</p>
        <p>Outlined points have candidates. Larger outlined points are selected.</p>
        <p>Dashed lines connect project centers, not transmission routes. {selectedPair ? "Showing the selected candidate." : `Showing ${connectionCount} connections; all candidates remain in the list.`}</p>
        <p>Use the project inventory or candidate list for keyboard selection. Arrow keys pan the focused map; + and − change zoom.</p>
      </div>
    </details>
    {tileError && <p role="status" className="pointer-events-auto basis-full rounded-lg border bg-background p-2 text-xs">Basemap tiles could not load. Project points and the inventory remain available.</p>}
  </div>
}

export function ProjectMap({ projects, opportunities, selectedProjectId, selectedOpportunity, onProject, onOpportunity, visible, viewportInsets = ZERO_INSETS }: {
  visible: boolean; projects: Project[]; opportunities: Opportunity[]; selectedProjectId: string | null; selectedOpportunity: Opportunity | null;
  onProject: (id: string) => void; onOpportunity: (id: string) => void; viewportInsets?: MapViewportInsets;
}) {
  const [fitRevision, setFitRevision] = useState(0)
  const [tileError, setTileError] = useState(false)
  const focusIds = useMemo(() => selectedOpportunity?.projectIds ?? (selectedProjectId ? [selectedProjectId] : []), [selectedOpportunity, selectedProjectId])
  const byId = useMemo(() => new Map(projects.map((project) => [project.id, project])), [projects])
  const candidateIds = useMemo(() => new Set(opportunities.flatMap((opportunity) => opportunity.projectIds)), [opportunities])
  const lines = selectedOpportunity ? [selectedOpportunity] : opportunities.slice(0, 100)
  return <section className="relative h-full min-h-0 w-full min-w-0 overflow-hidden" aria-label="Project map">
    <MapContainer center={[33.2, -82.5]} zoom={7} zoomControl={false} scrollWheelZoom={false} className="absolute inset-0 z-0 h-full w-full" aria-label="Map of located projects">
      <MapView projects={projects} focusIds={focusIds} fitRevision={fitRevision} visible={visible} viewportInsets={viewportInsets} tileError={tileError} connectionCount={lines.length} selectedPair={selectedOpportunity !== null} onFit={() => setFitRevision((value) => value + 1)} />
      <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" eventHandlers={{ tileerror: () => setTileError(true) }} />
      {lines.map((opportunity) => {
        const left = byId.get(opportunity.projectIds[0])?.location
        const right = byId.get(opportunity.projectIds[1])?.location
        if (!left || !right) return null
        return <Polyline key={opportunity.id} positions={[[left.lat, left.lon], [right.lat, right.lon]]} pathOptions={{ color: "#525252", weight: selectedOpportunity ? 3 : 1.5, opacity: selectedOpportunity ? 0.9 : 0.3, dashArray: "5 5" }} eventHandlers={{ click: () => onOpportunity(opportunity.id) }} />
      })}
      {projects.map((project) => project.location && <CircleMarker key={project.id} center={[project.location.lat, project.location.lon]} radius={focusIds.includes(project.id) ? 8 : 5} pathOptions={{ color: focusIds.includes(project.id) || candidateIds.has(project.id) ? "#171717" : colors[project.utilityId], fillColor: colors[project.utilityId], fillOpacity: 0.85, weight: focusIds.includes(project.id) ? 3 : candidateIds.has(project.id) ? 2 : 1 }} eventHandlers={{ click: () => onProject(project.id) }} />)}
    </MapContainer>
  </section>
}
