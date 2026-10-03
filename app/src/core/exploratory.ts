import type { ExploratoryAnalysis, ExploratoryMatch, ExploratoryOwnership, ExploratoryRelation } from "../domain/exploratory"
import { geographicRecordSchema, type GeographicRecord, type GeographicRepresentation } from "../domain/geography"
import type { Project } from "../domain/schema"
import { haversineMiles } from "./geography"
import { compareProjectTiming } from "./timing"

type Position = [number, number]
type Area = Extract<GeographicRepresentation, { kind: "area" }>
type RepresentedRecord = GeographicRecord & { representation: GeographicRepresentation }
type Relation = { relation: ExploratoryRelation; distanceMiles: number | null; limitation: string }
const compareIds = (left: string, right: string): number => left < right ? -1 : left > right ? 1 : 0

function positions(representation: Exclude<GeographicRepresentation, Area>): Position[] {
  return representation.kind === "point" ? [representation.position] : representation.positions
}

function contains(area: Area, [longitude, latitude]: Position): boolean {
  const [west, south, east, north] = area.bounds
  return longitude >= west && longitude <= east && latitude >= south && latitude <= north
}

function relationBetween(left: GeographicRepresentation, right: GeographicRepresentation, radiusMiles: number): Relation | null {
  if (left.kind === "area" && right.kind === "area") {
    const [westA, southA, eastA, northA] = left.bounds, [westB, southB, eastB, northB] = right.bounds
    if (westA > eastB || westB > eastA || southA > northB || southB > northA) return null
    return {
      relation: "extent-overlap", distanceMiles: null,
      limitation: "Geographic bounding extents intersect or touch. They are not project boundaries; no project separation is known and the radius does not qualify this overlap.",
    }
  }
  if (left.kind === "area" || right.kind === "area") {
    const area = left.kind === "area" ? left : right as Area
    const other = left.kind === "area" ? right : left
    if (other.kind === "area") return null
    const samples = positions(other), inside = samples.filter(position => contains(area, position)).length
    if (!inside) return null
    return {
      relation: "within-extent", distanceMiles: null,
      limitation: other.kind === "endpoints"
        ? `${inside} of ${samples.length} supplied endpoint positions lie within or on the geographic bounding extent. This does not locate the full project or connecting route; the radius does not qualify this context.`
        : "The supplied point lies within or on a geographic bounding extent. This does not establish project overlap or separation; the radius does not qualify this context.",
    }
  }
  let distanceMiles = Infinity
  for (const a of positions(left)) for (const b of positions(right)) {
    distanceMiles = Math.min(distanceMiles, haversineMiles({ lon: a[0], lat: a[1] }, { lon: b[0], lat: b[1] }))
  }
  // Match the authoritative strict boundary using full precision, not displayed rounding.
  if (distanceMiles >= radiusMiles) return null
  const endpoints = left.kind === "endpoints" || right.kind === "endpoints"
  return {
    relation: endpoints ? "endpoint-distance" : "point-distance", distanceMiles,
    limitation: endpoints
      ? "Distance is the minimum separation between supplied point/endpoint samples. It is not route distance, project-center distance or minimum separation between construction footprints."
      : "Distance is a straight-line estimate between the supplied geographic points. Their source precision and confidence remain unchanged; it is not a route or shared-corridor measure.",
  }
}

function citedOwner(project: Project) {
  const owner = project.inventory?.owner
  return owner?.id.trim() && owner.evidence.some(source => source.file.trim() && source.locator.trim()) ? owner : null
}

function ownershipBetween(left: Project, right: Project): { ownership: ExploratoryOwnership; limitation: string } {
  const a = citedOwner(left), b = citedOwner(right)
  if (!a || !b) return {
    ownership: "unknown",
    limitation: "Comparable cited asset-owner identities are not available for both records. Filing, publisher and sponsor labels do not establish either shared or distinct ownership.",
  }
  const sameInventory = left.inventory!.sourceKey === right.inventory!.sourceKey
  const globalIdentities = a.identityScope === "global" && b.identityScope === "global"
  if (!sameInventory && !globalIdentities) return {
    ownership: "unknown",
    limitation: "Owner identities belong to different source inventories and are not both globally scoped. Matching or differing owner tokens do not establish an ownership relationship across these sources.",
  }
  return a.id === b.id
    ? { ownership: "same-evidenced-owner", limitation: `Compatible cited identities name the same owner: ${a.name} (${a.id}). This is ownership context, not a coordination conclusion.` }
    : { ownership: "distinct-evidenced-owners", limitation: `Compatible cited identities distinguish ${a.name} (${a.id}) and ${b.name} (${b.id}). Distinct ownership does not establish coordination feasibility or benefit.` }
}

function recordContext(project: Project, record: RepresentedRecord): string[] {
  const inventory = project.inventory, representation = record.representation
  const context = [
    `${project.name}: ${representation.kind} geography; method ${representation.method}; precision ${representation.precision}; ${representation.accuracyMeters === null ? "numeric accuracy unknown" : `source-stated accuracy ${representation.accuracyMeters} metres`}.`,
    ...representation.limitations.map(limitation => `${project.name}: ${limitation}`),
    inventory
      ? `${project.name}: ${inventory.recordKind}; lifecycle ${inventory.lifecycle} as of ${inventory.lifecycleAsOf}. ${inventory.recordKind !== "transmission-project" ? "This is contextual inventory, not established physical transmission-project scope." : "The source lifecycle is not inferred construction overlap."}`
      : `${project.name}: legacy filing evidence has no typed inventory kind or lifecycle; those facts remain unknown.`,
  ]
  const statement = inventory?.owner?.ownershipStatement
  if (statement) context.push(`${project.name}: owner evidence describes planned asset ownership as of ${statement.asOf}; scope: ${statement.scope}. It does not establish present title.`)
  return context
}

/** The caller supplies only its current, fingerprint-compatible companion run (never a stale run).
 * Matching scans one selection against the collection; it does not enumerate all project pairs.
 */
export function analyzeExploratoryProximity(projects: readonly Project[], records: readonly GeographicRecord[], selectedProjectId: string, radiusMiles: number): ExploratoryAnalysis {
  if (!Number.isFinite(radiusMiles) || radiusMiles <= 0) throw new RangeError("Radius must be a finite number greater than zero.")
  const projectById = new Map(projects.map(project => [project.id, project]))
  if (projectById.size !== projects.length) throw new Error("Project IDs must be unique before exploring proximity.")
  const rows = new Map<string, GeographicRecord>(), duplicates = new Set<string>()
  for (const record of records) {
    if (!projectById.has(record.projectId)) continue
    if (rows.has(record.projectId)) duplicates.add(record.projectId)
    else rows.set(record.projectId, record)
  }
  const represented = new Map<string, RepresentedRecord>()
  for (const [id, row] of rows) {
    if (duplicates.has(id) || !["located", "approximate"].includes(row.status) || !row.representation) continue
    if (row.review && (row.review.basedOnFingerprint !== row.inputFingerprint || row.review.decision === "rejected")) continue
    const parsed = geographicRecordSchema.safeParse(row)
    if (parsed.success && parsed.data.representation) represented.set(id, { ...parsed.data, representation: parsed.data.representation })
  }
  const selected = projectById.get(selectedProjectId), selectedRecord = represented.get(selectedProjectId)
  const result: ExploratoryAnalysis = {
    selectedProjectId, radiusMiles, representation: selectedRecord?.representation ?? null,
    matches: [], representedProjects: represented.size, unresolvedProjects: projects.length - represented.size, reason: null,
  }
  if (!selected) return { ...result, reason: "The selected project is not in the current collection. Select a current record to explore." }
  if (!selectedRecord) {
    const row = rows.get(selectedProjectId)
    const reason = duplicates.has(selectedProjectId) ? "Conflicting companion rows share this project ID. Reprocess the current collection."
      : row?.review && (row.review.basedOnFingerprint !== row.inputFingerprint || row.review.decision === "rejected") ? "The selected geographic evidence was rejected or requires review against the current source fingerprint."
      : row && !["located", "approximate"].includes(row.status) ? row.reason
      : "The selected project has no valid represented geography in the current companion. Process or review its evidence before exploring."
    return { ...result, reason }
  }
  for (const [projectId, record] of represented) {
    if (projectId === selectedProjectId) continue
    const project = projectById.get(projectId)!
    const relation = relationBetween(selectedRecord.representation, record.representation, radiusMiles)
    if (!relation) continue
    const ownership = ownershipBetween(selected, project)
    const match: ExploratoryMatch = {
      projectId, relation: relation.relation, distanceMiles: relation.distanceMiles, ownership: ownership.ownership,
      timing: compareProjectTiming(selected, project),
      limitations: [...new Set([
        "Exploratory geographic context only; this is not a strict candidate or evidence of a shared construction window, route or benefit.",
        relation.limitation, ownership.limitation,
        ...recordContext(selected, selectedRecord), ...recordContext(project, record),
      ])],
    }
    result.matches.push(match)
  }
  result.matches.sort((left, right) => {
    if (left.distanceMiles !== null && right.distanceMiles !== null) return left.distanceMiles - right.distanceMiles || compareIds(left.projectId, right.projectId)
    if (left.distanceMiles !== null) return -1
    if (right.distanceMiles !== null) return 1
    return compareIds(left.projectId, right.projectId)
  })
  if (!result.matches.length) result.reason = "No supplied points/endpoints are strictly inside this radius, and no represented extents overlap or contain the supplied positions. Unresolved records were not assigned geometry."
  return result
}
