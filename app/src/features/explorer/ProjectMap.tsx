import { Component, lazy, Suspense, useEffect, useLayoutEffect, useCallback, useMemo, useRef, useState, type ReactNode } from "react"
import { CircleMarker, MapContainer, Polyline, Rectangle, TileLayer, Tooltip, useMap } from "react-leaflet"
import { DomEvent } from "leaflet"
import { MinusIcon, PlusIcon, ScanIcon } from "lucide-react"
import "leaflet/dist/leaflet.css"
import { Button } from "@/components/ui/button"
import { IconButton } from "@/components/ui/icon-button"
import type { Project } from "@/domain/schema"
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { reportingGroups } from "@/lib/reporting-groups"
import { MapLegend } from "./MapLegend"
import { createDensityEntranceLatch, finishDensityEntrance } from "./density-map/density-entrance"
import { getMapGeography, geographyFitLocations, geographyLabel, geographyAreaLabel, geographyAreaProject, type MapGeography } from "./geography-map"
import { mapReportingGroupColor } from "./map-colors"
import { boundedInsets, getMapConnections, getMapLocations, ZERO_INSETS, type MapRendererControls, type ProjectMapProps } from "./map-view"

export interface MapViewportInsets { top: number; right: number; bottom: number; left: number }
type FitTarget = "projects" | "selection"
interface FitRequest { target: FitTarget; revision: number }

function MapView({ projects, geography, hasGeography, focusIds, fitRequest, visible, viewportInsets, tileError, connectionCount, selectedPair, showConnections, onShowConnections, onFit, onChangeRenderer }: {
  projects: Project[]; geography: MapGeography; hasGeography: boolean; focusIds: string[]; fitRequest: FitRequest; visible: boolean; viewportInsets: MapViewportInsets;
  tileError: boolean; connectionCount: number; selectedPair: boolean; showConnections: boolean;
  onShowConnections: (show: boolean) => void; onFit: (target: FitTarget) => void; onChangeRenderer: () => void;
}) {
  const map = useMap()
  const controls = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ width: 0, height: 0 })
  const lastFit = useRef<{ locationsKey: string; focusKey: string; fitRevision: number; layoutKey: string } | null>(null)
  const groups = useMemo(() => reportingGroups(projects.filter(project => project.location !== null || geography.representedIds.has(project.id))), [projects, geography])
  const locations = useMemo(() => hasGeography ? geographyFitLocations(projects, geography) : getMapLocations(projects), [projects, geography, hasGeography])
  const selectedLocations = useMemo(() => hasGeography ? geographyFitLocations(projects, geography, focusIds) : getMapLocations(projects, focusIds), [projects, geography, hasGeography, focusIds])
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
      <div className="flex items-center gap-2" role="group" aria-label="Map zoom">
        <IconButton size="icon-sm" variant="outline" label="Zoom in" onClick={() => map.zoomIn()}><PlusIcon aria-hidden="true" /></IconButton>
        <IconButton size="icon-sm" variant="outline" label="Zoom out" onClick={() => map.zoomOut()}><MinusIcon aria-hidden="true" /></IconButton>
      </div>
      <IconButton size="icon-sm" variant="outline" label="Fit projects" disabled={!locations.length} onClick={() => onFit("projects")}><ScanIcon aria-hidden="true" /></IconButton>
    </div>
    <div className="pointer-events-auto">{visible && <MapLegend geography={hasGeography ? geography : undefined} groups={groups} boundary={map.getContainer()} connectionCount={connectionCount} selectedPair={selectedPair} showConnections={showConnections} onShowConnections={onShowConnections} />}</div>
    <Button className="pointer-events-auto" type="button" variant="outline" size="sm" disabled={!selectedLocations.length} onClick={() => onFit("selection")}>Fit selection</Button>
    {visible && <DropdownMenu>
      <DropdownMenuTrigger asChild><Button className="pointer-events-auto" type="button" variant="outline" size="sm">Map view</Button></DropdownMenuTrigger>
      <DropdownMenuContent align="end" collisionBoundary={map.getContainer()} onPointerDown={event => event.stopPropagation()} onKeyDown={event => event.stopPropagation()} onWheel={event => event.stopPropagation()}>
        <DropdownMenuLabel>Map view</DropdownMenuLabel>
        <DropdownMenuRadioGroup value="standard" onValueChange={value => { if (value === "experimental") onChangeRenderer() }}>
          <DropdownMenuRadioItem value="standard">Standard</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="experimental">Experimental</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>}
    {tileError && <p role="status" className="pointer-events-auto max-w-72 rounded-lg border bg-background p-2 text-xs">Background map unavailable. Project points and lists still work.</p>}
  </div>
}

function LeafletProjectMap({ projects, geographicRecords, opportunities, selectedProjectId, selectedOpportunity, onProject, onOpportunity, visible, viewportInsets = ZERO_INSETS, showConnections, onShowConnections, onChangeRenderer }: ProjectMapProps & MapRendererControls) {
  const [fitRequest, setFitRequest] = useState<FitRequest>({ target: "projects", revision: 0 })
  const [tileError, setTileError] = useState(false)
  const focusIds = useMemo(() => selectedOpportunity?.projectIds ?? (selectedProjectId ? [selectedProjectId] : []), [selectedOpportunity, selectedProjectId])
  const byId = useMemo(() => new Map(projects.map((project) => [project.id, project])), [projects])
  const candidateIds = useMemo(() => new Set(opportunities.flatMap((opportunity) => opportunity.projectIds)), [opportunities])
  const geography = useMemo(() => getMapGeography(projects, geographicRecords), [projects, geographicRecords])
  const lines = getMapConnections(byId, opportunities, selectedOpportunity, showConnections)
  return <section className="relative h-full min-h-0 w-full min-w-0 overflow-hidden" aria-label="Project map">
    <MapContainer center={[33.2, -82.5]} zoom={7} zoomControl={false} scrollWheelZoom={false} className="absolute inset-0 z-0 h-full w-full" aria-label="Map of located projects">
      <MapView projects={projects} geography={geography} hasGeography={geographicRecords !== undefined} focusIds={focusIds} fitRequest={fitRequest} visible={visible} viewportInsets={viewportInsets} tileError={tileError} connectionCount={lines.length} selectedPair={selectedOpportunity !== null} showConnections={showConnections} onShowConnections={onShowConnections} onChangeRenderer={onChangeRenderer} onFit={(target) => setFitRequest((previous) => ({ target, revision: previous.revision + 1 }))} />
      <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" eventHandlers={{ tileerror: () => setTileError(true) }} />
      {geography.areas.map(area => {
        const [west, south, east, north] = area.bounds
        const selected = area.members.some(member => focusIds.includes(member.project.id))
        return <Rectangle key={area.key} bounds={[[south, west], [north, east]]} pathOptions={{ color: selected ? "#171717" : "#64748b", weight: selected ? 3 : 1.5, dashArray: "6 4", fillColor: "#64748b", fillOpacity: selected ? 0.08 : 0.025 }} eventHandlers={{ click: () => onProject(geographyAreaProject(area, focusIds)) }}><Tooltip sticky><span className="whitespace-pre-line">{geographyAreaLabel(area, focusIds)}</span></Tooltip></Rectangle>
      })}
      {lines.map(({ opportunity, positions }) => <Polyline key={opportunity.id} positions={positions} pathOptions={{ color: "#525252", weight: selectedOpportunity ? 3 : 1.5, opacity: selectedOpportunity ? 0.9 : 0.3, dashArray: "5 5" }} eventHandlers={{ click: () => onOpportunity(opportunity.id) }} />)}
      {projects.map((project) => project.location && <CircleMarker key={project.id} center={[project.location.lat, project.location.lon]} radius={focusIds.includes(project.id) ? 8 : 5} pathOptions={{ color: focusIds.includes(project.id) || candidateIds.has(project.id) ? "#171717" : mapReportingGroupColor(project.utilityId).css, fillColor: mapReportingGroupColor(project.utilityId).css, fillOpacity: geography.sourceRecords.get(project.id)?.status === "approximate" ? 0 : 0.85, weight: focusIds.includes(project.id) ? 3 : candidateIds.has(project.id) || geography.sourceRecords.get(project.id)?.status === "approximate" ? 2 : 1 }} eventHandlers={{ click: () => onProject(project.id) }}>{geography.sourceRecords.has(project.id) && <Tooltip sticky><span className="whitespace-pre-line">{project.name}{"\n"}{geographyLabel(geography.sourceRecords.get(project.id)!)}</span></Tooltip>}</CircleMarker>)}
      {geography.points.map(point => <CircleMarker key={point.key} center={[point.position[1], point.position[0]]} radius={focusIds.includes(point.project.id) ? 8 : 5} pathOptions={{ color: focusIds.includes(point.project.id) ? "#171717" : mapReportingGroupColor(point.project.utilityId).css, fill: false, weight: focusIds.includes(point.project.id) ? 3 : 2 }} eventHandlers={{ click: () => onProject(point.project.id) }}><Tooltip sticky><span className="whitespace-pre-line">{point.project.name}{"\n"}{geographyLabel(point.record)}</span></Tooltip></CircleMarker>)}
    </MapContainer>
  </section>
}

function MapFallback({ message, onStandard, onRetry }: { message: string; onStandard: () => void; onRetry?: () => void }) {
  return <section className="relative h-full min-h-0 w-full min-w-0 overflow-hidden" aria-label="Experimental map status">
    <div className="absolute right-3 top-3 max-w-[min(18rem,calc(100%-1.5rem))] space-y-2 rounded-lg border bg-background p-3">
      <p role="status" className="text-sm">{message}</p>
      {onRetry && <Button type="button" variant="outline" size="sm" onClick={onRetry}>Retry experimental map</Button>}
      <Button type="button" variant="outline" size="sm" onClick={onStandard}>Use standard map</Button>
    </div>
  </section>
}

class ExperimentalMapBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  render() { return this.state.failed ? this.props.fallback : this.props.children }
}

export function ProjectMap(props: ProjectMapProps) {
  const [experimental, setExperimental] = useState(false)
  const [loadAttempt, setLoadAttempt] = useState(0)
  // React.lazy retains rejected imports. A new attempt must get a fresh payload,
  // while the component identity stays stable throughout an active map session.
  const ExperimentalMap = useMemo(() => lazy(() => import("./density-map/MapLibreProjectMap")), [loadAttempt])
  const [showConnections, setShowConnections] = useState(true)
  const entrance = useRef(createDensityEntranceLatch())
  const finishEntrance = useCallback(() => finishDensityEntrance(entrance.current), [])
  const previousInputs = useRef({ projects: props.projects, opportunities: props.opportunities, geographicRecords: props.geographicRecords, selectedProjectId: props.selectedProjectId, selectedOpportunityId: props.selectedOpportunity?.id })
  useLayoutEffect(() => {
    const next = { projects: props.projects, opportunities: props.opportunities, geographicRecords: props.geographicRecords, selectedProjectId: props.selectedProjectId, selectedOpportunityId: props.selectedOpportunity?.id }
    const previous = previousInputs.current
    if (experimental && (previous.projects !== next.projects || previous.opportunities !== next.opportunities || previous.geographicRecords !== next.geographicRecords || previous.selectedProjectId !== next.selectedProjectId || previous.selectedOpportunityId !== next.selectedOpportunityId)) finishEntrance()
    previousInputs.current = next
  }, [experimental, props.projects, props.opportunities, props.geographicRecords, props.selectedProjectId, props.selectedOpportunity?.id, finishEntrance])
  useLayoutEffect(() => {
    if (!experimental) return
    if (!props.visible) finishEntrance()
    // Capture also covers the lazy-loading interval, other workspace controls and portals.
    const events = ["pointerdown", "wheel", "touchstart", "keydown", "click", "change", "input"] as const
    const latch = entrance.current
    function removeListeners() {
      for (const event of events) window.removeEventListener(event, finishEntrance, true)
      if (latch.onComplete === removeListeners) latch.onComplete = null
    }
    if (props.visible && latch.phase !== "complete") {
      for (const event of events) window.addEventListener(event, finishEntrance, { capture: true, passive: true })
      latch.onComplete = removeListeners
    }
    return () => { removeListeners(); finishEntrance() }
  }, [experimental, props.visible, finishEntrance])
  const controls = { showConnections, onShowConnections: setShowConnections }
  if (!experimental) return <LeafletProjectMap {...props} {...controls} onChangeRenderer={() => { setLoadAttempt(attempt => attempt + 1); setExperimental(true) }} />
  const onStandard = () => { finishEntrance(); setExperimental(false) }
  const onRetry = () => { finishEntrance(); setLoadAttempt(attempt => attempt + 1) }
  return <ExperimentalMapBoundary key={loadAttempt} fallback={<MapFallback message="Experimental map unavailable." onStandard={onStandard} onRetry={onRetry} />}>
    <Suspense fallback={<MapFallback message="Loading experimental map…" onStandard={onStandard} />}>
      <ExperimentalMap {...props} {...controls} entrance={entrance.current} onChangeRenderer={onStandard} />
    </Suspense>
  </ExperimentalMapBoundary>
}
