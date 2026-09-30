import { useMemo, useState } from "react"
import { BookmarkIcon, ChartNoAxesCombinedIcon, DatabaseIcon, HouseIcon, ListChecksIcon, MapIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { loadDataset } from "@/data/provider"
import { clearSourceSession, readSourceSession, saveSourceSession } from "@/data/source-session"
import { Explorer } from "@/features/explorer/Explorer"
import { HomePage } from "@/features/home/HomePage"
import { OutcomesWorkspace } from "@/features/outcomes/OutcomesWorkspace"
import { DatasetImport } from "@/features/import/DatasetImport"
import { ReadinessWorkspace } from "@/features/readiness/ReadinessWorkspace"
import { analyzeProjects } from "@/core"
import { DEFAULT_OPTIONS, type AnalysisOptions, type DataMode, type Dataset } from "@/domain/schema"
import type { Workspace } from "@/domain/workspace"
import { sourceEditionLabels } from "@/lib/presentation"

export function App() {
  const [mode, setMode] = useState<DataMode>("real")
  const [savedSource, setSavedSource] = useState(readSourceSession)
  const [sourceOverride, setSourceOverride] = useState<Dataset | null>(savedSource.dataset)
  const [workspace, setWorkspace] = useState<Workspace>("home")
  const [scenarios, setScenarios] = useState<Record<DataMode, AnalysisOptions>>({ real: { ...DEFAULT_OPTIONS }, demo: { ...DEFAULT_OPTIONS } })
  const [revealProject, setRevealProject] = useState<{ id: string; request: number } | null>(null)
  const [revealCandidate, setRevealCandidate] = useState<{ id: string; request: number } | null>(null)
  const [reviewsRequest, setReviewsRequest] = useState(0)
  const [datasetOpen, setDatasetOpen] = useState(false)
  const options = scenarios[mode]
  function explore(opportunityId?: string) {
    if (opportunityId) setRevealCandidate(previous => ({ id: opportunityId, request: (previous?.request ?? 0) + 1 }))
    setWorkspace("explore")
  }
  function openReviews() {
    setReviewsRequest(value => value + 1)
    setWorkspace("explore")
  }
  function applySource(dataset: Dataset) {
    const error = saveSourceSession(dataset, savedSource.writeBlocked)
    setSourceOverride(dataset)
    setSavedSource(previous => ({ ...previous, dataset, error }))
  }
  function restoreSource() {
    const error = clearSourceSession()
    if (error) { setSavedSource(previous => ({ ...previous, error })); return }
    setSourceOverride(null)
    setSavedSource({ dataset: null, error: null, writeBlocked: false })
  }
  const result = useMemo(() => {
    try { return { dataset: mode === "real" && sourceOverride ? sourceOverride : loadDataset(mode), error: null } }
    catch (error) { return { dataset: null, error: error instanceof Error ? error.message : "The dataset could not be loaded." } }
  }, [mode, sourceOverride])
  const analysis = useMemo(() => result.dataset ? analyzeProjects(result.dataset.projects, options) : null, [result.dataset, options])
  const sourceEditions = result.dataset ? sourceEditionLabels(result.dataset.projects) : []
  return <main className="flex h-dvh min-h-0 w-full min-w-0 flex-col overflow-hidden">
    <header className="flex max-h-[25dvh] min-h-0 min-w-0 shrink-0 flex-wrap items-center justify-between gap-4 overflow-auto border-b p-4">
      <div className="flex min-w-0 flex-wrap items-center gap-3"><h1 className="text-2xl font-semibold">Gridlock</h1><Badge variant={mode === "demo" ? "secondary" : "outline"}>{mode === "demo" ? "Synthetic demo" : sourceOverride ? "Revised source" : "Source data"}</Badge><nav className="flex min-w-0 flex-wrap gap-2" aria-label="Workspaces">{([
        ["home", "Home", HouseIcon], ["explore", "Explore", MapIcon], ["outcomes", "Outcomes", ChartNoAxesCombinedIcon], ["readiness", "Data readiness", ListChecksIcon],
      ] as const).map(([destination, label, Icon]) => <Button key={destination} variant={workspace === destination ? "default" : "ghost"} aria-current={workspace === destination ? "page" : undefined} onClick={() => setWorkspace(destination)}><Icon aria-hidden="true" data-icon="inline-start" />{label}</Button>)}</nav></div>
      <nav aria-label="Collection controls" className="flex min-w-0 flex-wrap items-center gap-2">
        {result.dataset && <Button variant="outline" onClick={openReviews}><BookmarkIcon aria-hidden="true" data-icon="inline-start" />Saved reviews</Button>}
        {result.dataset && <Dialog open={datasetOpen} onOpenChange={setDatasetOpen}>
          <DialogTrigger asChild><Button variant="outline"><DatabaseIcon aria-hidden="true" data-icon="inline-start" />Dataset</Button></DialogTrigger>
          <DialogContent className="flex h-[85dvh] max-h-[calc(100dvh-2rem)] min-h-0 min-w-0 flex-col overflow-hidden sm:max-w-3xl">
            <DialogHeader className="min-w-0 shrink-0 pr-8"><DialogTitle>Dataset</DialogTitle><DialogDescription className="break-words">{result.dataset.title}</DialogDescription></DialogHeader>
            <Tabs defaultValue="coverage" className="min-h-0 min-w-0 flex-1">
              <TabsList aria-label="Dataset views" className="shrink-0"><TabsTrigger value="coverage">Coverage</TabsTrigger><TabsTrigger value="revisions">Revisions</TabsTrigger></TabsList>
              <TabsContent value="coverage" className="min-h-0 min-w-0 overflow-auto overscroll-contain">
                <section aria-label="Dataset coverage" className="space-y-4 py-2 [overflow-wrap:anywhere]">
                  <p>{result.dataset.projects.length} projects: {result.dataset.projects.filter(project => project.location !== null).length} with locations, {result.dataset.projects.filter(project => project.location === null).length} missing locations.</p>
                  <Button variant="outline" onClick={() => { setDatasetOpen(false); setWorkspace("readiness") }}>Review location evidence</Button>
                  {sourceEditions.length > 0 && <section className="space-y-2"><h3 className="text-sm font-medium">Source plans</h3><ul className="space-y-1 text-sm">{sourceEditions.map(edition => <li key={edition}>{edition}</li>)}</ul><p className="text-sm text-muted-foreground">Historical plans; current progress may differ.</p></section>}
                </section>
              </TabsContent>
              <TabsContent forceMount value="revisions" className="min-h-0 min-w-0 overflow-hidden data-[state=inactive]:hidden">
                <DatasetImport key={mode} dataset={result.dataset} isImported={mode === "real" && (sourceOverride !== null || savedSource.writeBlocked)} onApply={applySource} onReset={restoreSource} />
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>}
        <Button variant="outline" onClick={() => setMode(mode === "real" ? "demo" : "real")}>{mode === "real" ? "Use demo data" : "Use source data"}</Button>
      </nav>
    </header>
    {savedSource.error && mode === "real" && <div role="status" className="flex max-h-[15dvh] min-h-0 shrink-0 flex-wrap items-center gap-3 overflow-auto border-b px-4 py-2"><p className="min-w-0 flex-1 text-sm [overflow-wrap:anywhere]">{savedSource.error}</p><Button variant="outline" size="sm" onClick={restoreSource}>Clear saved revision</Button></div>}
    <div className="min-h-0 min-w-0 flex-1 overflow-hidden">
      {result.dataset && analysis ? <>
        <div hidden={workspace !== "home"} inert={workspace !== "home"} className={workspace === "home" ? "h-full min-h-0 min-w-0" : "hidden"}><HomePage dataset={result.dataset} onNavigate={setWorkspace} onDemo={() => { setMode("demo"); setWorkspace("explore") }} /></div>
        <div hidden={workspace !== "explore"} inert={workspace !== "explore"} className={workspace === "explore" ? "h-full min-h-0 min-w-0" : "hidden"}><Explorer key={mode} dataset={result.dataset} options={options} analysis={analysis} onOptionsChange={next => setScenarios(previous => ({ ...previous, [mode]: next }))} active={workspace === "explore"} projectToReveal={revealProject} candidateToReveal={revealCandidate} reviewsRequest={reviewsRequest} /></div>
        <div hidden={workspace !== "outcomes"} inert={workspace !== "outcomes"} className={workspace === "outcomes" ? "h-full min-h-0 min-w-0 p-4" : "hidden"}><OutcomesWorkspace dataset={result.dataset} options={options} analysis={analysis} onExplore={explore} onReadiness={() => setWorkspace("readiness")} onSavedFindings={openReviews} /></div>
        <div hidden={workspace !== "readiness"} inert={workspace !== "readiness"} className={workspace === "readiness" ? "h-full min-h-0 min-w-0 p-4" : "hidden"}><ReadinessWorkspace key={mode} dataset={result.dataset} onApply={applySource} onExploreProject={id => { setRevealProject(previous => ({ id, request: (previous?.request ?? 0) + 1 })); setWorkspace("explore") }} /></div>
      </> : <section role="alert" className="h-full space-y-2 overflow-auto rounded-lg border p-4 [overflow-wrap:anywhere]"><h2 className="font-medium">{mode === "real" ? "Source data" : "Demo data"} could not be loaded</h2><p className="text-sm text-muted-foreground">{result.error}</p><p className="text-sm">Choose another dataset to continue.</p></section>}
    </div>
  </main>
}
export default App
