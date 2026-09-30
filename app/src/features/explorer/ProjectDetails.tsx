import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { projectEligibility } from "@/core"
import type { Opportunity, Project, SourceRef } from "@/domain/schema"
import { reportingGroupLabel, projectLocationLabel } from "@/lib/reporting-groups"
import { visibleProjectNotes } from "@/lib/presentation"
import { dateKind, lifecycleLabels, projectDate, timelineLabels } from "./format"

function Sources({ sources }: { sources: SourceRef[] }) {
  return <ul className="space-y-1 text-xs text-muted-foreground">{sources.map((source, index) => <li key={`${source.file}-${source.locator}-${index}`} className="break-words">
    {source.url && /^https?:\/\//i.test(source.url) ? <a className="underline underline-offset-2" href={source.url} target="_blank" rel="noreferrer">{source.file}</a> : source.file}; {source.locator}
  </li>)}</ul>
}
/** Snapshot metadata also works in saved reviews without the active dataset manifest. */
export function InventoryEvidence({ project }: { project: Project }) {
  const inventory = project.inventory
  if (!inventory) return null
  const eligibility = projectEligibility(project)
  const geometry = inventory.nativeGeometry
  return <section className="min-w-0 space-y-3 text-sm [overflow-wrap:anywhere]" aria-label="Source inventory evidence">
    <dl className="grid grid-cols-[minmax(0,1fr)_minmax(0,2fr)] gap-x-4 gap-y-2 [&_dd]:min-w-0">
      <dt className="text-muted-foreground">Source edition</dt><dd>{inventory.editionLabel}</dd>
      <dt className="text-muted-foreground">Record type</dt><dd>{inventory.recordKind === "planning-context" ? "Planning context" : inventory.recordKind === "capital-project-context" ? "Capital project context" : inventory.recordUnit === "upgrade" ? "Transmission upgrade" : inventory.recordUnit === "component" ? "Transmission component" : "Transmission project"}</dd>
      <dt className="text-muted-foreground">Lifecycle</dt><dd>{lifecycleLabels[inventory.lifecycle]}<span className="block text-xs text-muted-foreground">{inventory.lifecycleDateMeaning === "snapshot-observed" ? "Observed in snapshot on" : "Source edition as of"} {inventory.lifecycleAsOf}</span></dd>
      <dt className="text-muted-foreground">Asset owner</dt><dd>{inventory.owner?.name ?? "Unknown; no ownership evidence"}{inventory.owner && inventory.owner.identityScope !== "global" && <span className="block text-xs text-muted-foreground">Identified within this source; cross-source identity unverified.</span>}</dd>
      {inventory.sourceState && <><dt className="text-muted-foreground">Source state text</dt><dd>{inventory.sourceState}</dd></>}
      {inventory.sourceLocation && <><dt className="text-muted-foreground">Source location text</dt><dd>{inventory.sourceLocation}</dd></>}
      {inventory.sourceUpdatedOn && <><dt className="text-muted-foreground">Source row updated</dt><dd>{inventory.sourceUpdatedOn}<span className="block text-xs text-muted-foreground">Not a status-change date.</span></dd></>}
      {inventory.workType && <><dt className="text-muted-foreground">Work type</dt><dd>{inventory.workType}</dd></>}
      {inventory.constructionStart && <><dt className="text-muted-foreground">Reported construction start</dt><dd>{inventory.constructionStart}</dd></>}
      {inventory.parentProgramId && <><dt className="text-muted-foreground">Parent program</dt><dd>{inventory.parentProgramId}</dd></>}
      {inventory.aliases.length > 0 && <><dt className="text-muted-foreground">Other source identifiers</dt><dd>{inventory.aliases.join(", ")}</dd></>}
      <dt className="text-muted-foreground">Displayed location role</dt><dd>{inventory.centerRole.replaceAll("-", " ")}</dd>
    </dl>
    {!eligibility.eligible && <div className="space-y-1"><h4 className="font-medium">Context only</h4><ul className="list-disc space-y-1 pl-4 text-xs text-muted-foreground">{eligibility.reasons.map(reason => <li key={reason}>{reason}</li>)}</ul></div>}
    {inventory.locationAssumptions.length > 0 && <ul className="list-disc space-y-1 pl-4 text-xs text-muted-foreground">{inventory.locationAssumptions.map((assumption, index) => <li key={index}>{assumption}</li>)}</ul>}
    {inventory.owner && <div className="space-y-1"><h4 className="text-xs font-medium">Ownership evidence</h4><Sources sources={inventory.owner.evidence} /></div>}
    {inventory.milestones && inventory.milestones.length > 0 && <details className="space-y-3 rounded-lg border p-3"><summary className="cursor-pointer font-medium">Reported date fields ({inventory.milestones.length})</summary>
      <p className="text-xs text-muted-foreground">Comparison milestone: {project.date.label}. Other reported dates do not establish a construction window.</p>
      <ul className="space-y-3">{inventory.milestones.map((milestone, index) => <li key={`${milestone.field}-${index}`} className="space-y-1">
        <h4 className="text-sm font-medium">{milestone.date.label}</h4>
        <p className="text-sm">{milestone.date.value === null ? "Unknown" : `${milestone.date.value} (${milestone.date.precision})`}</p>
        <p className="text-xs text-muted-foreground">Source field: {milestone.field}</p>
        <Sources sources={milestone.evidence} />
      </li>)}</ul>
    </details>}
    {geometry && <details className="space-y-2 rounded-lg border p-3"><summary className="cursor-pointer font-medium">Published positions</summary>
      <dl className="grid grid-cols-[minmax(0,1fr)_minmax(0,2fr)] gap-x-3 gap-y-2 text-xs">
        <dt className="text-muted-foreground">Role</dt><dd>{geometry.role.replaceAll("-", " ")}</dd>
        <dt className="text-muted-foreground">Latitude as published</dt><dd>{geometry.rawLatitude ?? "Not stated"}</dd>
        <dt className="text-muted-foreground">Longitude as published</dt><dd>{geometry.rawLongitude ?? "Not stated"}</dd>
        <dt className="text-muted-foreground">Coordinate system</dt><dd>{geometry.crs ?? "Unknown"}</dd>
        <dt className="text-muted-foreground">Accuracy</dt><dd>{geometry.accuracyMeters === null ? "Unknown" : `${geometry.accuracyMeters} meters`}</dd>
      </dl>
      <ul className="max-h-40 space-y-1 overflow-auto overscroll-contain text-xs" tabIndex={0} aria-label="Published longitude and latitude pairs">{geometry.coordinates.map(([lon, lat], index) => <li key={index}>Longitude {lon}; latitude {lat}</li>)}</ul>
      <Sources sources={geometry.evidence} />
    </details>}
  </section>
}
export function ProjectEvidence({ project }: { project: Project }) {
  const notes = visibleProjectNotes(project)
  const phaseDates = project.date.kind === "in-service" && project.date.value === null ? notes.find(note => note.startsWith("Source planned in-service dates:")) : undefined
  const otherNotes = notes.filter(note => note !== phaseDates)
  return <section className="min-w-0 space-y-3 [overflow-wrap:anywhere]">
    <div><h3 className="font-medium">{project.name}</h3><p className="text-xs text-muted-foreground">{reportingGroupLabel(project)}{project.sourceId && `; ${project.sourceId}`}</p></div>
    {project.description.trim() && <p className="text-sm">{project.description}</p>}
    <dl className="grid grid-cols-[minmax(0,1fr)_minmax(0,2fr)] gap-x-4 gap-y-2 text-sm [&_dd]:min-w-0 [&_dd]:break-words">
      <dt className="text-muted-foreground">Sponsor</dt><dd>{project.sponsor ?? "Unknown"}</dd>
      <dt className="text-muted-foreground">Status</dt><dd>{project.status ?? "Unknown"}</dd>
      <dt className="text-muted-foreground">Voltage</dt><dd>{project.voltageKv.length ? `${project.voltageKv.join(" / ")} kV` : "Unknown"}</dd>
      <dt className="text-muted-foreground">{dateKind(project)}</dt><dd>{phaseDates ? phaseDates.replace(/^Source planned in-service dates:\s*/, "") : projectDate(project)}</dd>
      <dt className="text-muted-foreground">Construction window</dt><dd>{project.buildWindow ? `${project.buildWindow.start} to ${project.buildWindow.end}` : "Not stated"}</dd>
      <dt className="text-muted-foreground">Location</dt><dd>{project.location ? <>{project.location.lat}, {project.location.lon}<span className="block text-xs text-muted-foreground">{project.location.method.replaceAll("-", " ")}; {project.location.confidence}</span></> : projectLocationLabel(project)}</dd>
    </dl>
    <InventoryEvidence project={project} />
    {project.location && <div className="space-y-1"><h4 className="text-xs font-medium">Location evidence</h4><Sources sources={project.location.evidence} /></div>}
    <div className="space-y-1"><h4 className="text-xs font-medium">Project sources</h4><Sources sources={project.sources} /></div>
    {otherNotes.length > 0 && <ul className="list-disc space-y-1 pl-4 text-xs text-muted-foreground">{otherNotes.map((note, index) => <li key={index}>{note}</li>)}</ul>}
  </section>
}
export function ProjectDetails({ project }: { project: Project | null }) {
  return <Card><CardHeader><CardTitle>Project evidence</CardTitle>{!project && <CardDescription>Select a project to view its evidence.</CardDescription>}</CardHeader><CardContent>{project ? <ProjectEvidence project={project} /> : null}</CardContent></Card>
}
export function PairDetails({ opportunity, projects, onProject }: { opportunity: Opportunity; projects: Project[]; onProject: (id: string) => void }) {
  const pair = opportunity.projectIds.map((id) => projects.find((project) => project.id === id)).filter((project): project is Project => project !== undefined)
  return <Card className="min-w-0"><CardHeader><CardTitle>Candidate #{opportunity.rank}</CardTitle><CardDescription>Shared route unconfirmed.</CardDescription></CardHeader><CardContent className="space-y-4">
    <div className="flex flex-wrap gap-2"><Badge>{opportunity.distanceMiles.toFixed(2)} mi apart</Badge><Badge variant="secondary">{opportunity.dateGapDays === null ? "Date gap unknown" : `${opportunity.dateGapDays} days between milestones`}</Badge><Badge variant="outline">{opportunity.locationConfidence} locations</Badge></div>
    <p className="text-sm">{timelineLabels[opportunity.timelineRelation]}</p>
    {pair.map((project) => <div className="space-y-3 border-t pt-4" key={project.id}><ProjectEvidence project={project} /><Button variant="outline" size="sm" onClick={() => onProject(project.id)}>Select this project</Button></div>)}
  </CardContent></Card>
}
