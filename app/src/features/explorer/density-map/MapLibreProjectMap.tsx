import { useEffect, useMemo, useRef, useState } from "react"
import MapGL, { AttributionControl, type MapRef } from "react-map-gl/maplibre"
import { LngLatBounds, setWorkerUrl, type StyleSpecification } from "maplibre-gl"
import workerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url"
import { MinusIcon, PlusIcon, ScanIcon } from "lucide-react"
import "maplibre-gl/dist/maplibre-gl.css"
import { Button } from "@/components/ui/button"
import { IconButton } from "@/components/ui/icon-button"
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MapLegend } from "../MapLegend"
import { boundedInsets, getMapConnections, getMapLocations, isMappableProject, ZERO_INSETS, type MapRendererControls, type ProjectMapProps } from "../map-view"
import { DeckOverlay } from "./DeckOverlay"
import { projectLayers } from "./map-layers"

// MapLibre 6 uses a separate worker module; Vite must bundle its sibling imports too.
setWorkerUrl(workerUrl)

const MAP_STYLE: StyleSpecification = {
  version: 8,
  sources: {
    osm: {
      type: "raster", tileSize: 256,
      tiles: ["https://a.tile.openstreetmap.org/{z}/{x}/{y}.png", "https://b.tile.openstreetmap.org/{z}/{x}/{y}.png", "https://c.tile.openstreetmap.org/{z}/{x}/{y}.png"],
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    },
  },
  layers: [{ id: "osm", type: "raster", source: "osm" }],
}

type FitTarget = "projects" | "selection"

export default function MapLibreProjectMap({ projects, opportunities, selectedProjectId, selectedOpportunity, onProject, onOpportunity, visible, viewportInsets = ZERO_INSETS, showConnections, onShowConnections, onChangeRenderer }: ProjectMapProps & MapRendererControls) {
  const map = useRef<MapRef>(null)
  const [container, setContainer] = useState<HTMLElement | null>(null)
  const [ready, setReady] = useState(false)
  const [mapError, setMapError] = useState(false)
  const [size, setSize] = useState({ width: 0, height: 0 })
  const [pitch, setPitch] = useState(0)
  const [fitRequest, setFitRequest] = useState<{ target: FitTarget; revision: number }>({ target: "projects", revision: 0 })
  const lastFit = useRef<{ locationsKey: string; focusKey: string; layoutKey: string; revision: number } | null>(null)
  const mappedProjects = useMemo(() => projects.filter(isMappableProject), [projects])
  const outOfRangeCount = projects.filter((project) => project.location && !isMappableProject(project)).length
  const focusIds = useMemo(() => selectedOpportunity?.projectIds ?? (selectedProjectId ? [selectedProjectId] : []), [selectedOpportunity, selectedProjectId])
  const locations = useMemo(() => getMapLocations(mappedProjects), [mappedProjects])
  const selectedLocations = useMemo(() => getMapLocations(mappedProjects, focusIds), [mappedProjects, focusIds])
  const byId = useMemo(() => new Map(mappedProjects.map((project) => [project.id, project])), [mappedProjects])
  const candidateIds = useMemo(() => new Set(opportunities.flatMap((opportunity) => opportunity.projectIds)), [opportunities])
  const connections = useMemo(() => getMapConnections(byId, opportunities, selectedOpportunity, showConnections), [byId, opportunities, selectedOpportunity, showConnections])
  const layers = useMemo(() => projectLayers({ projects: mappedProjects, connections, focusIds, candidateIds, selectedPair: selectedOpportunity !== null, onProject, onOpportunity }), [mappedProjects, connections, focusIds, candidateIds, selectedOpportunity, onProject, onOpportunity])
  const insets = useMemo(() => boundedInsets(viewportInsets, size.width, size.height), [viewportInsets, size])
  const locationsKey = JSON.stringify(locations)
  const focusKey = JSON.stringify([focusIds, selectedLocations])
  const layoutKey = `${size.width}:${size.height}:${insets.top}:${insets.right}:${insets.bottom}:${insets.left}`

  useEffect(() => {
    const node = container
    if (!node) return
    const resize = () => {
      const width = node.clientWidth
      const height = node.clientHeight
      if (width > 0 && height > 0) setSize((previous) => previous.width === width && previous.height === height ? previous : { width, height })
    }
    const observer = new ResizeObserver(resize)
    observer.observe(node)
    resize()
    return () => observer.disconnect()
  }, [container])

  useEffect(() => {
    const current = map.current
    if (!current || !ready || !visible || size.width <= 0 || size.height <= 0) return
    current.resize()
    const previous = lastFit.current
    const requestedFit = previous !== null && previous.revision !== fitRequest.revision
    if (!previous || requestedFit || previous.locationsKey !== locationsKey || previous.focusKey !== focusKey || previous.layoutKey !== layoutKey) {
      const useSelection = requestedFit ? fitRequest.target === "selection" : selectedLocations.length > 0
      const points = useSelection ? selectedLocations : locations
      if (points.length) {
        const bounds = new LngLatBounds()
        points.forEach(([lat, lon]) => bounds.extend([lon, lat]))
        const padding = boundedInsets({ top: insets.top + 72, right: insets.right + 24, bottom: insets.bottom + 40, left: insets.left + 24 }, size.width, size.height)
        // Fit is deliberately flat/north-up so the full bounds fit outside panel occlusion.
        current.jumpTo({ pitch: 0, bearing: 0 })
        current.fitBounds(bounds, { padding, maxZoom: useSelection && points.length > 1 ? 12 : 10, animate: false, duration: 0 })
      }
      lastFit.current = { locationsKey, focusKey, layoutKey, revision: fitRequest.revision }
    }
  }, [ready, visible, size, insets, locations, selectedLocations, locationsKey, focusKey, layoutKey, fitRequest])

  function fit(target: FitTarget) { setFitRequest((previous) => ({ target, revision: previous.revision + 1 })) }

  return <section ref={setContainer} className="relative h-full min-h-0 w-full min-w-0 overflow-hidden" aria-label="Experimental project map">
    <MapGL ref={map} initialViewState={{ longitude: -82.5, latitude: 33.2, zoom: 7 }} mapStyle={MAP_STYLE} attributionControl={false} renderWorldCopies={false} maxPitch={60} onLoad={() => setReady(true)} onError={() => setMapError(true)} onPitch={(event) => setPitch(event.viewState.pitch)} style={{ width: "100%", height: "100%" }}>
      <DeckOverlay layers={layers} interleaved onError={() => setMapError(true)} />
      <AttributionControl compact={false} style={{ marginRight: insets.right + 8, marginBottom: insets.bottom + 8, maxWidth: Math.max(40, size.width - insets.left - insets.right - 16), maxHeight: Math.max(24, (size.height - insets.top - insets.bottom) / 3), overflow: "auto", whiteSpace: "normal" }} />
    </MapGL>
    <div className="pointer-events-none absolute right-3 top-3 z-10 flex max-w-[calc(100%-1.5rem)] flex-col items-end gap-2">
      <div className="pointer-events-auto flex items-center gap-2">
        <div className="flex items-center gap-1 rounded-lg border bg-background p-1" role="group" aria-label="Map zoom">
          <IconButton variant="ghost" label="Zoom in" disabled={!ready} onClick={() => map.current?.zoomIn({ duration: 0 })}><PlusIcon aria-hidden="true" /></IconButton>
          <IconButton variant="ghost" label="Zoom out" disabled={!ready} onClick={() => map.current?.zoomOut({ duration: 0 })}><MinusIcon aria-hidden="true" /></IconButton>
        </div>
        <IconButton variant="outline" label="Fit projects" disabled={!ready || !locations.length} onClick={() => fit("projects")}><ScanIcon aria-hidden="true" /></IconButton>
      </div>
      {visible && container && <div className="pointer-events-auto"><MapLegend boundary={container} connectionCount={connections.length} selectedPair={selectedOpportunity !== null} showConnections={showConnections} onShowConnections={onShowConnections} /></div>}
      <Button type="button" variant="outline" size="sm" className="pointer-events-auto" disabled={!ready || !selectedLocations.length} onClick={() => fit("selection")}>Fit selection</Button>
      {visible && <DropdownMenu>
        <DropdownMenuTrigger asChild><Button type="button" variant="outline" size="sm" className="pointer-events-auto">Map view</Button></DropdownMenuTrigger>
        <DropdownMenuContent align="end" collisionBoundary={container} style={{ width: 256, maxWidth: "var(--radix-dropdown-menu-content-available-width)" }} onPointerDown={(event) => event.stopPropagation()} onKeyDown={(event) => event.stopPropagation()} onWheel={(event) => event.stopPropagation()}>
          <DropdownMenuLabel>Map view</DropdownMenuLabel>
          <DropdownMenuRadioGroup value="experimental" onValueChange={(value) => { if (value === "standard") onChangeRenderer() }}>
            <DropdownMenuRadioItem value="standard">Standard</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="experimental">Experimental</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
          <DropdownMenuSeparator />
          <DropdownMenuCheckboxItem checked={pitch > 0} disabled={!ready} onCheckedChange={(value) => map.current?.jumpTo({ pitch: value ? 45 : 0 })}>Tilt view</DropdownMenuCheckboxItem>
          <DropdownMenuItem disabled={!ready} onSelect={() => map.current?.jumpTo({ pitch: 0, bearing: 0 })}>Reset north and tilt</DropdownMenuItem>
          <p className="max-w-64 px-2 py-1.5 text-xs text-muted-foreground">Right-drag to rotate and tilt. Fit returns to a flat, north-up view.</p>
        </DropdownMenuContent>
      </DropdownMenu>}
      <span className="rounded border bg-background px-2 py-1 text-xs">Experimental</span>
      {outOfRangeCount > 0 && <p className="pointer-events-auto max-w-72 rounded-lg border bg-background p-2 text-xs">{outOfRangeCount} located records are outside this projection; their coordinates are unchanged.</p>}
      {mapError && <p role="status" className="pointer-events-auto max-w-72 rounded-lg border bg-background p-2 text-xs">Experimental map unavailable or incomplete. <Button type="button" variant="link" size="sm" onClick={onChangeRenderer}>Use standard map</Button></p>}
    </div>
  </section>
}
