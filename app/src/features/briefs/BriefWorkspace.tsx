import { useId, useMemo, useState, type FormEvent } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
type ReviewDraft = { notes: string; reviewState: ReviewState }

export function BriefWorkspace(props: BriefWorkspaceProps) {
  return <Workspace key={props.dataset.mode} {...props} />
}
function Workspace({ dataset, options, selectedOpportunity, opportunities, onShowCurrent }: BriefWorkspaceProps) {
  const [store, setStore] = useState(() => readSaved(dataset.mode))
  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState("saved")
  const [compareIds, setCompareIds] = useState<string[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  // Keep drafts above dialog/tab lifecycles; evidence refresh must not discard edits.
  const [drafts, setDrafts] = useState<Record<string, ReviewDraft>>({})
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
    setNotice(currentSaved ? "Evidence refreshed; notes preserved." : "Candidate saved.")
  }
  function toggleCompare(id: string) { setCompareIds((ids) => ids.includes(id) ? ids.filter((value) => value !== id) : [...ids, id]) }
  function updateReview(record: SavedOpportunity, draft: ReviewDraft) {
    commit(store.records.map((item) => item.id === record.id ? { ...item, ...draft, updatedAt: new Date().toISOString() } : item))
    setDrafts((previous) => { const next = { ...previous }; delete next[record.id]; return next })
    setNotice("Review saved.")
  }
  function removeRecord(record: SavedOpportunity) {
    commit(store.records.filter((item) => item.id !== record.id))
    setRemoved(record)
    setCompareIds((ids) => ids.filter((id) => id !== record.id))
    if (editingId === record.id) setEditingId(null)
    setNotice("Saved pair removed.")
  }
  function undoRemove() {
    if (!removed) return
    if (!store.records.some((record) => record.id === removed.id)) commit([...store.records, removed])
    setEditingId(removed.id)
    setRemoved(null)
    setNotice("Saved pair restored.")
  }
  function exportSelected(format: "txt" | "json") {
    const brief = createBrief(compared, dataset.mode, availability)
    downloadBrief(format === "txt" ? briefText(brief) : JSON.stringify(brief, null, 2), dataset.mode, format)
    setNotice(`Prepared ${format.toUpperCase()} brief for ${compared.length} saved ${compared.length === 1 ? "candidate" : "candidates"}.`)
  }
  function showCurrent(id: string) { onShowCurrent(id); setOpen(false) }

  return <Dialog open={open} onOpenChange={setOpen}>
    <div className="flex min-w-0 flex-wrap items-center gap-2">
      <Button type="button" disabled={!selectedOpportunity} onClick={saveSelected} title={selectedOpportunity ? `Selected candidate #${selectedOpportunity.rank}; ${selectedOpportunity.distanceMiles.toFixed(2)} mi apart` : "Select a candidate to save its evidence"}>{currentSaved ? "Refresh evidence" : "Save selected"}</Button>
      <DialogTrigger asChild><Button type="button" variant="outline" onClick={() => { if (!editingId && store.records[0]) setEditingId(store.records[0].id) }}>Saved reviews ({store.records.length})</Button></DialogTrigger>
      {store.error ? <span role="alert" className="text-xs text-destructive">Storage notice in saved reviews</span> : notice && <span role="status" className="text-xs text-muted-foreground">{notice}</span>}
    </div>
    <DialogContent className="flex h-[min(48rem,calc(100dvh-2rem))] max-h-[calc(100dvh-2rem)] min-h-0 min-w-0 flex-col overflow-hidden sm:max-w-6xl">
      <DialogHeader className="shrink-0 pr-6">
        <DialogTitle>Saved reviews</DialogTitle>
        <DialogDescription>{dataset.mode === "demo" ? "Synthetic demo records" : "Source records"} are stored separately in this browser. Compare saved evidence and prepare a coordination brief.</DialogDescription>
      </DialogHeader>
      {(store.error || notice || removed) && <div className="max-h-24 shrink-0 space-y-2 overflow-auto">
        {store.error && <p role="alert" className="text-sm text-destructive">{store.error}</p>}
        {notice && <p role="status" className="text-sm text-muted-foreground">{notice}</p>}
        {removed && <div className="flex min-w-0 flex-wrap items-center gap-2"><span className="min-w-0 break-words text-xs text-muted-foreground">Removed: {removed.projects[0].name} / {removed.projects[1].name}</span><Button type="button" variant="outline" size="sm" onClick={undoRemove}>Undo removal</Button></div>}
      </div>}
      <Tabs value={tab} onValueChange={setTab} className="min-h-0 min-w-0 flex-1 overflow-hidden">
        <TabsList className="shrink-0"><TabsTrigger value="saved">Saved ({store.records.length})</TabsTrigger><TabsTrigger value="compare">Compare ({compared.length})</TabsTrigger></TabsList>
        <TabsContent value="saved" className="min-h-0 min-w-0 overflow-hidden data-[state=active]:flex">
          {store.records.length ? <div className="grid min-h-0 min-w-0 flex-1 grid-rows-[minmax(0,1fr)_minmax(0,1fr)] gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:grid-rows-1">
            <section aria-label="Saved candidates" className="flex min-h-0 min-w-0 flex-col overflow-hidden rounded-lg border">
              <div className="flex shrink-0 flex-wrap items-center gap-2 border-b p-3"><h3 className="mr-auto font-medium">Saved candidates</h3><Button type="button" variant="outline" size="sm" onClick={() => setCompareIds(store.records.map((record) => record.id))}>Select all</Button><Button type="button" variant="ghost" size="sm" onClick={() => setCompareIds([])}>Clear selection</Button></div>
              <ul className="min-h-0 min-w-0 flex-1 divide-y overflow-auto">
                {store.records.map((record) => <li key={record.id} className="flex min-w-0 items-start gap-3 p-3">
                  <Checkbox className="mt-1 shrink-0" checked={compareIds.includes(record.id)} onCheckedChange={() => toggleCompare(record.id)} aria-label={`Compare ${record.projects[0].name} and ${record.projects[1].name}`} />
                  <button type="button" className="min-w-0 flex-1 space-y-1 rounded-sm text-left outline-offset-4 hover:underline focus-visible:underline" aria-pressed={record.id === editingId} onClick={() => setEditingId(record.id)}>
                    <span className="block break-words font-medium">{record.projects[0].name}<span className="block text-xs font-normal text-muted-foreground">↔ {record.projects[1].name}</span></span>
                    <span className="block"><Badge variant={record.id === editingId ? "default" : "secondary"}>{record.reviewState}</Badge></span>
                    <span className="block break-words text-xs text-muted-foreground">{availability[record.id]}</span>
                    <span className="block break-words text-xs text-muted-foreground">Saved {record.savedAt.slice(0, 10)}; snapshot {record.dataset.generatedAt}</span>
                  </button>
                </li>)}
              </ul>
            </section>
            {editing ? <SavedReview
              key={editing.id}
              record={editing}
              draft={drafts[editing.id] ?? { notes: editing.notes, reviewState: editing.reviewState }}
              availability={availability[editing.id]}
              canShowCurrent={activeIds.has(editing.id)}
              onDraftChange={(draft) => setDrafts((previous) => ({ ...previous, [editing.id]: draft }))}
              onSave={(draft) => updateReview(editing, draft)}
              onShowCurrent={() => showCurrent(editing.id)}
              onRemove={() => removeRecord(editing)}
            /> : <div className="min-h-0 min-w-0 overflow-auto rounded-lg border p-4 text-sm text-muted-foreground">Select a saved candidate to review its notes and evidence.</div>}
          </div> : <p className="min-h-0 flex-1 overflow-auto p-4 text-sm text-muted-foreground">No saved candidates in this mode yet. Close this dialog and select a candidate to save it.</p>}
        </TabsContent>
        <TabsContent value="compare" className="min-h-0 min-w-0 overflow-hidden data-[state=active]:flex data-[state=active]:flex-col">
          <div className="shrink-0 space-y-1 pb-3"><h3 className="font-medium">Compare saved evidence</h3><p className="text-xs text-muted-foreground">Comparison and exports use saved snapshots and saved review notes. Refresh evidence explicitly from the selected current candidate.</p></div>
          {compared.length ? <div className="min-h-0 min-w-0 flex-1 overflow-auto rounded-lg border [&>[data-slot=table-container]]:overflow-visible">
            <Table className="min-w-[48rem]"><TableHeader className="sticky top-0 z-10 bg-background"><TableRow><TableHead>Saved pair</TableHead><TableHead>Center distance</TableHead><TableHead>Timing context</TableHead><TableHead>Saved scenario</TableHead><TableHead>Review notes</TableHead></TableRow></TableHeader><TableBody>{compared.map((record) => <TableRow key={record.id}>
              <TableCell className="max-w-64 whitespace-normal break-words"><button type="button" className="text-left underline-offset-4 hover:underline focus-visible:underline" onClick={() => { setEditingId(record.id); setTab("saved") }}>{record.projects[0].name}<span className="block text-xs text-muted-foreground">↔ {record.projects[1].name}</span></button><span className="mt-1 block text-xs text-muted-foreground">{availability[record.id]}</span></TableCell>
              <TableCell>{record.opportunity.distanceMiles.toFixed(2)} mi<span className="block text-xs text-muted-foreground">{record.opportunity.locationConfidence}</span></TableCell>
              <TableCell className="max-w-52 whitespace-normal">{record.opportunity.dateGapDays === null ? "Milestone gap unknown" : `${record.opportunity.dateGapDays} days between milestones`}<span className="block text-xs text-muted-foreground">{timelineLabels[record.opportunity.timelineRelation]}</span></TableCell>
              <TableCell className="whitespace-normal text-xs">&lt;{record.options.radiusMiles} mi<br />{record.options.maxDateGapDays === null ? "Any milestone gap" : `≤${record.options.maxDateGapDays} days`}<br />{record.options.includeUnverified ? "Unverified locations included" : "Confirmed locations required"}</TableCell>
              <TableCell className="max-w-64 whitespace-pre-wrap break-words text-xs"><span className="mb-1 block font-medium">{record.reviewState}</span>{record.notes || "No notes"}</TableCell>
            </TableRow>)}</TableBody></Table>
          </div> : <div className="min-h-0 flex-1 space-y-3 overflow-auto p-4"><p className="text-sm text-muted-foreground">Select saved candidates to compare their evidence and export a brief.</p><Button type="button" variant="outline" onClick={() => setTab("saved")}>Choose saved candidates</Button></div>}
        </TabsContent>
      </Tabs>
      <div className="flex shrink-0 flex-wrap items-center gap-2 border-t pt-4">
        <Badge variant="secondary">{compared.length} selected</Badge>
        <Button type="button" variant="outline" size="sm" disabled={!compared.length} onClick={() => exportSelected("txt")}>Export text brief</Button>
        <Button type="button" variant="outline" size="sm" disabled={!compared.length} onClick={() => exportSelected("json")}>Export JSON brief</Button>
        <DialogClose asChild><Button type="button" variant="ghost" size="sm" className="ml-auto">Close</Button></DialogClose>
      </div>
    </DialogContent>
  </Dialog>
}

function SavedReview({ record, draft, availability, canShowCurrent, onDraftChange, onSave, onShowCurrent, onRemove }: {
  record: SavedOpportunity
  draft: ReviewDraft
  availability: string
  canShowCurrent: boolean
  onDraftChange: (draft: ReviewDraft) => void
  onSave: (draft: ReviewDraft) => void
  onShowCurrent: () => void
  onRemove: () => void
}) {
  const fieldId = useId()
  const dirty = draft.notes !== record.notes || draft.reviewState !== record.reviewState
  function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); onSave(draft) }
  return <form onSubmit={submit} className="flex min-h-0 min-w-0 flex-col overflow-hidden rounded-lg border">
    <div className="flex shrink-0 flex-wrap items-center gap-2 border-b p-3"><h3 className="mr-auto font-medium">Review candidate</h3><Button type="button" variant="ghost" size="sm" disabled={!canShowCurrent} onClick={onShowCurrent}>Show current</Button><Button type="button" variant="ghost" size="sm" onClick={onRemove}>Remove</Button></div>
    <div className="min-h-0 min-w-0 flex-1 space-y-4 overflow-auto p-4">
      <div><p className="break-words text-sm font-medium">{record.projects[0].name} / {record.projects[1].name}</p><p className="mt-1 break-words text-xs text-muted-foreground">{availability}</p></div>
      <div className="space-y-2"><Label htmlFor={`${fieldId}-state`}>Review state</Label><Select value={draft.reviewState} onValueChange={(value) => onDraftChange({ ...draft, reviewState: value as ReviewState })}><SelectTrigger id={`${fieldId}-state`}><SelectValue /></SelectTrigger><SelectContent>{REVIEW_STATES.map((state) => <SelectItem value={state} key={state}>{state}</SelectItem>)}</SelectContent></Select></div>
      <div className="space-y-2"><Label htmlFor={`${fieldId}-notes`}>Coordination notes</Label><Textarea id={`${fieldId}-notes`} value={draft.notes} onChange={(event) => onDraftChange({ ...draft, notes: event.target.value })} placeholder="Record the rationale, evidence gaps and questions for a coordination discussion." rows={4} /></div>
      <details className="min-w-0 rounded-lg border p-3"><summary className="cursor-pointer font-medium">Saved source evidence</summary><div className="mt-4 min-w-0 space-y-5 break-words [overflow-wrap:anywhere]">{record.projects.map((project) => <ProjectEvidence key={project.id} project={project} />)}</div></details>
      <p className="text-xs text-muted-foreground">Review states record your assessment. They do not confirm engineering feasibility or a utility agreement.</p>
    </div>
    <div className="flex shrink-0 flex-wrap items-center gap-2 border-t p-3"><Button type="submit">Save review</Button>{dirty && <span className="text-xs text-muted-foreground">Unsaved changes</span>}</div>
  </form>
}
