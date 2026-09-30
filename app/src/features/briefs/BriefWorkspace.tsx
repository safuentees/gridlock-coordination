import { useEffect, useId, useMemo, useRef, useState, type FormEvent } from "react"
import { createPortal } from "react-dom"
import { BookmarkIcon, DownloadIcon, RefreshCwIcon, SaveIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { estimateImpact } from "@/core"
import type { AnalysisOptions, DataMode, Dataset, ImpactInputs, Opportunity } from "@/domain/schema"
import { ProjectEvidence } from "@/features/explorer/ProjectDetails"
import { timelineLabels } from "@/features/explorer/format"
import { briefText, createBrief, downloadBrief } from "./export"
import { RestoreBrief } from "./RestoreBrief"
import { EMPTY_INVESTIGATION, investigationSchema, readSaved, REVIEW_STATES, savedAvailability, snapshotOpportunity, writeSaved, type Investigation, type ReviewState, type SavedOpportunity } from "./storage"

export interface ScenarioSaveRequest {
  pairId: string
  mode: DataMode
  request: number
  inputs: ImpactInputs
}

interface BriefWorkspaceProps {
  dataset: Dataset
  options: AnalysisOptions
  selectedOpportunity: Opportunity | null
  opportunities: Opportunity[]
  onShowCurrent: (id: string) => void
  openRequest?: number
  saveScenarioRequest?: ScenarioSaveRequest | null
  saveActionTarget?: HTMLElement | null
  hideReviewsTrigger?: boolean
}
type ReviewDraft = { notes: string; reviewState: ReviewState; investigation: Investigation }
const RESOURCE_LABELS: Record<Investigation["resource"], string> = {
  unspecified: "Not specified", "right-of-way": "Right-of-way", "crews-equipment": "Crews or equipment",
  "substation-capacity": "Substation capacity", other: "Other",
}
function draftFrom(record: SavedOpportunity): ReviewDraft {
  return { notes: record.notes, reviewState: record.reviewState, investigation: { ...(record.investigation ?? EMPTY_INVESTIGATION) } }
}
function isDirty(record: SavedOpportunity, draft: ReviewDraft) {
  return draft.notes !== record.notes || draft.reviewState !== record.reviewState
    || JSON.stringify(draft.investigation) !== JSON.stringify(record.investigation ?? EMPTY_INVESTIGATION)
}

export function BriefWorkspace(props: BriefWorkspaceProps) {
  return <Workspace key={props.dataset.mode} {...props} />
}
function Workspace({ dataset, options, selectedOpportunity, opportunities, onShowCurrent, openRequest = 0, saveScenarioRequest = null, saveActionTarget, hideReviewsTrigger = false }: BriefWorkspaceProps) {
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
  const dirtyIds = useMemo(() => new Set(Object.entries(drafts).filter(([id, draft]) => {
    const saved = store.records.find(record => record.id === id)
    return !saved || isDirty(saved, draft)
  }).map(([id]) => id)), [drafts, store.records])
  const unsavedCompared = compared.some(record => drafts[record.id] && isDirty(record, drafts[record.id]))
  const editing = store.records.find((record) => record.id === editingId) ?? null
  const currentSaved = store.records.find((record) => record.id === selectedOpportunity?.id)
  const externalOpener = useRef<HTMLElement | null>(null)
  const previousOpenRequest = useRef(openRequest)
  useEffect(() => {
    if (openRequest !== previousOpenRequest.current) {
      previousOpenRequest.current = openRequest
      if (hideReviewsTrigger) externalOpener.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
      setOpen(true)
      setEditingId(previous => previous ?? store.records[0]?.id ?? null)
    }
  }, [openRequest])
  const previousScenarioRequest = useRef(saveScenarioRequest?.request ?? 0)
  useEffect(() => {
    if (!saveScenarioRequest || saveScenarioRequest.request === previousScenarioRequest.current) return
    previousScenarioRequest.current = saveScenarioRequest.request
    if (saveScenarioRequest.mode !== dataset.mode || !selectedOpportunity || selectedOpportunity.id !== saveScenarioRequest.pairId) {
      setNotice("Selection changed. Save the scenario again for the intended candidate.")
      return
    }
    // Saving assumptions never silently refreshes evidence or commits dirty review fields.
    const existing = store.records.find(record => record.id === saveScenarioRequest.pairId)
    const base = existing ?? snapshotOpportunity(dataset, selectedOpportunity, options)
    const investigation = investigationSchema.safeParse({ ...(base.investigation ?? EMPTY_INVESTIGATION), impactInputs: saveScenarioRequest.inputs })
    if (!investigation.success) { setNotice("Check the hypothetical inputs before saving the scenario."); return }
    const snapshot = { ...base, investigation: investigation.data, updatedAt: new Date().toISOString() }
    commit(existing ? store.records.map(record => record.id === snapshot.id ? snapshot : record) : [...store.records, snapshot])
    setDrafts(previous => {
      const draft = previous[snapshot.id]
      return draft ? { ...previous, [snapshot.id]: { ...draft, investigation: { ...draft.investigation, impactInputs: investigation.data.impactInputs } } } : previous
    })
    setCompareIds(ids => ids.includes(snapshot.id) ? ids : [...ids, snapshot.id])
    setEditingId(snapshot.id)
    setNotice("Hypothetical scenario saved. Unsaved review edits are preserved.")
  }, [saveScenarioRequest])
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
    const investigation = investigationSchema.safeParse(draft.investigation)
    if (!investigation.success) { setNotice("Check the investigation and hypothetical inputs before saving."); return }
    commit(store.records.map((item) => item.id === record.id ? { ...item, ...draft, investigation: investigation.data, updatedAt: new Date().toISOString() } : item))
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
  function restoreRecords(records: SavedOpportunity[]) {
    commit(records)
    // Clean cached drafts must not hide a restored replacement; dirty drafts stay untouched.
    setDrafts(previous => Object.fromEntries(Object.entries(previous).filter(([id]) => dirtyIds.has(id))))
    setEditingId(previous => previous ?? records[0]?.id ?? null)
    setNotice("Restored findings are available in Saved.")
  }
  function showCurrent(id: string) { externalOpener.current = null; onShowCurrent(id); setOpen(false) }

  const saveAction = <div className="flex min-w-0 flex-wrap items-center gap-2">
    <Button type="button" disabled={!selectedOpportunity} onClick={saveSelected}>{currentSaved ? <RefreshCwIcon aria-hidden="true" data-icon="inline-start" /> : <SaveIcon aria-hidden="true" data-icon="inline-start" />}{currentSaved ? "Refresh evidence" : "Save selected"}</Button>
    {store.error ? <span role="alert" className="min-w-0 text-xs text-destructive">{store.error}</span> : notice && <span role="status" className="min-w-0 text-xs text-muted-foreground">{notice}</span>}
  </div>
  return <Dialog open={open} onOpenChange={setOpen}>
    {saveActionTarget && createPortal(saveAction, saveActionTarget)}
    {!hideReviewsTrigger && <div className="flex min-w-0 flex-wrap items-center gap-2">{!saveActionTarget && saveAction}<DialogTrigger asChild><Button type="button" variant="outline" onClick={() => { if (!editingId && store.records[0]) setEditingId(store.records[0].id) }}><BookmarkIcon aria-hidden="true" data-icon="inline-start" />Saved reviews ({store.records.length})</Button></DialogTrigger></div>}
    <DialogContent className="flex h-[min(48rem,calc(100dvh-2rem))] max-h-[calc(100dvh-2rem)] min-h-0 min-w-0 flex-col overflow-hidden sm:max-w-6xl" onCloseAutoFocus={event => {
      if (!hideReviewsTrigger) return
      event.preventDefault()
      const opener = externalOpener.current
      if (opener?.isConnected && !opener.closest("[hidden], [inert]") && !opener.matches(":disabled")) opener.focus({ preventScroll: true })
    }}>
      <DialogHeader className="shrink-0 pr-6">
        <DialogTitle>Saved reviews</DialogTitle>
        <DialogDescription>{dataset.mode === "demo" ? "Synthetic demo" : "Source"} reviews saved in this browser.</DialogDescription>
      </DialogHeader>
      {(store.error || notice || removed) && <div className="max-h-24 shrink-0 space-y-2 overflow-auto">
        {store.error && <p role="alert" className="text-sm text-destructive">{store.error}</p>}
        {notice && <p role="status" className="text-sm text-muted-foreground">{notice}</p>}
        {removed && <div className="flex min-w-0 flex-wrap items-center gap-2"><span className="min-w-0 break-words text-xs text-muted-foreground">Removed: {removed.projects[0].name} / {removed.projects[1].name}</span><Button type="button" variant="outline" size="sm" onClick={undoRemove}>Undo removal</Button></div>}
      </div>}
      <Tabs value={tab} onValueChange={setTab} className="min-h-0 min-w-0 flex-1 overflow-hidden">
        <div className="-m-1 shrink-0 overflow-x-auto p-1"><TabsList aria-label="Saved review views"><TabsTrigger value="saved">Saved{store.records.length > 0 && ` (${store.records.length})`}</TabsTrigger><TabsTrigger value="compare">Compare{compared.length > 0 && ` (${compared.length})`}</TabsTrigger><TabsTrigger value="restore">Restore</TabsTrigger></TabsList></div>
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
                    <span className="block break-words text-xs text-muted-foreground">Saved {record.savedAt.slice(0, 10)}</span>
                  </button>
                </li>)}
              </ul>
            </section>
            {editing ? <SavedReview
              key={editing.id}
              record={editing}
              draft={drafts[editing.id] ?? draftFrom(editing)}
              availability={availability[editing.id]}
              currentOptions={options}
              canShowCurrent={activeIds.has(editing.id)}
              onDraftChange={(draft) => setDrafts((previous) => ({ ...previous, [editing.id]: draft }))}
              onSave={(draft) => updateReview(editing, draft)}
              onShowCurrent={() => showCurrent(editing.id)}
              onRemove={() => removeRecord(editing)}
            /> : <div className="min-h-0 min-w-0 overflow-auto rounded-lg border p-4 text-sm text-muted-foreground">Select a saved candidate to review.</div>}
          </div> : <p className="min-h-0 flex-1 overflow-auto p-4 text-sm text-muted-foreground">No saved reviews. Select a candidate, then choose Save selected.</p>}
        </TabsContent>
        <TabsContent value="compare" className="min-h-0 min-w-0 overflow-hidden data-[state=active]:flex data-[state=active]:flex-col">
          <div className="shrink-0 space-y-1 pb-3"><h3 className="font-medium">Compare saved evidence</h3><p className="text-xs text-muted-foreground">Comparison and exports use saved reviews, evidence and hypothetical scenarios.</p></div>
          {compared.length ? <div className="min-h-0 min-w-0 flex-1 overflow-auto rounded-lg border [&>[data-slot=table-container]]:overflow-visible">
            <Table className="min-w-[48rem]"><TableHeader className="sticky top-0 z-10 bg-background"><TableRow><TableHead>Saved pair</TableHead><TableHead>Center distance</TableHead><TableHead>Timing context</TableHead><TableHead>Analysis settings</TableHead><TableHead>Investigation</TableHead><TableHead>Review notes</TableHead></TableRow></TableHeader><TableBody>{compared.map((record) => <TableRow key={record.id}>
              <TableCell className="max-w-64 whitespace-normal break-words"><button type="button" className="text-left underline-offset-4 hover:underline focus-visible:underline" onClick={() => { setEditingId(record.id); setTab("saved") }}>{record.projects[0].name}<span className="block text-xs text-muted-foreground">↔ {record.projects[1].name}</span></button><span className="mt-1 block text-xs text-muted-foreground">{availability[record.id]}</span></TableCell>
              <TableCell>{record.opportunity.distanceMiles.toFixed(2)} mi<span className="block text-xs text-muted-foreground">{record.opportunity.locationConfidence}</span></TableCell>
              <TableCell className="max-w-52 whitespace-normal">{record.opportunity.dateGapDays === null ? "Milestone gap unknown" : `${record.opportunity.dateGapDays} days between milestones`}<span className="block text-xs text-muted-foreground">{timelineLabels[record.opportunity.timelineRelation]}</span></TableCell>
              <TableCell className="whitespace-normal text-xs">&lt;{record.options.radiusMiles} mi<br />{record.options.maxDateGapDays === null ? "Any milestone gap" : `≤${record.options.maxDateGapDays} days`}<br />{record.options.includeUnverified ? "Unverified locations included" : "Confirmed locations required"}</TableCell>
              <TableCell className="max-w-64 space-y-1 whitespace-pre-wrap break-words text-xs">
                {record.investigation?.resource && record.investigation.resource !== "unspecified" && <p className="font-medium">{RESOURCE_LABELS[record.investigation.resource]}</p>}
                {record.investigation?.objective && <p>{record.investigation.objective}</p>}
                {record.investigation?.nextAction && <p>Next: {record.investigation.nextAction}</p>}
                {record.investigation?.owner && <p>Analyst: {record.investigation.owner}</p>}
                {record.investigation?.impactInputs && <p>Hypothetical impact scenario saved</p>}
              </TableCell>
              <TableCell className="max-w-64 whitespace-pre-wrap break-words text-xs"><span className="mb-1 block font-medium">{record.reviewState}</span>{record.notes || "No notes"}</TableCell>
            </TableRow>)}</TableBody></Table>
          </div> : <div className="min-h-0 flex-1 space-y-3 overflow-auto p-4"><p className="text-sm text-muted-foreground">Select saved candidates to compare and export.</p><Button type="button" variant="outline" onClick={() => setTab("saved")}>Choose saved candidates</Button></div>}
        </TabsContent>
        <TabsContent forceMount value="restore" inert={tab !== "restore"} className={tab === "restore" ? "min-h-0 min-w-0 overflow-hidden" : "hidden"}>
          <RestoreBrief mode={dataset.mode} records={store.records} dirtyIds={dirtyIds} onRestore={restoreRecords} />
        </TabsContent>
      </Tabs>
      {tab !== "restore" && store.records.length > 0 && <div className="flex shrink-0 flex-wrap items-center gap-2 border-t pt-4">
        <Badge variant="secondary">{compared.length} selected</Badge>
        {unsavedCompared && <p className="text-xs text-muted-foreground">Unsaved review edits are not included in exports.</p>}
        <Button type="button" variant="outline" size="sm" disabled={!compared.length} onClick={() => exportSelected("txt")}><DownloadIcon aria-hidden="true" data-icon="inline-start" />Export text brief</Button>
        <Button type="button" variant="outline" size="sm" disabled={!compared.length} onClick={() => exportSelected("json")}><DownloadIcon aria-hidden="true" data-icon="inline-start" />Export JSON brief</Button>
      </div>}
    </DialogContent>
  </Dialog>
}

function SavedReview({ record, draft, availability, currentOptions, canShowCurrent, onDraftChange, onSave, onShowCurrent, onRemove }: {
  record: SavedOpportunity
  draft: ReviewDraft
  availability: string
  currentOptions: AnalysisOptions
  canShowCurrent: boolean
  onDraftChange: (draft: ReviewDraft) => void
  onSave: (draft: ReviewDraft) => void
  onShowCurrent: () => void
  onRemove: () => void
}) {
  const fieldId = useId()
  const dirty = isDirty(record, draft)
  const differentScenario = record.options.radiusMiles !== currentOptions.radiusMiles
    || record.options.maxDateGapDays !== currentOptions.maxDateGapDays
    || record.options.includeUnverified !== currentOptions.includeUnverified
  function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); onSave(draft) }
  return <form onSubmit={submit} className="flex min-h-0 min-w-0 flex-col overflow-hidden rounded-lg border">
    <div className="flex shrink-0 flex-wrap items-center gap-2 border-b p-3"><h3 className="mr-auto font-medium">Review candidate</h3><Button type="button" variant="ghost" size="sm" disabled={!canShowCurrent} onClick={onShowCurrent}>Show current</Button><Button type="button" variant="ghost" size="sm" onClick={onRemove}>Remove</Button></div>
    <div className="min-h-0 min-w-0 flex-1 space-y-4 overflow-auto p-4">
      <div><p className="break-words text-sm font-medium">{record.projects[0].name} / {record.projects[1].name}</p><p className="mt-1 break-words text-xs text-muted-foreground">{availability}</p></div>
      {differentScenario && <p className="text-xs text-muted-foreground">Saved analysis settings differ from the current scenario: &lt;{record.options.radiusMiles} mi; {record.options.maxDateGapDays === null ? "any milestone gap" : `≤${record.options.maxDateGapDays} days`}; {record.options.includeUnverified ? "unverified locations included" : "confirmed locations required"}.</p>}
      <div className="space-y-2"><Label htmlFor={`${fieldId}-state`}>Review state</Label><Select value={draft.reviewState} onValueChange={(value) => onDraftChange({ ...draft, reviewState: value as ReviewState })}><SelectTrigger id={`${fieldId}-state`}><SelectValue /></SelectTrigger><SelectContent>{REVIEW_STATES.map((state) => <SelectItem value={state} key={state}>{state}</SelectItem>)}</SelectContent></Select></div>
      <fieldset className="space-y-3">
        <legend className="mb-3 font-medium">Investigation (optional)</legend>
        <div className="space-y-2"><Label htmlFor={`${fieldId}-resource`}>Resource to investigate</Label><Select value={draft.investigation.resource} onValueChange={value => onDraftChange({ ...draft, investigation: { ...draft.investigation, resource: value as Investigation["resource"] } })}><SelectTrigger id={`${fieldId}-resource`} className="w-full"><SelectValue /></SelectTrigger><SelectContent>{Object.entries(RESOURCE_LABELS).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent></Select></div>
        <div className="space-y-2"><Label htmlFor={`${fieldId}-objective`}>Investigation question</Label><Textarea id={`${fieldId}-objective`} value={draft.investigation.objective} onChange={event => onDraftChange({ ...draft, investigation: { ...draft.investigation, objective: event.target.value } })} placeholder="What could these projects coordinate?" rows={3} /></div>
        <div className="space-y-2"><Label htmlFor={`${fieldId}-next-action`}>Next research action</Label><Textarea id={`${fieldId}-next-action`} value={draft.investigation.nextAction} onChange={event => onDraftChange({ ...draft, investigation: { ...draft.investigation, nextAction: event.target.value } })} placeholder="Evidence or feasibility question to resolve" rows={2} /></div>
        <div className="space-y-2"><Label htmlFor={`${fieldId}-owner`}>Review analyst or assignee</Label><Input id={`${fieldId}-owner`} value={draft.investigation.owner} onChange={event => onDraftChange({ ...draft, investigation: { ...draft.investigation, owner: event.target.value } })} /></div>
      </fieldset>
      <div className="space-y-2"><Label htmlFor={`${fieldId}-notes`}>Coordination notes</Label><Textarea id={`${fieldId}-notes`} value={draft.notes} onChange={(event) => onDraftChange({ ...draft, notes: event.target.value })} placeholder="Rationale, evidence gaps and questions" rows={4} /></div>
      {draft.investigation.impactInputs && <details className="min-w-0 space-y-3 rounded-lg border p-3"><summary className="cursor-pointer font-medium">Saved hypothetical impact</summary><SavedImpact inputs={draft.investigation.impactInputs} /><Button type="button" variant="outline" size="sm" onClick={() => onDraftChange({ ...draft, investigation: { ...draft.investigation, impactInputs: null } })}>Remove scenario from review</Button></details>}
      <details className="min-w-0 rounded-lg border p-3"><summary className="cursor-pointer font-medium">Saved source evidence</summary><div className="mt-4 min-w-0 space-y-5 break-words [overflow-wrap:anywhere]">{record.projects.map((project) => <ProjectEvidence key={project.id} project={project} />)}</div></details>
    </div>
    <div className="flex shrink-0 flex-wrap items-center gap-2 border-t p-3"><Button type="submit"><SaveIcon aria-hidden="true" data-icon="inline-start" />Save review</Button>{dirty && <span className="text-xs text-muted-foreground">Unsaved changes</span>}</div>
  </form>
}

function SavedImpact({ inputs }: { inputs: ImpactInputs }) {
  let result: ReturnType<typeof estimateImpact>
  try { result = estimateImpact(inputs) }
  catch { return <p className="text-sm text-destructive">Saved assumptions cannot be calculated.</p> }
  return <div className="space-y-3 text-sm">
    <dl className="grid grid-cols-2 gap-3">
      <div><dt className="text-muted-foreground">Shared length</dt><dd>{inputs.sharedLengthMiles} miles</dd></div>
      <div><dt className="text-muted-foreground">Corridor width</dt><dd>{inputs.corridorWidthFeet} feet</dd></div>
      <div><dt className="text-muted-foreground">Land cost</dt><dd>{inputs.costPerAcreUsd.toLocaleString("en-US", { style: "currency", currency: "USD" })} per acre</dd></div>
      <div><dt className="text-muted-foreground">Avoided share</dt><dd>{inputs.shareFraction * 100}%</dd></div>
      <div><dt className="text-muted-foreground">Hypothetical shared area</dt><dd>{result.sharedAcres.toFixed(2)} acres</dd></div>
      <div><dt className="text-muted-foreground">Indicative avoided land cost</dt><dd>{result.indicativeSavingsUsd.toLocaleString("en-US", { style: "currency", currency: "USD" })}</dd></div>
    </dl>
    <p className="text-xs text-muted-foreground">User assumptions, not a verified route or actual savings.</p>
  </div>
}
