import type { GeographicCoverageCounts, GeographicCoverageReport, GeographicRepresentationGroup } from "@/domain/geographic-coverage"
import { GEOGRAPHIC_STATUSES, type GeographicRecord, type GeographicRun, type GeographicStatus } from "@/domain/geography"
import type { Project } from "@/domain/schema"
import { geographicCoverage } from "./pipeline"

type SourceCoverage = GeographicCoverageReport["sources"][number]
const compareText = (left: string, right: string): number => left < right ? -1 : left > right ? 1 : 0

function emptyCounts(): GeographicCoverageCounts {
  return {
    total: 0,
    statuses: { located: 0, approximate: 0, ambiguous: 0, unsupported: 0, "not-processed": 0 },
    representations: { "source-point": 0, facility: 0, "approximate-point": 0, endpoints: 0, "town-area": 0, "county-area": 0, "state-region-area": 0 },
    needsReview: 0,
  }
}

function representationGroup(record: GeographicRecord | undefined, status: GeographicStatus): GeographicRepresentationGroup | null {
  const representation = record?.representation
  if (!representation || (status !== "located" && status !== "approximate")) return null
  if (representation.kind === "endpoints") return "endpoints"
  if (representation.kind === "area") return representation.precision === "town" ? "town-area" : representation.precision === "county" ? "county-area" : "state-region-area"
  if (status === "located" && representation.method === "source-point") return "source-point"
  return representation.method === "matched-facility" && representation.precision === "facility" ? "facility" : "approximate-point"
}

/** Account for current identities only, using the pipeline's existing fingerprint/status policy. */
export function getGeographicCoverageReport(run: GeographicRun | null, projects: readonly Project[]): GeographicCoverageReport {
  const report: GeographicCoverageReport = { ...emptyCounts(), sources: [] }
  const records = new Map(run?.records.map(record => [record.projectId, record]) ?? [])
  const sources = new Map<string, SourceCoverage>(), seen = new Set<string>()
  for (const project of projects) {
    if (seen.has(project.id)) continue
    seen.add(project.id)
    const sourceKey = project.inventory?.sourceKey ?? project.utilityId
    let source = sources.get(sourceKey)
    if (!source) {
      source = { ...emptyCounts(), sourceKey, projectIds: [], editions: [] }
      sources.set(sourceKey, source)
    }
    source.projectIds.push(project.id)
    const edition = project.inventory?.editionLabel
    if (edition && !source.editions.includes(edition)) source.editions.push(edition)
    const record = records.get(project.id)
    // One-record slices reuse the authority without rebuilding a full run map for every row.
    // Cold/changed objects therefore remain not-processed exactly like the primary totals.
    const statusCounts = geographicCoverage(run && record ? { ...run, records: [record] } : null, [project])
    const status = GEOGRAPHIC_STATUSES.find(value => statusCounts[value] === 1) ?? "not-processed"
    const group = representationGroup(record, status)
    const needsReview = Boolean(record?.review && record.review.basedOnFingerprint !== record.inputFingerprint)
    for (const counts of [report, source]) {
      counts.total += 1
      counts.statuses[status] += 1
      if (group) counts.representations[group] += 1
      if (needsReview) counts.needsReview += 1
    }
  }
  report.sources = [...sources.values()].sort((left, right) => compareText(left.sourceKey, right.sourceKey)).map(source => ({
    ...source, projectIds: source.projectIds.sort(compareText), editions: source.editions.sort(compareText),
  }))
  return report
}
