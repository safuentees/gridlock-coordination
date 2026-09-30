import { useMemo, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
  return <main className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6">
    <header className="flex flex-wrap items-start justify-between gap-4"><div className="space-y-2"><div className="flex items-center gap-3"><h1 className="text-2xl font-semibold">Gridlock</h1><Badge variant={mode === "demo" ? "secondary" : "outline"}>{mode === "demo" ? "Synthetic demo" : "Source data"}</Badge></div><p className="text-sm text-muted-foreground">Find and investigate coordination opportunities across utility transmission plans.</p></div><Button variant="outline" onClick={() => setMode(mode === "real" ? "demo" : "real")}>{mode === "real" ? "Explore 300-project demo" : "Use source data"}</Button></header>
    {result.dataset ? <>
      {mode === "real" && sourceOverride && <p role="status" className="text-sm">Imported revision: {sourceOverride.title}</p>}
      <Explorer key={`${mode}-${revision}`} dataset={result.dataset} />
      <details className="rounded-lg border p-4"><summary className="cursor-pointer font-medium">Import or compare source revisions</summary><div className="pt-4"><DatasetImport key={mode} dataset={result.dataset} isImported={mode === "real" && sourceOverride !== null} onApply={dataset => { setSourceOverride(dataset); setRevision(value => value + 1) }} onReset={() => { setSourceOverride(null); setRevision(value => value + 1) }} /></div></details>
    </> : <section role="alert" className="space-y-2 rounded-lg border p-4"><h2 className="font-medium">{mode === "real" ? "Source data" : "Demo data"} could not be loaded</h2><p className="text-sm text-muted-foreground">{result.error}</p><p className="text-sm">Switch modes explicitly to explore another dataset.</p></section>}
  </main>
}
export default App
