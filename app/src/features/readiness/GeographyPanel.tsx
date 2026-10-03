import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState, type FormEvent } from "react"
import { ChevronLeftIcon, ChevronRightIcon, DownloadIcon, SearchIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { IconButton } from "@/components/ui/icon-button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { GEOGRAPHIC_STATUSES, geographicRepresentationSchema, type GeographicRecord, type GeographicRepresentation, type GeographicRun, type GeographicStatus } from "@/domain/geography"
import type { DataMode, Dataset } from "@/domain/schema"
import type { GeographicRestoreAction, GeographicRestorePreview } from "@/domain/geographic-restore"
import { GEOGRAPHY_IMPORT_MAX_BYTES } from "@/data/geography-session"
import { geographicCoverage } from "@/enrichment"
import { getGeographicCoverageReport } from "@/enrichment/coverage"
import type { GeographicReviewInput } from "@/enrichment/review"
import { matchesProjectQuery } from "@/lib/project-search"
import { reportingGroupLabel, reportingGroups } from "@/lib/reporting-groups"
import { EvidenceSources } from "./RevisionPreview"
import { GeographyCoverage } from "./GeographyCoverage"

export interface GeographyPanelProps {
  dataset: Dataset
  run: GeographicRun | null
  busy: boolean
  progress: { processed: number; total: number } | null
  error: string | null
  onProcess: () => void
  onDownload: () => void
  onExploreProject: (id: string) => void
  onReview: (projectId: string, input: GeographicReviewInput) => Promise<void>
  projectToReveal?: { id: string; request: number; mode: DataMode } | null
  onPreviewRestore?: (text: string, protectedProjectIds: readonly string[]) => GeographicRestorePreview
  onRestore?: (preview: GeographicRestorePreview, protectedProjectIds: readonly string[]) => Promise<void>
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

type PointRepresentation = Extract<GeographicRepresentation, { kind: "point" }>
type AreaRepresentation = Extract<GeographicRepresentation, { kind: "area" }>
interface ReviewDraft {
  inputFingerprint: string
  decision: GeographicReviewInput["decision"]
  reason: string
  kind: GeographicRepresentation["kind"]
  label: string
  method: PointRepresentation["method"]
  pointPrecision: PointRepresentation["precision"]
  areaPrecision: AreaRepresentation["precision"]
  longitude: string
  latitude: string
  endpoints: string
  west: string
  south: string
  east: string
  north: string
  accuracy: string
  limitations: string
  evidence: { file: string; locator: string; url: string }[]
}
interface ReviewState {
  tab: "evidence" | "review"
  draft?: ReviewDraft
  baseline?: string
  error?: string
  notice?: string
}
interface RestoreCandidate {
  preview: GeographicRestorePreview
  run: GeographicRun
  dataset: Dataset
  file: File
  protectedKey: string
}
interface RestoreState {
  file?: File
  text?: string
  candidate?: RestoreCandidate
  error?: string
  notice?: string
  applied?: boolean
  page?: number
  filter?: GeographicRestoreAction | "all"
}
const RESTORE_LABELS: Record<GeographicRestoreAction, string> = {
  "restore-review": "Restore active review",
  "retain-review": "Retain outside collection",
  duplicate: "Already present",
  conflict: "Conflict — kept unchanged",
  stale: "Source changed — not applied",
  unreviewed: "Automatic result — not restored",
}
const RESTORE_ACTIONS = Object.keys(RESTORE_LABELS) as GeographicRestoreAction[]
function reviewIsDirty(state: ReviewState): boolean {
  return !!state.draft && state.baseline !== undefined && JSON.stringify(state.draft) !== state.baseline
}

function initialReview(record: GeographicRecord): ReviewDraft {
  const representation = record.representation ?? record.review?.representation
  return {
    inputFingerprint: record.inputFingerprint, decision: record.representation ? "accepted" : "corrected", reason: "",
    kind: representation?.kind ?? "point", label: representation?.label ?? "",
    method: representation?.kind === "point" ? representation.method : "source-point",
    pointPrecision: representation?.kind === "point" ? representation.precision : "unknown",
    areaPrecision: representation?.kind === "area" ? representation.precision : "town",
    longitude: representation?.kind === "point" ? String(representation.position[0]) : "",
    latitude: representation?.kind === "point" ? String(representation.position[1]) : "",
    endpoints: representation?.kind === "endpoints" ? representation.positions.map(position => position.join(", ")).join("\n") : "",
    west: representation?.kind === "area" ? String(representation.bounds[0]) : "",
    south: representation?.kind === "area" ? String(representation.bounds[1]) : "",
    east: representation?.kind === "area" ? String(representation.bounds[2]) : "",
    north: representation?.kind === "area" ? String(representation.bounds[3]) : "",
    accuracy: representation?.accuracyMeters == null ? "" : String(representation.accuracyMeters),
    limitations: representation?.limitations.join("\n") ?? "",
    evidence: representation?.evidence.map(source => ({ ...source, url: source.url ?? "" })) ?? [{ file: "", locator: "", url: "" }],
  }
}
function correctedRepresentation(draft: ReviewDraft): GeographicRepresentation {
  const number = (value: string, label: string) => {
    if (!value.trim() || !Number.isFinite(Number(value))) throw new Error(`Enter a numeric ${label}.`)
    return Number(value)
  }
  const limitations = draft.limitations.split("\n").map(value => value.trim()).filter(Boolean)
  if (!draft.label.trim() || !limitations.length) throw new Error("Add a geography label and meaningful limitations.")
  if (!draft.evidence.length || draft.evidence.some(source => !source.file.trim() || !source.locator.trim())) throw new Error("Every citation needs a source title and exact locator.")
  const common = {
    label: draft.label.trim(), limitations,
    accuracyMeters: draft.accuracy.trim() ? number(draft.accuracy, "source-stated accuracy") : null,
    evidence: draft.evidence.map(source => ({ file: source.file.trim(), locator: source.locator.trim(), url: source.url.trim() || null })),
  }
  const geometry = draft.kind === "point" ? {
    kind: "point", method: draft.method, precision: draft.pointPrecision,
    position: [number(draft.longitude, "longitude"), number(draft.latitude, "latitude")],
  } : draft.kind === "area" ? {
    kind: "area", method: "geographic-area", precision: draft.areaPrecision, boundaryMeaning: "bounding-extent",
    bounds: [number(draft.west, "western longitude"), number(draft.south, "southern latitude"), number(draft.east, "eastern longitude"), number(draft.north, "northern latitude")],
  } : {
    kind: "endpoints", method: "endpoint-estimate", precision: "endpoints",
    positions: draft.endpoints.split("\n").filter(line => line.trim()).map(line => {
      const values = line.split(",")
      if (values.length !== 2) throw new Error("Enter each endpoint as longitude, latitude on its own line.")
      return [number(values[0], "endpoint longitude"), number(values[1], "endpoint latitude")]
    }),
  }
  const result = geographicRepresentationSchema.safeParse({ ...common, ...geometry })
  if (!result.success) throw new Error(`Check the corrected geography: ${result.error.issues[0].message}`)
  return result.data
}
function CorrectionFields({ id, draft, onChange }: { id: string; draft: ReviewDraft; onChange: (update: Partial<ReviewDraft>) => void }) {
  return <div className="space-y-4">
    <div className="space-y-2"><Label htmlFor={`${id}-kind`}>Representation</Label><Select value={draft.kind} onValueChange={kind => onChange({ kind: kind as ReviewDraft["kind"] })}><SelectTrigger id={`${id}-kind`}><SelectValue /></SelectTrigger><SelectContent><SelectItem value="point">Point</SelectItem><SelectItem value="endpoints">Endpoints</SelectItem><SelectItem value="area">Bounding area</SelectItem></SelectContent></Select></div>
    <div className="space-y-2"><Label htmlFor={`${id}-label`}>Geography label</Label><Input id={`${id}-label`} value={draft.label} onChange={event => onChange({ label: event.target.value })} /></div>
    {draft.kind === "point" && <>
      <div className="space-y-2"><Label htmlFor={`${id}-method`}>Method</Label><Select value={draft.method} onValueChange={method => onChange({ method: method as ReviewDraft["method"] })}><SelectTrigger id={`${id}-method`}><SelectValue /></SelectTrigger><SelectContent>{(["source-point", "matched-facility", "single-endpoint"] as const).map(method => <SelectItem key={method} value={method}>{METHOD_LABELS[method]}</SelectItem>)}</SelectContent></Select></div>
      <div className="space-y-2"><Label htmlFor={`${id}-point-precision`}>Precision</Label><Select value={draft.pointPrecision} onValueChange={pointPrecision => onChange({ pointPrecision: pointPrecision as ReviewDraft["pointPrecision"] })}><SelectTrigger id={`${id}-point-precision`}><SelectValue /></SelectTrigger><SelectContent>{(["project", "facility", "locality", "unknown"] as const).map(precision => <SelectItem key={precision} value={precision}>{PRECISION_LABELS[precision]}</SelectItem>)}</SelectContent></Select></div>
      <div className="grid grid-cols-2 gap-3">{(["longitude", "latitude"] as const).map(field => <div key={field} className="space-y-2"><Label htmlFor={`${id}-${field}`}>{field === "longitude" ? "Longitude" : "Latitude"}</Label><Input id={`${id}-${field}`} inputMode="decimal" value={draft[field]} onChange={event => onChange({ [field]: event.target.value })} /></div>)}</div>
    </>}
    {draft.kind === "endpoints" && <div className="space-y-2"><Label htmlFor={`${id}-endpoints`}>Endpoint coordinates</Label><Textarea id={`${id}-endpoints`} value={draft.endpoints} onChange={event => onChange({ endpoints: event.target.value })} aria-describedby={`${id}-endpoints-help`} /><p id={`${id}-endpoints-help`} className="text-xs text-muted-foreground">At least two cited endpoints; longitude, latitude per line. These do not establish a route.</p></div>}
    {draft.kind === "area" && <>
      <div className="space-y-2"><Label htmlFor={`${id}-area-precision`}>Area precision</Label><Select value={draft.areaPrecision} onValueChange={areaPrecision => onChange({ areaPrecision: areaPrecision as ReviewDraft["areaPrecision"] })}><SelectTrigger id={`${id}-area-precision`}><SelectValue /></SelectTrigger><SelectContent>{(["town", "county", "state", "region"] as const).map(precision => <SelectItem key={precision} value={precision}>{PRECISION_LABELS[precision]}</SelectItem>)}</SelectContent></Select></div>
      <div className="grid grid-cols-2 gap-3">{([["west", "West longitude"], ["south", "South latitude"], ["east", "East longitude"], ["north", "North latitude"]] as const).map(([field, label]) => <div key={field} className="space-y-2"><Label htmlFor={`${id}-${field}`}>{label}</Label><Input id={`${id}-${field}`} inputMode="decimal" value={draft[field]} onChange={event => onChange({ [field]: event.target.value })} /></div>)}</div>
      <p className="text-xs text-muted-foreground">Bounds describe an extent, not a surveyed boundary or a project center.</p>
    </>}
    <p className="text-xs text-muted-foreground">Use decimal WGS84 coordinates from the cited evidence.</p>
    <div className="space-y-2"><Label htmlFor={`${id}-accuracy`}>Source-stated accuracy in meters (optional)</Label><Input id={`${id}-accuracy`} inputMode="decimal" value={draft.accuracy} onChange={event => onChange({ accuracy: event.target.value })} aria-describedby={`${id}-accuracy-help`} /><p id={`${id}-accuracy-help`} className="text-xs text-muted-foreground">Leave blank if the source does not state numeric accuracy.</p></div>
    <div className="space-y-2"><Label htmlFor={`${id}-limitations`}>Limitations</Label><Textarea id={`${id}-limitations`} value={draft.limitations} onChange={event => onChange({ limitations: event.target.value })} placeholder="One meaningful limitation per line" /></div>
    <fieldset className="space-y-3"><legend className="mb-2 text-sm font-medium">Correction sources</legend>{draft.evidence.map((source, index) => <div key={index} className="space-y-3 rounded-lg border p-3">
      <div className="space-y-2"><Label htmlFor={`${id}-source-${index}`}>Source title or filename</Label><Input id={`${id}-source-${index}`} value={source.file} onChange={event => onChange({ evidence: draft.evidence.map((item, itemIndex) => itemIndex === index ? { ...item, file: event.target.value } : item) })} /></div>
      <div className="space-y-2"><Label htmlFor={`${id}-locator-${index}`}>Exact locator</Label><Input id={`${id}-locator-${index}`} value={source.locator} onChange={event => onChange({ evidence: draft.evidence.map((item, itemIndex) => itemIndex === index ? { ...item, locator: event.target.value } : item) })} /></div>
      <div className="space-y-2"><Label htmlFor={`${id}-url-${index}`}>Source URL (optional)</Label><Input id={`${id}-url-${index}`} type="url" value={source.url} onChange={event => onChange({ evidence: draft.evidence.map((item, itemIndex) => itemIndex === index ? { ...item, url: event.target.value } : item) })} /></div>
      {draft.evidence.length > 1 && <Button type="button" size="sm" variant="outline" onClick={() => onChange({ evidence: draft.evidence.filter((_, itemIndex) => itemIndex !== index) })}>Remove citation {index + 1}</Button>}
    </div>)}<Button type="button" variant="outline" size="sm" onClick={() => onChange({ evidence: [...draft.evidence, { file: "", locator: "", url: "" }] })}>Add citation</Button></fieldset>
  </div>
}

export function GeographyPanel({ dataset, run, busy, progress, error, onProcess, onDownload, onExploreProject, onReview, projectToReveal, onPreviewRestore, onRestore }: GeographyPanelProps) {
  const id = useId()
  const [browsingByMode, setBrowsingByMode] = useState<Record<DataMode, BrowsingState>>({ real: initialBrowsingState(), demo: initialBrowsingState() })
  const browsing = browsingByMode[dataset.mode]
  useEffect(() => {
    if (projectToReveal?.mode === dataset.mode && dataset.projects.some(project => project.id === projectToReveal.id)) {
      setBrowsingByMode(previous => ({ ...previous, [dataset.mode]: { ...previous[dataset.mode], selectedId: projectToReveal.id } }))
    }
  }, [projectToReveal, dataset])
  const [reviews, setReviews] = useState<Record<string, ReviewState>>({})
  const [savingKey, setSavingKey] = useState<string | null>(null)
  const saving = useRef(false)
  const [restoreOpen, setRestoreOpen] = useState(false)
  const [restores, setRestores] = useState<Partial<Record<DataMode, RestoreState>>>({})
  const [restoreOperation, setRestoreOperation] = useState<"preview" | "apply" | null>(null)
  const restoreLock = useRef(false)
  const restoreList = useRef<HTMLDivElement>(null)
  const reviewBody = useRef<HTMLDivElement>(null)
  const detailScroll = useRef<Record<string, { evidence: number; review: number }>>({})
  const queueBody = useRef<HTMLDivElement>(null)
  const detailBody = useRef<HTMLDivElement>(null)
  const scrollByMode = useRef<Record<DataMode, number>>({ real: 0, demo: 0 })
  // The controller withholds stale runs; mode guards also prevent cross-mode presentation.
  const activeRun = run?.mode === dataset.mode ? run : null
  const outcomes = useMemo(() => new Map(activeRun?.records.map(record => [record.projectId, record]) ?? []), [activeRun])
  const coverage = useMemo(() => geographicCoverage(activeRun, dataset.projects), [activeRun, dataset.projects])
  const coverageReport = useMemo(() => getGeographicCoverageReport(activeRun, dataset.projects), [activeRun, dataset.projects])
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
  const reviewKey = JSON.stringify([dataset.mode, selected?.id])
  const reviewState = reviews[reviewKey]
  const detailTab = reviewState?.tab ?? "evidence"
  const reviewDraft = reviewState?.draft ?? (selectedOutcome ? initialReview(selectedOutcome) : null)
  const staleDraft = !!reviewDraft && !!selectedOutcome && reviewDraft.inputFingerprint !== selectedOutcome.inputFingerprint
  const canReview = !!selectedOutcome && selectedOutcome.status !== "not-processed"
  const saveDisabled = busy || savingKey !== null || restoreOperation !== null || !canReview || staleDraft || !reviewDraft?.reason.trim()
    || (reviewDraft?.decision !== "corrected" && !selectedOutcome?.representation)

  const protectedProjectIds = useMemo(() => [...new Set(Object.entries(reviews).flatMap(([key, state]) => {
    const [mode, projectId] = JSON.parse(key) as [DataMode, string]
    return mode === dataset.mode && reviewIsDirty(state) ? [projectId] : []
  }))].sort(), [reviews, dataset.mode])
  const protectedKey = JSON.stringify(protectedProjectIds)
  const restoreContext = useRef({ dataset, run: activeRun, protectedKey, busy })
  restoreContext.current = { dataset, run: activeRun, protectedKey, busy }
  const restoreState = restores[dataset.mode] ?? {}
  const restoreCandidate = restoreState.candidate
  const restoreInvalid = !!restoreCandidate && (restoreCandidate.run !== activeRun || restoreCandidate.dataset !== dataset || restoreCandidate.file !== restoreState.file || restoreCandidate.protectedKey !== protectedKey || busy)
  const restoreEntries = restoreCandidate?.preview.entries ?? []
  const incomingReviews = useMemo(() => new Map([
    ...(restoreCandidate?.preview.incoming.records ?? []),
    ...(restoreCandidate?.preview.incoming.retainedReviews ?? []),
  ].map(record => [record.projectId, record.review])), [restoreCandidate])
  const restoreCounts = useMemo(() => {
    const counts: Record<GeographicRestoreAction, number> = { "restore-review": 0, "retain-review": 0, duplicate: 0, conflict: 0, stale: 0, unreviewed: 0 }
    for (const entry of restoreEntries) counts[entry.action]++
    return counts
  }, [restoreEntries])
  const compatibleCount = restoreCounts["restore-review"] + restoreCounts["retain-review"]
  const restoreFilter = restoreState.filter ?? "all"
  const filteredRestoreEntries = restoreEntries.filter(entry => restoreFilter === "all" || entry.action === restoreFilter)
  const restorePageCount = Math.max(1, Math.ceil(filteredRestoreEntries.length / PAGE_SIZE))
  const restorePage = Math.min(restoreState.page ?? 0, restorePageCount - 1)
  const pageRestoreEntries = filteredRestoreEntries.slice(restorePage * PAGE_SIZE, (restorePage + 1) * PAGE_SIZE)
  const restoreNames = useMemo(() => new Map(dataset.projects.map(project => [project.id, project.name])), [dataset.projects])
  const importLimitMiB = (GEOGRAPHY_IMPORT_MAX_BYTES / (1024 * 1024)).toLocaleString()
  useLayoutEffect(() => {
    if (restoreList.current) restoreList.current.scrollTop = 0
  }, [restorePage, restoreFilter, restoreCandidate])

  useLayoutEffect(() => {
    const body = queueBody.current
    if (!body) return
    const restore = () => { if (body.clientHeight) body.scrollTop = scrollByMode.current[dataset.mode] }
    restore()
    const observer = new ResizeObserver(restore)
    observer.observe(body)
    return () => observer.disconnect()
  }, [dataset.mode])
  useLayoutEffect(() => {
    const saved = detailScroll.current[reviewKey] ?? { evidence: 0, review: 0 }
    if (detailBody.current) detailBody.current.scrollTop = saved.evidence
    if (reviewBody.current) reviewBody.current.scrollTop = saved.review
  }, [reviewKey, detailTab])
  function keepDetailScroll(tab: "evidence" | "review", element: HTMLDivElement) {
    if (!element.clientHeight) return
    detailScroll.current[reviewKey] = { ...(detailScroll.current[reviewKey] ?? { evidence: 0, review: 0 }), [tab]: element.scrollTop }
  }
  function updateReview(update: Partial<ReviewDraft>) {
    if (!selected || !reviewDraft || restoreLock.current) return
    changeBrowsing({ selectedId: selected.id })
    setReviews(previous => ({ ...previous, [reviewKey]: { tab: "review", draft: { ...reviewDraft, ...update }, baseline: previous[reviewKey]?.baseline ?? JSON.stringify(reviewDraft) } }))
  }
  function changeDetailTab(tab: string) {
    if (!selected) return
    changeBrowsing({ selectedId: selected.id })
    setReviews(previous => ({ ...previous, [reviewKey]: { ...previous[reviewKey], tab: tab as ReviewState["tab"], draft: previous[reviewKey]?.draft ?? reviewDraft ?? undefined, baseline: previous[reviewKey]?.baseline ?? (reviewDraft ? JSON.stringify(reviewDraft) : undefined) } }))
  }
  async function saveReview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!selected || !selectedOutcome || !reviewDraft || saveDisabled || saving.current) return
    const key = reviewKey
    const draft = reviewDraft
    saving.current = true
    setSavingKey(key)
    setReviews(previous => ({ ...previous, [key]: { ...previous[key], tab: "review", draft, baseline: previous[key]?.baseline ?? JSON.stringify(draft), error: undefined, notice: undefined } }))
    try {
      const input: GeographicReviewInput = { inputFingerprint: draft.inputFingerprint, decision: draft.decision, reason: draft.reason.trim() }
      if (draft.decision === "corrected") input.representation = correctedRepresentation(draft)
      await onReview(selected.id, input)
      setReviews(previous => ({ ...previous, [key]: { ...previous[key], baseline: JSON.stringify(draft), notice: "Review saved.", error: undefined } }))
    } catch (failure) {
      setReviews(previous => ({ ...previous, [key]: { ...previous[key], error: failure instanceof Error ? failure.message : "The review could not be saved. Your draft is retained.", notice: undefined } }))
    } finally {
      saving.current = false
      setSavingKey(null)
    }
  }

  function updateRestore(mode: DataMode, update: Partial<RestoreState>) {
    setRestores(previous => ({ ...previous, [mode]: { ...previous[mode], ...update } }))
  }
  async function previewRestore() {
    if (!restoreState.file || !activeRun || !onPreviewRestore || busy || savingKey !== null || restoreLock.current) return
    const mode = dataset.mode
    const file = restoreState.file
    const context = restoreContext.current
    restoreLock.current = true
    setRestoreOperation("preview")
    updateRestore(mode, { error: undefined, notice: undefined, applied: false })
    try {
      if (file.size > GEOGRAPHY_IMPORT_MAX_BYTES) throw new Error(`Choose a companion file no larger than ${importLimitMiB} MiB.`)
      const text = restoreState.text ?? await file.text()
      updateRestore(mode, { text })
      const current = restoreContext.current
      if (current.dataset !== context.dataset || current.run !== context.run || current.protectedKey !== context.protectedKey || current.busy) throw new Error("The active collection or unsaved drafts changed while reading the file. Preview again.")
      const preview = onPreviewRestore(text, protectedProjectIds)
      updateRestore(mode, { candidate: { preview, run: activeRun, dataset, file, protectedKey }, page: 0, filter: "all" })
    } catch (failure) {
      updateRestore(mode, { error: failure instanceof Error ? failure.message : "The companion file could not be previewed. The current geography is unchanged." })
    } finally {
      restoreLock.current = false
      setRestoreOperation(null)
    }
  }
  async function applyRestore() {
    if (!restoreCandidate || !onRestore || restoreInvalid || restoreState.applied || !compatibleCount || busy || savingKey !== null || restoreLock.current) return
    const mode = dataset.mode
    const candidate = restoreCandidate
    restoreLock.current = true
    setRestoreOperation("apply")
    updateRestore(mode, { error: undefined, notice: undefined })
    try {
      await onRestore(candidate.preview, protectedProjectIds)
      updateRestore(mode, { applied: true, notice: `${compatibleCount.toLocaleString()} compatible reviewed decisions restored. Unsaved drafts are unchanged.` })
      // Clean, merely opened forms can refresh from restored evidence; edited drafts stay intact.
      setReviews(previous => Object.fromEntries(Object.entries(previous).map(([key, state]) => {
        const [draftMode] = JSON.parse(key) as [DataMode, string]
        return [key, draftMode === mode && !reviewIsDirty(state) ? { ...state, draft: undefined, baseline: undefined } : state]
      })))
    } catch (failure) {
      updateRestore(mode, { error: failure instanceof Error ? failure.message : "Reviews could not be restored. The file, preview and unsaved drafts are retained." })
    } finally {
      restoreLock.current = false
      setRestoreOperation(null)
    }
  }

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
        <div className="flex flex-wrap items-center gap-3"><h2 className="text-lg font-semibold">Geographic coverage</h2>{dataset.mode === "demo" && <Badge variant="secondary">Synthetic demo</Badge>}<GeographyCoverage report={coverageReport} projects={dataset.projects} /></div>
        <div className="flex flex-wrap gap-2">
          {onPreviewRestore && onRestore && <Dialog open={restoreOpen} onOpenChange={setRestoreOpen}>
            <DialogTrigger asChild><Button variant="outline" disabled={busy || savingKey !== null || !activeRun}>Restore reviews</Button></DialogTrigger>
            <DialogContent className="flex h-[min(85dvh,48rem)] min-h-0 min-w-0 flex-col overflow-hidden sm:max-w-3xl">
              <DialogHeader className="shrink-0 pr-8"><DialogTitle>Restore reviews</DialogTitle><DialogDescription>Preview a geographic companion file, then apply compatible analyst decisions. Source records and automatic results are unchanged.</DialogDescription></DialogHeader>
              <div className="shrink-0 space-y-2">
                <Label htmlFor={`${id}-restore-file`}>Geographic companion JSON</Label>
                <div className="flex min-w-0 flex-wrap items-center gap-2"><Input key={dataset.mode} id={`${id}-restore-file`} type="file" accept="application/json,.json" className="min-w-0 flex-1" disabled={restoreOperation !== null} onChange={event => {
                  const file = event.target.files?.[0]
                  if (file) updateRestore(dataset.mode, { file, text: undefined, error: undefined, notice: undefined, applied: false })
                }} /><Button variant="outline" disabled={!restoreState.file || !activeRun || busy || savingKey !== null || restoreOperation !== null} onClick={previewRestore}>{restoreOperation === "preview" ? "Reading file…" : "Preview reviews"}</Button></div>
                <p className="text-xs text-muted-foreground [overflow-wrap:anywhere]">{restoreState.file ? `Selected: ${restoreState.file.name}. ` : ""}Maximum {importLimitMiB} MiB. {protectedProjectIds.length.toLocaleString()} unsaved review drafts protected.</p>
              </div>
              {restoreCandidate && <>
                <div className="max-h-24 shrink-0 space-y-1 overflow-auto text-xs [overflow-wrap:anywhere]" aria-label="Restore collection context">
                  <p><span className="font-medium">File:</span> {restoreCandidate.preview.incoming.collectionTitle} ({restoreCandidate.preview.incoming.mode === "demo" ? "Synthetic demo" : "Source data"}); {restoreCandidate.preview.incoming.records.length.toLocaleString()} active records and {(restoreCandidate.preview.incoming.retainedReviews?.length ?? 0).toLocaleString()} retained reviews.</p>
                  <p><span className="font-medium">Active collection:</span> {dataset.title} ({dataset.mode === "demo" ? "Synthetic demo" : "Source data"}). Reviews absent from this collection can only be retained outside active coverage.</p>
                  {restoreCandidate.file !== restoreState.file && <p>Displayed preview is from {restoreCandidate.file.name}. Preview the selected file before applying.</p>}
                </div>
                <dl className="grid shrink-0 grid-cols-3 gap-x-4 gap-y-2" aria-label="Restore review summary">{RESTORE_ACTIONS.map(action => <div key={action} className="min-w-0"><dt className="text-xs text-muted-foreground">{RESTORE_LABELS[action]}</dt><dd className="font-medium tabular-nums">{restoreCounts[action].toLocaleString()}</dd></div>)}</dl>
                <div className="flex shrink-0 flex-wrap items-center justify-between gap-2"><Select value={restoreFilter} onValueChange={value => updateRestore(dataset.mode, { filter: value as RestoreState["filter"], page: 0 })}><SelectTrigger aria-label="Filter restore entries" className="min-w-0 max-w-full"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All entries</SelectItem>{RESTORE_ACTIONS.map(action => <SelectItem key={action} value={action}>{RESTORE_LABELS[action]}</SelectItem>)}</SelectContent></Select><p className="text-xs text-muted-foreground">{compatibleCount.toLocaleString()} compatible decisions</p></div>
              </>}
              <div ref={restoreList} className="min-h-0 min-w-0 flex-1 overflow-auto overscroll-contain [overflow-wrap:anywhere]" tabIndex={0} role="region" aria-label="Restore affected records">
                {restoreCandidate ? pageRestoreEntries.length ? <ul className="divide-y">{pageRestoreEntries.map(entry => {
                  const importedReview = incomingReviews.get(entry.projectId)
                  return <li key={entry.projectId} className="space-y-2 py-3 first:pt-0"><p className="font-medium">{restoreNames.get(entry.projectId) ?? "Not in the active collection"}</p><p className="text-xs text-muted-foreground">{entry.projectId}</p><p className="text-sm">{RESTORE_LABELS[entry.action]}</p><p className="text-xs text-muted-foreground">{entry.reason}</p>{importedReview && <details className="rounded-lg border p-3"><summary className="cursor-pointer font-medium">Imported {importedReview.decision} review</summary><div className="mt-3 space-y-3"><p className="text-sm">{importedReview.reason}</p>{importedReview.decision === "rejected" && <p className="text-xs text-muted-foreground">Rejected evidence stays outside active geography.</p>}{importedReview.representation && <RepresentationEvidence representation={importedReview.representation} />}</div></details>}</li>
                })}</ul> : <p className="text-sm text-muted-foreground">No entries in this view.</p> : <p className="text-sm text-muted-foreground">Choose a companion file and preview its reviews before applying any changes.</p>}
              </div>
              {restoreCandidate && <div className="flex shrink-0 flex-wrap items-center justify-between gap-2" aria-label="Restore entries pagination"><p className="text-xs text-muted-foreground" aria-live="polite">{filteredRestoreEntries.length ? `${restorePage * PAGE_SIZE + 1}–${Math.min((restorePage + 1) * PAGE_SIZE, filteredRestoreEntries.length)} of ${filteredRestoreEntries.length.toLocaleString()}` : "0 entries"}</p><div className="flex gap-2"><IconButton label="Previous restore page" variant="outline" disabled={restorePage === 0} onClick={() => updateRestore(dataset.mode, { page: restorePage - 1 })}><ChevronLeftIcon aria-hidden="true" /></IconButton><IconButton label="Next restore page" variant="outline" disabled={restorePage + 1 >= restorePageCount} onClick={() => updateRestore(dataset.mode, { page: restorePage + 1 })}><ChevronRightIcon aria-hidden="true" /></IconButton></div></div>}
              <div className="max-h-24 shrink-0 space-y-2 overflow-auto">
                {restoreInvalid && !restoreState.applied && <p role="status" className="text-sm text-muted-foreground">The file, active geography or protected drafts changed. Make a new preview before applying.</p>}
                {restoreState.error && <p role="alert" className="text-sm text-destructive">{restoreState.error}</p>}
                {restoreState.notice && <p role="status" className="text-sm">{restoreState.notice}</p>}
              </div>
              <DialogFooter className="shrink-0"><Button onClick={applyRestore} disabled={!restoreCandidate || restoreInvalid || restoreState.applied || !compatibleCount || busy || savingKey !== null || restoreOperation !== null}>{restoreOperation === "apply" ? "Restoring reviews…" : "Apply compatible reviews"}</Button></DialogFooter>
            </DialogContent>
          </Dialog>}
          <Button onClick={onProcess} disabled={busy || savingKey !== null || restoreOperation !== null || dataset.projects.length === 0}>{busy ? "Processing…" : !activeRun && error ? "Retry processing" : activeRun ? "Process again" : "Process collection"}</Button>
          <Button variant="outline" onClick={onDownload} disabled={busy || restoreOperation !== null || !activeRun}><DownloadIcon aria-hidden="true" data-icon="inline-start" />Download geography</Button>
        </div>
      </div>
      <p className="text-sm text-muted-foreground">Coverage across {dataset.projects.length.toLocaleString()} records using available references. Source-located means supplied coordinates, without independent verification. Approximate includes facility estimates, endpoints and areas.</p>
      <dl className="grid grid-cols-5 gap-3" aria-label="Geographic coverage totals">{GEOGRAPHIC_STATUSES.map(status => <div key={status} className="min-w-0"><dt className="text-sm text-muted-foreground">{STATUS_LABELS[status]}</dt><dd className="font-medium tabular-nums">{coverage[status].toLocaleString()}</dd></div>)}</dl>
      {busy && <p role="status" className="text-sm text-muted-foreground">{progress ? `Processing ${progress.processed.toLocaleString()} of ${progress.total.toLocaleString()} records…` : "Preparing geographic evidence…"}</p>}
      {error && (detailTab !== "review" || error !== reviewState?.error) && <p role="alert" className="max-h-20 overflow-auto text-sm text-destructive">{error}</p>}
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
          <div ref={queueBody} onScroll={event => { if (event.currentTarget.clientHeight) scrollByMode.current[dataset.mode] = event.currentTarget.scrollTop }} className="min-h-0 min-w-0 flex-1 overflow-auto overscroll-contain" tabIndex={0} role="region" aria-label="Geographic records">
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
        <CardContent className="flex min-h-0 min-w-0 flex-1 flex-col gap-3">
          <Tabs value={detailTab} onValueChange={changeDetailTab} className="min-h-0 min-w-0 flex-1 overflow-hidden">
            <TabsList aria-label="Selected geographic views" className="shrink-0"><TabsTrigger value="evidence">Evidence</TabsTrigger><TabsTrigger value="review" disabled={!selected}>Review</TabsTrigger></TabsList>
            <TabsContent value="evidence" forceMount hidden={detailTab !== "evidence"} inert={detailTab !== "evidence"} ref={detailBody} onScroll={event => keepDetailScroll("evidence", event.currentTarget)} className="min-h-0 min-w-0 space-y-4 overflow-auto overscroll-contain [overflow-wrap:anywhere] data-[state=inactive]:hidden" tabIndex={0} aria-label="Selected geographic evidence">
          {selected ? <>
            <div className="space-y-2"><Badge variant="secondary">{STATUS_LABELS[selectedStatus]}</Badge><p className="text-sm">{selectedOutcome?.reason ?? "This record has not been processed against the available geographic references."}</p></div>
            {selectedOutcome?.representation && <RepresentationEvidence representation={selectedOutcome.representation} />}
            {selectedOutcome?.review && <section className="space-y-2"><h3 className="font-medium">Retained review</h3><p className="text-sm">{selectedOutcome.review.decision.charAt(0).toUpperCase() + selectedOutcome.review.decision.slice(1)}: {selectedOutcome.review.reason}</p>{selectedOutcome.review.representation && (!selectedOutcome.representation || selectedOutcome.review.basedOnFingerprint !== selectedOutcome.inputFingerprint) && <details className="rounded-lg border p-3"><summary className="cursor-pointer font-medium">Previously reviewed evidence</summary><div className="mt-3"><RepresentationEvidence representation={selectedOutcome.review.representation} /></div></details>}</section>}
            {!!selectedOutcome?.clues.length && <details className="rounded-lg border p-3"><summary className="cursor-pointer font-medium">Source clues</summary><ul className="mt-3 space-y-3">{selectedOutcome.clues.map((clue, index) => <li key={index} className="space-y-2"><p className="text-sm">{clue.text} <span className="text-muted-foreground">({clue.kind})</span></p><EvidenceSources sources={clue.evidence} /></li>)}</ul></details>}
            <p className="text-sm text-muted-foreground">This geographic evidence does not change project centers or strict candidate matching.</p>
            <details className="rounded-lg border p-3"><summary className="cursor-pointer font-medium">Original project sources</summary><div className="mt-3"><EvidenceSources sources={selected.sources} /></div></details>
          </> : <p className="text-sm text-muted-foreground">There are no records in this collection.</p>}
            </TabsContent>
            <TabsContent value="review" forceMount hidden={detailTab !== "review"} inert={detailTab !== "review"} ref={reviewBody} onScroll={event => keepDetailScroll("review", event.currentTarget)} className="min-h-0 min-w-0 space-y-4 overflow-auto overscroll-contain [overflow-wrap:anywhere] data-[state=inactive]:hidden" tabIndex={0} aria-label="Review geographic evidence">
              {reviewDraft && selectedOutcome ? <form id={`${id}-review`} onSubmit={saveReview} noValidate className="space-y-4">
                <p className="text-sm text-muted-foreground">Review the current evidence before saving. This changes only the geographic companion, not source project centers or strict candidates.</p>
                <p className="text-sm">{selectedOutcome.reason}</p>
                {staleDraft && <div className="space-y-2 rounded-lg border p-3"><p role="status" className="text-sm">The source changed since this draft began. Your draft is retained; compare it with the current Evidence tab before saving.</p><Button type="button" variant="outline" size="sm" disabled={busy || savingKey !== null || restoreOperation !== null} onClick={() => updateReview({ inputFingerprint: selectedOutcome.inputFingerprint })}>Review current evidence</Button></div>}
                {!canReview && <p className="text-sm text-muted-foreground">Process this record before saving a review.</p>}
                <fieldset disabled={busy || savingKey !== null || restoreOperation !== null} className="space-y-4">
                  <div className="space-y-2"><Label htmlFor={`${id}-decision`}>Decision</Label><Select value={reviewDraft.decision} onValueChange={decision => updateReview({ decision: decision as ReviewDraft["decision"] })}><SelectTrigger id={`${id}-decision`}><SelectValue /></SelectTrigger><SelectContent><SelectItem value="accepted" disabled={!selectedOutcome.representation}>Accept current evidence</SelectItem><SelectItem value="rejected" disabled={!selectedOutcome.representation}>Reject current evidence</SelectItem><SelectItem value="corrected">Correct geography</SelectItem></SelectContent></Select></div>
                  <p className="text-xs text-muted-foreground">{reviewDraft.decision === "accepted" ? "Accept keeps the current representation and its limitations; it does not make approximate evidence exact." : reviewDraft.decision === "rejected" ? "Reject removes the active representation and retains its evidence in review history." : "A correction needs complete cited evidence and remains approximate."}</p>
                  <div className="space-y-2"><Label htmlFor={`${id}-reason`}>Review reason</Label><Textarea id={`${id}-reason`} value={reviewDraft.reason} onChange={event => updateReview({ reason: event.target.value })} placeholder="Explain what the evidence supports or why it is unsuitable" required /></div>
                  {reviewDraft.decision === "corrected" && <CorrectionFields id={`${id}-correction`} draft={reviewDraft} onChange={updateReview} />}
                </fieldset>
              </form> : <p className="text-sm text-muted-foreground">Process the collection to review this record. Existing drafts will remain available.</p>}
            </TabsContent>
          </Tabs>
          {detailTab === "review" && <div className="shrink-0 space-y-2 border-t pt-3">
            {reviewState?.error && <p role="alert" className="max-h-20 overflow-auto text-sm text-destructive">{reviewState.error}</p>}
            {reviewState?.notice && <p role="status" className="text-sm text-muted-foreground">{reviewState.notice}</p>}
            <div className="flex flex-wrap gap-2"><Button type="submit" form={`${id}-review`} disabled={saveDisabled}>{savingKey === reviewKey ? "Saving review…" : "Save review"}</Button>{reviewState && reviewIsDirty(reviewState) && <Button variant="outline" disabled={busy || savingKey !== null || restoreOperation !== null} onClick={() => setReviews(previous => ({ ...previous, [reviewKey]: { tab: "review" } }))}>Discard draft</Button>}</div>
          </div>}
        </CardContent>
      </Card>
    </div>
  </section>
}
