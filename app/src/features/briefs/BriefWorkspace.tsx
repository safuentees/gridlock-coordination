import { useMemo, useState, type FormEvent } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import type { AnalysisOptions, Dataset, Opportunity } from "@/domain/schema"
import { ProjectEvidence } from "@/features/explorer/ProjectDetails"
import { timelineLabels } from "@/features/explorer/format"
import { briefText, createBrief, downloadBrief } from "./export"
import { readSaved, REVIEW_STATES, savedAvailability, snapshotOpportunity, writeSaved, type ReviewState, type SavedOpportunity } from "./storage"

interface BriefWorkspaceProps {
  dataset: Dataset
  options: AnalysisOptions
  selectedOpportunity: Opportunity | null
  opportunities: Opportunity[]
  onShowCurrent: (id: string) => void
}
export function BriefWorkspace(props: BriefWorkspaceProps) {
  return <Workspace key={props.dataset.mode} {...props} />
}
function Workspace({ dataset, options, selectedOpportunity, opportunities, onShowCurrent }: BriefWorkspaceProps) {
  const [store, setStore] = useState(() => readSaved(dataset.mode))
  const [compareIds, setCompareIds] = useState<string[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [removed, setRemoved] = useState<SavedOpportunity | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const projectsById = useMemo(() => new Map(dataset.projects.map((project) => [project.id, project])), [dataset])
  const activeIds = useMemo(() => new Set(opportunities.map((pair) => pair.id)), [opportunities])
  const availability = useMemo(() => Object.fromEntries(store.records.map((record) => [record.id, savedAvailability(record, projectsById, activeIds)])), [store.records, projectsById, activeIds])
  const compared = store.records.filter((record) => compareIds.includes(record.id))
  const editing = store.records.find((record) => record.id === editingId) ?? null
  const currentSaved = store.records.find((record) => record.id === selectedOpportunity?.id)
  function commit(records: SavedOpportunity[]) {
    const error = writeSaved(dataset.mode, records, store.writeBlocked)
    setStore({ ...store, records, error })
  }
  function saveSelected() {
    if (!selectedOpportunity) return
    const snapshot = snapshotOpportunity(dataset, selectedOpportunity, options, currentSaved)
    commit(currentSaved ? store.records.map((record) => record.id === snapshot.id ? snapshot : record) : [...store.records, snapshot])
    setCompareIds((ids) => ids.includes(snapshot.id) ? ids : [...ids, snapshot.id])
    setEditingId(snapshot.id)
    setNotice(currentSaved ? "Saved evidence and scenario refreshed. Review notes were preserved." : "Candidate saved with its evidence and scenario settings.")
  }
  function toggleCompare(id: string) { setCompareIds((ids) => ids.includes(id) ? ids.filter((value) => value !== id) : [...ids, id]) }
  function updateReview(record: SavedOpportunity, notes: string, reviewState: ReviewState) {
    commit(store.records.map((item) => item.id === record.id ? { ...item, notes, reviewState, updatedAt: new Date().toISOString() } : item))
    setNotice("Review saved.")
  }
  function removeRecord(record: SavedOpportunity) {
    commit(store.records.filter((item) => item.id !== record.id)); setRemoved(record)
    setCompareIds((ids) => ids.filter((id) => id !== record.id)); if (editingId === record.id) setEditingId(null)
    setNotice("Saved pair removed. Undo is available below.")
  }
  function undoRemove() {
    if (!removed) return
    if (!store.records.some((record) => record.id === removed.id)) commit([...store.records, removed])
    setRemoved(null); setNotice("Saved pair restored.")
  }
  function exportSelected(format: "txt" | "json") {
    const brief = createBrief(compared, dataset.mode, availability)
    downloadBrief(format === "txt" ? briefText(brief) : JSON.stringify(brief, null, 2), dataset.mode, format)
    setNotice(`Prepared ${format.toUpperCase()} brief for ${compared.length} saved ${compared.length === 1 ? "candidate" : "candidates"}.`)
  }
  return <Card><CardHeader><CardTitle>Coordination workbench</CardTitle><CardDescription>Save source evidence, compare candidates and prepare a brief. {dataset.mode === "demo" ? "Synthetic demo records" : "Source records"} are stored separately in this browser.</CardDescription></CardHeader><CardContent className="space-y-4">
    <div className="flex flex-wrap items-center gap-3"><Button disabled={!selectedOpportunity} onClick={saveSelected}>{currentSaved ? "Refresh saved evidence" : "Save selected candidate"}</Button><p className="text-xs text-muted-foreground">{selectedOpportunity ? `Selected candidate #${selectedOpportunity.rank}; ${selectedOpportunity.distanceMiles.toFixed(2)} mi apart.` : "Select a candidate in the ranked list or map to save it."}</p></div>
    {store.error && <p role="alert" className="text-sm text-destructive">{store.error}</p>}
    {notice && <p role="status" className="text-sm text-muted-foreground">{notice}</p>}
    {removed && <div className="flex flex-wrap items-center gap-2"><span className="text-xs text-muted-foreground">Removed: {removed.projects[0].name} / {removed.projects[1].name}</span><Button variant="outline" size="sm" onClick={undoRemove}>Undo removal</Button></div>}
    {store.records.length ? <>
      <Table><TableHeader><TableRow><TableHead>Select</TableHead><TableHead>Saved pair</TableHead><TableHead>Review</TableHead><TableHead>Current dataset</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader><TableBody>{store.records.map((record) => <TableRow key={record.id}><TableCell><Checkbox checked={compareIds.includes(record.id)} onCheckedChange={() => toggleCompare(record.id)} aria-label={`Compare ${record.projects[0].name} and ${record.projects[1].name}`} /></TableCell><TableCell className="whitespace-normal"><button type="button" className="text-left font-medium underline-offset-4 hover:underline focus-visible:underline" onClick={() => setEditingId(record.id)}>{record.projects[0].name}<span className="block text-xs text-muted-foreground">↔ {record.projects[1].name}</span></button><span className="mt-1 block text-xs text-muted-foreground">Saved {record.savedAt.slice(0, 10)}; snapshot {record.dataset.generatedAt}</span></TableCell><TableCell className="whitespace-normal">{record.reviewState}</TableCell><TableCell className="max-w-56 whitespace-normal text-xs text-muted-foreground">{availability[record.id]}</TableCell><TableCell><div className="flex flex-wrap gap-2"><Button variant="outline" size="sm" onClick={() => setEditingId(record.id)}>Review</Button><Button variant="ghost" size="sm" disabled={!activeIds.has(record.id)} onClick={() => onShowCurrent(record.id)}>Show current</Button><Button variant="ghost" size="sm" onClick={() => removeRecord(record)}>Remove</Button></div></TableCell></TableRow>)}</TableBody></Table>
      <div className="flex flex-wrap items-center gap-2"><Badge variant="secondary">{compared.length} selected</Badge><Button variant="outline" size="sm" onClick={() => setCompareIds(store.records.map((record) => record.id))}>Select all</Button><Button variant="ghost" size="sm" onClick={() => setCompareIds([])}>Clear selection</Button><Button variant="outline" size="sm" disabled={!compared.length} onClick={() => exportSelected("txt")}>Export text brief</Button><Button variant="outline" size="sm" disabled={!compared.length} onClick={() => exportSelected("json")}>Export JSON brief</Button></div>
      {compared.length > 0 && <section className="space-y-3 border-t pt-4"><h3 className="font-medium">Compare saved evidence</h3><p className="text-xs text-muted-foreground">Values below come from each saved snapshot and its settings. Refresh a selected candidate explicitly to replace its saved evidence.</p><Table><TableHeader><TableRow><TableHead>Saved pair</TableHead><TableHead>Center distance</TableHead><TableHead>Timing context</TableHead><TableHead>Saved scenario</TableHead><TableHead>Review notes</TableHead></TableRow></TableHeader><TableBody>{compared.map((record) => <TableRow key={record.id}><TableCell className="max-w-64 whitespace-normal">{record.projects[0].name}<span className="block text-xs text-muted-foreground">↔ {record.projects[1].name}</span></TableCell><TableCell>{record.opportunity.distanceMiles.toFixed(2)} mi<span className="block text-xs text-muted-foreground">{record.opportunity.locationConfidence}</span></TableCell><TableCell className="max-w-52 whitespace-normal">{record.opportunity.dateGapDays === null ? "Milestone gap unknown" : `${record.opportunity.dateGapDays} days between milestones`}<span className="block text-xs text-muted-foreground">{timelineLabels[record.opportunity.timelineRelation]}</span></TableCell><TableCell className="whitespace-normal text-xs">&lt;{record.options.radiusMiles} mi<br />{record.options.maxDateGapDays === null ? "Any milestone gap" : `≤${record.options.maxDateGapDays} days`}<br />{record.options.includeUnverified ? "Unverified locations included" : "Confirmed locations required"}</TableCell><TableCell className="max-w-64 whitespace-pre-wrap text-xs">{record.notes || "No notes"}</TableCell></TableRow>)}</TableBody></Table></section>}
      {editing && <SavedReview key={`${editing.id}-${editing.updatedAt}`} record={editing} availability={availability[editing.id]} onSave={(notes, state) => updateReview(editing, notes, state)} />}
    </> : <p className="text-sm text-muted-foreground">No saved candidates in this mode yet. The full project inventory remains above.</p>}
  </CardContent></Card>
}
function SavedReview({ record, availability, onSave }: { record: SavedOpportunity; availability: string; onSave: (notes: string, reviewState: ReviewState) => void }) {
  const [notes, setNotes] = useState(record.notes)
  const [reviewState, setReviewState] = useState<ReviewState>(record.reviewState)
  function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); onSave(notes, reviewState) }
  return <section className="space-y-4 border-t pt-4"><div><h3 className="font-medium">Review saved candidate</h3><p className="text-sm text-muted-foreground">{record.projects[0].name} / {record.projects[1].name}</p><p className="mt-1 text-xs text-muted-foreground">{availability}</p></div>
    <form onSubmit={submit} className="space-y-3"><div className="space-y-2"><Label htmlFor="saved-review-state">Review state</Label><Select value={reviewState} onValueChange={(value) => setReviewState(value as ReviewState)}><SelectTrigger id="saved-review-state"><SelectValue /></SelectTrigger><SelectContent>{REVIEW_STATES.map((state) => <SelectItem value={state} key={state}>{state}</SelectItem>)}</SelectContent></Select></div><div className="space-y-2"><Label htmlFor="saved-review-notes">Coordination notes</Label><Textarea id="saved-review-notes" value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Record the rationale, evidence gaps and questions for a coordination discussion." rows={4} /></div><Button type="submit">Save review</Button></form>
    <details className="rounded-lg border p-3"><summary className="cursor-pointer font-medium">Saved source evidence</summary><div className="mt-4 grid gap-5 lg:grid-cols-2">{record.projects.map((project) => <ProjectEvidence key={project.id} project={project} />)}</div></details>
    <p className="text-xs text-muted-foreground">Review states record your assessment. They do not confirm engineering feasibility or a utility agreement.</p>
  </section>
}
