import { useMemo, useState } from "react"
import { DatabaseIcon, ListChecksIcon, MapIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { loadDataset } from "@/data/provider"
import { clearSourceSession, readSourceSession, saveSourceSession } from "@/data/source-session"
import { Explorer } from "@/features/explorer/Explorer"
import { DatasetImport } from "@/features/import/DatasetImport"
import { ReadinessWorkspace } from "@/features/readiness/ReadinessWorkspace"
import type { DataMode, Dataset } from "@/domain/schema"
import { sourceEditionLabels } from "@/lib/presentation"

export function App() {
  const [mode, setMode] = useState<DataMode>("real")
  const [savedSource, setSavedSource] = useState(readSourceSession)
  const [sourceOverride, setSourceOverride] = useState<Dataset | null>(savedSource.dataset)
  const [workspace, setWorkspace] = useState("explore")
  const [revealProject, setRevealProject] = useState<{ id: string; request: number } | null>(null)
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
  const sourceEditions = result.dataset ? sourceEditionLabels(result.dataset.projects) : []
  return <main className="flex h-dvh min-h-0 w-full min-w-0 flex-col overflow-hidden">
    <header className="flex max-h-[25dvh] min-h-0 min-w-0 shrink-0 flex-wrap items-center justify-between gap-4 overflow-auto border-b p-4">
      <div className="flex min-w-0 flex-wrap items-center gap-3"><h1 className="text-2xl font-semibold">Gridlock</h1><Badge variant={mode === "demo" ? "secondary" : "outline"}>{mode === "demo" ? "Synthetic demo" : sourceOverride ? "Revised source" : "Source data"}</Badge><nav className="flex gap-2" aria-label="Workspaces"><Button variant={workspace === "explore" ? "default" : "ghost"} aria-current={workspace === "explore" ? "page" : undefined} onClick={() => setWorkspace("explore")}><MapIcon aria-hidden="true" data-icon="inline-start" />Explore</Button><Button variant={workspace === "readiness" ? "default" : "ghost"} aria-current={workspace === "readiness" ? "page" : undefined} onClick={() => setWorkspace("readiness")}><ListChecksIcon aria-hidden="true" data-icon="inline-start" />Data readiness</Button></nav></div>
      <nav aria-label="Dataset controls" className="flex min-w-0 flex-wrap items-center gap-2">
        {result.dataset && <Dialog>
          <DialogTrigger asChild><Button variant="outline"><DatabaseIcon aria-hidden="true" data-icon="inline-start" />Dataset</Button></DialogTrigger>
          <DialogContent className="flex h-[85dvh] max-h-[calc(100dvh-2rem)] min-h-0 min-w-0 flex-col overflow-hidden sm:max-w-3xl">
            <DialogHeader className="min-w-0 shrink-0 pr-8"><DialogTitle>Dataset</DialogTitle><DialogDescription className="break-words">{result.dataset.title}</DialogDescription></DialogHeader>
            <Tabs defaultValue="coverage" className="min-h-0 min-w-0 flex-1">
              <TabsList className="shrink-0"><TabsTrigger value="coverage">Coverage</TabsTrigger><TabsTrigger value="revisions">Revisions</TabsTrigger></TabsList>
              <TabsContent value="coverage" className="min-h-0 min-w-0 overflow-auto overscroll-contain">
                <section aria-label="Dataset coverage" className="space-y-4 py-2 [overflow-wrap:anywhere]">
                  <p>{result.dataset.projects.length} projects: {result.dataset.projects.filter(project => project.location !== null).length} with locations, {result.dataset.projects.filter(project => project.location === null).length} missing locations.</p>
                  <p className="text-sm">Review missing or unverified locations in Data readiness.</p>
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
      {result.dataset ? <>
        <div className={workspace === "explore" ? "h-full min-h-0 min-w-0" : "hidden"}><Explorer key={mode} dataset={result.dataset} active={workspace === "explore"} projectToReveal={revealProject} /></div>
        <div className={workspace === "readiness" ? "h-full min-h-0 min-w-0 p-4" : "hidden"}><ReadinessWorkspace key={mode} dataset={result.dataset} onApply={applySource} onExploreProject={id => { setRevealProject(previous => ({ id, request: (previous?.request ?? 0) + 1 })); setWorkspace("explore") }} /></div>
      </> : <section role="alert" className="h-full space-y-2 overflow-auto rounded-lg border p-4 [overflow-wrap:anywhere]"><h2 className="font-medium">{mode === "real" ? "Source data" : "Demo data"} could not be loaded</h2><p className="text-sm text-muted-foreground">{result.error}</p><p className="text-sm">Choose another dataset to continue.</p></section>}
    </div>
  </main>
}
export default App
