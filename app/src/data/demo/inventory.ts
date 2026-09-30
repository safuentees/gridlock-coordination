import type { InventoryMetadata, SourceEdition } from "@/domain/coverage"
import type { Dataset, Project, SourceRef } from "@/domain/schema"

// Consumer fixture only: no real source records, identifiers or ownership claims.
const groups = [
  { key: "demo-north", name: "North Range filing (synthetic)", owner: "North Range Transmission (synthetic)", lat: 36.4, lon: -81.2 },
  { key: "demo-coast", name: "Coastal Plain filing (synthetic)", owner: "Coastal Plain Grid (synthetic)", lat: 34.3, lon: -78.6 },
  { key: "demo-valley", name: "River Valley filing (synthetic)", owner: "River Valley Power (synthetic)", lat: 37.1, lon: -83.1 },
] as const
const editionId = "2026-06-01"
const stations = ["Cedar Ridge", "East Junction", "Oak Creek", "Northgate", "Willow Bend", "Mill Pond", "Pine Hill", "West Fork", "High Meadow", "Southfield"]
const workTypes = ["substation expansion", "tower replacement", "line reconductor", "transformer addition", "line rebuild"]
const lifecycle: InventoryMetadata["lifecycle"][] = ["planned", "approved", "under-construction", "planned", "on-hold", "unknown", "approved", "in-service", "cancelled", "planned"]

function createProject(group: typeof groups[number], index: number): Project {
  const sourceId = `SP-${String(index + 1).padStart(3, "0")}`
  const evidence: SourceRef = { file: `${group.key}-synthetic-inventory.json`, locator: `Synthetic record ${sourceId}; coordinates, status and owner scenario`, url: null }
  const nearBoundary = index < 8
  const lat = Number(((nearBoundary ? 35.3 : group.lat) + ((index * 17) % 37) / 100).toFixed(4))
  const lon = Number(((nearBoundary ? -80.7 : group.lon) + ((index * 23) % 41) / 100).toFixed(4))
  const shape = index % 12
  const unresolved = shape === 8 || shape === 9 || shape === 10
  const role: InventoryMetadata["centerRole"] = unresolved ? "unknown" : shape === 6 ? "general-pin" : shape === 7 ? "permit-area" : shape === 2 ? "endpoint-midpoint" : shape === 3 ? "single-endpoint" : shape === 1 ? "tower-location" : "substation-center"
  const positions: [number, number][] = shape === 2
    ? [[lon - 0.02, lat - 0.02], [lon + 0.02, lat + 0.02]]
    : shape === 8 || shape === 9 ? [[lon, lat], [lon + 0.03, lat + 0.02], [lon - 0.01, lat + 0.04]] : [[lon, lat]]
  const precision = index % 13 === 0 ? "unknown" : index % 11 === 0 ? "year" : index % 7 === 0 ? "month" : "day"
  const year = String(2025 + index % 7)
  const month = String(1 + index % 12).padStart(2, "0")
  const value = precision === "unknown" ? null : precision === "year" ? year : precision === "month" ? `${year}-${month}` : `${year}-${month}-15`
  const state = lifecycle[index % lifecycle.length]
  const work = workTypes[index % workTypes.length]
  const voltage = [115, 230, 345, 500][index % 4]
  const assumptions = ["Synthetic coordinates and evidence; this record is not a utility plan."]
  if (shape === 2) assumptions.push("Displayed center is the arithmetic midpoint of two synthetic endpoints.")
  if (shape === 3) assumptions.push("Only one synthetic line endpoint is known; it does not establish the route center.")
  if (shape === 8 || shape === 9) assumptions.push("Multiple synthetic positions have no qualified center; map location remains unknown.")
  return {
    id: `${group.key}:${sourceId}`, utilityId: group.key, sourceId,
    name: `${stations[index % stations.length]} ${voltage} kV ${work} ${Math.floor(index / stations.length) + 1} (synthetic)`,
    description: `Synthetic ${work} scenario for ${index % 2 ? "load growth" : "asset renewal"}.`,
    sponsor: null, status: state === "unknown" ? null : `${state.replaceAll("-", " ")} (synthetic source)`, voltageKv: [voltage],
    date: { value, precision, kind: "in-service", label: "Reported projected or actual in-service date (synthetic)" },
    buildWindow: index % 19 === 1 ? { start: `${year}-02-01`, end: `${year}-11-30` } : null,
    location: unresolved ? null : { lat, lon, method: shape === 2 ? "endpoint-midpoint" : shape === 3 ? "single-endpoint" : "source-point", confidence: index % 5 === 0 ? "confirmed" : "unverified", evidence: [evidence] },
    sources: [evidence], notes: [],
    inventory: {
      sourceKey: group.key, editionId, editionLabel: `${group.name}; June 2026 synthetic edition`, reportingGroupName: group.name,
      recordKind: index % 17 === 0 ? "capital-project-context" : "transmission-project", lifecycle: state, lifecycleAsOf: editionId,
      owner: index % 4 === 0 ? null : { id: `${group.key}-owner`, name: group.owner, identityScope: "global", evidence: [evidence] },
      parentProgramId: `PB-${String(1 + Math.floor(index / 10)).padStart(2, "0")}`, aliases: index % 3 === 0 ? [`SYN-WO-${index + 1000}`] : [],
      workType: work, constructionStart: index % 6 === 1 ? `${year}-02-01` : null,
      nativeGeometry: shape === 10 ? null : {
        type: positions.length === 1 ? "Point" : "MultiPoint", coordinates: positions,
        role: shape === 2 || shape === 3 ? "line-endpoints" : unresolved ? "multiple-locations" : role === "endpoint-midpoint" || role === "single-endpoint" ? "unknown" : role,
        crs: index % 3 === 0 ? null : "WGS84 (synthetic)", accuracyMeters: index % 5 === 0 ? 25 : null,
        rawLatitude: positions.map(position => String(position[1])).join("; "), rawLongitude: positions.map(position => String(position[0])).join("; "), evidence: [evidence],
      },
      centerRole: role, locationAssumptions: assumptions,
    },
  }
}

function createUnlocatedProject(group: typeof groups[number], index: number): Project {
  const sourceId = `UG-${String(index + 1).padStart(4, "0")}`
  const evidence: SourceRef = { file: `${group.key}-synthetic-inventory.json`, locator: `Synthetic upgrade ${sourceId}; source context and milestone scenario`, url: null }
  const station = stations[index % stations.length]
  const work = workTypes[index % workTypes.length]
  const year = String(2027 + index % 8)
  const month = String(1 + index % 12).padStart(2, "0")
  const precision = index % 13 === 0 ? "unknown" : index % 9 === 0 ? "year" : index % 5 === 0 ? "month" : "day"
  const value = precision === "unknown" ? null : precision === "year" ? year : precision === "month" ? `${year}-${month}` : `${year}-${month}-15`
  const needDate = index % 4 === 0
  const date: Project["date"] = { value, precision, kind: needDate ? "need" : "in-service", label: needDate ? "Required need date (synthetic)" : "Projected in-service date (synthetic)" }
  const state: InventoryMetadata["lifecycle"] = ["planned", "approved", "under-construction", "planned", "on-hold", "unknown"][index % 6] as InventoryMetadata["lifecycle"]
  const milestones: NonNullable<InventoryMetadata["milestones"]> = [{ field: needDate ? "RequiredNeedDate" : "ProjectedInServiceDate", date, evidence: [evidence] }]
  if (index % 3 === 0) milestones.push({ field: "BoardApprovalDate", date: { value: `2026-${String(1 + index % 5).padStart(2, "0")}`, precision: "month", kind: "unknown", label: "Board approval date (synthetic)" }, evidence: [evidence] })
  if (index % 6 === 2) milestones.push({ field: "PartialInServiceDate", date: { value: "2026-05-15", precision: "day", kind: "in-service", label: "Partial in-service date (synthetic)" }, evidence: [evidence] })
  return {
    id: `${group.key}:${sourceId}`, utilityId: group.key, sourceId,
    name: `${station} ${work} upgrade ${index + 1} (synthetic)`,
    description: `Synthetic ${work} for ${index % 2 ? "growing regional load and contingency performance" : "aging equipment replacement and local reliability"}. ${index % 3 ? "The source describes an upgrade without a mapped site." : "Scope includes protection changes and associated station work; the precise site is unresolved."}`,
    sponsor: null, status: state === "unknown" ? null : `${state.replaceAll("-", " ")} (synthetic source)`,
    voltageKv: index % 11 === 0 ? [] : [[115, 230, 345, 500][index % 4]],
    date, buildWindow: null, location: null, sources: [evidence], notes: [],
    inventory: {
      sourceKey: group.key, editionId, editionLabel: `${group.name}; June 2026 synthetic edition`, reportingGroupName: group.name,
      recordKind: index % 29 === 0 ? "capital-project-context" : "transmission-project",
      recordUnit: index % 11 === 0 ? "component" : "upgrade", lifecycle: state, lifecycleAsOf: editionId,
      lifecycleDateMeaning: index % 2 ? "snapshot-observed" : "source-edition",
      owner: index % 5 === 0 ? null : { id: `${group.key}-owner`, name: group.owner, identityScope: "global", evidence: [evidence] },
      sourceState: ["Virginia (synthetic)", "North Carolina (synthetic)", "West Virginia (synthetic)", null][index % 4],
      sourceLocation: index % 7 === 0 ? null : index % 2 ? `${station} service area (synthetic); site unresolved` : `Between ${station} and ${stations[(index + 3) % stations.length]} (synthetic corridor description)`,
      sourceUpdatedOn: index % 8 === 0 ? null : `2026-${String(1 + index % 5).padStart(2, "0")}-${String(1 + index % 27).padStart(2, "0")}`,
      milestones, parentProgramId: null, aliases: index % 3 === 0 ? [`SYN-WO-U-${index + 1}`] : [],
      workType: work, constructionStart: null, nativeGeometry: null, centerRole: "unknown",
      locationAssumptions: ["No coordinates supplied in this synthetic source; location text does not establish a mapped center."],
    },
  }
}

// Keep the existing 300 snapshots and their order intact; append unlocated scale records.
const projects = [
  ...groups.flatMap(group => Array.from({ length: 100 }, (_, index) => createProject(group, index))),
  ...groups.flatMap(group => Array.from({ length: 1800 }, (_, index) => createUnlocatedProject(group, index))),
]
const sourceEditions: SourceEdition[] = groups.map(group => {
  const records = projects.filter(project => project.utilityId === group.key)
  return {
    sourceKey: group.key, editionId, label: `${group.name}; June 2026 synthetic edition`, reportingGroupId: group.key, reportingGroupName: group.name,
    publisher: "Synthetic fixture publisher", processAuthority: null, publishedOn: editionId, retrievedOn: editionId,
    source: { file: `${group.key}-synthetic-inventory.json`, locator: `All ${records.length} synthetic records`, url: null },
    sha256: "0".repeat(64), geographicScope: "Fictional regional portfolio; not evidence of geographic coverage", inventoryScope: "Synthetic transmission and capital-context records", scope: "full",
    counts: { sourceRows: records.length, importedRecords: records.length, excludedRows: 0, failedRows: 0, pendingRows: 0, locatedRecords: records.filter(project => project.location !== null).length },
    exclusions: [], limitations: ["All identities, dates, ownership evidence and positions are synthetic. The zero digest is a fixture sentinel, not a source-file hash."],
  }
})

export const inventoryDemoDataset: Dataset = {
  schemaVersion: 2, mode: "demo", title: `${projects.length} synthetic source-qualified inventory records`, generatedAt: "2026-09-30",
  projects, sourceEditions,
  coverage: { processed: projects.length, skipped: 0, failed: 0, notes: ["Deterministic consumer fixture with three additional reporting groups; separate from real source data."] },
}
