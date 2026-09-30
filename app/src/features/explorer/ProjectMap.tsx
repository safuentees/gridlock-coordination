import { useEffect, useMemo, useState } from "react"
import { CircleMarker, MapContainer, Polyline, Popup, TileLayer, useMap } from "react-leaflet"
import type { LatLngTuple } from "leaflet"
import "leaflet/dist/leaflet.css"
import { Button } from "@/components/ui/button"
import { UTILITIES, type Opportunity, type Project } from "@/domain/schema"

const colors = { desc: "#2563eb", gpc: "#b45309" }
function MapView({ projects, focusIds, fitRevision }: { projects: Project[]; focusIds: string[]; fitRevision: number }) {
  const map = useMap()
  const locations = useMemo(() => projects.flatMap((project): LatLngTuple[] => project.location ? [[project.location.lat, project.location.lon]] : []), [projects])
  useEffect(() => {
    if (locations.length) map.fitBounds(locations, { padding: [28, 28], maxZoom: 10, animate: false })
  }, [map, locations, fitRevision])
  useEffect(() => {
    const selected = projects.filter((project) => focusIds.includes(project.id)).flatMap((project): LatLngTuple[] => project.location ? [[project.location.lat, project.location.lon]] : [])
    if (selected.length) map.fitBounds(selected, { padding: [48, 48], maxZoom: selected.length === 1 ? 10 : 12, animate: false })
  }, [map, projects, focusIds])
  return null
}
export function ProjectMap({ projects, opportunities, selectedProjectId, selectedOpportunity, onProject, onOpportunity }: {
  projects: Project[]; opportunities: Opportunity[]; selectedProjectId: string | null; selectedOpportunity: Opportunity | null;
  onProject: (id: string) => void; onOpportunity: (id: string) => void;
}) {
  const [fitRevision, setFitRevision] = useState(0)
  const [tileError, setTileError] = useState(false)
  const focusIds = useMemo(() => selectedOpportunity?.projectIds ?? (selectedProjectId ? [selectedProjectId] : []), [selectedOpportunity, selectedProjectId])
  const byId = useMemo(() => new Map(projects.map((project) => [project.id, project])), [projects])
  const candidateIds = useMemo(() => new Set(opportunities.flatMap((opportunity) => opportunity.projectIds)), [opportunities])
  const lines = selectedOpportunity ? [selectedOpportunity] : opportunities.slice(0, 100)
  return <section className="space-y-2" aria-label="Project map">
    <div className="flex flex-wrap items-center justify-between gap-2"><div className="flex flex-wrap gap-3 text-xs"><span><span aria-hidden="true" className="mr-1 inline-block size-2 rounded-full bg-blue-600" />Dominion filing</span><span><span aria-hidden="true" className="mr-1 inline-block size-2 rounded-full bg-amber-700" />Georgia filing</span><span>Outlined points have candidates</span></div><Button variant="outline" size="sm" onClick={() => setFitRevision((value) => value + 1)}>Fit visible projects</Button></div>
    <MapContainer center={[33.2, -82.5]} zoom={7} scrollWheelZoom={false} className="z-0 h-[420px] w-full rounded-lg border" aria-label="Map of located projects">
      <MapView projects={projects} focusIds={focusIds} fitRevision={fitRevision} />
      <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" eventHandlers={{ tileerror: () => setTileError(true) }} />
      {lines.map((opportunity) => {
        const left = byId.get(opportunity.projectIds[0])?.location
        const right = byId.get(opportunity.projectIds[1])?.location
        if (!left || !right) return null
        return <Polyline key={opportunity.id} positions={[[left.lat, left.lon], [right.lat, right.lon]]} pathOptions={{ color: "#525252", weight: selectedOpportunity ? 3 : 1.5, opacity: selectedOpportunity ? 0.9 : 0.3, dashArray: "5 5" }} eventHandlers={{ click: () => onOpportunity(opportunity.id) }} />
      })}
      {projects.map((project) => project.location && <CircleMarker key={project.id} center={[project.location.lat, project.location.lon]} radius={focusIds.includes(project.id) ? 8 : 5} pathOptions={{ color: focusIds.includes(project.id) || candidateIds.has(project.id) ? "#171717" : colors[project.utilityId], fillColor: colors[project.utilityId], fillOpacity: 0.85, weight: focusIds.includes(project.id) ? 3 : candidateIds.has(project.id) ? 2 : 1 }} eventHandlers={{ click: () => onProject(project.id) }}>
        <Popup><strong>{project.name}</strong><p>{UTILITIES[project.utilityId]}<br />{project.location.confidence} · {project.location.method.replaceAll("-", " ")}</p><button type="button" className="underline" onClick={() => onProject(project.id)}>Show project evidence</button></Popup>
      </CircleMarker>)}
    </MapContainer>
    {tileError && <p role="status" className="text-xs text-muted-foreground">Basemap tiles could not load. Project coordinates, inventory and evidence remain available.</p>}
    <p className="text-xs text-muted-foreground">Dashed lines connect project centers, not routes. {selectedOpportunity ? "Showing the selected candidate." : `Showing ${Math.min(100, opportunities.length)} candidate connections; all candidates are in the ranked list.`} Use map zoom controls or drag to navigate.</p>
  </section>
}
