import { UTILITIES, type Project } from "@/domain/schema"

export function reportingGroupLabel(project: Project): string {
  return project.inventory?.reportingGroupName ?? UTILITIES[project.utilityId as keyof typeof UTILITIES] ?? project.utilityId
}

export function reportingGroups(projects: Project[]): { id: string; label: string }[] {
  return [...new Map(projects.map(project => [project.utilityId, { id: project.utilityId, label: reportingGroupLabel(project) }])).values()]
    .sort((left, right) => left.label.localeCompare(right.label))
}

/** Display context only; candidate eligibility is implemented exclusively by core. */
export function projectLocationLabel(project: Project): string {
  if (project.location) return `${project.location.confidence === "confirmed" ? "Marked confirmed" : "Unverified"} center`
  return project.inventory?.nativeGeometry ? "Center unresolved; source positions available" : "Location missing"
}
