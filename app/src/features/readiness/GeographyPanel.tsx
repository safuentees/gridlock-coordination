import { useId, useLayoutEffect, useMemo, useRef, useState } from "react"
import { ChevronLeftIcon, ChevronRightIcon, DownloadIcon, SearchIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { IconButton } from "@/components/ui/icon-button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { GEOGRAPHIC_STATUSES, type GeographicRepresentation, type GeographicRun, type GeographicStatus } from "@/domain/geography"
import type { DataMode, Dataset } from "@/domain/schema"
import { geographicCoverage } from "@/enrichment"
import { matchesProjectQuery } from "@/lib/project-search"
import { reportingGroupLabel, reportingGroups } from "@/lib/reporting-groups"
import { EvidenceSources } from "./RevisionPreview"

export interface GeographyPanelProps {
  dataset: Dataset
  run: GeographicRun | null
  busy: boolean
  progress: { processed: number; total: number } | null
  error: string | null
  onProcess: () => void
  onDownload: () => void
  onExploreProject: (id: string) => void
}

type StatusFilter = GeographicStatus | "all"
interface BrowsingState {
  search: string
  status: StatusFilter
  filing: string
  page: number
  selectedId: string | null
}
const PAGE_SIZE = 25
const initialBrowsingState = (): BrowsingState => ({ search: "", status: "all", filing: "all", page: 0, selectedId: null })
const STATUS_LABELS: Record<GeographicStatus, string> = {
  located: "Source-located",
  approximate: "Approximate",
  ambiguous: "Ambiguous",
  unsupported: "Unsupported",
  "not-processed": "Not processed",
}
const METHOD_LABELS: Record<GeographicRepresentation["method"], string> = {
  "source-point": "Source point",
  "matched-facility": "Matched facility",
  "single-endpoint": "Single known endpoint",
  "endpoint-estimate": "Evidenced endpoints",
  "geographic-area": "Geographic area",
}
const PRECISION_LABELS: Record<GeographicRepresentation["precision"], string> = {
  project: "Project-level",
  facility: "Facility-level",
  locality: "Locality-level",
  unknown: "Unknown",
  endpoints: "Endpoints only",
  town: "Town extent",
  county: "County extent",
  state: "State extent",
  region: "Regional extent",
}

function RepresentationEvidence({ representation }: { representation: GeographicRepresentation }) {
  return <section className="space-y-3" aria-label="Geographic representation">
    <h3 className="font-medium">{representation.label}</h3>
    <dl className="grid grid-cols-[minmax(0,1fr)_minmax(0,2fr)] gap-x-3 gap-y-2 text-sm">
      <dt className="text-muted-foreground">Representation</dt><dd>{representation.kind === "area" ? "Bounding extent" : representation.kind === "endpoints" ? "Endpoints" : "Point"}</dd>
      <dt className="text-muted-foreground">Method</dt><dd>{METHOD_LABELS[representation.method]}</dd>
      <dt className="text-muted-foreground">Precision</dt><dd>{PRECISION_LABELS[representation.precision]}</dd>
      <dt className="text-muted-foreground">Numeric accuracy</dt><dd>{representation.accuracyMeters === null ? "Not stated by the source" : `${representation.accuracyMeters} m (source-stated)`}</dd>
      {representation.kind === "point" && <><dt className="text-muted-foreground">Latitude</dt><dd>{representation.position[1]}</dd><dt className="text-muted-foreground">Longitude</dt><dd>{representation.position[0]}</dd></>}
      {representation.kind === "area" && <><dt className="text-muted-foreground">West / east</dt><dd>{representation.bounds[0]} / {representation.bounds[2]}° longitude</dd><dt className="text-muted-foreground">South / north</dt><dd>{representation.bounds[1]} / {representation.bounds[3]}° latitude</dd></>}
    </dl>
    {representation.kind === "endpoints" && <ol className="list-decimal space-y-1 pl-5 text-sm">{representation.positions.map(([longitude, latitude], index) => <li key={index}>{latitude}° latitude, {longitude}° longitude</li>)}</ol>}
    {representation.kind === "area" && <p className="text-sm text-muted-foreground">These bounds describe an area, not a surveyed boundary or project center.</p>}
    {representation.kind === "endpoints" && <p className="text-sm text-muted-foreground">The endpoints do not establish a route.</p>}
    <div className="space-y-2"><h4 className="text-sm font-medium">Limitations</h4><ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">{representation.limitations.map((limitation, index) => <li key={index}>{limitation}</li>)}</ul></div>
    <details className="rounded-lg border p-3"><summary className="cursor-pointer font-medium">Geographic evidence and sources</summary><div className="mt-3"><EvidenceSources sources={representation.evidence} /></div></details>
  </section>
}

export function GeographyPanel({ dataset, run, busy, progress, error, onProcess, onDownload, onExploreProject }: GeographyPanelProps) {
  const id = useId()
  const [browsingByMode, setBrowsingByMode] = useState<Record<DataMode, BrowsingState>>({ real: initialBrowsingState(), demo: initialBrowsingState() })
  const browsing = browsingByMode[dataset.mode]
  const queueBody = useRef<HTMLDivElement>(null)
  const detailBody = useRef<HTMLDivElement>(null)
  const scrollByMode = useRef<Record<DataMode, number>>({ real: 0, demo: 0 })
  // The controller withholds stale runs; mode guards also prevent cross-mode presentation.
  const activeRun = run?.mode === dataset.mode ? run : null
  const outcomes = useMemo(() => new Map(activeRun?.records.map(record => [record.projectId, record]) ?? []), [activeRun])
  const coverage = useMemo(() => geographicCoverage(activeRun, dataset.projects), [activeRun, dataset.projects])
  const groups = useMemo(() => reportingGroups(dataset.projects), [dataset.projects])
  const projects = useMemo(() => {
    const query = browsing.search.trim().toLocaleLowerCase()
    return dataset.projects.filter(project => {
      const outcome = outcomes.get(project.id)
      const status = outcome?.status ?? "not-processed"
      if (browsing.status !== "all" && status !== browsing.status) return false
      if (browsing.filing !== "all" && project.utilityId !== browsing.filing) return false
      if (matchesProjectQuery(project, query)) return true
      return [STATUS_LABELS[status], outcome?.reason, outcome?.representation?.label, ...(outcome?.clues.map(clue => clue.text) ?? [])].join(" ").toLocaleLowerCase().includes(query)
    })
  }, [dataset.projects, outcomes, browsing.search, browsing.status, browsing.filing])
  const pageCount = Math.max(1, Math.ceil(projects.length / PAGE_SIZE))
  const page = Math.min(browsing.page, pageCount - 1)
  const pageProjects = projects.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)
  const selected = dataset.projects.find(project => project.id === browsing.selectedId) ?? projects[0] ?? dataset.projects[0] ?? null
  const selectedOutcome = selected ? outcomes.get(selected.id) : undefined
  const selectedStatus = selectedOutcome?.status ?? "not-processed"
  const outsideFilter = selected && !projects.some(project => project.id === selected.id)
  const outsidePage = selected && !pageProjects.some(project => project.id === selected.id)

  useLayoutEffect(() => {
    if (queueBody.current) queueBody.current.scrollTop = scrollByMode.current[dataset.mode]
  }, [dataset.mode])
  useLayoutEffect(() => {
    if (detailBody.current) detailBody.current.scrollTop = 0
  }, [dataset.mode, selected?.id])

  function changeBrowsing(update: Partial<BrowsingState>, resetPage = false) {
    setBrowsingByMode(previous => ({
      ...previous,
      [dataset.mode]: { ...previous[dataset.mode], selectedId: selected?.id ?? null, ...update, ...(resetPage ? { page: 0 } : {}) },
    }))
    if (resetPage || update.page !== undefined) {
      scrollByMode.current[dataset.mode] = 0
      if (queueBody.current) queueBody.current.scrollTop = 0
    }
  }

  return <section className="flex h-full min-h-0 min-w-0 flex-col gap-4 overflow-hidden" aria-label="Geographic coverage workspace">
    <header className="shrink-0 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3"><h2 className="text-lg font-semibold">Geographic coverage</h2>{dataset.mode === "demo" && <Badge variant="secondary">Synthetic demo</Badge>}</div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={onProcess} disabled={busy || dataset.projects.length === 0}>{busy ? "Processing…" : error ? "Retry processing" : activeRun ? "Process again" : "Process collection"}</Button>
          <Button variant="outline" onClick={onDownload} disabled={busy || !activeRun}><DownloadIcon aria-hidden="true" data-icon="inline-start" />Download geography</Button>
        </div>
      </div>
      <p className="text-sm text-muted-foreground">Coverage across {dataset.projects.length.toLocaleString()} records using available references. Source-located means supplied coordinates, without independent verification. Approximate includes facility estimates, endpoints and areas.</p>
      <dl className="grid grid-cols-5 gap-3" aria-label="Geographic coverage totals">{GEOGRAPHIC_STATUSES.map(status => <div key={status} className="min-w-0"><dt className="text-sm text-muted-foreground">{STATUS_LABELS[status]}</dt><dd className="font-medium tabular-nums">{coverage[status].toLocaleString()}</dd></div>)}</dl>
      {busy && <p role="status" className="text-sm text-muted-foreground">{progress ? `Processing ${progress.processed.toLocaleString()} of ${progress.total.toLocaleString()} records…` : "Preparing geographic evidence…"}</p>}
      {error && <p role="alert" className="max-h-20 overflow-auto text-sm text-destructive">{error} Use Retry processing to try again.</p>}
    </header>
    <div className="grid min-h-0 min-w-0 flex-1 grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-4 overflow-hidden">
      <Card className="min-h-0 min-w-0">
        <CardHeader className="shrink-0"><CardTitle>All records</CardTitle></CardHeader>
        <CardContent className="flex min-h-0 min-w-0 flex-1 flex-col gap-3">
          <div className="shrink-0 space-y-2"><Label htmlFor={`${id}-search`}><SearchIcon aria-hidden="true" className="size-4" />Search records</Label><Input id={`${id}-search`} placeholder="Name, source ID, place or reason" value={browsing.search} onChange={event => changeBrowsing({ search: event.target.value }, true)} /></div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <Select value={browsing.status} onValueChange={status => changeBrowsing({ status: status as StatusFilter }, true)}><SelectTrigger aria-label="Filter geographic status"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All statuses</SelectItem>{GEOGRAPHIC_STATUSES.map(status => <SelectItem key={status} value={status}>{STATUS_LABELS[status]}</SelectItem>)}</SelectContent></Select>
            <Select value={browsing.filing} onValueChange={filing => changeBrowsing({ filing }, true)}><SelectTrigger aria-label="Filter reporting filing" className="min-w-0 max-w-full"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All filings</SelectItem>{groups.map(group => <SelectItem key={group.id} value={group.id}>{group.label}</SelectItem>)}{browsing.filing !== "all" && !groups.some(group => group.id === browsing.filing) && <SelectItem value={browsing.filing}>{browsing.filing} (not in this revision)</SelectItem>}</SelectContent></Select>
          </div>
          <div ref={queueBody} onScroll={event => { scrollByMode.current[dataset.mode] = event.currentTarget.scrollTop }} className="min-h-0 min-w-0 flex-1 overflow-auto overscroll-contain" tabIndex={0} role="region" aria-label="Geographic records">
            {pageProjects.length ? <ul className="space-y-1">{pageProjects.map(project => {
              const outcome = outcomes.get(project.id)
              const status = outcome?.status ?? "not-processed"
              return <li key={project.id}><Button variant={selected?.id === project.id ? "secondary" : "ghost"} className="h-auto w-full justify-start whitespace-normal p-3 text-left" aria-pressed={selected?.id === project.id} onClick={() => changeBrowsing({ selectedId: project.id })}><span className="min-w-0 space-y-1 [overflow-wrap:anywhere]"><span className="block">{project.name}</span><span className="block text-xs text-muted-foreground">{reportingGroupLabel(project)}; {project.sourceId ?? project.id}</span><span className="block text-sm text-muted-foreground">{STATUS_LABELS[status]}{outcome?.representation ? `: ${outcome.representation.label}` : ""}</span></span></Button></li>
            })}</ul> : <p className="p-3 text-sm text-muted-foreground">No records match these filters.</p>}
          </div>
          <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-t pt-3" aria-label="Geographic queue pagination">
            <p className="text-xs text-muted-foreground" aria-live="polite">{projects.length ? `${page * PAGE_SIZE + 1}–${Math.min((page + 1) * PAGE_SIZE, projects.length)} of ${projects.length.toLocaleString()} matching records` : "0 matching records"}</p>
            <div className="flex gap-2"><IconButton variant="outline" label="Previous geography page" disabled={page === 0} onClick={() => changeBrowsing({ page: page - 1 })}><ChevronLeftIcon aria-hidden="true" /></IconButton><IconButton variant="outline" label="Next geography page" disabled={page + 1 >= pageCount} onClick={() => changeBrowsing({ page: page + 1 })}><ChevronRightIcon aria-hidden="true" /></IconButton></div>
          </div>
        </CardContent>
      </Card>
      <Card className="min-h-0 min-w-0">
        <CardHeader className="max-h-[30%] min-h-0 shrink-0 overflow-auto overscroll-contain">
          <div className="flex flex-wrap items-start justify-between gap-3"><div className="min-w-0 flex-1 space-y-1 [overflow-wrap:anywhere]"><CardTitle>{selected?.name ?? "Select a record"}</CardTitle>{selected && <p className="text-xs text-muted-foreground">{reportingGroupLabel(selected)}; {selected.sourceId ?? selected.id}</p>}</div>{selected && <Button size="sm" variant="outline" onClick={() => onExploreProject(selected.id)}>Open project</Button>}</div>
          {outsideFilter ? <p className="text-xs text-muted-foreground">Selected record is outside these filters.</p> : outsidePage && <p className="text-xs text-muted-foreground">Selected record is on another queue page.</p>}
        </CardHeader>
        <CardContent ref={detailBody} className="min-h-0 min-w-0 flex-1 space-y-4 overflow-auto overscroll-contain [overflow-wrap:anywhere]" tabIndex={0} role="region" aria-label="Selected geographic evidence">
          {selected ? <>
            <div className="space-y-2"><Badge variant="secondary">{STATUS_LABELS[selectedStatus]}</Badge><p className="text-sm">{selectedOutcome?.reason ?? "This record has not been processed against the available geographic references."}</p></div>
            {selectedOutcome?.representation && <RepresentationEvidence representation={selectedOutcome.representation} />}
            {selectedOutcome?.review && <section className="space-y-2"><h3 className="font-medium">Retained review</h3><p className="text-sm">{selectedOutcome.review.decision.charAt(0).toUpperCase() + selectedOutcome.review.decision.slice(1)}: {selectedOutcome.review.reason}</p></section>}
            {!!selectedOutcome?.clues.length && <details className="rounded-lg border p-3"><summary className="cursor-pointer font-medium">Source clues</summary><ul className="mt-3 space-y-3">{selectedOutcome.clues.map((clue, index) => <li key={index} className="space-y-2"><p className="text-sm">{clue.text} <span className="text-muted-foreground">({clue.kind})</span></p><EvidenceSources sources={clue.evidence} /></li>)}</ul></details>}
            <p className="text-sm text-muted-foreground">This geographic evidence does not change project centers or strict candidate matching.</p>
            <details className="rounded-lg border p-3"><summary className="cursor-pointer font-medium">Original project sources</summary><div className="mt-3"><EvidenceSources sources={selected.sources} /></div></details>
          </> : <p className="text-sm text-muted-foreground">There are no records in this collection.</p>}
        </CardContent>
      </Card>
    </div>
  </section>
}
