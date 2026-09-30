import { useRef, useState } from "react"
import { DownloadIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { compareDatasets, downloadDataset, MAX_IMPORT_BYTES, parseSourceDataset } from "@/data/import"
import type { Dataset } from "@/domain/schema"

const IMPORT_LIMIT_LABEL = `${MAX_IMPORT_BYTES / (1024 * 1024)} MiB`

interface Props {
  dataset: Dataset
  isImported: boolean
  onApply: (dataset: Dataset) => void
  onReset: () => void
  bundledUpdate?: Dataset | null
}

export function DatasetImport({ dataset, isImported, onApply, onReset, bundledUpdate = null }: Props) {
  const [candidate, setCandidate] = useState<Dataset | null>(null)
  const [bundledBase, setBundledBase] = useState<Dataset | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [applied, setApplied] = useState(false)
  const request = useRef(0)
  const staleBundledPreview = bundledBase !== null && bundledBase !== dataset
  const changes = candidate && !staleBundledPreview ? compareDatasets(dataset, candidate) : null
  const rows = changes ? [
    ...changes.added.map(project => ({ id: project.id, name: project.name, change: "Added" })),
    ...changes.removed.map(project => ({ id: project.id, name: project.name, change: "Removed" })),
    ...changes.changed.map(({ after, fields }) => ({ id: after.id, name: after.name, change: `Changed: ${fields.map(field => field === "inventory" ? "source inventory details" : field).join(", ")}` })),
  ] : []

  return <section className="flex h-full min-h-0 min-w-0 flex-col gap-4" aria-label="Source revisions">
    {dataset.mode === "real" && <div className="shrink-0 space-y-2 pt-2">
      {bundledUpdate && <Button type="button" variant="outline" onClick={() => { request.current += 1; setBusy(false); setCandidate(bundledUpdate); setBundledBase(dataset); setError(null); setApplied(false) }}>Preview bundled update</Button>}
      <Label htmlFor="dataset-file">Incoming source revision (JSON, up to {IMPORT_LIMIT_LABEL})</Label>
      <Input id="dataset-file" type="file" accept=".json,application/json" onChange={async event => {
        const file = event.target.files?.[0]
        const token = ++request.current
        setCandidate(null); setBundledBase(null); setError(null); setApplied(false); setBusy(false)
        if (!file) return
        if (file.size > MAX_IMPORT_BYTES) { setError(`Choose a dataset no larger than ${IMPORT_LIMIT_LABEL}.`); return }
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
        {staleBundledPreview && <p role="status" className="text-sm">The active dataset changed. Preview the bundled update again before applying.</p>}
        {applied && <p role="status" className="text-sm">Revision applied.</p>}
        {candidate && changes ? <section className="space-y-3" aria-label="Incoming revision preview">
          <div className="space-y-1"><h3 className="font-medium">{candidate.title}</h3><p className="text-sm">{candidate.projects.length} records: {changes.added.length} added, {changes.removed.length} removed, {changes.changed.length} changed, {changes.unchanged} unchanged.</p></div>
          {changes.editionChanges.length > 0 && <div className="space-y-2"><h4 className="text-sm font-medium">Source edition changes</h4><ul className="space-y-2 text-sm">{changes.editionChanges.map(edition => <li key={`${edition.sourceKey}:${edition.editionId}`}><span className="font-medium">{edition.label}</span><span className="block text-xs text-muted-foreground">{edition.kind}; {edition.sourceKey}</span></li>)}</ul></div>}
          {changes.removed.length > 0 && <p className="text-sm text-muted-foreground">Removal from a revision does not establish cancellation.</p>}
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
        {isImported && <details className="space-y-2 text-sm"><summary className="cursor-pointer">Reset source revision</summary><p className="text-muted-foreground">Restoring the supplied snapshot removes the saved source revision.</p><Button type="button" variant="outline" onClick={() => { request.current += 1; setBusy(false); setCandidate(null); setBundledBase(null); setApplied(false); setError(null); onReset() }}>Restore supplied snapshot</Button></details>}
      </section>
    </div>
    {candidate && !staleBundledPreview && dataset.mode === "real" && <div className="shrink-0 border-t pt-4"><Button type="button" onClick={() => { onApply(candidate); setCandidate(null); setBundledBase(null); setApplied(true) }}>Apply source revision</Button></div>}
  </section>
}
