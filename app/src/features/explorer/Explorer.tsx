import { useMemo, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { analyzeProjects } from "@/core"
import { DEFAULT_OPTIONS, UTILITIES, type AnalysisOptions, type Dataset } from "@/domain/schema"
import { BriefWorkspace } from "@/features/briefs/BriefWorkspace"
import { ProjectTimeline } from "@/features/scenarios/ProjectTimeline"
import { ScenarioControls } from "@/features/scenarios/ScenarioControls"
import { PairDetails, ProjectDetails } from "./ProjectDetails"
import { ProjectMap } from "./ProjectMap"
import { dateKind, projectDate, timelineLabels } from "./format"

const PAGE_SIZE = 25
function Pagination({ page, count, onChange, label }: { page: number; count: number; onChange: (page: number) => void; label: string }) {
  const pages = Math.max(1, Math.ceil(count / PAGE_SIZE))
  return <div className="flex items-center justify-between gap-3 border-t pt-3"><p className="text-xs text-muted-foreground">{count ? `${page * PAGE_SIZE + 1}–${Math.min((page + 1) * PAGE_SIZE, count)} of ${count}` : "0 results"}</p><div className="flex gap-2"><Button variant="outline" size="sm" disabled={page === 0} aria-label={`Previous ${label} page`} onClick={() => onChange(page - 1)}>Previous</Button><Button variant="outline" size="sm" disabled={page + 1 >= pages} aria-label={`Next ${label} page`} onClick={() => onChange(page + 1)}>Next</Button></div></div>
}
export function Explorer({ dataset }: { dataset: Dataset }) {
  const [options, setOptions] = useState<AnalysisOptions>({ ...DEFAULT_OPTIONS })
  const [search, setSearch] = useState("")
  const [utility, setUtility] = useState("all")
  const [locationFilter, setLocationFilter] = useState("all")
  const [projectPage, setProjectPage] = useState(0)
  const [pairPage, setPairPage] = useState(0)
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
  const mapProjects = useMemo(() => {
    const ids = new Set(projects.map((project) => project.id))
    opportunities.forEach((pair) => pair.projectIds.forEach((id) => ids.add(id)))
    if (selectedOpportunity) selectedOpportunity.projectIds.forEach((id) => ids.add(id))
    if (selectedProjectId) ids.add(selectedProjectId)
    return dataset.projects.filter((project) => ids.has(project.id))
  }, [dataset, projects, opportunities, selectedOpportunity, selectedProjectId])
  function selectProject(id: string) { setSelectedProjectId(id); setSelectedPairId(null) }
  function selectPair(id: string) { setSelectedPairId(id); setSelectedProjectId(null) }
  function changeFilter(update: () => void) { update(); setProjectPage(0); setPairPage(0) }
  return <div className="space-y-6">
    <div className="flex flex-wrap gap-2" aria-live="polite"><Badge variant="secondary">{analysis.summary.totalProjects} projects</Badge><Badge variant="secondary">{analysis.summary.locatedProjects} located</Badge><Badge variant="outline">{analysis.summary.unlocatedProjects} without locations</Badge><Badge>{analysis.opportunities.length} candidates under {options.radiusMiles} mi</Badge></div>
    <ScenarioControls options={options} baseline={baseline} analysis={analysis} onApply={(nextOptions) => { setOptions(nextOptions); setPairPage(0) }} />
    <Card><CardHeader><CardTitle>Explore projects</CardTitle><CardDescription>Search the full inventory. Candidate matches use different reporting groups and rank nearest project centers first.</CardDescription></CardHeader><CardContent className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-[minmax(200px,1fr)_auto_auto]">
        <div className="space-y-2"><Label htmlFor="project-search">Search projects</Label><Input id="project-search" placeholder="Name, source ID, sponsor or voltage" value={search} onChange={(event) => changeFilter(() => setSearch(event.target.value))} /></div>
        <div className="space-y-2"><Label htmlFor="utility-filter">Reporting group</Label><Select value={utility} onValueChange={(value) => changeFilter(() => setUtility(value))}><SelectTrigger id="utility-filter" className="w-full"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Both filings</SelectItem><SelectItem value="desc">Dominion filing</SelectItem><SelectItem value="gpc">Georgia filing</SelectItem></SelectContent></Select></div>
        <div className="space-y-2"><Label htmlFor="location-filter">Location coverage</Label><Select value={locationFilter} onValueChange={(value) => changeFilter(() => setLocationFilter(value))}><SelectTrigger id="location-filter" className="w-full"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All projects</SelectItem><SelectItem value="located">Located projects</SelectItem><SelectItem value="unlocated">Without locations</SelectItem></SelectContent></Select></div>
      </div>
      <p className="text-xs text-muted-foreground" aria-live="polite">{projects.length} matching projects. Candidates include pairs with at least one matching project. The map also shows their counterparts and the current selection.</p>
      <ProjectMap projects={mapProjects} opportunities={opportunities} selectedProjectId={selectedProjectId} selectedOpportunity={selectedOpportunity} onProject={selectProject} onOpportunity={selectPair} />
    </CardContent></Card>
    <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,3fr)_minmax(340px,2fr)]">
      <Card><CardContent><Tabs defaultValue="opportunities"><TabsList><TabsTrigger value="opportunities">Candidates ({opportunities.length})</TabsTrigger><TabsTrigger value="projects">Inventory ({projects.length})</TabsTrigger><TabsTrigger value="timeline">Timeline</TabsTrigger></TabsList>
        <TabsContent value="opportunities" className="space-y-3 pt-3">
          <p className="text-xs text-muted-foreground">Distance is primary; milestone date separation is secondary context. {options.includeUnverified ? "Unverified locations are included." : "Both locations must be marked confirmed."} Construction timing remains unknown unless source windows are explicit.</p>
          {opportunities.length ? <Table><TableHeader><TableRow><TableHead>Rank / pair</TableHead><TableHead>Distance</TableHead><TableHead>Milestone gap</TableHead></TableRow></TableHeader><TableBody>{opportunities.slice(pairPage * PAGE_SIZE, (pairPage + 1) * PAGE_SIZE).map((pair) => <TableRow key={pair.id} data-state={selectedPairId === pair.id ? "selected" : undefined}><TableCell className="whitespace-normal"><button type="button" className="text-left font-medium underline-offset-4 hover:underline focus-visible:underline" onClick={() => selectPair(pair.id)}><span className="text-muted-foreground">#{pair.rank} </span>{byId.get(pair.projectIds[0])?.name} <span className="block text-xs text-muted-foreground">↔ {byId.get(pair.projectIds[1])?.name}</span></button><span className="mt-1 block text-xs text-muted-foreground">{pair.locationConfidence} locations</span></TableCell><TableCell>{pair.distanceMiles.toFixed(2)} mi</TableCell><TableCell><span>{pair.dateGapDays === null ? "Unknown" : `${pair.dateGapDays} days`}</span><span className="mt-1 block max-w-40 whitespace-normal text-xs text-muted-foreground">{timelineLabels[pair.timelineRelation]}</span></TableCell></TableRow>)}</TableBody></Table> : <p className="py-6 text-sm text-muted-foreground">No candidates match this view. Projects need locations in both reporting groups to be compared. The full inventory remains available.</p>}
          <Pagination page={pairPage} count={opportunities.length} onChange={setPairPage} label="candidate" />
        </TabsContent>
        <TabsContent value="projects" className="space-y-3 pt-3">
          {projects.length ? <Table><TableHeader><TableRow><TableHead>Project</TableHead><TableHead>Milestone</TableHead><TableHead>Location</TableHead></TableRow></TableHeader><TableBody>{projects.slice(projectPage * PAGE_SIZE, (projectPage + 1) * PAGE_SIZE).map((project) => <TableRow key={project.id} data-state={selectedProjectId === project.id ? "selected" : undefined}><TableCell className="whitespace-normal"><button type="button" className="text-left font-medium underline-offset-4 hover:underline focus-visible:underline" onClick={() => selectProject(project.id)}>{project.name}</button><span className="mt-1 block text-xs text-muted-foreground">{UTILITIES[project.utilityId]}; {project.sourceId ?? "No source ID"}</span></TableCell><TableCell>{projectDate(project)}<span className="block text-xs text-muted-foreground">{dateKind(project)}</span></TableCell><TableCell>{project.location?.confidence ?? "Unknown"}</TableCell></TableRow>)}</TableBody></Table> : <p className="py-6 text-sm text-muted-foreground">No projects match these filters. Clear the search or change the reporting group.</p>}
          <Pagination page={projectPage} count={projects.length} onChange={setProjectPage} label="inventory" />
        </TabsContent>
        <TabsContent value="timeline" className="pt-3"><ProjectTimeline projects={projects} selectedId={selectedProjectId} onProject={selectProject} /></TabsContent>
      </Tabs></CardContent></Card>
      <aside aria-label="Selection evidence" aria-live="polite">{selectedOpportunity ? <PairDetails opportunity={selectedOpportunity} projects={dataset.projects} onProject={selectProject} /> : <ProjectDetails project={selectedProject} />}</aside>
    </div>
    <BriefWorkspace dataset={dataset} options={options} selectedOpportunity={selectedOpportunity} opportunities={analysis.opportunities} onShowCurrent={selectPair} />
    <details className="rounded-lg border p-4 text-sm"><summary className="cursor-pointer font-medium">Dataset coverage and assumptions</summary><div className="mt-3 space-y-2 text-muted-foreground"><p>{dataset.title}; Snapshot {dataset.generatedAt}</p><p>Processed {dataset.coverage.processed}; Skipped {dataset.coverage.skipped}; Failed {dataset.coverage.failed}</p>{dataset.coverage.notes.map((note, index) => <p key={index}>{note}</p>)}<p>Source snapshots are not live schedules. Past milestone dates do not establish completion. Map centers do not establish shared right-of-way.</p></div></details>
  </div>
}
