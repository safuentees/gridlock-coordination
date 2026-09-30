import { DEFAULT_OPTIONS } from "../domain/schema"
import type { AnalysisOptions, AnalysisResult, Opportunity, Project } from "../domain/schema"
import { hasUsableCoordinates, haversineMiles } from "./geography"
import { compareProjectTiming } from "./timing"
import { pairEligibility, projectEligibility } from "./eligibility"

export { haversineMiles } from "./geography"
export { pairEligibility, projectEligibility } from "./eligibility"
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

/** Analyze eligible project-center proximity. All filters use full precision, never display rounding. */
export function analyzeProjects(projects: Project[], options: AnalysisOptions = DEFAULT_OPTIONS): AnalysisResult {
  validateOptions(options)
  if (new Set(projects.map((project) => project.id)).size !== projects.length) {
    throw new Error("Project IDs must be unique before matching.")
  }
  const located = projects.filter((project): project is Project & { location: NonNullable<Project["location"]> } =>
    hasUsableCoordinates(project.location))
  const eligible = located.filter(project => projectEligibility(project).eligible)
  const summary: AnalysisResult["summary"] = {
    totalProjects: projects.length,
    locatedProjects: located.length,
    unlocatedProjects: projects.length - located.length,
    eligibleProjects: eligible.length,
    excludedByEligibility: projects.length - eligible.length,
    // These counters refer to eligible pairs, not individual projects.
    comparedPairs: 0,
    excludedUnverified: 0,
  }
  const opportunities: Opportunity[] = []
  for (let first = 0; first < eligible.length; first += 1) {
    for (let second = first + 1; second < eligible.length; second += 1) {
      const pair = [eligible[first], eligible[second]].sort((left, right) => compareIds(left.id, right.id))
      const [left, right] = pair
      const eligibility = pairEligibility(left, right)
      if (!eligibility.eligible) continue
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
          ...eligibility.reasons,
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

export { estimateImpact } from "./impact"
