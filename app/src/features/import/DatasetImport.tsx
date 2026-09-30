import { useRef, useState } from "react"
import { DownloadIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { compareDatasets, downloadDataset, MAX_IMPORT_BYTES, parseSourceDataset } from "@/data/import"
import type { Dataset } from "@/domain/schema"

interface Props {
  dataset: Dataset
  isImported: boolean
  onApply: (dataset: Dataset) => void
  onReset: () => void
}

export function DatasetImport({ dataset, isImported, onApply, onReset }: Props) {
  const [candidate, setCandidate] = useState<Dataset | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [applied, setApplied] = useState(false)
  const request = useRef(0)
  const changes = candidate ? compareDatasets(dataset, candidate) : null
  const rows = changes ? [
    ...changes.added.map(project => ({ id: project.id, name: project.name, change: "Added" })),
    ...changes.removed.map(project => ({ id: project.id, name: project.name, change: "Removed" })),
    ...changes.changed.map(({ after, fields }) => ({ id: after.id, name: after.name, change: `Changed: ${fields.join(", ")}` })),
  ] : []

  return <section className="flex h-full min-h-0 min-w-0 flex-col gap-4" aria-label="Source revisions">
    <div className="min-h-0 min-w-0 flex-1 space-y-4 overflow-auto overscroll-contain py-2 [overflow-wrap:anywhere]">
    <div className="space-y-2">
      <p className="text-sm text-muted-foreground">Preview a normalized source dataset before using it. Applied revisions are saved in this browser when storage is available. Download a copy for backup or another device; Restore supplied snapshot clears the saved revision.</p>
    </div>
    <div className="flex flex-wrap gap-2">
      <Button variant="outline" onClick={() => downloadDataset(dataset)}><DownloadIcon aria-hidden="true" data-icon="inline-start" />Download current {dataset.mode === "demo" ? "demo" : "source"} dataset</Button>
      {isImported && <Button variant="outline" onClick={() => { request.current += 1; setBusy(false); setCandidate(null); setApplied(false); setError(null); onReset() }}>Restore supplied snapshot</Button>}
    </div>
    {dataset.mode === "demo" ? <p className="text-sm">Switch to source data to import a revision.</p> : <>
      <div className="space-y-2">
        <Label htmlFor="dataset-file">Revised source dataset (JSON, up to 10 MB)</Label>
        <Input id="dataset-file" type="file" accept=".json,application/json" onChange={async event => {
          const file = event.target.files?.[0]
          const token = ++request.current
          setCandidate(null); setError(null); setApplied(false); setBusy(false)
          if (!file) return
          if (file.size > MAX_IMPORT_BYTES) { setError("Choose a dataset smaller than 10 MB."); return }
          setBusy(true)
          try {
            const imported = parseSourceDataset(await file.text())
            if (token === request.current) setCandidate(imported)
          } catch (failure) {
            if (token === request.current) setError(failure instanceof Error ? failure.message : "The dataset could not be read.")
          } finally { if (token === request.current) setBusy(false) }
        }} />
      </div>
      <p className="text-sm text-muted-foreground">Keep native project IDs stable. Dates, source references, coordinates and filing groups use the downloaded dataset's schema.</p>
      {busy && <p role="status" className="text-sm">Reading dataset…</p>}
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      {candidate && changes && <div className="space-y-3">
        <p className="text-sm">{candidate.title}: {candidate.projects.length} projects. {changes.added.length} added, {changes.removed.length} removed, {changes.changed.length} changed, {changes.unchanged} unchanged.</p>
        {rows.length > 0 && <div className="max-h-72 overflow-auto"><Table>
          <TableHeader><TableRow><TableHead>Project</TableHead><TableHead>Revision</TableHead></TableRow></TableHeader>
          <TableBody>{rows.map(row => <TableRow key={row.id}><TableCell>{row.name}<span className="block text-xs text-muted-foreground">{row.id}</span></TableCell><TableCell>{row.change}</TableCell></TableRow>)}</TableBody>
        </Table></div>}
        {candidate.projects.length === 0 && <p className="text-sm">This revision has no projects. Applying it replaces the active inventory with an empty dataset, including the saved browser revision.</p>}
      </div>}
      {applied && <p role="status" className="text-sm">The revision is active in the explorer.</p>}
    </>}
    </div>
    {candidate && dataset.mode === "real" && <div className="shrink-0 border-t pt-4"><Button onClick={() => { onApply(candidate); setCandidate(null); setApplied(true) }}>Use this revision</Button></div>}
  </section>
}
