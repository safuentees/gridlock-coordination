import { useId, useMemo, useRef, useState, type FormEvent } from "react"
import { ChevronLeftIcon, ChevronRightIcon, DownloadIcon, SearchIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { IconButton } from "@/components/ui/icon-button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { compareDatasets, downloadDataset, type DatasetChanges } from "@/data/import"
import { createLocationRevision, getReadiness, type LocationEvidenceDraft } from "@/data/readiness"
import { getLocationProposals, getLocationResearchHint } from "@/data/location-proposals"
import type { DataMode, Dataset, Project } from "@/domain/schema"
import { InventoryEvidence } from "@/features/explorer/ProjectDetails"
import { reportingGroups, reportingGroupLabel, projectLocationLabel } from "@/lib/reporting-groups"
import { visibleProjectNotes } from "@/lib/presentation"
import { matchesProjectQuery } from "@/lib/project-search"
import { EvidenceSources, LOCATION_METHODS, LocationEvidence, RevisionPreview } from "./RevisionPreview"

interface ReadinessWorkspaceProps {
  dataset: Dataset
  onApply: (dataset: Dataset) => void
  onExploreProject: (id: string) => void
}
type EditorDraft = Omit<LocationEvidenceDraft, "method"> & { method: LocationEvidenceDraft["method"] | "" }
type Queue = "missing" | "unverified" | "all"
const PAGE_SIZE = 25
interface Preview {
  key: string
  fingerprint: string
  base: Dataset
  revision: Dataset
  before: Project
  after: Project
  changes: DatasetChanges
  suggestionCaveat?: string
}
function initialDraft(project: Project): EditorDraft {
  return {
    latitude: project.location ? String(project.location.lat) : "", longitude: project.location ? String(project.location.lon) : "",
    method: project.location?.method ?? "", sourceFile: "", sourceLocator: "", sourceUrl: "",
  }
}

export function ReadinessWorkspace({ dataset, onApply, onExploreProject }: ReadinessWorkspaceProps) {
  const formId = useId()
  const [queue, setQueue] = useState<Queue>("missing")
  const [search, setSearch] = useState("")
  const [filing, setFiling] = useState("all")
  const [page, setPage] = useState(0)
  const queueBody = useRef<HTMLDivElement>(null)
  const [selection, setSelection] = useState<Partial<Record<DataMode, string>>>({})
  const [drafts, setDrafts] = useState<Record<string, EditorDraft>>({})
  const [candidate, setCandidate] = useState<Preview | null>(null)
  const [editorTab, setEditorTab] = useState("evidence")
  const [error, setError] = useState<{ key: string; message: string; base: Dataset } | null>(null)
  const [notice, setNotice] = useState<{ key: string; message: string } | null>(null)
  const summary = useMemo(() => getReadiness(dataset), [dataset])
  const suggestions = useMemo(() => getLocationProposals(dataset), [dataset])
  const groups = useMemo(() => reportingGroups(dataset.projects), [dataset])
  const queueCounts = filing === "all" ? summary : summary.byUtility[filing] ?? { total: 0, missing: 0, unverified: 0, confirmed: 0 }
  const projects = useMemo(() => {
    return dataset.projects.filter((project) => {
      const matchesQueue = queue === "all" || (queue === "missing" ? project.location === null : project.location?.confidence === "unverified")
      const matchesSearch = matchesProjectQuery(project, search)
      return matchesQueue && matchesSearch && (filing === "all" || project.utilityId === filing)
    })
  }, [dataset, queue, search, filing])
  const pageCount = Math.max(1, Math.ceil(projects.length / PAGE_SIZE))
  const activePage = Math.min(page, pageCount - 1)
  const pageProjects = projects.slice(activePage * PAGE_SIZE, (activePage + 1) * PAGE_SIZE)
  const pageIds = new Set(pageProjects.map(project => project.id))
  const queueSuggestions = suggestions.filter(proposal => pageIds.has(proposal.projectId))
  const selected = dataset.projects.find((project) => project.id === selection[dataset.mode]) ?? projects[0] ?? null
  const selectedNotes = selected ? visibleProjectNotes(selected) : []
  const suggestion = suggestions.find(proposal => proposal.projectId === selected?.id)
  const researchHint = selected ? getLocationResearchHint(dataset, selected) : null
  const draftKey = selected ? JSON.stringify([dataset.mode, selected.id]) : ""
  const draft = selected ? drafts[draftKey] ?? initialDraft(selected) : null
  const fingerprint = draft ? JSON.stringify(draft) : ""
  // A preview is actionable only against the exact dataset and form it was made from.
  const preview = candidate?.key === draftKey && candidate.base === dataset && candidate.fingerprint === fingerprint ? candidate : null
  const previewInvalidated = candidate?.key === draftKey && candidate.base !== dataset
  const activeTab = editorTab === "preview" && preview ? "preview" : "evidence"
  const activeError = error?.key === draftKey && error.base === dataset ? error.message : null
  const activeNotice = notice?.key === draftKey ? notice.message : null
  const outsideQueue = selected !== null && !projects.some((project) => project.id === selected.id)

  function preserveSelection() {
    if (selected) setSelection(previous => ({ ...previous, [dataset.mode]: selected.id }))
  }
  function changeQueuePage(nextPage: number) {
    preserveSelection()
    setPage(nextPage)
    if (queueBody.current) queueBody.current.scrollTop = 0
  }
  function changeQueueFilter(update: () => void) {
    changeQueuePage(0)
    update()
  }
  function chooseProject(project: Project) {
    setSelection((previous) => ({ ...previous, [dataset.mode]: project.id })); setEditorTab("evidence")
  }
  function updateDraft<K extends keyof EditorDraft>(field: K, value: EditorDraft[K]) {
    if (!selected || !draft) return
    setSelection((previous) => ({ ...previous, [dataset.mode]: selected.id }))
    setDrafts((previous) => ({ ...previous, [draftKey]: { ...draft, [field]: value } }))
    setCandidate(null); setError(null); setNotice(null)
  }
  function preparePreview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!selected || !draft || dataset.mode !== "real") return
    setError(null); setNotice(null); setCandidate(null)
    setSelection((previous) => ({ ...previous, [dataset.mode]: selected.id }))
    try {
      if (!draft.method) throw new Error("Choose how the coordinates were determined.")
      const revision = createLocationRevision(dataset, selected.id, { ...draft, method: draft.method })
      const after = revision.projects.find((project) => project.id === selected.id)
      if (!after) throw new Error("The revised project could not be found. Preview again from the active dataset.")
      setCandidate({ key: draftKey, fingerprint, base: dataset, revision, before: selected, after, changes: compareDatasets(dataset, revision) })
      setEditorTab("preview")
    } catch (failure) {
      setError({ key: draftKey, base: dataset, message: failure instanceof Error ? failure.message : "The location evidence could not be validated." })
    }
  }
  function applyPreview() {
    if (!preview || dataset.mode !== "real") return
    try {
      onApply(preview.revision)
      setCandidate(null); setError(null); setEditorTab("evidence")
      setNotice({ key: draftKey, message: "Location revision applied." })
    } catch (failure) {
      setError({ key: draftKey, base: dataset, message: failure instanceof Error ? failure.message : "The revision could not be applied." })
    }
  }
  function previewSuggestion() {
    if (!selected || !suggestion) return
    setError(null); setNotice(null); setCandidate(null)
    setSelection(previous => ({ ...previous, [dataset.mode]: selected.id }))
    try {
      const revision = createLocationRevision(dataset, selected.id, suggestion.draft)
      const after = revision.projects.find(project => project.id === selected.id)
      if (!after) throw new Error("The project is no longer available.")
      setCandidate({ key: draftKey, fingerprint, base: dataset, revision, before: selected, after, changes: compareDatasets(dataset, revision), suggestionCaveat: suggestion.caveat })
      setEditorTab("preview")
    } catch (failure) {
      setError({ key: draftKey, base: dataset, message: failure instanceof Error ? failure.message : "The suggested evidence could not be previewed." })
    }
  }
  function downloadPreview() {
    if (!preview || dataset.mode !== "real") return
    try {
      downloadDataset(preview.revision)
      setNotice({ key: draftKey, message: "Revision ready to download." })
    } catch (failure) {
      setError({ key: draftKey, base: dataset, message: failure instanceof Error ? failure.message : "The revision download could not be prepared." })
    }
  }

  return <section className="flex h-full min-h-0 w-full min-w-0 flex-col gap-4 overflow-hidden" aria-label="Data readiness workspace">
    <header className="max-h-[30%] min-h-0 shrink-0 space-y-3 overflow-auto overscroll-contain">
      <div className="flex flex-wrap items-center gap-3"><h2 className="text-lg font-semibold">Data readiness</h2>{dataset.mode === "demo" && <Badge variant="secondary">Synthetic demo</Badge>}</div>
      <p className="text-sm text-muted-foreground">{dataset.mode === "demo" ? "Switch to source data to add location evidence." : "Select a project, add its location and source, then preview the change."}</p>
    </header>
    <div className="grid min-h-0 min-w-0 flex-1 grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-4 overflow-hidden">
      <Card className="min-h-0 min-w-0"><CardHeader className="shrink-0"><CardTitle>Location evidence queue</CardTitle></CardHeader><CardContent className="flex min-h-0 min-w-0 flex-1 flex-col gap-3">
        <div role="group" aria-label="Location queue" className="flex shrink-0 flex-wrap gap-2">{([ ["missing", "Missing", queueCounts.missing], ["unverified", "Unverified", queueCounts.unverified], ["all", "All records", queueCounts.total] ] as const).map(([value, label, count]) => <Button key={value} variant={queue === value ? "secondary" : "outline"} size="sm" aria-pressed={queue === value} onClick={() => changeQueueFilter(() => setQueue(value))}>{label} ({count})</Button>)}</div>
        <div className="shrink-0 space-y-2"><Label htmlFor={`${formId}-search`}><SearchIcon aria-hidden="true" className="size-4" />Search records</Label><Input id={`${formId}-search`} placeholder="Name, need, zone or source ID" value={search} onChange={(event) => changeQueueFilter(() => setSearch(event.target.value))} /></div>
        <div className="flex shrink-0 flex-wrap items-center justify-between gap-2"><Select value={filing} onValueChange={value => changeQueueFilter(() => setFiling(value))}><SelectTrigger aria-label="Filter reporting filing"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All filings</SelectItem>{groups.map(group => <SelectItem key={group.id} value={group.id}>{group.label}</SelectItem>)}{filing !== "all" && !groups.some(group => group.id === filing) && <SelectItem value={filing}>{filing} (not in this revision)</SelectItem>}</SelectContent></Select><p className="text-xs text-muted-foreground" aria-live="polite">{projects.length} matching records</p></div>
        <div ref={queueBody} className="min-h-0 min-w-0 flex-1 space-y-3 overflow-auto overscroll-contain" tabIndex={0} role="region" aria-label="Location evidence records">
          {queueSuggestions.length > 0 && <details className="rounded-lg border p-3 text-sm"><summary className="cursor-pointer font-medium">Suggested evidence on this page ({queueSuggestions.length})</summary><ul className="mt-2 space-y-1">{queueSuggestions.map(proposal => <li key={proposal.decisionId}><Button variant="ghost" size="sm" className="h-auto w-full justify-start whitespace-normal text-left [overflow-wrap:anywhere]" onClick={() => { const project = dataset.projects.find(item => item.id === proposal.projectId); if (project) chooseProject(project) }}>{dataset.projects.find(project => project.id === proposal.projectId)?.name}</Button></li>)}</ul></details>}
          {projects.length ? <ul className="space-y-1">{pageProjects.map((project) => <li key={project.id}><Button variant={selected?.id === project.id ? "secondary" : "ghost"} className="h-auto w-full justify-start whitespace-normal p-3 text-left" aria-pressed={selected?.id === project.id} onClick={() => chooseProject(project)}><span className="min-w-0 space-y-1 [overflow-wrap:anywhere]"><span className="block font-medium">{project.name}</span><span className="block text-xs text-muted-foreground">{project.sourceId ?? "No source ID"}; {reportingGroupLabel(project)}</span><span className="block text-xs text-muted-foreground">{projectLocationLabel(project)}</span></span></Button></li>)}</ul> : <div className="space-y-3 py-4"><p className="text-sm text-muted-foreground">No records match this queue and search.</p><Button variant="outline" size="sm" onClick={() => changeQueueFilter(() => { setQueue("all"); setSearch(""); setFiling("all") })}>Show all projects</Button></div>}
          <details className="border-t pt-3 text-xs text-muted-foreground"><summary className="cursor-pointer">Coverage by filing</summary><div className="mt-2 space-y-1">{groups.map(group => <p key={group.id}>{group.label}: {summary.byUtility[group.id]?.total ?? 0} records; {summary.byUtility[group.id]?.missing ?? 0} missing, {summary.byUtility[group.id]?.unverified ?? 0} unverified, {summary.byUtility[group.id]?.confirmed ?? 0} marked confirmed.</p>)}</div></details>
        </div>
        <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-t pt-3" aria-label="Location queue pagination">
          <p className="text-xs text-muted-foreground" aria-live="polite">{projects.length ? `${activePage * PAGE_SIZE + 1}–${Math.min((activePage + 1) * PAGE_SIZE, projects.length)} of ${projects.length}` : "0 records"}</p>
          <div className="flex gap-2"><IconButton variant="outline" label="Previous readiness page" disabled={activePage === 0} onClick={() => changeQueuePage(activePage - 1)}><ChevronLeftIcon aria-hidden="true" /></IconButton><IconButton variant="outline" label="Next readiness page" disabled={activePage + 1 >= pageCount} onClick={() => changeQueuePage(activePage + 1)}><ChevronRightIcon aria-hidden="true" /></IconButton></div>
        </div>
      </CardContent></Card>
      <Card className="min-h-0 min-w-0"><CardHeader className="max-h-[25%] min-h-0 shrink-0 overflow-auto overscroll-contain"><div className="flex flex-wrap items-start justify-between gap-3"><div className="min-w-0 flex-1 [overflow-wrap:anywhere]"><CardTitle>{selected?.name ?? "Select a project"}</CardTitle>{selected && <p className="mt-1 text-xs text-muted-foreground">{reportingGroupLabel(selected)}; {selected.sourceId ?? selected.id}<span className="block">{projectLocationLabel(selected)}</span></p>}</div>{selected && <Button variant="outline" size="sm" onClick={() => onExploreProject(selected.id)}>Explore project</Button>}</div>{outsideQueue ? <p className="text-xs text-muted-foreground">Selected record is outside these filters.</p> : selected && !pageIds.has(selected.id) && <p className="text-xs text-muted-foreground">Selected record is on another queue page.</p>}</CardHeader>
        <CardContent className="flex min-h-0 min-w-0 flex-1 flex-col gap-3">
          {selected && draft ? <>
            <Tabs value={activeTab} onValueChange={setEditorTab} className="min-h-0 min-w-0 flex-1 overflow-hidden"><TabsList aria-label="Location evidence views" className="shrink-0"><TabsTrigger value="evidence">Evidence</TabsTrigger><TabsTrigger value="preview" disabled={!preview}>Revision preview</TabsTrigger></TabsList>
              <TabsContent value="evidence" className="min-h-0 min-w-0 overflow-auto overscroll-contain pt-3">
                <div className="space-y-4 [overflow-wrap:anywhere]">
                  <details className="rounded-lg border p-3"><summary className="cursor-pointer font-medium">Current location and sources</summary><div className="mt-3 space-y-4"><LocationEvidence location={selected.location} /><InventoryEvidence project={selected} /><div className="space-y-2"><h3 className="text-sm font-medium">Project sources</h3><EvidenceSources sources={selected.sources} /></div>{selectedNotes.length > 0 && <ul className="list-disc space-y-1 pl-4 text-xs text-muted-foreground">{selectedNotes.map((note, index) => <li key={index}>{note}</li>)}</ul>}</div></details>
                  {suggestion && <section className="space-y-2 rounded-lg border p-3"><h3 className="text-sm font-medium">Suggested location evidence</h3><p className="text-sm text-muted-foreground">{suggestion.caveat}</p><a className="text-sm underline underline-offset-4" href={suggestion.draft.sourceUrl} target="_blank" rel="noreferrer">{suggestion.draft.sourceFile}</a><div><Button type="button" variant="outline" size="sm" onClick={previewSuggestion}>Preview suggestion</Button></div></section>}
                  {researchHint && <section className="space-y-2 rounded-lg border p-3"><h3 className="text-sm font-medium">Evidence still needed</h3><p className="text-sm text-muted-foreground">{researchHint.enables}</p><details className="text-sm"><summary className="cursor-pointer">Research sources</summary><ul className="mt-2 space-y-2">{researchHint.publicSources.map(source => <li key={source.url}><a className="underline underline-offset-4" href={source.url} target="_blank" rel="noreferrer">{source.title}</a><p className="text-xs text-muted-foreground">{source.locator}</p></li>)}</ul></details></section>}
                  {dataset.mode === "demo" ? null : <form id={formId} onSubmit={preparePreview} noValidate className="space-y-4">
                    <p className="text-sm text-muted-foreground">Use decimal WGS84 coordinates.{selected.inventory && " This form updates the displayed location, not its qualified role or the original source positions."}</p>
                    <div className="grid gap-3 sm:grid-cols-2"><div className="space-y-2"><Label htmlFor={`${formId}-latitude`}>Latitude</Label><Input id={`${formId}-latitude`} inputMode="decimal" value={draft.latitude} onChange={(event) => updateDraft("latitude", event.target.value)} placeholder="−90 to 90" required /></div><div className="space-y-2"><Label htmlFor={`${formId}-longitude`}>Longitude</Label><Input id={`${formId}-longitude`} inputMode="decimal" value={draft.longitude} onChange={(event) => updateDraft("longitude", event.target.value)} placeholder="−180 to 180" required /></div></div>
                    <div className="space-y-2"><Label htmlFor={`${formId}-method`}>Location method</Label><Select value={draft.method} onValueChange={(value) => updateDraft("method", value as LocationEvidenceDraft["method"])}><SelectTrigger id={`${formId}-method`} className="w-full"><SelectValue placeholder="Choose the source method" /></SelectTrigger><SelectContent>{Object.entries(LOCATION_METHODS).map(([method, label]) => <SelectItem key={method} value={method}>{label}</SelectItem>)}</SelectContent></Select><p className="text-xs text-muted-foreground">For a midpoint, enter the center of the cited endpoints.</p></div>
                    <div className="space-y-2"><Label htmlFor={`${formId}-file`}>Source title or filename</Label><Input id={`${formId}-file`} value={draft.sourceFile} onChange={(event) => updateDraft("sourceFile", event.target.value)} required /></div>
                    <div className="space-y-2"><Label htmlFor={`${formId}-locator`}>Exact source locator</Label><Input id={`${formId}-locator`} value={draft.sourceLocator} onChange={(event) => updateDraft("sourceLocator", event.target.value)} placeholder="Page, sheet and cell range, or exact section" required /></div>
                    <div className="space-y-2"><Label htmlFor={`${formId}-url`}>Source URL (optional)</Label><Input id={`${formId}-url`} type="url" value={draft.sourceUrl} onChange={(event) => updateDraft("sourceUrl", event.target.value)} placeholder="https://" /></div>
                  </form>}
                </div>
              </TabsContent>
              <TabsContent value="preview" className="min-h-0 min-w-0 overflow-auto overscroll-contain pt-3">{preview && <>{preview.suggestionCaveat && <p className="mb-3 text-sm text-muted-foreground">{preview.suggestionCaveat} Your form draft is unchanged.</p>}<RevisionPreview before={preview.before} after={preview.after} changes={preview.changes} /></>}</TabsContent>
            </Tabs>
            {activeError && <p role="alert" className="max-h-24 shrink-0 overflow-auto text-sm text-destructive">{activeError}</p>}
            {previewInvalidated && <p role="status" className="shrink-0 text-xs text-muted-foreground">The dataset changed. Preview again before applying.</p>}
            {activeNotice && <p role="status" className="shrink-0 text-xs text-muted-foreground">{activeNotice}</p>}
            <div className="flex shrink-0 flex-wrap gap-2 border-t pt-3">
              {activeTab === "evidence" ? <Button type="submit" form={formId} disabled={dataset.mode !== "real"}>Preview revision</Button> : <>
                <Button disabled={!preview || dataset.mode !== "real"} onClick={applyPreview}>Apply revision</Button>
                <Button variant="outline" onClick={() => setEditorTab("evidence")}>Edit evidence</Button>
                <Button variant="outline" disabled={!preview || dataset.mode !== "real"} onClick={downloadPreview}><DownloadIcon aria-hidden="true" data-icon="inline-start" />Download revision</Button>
              </>}
            </div>
          </> : <p className="text-sm text-muted-foreground">Select a project to add location evidence.</p>}
        </CardContent>
      </Card>
    </div>
  </section>
}
