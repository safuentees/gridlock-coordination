import { useLayoutEffect, useMemo, useRef, useState } from "react"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { IconButton } from "@/components/ui/icon-button"
import type { ExploratoryMatch, ExploratoryOwnership, ExploratoryResultsProps } from "@/domain/exploratory"
import type { Project, SourceRef } from "@/domain/schema"
import { reportingGroupLabel } from "@/lib/reporting-groups"
import { dateKind, lifecycleLabels, projectDate } from "./format"

const PAGE_SIZE = 25
const OWNERSHIP_LABELS: Record<ExploratoryOwnership, string> = {
  "same-evidenced-owner": "Same evidenced owner",
  "distinct-evidenced-owners": "Distinct evidenced owners",
  unknown: "Unknown; distinct owners are not established",
}
const CONSTRUCTION_LABELS: Record<ExploratoryMatch["timing"]["constructionRelation"], string> = {
  overlap: "Stated windows overlap",
  separate: "Stated windows do not overlap",
  unknown: "Overlap unknown",
}

function projectIdentifier(project: Project) {
  return `${project.inventory?.identityBasis === "source-locator" ? "Source locator" : "Source ID"} ${project.sourceId ?? project.id}`
}

function Sources({ sources }: { sources: readonly SourceRef[] }) {
  return <ul className="space-y-2 text-xs text-muted-foreground">{sources.map((source, index) => <li key={`${source.file}:${source.locator}:${index}`}>
    {source.url && /^https?:\/\//i.test(source.url) ? <a href={source.url} target="_blank" rel="noreferrer" className="underline underline-offset-2">{source.file}</a> : source.file}
    <span className="block">{source.locator}</span>
  </li>)}</ul>
}

function OwnershipContext({ project }: { project: Project }) {
  const owner = project.inventory?.owner
  if (!owner) return <p className="text-xs text-muted-foreground">Asset owner unknown.</p>
  return <div className="space-y-1 text-xs text-muted-foreground">
    <p>Asset owner: {owner.name}.</p>
    {owner.ownershipStatement && <p>Planned ownership as of {owner.ownershipStatement.asOf}; present equipment title unconfirmed. {owner.ownershipStatement.scope}</p>}
    {owner.identityScope !== "global" && <p>Identity is scoped to this source inventory.</p>}
    <Sources sources={owner.evidence} />
  </div>
}

function Relation({ match }: { match: ExploratoryMatch }) {
  if (match.relation === "extent-overlap") return <><span className="font-medium">Bounding extents overlap</span><span className="block text-xs text-muted-foreground">Coarse area context; no distance or radius qualification.</span></>
  if (match.relation === "within-extent") return <><span className="font-medium">A supplied position is within the extent</span><span className="block text-xs text-muted-foreground">Coarse area context; no distance or radius qualification.</span></>
  return <><span className="font-medium">{match.distanceMiles === null ? "Distance unavailable" : `Approximately ${match.distanceMiles.toLocaleString(undefined, { maximumFractionDigits: 2 })} mi`}</span><span className="block text-xs text-muted-foreground">{match.relation === "endpoint-distance" ? "Smallest sampled endpoint separation; not route or project-center distance." : "Straight-line separation of supplied points."}</span></>
}

/** Presentation only: all distances, relations, ownership and timing come from core. */
export function ExploratoryResults({ projects, result, onProject }: ExploratoryResultsProps) {
  const byId = useMemo(() => new Map(projects.map(project => [project.id, project])), [projects])
  const selected = result ? byId.get(result.selectedProjectId) : undefined
  const selectionKey = result?.selectedProjectId ?? ""
  const [pages, setPages] = useState<Record<string, number>>({})
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const body = useRef<HTMLDivElement>(null)
  const scrollPositions = useRef<Record<string, number>>({})
  const matches = result?.matches ?? []
  const pageCount = Math.max(1, Math.ceil(matches.length / PAGE_SIZE))
  const page = Math.min(pages[selectionKey] ?? 0, pageCount - 1)
  const pageMatches = matches.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)
  const scrollKey = JSON.stringify([selectionKey, page])

  useLayoutEffect(() => {
    const element = body.current
    if (!element) return
    const restore = () => { if (element.clientHeight) element.scrollTop = scrollPositions.current[scrollKey] ?? 0 }
    restore()
    const observer = new ResizeObserver(restore)
    observer.observe(element)
    return () => observer.disconnect()
  }, [scrollKey])

  function changePage(next: number) {
    setPages(previous => ({ ...previous, [selectionKey]: next }))
  }

  return <section className="flex h-full min-h-0 min-w-0 flex-col gap-3 overflow-hidden" aria-label="Exploratory proximity results">
    <header className="max-h-[35%] min-h-0 shrink-0 space-y-2 overflow-auto overscroll-contain [overflow-wrap:anywhere]">
      <h3 className="font-medium">Exploratory proximity</h3>
      <p className="text-sm text-muted-foreground">Approximate geographic context. These results do not establish strict candidates, shared routes or coordination benefits.</p>
      {result && <>
        <div className="space-y-1"><p className="font-medium">{selected?.name ?? result.selectedProjectId}</p>{selected && <><p className="text-xs text-muted-foreground">{reportingGroupLabel(selected)}; {projectIdentifier(selected)}</p><p className="text-xs"><span className="text-muted-foreground">{dateKind(selected)}: </span>{projectDate(selected)}</p></>}</div>
        <p className="text-xs text-muted-foreground">Point and endpoint radius: {result.radiusMiles.toLocaleString()} mi. Extent context is independent of this radius.</p>
        <p className="text-xs text-muted-foreground">{result.representedProjects.toLocaleString()} records with geographic evidence; {result.unresolvedProjects.toLocaleString()} unresolved.</p>
      </>}
    </header>
    <div ref={body} onScroll={event => { if (event.currentTarget.clientHeight) scrollPositions.current[scrollKey] = event.currentTarget.scrollTop }} className="min-h-0 min-w-0 flex-1 space-y-4 overflow-auto overscroll-contain [overflow-wrap:anywhere]" tabIndex={0} role="region" aria-label="Exploratory matches">
      {!result ? <p className="text-sm text-muted-foreground">Select a project with current geographic evidence to explore its context.</p> : <>
        {result.reason && <p role="status" className="text-sm text-muted-foreground">{result.reason}</p>}
        {result.representation && <details className="rounded-lg border p-3" open={expanded[`${selectionKey}:geography`] ?? false} onToggle={event => {
          const open = event.currentTarget.open
          setExpanded(previous => previous[`${selectionKey}:geography`] === open ? previous : { ...previous, [`${selectionKey}:geography`]: open })
        }}><summary className="cursor-pointer font-medium">Selected geography and sources</summary><div className="mt-3 space-y-3">
          <p className="text-sm">{result.representation.label}</p>
          <p className="text-xs text-muted-foreground">{result.representation.kind === "area" ? "Bounding extent" : result.representation.kind === "endpoints" ? "Evidenced endpoints" : "Point"}; {result.representation.method.replaceAll("-", " ")}; {result.representation.precision} precision. {result.representation.accuracyMeters === null ? "Numeric accuracy is not stated." : `Source-stated accuracy: ${result.representation.accuracyMeters} m.`}</p>
          <ul className="list-disc space-y-1 pl-4 text-xs text-muted-foreground">{result.representation.limitations.map((limitation, index) => <li key={index}>{limitation}</li>)}</ul>
          <Sources sources={result.representation.evidence} />
          {selected && <OwnershipContext project={selected} />}
        </div></details>}
        {matches.length ? <ul className="space-y-4">{pageMatches.map(match => {
          const project = byId.get(match.projectId)
          const inventory = project?.inventory
          const detailsKey = JSON.stringify([selectionKey, match.projectId])
          return <li key={match.projectId} className="space-y-3 rounded-lg border p-3">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 flex-1 space-y-1"><h4 className="font-medium">{project?.name ?? "Project unavailable"}</h4><p className="text-xs text-muted-foreground">{project ? `${reportingGroupLabel(project)}; ${projectIdentifier(project)}` : match.projectId}</p></div>
              <Button variant="outline" size="sm" disabled={!project} onClick={() => onProject(match.projectId)}>Open project</Button>
            </div>
            {inventory && <p className="text-xs text-muted-foreground">{inventory.recordKind === "planning-context" ? "Planning context" : inventory.recordKind === "capital-project-context" ? "Capital project context" : "Transmission project"}; {lifecycleLabels[inventory.lifecycle]}. {inventory.lifecycleDateMeaning === "snapshot-observed" ? "Snapshot observed" : "Source edition as of"} {inventory.lifecycleAsOf}.</p>}
            <dl className="grid grid-cols-[minmax(0,1fr)_minmax(0,2fr)] gap-x-3 gap-y-2 text-sm [&_dd]:min-w-0">
              <dt className="text-muted-foreground">Geographic relation</dt><dd><Relation match={match} /></dd>
              <dt className="text-muted-foreground">Ownership relation</dt><dd>{OWNERSHIP_LABELS[match.ownership]}{(selected?.inventory?.owner?.ownershipStatement || inventory?.owner?.ownershipStatement) && <span className="block text-xs text-muted-foreground">Includes planned ownership evidence; present equipment title is unconfirmed.</span>}</dd>
              <dt className="text-muted-foreground">Milestone gap</dt><dd>{match.timing.dateGapDays === null ? "Unknown" : `${match.timing.dateGapDays} days`}</dd>
              <dt className="text-muted-foreground">Construction</dt><dd>{CONSTRUCTION_LABELS[match.timing.constructionRelation]}</dd>
            </dl>
            {project && <p className="text-xs"><span className="text-muted-foreground">{dateKind(project)}: </span>{projectDate(project)}</p>}
            <details open={expanded[detailsKey] ?? false} onToggle={event => {
              const open = event.currentTarget.open
              setExpanded(previous => previous[detailsKey] === open ? previous : { ...previous, [detailsKey]: open })
            }}><summary className="cursor-pointer text-sm font-medium">Limitations and source context</summary><div className="mt-3 space-y-3">
              {match.limitations.length > 0 && <ul className="list-disc space-y-1 pl-4 text-xs text-muted-foreground">{match.limitations.map((limitation, index) => <li key={index}>{limitation}</li>)}</ul>}
              <ul className="list-disc space-y-1 pl-4 text-xs text-muted-foreground">{match.timing.reasons.map((reason, index) => <li key={index}>{reason}</li>)}</ul>
              {project && <><OwnershipContext project={project} /><Sources sources={project.sources} /></>}
            </div></details>
          </li>
        })}</ul> : !result.reason && <p className="text-sm text-muted-foreground">No geographic matches were returned for this selection and radius.</p>}
      </>}
    </div>
    <footer className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-t pt-3" aria-label="Exploratory pagination">
      <p className="text-xs text-muted-foreground" aria-live="polite">{matches.length ? `${page * PAGE_SIZE + 1}–${Math.min((page + 1) * PAGE_SIZE, matches.length)} of ${matches.length.toLocaleString()} exploratory results` : "0 exploratory results"}</p>
      <div className="flex gap-2"><IconButton label="Previous exploratory page" variant="outline" disabled={page === 0} onClick={() => changePage(page - 1)}><ChevronLeftIcon aria-hidden="true" /></IconButton><IconButton label="Next exploratory page" variant="outline" disabled={page + 1 >= pageCount} onClick={() => changePage(page + 1)}><ChevronRightIcon aria-hidden="true" /></IconButton></div>
    </footer>
  </section>
}
