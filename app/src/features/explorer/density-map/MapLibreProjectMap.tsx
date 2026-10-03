import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import MapGL, { AttributionControl, type MapRef } from "react-map-gl/maplibre"
import { LngLatBounds, setWorkerUrl, type StyleSpecification } from "maplibre-gl"
import type { PickingInfo } from "@deck.gl/core"
import workerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url"
import { MinusIcon, PlusIcon, ScanIcon } from "lucide-react"
import "maplibre-gl/dist/maplibre-gl.css"
import { Button } from "@/components/ui/button"
import { IconButton } from "@/components/ui/icon-button"
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { reportingGroups } from "@/lib/reporting-groups"
import { MapLegend } from "../MapLegend"
import { boundedInsets, getMapConnections, getMapLocations, isMappableProject, ZERO_INSETS, type MapRendererControls, type ProjectMapProps } from "../map-view"
import { DeckOverlay } from "./DeckOverlay"
import { projectLayers } from "./map-layers"
import { geographyLayers } from "./geography-layers"
import { getMapGeography, geographyFitLocations, geographyLabel, geographyAreaLabel, type GeographyArea, type GeographyPoint } from "../geography-map"
import { buildDensityHierarchy, getDensityFrame, smoothstep, type DensityCell, type DensityPoint } from "./hierarchy"
import { densityLayers, syntheticPointLayer } from "./density-layers"
import { syntheticDensityPoints } from "./synthetic"
import { createDensityLighting, DENSITY_LEGEND_GRADIENT } from "./density-style"

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
  layers: [
    { id: "stone-background", type: "background", paint: { "background-color": "#e7e5e4" } },
    { id: "osm", type: "raster", source: "osm", paint: {
      "raster-saturation": -1, "raster-contrast": -0.2,
      "raster-brightness-min": 0.15, "raster-brightness-max": 0.95, "raster-opacity": 0.82,
    } },
  ],
}
const densityNumber = new Intl.NumberFormat(undefined, { maximumSignificantDigits: 3 })
type FitTarget = "projects" | "selection"

export default function MapLibreProjectMap({ projects, geographicRecords, opportunities, selectedProjectId, selectedOpportunity, onProject, onOpportunity, visible, viewportInsets = ZERO_INSETS, showConnections, onShowConnections, onChangeRenderer }: ProjectMapProps & MapRendererControls) {
  const map = useRef<MapRef>(null)
  const effects = useMemo(() => [createDensityLighting()], [])
  const [container, setContainer] = useState<HTMLElement | null>(null)
  const [ready, setReady] = useState(false)
  const [mapError, setMapError] = useState(false)
  const [size, setSize] = useState({ width: 0, height: 0 })
  const [pitch, setPitch] = useState(0)
  const [zoom, setZoom] = useState(7)
  const [showDensity, setShowDensity] = useState(true)
  const [columns, setColumns] = useState(false)
  const [syntheticPreview, setSyntheticPreview] = useState(false)
  const [fitRequest, setFitRequest] = useState<{ target: FitTarget; revision: number }>({ target: "projects", revision: 0 })
  const lastFit = useRef<{ locationsKey: string; focusKey: string; layoutKey: string; revision: number } | null>(null)
  const mappedProjects = useMemo(() => projects.filter(isMappableProject), [projects])
  const geography = useMemo(() => getMapGeography(projects, geographicRecords), [projects, geographicRecords])
  const groups = useMemo(() => reportingGroups(projects.filter(project => geography.representedIds.has(project.id))), [projects, geography])
  const approximateIds = useMemo(() => new Set([...geography.sourceRecords].filter(([, record]) => record.status === "approximate").map(([id]) => id)), [geography])
  const outOfRangeCount = projects.filter((project) => project.location && !isMappableProject(project)).length
  const focusIds = useMemo(() => selectedOpportunity?.projectIds ?? (selectedProjectId ? [selectedProjectId] : []), [selectedOpportunity, selectedProjectId])
  const projectPoints = useMemo(() => mappedProjects.map((project): DensityPoint => ({ id: project.id, position: [project.location.lon, project.location.lat] })), [mappedProjects])
  // The preview replaces the map source. It never becomes a Project or analysis input.
  const densityPoints = syntheticPreview ? syntheticDensityPoints : projectPoints
  const hierarchy = useMemo(() => buildDensityHierarchy(densityPoints), [densityPoints])
  const densityZoom = Math.min(12, Math.max(2, zoom))
  const frame = useMemo(() => getDensityFrame(hierarchy, densityZoom), [hierarchy, densityZoom])
  const pointOpacity = showDensity ? smoothstep(zoom - 11) : 1
  const densityOpacity = showDensity ? 1 - pointOpacity : 0
  const locations = useMemo(() => syntheticPreview
    ? syntheticDensityPoints.map(({ position: [lon, lat] }): [number, number] => [lat, lon])
    : geographicRecords ? geographyFitLocations(mappedProjects, geography) : getMapLocations(mappedProjects), [syntheticPreview, mappedProjects, geographicRecords, geography])
  const selectedLocations = useMemo(() => syntheticPreview ? [] : geographicRecords ? geographyFitLocations(mappedProjects, geography, focusIds) : getMapLocations(mappedProjects, focusIds), [syntheticPreview, mappedProjects, geographicRecords, geography, focusIds])
  const byId = useMemo(() => new Map(mappedProjects.map((project) => [project.id, project])), [mappedProjects])
  const candidateIds = useMemo(() => new Set(opportunities.flatMap((opportunity) => opportunity.projectIds)), [opportunities])
  const connections = useMemo(() => getMapConnections(byId, opportunities, selectedOpportunity, showConnections), [byId, opportunities, selectedOpportunity, showConnections])
  const insets = useMemo(() => boundedInsets(viewportInsets, size.width, size.height), [viewportInsets, size])
  const fitPadding = useMemo(() => boundedInsets({ top: insets.top + 72, right: insets.right + 24, bottom: insets.bottom + 40, left: insets.left + 24 }, size.width, size.height), [insets, size])
  const locationsKey = JSON.stringify([syntheticPreview, locations])
  const focusKey = JSON.stringify(syntheticPreview ? [] : [focusIds, selectedLocations])
  const layoutKey = `${size.width}:${size.height}:${insets.top}:${insets.right}:${insets.bottom}:${insets.left}`
  const focusCell = useCallback((cell: DensityCell) => {
    const current = map.current
    if (!current || !ready) return
    const [west, south, east, north] = cell.bounds
    current.jumpTo({ pitch: 0, bearing: 0 })
    current.fitBounds([[west, south], [east, north]], { padding: fitPadding, maxZoom: Math.min(14, current.getZoom() + 2), animate: false, duration: 0 })
  }, [ready, fitPadding])
  const layers = useMemo(() => [
    ...densityLayers({ cells: frame.cells, columns, opacity: densityOpacity, onCell: focusCell }),
    ...(syntheticPreview ? [syntheticPointLayer(syntheticDensityPoints, pointOpacity)]
      : [...geographyLayers(geography, focusIds, onProject), ...projectLayers({ projects: mappedProjects, connections, focusIds, candidateIds, selectedPair: selectedOpportunity !== null, pointOpacity, approximateIds, onProject, onOpportunity })]),
  ], [geography, approximateIds, frame, columns, densityOpacity, focusCell, syntheticPreview, pointOpacity, mappedProjects, connections, focusIds, candidateIds, selectedOpportunity, onProject, onOpportunity])
  const getTooltip = useCallback(({ object }: PickingInfo): string | null => {
    if (!object) return null
    if ("members" in object) return geographyAreaLabel(object as GeographyArea, focusIds)
    if ("record" in object) { const point = object as GeographyPoint; return `${point.project.name}\n${geographyLabel(point.record)}` }
    if ("quadkey" in object) {
      const cell = object as DensityCell
      return `${cell.count.toLocaleString()} observed ${syntheticPreview ? "sample locations" : "projects"} in this square\nDisplayed density: ${densityNumber.format(cell.density)} / 1,000 km²\nArea: ${densityNumber.format(cell.areaKm2)} km²\nClick to focus`
    }
    if (syntheticPreview) return "Synthetic location · map preview only"
    const record = "id" in object ? geography.sourceRecords.get(String(object.id)) : undefined
    return "name" in object ? `${String(object.name)}${record ? `\n${geographyLabel(record)}` : ""}` : null
  }, [syntheticPreview, geography, focusIds])

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
        // Fit is deliberately flat/north-up so the full bounds fit outside panel occlusion.
        current.jumpTo({ pitch: 0, bearing: 0 })
        current.fitBounds(bounds, { padding: fitPadding, maxZoom: useSelection && points.length > 1 ? 12 : 10, animate: false, duration: 0 })
      }
      lastFit.current = { locationsKey, focusKey, layoutKey, revision: fitRequest.revision }
    }
  }, [ready, visible, size, fitPadding, locations, selectedLocations, locationsKey, focusKey, layoutKey, fitRequest])

  function fit(target: FitTarget) { setFitRequest((previous) => ({ target, revision: previous.revision + 1 })) }

  return <section ref={setContainer} className="relative h-full min-h-0 w-full min-w-0 overflow-hidden" aria-label="Experimental project map">
    <MapGL ref={map} initialViewState={{ longitude: -82.5, latitude: 33.2, zoom: 7 }} mapStyle={MAP_STYLE} attributionControl={false} renderWorldCopies={false} maxPitch={60} onLoad={() => setReady(true)} onError={() => setMapError(true)} onPitch={(event) => setPitch(event.viewState.pitch)} onZoom={(event) => setZoom(event.viewState.zoom)} style={{ width: "100%", height: "100%" }}>
      <DeckOverlay layers={layers} effects={effects} interleaved getTooltip={getTooltip} onError={() => setMapError(true)} />
      <AttributionControl compact={false} style={{ marginRight: insets.right + 8, marginBottom: insets.bottom + 8, maxWidth: Math.max(40, size.width - insets.left - insets.right - 16), maxHeight: Math.max(24, (size.height - insets.top - insets.bottom) / 3), overflow: "auto", whiteSpace: "normal" }} />
    </MapGL>
    <div className="pointer-events-auto absolute right-3 top-3 z-10 flex max-h-[calc(100%-1.5rem)] max-w-[calc(100%-1.5rem)] flex-col items-end gap-2 overflow-y-auto overscroll-contain">
      <div className="flex shrink-0 items-center gap-2">
        <div className="flex items-center gap-1 rounded-lg border bg-background p-1" role="group" aria-label="Map zoom">
          <IconButton variant="ghost" label="Zoom in" disabled={!ready} onClick={() => map.current?.zoomIn({ duration: 0 })}><PlusIcon aria-hidden="true" /></IconButton>
          <IconButton variant="ghost" label="Zoom out" disabled={!ready} onClick={() => map.current?.zoomOut({ duration: 0 })}><MinusIcon aria-hidden="true" /></IconButton>
        </div>
        <IconButton variant="outline" label={syntheticPreview ? "Fit sample" : "Fit projects"} disabled={!ready || !locations.length} onClick={() => fit("projects")}><ScanIcon aria-hidden="true" /></IconButton>
      </div>
      {visible && container && !syntheticPreview && <div className="shrink-0"><MapLegend geography={geographicRecords ? geography : undefined} groups={groups} boundary={container} connectionCount={selectedOpportunity || pointOpacity > 0 ? connections.length : 0} selectedPair={selectedOpportunity !== null} showConnections={showConnections} onShowConnections={onShowConnections} /></div>}
      <Button type="button" variant="outline" size="sm" className="shrink-0" disabled={!ready || !selectedLocations.length} onClick={() => fit("selection")}>Fit selection</Button>
      {visible && <DropdownMenu>
        <DropdownMenuTrigger asChild><Button type="button" variant="outline" size="sm" className="shrink-0">Map view</Button></DropdownMenuTrigger>
        <DropdownMenuContent align="end" collisionBoundary={container} style={{ width: 256, maxWidth: "var(--radix-dropdown-menu-content-available-width)" }} onPointerDown={(event) => event.stopPropagation()} onKeyDown={(event) => event.stopPropagation()} onWheel={(event) => event.stopPropagation()}>
          <DropdownMenuLabel>Map view</DropdownMenuLabel>
          <DropdownMenuRadioGroup value="experimental" onValueChange={(value) => { if (value === "standard") onChangeRenderer() }}>
            <DropdownMenuRadioItem value="standard">Standard</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="experimental">Experimental</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
          <DropdownMenuSeparator />
          <DropdownMenuCheckboxItem checked={showDensity} onCheckedChange={(value) => setShowDensity(value === true)}>Density cells</DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem checked={columns} disabled={!ready || !showDensity} onCheckedChange={(value) => { setColumns(value === true); map.current?.jumpTo({ pitch: value ? 45 : 0 }) }}>Raised columns</DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem checked={pitch > 0} disabled={!ready} onCheckedChange={(value) => map.current?.jumpTo({ pitch: value ? 45 : 0 })}>Tilt view</DropdownMenuCheckboxItem>
          <DropdownMenuItem disabled={!ready} onSelect={() => map.current?.jumpTo({ pitch: 0, bearing: 0 })}>Reset north and tilt</DropdownMenuItem>
          <p className="px-2 py-1.5 text-xs text-muted-foreground">Teal to amber means increasing density on a fixed logarithmic scale, capped at 10,000 per 1,000 km². Column height is display exaggeration; face shading comes from lighting. Hover for observed counts; zoom in for locations.</p>
          <DropdownMenuSeparator />
          <DropdownMenuCheckboxItem checked={syntheticPreview} onCheckedChange={(value) => setSyntheticPreview(value === true)}>Synthetic density preview</DropdownMenuCheckboxItem>
          <p className="px-2 py-1.5 text-xs text-muted-foreground">2,400 invented locations replace the map only. Results and your project selection stay unchanged.</p>
          <DropdownMenuSeparator />
          <p className="px-2 py-1.5 text-xs text-muted-foreground">Right-drag to rotate and tilt. Fit returns to a flat, north-up view.</p>
        </DropdownMenuContent>
      </DropdownMenu>}
      <div className="max-w-28 shrink-0 rounded border bg-background px-2 py-1 text-xs">
        <p>{syntheticPreview ? "Synthetic density preview" : "Experimental"}</p>
        {syntheticPreview && <p>2,400 sample locations</p>}
        {showDensity && densityOpacity > 0 && <div className="mt-1">
          <p>{syntheticPreview ? "Samples" : "Projects"} / 1,000 km²</p>
          <div className="my-1 h-2 rounded-sm" aria-hidden="true" style={{ background: DENSITY_LEGEND_GRADIENT }} />
          <p className="flex justify-between gap-1"><span>0</span><span>100</span><span>10,000+</span></p>
          {columns && <p className="mt-1">Height exaggerated</p>}
        </div>}
      </div>
      {!syntheticPreview && outOfRangeCount > 0 && <p className="max-w-28 shrink-0 rounded-lg border bg-background p-2 text-xs">{outOfRangeCount} located records are outside this projection; their coordinates are unchanged.</p>}
      {mapError && <p role="status" className="max-w-72 shrink-0 rounded-lg border bg-background p-2 text-xs">Experimental map unavailable or incomplete. <Button type="button" variant="link" size="sm" onClick={onChangeRenderer}>Use standard map</Button></p>}
    </div>
  </section>
}
