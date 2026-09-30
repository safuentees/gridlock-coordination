import { useId, useMemo, useState, type FormEvent } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { compareDatasets, downloadDataset, type DatasetChanges } from "@/data/import"
import { createLocationRevision, getReadiness, type LocationEvidenceDraft } from "@/data/readiness"
import { UTILITIES, type DataMode, type Dataset, type Project } from "@/domain/schema"
import { EvidenceSources, LOCATION_METHODS, LocationEvidence, RevisionPreview } from "./RevisionPreview"

interface ReadinessWorkspaceProps {
  dataset: Dataset
  onApply: (dataset: Dataset) => void
  onExploreProject: (id: string) => void
}
type EditorDraft = Omit<LocationEvidenceDraft, "method"> & { method: LocationEvidenceDraft["method"] | "" }
type Queue = "missing" | "unverified" | "all"
interface Preview {
  key: string
  fingerprint: string
  base: Dataset
  revision: Dataset
  before: Project
  after: Project
  changes: DatasetChanges
}
function initialDraft(project: Project): EditorDraft {
  return {
    latitude: project.location ? String(project.location.lat) : "", longitude: project.location ? String(project.location.lon) : "",
    method: project.location?.method ?? "", sourceFile: "", sourceLocator: "", sourceUrl: "",
  }
}
function locationLabel(project: Project) { return project.location?.confidence ?? "Missing" }

export function ReadinessWorkspace({ dataset, onApply, onExploreProject }: ReadinessWorkspaceProps) {
  const formId = useId()
  const [queue, setQueue] = useState<Queue>("missing")
  const [search, setSearch] = useState("")
  const [filing, setFiling] = useState("all")
  const [selection, setSelection] = useState<Partial<Record<DataMode, string>>>({})
  const [drafts, setDrafts] = useState<Record<string, EditorDraft>>({})
  const [candidate, setCandidate] = useState<Preview | null>(null)
  const [editorTab, setEditorTab] = useState("evidence")
  const [error, setError] = useState<{ key: string; message: string; base: Dataset } | null>(null)
  const [notice, setNotice] = useState<{ key: string; message: string } | null>(null)
  const summary = useMemo(() => getReadiness(dataset), [dataset])
  const projects = useMemo(() => {
    const query = search.trim().toLocaleLowerCase()
    return dataset.projects.filter((project) => {
      const matchesQueue = queue === "all" || (queue === "missing" ? project.location === null : project.location?.confidence === "unverified")
      const matchesSearch = !query || [project.name, project.sourceId, project.sponsor, project.description, ...project.sources.flatMap((source) => [source.file, source.locator])].filter(Boolean).join(" ").toLocaleLowerCase().includes(query)
      return matchesQueue && matchesSearch && (filing === "all" || project.utilityId === filing)
    })
  }, [dataset, queue, search, filing])
  const selected = dataset.projects.find((project) => project.id === selection[dataset.mode]) ?? projects[0] ?? null
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
      setNotice({ key: draftKey, message: "Location revision applied. The updated center remains unverified." })
    } catch (failure) {
      setError({ key: draftKey, base: dataset, message: failure instanceof Error ? failure.message : "The revision could not be applied." })
    }
  }
  function downloadPreview() {
    if (!preview || dataset.mode !== "real") return
    try {
      downloadDataset(preview.revision)
      setNotice({ key: draftKey, message: "Prepared the validated source revision for download." })
    } catch (failure) {
      setError({ key: draftKey, base: dataset, message: failure instanceof Error ? failure.message : "The revision download could not be prepared." })
    }
  }

  return <section className="flex h-full min-h-0 w-full min-w-0 flex-col gap-4 overflow-hidden" aria-label="Data readiness workspace">
    <header className="max-h-[30%] min-h-0 shrink-0 space-y-3 overflow-auto overscroll-contain">
      <div className="flex flex-wrap items-center gap-3"><h2 className="text-lg font-semibold">Data readiness</h2>{dataset.mode === "demo" && <Badge variant="secondary">Synthetic demo</Badge>}</div>
      <p className="text-sm text-muted-foreground">{dataset.mode === "demo" ? "Browse synthetic coverage scenarios. Switch to source data to prepare a location revision." : "Add cited location evidence so more projects can enter proximity analysis. Select a record, enter its location and source, then preview the revision."}</p>
      <dl className="flex flex-wrap gap-x-6 gap-y-2 text-sm"><div><dt className="text-muted-foreground">Active projects</dt><dd className="font-medium">{summary.total}</dd></div><div><dt className="text-muted-foreground">Missing locations</dt><dd className="font-medium">{summary.missing}</dd></div><div><dt className="text-muted-foreground">Unverified locations</dt><dd className="font-medium">{summary.unverified}</dd></div><div><dt className="text-muted-foreground">Marked confirmed</dt><dd className="font-medium">{summary.confirmed}</dd></div></dl>
      <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted-foreground">{(["desc", "gpc"] as const).map((utility) => <p key={utility}>{UTILITIES[utility]}: {summary.byUtility[utility].total} projects; {summary.byUtility[utility].missing} missing, {summary.byUtility[utility].unverified} unverified, {summary.byUtility[utility].confirmed} confirmed.</p>)}</div>
    </header>
    <div className="grid min-h-0 min-w-0 flex-1 grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-4 overflow-hidden">
      <Card className="min-h-0 min-w-0"><CardHeader className="shrink-0"><CardTitle>Location evidence queue</CardTitle></CardHeader><CardContent className="flex min-h-0 min-w-0 flex-1 flex-col gap-3">
        <div role="group" aria-label="Location queue" className="flex shrink-0 gap-2 overflow-x-auto">{([ ["missing", "Missing"], ["unverified", "Unverified"], ["all", "All projects"] ] as const).map(([value, label]) => <Button key={value} variant={queue === value ? "secondary" : "outline"} size="sm" aria-pressed={queue === value} onClick={() => setQueue(value)}>{label}</Button>)}</div>
        <div className="shrink-0 space-y-2"><Label htmlFor={`${formId}-search`}>Search records</Label><Input id={`${formId}-search`} placeholder="Project, source ID, sponsor or source" value={search} onChange={(event) => setSearch(event.target.value)} /></div>
        <div className="flex shrink-0 flex-wrap items-center justify-between gap-2"><Select value={filing} onValueChange={setFiling}><SelectTrigger aria-label="Filter reporting filing"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Both filings</SelectItem><SelectItem value="desc">Dominion filing</SelectItem><SelectItem value="gpc">Georgia filing</SelectItem></SelectContent></Select><p className="text-xs text-muted-foreground" aria-live="polite">{projects.length} matching records</p></div>
        <div className="min-h-0 min-w-0 flex-1 overflow-auto overscroll-contain" tabIndex={0} role="region" aria-label="Location evidence records">
          {projects.length ? <ul className="space-y-1">{projects.map((project) => <li key={project.id}><Button variant={selected?.id === project.id ? "secondary" : "ghost"} className="h-auto w-full justify-start whitespace-normal p-3 text-left" aria-pressed={selected?.id === project.id} onClick={() => chooseProject(project)}><span className="min-w-0 space-y-1 [overflow-wrap:anywhere]"><span className="block font-medium">{project.name}</span><span className="block text-xs text-muted-foreground">{project.sourceId ?? "No source ID"}; {UTILITIES[project.utilityId]}</span><span className="block text-xs text-muted-foreground">Location: {locationLabel(project)}</span></span></Button></li>)}</ul> : <div className="space-y-3 py-4"><p className="text-sm text-muted-foreground">No records match this queue and search.</p><Button variant="outline" size="sm" onClick={() => { setQueue("all"); setSearch(""); setFiling("all") }}>Show all projects</Button></div>}
        </div>
      </CardContent></Card>
      <Card className="min-h-0 min-w-0"><CardHeader className="max-h-[25%] min-h-0 shrink-0 overflow-auto overscroll-contain"><div className="flex flex-wrap items-start justify-between gap-3"><div className="min-w-0 flex-1 [overflow-wrap:anywhere]"><CardTitle>{selected?.name ?? "Select a project"}</CardTitle>{selected && <p className="mt-1 text-xs text-muted-foreground">{UTILITIES[selected.utilityId]}; {selected.sourceId ?? selected.id}</p>}</div>{selected && <Button variant="outline" size="sm" onClick={() => onExploreProject(selected.id)}>Explore project</Button>}</div>{outsideQueue && <p className="text-xs text-muted-foreground">This selected record is outside the current queue filters.</p>}</CardHeader>
        <CardContent className="flex min-h-0 min-w-0 flex-1 flex-col gap-3">
          {selected && draft ? <>
            <Tabs value={activeTab} onValueChange={setEditorTab} className="min-h-0 min-w-0 flex-1"><TabsList className="shrink-0"><TabsTrigger value="evidence">Evidence</TabsTrigger><TabsTrigger value="preview" disabled={!preview}>Revision preview</TabsTrigger></TabsList>
              <TabsContent value="evidence" className="min-h-0 min-w-0 overflow-auto overscroll-contain pt-3">
                <div className="space-y-4 [overflow-wrap:anywhere]">
                  <details className="rounded-lg border p-3"><summary className="cursor-pointer font-medium">Current location and project sources</summary><div className="mt-3 space-y-4"><LocationEvidence location={selected.location} /><div className="space-y-2"><h3 className="text-sm font-medium">Original project sources</h3><EvidenceSources sources={selected.sources} /></div>{selected.notes.length > 0 && <ul className="list-disc space-y-1 pl-4 text-xs text-muted-foreground">{selected.notes.map((note, index) => <li key={index}>{note}</li>)}</ul>}</div></details>
                  {dataset.mode === "demo" ? <div className="space-y-3"><p className="text-sm">This is synthetic evidence for browsing. Source revision actions are available only in source mode.</p><LocationEvidence location={selected.location} /></div> : <form id={formId} onSubmit={preparePreview} noValidate className="space-y-4">
                    <p className="text-sm text-muted-foreground">Enter decimal WGS84 coordinates and the public evidence supporting them. Missing fields stay empty until you supply them.</p>
                    <div className="grid gap-3 sm:grid-cols-2"><div className="space-y-2"><Label htmlFor={`${formId}-latitude`}>Latitude</Label><Input id={`${formId}-latitude`} inputMode="decimal" value={draft.latitude} onChange={(event) => updateDraft("latitude", event.target.value)} placeholder="−90 to 90" required /></div><div className="space-y-2"><Label htmlFor={`${formId}-longitude`}>Longitude</Label><Input id={`${formId}-longitude`} inputMode="decimal" value={draft.longitude} onChange={(event) => updateDraft("longitude", event.target.value)} placeholder="−180 to 180" required /></div></div>
                    <div className="space-y-2"><Label htmlFor={`${formId}-method`}>Location method</Label><Select value={draft.method} onValueChange={(value) => updateDraft("method", value as LocationEvidenceDraft["method"])}><SelectTrigger id={`${formId}-method`} className="w-full"><SelectValue placeholder="Choose the source method" /></SelectTrigger><SelectContent>{Object.entries(LOCATION_METHODS).map(([method, label]) => <SelectItem key={method} value={method}>{label}</SelectItem>)}</SelectContent></Select><p className="text-xs text-muted-foreground">For a midpoint, enter the center already determined from the cited endpoints.</p></div>
                    <div className="space-y-2"><Label htmlFor={`${formId}-file`}>Source title or filename</Label><Input id={`${formId}-file`} value={draft.sourceFile} onChange={(event) => updateDraft("sourceFile", event.target.value)} required /></div>
                    <div className="space-y-2"><Label htmlFor={`${formId}-locator`}>Exact source locator</Label><Input id={`${formId}-locator`} value={draft.sourceLocator} onChange={(event) => updateDraft("sourceLocator", event.target.value)} placeholder="Page, sheet and cell range, or exact section" required /></div>
                    <div className="space-y-2"><Label htmlFor={`${formId}-url`}>Source URL (optional)</Label><Input id={`${formId}-url`} type="url" value={draft.sourceUrl} onChange={(event) => updateDraft("sourceUrl", event.target.value)} placeholder="https://" /></div>
                    <p className="text-xs text-muted-foreground">Locally supplied locations remain unverified. A project center supports proximity screening, not a verified route.</p>
                  </form>}
                </div>
              </TabsContent>
              <TabsContent value="preview" className="min-h-0 min-w-0 overflow-auto overscroll-contain pt-3">{preview && <RevisionPreview before={preview.before} after={preview.after} changes={preview.changes} />}</TabsContent>
            </Tabs>
            {activeError && <p role="alert" className="max-h-24 shrink-0 overflow-auto text-sm text-destructive">{activeError}</p>}
            {previewInvalidated && <p role="status" className="shrink-0 text-xs text-muted-foreground">The active dataset changed. Review the current evidence and preview again before applying.</p>}
            {activeNotice && <p role="status" className="shrink-0 text-xs text-muted-foreground">{activeNotice}</p>}
            <div className="flex shrink-0 flex-wrap gap-2 border-t pt-3">
              {activeTab === "evidence" ? <Button type="submit" form={formId} disabled={dataset.mode !== "real"}>Preview revision</Button> : <Button variant="outline" onClick={() => setEditorTab("evidence")}>Edit evidence</Button>}
              <Button disabled={!preview || dataset.mode !== "real"} onClick={applyPreview}>Apply revision</Button>
              <Button variant="outline" disabled={!preview || dataset.mode !== "real"} onClick={downloadPreview}>Download revision</Button>
            </div>
          </> : <p className="text-sm text-muted-foreground">Choose a project in the queue to inspect or prepare its location evidence.</p>}
        </CardContent>
      </Card>
    </div>
  </section>
}
