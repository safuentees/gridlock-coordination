import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import { ArrowLeftIcon, ChevronLeftIcon, ChevronRightIcon, FunnelIcon, PanelLeftCloseIcon, PanelLeftOpenIcon, XIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { IconButton } from "@/components/ui/icon-button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { analyzeProjects } from "@/core"
import { DEFAULT_OPTIONS, UTILITIES, type AnalysisOptions, type AnalysisResult, type Dataset } from "@/domain/schema"
import { matchesProjectQuery } from "@/lib/project-search"
import { BriefWorkspace, type ScenarioSaveRequest } from "@/features/briefs/BriefWorkspace"
import { ProjectTimeline } from "@/features/scenarios/ProjectTimeline"
import { ScenarioControls } from "@/features/scenarios/ScenarioControls"
import { ComparisonPanel } from "./ComparisonPanel"
import { ProjectMap } from "./ProjectMap"
import { dateKind, projectDate } from "./format"

const PAGE_SIZE = 25
const VIEW_CLASS = "flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden motion-safe:animate-in motion-safe:fade-in-0 motion-safe:duration-150 motion-reduce:animate-none"
type PanelView = "results" | "detail"
type FocusRequest = PanelView | "expand" | null

function Pagination({ page, count, onChange }: { page: number; count: number; onChange: (page: number) => void }) {
  const pages = Math.max(1, Math.ceil(count / PAGE_SIZE))
  return <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-t p-3"><p className="text-xs text-muted-foreground">{count ? `${page * PAGE_SIZE + 1}–${Math.min((page + 1) * PAGE_SIZE, count)} of ${count}` : "0 results"}</p><div className="flex gap-2"><IconButton variant="outline" disabled={page === 0} label="Previous page" onClick={() => onChange(page - 1)}><ChevronLeftIcon aria-hidden="true" /></IconButton><IconButton variant="outline" disabled={page + 1 >= pages} label="Next page" onClick={() => onChange(page + 1)}><ChevronRightIcon aria-hidden="true" /></IconButton></div></div>
}
export function Explorer({ dataset, options, analysis, onOptionsChange, active = true, projectToReveal = null, candidateToReveal = null, reviewsRequest = 0 }: {
  dataset: Dataset; options: AnalysisOptions; analysis: AnalysisResult; onOptionsChange: (options: AnalysisOptions) => void;
  active?: boolean; projectToReveal?: { id: string; request: number } | null;
  candidateToReveal?: { id: string; request: number } | null; reviewsRequest?: number;
}) {
  const [search, setSearch] = useState("")
  const [utility, setUtility] = useState("all")
  const [locationFilter, setLocationFilter] = useState("all")
  const [projectPage, setProjectPage] = useState(0)
  const [pairPage, setPairPage] = useState(0)
  const [listView, setListView] = useState("opportunities")
  const [panelView, setPanelView] = useState<PanelView>("results")
  const [collapsed, setCollapsed] = useState(false)
  const [timelineOpen, setTimelineOpen] = useState(false)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
  const [selectedPairId, setSelectedPairId] = useState<string | null>(null)
  const [scenarioSaveRequest, setScenarioSaveRequest] = useState<ScenarioSaveRequest | null>(null)
  const panel = useRef<HTMLElement>(null)
  const timelinePanel = useRef<HTMLElement>(null)
  const resultsView = useRef<HTMLDivElement>(null)
  const resultsPanel = useRef<HTMLDivElement>(null)
  const detailView = useRef<HTMLDivElement>(null)
  const expandButton = useRef<HTMLButtonElement>(null)
  const backButton = useRef<HTMLButtonElement>(null)
  const listScroll = useRef<Record<string, number>>({ opportunities: 0, projects: 0 })
  const listFocus = useRef<Record<string, HTMLElement | null>>({ opportunities: null, projects: null })
  const detailFocus = useRef<HTMLElement | null>(null)
  const focusRequest = useRef<FocusRequest>(null)
  const [viewportInsets, setViewportInsets] = useState({ top: 16, right: 16, bottom: 16, left: 0 })
  const baseline = useMemo(() => analyzeProjects(dataset.projects, DEFAULT_OPTIONS), [dataset])
  const projects = useMemo(() => {
    return dataset.projects.filter((project) => {
      const matchesSearch = matchesProjectQuery(project, search)
      return matchesSearch && (utility === "all" || utility === project.utilityId) && (locationFilter === "all" || (locationFilter === "located" ? project.location !== null : project.location === null))
    })
  }, [dataset, search, utility, locationFilter])
  const visibleIds = useMemo(() => new Set(projects.map((project) => project.id)), [projects])
  // A candidate stays discoverable when either member matches the project filters.
  const opportunities = useMemo(() => analysis.opportunities.filter((pair) => pair.projectIds.some((id) => visibleIds.has(id))), [analysis, visibleIds])
  const byId = useMemo(() => new Map(dataset.projects.map((project) => [project.id, project])), [dataset])
  const selectedProject = selectedProjectId ? byId.get(selectedProjectId) ?? null : null
  const selectedOpportunity = analysis.opportunities.find((pair) => pair.id === selectedPairId) ?? null
  const selectedCandidateIndex = opportunities.findIndex(pair => pair.id === selectedPairId)
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
  const resultsVisible = !collapsed && panelView === "results"
  const detailVisible = !collapsed && panelView === "detail"

  function rememberResults() {
    if (active && resultsVisible && resultsPanel.current) listScroll.current[listView] = resultsPanel.current.scrollTop
  }
  function resetResultPages() {
    setProjectPage(0); setPairPage(0)
    listScroll.current = { opportunities: 0, projects: 0 }
    listFocus.current = { opportunities: null, projects: null }
  }
  function clearFilters() { setSearch(""); setUtility("all"); setLocationFilter("all"); resetResultPages() }
  function openDetail(moveFocus = true) {
    rememberResults()
    if (moveFocus) {
      detailFocus.current = null
      focusRequest.current = detailVisible ? null : "detail"
      if (detailVisible) backButton.current?.focus({ preventScroll: true })
    }
    setPanelView("detail"); setCollapsed(false)
  }
  function selectProject(id: string) {
    setSelectedProjectId(id); setSelectedPairId(null); openDetail()
  }
  function selectPair(id: string, moveFocus = true) {
    setSelectedPairId(id); setSelectedProjectId(null); openDetail(moveFocus)
  }
  function backToResults() { focusRequest.current = "results"; setPanelView("results"); setCollapsed(false) }
  function collapse() { rememberResults(); focusRequest.current = "expand"; setCollapsed(true) }
  function expand() { focusRequest.current = panelView; setCollapsed(false) }
  function changeFilter(update: () => void) { update(); resetResultPages() }
  function applyScenario(next: AnalysisOptions) {
    onOptionsChange(next); setPairPage(0)
    listScroll.current.opportunities = 0
    listFocus.current.opportunities = null
  }
  function changeListView(value: string) {
    rememberResults()
    listFocus.current[value] = document.activeElement instanceof HTMLElement ? document.activeElement : null
    setListView(value)
  }
  function changePage(page: number) {
    listScroll.current[listView] = 0
    if (listView === "opportunities") setPairPage(page)
    else setProjectPage(page)
  }
  useEffect(() => {
    if (projectToReveal && byId.has(projectToReveal.id)) selectProject(projectToReveal.id)
  }, [projectToReveal])
  useEffect(() => {
    if (candidateToReveal && analysis.opportunities.some(pair => pair.id === candidateToReveal.id)) selectPair(candidateToReveal.id)
  }, [candidateToReveal])
  useEffect(() => {
    if (reviewsRequest > 0) setCollapsed(false)
  }, [reviewsRequest])
  useLayoutEffect(() => {
    const measure = () => {
      const next = {
        top: collapsed ? (panel.current?.offsetHeight ?? 0) + 24 : 16,
        left: collapsed ? 16 : (panel.current?.offsetWidth ?? 0) + 24,
        right: 16,
        bottom: timelineOpen ? (timelinePanel.current?.offsetHeight ?? 0) + 24 : 16,
      }
      setViewportInsets(previous => Object.keys(next).every(key => next[key as keyof typeof next] === previous[key as keyof typeof next]) ? previous : next)
    }
    const observer = new ResizeObserver(measure)
    for (const element of [panel.current, timelinePanel.current]) if (element) observer.observe(element)
    measure()
    return () => observer.disconnect()
  }, [collapsed, timelineOpen])
  useLayoutEffect(() => {
    // Hidden panels can lose scroll geometry; restore the recorded context before focus.
    if (active && resultsVisible && resultsPanel.current) resultsPanel.current.scrollTop = listScroll.current[listView]
    const request = focusRequest.current
    if (!request || !active) return
    let target: HTMLElement | null = null
    if (request === "expand" && collapsed) target = expandButton.current
    if (request === "results" && resultsVisible) {
      const previous = listFocus.current[listView]
      target = previous?.isConnected && resultsView.current?.contains(previous) && !previous.closest("[hidden], [inert]") && !previous.matches(":disabled") ? previous : resultsPanel.current
    }
    if (request === "detail" && detailVisible) {
      const previous = detailFocus.current
      target = previous?.isConnected && detailView.current?.contains(previous) && !previous.closest("[hidden], [inert]") && !previous.matches(":disabled") ? previous : backButton.current
    }
    if (target) { target.focus({ preventScroll: true }); focusRequest.current = null }
  }, [active, collapsed, panelView, listView, activePairPage, activeProjectPage, selectedPairId, selectedProjectId, projects, opportunities])

  const page = listView === "opportunities" ? activePairPage : activeProjectPage
  const count = listView === "opportunities" ? opportunities.length : projects.length
  return <section className="relative h-full min-h-0 w-full min-w-0 overflow-hidden" aria-label="Coordination workspace">
    <div className="absolute inset-0"><ProjectMap visible={active} projects={mapProjects} opportunities={opportunities} selectedProjectId={selectedProjectId} selectedOpportunity={selectedOpportunity} onProject={selectProject} onOpportunity={selectPair} viewportInsets={viewportInsets} /></div>
    <div className="pointer-events-none absolute inset-0 flex min-h-0 min-w-0 flex-col gap-3 p-3">
      <div className="min-h-0 min-w-0 flex-1">
        <aside ref={panel} aria-label="Project workspace" className={`pointer-events-auto flex max-h-full min-w-0 flex-col overflow-hidden rounded-lg border bg-background ${collapsed ? "h-auto w-full max-w-lg" : "h-full min-h-0 w-[min(32rem,65%)]"}`}>
          <div className="shrink-0 space-y-2 border-b p-3">
            <Label htmlFor="project-search" className="sr-only">Search projects</Label>
            <div className="flex min-w-0 items-center gap-2">
              <Input id="project-search" className="min-w-0 flex-1" placeholder="Name, need, zone or source ID" value={search} onChange={event => changeFilter(() => setSearch(event.target.value))} />
              {collapsed
                ? <Button ref={expandButton} variant="outline" size="sm" aria-expanded={false} aria-controls="panel-results panel-detail" onClick={expand}><PanelLeftOpenIcon aria-hidden="true" data-icon="inline-start" />Expand</Button>
                : <IconButton variant="ghost" label="Collapse panel" aria-expanded={true} aria-controls="panel-results panel-detail" onClick={collapse}><PanelLeftCloseIcon aria-hidden="true" /></IconButton>}
            </div>
            {collapsed && <p className="text-xs text-muted-foreground">{count} {listView === "opportunities" ? "candidates" : "projects"}</p>}
          </div>
          <div hidden={collapsed} inert={collapsed} className={collapsed ? "hidden" : "max-h-[35%] min-h-0 shrink-0 space-y-3 overflow-auto border-b p-3"}>
              <div className="flex flex-wrap items-center gap-2">
                <Button size="sm" variant="outline" aria-expanded={filtersOpen} aria-controls="project-filters" onClick={() => setFiltersOpen(value => !value)}><FunnelIcon aria-hidden="true" data-icon="inline-start" />Filters{utility !== "all" || locationFilter !== "all" ? " (active)" : ""}</Button>
                <ScenarioControls options={options} baseline={baseline} analysis={analysis} onApply={applyScenario} />
                <Button variant="outline" size="sm" aria-expanded={timelineOpen} aria-controls="workspace-timeline" onClick={() => setTimelineOpen(value => !value)}>Timeline</Button>
                <Button variant="ghost" size="sm" onClick={() => { backToResults(); setTimelineOpen(false); setFiltersOpen(false) }}>Reset layout</Button>
              </div>
              <p className="text-xs text-muted-foreground">&lt;{options.radiusMiles} mi; {options.maxDateGapDays === null ? "Any milestone gap" : `≤${options.maxDateGapDays} days`}; {options.includeUnverified ? "Unverified included" : "Confirmed only"}</p>
              {filtersOpen && <div id="project-filters" className="space-y-3"><div className="space-y-2"><Label htmlFor="utility-filter">Reporting group</Label><Select value={utility} onValueChange={value => changeFilter(() => setUtility(value))}><SelectTrigger id="utility-filter" className="w-full"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Both filings</SelectItem><SelectItem value="desc">Dominion filing</SelectItem><SelectItem value="gpc">Georgia filing</SelectItem></SelectContent></Select></div><div className="space-y-2"><Label htmlFor="location-filter">Location</Label><Select value={locationFilter} onValueChange={value => changeFilter(() => setLocationFilter(value))}><SelectTrigger id="location-filter" className="w-full"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All projects</SelectItem><SelectItem value="located">Located projects</SelectItem><SelectItem value="unlocated">Without locations</SelectItem></SelectContent></Select></div></div>}
              {(search || utility !== "all" || locationFilter !== "all") && <Button size="sm" variant="ghost" onClick={clearFilters}>Clear filters</Button>}
          </div>
          <div hidden={collapsed} inert={collapsed} className={collapsed ? "hidden" : "max-h-[20%] min-h-0 min-w-0 shrink-0 overflow-auto border-b p-3"}>
            <BriefWorkspace dataset={dataset} options={options} selectedOpportunity={selectedOpportunity} opportunities={analysis.opportunities} onShowCurrent={selectPair} openRequest={reviewsRequest} saveScenarioRequest={scenarioSaveRequest} />
          </div>
          <div ref={resultsView} id="panel-results" hidden={!resultsVisible} inert={!resultsVisible} className={resultsVisible ? VIEW_CLASS : "hidden"} onFocusCapture={event => { listFocus.current[listView] = event.target as HTMLElement }}>
            <Tabs value={listView} onValueChange={changeListView} className="min-h-0 min-w-0 flex-1 gap-0">
              <TabsList className="m-3 max-w-[calc(100%-1.5rem)] shrink-0 justify-start overflow-x-auto"><TabsTrigger value="opportunities">Candidates ({opportunities.length})</TabsTrigger><TabsTrigger value="projects">All projects ({projects.length})</TabsTrigger></TabsList>
              {analysis.summary.unlocatedProjects > 0 && <p className="shrink-0 px-3 pb-3 text-xs text-muted-foreground">{analysis.summary.unlocatedProjects} projects need locations before they can be ranked.</p>}
              <div ref={resultsPanel} className="relative min-h-0 min-w-0 flex-1 overflow-auto overscroll-contain" tabIndex={0} role="region" aria-label="Search results" onScroll={event => { if (active && resultsVisible) listScroll.current[listView] = event.currentTarget.scrollTop }}>
                <TabsContent forceMount value="opportunities" hidden={listView !== "opportunities"} inert={listView !== "opportunities"} className={listView === "opportunities" ? "m-0" : "hidden"}>
                  {opportunities.length ? <ul className="divide-y">{opportunities.slice(activePairPage * PAGE_SIZE, (activePairPage + 1) * PAGE_SIZE).map(pair => <li key={pair.id}><button type="button" aria-pressed={selectedPairId === pair.id} className="w-full space-y-2 p-3 text-left hover:bg-muted focus-visible:outline-offset-[-2px] aria-pressed:bg-muted [overflow-wrap:anywhere]" onClick={() => selectPair(pair.id)}><span className="block font-medium">#{pair.rank} {byId.get(pair.projectIds[0])?.name}<span className="block">↔ {byId.get(pair.projectIds[1])?.name}</span></span><span className="block text-sm">{pair.distanceMiles.toFixed(2)} mi apart; {pair.dateGapDays === null ? "date gap unknown" : `${pair.dateGapDays} days between milestones`}</span><span className="block text-xs text-muted-foreground">{pair.locationConfidence} locations</span></button></li>)}</ul> : <div className="space-y-3 p-3 text-sm"><p>No candidates match this search and scenario.</p><Button variant="outline" size="sm" onClick={() => changeListView("projects")}>Browse all projects</Button><p className="text-muted-foreground">Widen the radius or clear filters.</p></div>}
                </TabsContent>
                <TabsContent forceMount value="projects" hidden={listView !== "projects"} inert={listView !== "projects"} className={listView === "projects" ? "m-0" : "hidden"}>
                  {projects.length ? <ul className="divide-y">{projects.slice(activeProjectPage * PAGE_SIZE, (activeProjectPage + 1) * PAGE_SIZE).map(project => <li key={project.id}><button type="button" aria-pressed={focusIds.has(project.id)} className="w-full space-y-2 p-3 text-left hover:bg-muted focus-visible:outline-offset-[-2px] aria-pressed:bg-muted [overflow-wrap:anywhere]" onClick={() => selectProject(project.id)}><span className="block font-medium">{project.name}</span><span className="block text-xs text-muted-foreground">{UTILITIES[project.utilityId]}{project.sourceId && `; ${project.sourceId}`}</span><span className="block text-sm">{dateKind(project)}: {projectDate(project)}</span><span className="block text-xs text-muted-foreground">{project.location ? `${project.location.confidence} location` : "Location missing"}</span></button></li>)}</ul> : <p className="p-3 text-sm text-muted-foreground">No projects match. Clear the search or change the filters.</p>}
                </TabsContent>
              </div>
              <Pagination page={page} count={count} onChange={changePage} />
            </Tabs>
          </div>
          <div ref={detailView} id="panel-detail" hidden={!detailVisible} inert={!detailVisible} className={detailVisible ? VIEW_CLASS : "hidden"} onFocusCapture={event => { detailFocus.current = event.target as HTMLElement }}>
            <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b p-3">
              <Button ref={backButton} variant="ghost" size="sm" onClick={backToResults}><ArrowLeftIcon aria-hidden="true" data-icon="inline-start" />Back to results</Button>
              {selectedOpportunity && <div className="flex items-center gap-2"><span className="text-xs text-muted-foreground">{selectedCandidateIndex < 0 ? "Outside current results" : `${selectedCandidateIndex + 1} of ${opportunities.length} candidates`}</span><IconButton variant="outline" label="Previous candidate" disabled={selectedCandidateIndex <= 0} onClick={() => selectPair(opportunities[selectedCandidateIndex - 1].id, false)}><ChevronLeftIcon aria-hidden="true" /></IconButton><IconButton variant="outline" label="Next candidate" disabled={selectedCandidateIndex < 0 || selectedCandidateIndex + 1 >= opportunities.length} onClick={() => selectPair(opportunities[selectedCandidateIndex + 1].id, false)}><ChevronRightIcon aria-hidden="true" /></IconButton></div>}
            </div>
            <div className="min-h-0 min-w-0 flex-1 overflow-hidden"><ComparisonPanel dataset={dataset} selectedOpportunity={selectedOpportunity} selectedProject={selectedProject} onProject={selectProject} onSaveScenario={(pairId, inputs) => setScenarioSaveRequest(previous => ({ pairId, mode: dataset.mode, request: (previous?.request ?? 0) + 1, inputs: { ...inputs } }))} /></div>
          </div>
        </aside>
      </div>
      <section ref={timelinePanel} id="workspace-timeline" aria-label="Timeline panel" hidden={!timelineOpen} inert={!timelineOpen} className={timelineOpen ? "pointer-events-auto flex h-[38%] min-h-0 min-w-0 shrink-0 flex-col gap-3 overflow-hidden rounded-lg border bg-background p-3" : "hidden"}><div className="flex shrink-0 items-center justify-between gap-3"><h2 className="font-medium">Project timeline</h2><IconButton variant="ghost" label="Close timeline" onClick={() => setTimelineOpen(false)}><XIcon aria-hidden="true" /></IconButton></div><ProjectTimeline projects={projects} selectedId={selectedProjectId} onProject={selectProject} /></section>
    </div>
  </section>
}
