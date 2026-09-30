import { useEffect, useMemo, useRef, useState } from "react"
import { CircleMarker, MapContainer, Polyline, TileLayer, useMap } from "react-leaflet"
import { DomEvent } from "leaflet"
import { MinusIcon, PlusIcon, ScanIcon } from "lucide-react"
import "leaflet/dist/leaflet.css"
import { Button } from "@/components/ui/button"
import { IconButton } from "@/components/ui/icon-button"
import type { Opportunity, Project } from "@/domain/schema"
import { MapLegend } from "./MapLegend"
import { getMapConnections, getMapLocations } from "./map-view"

export interface MapViewportInsets { top: number; right: number; bottom: number; left: number }
const ZERO_INSETS: MapViewportInsets = { top: 0, right: 0, bottom: 0, left: 0 }
const colors = { desc: "#2563eb", gpc: "#b45309" }
type FitTarget = "projects" | "selection"
interface FitRequest { target: FitTarget; revision: number }

// Insets describe UI occlusion, not geographic distance. Keep Leaflet's fit area positive.
function boundedInsets(insets: MapViewportInsets, width: number, height: number): MapViewportInsets {
  const finite = (value: number) => Number.isFinite(value) ? Math.max(0, value) : 0
  function axis(start: number, end: number, size: number): [number, number] {
    const leading = finite(start)
    const trailing = finite(end)
    // Do not shrink real panel coverage merely to reserve an arbitrary fit width.
    const maximum = Math.max(0, size - 1)
    const scale = leading + trailing > maximum ? maximum / (leading + trailing) : 1
    return [Math.floor(leading * scale), Math.floor(trailing * scale)]
  }
  const [left, right] = axis(insets.left, insets.right, width)
  const [top, bottom] = axis(insets.top, insets.bottom, height)
  return { left, right, top, bottom }
}

function MapView({ projects, focusIds, fitRequest, visible, viewportInsets, tileError, connectionCount, selectedPair, showConnections, onShowConnections, onFit }: {
  projects: Project[]; focusIds: string[]; fitRequest: FitRequest; visible: boolean; viewportInsets: MapViewportInsets;
  tileError: boolean; connectionCount: number; selectedPair: boolean; showConnections: boolean;
  onShowConnections: (show: boolean) => void; onFit: (target: FitTarget) => void;
}) {
  const map = useMap()
  const controls = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ width: 0, height: 0 })
  const lastFit = useRef<{ locationsKey: string; focusKey: string; fitRevision: number; layoutKey: string } | null>(null)
  const locations = useMemo(() => getMapLocations(projects), [projects])
  const selectedLocations = useMemo(() => getMapLocations(projects, focusIds), [projects, focusIds])
  const insets = useMemo(() => boundedInsets(viewportInsets, size.width, size.height), [viewportInsets.top, viewportInsets.right, viewportInsets.bottom, viewportInsets.left, size.width, size.height])
  // Compare geographic inputs by value so equivalent caller arrays do not reset pan/zoom.
  const locationsKey = JSON.stringify(locations)
  const focusKey = JSON.stringify([focusIds, selectedLocations])
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
    const requestedFit = previous !== null && previous.fitRevision !== fitRequest.revision
    const selectionChanged = previous === null || previous.focusKey !== focusKey
    const layoutChanged = previous === null || previous.layoutKey !== layoutKey
    const locationsChanged = previous === null || previous.locationsKey !== locationsKey
    if (requestedFit || selectionChanged || layoutChanged || locationsChanged) {
      const useSelection = requestedFit ? fitRequest.target === "selection" : selectedLocations.length > 0
      const points = useSelection ? selectedLocations : locations
      const padding = boundedInsets({ top: insets.top + 72, right: insets.right + 24, bottom: insets.bottom + 40, left: insets.left + 24 }, size.width, size.height)
      if (points.length) map.fitBounds(points, {
        paddingTopLeft: [padding.left, padding.top], paddingBottomRight: [padding.right, padding.bottom],
        maxZoom: useSelection && points.length > 1 ? 12 : 10, animate: false,
      })
    }
    lastFit.current = { locationsKey, focusKey, fitRevision: fitRequest.revision, layoutKey }
  }, [map, locations, selectedLocations, locationsKey, focusKey, fitRequest, visible, size, insets, layoutKey])

  // Controls belong to the viewport; changing occlusion only affects geographic fitting.
  return <div ref={controls} className="pointer-events-none absolute right-3 top-3 z-[1000] flex max-w-[calc(100%-1.5rem)] flex-col items-end gap-2 font-sans">
    <div className="pointer-events-auto flex items-center gap-2">
      <div className="flex items-center gap-1 rounded-lg border bg-background p-1" role="group" aria-label="Map zoom">
        <IconButton variant="ghost" label="Zoom in" onClick={() => map.zoomIn()}><PlusIcon aria-hidden="true" /></IconButton>
        <IconButton variant="ghost" label="Zoom out" onClick={() => map.zoomOut()}><MinusIcon aria-hidden="true" /></IconButton>
      </div>
      <IconButton variant="outline" label="Fit projects" disabled={!locations.length} onClick={() => onFit("projects")}><ScanIcon aria-hidden="true" /></IconButton>
    </div>
    <div className="pointer-events-auto">{visible && <MapLegend boundary={map.getContainer()} connectionCount={connectionCount} selectedPair={selectedPair} showConnections={showConnections} onShowConnections={onShowConnections} />}</div>
    <Button className="pointer-events-auto" type="button" variant="outline" size="sm" disabled={!selectedLocations.length} onClick={() => onFit("selection")}>Fit selection</Button>
    {tileError && <p role="status" className="pointer-events-auto max-w-72 rounded-lg border bg-background p-2 text-xs">Background map unavailable. Project points and lists still work.</p>}
  </div>
}

export function ProjectMap({ projects, opportunities, selectedProjectId, selectedOpportunity, onProject, onOpportunity, visible, viewportInsets = ZERO_INSETS }: {
  visible: boolean; projects: Project[]; opportunities: Opportunity[]; selectedProjectId: string | null; selectedOpportunity: Opportunity | null;
  onProject: (id: string) => void; onOpportunity: (id: string) => void; viewportInsets?: MapViewportInsets;
}) {
  const [fitRequest, setFitRequest] = useState<FitRequest>({ target: "projects", revision: 0 })
  const [showConnections, setShowConnections] = useState(true)
  const [tileError, setTileError] = useState(false)
  const focusIds = useMemo(() => selectedOpportunity?.projectIds ?? (selectedProjectId ? [selectedProjectId] : []), [selectedOpportunity, selectedProjectId])
  const byId = useMemo(() => new Map(projects.map((project) => [project.id, project])), [projects])
  const candidateIds = useMemo(() => new Set(opportunities.flatMap((opportunity) => opportunity.projectIds)), [opportunities])
  const lines = getMapConnections(byId, opportunities, selectedOpportunity, showConnections)
  return <section className="relative h-full min-h-0 w-full min-w-0 overflow-hidden" aria-label="Project map">
    <MapContainer center={[33.2, -82.5]} zoom={7} zoomControl={false} scrollWheelZoom={false} className="absolute inset-0 z-0 h-full w-full" aria-label="Map of located projects">
      <MapView projects={projects} focusIds={focusIds} fitRequest={fitRequest} visible={visible} viewportInsets={viewportInsets} tileError={tileError} connectionCount={lines.length} selectedPair={selectedOpportunity !== null} showConnections={showConnections} onShowConnections={setShowConnections} onFit={(target) => setFitRequest((previous) => ({ target, revision: previous.revision + 1 }))} />
      <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" eventHandlers={{ tileerror: () => setTileError(true) }} />
      {lines.map(({ opportunity, positions }) => <Polyline key={opportunity.id} positions={positions} pathOptions={{ color: "#525252", weight: selectedOpportunity ? 3 : 1.5, opacity: selectedOpportunity ? 0.9 : 0.3, dashArray: "5 5" }} eventHandlers={{ click: () => onOpportunity(opportunity.id) }} />)}
      {projects.map((project) => project.location && <CircleMarker key={project.id} center={[project.location.lat, project.location.lon]} radius={focusIds.includes(project.id) ? 8 : 5} pathOptions={{ color: focusIds.includes(project.id) || candidateIds.has(project.id) ? "#171717" : colors[project.utilityId], fillColor: colors[project.utilityId], fillOpacity: 0.85, weight: focusIds.includes(project.id) ? 3 : candidateIds.has(project.id) ? 2 : 1 }} eventHandlers={{ click: () => onProject(project.id) }} />)}
    </MapContainer>
  </section>
}
