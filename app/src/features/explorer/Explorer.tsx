import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { analyzeProjects } from "@/core"
import { DEFAULT_OPTIONS, UTILITIES, type AnalysisOptions, type Dataset } from "@/domain/schema"
import { BriefWorkspace } from "@/features/briefs/BriefWorkspace"
import { ImpactPanel } from "@/features/impact/ImpactPanel"
import { ProjectTimeline } from "@/features/scenarios/ProjectTimeline"
import { ScenarioControls } from "@/features/scenarios/ScenarioControls"
import { PairDetails, ProjectDetails } from "./ProjectDetails"
import { ProjectMap } from "./ProjectMap"
import { dateKind, projectDate, timelineLabels } from "./format"

const PAGE_SIZE = 25
function Pagination({ page, count, onChange, label }: { page: number; count: number; onChange: (page: number) => void; label: string }) {
  const pages = Math.max(1, Math.ceil(count / PAGE_SIZE))
  return <div className="flex shrink-0 items-center justify-between gap-3 border-t pt-3"><p className="text-xs text-muted-foreground">{count ? `${page * PAGE_SIZE + 1}–${Math.min((page + 1) * PAGE_SIZE, count)} of ${count}` : "0 results"}</p><div className="flex gap-2"><Button variant="outline" size="sm" disabled={page === 0} aria-label={`Previous ${label} page`} onClick={() => onChange(page - 1)}>Previous</Button><Button variant="outline" size="sm" disabled={page + 1 >= pages} aria-label={`Next ${label} page`} onClick={() => onChange(page + 1)}>Next</Button></div></div>
}
function panelClass(active: boolean) {
  return active ? "flex min-h-0 min-w-0 flex-1 flex-col gap-3 overflow-hidden pt-3" : "hidden"
}
export function Explorer({ dataset }: { dataset: Dataset }) {
  const [options, setOptions] = useState<AnalysisOptions>({ ...DEFAULT_OPTIONS })
  const [search, setSearch] = useState("")
  const [utility, setUtility] = useState("all")
  const [locationFilter, setLocationFilter] = useState("all")
  const [projectPage, setProjectPage] = useState(0)
  const [pairPage, setPairPage] = useState(0)
  const [mainView, setMainView] = useState("opportunities")
  const [detailView, setDetailView] = useState("details")
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
  const [selectedPairId, setSelectedPairId] = useState<string | null>(null)
  const baseline = useMemo(() => analyzeProjects(dataset.projects, DEFAULT_OPTIONS), [dataset])
  const analysis = useMemo(() => analyzeProjects(dataset.projects, options), [dataset, options])
  const projects = useMemo(() => {
    const query = search.trim().toLocaleLowerCase()
    return dataset.projects.filter((project) => {
      const matchesSearch = !query || [project.name, project.description, project.sourceId, project.sponsor, ...project.voltageKv.map(String)].filter(Boolean).join(" ").toLocaleLowerCase().includes(query)
      return matchesSearch && (utility === "all" || utility === project.utilityId) && (locationFilter === "all" || (locationFilter === "located" ? project.location !== null : project.location === null))
    })
  }, [dataset, search, utility, locationFilter])
  const visibleIds = useMemo(() => new Set(projects.map((project) => project.id)), [projects])
  // A pair stays discoverable when either member matches the inventory filters.
  const opportunities = useMemo(() => analysis.opportunities.filter((pair) => pair.projectIds.some((id) => visibleIds.has(id))), [analysis, visibleIds])
  const byId = useMemo(() => new Map(dataset.projects.map((project) => [project.id, project])), [dataset])
  const selectedProject = selectedProjectId ? byId.get(selectedProjectId) ?? null : null
  const selectedOpportunity = analysis.opportunities.find((pair) => pair.id === selectedPairId) ?? null
  const impactLeft = selectedOpportunity ? byId.get(selectedOpportunity.projectIds[0]) : undefined
  const impactRight = selectedOpportunity ? byId.get(selectedOpportunity.projectIds[1]) : undefined
  const mapProjects = useMemo(() => {
    const ids = new Set(projects.map((project) => project.id))
    opportunities.forEach((pair) => pair.projectIds.forEach((id) => ids.add(id)))
    if (selectedOpportunity) selectedOpportunity.projectIds.forEach((id) => ids.add(id))
    if (selectedProjectId) ids.add(selectedProjectId)
    return dataset.projects.filter((project) => ids.has(project.id))
  }, [dataset, projects, opportunities, selectedOpportunity, selectedProjectId])
  function selectProject(id: string) { setSelectedProjectId(id); setSelectedPairId(null); setDetailView("details") }
  function selectPair(id: string) { setSelectedPairId(id); setSelectedProjectId(null); setDetailView("details") }
  function changeFilter(update: () => void) { update(); setProjectPage(0); setPairPage(0) }
  return <section className="flex h-full min-h-0 w-full min-w-0 flex-1 flex-col gap-4 overflow-hidden" aria-label="Coordination workspace">
    <div className="max-h-[45%] min-h-0 shrink-0 space-y-3 overflow-auto overscroll-contain">
      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-48 flex-1 space-y-2"><Label htmlFor="project-search">Search projects</Label><Input id="project-search" placeholder="Name, source ID, sponsor or voltage" value={search} onChange={(event) => changeFilter(() => setSearch(event.target.value))} /></div>
        <div className="space-y-2"><Label htmlFor="utility-filter">Reporting group</Label><Select value={utility} onValueChange={(value) => changeFilter(() => setUtility(value))}><SelectTrigger id="utility-filter" className="w-full"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Both filings</SelectItem><SelectItem value="desc">Dominion filing</SelectItem><SelectItem value="gpc">Georgia filing</SelectItem></SelectContent></Select></div>
        <div className="space-y-2"><Label htmlFor="location-filter">Location coverage</Label><Select value={locationFilter} onValueChange={(value) => changeFilter(() => setLocationFilter(value))}><SelectTrigger id="location-filter" className="w-full"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All projects</SelectItem><SelectItem value="located">Located projects</SelectItem><SelectItem value="unlocated">Without locations</SelectItem></SelectContent></Select></div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 flex-wrap items-center gap-3">
          <ScenarioControls options={options} baseline={baseline} analysis={analysis} onApply={(nextOptions) => { setOptions(nextOptions); setPairPage(0) }} />
          <p className="text-xs text-muted-foreground" aria-live="polite">Applied: &lt;{options.radiusMiles} mi; {options.maxDateGapDays === null ? "any milestone gap" : `≤${options.maxDateGapDays} days`}; {options.includeUnverified ? "unverified locations included" : "confirmed locations only"}</p>
        </div>
        <BriefWorkspace dataset={dataset} options={options} selectedOpportunity={selectedOpportunity} opportunities={analysis.opportunities} onShowCurrent={selectPair} />
      </div>
      <p className="text-xs text-muted-foreground" aria-live="polite">{projects.length} of {analysis.summary.totalProjects} projects match. {analysis.summary.unlocatedProjects} projects have no location and remain in the inventory.</p>
    </div>
    <div className="grid min-h-0 min-w-0 flex-1 grid-cols-[minmax(0,3fr)_minmax(0,2fr)] gap-4 overflow-hidden">
      <Card className="min-h-0 min-w-0"><CardContent className="flex min-h-0 min-w-0 flex-1 flex-col">
        <Tabs value={mainView} onValueChange={setMainView} className="min-h-0 min-w-0 flex-1">
          <TabsList className="max-w-full shrink-0 justify-start overflow-x-auto"><TabsTrigger value="opportunities">Candidates ({opportunities.length})</TabsTrigger><TabsTrigger value="projects">Inventory ({projects.length})</TabsTrigger><TabsTrigger value="map">Map</TabsTrigger><TabsTrigger value="timeline">Timeline</TabsTrigger></TabsList>
          <TabsContent forceMount value="opportunities" className={panelClass(mainView === "opportunities")}>
            <p className="shrink-0 text-xs text-muted-foreground">Nearest centers rank first. Each candidate includes at least one project matching the filters.</p>
            <div className="min-h-0 min-w-0 flex-1 overflow-auto" tabIndex={0} role="region" aria-label="Ranked candidates">
              {opportunities.length ? <Table className="min-w-[30rem]"><TableHeader><TableRow><TableHead>Rank / pair</TableHead><TableHead>Distance</TableHead><TableHead>Milestone gap</TableHead></TableRow></TableHeader><TableBody>{opportunities.slice(pairPage * PAGE_SIZE, (pairPage + 1) * PAGE_SIZE).map((pair) => <TableRow key={pair.id} data-state={selectedPairId === pair.id ? "selected" : undefined}><TableCell className="max-w-80 whitespace-normal break-words"><button type="button" className="text-left font-medium underline-offset-4 hover:underline focus-visible:underline" onClick={() => selectPair(pair.id)}><span className="text-muted-foreground">#{pair.rank} </span>{byId.get(pair.projectIds[0])?.name}<span className="block text-xs text-muted-foreground">↔ {byId.get(pair.projectIds[1])?.name}</span></button><span className="mt-1 block text-xs text-muted-foreground">{pair.locationConfidence} locations</span></TableCell><TableCell>{pair.distanceMiles.toFixed(2)} mi</TableCell><TableCell><span>{pair.dateGapDays === null ? "Unknown" : `${pair.dateGapDays} days`}</span><span className="mt-1 block max-w-40 whitespace-normal text-xs text-muted-foreground">{timelineLabels[pair.timelineRelation]}</span></TableCell></TableRow>)}</TableBody></Table> : <p className="py-6 text-sm text-muted-foreground">No candidates match this view. Change the filters or scenario to explore more projects.</p>}
            </div>
            <Pagination page={pairPage} count={opportunities.length} onChange={setPairPage} label="candidate" />
          </TabsContent>
          <TabsContent forceMount value="projects" className={panelClass(mainView === "projects")}>
            <div className="min-h-0 min-w-0 flex-1 overflow-auto" tabIndex={0} role="region" aria-label="Project inventory">
              {projects.length ? <Table className="min-w-[30rem]"><TableHeader><TableRow><TableHead>Project</TableHead><TableHead>Milestone</TableHead><TableHead>Location</TableHead></TableRow></TableHeader><TableBody>{projects.slice(projectPage * PAGE_SIZE, (projectPage + 1) * PAGE_SIZE).map((project) => <TableRow key={project.id} data-state={selectedProjectId === project.id ? "selected" : undefined}><TableCell className="max-w-80 whitespace-normal break-words"><button type="button" className="text-left font-medium underline-offset-4 hover:underline focus-visible:underline" onClick={() => selectProject(project.id)}>{project.name}</button><span className="mt-1 block text-xs text-muted-foreground">{UTILITIES[project.utilityId]}; {project.sourceId ?? "No source ID"}</span></TableCell><TableCell>{projectDate(project)}<span className="block text-xs text-muted-foreground">{dateKind(project)}</span></TableCell><TableCell>{project.location?.confidence ?? "Unknown"}</TableCell></TableRow>)}</TableBody></Table> : <p className="py-6 text-sm text-muted-foreground">No projects match these filters. Clear the search or change the reporting group.</p>}
            </div>
            <Pagination page={projectPage} count={projects.length} onChange={setProjectPage} label="inventory" />
          </TabsContent>
          <TabsContent forceMount value="map" className={panelClass(mainView === "map")}><ProjectMap visible={mainView === "map"} projects={mapProjects} opportunities={opportunities} selectedProjectId={selectedProjectId} selectedOpportunity={selectedOpportunity} onProject={selectProject} onOpportunity={selectPair} /></TabsContent>
          <TabsContent forceMount value="timeline" className={panelClass(mainView === "timeline")}><ProjectTimeline projects={projects} selectedId={selectedProjectId} onProject={selectProject} /></TabsContent>
        </Tabs>
      </CardContent></Card>
      <aside className="flex min-h-0 min-w-0 flex-col" aria-label="Selection evidence">
        <Tabs value={detailView} onValueChange={setDetailView} className="min-h-0 min-w-0 flex-1">
          <TabsList className="shrink-0"><TabsTrigger value="details">Details</TabsTrigger><TabsTrigger value="impact" disabled={!selectedOpportunity}>Impact</TabsTrigger></TabsList>
          <TabsContent forceMount value="details" className={detailView === "details" ? "min-h-0 min-w-0 flex-1 overflow-auto overscroll-contain [overflow-wrap:anywhere]" : "hidden"}>
            {selectedOpportunity ? <PairDetails opportunity={selectedOpportunity} projects={dataset.projects} onProject={selectProject} /> : <ProjectDetails project={selectedProject} />}
          </TabsContent>
          <TabsContent forceMount value="impact" className={detailView === "impact" ? "min-h-0 min-w-0 flex-1 overflow-auto overscroll-contain [overflow-wrap:anywhere]" : "hidden"}>
            {selectedOpportunity && impactLeft && impactRight ? <ImpactPanel opportunity={selectedOpportunity} projects={[impactLeft, impactRight]} /> : <p className="p-4 text-sm text-muted-foreground">Select a candidate to explore hypothetical corridor assumptions.</p>}
          </TabsContent>
        </Tabs>
      </aside>
    </div>
  </section>
}
