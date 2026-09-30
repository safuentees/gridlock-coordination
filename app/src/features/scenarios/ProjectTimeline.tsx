import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { UTILITIES, type Project } from "@/domain/schema"
import { dateKind, projectDate } from "@/features/explorer/format"

export function ProjectTimeline({ projects, selectedId, onProject }: { projects: Project[]; selectedId: string | null; onProject: (id: string) => void }) {
  const [view, setView] = useState("milestones")
  const [page, setPage] = useState(0)
  const ordered = useMemo(() => [...projects].sort((left, right) => {
    // Sort preserved ISO strings for presentation, without inventing partial-date bounds.
    const a = view === "milestones" ? left.date.value : left.buildWindow?.start ?? null
    const b = view === "milestones" ? right.date.value : right.buildWindow?.start ?? null
    if (a === null) return b === null ? left.id.localeCompare(right.id) : 1
    if (b === null) return -1
    return a.localeCompare(b) || left.id.localeCompare(right.id)
  }), [projects, view])
  const known = ordered.filter((project) => view === "milestones" ? project.date.value !== null : project.buildWindow !== null).length
  const pages = Math.max(1, Math.ceil(ordered.length / 25))
  const activePage = Math.min(page, pages - 1)
  return <section className="space-y-3" aria-label="Project chronology">
    <div className="flex flex-wrap items-center gap-3"><Label htmlFor="timeline-view">Show chronology</Label><Select value={view} onValueChange={(value) => { setView(value); setPage(0) }}><SelectTrigger id="timeline-view"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="milestones">Planned milestones</SelectItem><SelectItem value="construction">Explicit construction windows</SelectItem></SelectContent></Select></div>
    <p className="text-xs text-muted-foreground">{known} projects have {view === "milestones" ? "a milestone date" : "an explicit construction window"}; {ordered.length - known} are unknown and listed last. Partial dates retain their source precision; ordering within a partially dated period is uncertain. Select a project for its evidence.</p>
    {ordered.length ? <Table><TableHeader><TableRow><TableHead>{view === "milestones" ? "Milestone" : "Construction window"}</TableHead><TableHead>Project</TableHead></TableRow></TableHeader><TableBody>{ordered.slice(activePage * 25, (activePage + 1) * 25).map((project) => <TableRow key={project.id} data-state={selectedId === project.id ? "selected" : undefined}><TableCell>{view === "milestones" ? <>{projectDate(project)}<span className="block text-xs text-muted-foreground">{dateKind(project)}</span></> : project.buildWindow ? <>{project.buildWindow.start}<span className="block text-xs text-muted-foreground">through {project.buildWindow.end}</span></> : "Unknown"}</TableCell><TableCell className="whitespace-normal"><button type="button" className="text-left font-medium underline-offset-4 hover:underline focus-visible:underline" onClick={() => onProject(project.id)}>{project.name}</button><span className="block text-xs text-muted-foreground">{UTILITIES[project.utilityId]}</span></TableCell></TableRow>)}</TableBody></Table> : <p className="py-4 text-sm text-muted-foreground">No projects match the inventory filters.</p>}
    <div className="flex items-center justify-between gap-3 border-t pt-3"><p className="text-xs text-muted-foreground">{ordered.length ? `${activePage * 25 + 1}–${Math.min((activePage + 1) * 25, ordered.length)} of ${ordered.length}` : "0 results"}</p><div className="flex gap-2"><Button variant="outline" size="sm" disabled={activePage === 0} aria-label="Previous chronological page" onClick={() => setPage(activePage - 1)}>Previous</Button><Button variant="outline" size="sm" disabled={activePage + 1 >= pages} aria-label="Next chronological page" onClick={() => setPage(activePage + 1)}>Next</Button></div></div>
    <p className="text-xs text-muted-foreground">Milestones are need or planned in-service dates. They do not establish construction periods or completed work.</p>
  </section>
}
