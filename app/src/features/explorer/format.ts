import type { Opportunity, Project } from "@/domain/schema"

export function projectDate(project: Project) {
  return project.date.value === null ? "Unknown" : `${project.date.value} (${project.date.precision})`
}
export const timelineLabels: Record<Opportunity["timelineRelation"], string> = {
  "confirmed-overlap": "Explicit construction windows overlap",
  "date-proximity": "Milestone dates within 365 days",
  separate: "Milestone dates more than 365 days apart",
  unknown: "Timing cannot be compared",
}
export function dateKind(project: Project) {
  return project.date.kind === "in-service" ? "Planned in-service" : project.date.kind === "need" ? "Need date" : "Date type unknown"
}
