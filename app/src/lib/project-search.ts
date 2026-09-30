import type { Project } from "@/domain/schema"
import { visibleProjectNotes } from "@/lib/presentation"

/** Search the project fields and source context that the user can see. */
export function matchesProjectQuery(project: Project, query: string): boolean {
  const normalizedQuery = query.trim().toLocaleLowerCase()
  if (!normalizedQuery) return true
  return [
    project.name,
    project.description,
    project.sourceId ?? "",
    project.sponsor ?? "",
    ...project.voltageKv.map(String),
    ...visibleProjectNotes(project),
  ].join(" ").toLocaleLowerCase().includes(normalizedQuery)
}
