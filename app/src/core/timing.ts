import type { Opportunity, Project } from "../domain/schema"

const DAY_MS = 86_400_000
export const DATE_PROXIMITY_DAYS = 365

/** Exact UTC calendar date only: reject partial dates and calendar rollover. */
function calendarDay(value: string | null): number | null {
  if (value === null || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null
  const timestamp = Date.parse(`${value}T00:00:00.000Z`)
  if (!Number.isFinite(timestamp) || new Date(timestamp).toISOString().slice(0, 10) !== value) return null
  return timestamp / DAY_MS
}

function milestoneDay(project: Project): number | null {
  return project.date.precision === "day" ? calendarDay(project.date.value) : null
}

function constructionWindow(project: Project): [number, number] | null {
  if (project.buildWindow === null) return null
  const start = calendarDay(project.buildWindow.start)
  const end = calendarDay(project.buildWindow.end)
  return start !== null && end !== null && start <= end ? [start, end] : null
}

export interface ProjectTiming {
  dateGapDays: number | null
  timelineRelation: Opportunity["timelineRelation"]
  constructionRelation: "overlap" | "separate" | "unknown"
  reasons: string[]
}

export function compareProjectTiming(left: Project, right: Project): ProjectTiming {
  const leftDay = milestoneDay(left)
  const rightDay = milestoneDay(right)
  const dateGapDays = leftDay === null || rightDay === null ? null : Math.abs(leftDay - rightDay)
  const leftWindow = constructionWindow(left)
  const rightWindow = constructionWindow(right)
  const constructionRelation = leftWindow === null || rightWindow === null ? "unknown"
    : Math.max(leftWindow[0], rightWindow[0]) <= Math.min(leftWindow[1], rightWindow[1])
      ? "overlap" : "separate"

  let timelineRelation: Opportunity["timelineRelation"] = "unknown"
  if (constructionRelation === "overlap") timelineRelation = "confirmed-overlap"
  else if (constructionRelation === "separate") timelineRelation = "separate"
  else if (dateGapDays !== null) timelineRelation = dateGapDays <= DATE_PROXIMITY_DAYS ? "date-proximity" : "separate"

  const reasons = [dateGapDays === null
    ? "Milestone separation is unknown: both source dates must have valid day precision."
    : `${dateGapDays} calendar days between source milestones (${left.date.label}; ${right.date.label}).`]
  reasons.push(constructionRelation === "overlap"
    ? "Explicit source construction windows intersect; this does not establish a shared corridor."
    : constructionRelation === "separate"
      ? "Explicit source construction windows do not intersect."
      : "Construction overlap is unknown: two explicit construction windows are not available.")
  if (dateGapDays !== null) reasons.push("Milestone date proximity is context, not evidence of simultaneous construction.")
  return { dateGapDays, timelineRelation, constructionRelation, reasons }
}
