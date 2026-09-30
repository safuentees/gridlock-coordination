import { estimateImpact } from "@/core"
import type { DataMode, ImpactResult, Project, SourceRef } from "@/domain/schema"
import type { SourceEdition } from "@/domain/coverage"
import { reportingGroupLabel } from "@/lib/reporting-groups"
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
    `Project: ${project.name}`, `Stable ID: ${project.id}`, `${project.inventory?.identityBasis === "source-locator" ? "Source-record locator" : "Source ID"}: ${project.sourceId ?? "Unknown"}`,
    `Reporting filing: ${reportingGroupLabel(project)}`, `Listed sponsor: ${project.sponsor ?? "Unknown"}`,
    `Description: ${project.description || "Unknown"}`, `Status: ${project.status ?? "Unknown"}`,
    `Voltage: ${project.voltageKv.length ? `${project.voltageKv.join(" / ")} kV` : "Unknown"}`,
    `${dateKind(project)}: ${projectDate(project)}`, `Source date label: ${project.date.label}`,
    `Explicit construction window: ${project.buildWindow ? `${project.buildWindow.start} through ${project.buildWindow.end}` : "Unknown"}`,
    `Location: ${project.location ? `${project.location.lat}, ${project.location.lon}; ${project.location.method}; ${project.location.confidence}` : "Unknown"}`,
    ...inventoryText(project),
    ...project.sources.map((source) => `Project source: ${sourceText(source)}`),
    ...(project.location?.evidence.map((source) => `Location source: ${sourceText(source)}`) ?? []),
    ...project.notes.map((note) => `Source note: ${note}`),
  ].join("\n")
}
function inventoryText(project: Project): string[] {
  const inventory = project.inventory
  if (!inventory) return []
  const geometry = inventory.nativeGeometry
  return [
    `Source inventory: ${inventory.sourceKey}; edition ${inventory.editionId} (${inventory.editionLabel})`,
    `Record kind: ${inventory.recordKind}; lifecycle: ${inventory.lifecycle}`,
    ...(inventory.recordUnit ? [`Source record unit: ${inventory.recordUnit}`] : []),
    ...(inventory.identityBasis ? [`Source identity basis: ${inventory.identityBasis}${inventory.identityBasis === "source-locator" ? "; a reproducible source-record reference, not a native engineering project ID. Future editions require explicit identity review." : ""}`] : []),
    `Lifecycle date: ${inventory.lifecycleAsOf}; ${inventory.lifecycleDateMeaning === "snapshot-observed" ? "observed in the retrieved snapshot, not a status-change date" : inventory.lifecycleDateMeaning === "source-edition" ? "as of the source edition" : "date meaning not supplied"}`,
    ...(inventory.sourceState !== undefined ? [`Source state text: ${inventory.sourceState ?? "Unknown"}`] : []),
    ...(inventory.sourceLocation !== undefined ? [`Source location text: ${inventory.sourceLocation ?? "Unknown"}; this text does not establish coordinates`] : []),
    ...(inventory.sourceUpdatedOn !== undefined ? [`Source row updated: ${inventory.sourceUpdatedOn ?? "Unknown"}; not a status-change date`] : []),
    `Evidenced asset owner: ${inventory.owner ? `${inventory.owner.name} (${inventory.owner.id})` : "Unknown"}`,
    ...(inventory.owner ? [`Owner identity scope: ${inventory.owner.identityScope ?? "unspecified (treated as source-scoped)"}`] : []),
    ...(inventory.owner?.evidence.map(source => `Owner evidence: ${sourceText(source)}`) ?? []),
    ...(inventory.parentProgramId ? [`Parent program: ${inventory.parentProgramId}`] : []),
    ...(inventory.aliases.length ? [`Source aliases: ${inventory.aliases.join("; ")}`] : []),
    ...(inventory.workType ? [`Source work type: ${inventory.workType}`] : []),
    ...(inventory.milestones?.flatMap(milestone => [
      `Reported milestone: ${milestone.date.label}; value: ${milestone.date.value ?? "Unknown"}; precision: ${milestone.date.precision}; kind: ${milestone.date.kind}; source field: ${milestone.field}`,
      ...milestone.evidence.map(source => `Milestone evidence: ${sourceText(source)}`),
    ]) ?? []),
    `Reported construction start: ${inventory.constructionStart ?? "Unknown"}; this does not establish a construction window`,
    `Displayed location role: ${inventory.centerRole}`,
    ...inventory.locationAssumptions.map(assumption => `Location assumption: ${assumption}`),
    ...(geometry ? [
      `Native geometry: ${geometry.type}; role: ${geometry.role}; longitude/latitude positions: ${JSON.stringify(geometry.coordinates)}`,
      `Published latitude: ${geometry.rawLatitude ?? "Unknown"}; published longitude: ${geometry.rawLongitude ?? "Unknown"}`,
      `Source CRS: ${geometry.crs ?? "Unknown"}; stated accuracy: ${geometry.accuracyMeters === null ? "Unknown" : `${geometry.accuracyMeters} meters`}`,
      ...geometry.evidence.map(source => `Native geometry source: ${sourceText(source)}`),
    ] : ["Native geometry: Unknown"]),
  ]
}
function sourceEditionText(edition: SourceEdition): string[] {
  return [
    `Source edition: ${edition.sourceKey}:${edition.editionId}; ${edition.label}`,
    `Publisher: ${edition.publisher}; process authority: ${edition.processAuthority ?? "Unknown"}; neither establishes asset ownership`,
    `Published: ${edition.publishedOn ?? "Unknown"}; retrieved: ${edition.retrievedOn}`,
    `Geographic scope: ${edition.geographicScope}`,
    `Inventory scope: ${edition.inventoryScope}; import scope: ${edition.scope}`,
    `Source import snapshot: ${edition.counts.importedRecords} imported, ${edition.counts.locatedRecords} located, ${edition.counts.excludedRows} excluded, ${edition.counts.pendingRows} pending, ${edition.counts.failedRows} failed of ${edition.counts.sourceRows} source rows`,
    `Edition source: ${sourceText(edition.source)}`,
    ...edition.limitations.map(limitation => `Source limitation: ${limitation}`),
  ]
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
    caveats: records.some(record => record.projects.some(project => project.inventory)) ? [
      "Legacy candidates compare reporting filings without asserting distinct owners; candidates involving source-qualified inventory require evidenced, distinct asset-owner identities. Comparisons across different inventories also require globally scoped owner identities.",
      ...BRIEF_CAVEATS.slice(1),
    ] : BRIEF_CAVEATS,
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
      ...(record.dataset.sourceEditions?.flatMap(sourceEditionText) ?? []),
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
