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
    {dataset.mode === "real" && <div className="shrink-0 space-y-2 pt-2">
      <Label htmlFor="dataset-file">Incoming source revision (JSON, up to 10 MB)</Label>
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
    </div>}
    <div className="min-h-0 min-w-0 flex-1 space-y-4 overflow-auto overscroll-contain py-2 [overflow-wrap:anywhere]">
      {dataset.mode === "demo" ? <p className="text-sm">Switch to source data to import a revision.</p> : <>
        {busy && <p role="status" className="text-sm">Reading dataset…</p>}
        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        {applied && <p role="status" className="text-sm">Revision applied.</p>}
        {candidate && changes ? <section className="space-y-3" aria-label="Incoming revision preview">
          <div className="space-y-1"><h3 className="font-medium">{candidate.title}</h3><p className="text-sm">{candidate.projects.length} projects: {changes.added.length} added, {changes.removed.length} removed, {changes.changed.length} changed, {changes.unchanged} unchanged.</p></div>
          {candidate.projects.length === 0 && <p className="text-sm">This revision is empty. Applying it removes all projects from the active and saved source dataset.</p>}
          {rows.length > 0 && <div className="min-w-0 rounded-lg border [&>[data-slot=table-container]]:overflow-visible"><Table className="table-fixed">
            <TableHeader><TableRow><TableHead>Project</TableHead><TableHead>Change</TableHead></TableRow></TableHeader>
            <TableBody>{rows.map(row => <TableRow key={row.id}><TableCell className="whitespace-normal align-top">{row.name}<span className="block text-xs text-muted-foreground">{row.id}</span></TableCell><TableCell className="whitespace-normal align-top">{row.change}</TableCell></TableRow>)}</TableBody>
          </Table></div>}
        </section> : <p className="text-sm text-muted-foreground">Choose a source revision to preview changes before applying it.</p>}
        <details className="text-sm"><summary className="cursor-pointer">File requirements</summary><p className="mt-2 text-muted-foreground">Use downloaded source data as your template. Keep project IDs unchanged and preserve date precision and source references.</p></details>
      </>}
      <section className="space-y-3 border-t pt-4" aria-label="Current dataset and backup">
        <h3 className="text-sm font-medium">Current {dataset.mode === "demo" ? "demo" : "source"} dataset</h3>
        <Button type="button" variant="outline" onClick={() => downloadDataset(dataset)}><DownloadIcon aria-hidden="true" data-icon="inline-start" />Download {dataset.mode === "demo" ? "demo" : "source"} data</Button>
        {dataset.mode === "real" && <p className="text-xs text-muted-foreground">Revisions are saved in this browser when storage is available. Download a copy for backup.</p>}
        {isImported && <details className="space-y-2 text-sm"><summary className="cursor-pointer">Reset source revision</summary><p className="text-muted-foreground">Restoring the supplied snapshot removes the saved source revision.</p><Button type="button" variant="outline" onClick={() => { request.current += 1; setBusy(false); setCandidate(null); setApplied(false); setError(null); onReset() }}>Restore supplied snapshot</Button></details>}
      </section>
    </div>
    {candidate && dataset.mode === "real" && <div className="shrink-0 border-t pt-4"><Button type="button" onClick={() => { onApply(candidate); setCandidate(null); setApplied(true) }}>Apply source revision</Button></div>}
  </section>
}
