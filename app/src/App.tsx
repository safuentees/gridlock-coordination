import { useEffect, useMemo, useRef, useState } from "react"
import { BookmarkIcon, ChartNoAxesCombinedIcon, DatabaseIcon, HouseIcon, ListChecksIcon, MapIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { loadDataset } from "@/data/provider"
import { prepareBundledUpdate } from "@/data/coverage"
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

type CollectionLoad = { dataset: Dataset | null; loading: boolean; error: string | null }

export function App() {
  const [mode, setMode] = useState<DataMode>("real")
  const [requestedMode, setRequestedMode] = useState<DataMode>("real")
  const [requestedWorkspace, setRequestedWorkspace] = useState<Workspace | null>(null)
  const [collections, setCollections] = useState<Record<DataMode, CollectionLoad>>({
    real: { dataset: null, loading: true, error: null },
    demo: { dataset: null, loading: false, error: null },
  })
  const collectionCache = useRef<Partial<Record<DataMode, Dataset>>>({})
  const collectionRequests = useRef<Record<DataMode, number>>({ real: 0, demo: 0 })
  const mounted = useRef(false)
  const [savedSource, setSavedSource] = useState<Awaited<ReturnType<typeof readSourceSession>>>({ dataset: null, error: null, writeBlocked: false })
  const [sourceOverride, setSourceOverride] = useState<Dataset | null>(null)
  const [sourceLoaded, setSourceLoaded] = useState(false)
  const [sourceBusy, setSourceBusy] = useState(false)
  const [sourceOperation, setSourceOperation] = useState<"save" | "restore">("save")
  const sourceRequest = useRef(0)
  const sourceLocked = useRef(true)
  const [workspace, setWorkspace] = useState<Workspace>("home")
  const [scenarios, setScenarios] = useState<Record<DataMode, AnalysisOptions>>({ real: { ...DEFAULT_OPTIONS }, demo: { ...DEFAULT_OPTIONS } })
  const [revealProject, setRevealProject] = useState<{ id: string; request: number } | null>(null)
  const [revealCandidate, setRevealCandidate] = useState<{ id: string; request: number } | null>(null)
  const [reviewsRequest, setReviewsRequest] = useState(0)
  const [datasetOpen, setDatasetOpen] = useState(false)
  const options = scenarios[mode]
  async function ensureCollection(target: DataMode): Promise<Dataset> {
    const cached = collectionCache.current[target]
    if (cached) return cached
    const request = ++collectionRequests.current[target]
    setCollections(previous => ({ ...previous, [target]: { ...previous[target], loading: true, error: null } }))
    try {
      const dataset = await loadDataset(target)
      if (mounted.current && request === collectionRequests.current[target]) {
        collectionCache.current[target] = dataset
        setCollections(previous => ({ ...previous, [target]: { dataset, loading: false, error: null } }))
      }
      return dataset
    } catch (failure) {
      if (mounted.current && request === collectionRequests.current[target]) {
        const error = failure instanceof Error ? failure.message : "The collection could not be loaded."
        setCollections(previous => ({ ...previous, [target]: { ...previous[target], loading: false, error } }))
      }
      throw failure
    }
  }
  useEffect(() => {
    let active = true
    mounted.current = true
    void ensureCollection("real").catch(() => undefined)
    Promise.resolve(readSourceSession()).then(saved => {
      if (!active) return
      setSavedSource(saved)
      setSourceOverride(saved.dataset)
    }).catch(() => {
      if (active) setSavedSource({ dataset: null, error: "Saved source data could not be loaded. It has been preserved; download active revisions before leaving this tab.", writeBlocked: true })
    }).finally(() => {
      if (active) { sourceLocked.current = false; setSourceLoaded(true) }
    })
    return () => {
      active = false
      mounted.current = false
      collectionRequests.current.real += 1
      collectionRequests.current.demo += 1
      sourceRequest.current += 1
    }
  }, [])
  const requestedDataset = requestedMode === "real"
    ? sourceLoaded ? sourceOverride ?? collections.real.dataset : null
    : collections.demo.dataset
  useEffect(() => {
    if (requestedMode === mode || !requestedDataset) return
    setMode(requestedMode)
    if (requestedWorkspace) setWorkspace(requestedWorkspace)
  }, [mode, requestedMode, requestedDataset, requestedWorkspace])
  function requestMode(target: DataMode, destination: Workspace | null = null) {
    setRequestedMode(target)
    setRequestedWorkspace(destination)
    if (!collections[target].dataset && !collections[target].loading) void ensureCollection(target).catch(() => undefined)
  }
  function retryCollection(target: DataMode) {
    void ensureCollection(target).catch(() => undefined)
  }
  function navigate(destination: Workspace) {
    setRequestedWorkspace(null)
    setWorkspace(destination)
  }
  function explore(opportunityId?: string) {
    if (opportunityId) setRevealCandidate(previous => ({ id: opportunityId, request: (previous?.request ?? 0) + 1 }))
    navigate("explore")
  }
  function openReviews() {
    setReviewsRequest(value => value + 1)
    navigate("explore")
  }
  async function applySource(dataset: Dataset) {
    if (sourceLocked.current) return
    sourceLocked.current = true
    const request = ++sourceRequest.current
    setSourceBusy(true)
    setSourceOperation("save")
    setSourceOverride(dataset)
    setSavedSource(previous => ({ ...previous, dataset, error: null }))
    try {
      const error = await saveSourceSession(dataset, savedSource.writeBlocked)
      if (request === sourceRequest.current) setSavedSource(previous => ({ ...previous, dataset, error }))
    } catch {
      if (request === sourceRequest.current) setSavedSource(previous => ({ ...previous, error: "The active source revision could not be saved. Download source data from Dataset → Revisions before leaving this tab." }))
    } finally {
      if (request === sourceRequest.current) { sourceLocked.current = false; setSourceBusy(false) }
    }
  }
  async function restoreSource() {
    if (sourceLocked.current) return
    sourceLocked.current = true
    const request = ++sourceRequest.current
    setSourceBusy(true)
    setSourceOperation("restore")
    try {
      // Keep the active/saved revision until a complete supplied replacement is available.
      await ensureCollection("real")
      if (!mounted.current || request !== sourceRequest.current) return
      const error = await clearSourceSession()
      if (request !== sourceRequest.current) return
      if (error) { setSavedSource(previous => ({ ...previous, error })); return }
      setSourceOverride(null)
      setSavedSource({ dataset: null, error: null, writeBlocked: false })
    } catch {
      if (request === sourceRequest.current) setSavedSource(previous => ({ ...previous, error: "The supplied source snapshot could not be restored. Your active revision is unchanged; retry when source data and browser storage are available." }))
    } finally {
      if (request === sourceRequest.current) { sourceLocked.current = false; setSourceBusy(false) }
    }
  }
  const result = {
    dataset: mode === "real" ? sourceLoaded ? sourceOverride ?? collections.real.dataset : null : collections.demo.dataset,
    error: collections[mode].error,
  }
  const analysis = useMemo(() => result.dataset ? analyzeProjects(result.dataset.projects, options) : null, [result.dataset, options])
  const sourceEditions = result.dataset ? sourceEditionLabels(result.dataset.projects.filter(project => !project.inventory)) : []
  const bundledUpdate = useMemo(() => {
    if (mode !== "real" || !sourceOverride || !collections.real.dataset) return { dataset: null, error: null }
    try { return { dataset: prepareBundledUpdate(sourceOverride, collections.real.dataset), error: null } }
    catch (failure) { return { dataset: null, error: failure instanceof Error ? failure.message : "Bundled additions could not be prepared." } }
  }, [mode, sourceOverride, collections.real.dataset])
  const switching = requestedMode !== mode
  const switchError = requestedMode === "real" && !sourceLoaded ? null : collections[requestedMode].error
  const initialError = mode === "real" && !sourceLoaded ? null : result.error
  const backgroundSourceLoad = mode === "real" && sourceOverride !== null && !collections.real.dataset && !switching
  return <main className="flex h-dvh min-h-0 w-full min-w-0 flex-col overflow-hidden">
    <header className="flex max-h-[25dvh] min-h-0 min-w-0 shrink-0 flex-wrap items-center justify-between gap-4 overflow-auto border-b p-4">
      <div className="flex min-w-0 flex-wrap items-center gap-3"><h1 className="text-2xl font-semibold">Gridlock</h1><Badge variant={mode === "demo" ? "secondary" : "outline"}>{mode === "demo" ? "Synthetic demo" : sourceOverride ? "Revised source" : "Source data"}</Badge><nav className="flex min-w-0 flex-wrap gap-2" aria-label="Workspaces">{([
        ["home", "Home", HouseIcon], ["explore", "Explore", MapIcon], ["outcomes", "Outcomes", ChartNoAxesCombinedIcon], ["readiness", "Data readiness", ListChecksIcon],
      ] as const).map(([destination, label, Icon]) => <Button key={destination} variant={workspace === destination ? "default" : "ghost"} aria-current={workspace === destination ? "page" : undefined} onClick={() => navigate(destination)}><Icon aria-hidden="true" data-icon="inline-start" />{label}</Button>)}</nav></div>
      <div role="group" aria-label="Collection controls" className="flex min-w-0 flex-wrap items-center gap-2">
        {result.dataset && <Button variant="outline" onClick={openReviews}><BookmarkIcon aria-hidden="true" data-icon="inline-start" />Saved reviews</Button>}
        {result.dataset && <Dialog open={datasetOpen} onOpenChange={setDatasetOpen}>
          <DialogTrigger asChild><Button variant="outline"><DatabaseIcon aria-hidden="true" data-icon="inline-start" />Dataset</Button></DialogTrigger>
          <DialogContent className="flex h-[85dvh] max-h-[calc(100dvh-2rem)] min-h-0 min-w-0 flex-col overflow-hidden sm:max-w-3xl">
            <DialogHeader className="min-w-0 shrink-0 pr-8"><DialogTitle>Dataset</DialogTitle><DialogDescription className="break-words">{result.dataset.title}</DialogDescription></DialogHeader>
            <Tabs defaultValue="coverage" className="min-h-0 min-w-0 flex-1">
              <TabsList aria-label="Dataset views" className="shrink-0"><TabsTrigger value="coverage">Coverage</TabsTrigger><TabsTrigger value="revisions">Revisions</TabsTrigger></TabsList>
              <TabsContent value="coverage" className="min-h-0 min-w-0 overflow-auto overscroll-contain">
                <section aria-label="Dataset coverage" className="space-y-4 py-2 [overflow-wrap:anywhere]">
                  <p>{result.dataset.projects.length} records: {result.dataset.projects.filter(project => project.location !== null).length} with map centers, {result.dataset.projects.filter(project => project.location === null).length} without a resolved center.</p>
                  <Button variant="outline" onClick={() => { setDatasetOpen(false); navigate("readiness") }}>Review location evidence</Button>
                  {sourceEditions.length > 0 && <section className="space-y-2"><h3 className="text-sm font-medium">Source plans</h3><ul className="space-y-1 text-sm">{sourceEditions.map(edition => <li key={edition}>{edition}</li>)}</ul><p className="text-sm text-muted-foreground">Historical plans; current progress may differ.</p></section>}
                  {result.dataset.sourceEditions?.map(edition => {
                    const records = result.dataset!.projects.filter(project => project.inventory?.sourceKey === edition.sourceKey && project.inventory.editionId === edition.editionId)
                    const statusDates = [...new Set(records.map(project => project.inventory!.lifecycleAsOf))].join(", ")
                    const observed = records.some(project => project.inventory?.lifecycleDateMeaning === "snapshot-observed")
                    return <section key={`${edition.sourceKey}:${edition.editionId}`} className="space-y-2 border-t pt-4">
                      <h3 className="text-sm font-medium">{edition.label}</h3>
                      <p className="text-sm">{records.length} active records; {records.filter(project => project.location).length} with map centers. {edition.scope === "sample" ? "Sample available; full inventory in progress." : "Full declared source scope imported."}</p>
                      <p className="text-sm text-muted-foreground">{edition.geographicScope}</p>
                      <p className="text-sm text-muted-foreground">{edition.publishedOn ? `Published ${edition.publishedOn}. ` : ""}{statusDates ? `${observed ? "Status observed" : "Source status as of"} ${statusDates}.` : "No active status records."}</p>
                      {edition.source.url && <a href={edition.source.url} target="_blank" rel="noreferrer" className="text-sm underline underline-offset-2">Open {edition.publisher} source</a>}
                    </section>
                  })}
                </section>
              </TabsContent>
              <TabsContent forceMount value="revisions" inert={mode === "real" && (!sourceLoaded || sourceBusy)} aria-busy={mode === "real" && (!sourceLoaded || sourceBusy)} className="flex min-h-0 min-w-0 flex-col overflow-hidden data-[state=inactive]:hidden">
                {bundledUpdate.error && <p role="status" className="shrink-0 text-sm">Available source additions could not be prepared: {bundledUpdate.error}</p>}
                <DatasetImport key={mode} dataset={result.dataset} bundledUpdate={bundledUpdate.dataset} isImported={mode === "real" && (sourceOverride !== null || savedSource.writeBlocked)} onApply={applySource} onReset={restoreSource} />
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>}
        <Button variant="outline" onClick={() => switching ? requestMode(mode) : requestMode(mode === "real" ? "demo" : "real")}>{switching ? "Cancel switch" : mode === "real" ? "Use demo data" : "Use source data"}</Button>
      </div>
    </header>
    {switching && <div role="status" className="flex max-h-[15dvh] min-h-0 shrink-0 flex-wrap items-center gap-3 overflow-auto border-b px-4 py-2">
      <p className="min-w-0 flex-1 text-sm [overflow-wrap:anywhere]">{switchError ? `${requestedMode === "real" ? "Source" : "Demo"} data could not be loaded. ${result.dataset ? "Your active collection is unchanged. " : ""}${switchError}` : `Loading ${requestedMode === "real" ? "source" : "demo"} data…${result.dataset ? " Your active collection remains available." : ""}`}</p>
      {switchError && <Button variant="outline" size="sm" onClick={() => retryCollection(requestedMode)}>Retry switch</Button>}
    </div>}
    {backgroundSourceLoad && !sourceBusy && <div role="status" className="flex max-h-[15dvh] min-h-0 shrink-0 flex-wrap items-center gap-3 overflow-auto border-b px-4 py-2">
      <p className="min-w-0 flex-1 text-sm [overflow-wrap:anywhere]">{collections.real.error ? `Supplied source data could not be loaded. Your revised source remains active. ${collections.real.error}` : "Loading supplied source data for available additions… Your revised source remains active."}</p>
      {collections.real.error && <Button variant="outline" size="sm" onClick={() => retryCollection("real")}>Retry supplied data</Button>}
    </div>}
    {sourceBusy && mode === "real" && <p role="status" className="shrink-0 border-b px-4 py-2 text-sm">{sourceOperation === "restore" ? "Restoring supplied source data…" : "Saving source changes…"}</p>}
    {savedSource.error && mode === "real" && <div role="status" className="flex max-h-[15dvh] min-h-0 shrink-0 flex-wrap items-center gap-3 overflow-auto border-b px-4 py-2"><p className="min-w-0 flex-1 text-sm [overflow-wrap:anywhere]">{savedSource.error}</p><Button variant="outline" size="sm" disabled={!sourceLoaded || sourceBusy} onClick={restoreSource}>Clear saved revision</Button></div>}
    <div className="min-h-0 min-w-0 flex-1 overflow-hidden">
      {result.dataset && analysis ? <>
        <div hidden={workspace !== "home"} inert={workspace !== "home"} className={workspace === "home" ? "h-full min-h-0 min-w-0" : "hidden"}><HomePage dataset={result.dataset} onNavigate={navigate} onDemo={() => requestMode("demo", "explore")} /></div>
        <div hidden={workspace !== "explore"} inert={workspace !== "explore"} className={workspace === "explore" ? "h-full min-h-0 min-w-0" : "hidden"}><Explorer key={mode} dataset={result.dataset} options={options} analysis={analysis} onOptionsChange={next => setScenarios(previous => ({ ...previous, [mode]: next }))} active={workspace === "explore"} projectToReveal={revealProject} candidateToReveal={revealCandidate} reviewsRequest={reviewsRequest} /></div>
        <div hidden={workspace !== "outcomes"} inert={workspace !== "outcomes"} className={workspace === "outcomes" ? "h-full min-h-0 min-w-0 p-4" : "hidden"}><OutcomesWorkspace dataset={result.dataset} options={options} analysis={analysis} onExplore={explore} onReadiness={() => navigate("readiness")} onSavedFindings={openReviews} /></div>
        <div hidden={workspace !== "readiness"} inert={workspace !== "readiness" || (mode === "real" && sourceBusy)} aria-busy={mode === "real" && sourceBusy} className={workspace === "readiness" ? "h-full min-h-0 min-w-0 p-4" : "hidden"}><ReadinessWorkspace key={mode} dataset={result.dataset} onApply={applySource} onExploreProject={id => { setRevealProject(previous => ({ id, request: (previous?.request ?? 0) + 1 })); navigate("explore") }} /></div>
      </> : initialError ? <section role="alert" className="h-full space-y-3 overflow-auto rounded-lg border p-4 [overflow-wrap:anywhere]"><h2 className="font-medium">{mode === "real" ? "Source data" : "Demo data"} could not be loaded</h2><p className="text-sm text-muted-foreground">{initialError}</p><Button variant="outline" onClick={() => retryCollection(mode)}>Retry loading</Button></section> : <section role="status" aria-busy="true" className="h-full overflow-auto p-4"><p>{mode === "real" && !sourceLoaded ? "Loading source data and saved revisions…" : `Loading ${mode === "real" ? "source" : "demo"} data…`}</p></section>}
    </div>
  </main>
}
export default App
