import { useMemo, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { loadDataset } from "@/data/provider"
import { Explorer } from "@/features/explorer/Explorer"
import type { DataMode } from "@/domain/schema"

export function App() {
  const [mode, setMode] = useState<DataMode>("real")
  const result = useMemo(() => {
    try { return { dataset: loadDataset(mode), error: null } }
    catch (error) { return { dataset: null, error: error instanceof Error ? error.message : "The dataset could not be loaded." } }
  }, [mode])
  return <main className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6">
    <header className="flex flex-wrap items-start justify-between gap-4"><div className="space-y-2"><div className="flex items-center gap-3"><h1 className="text-2xl font-semibold">Gridlock</h1><Badge variant={mode === "demo" ? "secondary" : "outline"}>{mode === "demo" ? "Synthetic demo" : "Source data"}</Badge></div><p className="text-sm text-muted-foreground">Find and investigate coordination opportunities across utility transmission plans.</p></div><Button variant="outline" onClick={() => setMode(mode === "real" ? "demo" : "real")}>{mode === "real" ? "Explore 300-project demo" : "Use source data"}</Button></header>
    {mode === "demo" && <p role="status" className="rounded-lg border bg-muted p-3 text-sm">Demo mode: every project, location, date and confidence label is synthetic. These scenarios do not represent utility commitments.</p>}
    {result.dataset ? <Explorer key={mode} dataset={result.dataset} /> : <section role="alert" className="space-y-2 rounded-lg border p-4"><h2 className="font-medium">{mode === "real" ? "Source data" : "Demo data"} could not be loaded</h2><p className="text-sm text-muted-foreground">{result.error}</p><p className="text-sm">Switch modes explicitly to explore another dataset.</p></section>}
  </main>
}
export default App
