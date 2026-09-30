import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { UTILITIES, type Opportunity, type Project, type SourceRef } from "@/domain/schema"
import { dateKind, projectDate, timelineLabels } from "./format"

function Sources({ sources }: { sources: SourceRef[] }) {
  return <ul className="space-y-1 text-xs text-muted-foreground">{sources.map((source, index) => <li key={`${source.file}-${source.locator}-${index}`} className="break-words">
    {source.url && /^https?:\/\//i.test(source.url) ? <a className="underline underline-offset-2" href={source.url} target="_blank" rel="noreferrer">{source.file}</a> : source.file}; {source.locator}
  </li>)}</ul>
}
export function ProjectEvidence({ project }: { project: Project }) {
  return <section className="min-w-0 space-y-3 [overflow-wrap:anywhere]">
    <div><h3 className="font-medium">{project.name}</h3><p className="text-xs text-muted-foreground">{UTILITIES[project.utilityId]}; {project.sourceId ?? "No source ID"}</p></div>
    <p className="text-sm">{project.description || "No description supplied."}</p>
    <dl className="grid grid-cols-[minmax(0,1fr)_minmax(0,2fr)] gap-x-4 gap-y-2 text-sm [&_dd]:min-w-0 [&_dd]:break-words">
      <dt className="text-muted-foreground">Sponsor</dt><dd>{project.sponsor ?? "Unknown"}</dd>
      <dt className="text-muted-foreground">Status</dt><dd>{project.status ?? "Unknown"}</dd>
      <dt className="text-muted-foreground">Voltage</dt><dd>{project.voltageKv.length ? `${project.voltageKv.join(" / ")} kV` : "Unknown"}</dd>
      <dt className="text-muted-foreground">{dateKind(project)}</dt><dd>{projectDate(project)}<span className="block text-xs text-muted-foreground">{project.date.label}</span></dd>
      <dt className="text-muted-foreground">Construction</dt><dd>{project.buildWindow ? `${project.buildWindow.start} to ${project.buildWindow.end}` : "No explicit construction window"}</dd>
      <dt className="text-muted-foreground">Location</dt><dd>{project.location ? <>{project.location.lat}, {project.location.lon}<span className="block text-xs text-muted-foreground">{project.location.method.replaceAll("-", " ")}; {project.location.confidence}</span></> : "Unknown; excluded from proximity analysis"}</dd>
    </dl>
    {project.location && <div className="space-y-1"><h4 className="text-xs font-medium">Location evidence</h4><Sources sources={project.location.evidence} /></div>}
    <div className="space-y-1"><h4 className="text-xs font-medium">Project sources</h4><Sources sources={project.sources} /></div>
    {project.notes.length > 0 && <ul className="list-disc space-y-1 pl-4 text-xs text-muted-foreground">{project.notes.map((note, index) => <li key={index}>{note}</li>)}</ul>}
  </section>
}
export function ProjectDetails({ project }: { project: Project | null }) {
  return <Card><CardHeader><CardTitle>Project evidence</CardTitle><CardDescription>Select a map point or an inventory project to inspect its source.</CardDescription></CardHeader><CardContent>{project ? <ProjectEvidence project={project} /> : <p className="text-sm text-muted-foreground">No project selected.</p>}</CardContent></Card>
}
export function PairDetails({ opportunity, projects, onProject }: { opportunity: Opportunity; projects: Project[]; onProject: (id: string) => void }) {
  const pair = opportunity.projectIds.map((id) => projects.find((project) => project.id === id)).filter((project): project is Project => project !== undefined)
  return <Card className="min-w-0"><CardHeader><CardTitle>Coordination candidate #{opportunity.rank}</CardTitle><CardDescription>Project centers indicate proximity. A connecting line is not a transmission route.</CardDescription></CardHeader><CardContent className="space-y-4">
    <div className="flex flex-wrap gap-2"><Badge>{opportunity.distanceMiles.toFixed(2)} mi apart</Badge><Badge variant="secondary">{opportunity.dateGapDays === null ? "Date gap unknown" : `${opportunity.dateGapDays} days between milestones`}</Badge><Badge variant="outline">{opportunity.locationConfidence} locations</Badge></div>
    <p className="text-sm">{timelineLabels[opportunity.timelineRelation]}</p>
    <ul className="list-disc space-y-1 pl-4 text-xs text-muted-foreground">{opportunity.reasons.map((reason, index) => <li key={index}>{reason}</li>)}</ul>
    {pair.map((project) => <div className="space-y-3 border-t pt-4" key={project.id}><ProjectEvidence project={project} /><Button variant="outline" size="sm" onClick={() => onProject(project.id)}>Select this project</Button></div>)}
    <p className="text-xs text-muted-foreground">Reporting groups may include other asset sponsors. Proximity and milestone dates do not establish shared right-of-way or simultaneous construction.</p>
  </CardContent></Card>
}
