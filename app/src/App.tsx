import { useState } from "react"
import { Button } from "@/components/ui/button"
import { loadDataset } from "@/data/provider"
import type { DataMode } from "@/domain/schema"

export function App() {
  const [mode, setMode] = useState<DataMode>("real")
  const dataset = loadDataset(mode)
  return <main className="mx-auto max-w-7xl space-y-6 p-6">
    <header className="flex items-center justify-between gap-4"><h1 className="text-2xl font-semibold">Gridlock</h1><Button variant="outline" onClick={() => setMode(mode === "real" ? "demo" : "real")}>{mode === "real" ? "Use demo data" : "Use source data"}</Button></header>
    <p>Find coordination opportunities across utility transmission plans.</p>
    <p className="text-sm text-muted-foreground">{mode === "demo" ? "Demo data. " : ""}{dataset.projects.length} projects available.</p>
  </main>
}

export default App
