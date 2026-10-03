import type { GeographicStatus } from "./geography"

export const GEOGRAPHIC_REPRESENTATION_GROUPS = ["source-point", "facility", "approximate-point", "endpoints", "town-area", "county-area", "state-region-area"] as const
export type GeographicRepresentationGroup = typeof GEOGRAPHIC_REPRESENTATION_GROUPS[number]
export interface GeographicCoverageCounts {
  total: number
  statuses: Record<GeographicStatus, number>
  representations: Record<GeographicRepresentationGroup, number>
  needsReview: number
}
export interface GeographicCoverageReport extends GeographicCoverageCounts {
  sources: (GeographicCoverageCounts & { sourceKey: string; projectIds: string[]; editions: string[] })[]
}
