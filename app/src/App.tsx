import { useMemo, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { loadDataset } from "@/data/provider"
import { Explorer } from "@/features/explorer/Explorer"
import { DatasetImport } from "@/features/import/DatasetImport"
import type { DataMode, Dataset } from "@/domain/schema"

export function App() {
  const [mode, setMode] = useState<DataMode>("real")
  const [sourceOverride, setSourceOverride] = useState<Dataset | null>(null)
  const [revision, setRevision] = useState(0)
  const result = useMemo(() => {
    try { return { dataset: mode === "real" && sourceOverride ? sourceOverride : loadDataset(mode), error: null } }
    catch (error) { return { dataset: null, error: error instanceof Error ? error.message : "The dataset could not be loaded." } }
  }, [mode, sourceOverride])
  return <main className="flex h-dvh min-h-0 w-full min-w-0 flex-col overflow-hidden">
    <header className="flex max-h-[25dvh] min-h-0 min-w-0 shrink-0 flex-wrap items-center justify-between gap-4 overflow-auto border-b p-4">
      <div className="flex min-w-0 flex-wrap items-center gap-3"><h1 className="text-2xl font-semibold">Gridlock</h1><Badge variant={mode === "demo" ? "secondary" : "outline"}>{mode === "demo" ? "Synthetic demo" : sourceOverride ? "Imported source" : "Source data"}</Badge></div>
      <nav aria-label="Dataset controls" className="flex min-w-0 flex-wrap items-center gap-2">
        {result.dataset && <Dialog>
          <DialogTrigger asChild><Button variant="outline">Dataset</Button></DialogTrigger>
          <DialogContent className="flex h-[85dvh] max-h-[calc(100dvh-2rem)] min-h-0 min-w-0 flex-col overflow-hidden sm:max-w-3xl">
            <DialogHeader className="min-w-0 shrink-0 pr-8"><DialogTitle>Dataset</DialogTitle><DialogDescription className="break-words">{result.dataset.title}</DialogDescription></DialogHeader>
            <Tabs defaultValue="coverage" className="min-h-0 min-w-0 flex-1">
              <TabsList className="shrink-0"><TabsTrigger value="coverage">Coverage</TabsTrigger><TabsTrigger value="revisions">Revisions</TabsTrigger></TabsList>
              <TabsContent value="coverage" className="min-h-0 min-w-0 overflow-auto overscroll-contain">
                <section aria-label="Dataset coverage" className="space-y-4 py-2 [overflow-wrap:anywhere]">
                  <p>{result.dataset.projects.length} projects; {result.dataset.projects.filter(project => project.location !== null).length} with locations.</p>
                  <p className="text-sm text-muted-foreground">Snapshot assembled {result.dataset.generatedAt}. Source plans are historical; a past milestone does not establish completion.</p>
                  {result.dataset.coverage.notes.map((note, index) => <p className="text-sm" key={index}>{note}</p>)}
                  <p className="text-sm text-muted-foreground">Map centers indicate proximity, not shared routes. Need dates and planned in-service dates do not establish construction windows.</p>
                </section>
              </TabsContent>
              <TabsContent forceMount value="revisions" className="min-h-0 min-w-0 overflow-hidden data-[state=inactive]:hidden">
                <DatasetImport key={mode} dataset={result.dataset} isImported={mode === "real" && sourceOverride !== null} onApply={dataset => { setSourceOverride(dataset); setRevision(value => value + 1) }} onReset={() => { setSourceOverride(null); setRevision(value => value + 1) }} />
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>}
        <Button variant="outline" onClick={() => setMode(mode === "real" ? "demo" : "real")}>{mode === "real" ? "Use demo data" : "Use source data"}</Button>
      </nav>
    </header>
    <div className="min-h-0 min-w-0 flex-1 overflow-hidden">
      {result.dataset ? <Explorer key={`${mode}-${revision}`} dataset={result.dataset} /> : <section role="alert" className="space-y-2 rounded-lg border p-4 [overflow-wrap:anywhere]"><h2 className="font-medium">{mode === "real" ? "Source data" : "Demo data"} could not be loaded</h2><p className="text-sm text-muted-foreground">{result.error}</p><p className="text-sm">Switch modes explicitly to explore another dataset.</p></section>}
    </div>
  </main>
}
export default App
