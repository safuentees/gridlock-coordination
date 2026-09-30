import type { Project } from "@/domain/schema"
import { visibleProjectNotes } from "@/lib/presentation"
import { reportingGroupLabel } from "@/lib/reporting-groups"

/** Search the project fields and source context that the user can see. */
export function matchesProjectQuery(project: Project, query: string): boolean {
  const normalizedQuery = query.trim().toLocaleLowerCase()
  if (!normalizedQuery) return true
  return [
    project.name,
    project.description,
    project.sourceId ?? "",
    project.sponsor ?? "",
    reportingGroupLabel(project),
    project.status ?? "",
    ...(project.inventory ? [project.inventory.editionLabel, project.inventory.owner?.name ?? "", project.inventory.workType ?? "", project.inventory.lifecycle, project.inventory.sourceState ?? "", project.inventory.sourceLocation ?? "", ...project.inventory.aliases] : []),
    ...project.voltageKv.map(String),
    ...visibleProjectNotes(project),
    ...project.sources.flatMap(source => [source.file, source.locator]),
  ].join(" ").toLocaleLowerCase().includes(normalizedQuery)
}
