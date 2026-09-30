import { useEffect, useMemo, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { analyzeProjects } from "@/core"
import { DEFAULT_OPTIONS, UTILITIES, type AnalysisOptions, type Dataset } from "@/domain/schema"
import { BriefWorkspace } from "@/features/briefs/BriefWorkspace"
import { ProjectTimeline } from "@/features/scenarios/ProjectTimeline"
import { ScenarioControls } from "@/features/scenarios/ScenarioControls"
import { ComparisonPanel } from "./ComparisonPanel"
import { ProjectMap } from "./ProjectMap"
import { dateKind, projectDate } from "./format"

const PAGE_SIZE = 25
function Pagination({ page, count, onChange }: { page: number; count: number; onChange: (page: number) => void }) {
  const pages = Math.max(1, Math.ceil(count / PAGE_SIZE))
  return <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-t p-3"><p className="text-xs text-muted-foreground">{count ? `${page * PAGE_SIZE + 1}–${Math.min((page + 1) * PAGE_SIZE, count)} of ${count}` : "0 results"}</p><div className="flex gap-2"><Button variant="outline" size="sm" disabled={page === 0} aria-label="Previous results page" onClick={() => onChange(page - 1)}>Previous</Button><Button variant="outline" size="sm" disabled={page + 1 >= pages} aria-label="Next results page" onClick={() => onChange(page + 1)}>Next</Button></div></div>
}
export function Explorer({ dataset, active = true, projectToReveal = null }: { dataset: Dataset; active?: boolean; projectToReveal?: { id: string; request: number } | null }) {
  const [options, setOptions] = useState<AnalysisOptions>({ ...DEFAULT_OPTIONS })
  const [search, setSearch] = useState("")
  const [utility, setUtility] = useState("all")
  const [locationFilter, setLocationFilter] = useState("all")
  const [projectPage, setProjectPage] = useState(0)
  const [pairPage, setPairPage] = useState(0)
  const [listView, setListView] = useState("opportunities")
  const [listOpen, setListOpen] = useState(true)
  const [timelineOpen, setTimelineOpen] = useState(false)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
  const [selectedPairId, setSelectedPairId] = useState<string | null>(null)
  const listPanel = useRef<HTMLElement>(null)
  const comparisonPanel = useRef<HTMLDivElement>(null)
  const timelinePanel = useRef<HTMLElement>(null)
  const resultsPanel = useRef<HTMLDivElement>(null)
  const [viewportInsets, setViewportInsets] = useState({ top: 16, right: 0, bottom: 16, left: 0 })
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
  // A candidate stays discoverable when either member matches the project filters.
  const opportunities = useMemo(() => analysis.opportunities.filter((pair) => pair.projectIds.some((id) => visibleIds.has(id))), [analysis, visibleIds])
  const byId = useMemo(() => new Map(dataset.projects.map((project) => [project.id, project])), [dataset])
  const selectedProject = selectedProjectId ? byId.get(selectedProjectId) ?? null : null
  const selectedOpportunity = analysis.opportunities.find((pair) => pair.id === selectedPairId) ?? null
  const focusIds = new Set(selectedOpportunity?.projectIds ?? (selectedProjectId ? [selectedProjectId] : []))
  const mapProjects = useMemo(() => {
    const ids = new Set(projects.map((project) => project.id))
    opportunities.forEach((pair) => pair.projectIds.forEach((id) => ids.add(id)))
    if (selectedOpportunity) selectedOpportunity.projectIds.forEach((id) => ids.add(id))
    if (selectedProjectId) ids.add(selectedProjectId)
    return dataset.projects.filter((project) => ids.has(project.id))
  }, [dataset, projects, opportunities, selectedOpportunity, selectedProjectId])
  const activePairPage = Math.min(pairPage, Math.max(0, Math.ceil(opportunities.length / PAGE_SIZE) - 1))
  const activeProjectPage = Math.min(projectPage, Math.max(0, Math.ceil(projects.length / PAGE_SIZE) - 1))
  function clearFilters() { setSearch(""); setUtility("all"); setLocationFilter("all"); setProjectPage(0); setPairPage(0) }
  function selectProject(id: string) {
    const index = projects.findIndex(project => project.id === id)
    if (index < 0) clearFilters()
    setProjectPage(Math.floor(Math.max(0, index < 0 ? dataset.projects.findIndex(project => project.id === id) : index) / PAGE_SIZE))
    setSelectedProjectId(id); setSelectedPairId(null); setListView("projects"); setListOpen(true)
  }
  function selectPair(id: string) {
    const index = opportunities.findIndex(pair => pair.id === id)
    if (index < 0) clearFilters()
    setPairPage(Math.floor(Math.max(0, index < 0 ? analysis.opportunities.findIndex(pair => pair.id === id) : index) / PAGE_SIZE))
    setSelectedPairId(id); setSelectedProjectId(null); setListView("opportunities"); setListOpen(true)
  }
  function changeFilter(update: () => void) { update(); setProjectPage(0); setPairPage(0) }
  useEffect(() => {
    if (projectToReveal && byId.has(projectToReveal.id)) selectProject(projectToReveal.id)
  }, [projectToReveal])
  useEffect(() => {
    const measure = () => {
      const next = { top: 16, left: listOpen ? (listPanel.current?.offsetWidth ?? 0) + 24 : 16, right: (comparisonPanel.current?.offsetWidth ?? 0) + 24, bottom: timelineOpen ? (timelinePanel.current?.offsetHeight ?? 0) + 24 : 16 }
      setViewportInsets(previous => Object.keys(next).every(key => next[key as keyof typeof next] === previous[key as keyof typeof next]) ? previous : next)
    }
    const observer = new ResizeObserver(measure)
    for (const panel of [listPanel.current, comparisonPanel.current, timelinePanel.current]) if (panel) observer.observe(panel)
    measure()
    return () => observer.disconnect()
  }, [listOpen, timelineOpen])
  useEffect(() => {
    const container = resultsPanel.current
    const selected = container?.querySelector<HTMLElement>('[aria-pressed="true"]')
    if (container && selected) {
      const row = selected.getBoundingClientRect(), body = container.getBoundingClientRect()
      if (row.top < body.top) container.scrollTop += row.top - body.top
      else if (row.bottom > body.bottom) container.scrollTop += row.bottom - body.bottom
    }
  }, [selectedPairId, selectedProjectId, listView, listOpen, activePairPage, activeProjectPage])
  const page = listView === "opportunities" ? activePairPage : activeProjectPage
  const count = listView === "opportunities" ? opportunities.length : projects.length
  return <section className="flex h-full min-h-0 w-full min-w-0 flex-col overflow-hidden" aria-label="Coordination workspace">
    <div className="flex max-h-[20%] min-h-0 shrink-0 flex-wrap items-center gap-2 overflow-auto border-b bg-background p-3">
      <Button variant="outline" size="sm" aria-expanded={listOpen} aria-controls="project-list" onClick={() => setListOpen(value => !value)}>{listOpen ? "Hide list" : "Show list"}</Button>
      <ScenarioControls options={options} baseline={baseline} analysis={analysis} onApply={next => { setOptions(next); setPairPage(0) }} />
      <span className="text-xs text-muted-foreground">&lt;{options.radiusMiles} mi · {options.maxDateGapDays === null ? "Any milestone gap" : `≤${options.maxDateGapDays} days`} · {options.includeUnverified ? "Unverified included" : "Confirmed only"}</span>
      <Button variant="outline" size="sm" className="ml-auto" aria-expanded={timelineOpen} aria-controls="workspace-timeline" onClick={() => setTimelineOpen(value => !value)}>Timeline</Button>
      <Button variant="ghost" size="sm" onClick={() => { setListOpen(true); setTimelineOpen(false); setFiltersOpen(false) }}>Reset layout</Button>
    </div>
    <div className="relative min-h-0 min-w-0 flex-1 overflow-hidden">
      <div className="absolute inset-0"><ProjectMap visible={active} projects={mapProjects} opportunities={opportunities} selectedProjectId={selectedProjectId} selectedOpportunity={selectedOpportunity} onProject={selectProject} onOpportunity={selectPair} viewportInsets={viewportInsets} /></div>
      <div className="pointer-events-none absolute inset-0 flex min-h-0 min-w-0 flex-col gap-3 p-3">
        <div className="grid min-h-0 min-w-0 flex-1 gap-3" style={{ gridTemplateColumns: `${listOpen ? "min(30%,22rem)" : "0px"} minmax(0,1fr) min(34%,28rem)` }}>
          <aside ref={listPanel} id="project-list" aria-label="Browse projects and candidates" className={listOpen ? "pointer-events-auto flex min-h-0 min-w-0 flex-col overflow-hidden rounded-lg border bg-background" : "hidden"}>
            <div className="max-h-[45%] min-h-0 shrink-0 space-y-3 overflow-auto border-b p-3">
              <Label htmlFor="project-search">Search projects</Label><Input id="project-search" placeholder="Name, source ID, sponsor or voltage" value={search} onChange={event => changeFilter(() => setSearch(event.target.value))} />
              <div className="flex flex-wrap items-center gap-2"><Button size="sm" variant="outline" aria-expanded={filtersOpen} aria-controls="project-filters" onClick={() => setFiltersOpen(value => !value)}>Filters{utility !== "all" || locationFilter !== "all" ? " (active)" : ""}</Button>{(search || utility !== "all" || locationFilter !== "all") && <Button size="sm" variant="ghost" onClick={clearFilters}>Clear</Button>}<span className="text-xs text-muted-foreground">{projects.length} / {dataset.projects.length} projects</span></div>
              {filtersOpen && <div id="project-filters" className="space-y-3"><div className="space-y-2"><Label htmlFor="utility-filter">Reporting group</Label><Select value={utility} onValueChange={value => changeFilter(() => setUtility(value))}><SelectTrigger id="utility-filter" className="w-full"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Both filings</SelectItem><SelectItem value="desc">Dominion filing</SelectItem><SelectItem value="gpc">Georgia filing</SelectItem></SelectContent></Select></div><div className="space-y-2"><Label htmlFor="location-filter">Location coverage</Label><Select value={locationFilter} onValueChange={value => changeFilter(() => setLocationFilter(value))}><SelectTrigger id="location-filter" className="w-full"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All projects</SelectItem><SelectItem value="located">Located projects</SelectItem><SelectItem value="unlocated">Without locations</SelectItem></SelectContent></Select></div></div>}
            </div>
            <Tabs value={listView} onValueChange={setListView} className="min-h-0 min-w-0 flex-1 gap-0">
              <TabsList className="m-3 max-w-[calc(100%-1.5rem)] shrink-0 justify-start overflow-x-auto"><TabsTrigger value="opportunities">Candidates ({opportunities.length})</TabsTrigger><TabsTrigger value="projects">All projects ({projects.length})</TabsTrigger></TabsList>
              <div ref={resultsPanel} className="relative min-h-0 min-w-0 flex-1 overflow-auto overscroll-contain" tabIndex={0} role="region" aria-label="Search results">
                <TabsContent value="opportunities" className="m-0">
                  {opportunities.length ? <ul className="divide-y">{opportunities.slice(activePairPage * PAGE_SIZE, (activePairPage + 1) * PAGE_SIZE).map(pair => <li key={pair.id}><button type="button" aria-pressed={selectedPairId === pair.id} className="w-full space-y-2 p-3 text-left hover:bg-muted focus-visible:outline-offset-[-2px] aria-pressed:bg-muted [overflow-wrap:anywhere]" onClick={() => selectPair(pair.id)}><span className="block font-medium">#{pair.rank} {byId.get(pair.projectIds[0])?.name}<span className="block">↔ {byId.get(pair.projectIds[1])?.name}</span></span><span className="block text-sm">{pair.distanceMiles.toFixed(2)} mi · {pair.dateGapDays === null ? "Milestone gap unknown" : `${pair.dateGapDays} days`}</span><span className="block text-xs text-muted-foreground">{pair.locationConfidence} locations</span></button></li>)}</ul> : <div className="space-y-3 p-3 text-sm"><p>No candidates match. Projects without coordinates cannot be compared by distance.</p><Button variant="outline" size="sm" onClick={() => setListView("projects")}>Browse all projects</Button><p className="text-muted-foreground">Change the filters or scenario to broaden the search.</p></div>}
                </TabsContent>
                <TabsContent value="projects" className="m-0">
                  {projects.length ? <ul className="divide-y">{projects.slice(activeProjectPage * PAGE_SIZE, (activeProjectPage + 1) * PAGE_SIZE).map(project => <li key={project.id}><button type="button" aria-pressed={focusIds.has(project.id)} className="w-full space-y-2 p-3 text-left hover:bg-muted focus-visible:outline-offset-[-2px] aria-pressed:bg-muted [overflow-wrap:anywhere]" onClick={() => selectProject(project.id)}><span className="block font-medium">{project.name}</span><span className="block text-xs text-muted-foreground">{UTILITIES[project.utilityId]} · {project.sourceId ?? "No source ID"}</span><span className="block text-sm">{projectDate(project)} · {dateKind(project)}</span><span className="block text-xs text-muted-foreground">{project.location ? `${project.location.confidence} location` : "No coordinates · available in inventory"}</span></button></li>)}</ul> : <p className="p-3 text-sm text-muted-foreground">No projects match. Clear the search or change the filters.</p>}
                </TabsContent>
              </div>
              <Pagination page={page} count={count} onChange={listView === "opportunities" ? setPairPage : setProjectPage} />
            </Tabs>
          </aside>
          <div aria-hidden="true" className="col-start-2" />
          <div ref={comparisonPanel} className="pointer-events-auto col-start-3 flex min-h-0 min-w-0 flex-col overflow-hidden rounded-lg border bg-background"><ComparisonPanel dataset={dataset} selectedOpportunity={selectedOpportunity} selectedProject={selectedProject} onProject={selectProject} actions={<BriefWorkspace dataset={dataset} options={options} selectedOpportunity={selectedOpportunity} opportunities={analysis.opportunities} onShowCurrent={selectPair} />} /></div>
        </div>
        <section ref={timelinePanel} id="workspace-timeline" aria-label="Timeline panel" className={timelineOpen ? "pointer-events-auto flex h-[38%] min-h-0 min-w-0 shrink-0 flex-col gap-3 overflow-hidden rounded-lg border bg-background p-3" : "hidden"}><div className="flex shrink-0 items-center justify-between gap-3"><h2 className="font-medium">Project timeline</h2><Button size="sm" variant="ghost" onClick={() => setTimelineOpen(false)}>Close timeline</Button></div><ProjectTimeline projects={projects} selectedId={selectedProjectId} onProject={selectProject} /></section>
      </div>
    </div>
  </section>
}
