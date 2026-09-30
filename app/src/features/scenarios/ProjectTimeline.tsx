import { useMemo, useState } from "react"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import { IconButton } from "@/components/ui/icon-button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { Project } from "@/domain/schema"
import { reportingGroupLabel } from "@/lib/reporting-groups"
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
  return <section className="flex min-h-0 min-w-0 flex-1 flex-col gap-3 overflow-hidden" aria-label="Project chronology">
    <div className="flex shrink-0 flex-wrap items-center gap-3"><Label htmlFor="timeline-view">Show chronology</Label><Select value={view} onValueChange={(value) => { setView(value); setPage(0) }}><SelectTrigger id="timeline-view"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="milestones">Reported milestones</SelectItem><SelectItem value="construction">Explicit construction windows</SelectItem></SelectContent></Select></div>
    <p className="shrink-0 text-xs text-muted-foreground">{known} {view === "milestones" ? "dated" : "construction windows"}; {ordered.length - known} unknown (listed last).{view === "milestones" && " Partial dates may not be in exact order."}</p>
    <div className="min-h-0 min-w-0 flex-1 overflow-auto [&>[data-slot=table-container]]:overflow-visible" tabIndex={0} role="region" aria-label="Chronological projects">{ordered.length ? <Table className="min-w-[24rem]"><TableHeader className="sticky top-0 z-10 bg-background"><TableRow><TableHead>{view === "milestones" ? "Milestone" : "Construction window"}</TableHead><TableHead>Project</TableHead></TableRow></TableHeader><TableBody>{ordered.slice(activePage * 25, (activePage + 1) * 25).map((project) => <TableRow key={project.id} data-state={selectedId === project.id ? "selected" : undefined}><TableCell>{view === "milestones" ? <>{projectDate(project)}<span className="block text-xs text-muted-foreground">{dateKind(project)}</span></> : project.buildWindow ? <>{project.buildWindow.start}<span className="block text-xs text-muted-foreground">through {project.buildWindow.end}</span></> : "Unknown"}</TableCell><TableCell className="max-w-80 whitespace-normal break-words"><button type="button" className="text-left font-medium underline-offset-4 hover:underline focus-visible:underline" onClick={() => onProject(project.id)}>{project.name}</button><span className="block text-xs text-muted-foreground">{reportingGroupLabel(project)}{project.sourceId && `; Source ID ${project.sourceId}`}</span></TableCell></TableRow>)}</TableBody></Table> : <p className="py-4 text-sm text-muted-foreground">No projects match the inventory filters.</p>}</div>
    <div className="flex shrink-0 items-center justify-between gap-3 border-t pt-3"><p className="text-xs text-muted-foreground">{ordered.length ? `${activePage * 25 + 1}–${Math.min((activePage + 1) * 25, ordered.length)} of ${ordered.length}` : "0 results"}</p><div className="flex gap-2"><IconButton variant="outline" disabled={activePage === 0} label="Previous timeline page" onClick={() => setPage(activePage - 1)}><ChevronLeftIcon aria-hidden="true" /></IconButton><IconButton variant="outline" disabled={activePage + 1 >= pages} label="Next timeline page" onClick={() => setPage(activePage + 1)}><ChevronRightIcon aria-hidden="true" /></IconButton></div></div>
  </section>
}
