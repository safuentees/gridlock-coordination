import type { Opportunity, Project } from "@/domain/schema"

export function projectDate(project: Project) {
  return project.date.value === null ? "Unknown" : `${project.date.value} (${project.date.precision})`
}
export const timelineLabels: Record<Opportunity["timelineRelation"], string> = {
  "confirmed-overlap": "Explicit construction windows overlap",
  "date-proximity": "Milestone dates within 365 days",
  separate: "Distant milestones or separate construction windows",
  unknown: "Timing cannot be compared",
}
export function dateKind(project: Project) {
  if (project.inventory) return project.date.label
  return project.date.kind === "in-service" ? "Planned in-service" : project.date.kind === "need" ? "Need date" : "Date type unknown"
}

export const lifecycleLabels: Record<NonNullable<Project["inventory"]>["lifecycle"], string> = {
  planned: "Planned", approved: "Approved", "under-construction": "Under construction",
  "on-hold": "On hold", "in-service": "In service", cancelled: "Cancelled", unknown: "Unknown",
}
