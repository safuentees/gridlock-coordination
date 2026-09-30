import { DEFAULT_OPTIONS } from "../domain/schema"
import type { AnalysisOptions, AnalysisResult, Opportunity, Project } from "../domain/schema"
import { hasUsableCoordinates, haversineMiles } from "./geography"
import { compareProjectTiming } from "./timing"

export { haversineMiles } from "./geography"
export { compareProjectTiming, DATE_PROXIMITY_DAYS } from "./timing"

function validateOptions(options: AnalysisOptions): void {
  if (!Number.isFinite(options.radiusMiles) || options.radiusMiles <= 0) {
    throw new RangeError("Radius must be a finite number greater than zero.")
  }
  if (options.maxDateGapDays !== null
    && (!Number.isFinite(options.maxDateGapDays) || options.maxDateGapDays < 0)) {
    throw new RangeError("Maximum milestone separation must be null or a finite nonnegative number of days.")
  }
}

function compareIds(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0
}

/** Analyze cross-filing center proximity. All filters use full precision, never display rounding. */
export function analyzeProjects(projects: Project[], options: AnalysisOptions = DEFAULT_OPTIONS): AnalysisResult {
  validateOptions(options)
  if (new Set(projects.map((project) => project.id)).size !== projects.length) {
    throw new Error("Project IDs must be unique before matching.")
  }
  const located = projects.filter((project): project is Project & { location: NonNullable<Project["location"]> } =>
    hasUsableCoordinates(project.location))
  const summary: AnalysisResult["summary"] = {
    totalProjects: projects.length,
    locatedProjects: located.length,
    unlocatedProjects: projects.length - located.length,
    // Both counters refer to cross-filing pairs, not individual projects.
    comparedPairs: 0,
    excludedUnverified: 0,
  }
  const opportunities: Opportunity[] = []
  for (let first = 0; first < located.length; first += 1) {
    for (let second = first + 1; second < located.length; second += 1) {
      const pair = [located[first], located[second]].sort((left, right) => compareIds(left.id, right.id))
      const [left, right] = pair
      if (left.utilityId === right.utilityId) continue
      summary.comparedPairs += 1
      const locationConfidence = left.location.confidence === "confirmed" && right.location.confidence === "confirmed"
        ? "confirmed" : "unverified"
      if (!options.includeUnverified && locationConfidence === "unverified") {
        summary.excludedUnverified += 1
        continue
      }
      const distanceMiles = haversineMiles(left.location, right.location)
      if (distanceMiles >= options.radiusMiles) continue
      const timing = compareProjectTiming(left, right)
      if (options.maxDateGapDays !== null
        && (timing.dateGapDays === null || timing.dateGapDays > options.maxDateGapDays)) continue
      opportunities.push({
        id: `pair:${encodeURIComponent(left.id)}|${encodeURIComponent(right.id)}`,
        projectIds: [left.id, right.id], distanceMiles,
        dateGapDays: timing.dateGapDays, timelineRelation: timing.timelineRelation,
        locationConfidence, rank: 0,
        reasons: [
          `Project centers are ${distanceMiles.toFixed(2)} straight-line miles apart, within the strict ${options.radiusMiles}-mile radius.`,
          "Projects belong to different reporting filings; their asset sponsors may differ from the filing utilities.",
          locationConfidence === "unverified"
            ? "At least one center is unverified supplied location evidence."
            : "Both centers are marked confirmed in the supplied records.",
          ...timing.reasons,
        ],
      })
    }
  }
  opportunities.sort((left, right) => {
    if (left.distanceMiles !== right.distanceMiles) return left.distanceMiles - right.distanceMiles
    if (left.dateGapDays !== right.dateGapDays) {
      if (left.dateGapDays === null) return 1
      if (right.dateGapDays === null) return -1
      return left.dateGapDays - right.dateGapDays
    }
    return compareIds(left.id, right.id)
  })
  opportunities.forEach((opportunity, index) => { opportunity.rank = index + 1 })
  return { opportunities, summary }
}
