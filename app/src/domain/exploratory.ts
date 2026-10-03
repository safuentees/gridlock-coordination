import type { GeographicRepresentation } from "./geography"
import type { Project } from "./schema"
import type { compareProjectTiming } from "../core/timing"

/** Transient exploration results, kept separate from strict candidates and saved benefit claims. */
export type ExploratoryRelation = "point-distance" | "endpoint-distance" | "extent-overlap" | "within-extent"
export type ExploratoryOwnership = "same-evidenced-owner" | "distinct-evidenced-owners" | "unknown"
export interface ExploratoryMatch {
  projectId: string
  relation: ExploratoryRelation
  distanceMiles: number | null
  ownership: ExploratoryOwnership
  timing: ReturnType<typeof compareProjectTiming>
  limitations: string[]
}
export interface ExploratoryAnalysis {
  selectedProjectId: string
  radiusMiles: number
  representation: GeographicRepresentation | null
  matches: ExploratoryMatch[]
  representedProjects: number
  unresolvedProjects: number
  reason: string | null
}
export interface ExploratoryResultsProps {
  projects: readonly Project[]
  result: ExploratoryAnalysis | null
  onProject: (id: string) => void
}
