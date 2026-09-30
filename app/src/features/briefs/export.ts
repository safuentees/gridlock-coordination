import { estimateImpact } from "@/core"
import { UTILITIES, type DataMode, type ImpactResult, type Project, type SourceRef } from "@/domain/schema"
import { dateKind, projectDate, timelineLabels } from "@/features/explorer/format"
import { investigationSchema, type Investigation, type SavedOpportunity } from "./storage"

export const BRIEF_CAVEATS = [
  "Candidates compare different reporting filings; the asset sponsor is preserved separately and may differ from the filing utility.",
  "Distances are straight-line distances between project centers, not shared routes or rights-of-way. Proximity does not establish engineering feasibility.",
  "Need and planned in-service dates are milestones. Date separation does not establish simultaneous construction; only explicit construction windows support construction-overlap claims.",
  "Source snapshots are historical planning evidence, not live schedules. Past milestones do not establish completed work.",
  "Saved evidence and scenario settings are snapshots. Missing or revised current records do not automatically update a saved pair.",
]
function sourceText(source: SourceRef) { return `${source.file}; ${source.locator}${source.url ? `; ${source.url}` : ""}` }
function projectText(project: Project) {
  return [
    `Project: ${project.name}`, `Stable ID: ${project.id}`, `Source ID: ${project.sourceId ?? "Unknown"}`,
    `Reporting filing: ${UTILITIES[project.utilityId]}`, `Listed sponsor: ${project.sponsor ?? "Unknown"}`,
    `Description: ${project.description || "Unknown"}`, `Status: ${project.status ?? "Unknown"}`,
    `Voltage: ${project.voltageKv.length ? `${project.voltageKv.join(" / ")} kV` : "Unknown"}`,
    `${dateKind(project)}: ${projectDate(project)}`, `Source date label: ${project.date.label}`,
    `Explicit construction window: ${project.buildWindow ? `${project.buildWindow.start} through ${project.buildWindow.end}` : "Unknown"}`,
    `Location: ${project.location ? `${project.location.lat}, ${project.location.lon}; ${project.location.method}; ${project.location.confidence}` : "Unknown"}`,
    ...project.sources.map((source) => `Project source: ${sourceText(source)}`),
    ...(project.location?.evidence.map((source) => `Location source: ${sourceText(source)}`) ?? []),
    ...project.notes.map((note) => `Source note: ${note}`),
  ].join("\n")
}
const resourceLabels: Record<Investigation["resource"], string> = {
  unspecified: "Unspecified",
  "right-of-way": "Right-of-way",
  "crews-equipment": "Crews and equipment",
  "substation-capacity": "Substation capacity",
  other: "Other",
}
function deriveHypotheticalImpact(record: SavedOpportunity): ImpactResult | undefined {
  const parsed = investigationSchema.safeParse(record.investigation)
  return parsed.success && parsed.data.impactInputs ? estimateImpact(parsed.data.impactInputs) : undefined
}
function investigationText(record: ReturnType<typeof createBrief>["opportunities"][number]): string[] {
  const investigation = record.investigation
  if (!investigation) return []
  return [
    ...(investigation.resource !== "unspecified" ? [`Resource to investigate: ${resourceLabels[investigation.resource]}`] : []),
    ...(investigation.objective.trim() ? [`Investigation objective: ${investigation.objective}`] : []),
    ...(investigation.nextAction.trim() ? [`Next action: ${investigation.nextAction}`] : []),
    ...(investigation.owner.trim() ? [`Analyst / owner: ${investigation.owner}`] : []),
    ...(record.hypotheticalImpact ? [
      `Hypothetical shared corridor area: ${record.hypotheticalImpact.sharedAcres.toFixed(2)} acres`,
      `Hypothetical avoided land cost: $${record.hypotheticalImpact.indicativeSavingsUsd.toFixed(2)} USD`,
      ...record.hypotheticalImpact.assumptions.map((assumption) => `Impact assumption: ${assumption}`),
    ] : []),
  ]
}
export function createBrief(records: SavedOpportunity[], mode: DataMode, availability: Record<string, string>) {
  return {
    format: "gridlock-coordination-brief", version: 1, exportedAt: new Date().toISOString(), mode,
    label: mode === "demo" ? "SYNTHETIC DEMONSTRATION — NOT A UTILITY PLAN" : "Source-backed coordination investigation",
    caveats: BRIEF_CAVEATS,
    opportunities: records.map((record) => ({
      ...record,
      hypotheticalImpact: deriveHypotheticalImpact(record),
      currentAvailability: availability[record.id] ?? "Current availability unknown",
    })),
  }
}
export function briefText(brief: ReturnType<typeof createBrief>) {
  return [
    "GRIDLOCK COORDINATION BRIEF", brief.label, `Exported: ${brief.exportedAt}`, `Saved opportunities: ${brief.opportunities.length}`, "",
    ...brief.opportunities.flatMap((record, index) => [
      `OPPORTUNITY ${index + 1}: ${record.projects[0].name} / ${record.projects[1].name}`,
      `Pair ID: ${record.id}`, `Review: ${record.reviewState}`, `Review notes: ${record.notes || "None recorded"}`,
      ...investigationText(record),
      `Dataset: ${record.dataset.title}; snapshot ${record.dataset.generatedAt}`, `Saved: ${record.savedAt}; last updated ${record.updatedAt}`,
      `Current availability: ${record.currentAvailability}`, `Saved rank: ${record.opportunity.rank}`,
      `Center distance: ${record.opportunity.distanceMiles.toFixed(2)} statute miles`,
      `Milestone separation: ${record.opportunity.dateGapDays === null ? "Unknown" : `${record.opportunity.dateGapDays} days`}`,
      `Timing context: ${timelineLabels[record.opportunity.timelineRelation]}`, `Location confidence: ${record.opportunity.locationConfidence}`,
      `Scenario: distance strictly under ${record.options.radiusMiles} miles; ${record.options.maxDateGapDays === null ? "no milestone-gap exclusion" : `milestone separation at most ${record.options.maxDateGapDays} days; partial or unknown dates excluded`}; ${record.options.includeUnverified ? "unverified locations included" : "confirmed locations required for both projects"}`,
      ...record.opportunity.reasons.map((reason) => `Analysis: ${reason}`), "", projectText(record.projects[0]), "", projectText(record.projects[1]), "",
    ]),
    "ASSUMPTIONS AND LIMITATIONS", ...brief.caveats.map((caveat) => `- ${caveat}`), "",
  ].join("\n")
}
export function downloadBrief(contents: string, mode: DataMode, format: "txt" | "json") {
  const url = URL.createObjectURL(new Blob([contents], { type: format === "json" ? "application/json;charset=utf-8" : "text/plain;charset=utf-8" }))
  const link = document.createElement("a")
  link.href = url
  link.download = `gridlock-${mode}-coordination-brief-${new Date().toISOString().slice(0, 10)}.${format}`
  document.body.appendChild(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
