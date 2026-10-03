import { geographicReferenceBundleSchema, geographicRunSchema, type GeographicClue, type GeographicRecord, type GeographicReference, type GeographicReferenceBundle, type GeographicRepresentation, type GeographicRun, type GeographicStatus } from "@/domain/geography"
import type { Dataset, Project, SourceRef } from "@/domain/schema"
import { getMapLocationResearchHint } from "@/data/map-location-proposals"
import { extractGeographicClues, normalizeGeographicName, stateCode } from "./clues"

export const PIPELINE_VERSION = "1.0.0"
const fingerprints = new WeakMap<Project, { canonical: string; hash: string }>()
const canonical = (value: unknown): unknown => {
  if (Array.isArray(value)) return value.map(canonical)
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0).map(([key, item]) => [key, canonical(item)]))
  return value
}
function inputText(project: Project): string {
  return JSON.stringify(canonical({ ...project, notes: [] }))
}
async function fingerprint(project: Project): Promise<string> {
  const text = inputText(project), cached = fingerprints.get(project)
  if (cached?.canonical === text) return cached.hash
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text))
  const hash = Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, "0")).join("")
  fingerprints.set(project, { canonical: text, hash })
  return hash
}
const unique = <T,>(values: T[]): T[] => [...new Set(values)]
const evidenceUnion = (sources: SourceRef[]): SourceRef[] => [...new Map(sources.map(source => [JSON.stringify(source), source])).values()]
type Outcome = Pick<GeographicRecord, "status" | "reason" | "representation" | "referenceIds" | "candidateReferenceIds">
function outcome(status: GeographicStatus, reason: string, representation: GeographicRepresentation | null = null, referenceIds: string[] = [], candidateReferenceIds: string[] = []): Outcome {
  return { status, reason, representation, referenceIds, candidateReferenceIds }
}

function sourcePosition(project: Project): Outcome | null {
  const location = project.location, inventory = project.inventory, geometry = inventory?.nativeGeometry
  if (location) {
    const evidence = location.evidence.length ? location.evidence : project.sources
    const role = inventory?.centerRole
    const sourceLocated = location.method === "source-point" && (!inventory || role === "substation-center" || role === "tower-location")
    const sameNativePoint = geometry?.type === "Point" && geometry.coordinates[0][0] === location.lon && geometry.coordinates[0][1] === location.lat
    return outcome(sourceLocated ? "located" : "approximate", sourceLocated ? `Directly supplied source point retained; source confidence remains ${location.confidence}. Located describes source provenance/role, not independent verification.` : `Existing ${location.confidence} ${location.method} retained for map context; ${role ?? "source"} role does not establish an exact project center.`, {
      kind: "point", method: location.method === "single-endpoint" ? "single-endpoint" : "source-point", position: [location.lon, location.lat],
      precision: sourceLocated ? "project" : role === "substation-center" || role === "tower-location" ? "facility" : "unknown",
      label: project.name, evidence, accuracyMeters: sameNativePoint ? geometry.accuracyMeters : null,
      limitations: unique([...(inventory?.locationAssumptions ?? []), `Original method: ${location.method}; confidence: ${location.confidence}; role: ${role ?? "legacy source point"}.`, "A displayed position does not establish construction extent, a shared route or coordination benefit."]),
    })
  }
  if (!geometry || !geometry.crs || !/(?:4326|WGS\s*84)/i.test(geometry.crs)) return null
  const common = { label: project.name, evidence: geometry.evidence, accuracyMeters: geometry.accuracyMeters, limitations: unique([...(inventory?.locationAssumptions ?? []), `Native role: ${geometry.role}; CRS: ${geometry.crs}. No project center, route or confidence is inferred.`]) }
  if (geometry.type === "Point") return outcome("approximate", "Native source point retained separately; project-center confidence is not established.", { ...common, kind: "point", method: "source-point", position: geometry.coordinates[0], precision: geometry.role === "substation-center" || geometry.role === "tower-location" ? "facility" : "unknown" })
  if (geometry.role === "line-endpoints") return outcome("approximate", "Published native endpoints retained; they do not establish a route or construction footprint.", { ...common, kind: "endpoints", method: "endpoint-estimate", positions: geometry.coordinates, precision: "endpoints" })
  return null
}

type ReferenceIndex = { exact: Map<string, GeographicReference[]>; names: Map<string, GeographicReference[]> }
function indexReferences(bundle: GeographicReferenceBundle): ReferenceIndex {
  const exact = new Map<string, GeographicReference[]>(), names = new Map<string, GeographicReference[]>()
  for (const reference of bundle.references) {
    for (const id of reference.projectIds) exact.set(id, [...(exact.get(id) ?? []), reference])
    for (const name of unique(reference.names.map(normalizeGeographicName))) {
      const key = `${reference.kind}:${name}`
      names.set(key, [...(names.get(key) ?? []), reference])
    }
  }
  return { exact, names }
}
function sourceCompatible(reference: GeographicReference, project: Project): boolean {
  return !reference.sourceKeys.length || reference.sourceKeys.includes(project.inventory?.sourceKey ?? project.utilityId)
}
function nameCandidates(index: ReferenceIndex, kind: GeographicReference["kind"], clue: GeographicClue, project: Project): GeographicReference[] {
  return (index.names.get(`${kind}:${clue.normalized}`) ?? []).filter(reference => !reference.projectIds.length && sourceCompatible(reference, project))
}
function stateCompatible(reference: GeographicReference, states: string[]): boolean {
  return !states.length || (reference.stateCodes.length > 0 && reference.stateCodes.some(code => states.includes(stateCode(code) ?? code.toUpperCase())))
}
function referenceOutcome(reference: GeographicReference, reason: string): Outcome {
  return outcome("approximate", reason, reference.representation, [reference.id])
}
function combineAreas(references: GeographicReference[], reason: string, candidates: string[]): Outcome | null {
  const areas = references.filter((reference): reference is GeographicReference & { representation: Extract<GeographicRepresentation, {kind:"area"}> } => reference.representation.kind === "area")
  if (!areas.length) return null
  if (areas.length === 1) return { ...referenceOutcome(areas[0], reason), candidateReferenceIds: candidates }
  const extents = areas.map(area => area.representation.bounds)
  return outcome("approximate", reason + " Multiple named areas are retained as one enclosing bounding extent; intervening land is not a project footprint.", {
    kind: "area", method: "geographic-area", precision: "region", boundaryMeaning: "bounding-extent",
    bounds: [Math.min(...extents.map(bounds => bounds[0])), Math.min(...extents.map(bounds => bounds[1])), Math.max(...extents.map(bounds => bounds[2])), Math.max(...extents.map(bounds => bounds[3]))],
    label: areas.map(area => area.representation.label).join("; "), accuracyMeters: null,
    evidence: evidenceUnion(areas.flatMap(area => area.representation.evidence)),
    limitations: unique([...areas.flatMap(area => area.representation.limitations), "Enclosing geographic extents only; no centroid, route or surveyed project boundary is inferred."]),
  }, areas.map(area => area.id), candidates)
}

function matchReferences(project: Project, clues: GeographicClue[], hash: string, index: ReferenceIndex, withheld: string | null): Outcome {
  const attempted = new Set<string>(), reasons: string[] = []
  const explicitStates = unique(clues.filter(clue => clue.kind === "state").map(clue => stateCode(clue.text)).filter((code): code is string => code !== null))
  const exact = (index.exact.get(project.id) ?? []).filter(reference => sourceCompatible(reference, project))
  const accepted = exact.filter(reference => !reference.projectFingerprints || reference.projectFingerprints[project.id] === hash)
  exact.forEach(reference => attempted.add(reference.id))
  if (accepted.length === 1) return referenceOutcome(accepted[0], "Curated exact project identity and source baseline matched; cited map context remains approximate, not a qualified project center.")
  if (accepted.length > 1) reasons.push("Several curated references match this project identity; no unique position is established.")
  if (exact.length > accepted.length) reasons.push("A curated project reference was withheld because its accepted source fingerprint no longer matches.")
  if (withheld) reasons.push(withheld)

  // Independently named county/town clues may resolve a state without assuming a publisher footprint.
  const geographicClues = clues.filter(clue => clue.kind === "county" || clue.kind === "town")
  const areaMatches = geographicClues.map(clue => ({ clue, candidates: nameCandidates(index, clue.kind as "county" | "town", clue, project) }))
  let states = explicitStates
  if (!states.length && areaMatches.length) {
    const sets = areaMatches.filter(match => match.candidates.length).map(match => unique(match.candidates.flatMap(reference => reference.stateCodes.map(code => stateCode(code) ?? code.toUpperCase()))))
    const intersection = sets.length ? sets[0].filter(code => sets.every(set => set.includes(code))) : []
    if (intersection.length === 1) states = intersection
  }
  const resolve = (clue: GeographicClue, kind: GeographicReference["kind"]) => {
    const all = nameCandidates(index, kind, clue, project)
    all.forEach(reference => attempted.add(reference.id))
    return all.filter(reference => stateCompatible(reference, states))
  }
  if (!withheld && !exact.length) {
    const endpoints = clues.filter(clue => clue.kind === "endpoint")
    const groups = new Map<string, GeographicClue[]>()
    for (const clue of endpoints) {
      const base = clue.field.replace(/:(?:from|to)$/, "")
      groups.set(base, [...(groups.get(base) ?? []), clue])
    }
    for (const group of groups.values()) {
      if (!group.some(clue => clue.field.endsWith(":from")) || !group.some(clue => clue.field.endsWith(":to"))) continue
      if (endpoints.some(clue => !group.some(member => member.normalized === clue.normalized))) continue
      const matches = group.map(clue => resolve(clue, "facility").filter(reference => reference.representation.kind === "point" && (states.length > 0 || reference.sourceKeys.length > 0)))
      if (matches.every(list => list.length === 1) && unique(matches.map(list => list[0].id)).length >= 2) {
        const references = [...new Map(matches.flat().map(reference => [reference.id, reference])).values()]
        const points = references.map(reference => reference.representation).filter((representation): representation is Extract<GeographicRepresentation, {kind:"point"}> => representation.kind === "point")
        return outcome("approximate", "Explicit endpoints each matched one facility in consistent source/state context. Positions are endpoint estimates, not a route or midpoint.", {
          kind: "endpoints", method: "endpoint-estimate", precision: "endpoints", label: project.name,
          positions: points.map(point => point.position), accuracyMeters: null, evidence: evidenceUnion(points.flatMap(point => point.evidence)),
          limitations: unique([...points.flatMap(point => point.limitations), "Named endpoint matching does not establish the connecting route or actual construction extent."]),
        }, references.map(reference => reference.id))
      }
      if (matches.some(list => list.length > 1)) reasons.push("At least one explicit endpoint matches multiple facilities.")
    }
    // Multiple endpoints must never collapse to the one endpoint that happened to match.
    if (!endpoints.length) {
      const facilities = unique(clues.filter(clue => clue.kind === "facility").flatMap(clue => resolve(clue, "facility")))
        .filter(reference => reference.representation.kind === "point" && (states.length > 0 || reference.sourceKeys.length > 0))
      if (facilities.length === 1 && states.length <= 1) return referenceOutcome(facilities[0], "Exact normalized facility name uniquely matched consistent source/state context; facility position is approximate project geography.")
      if (facilities.length === 1 && states.length > 1) reasons.push("Multiple source states prevent assigning this scope to one facility position.")
      if (facilities.length > 1) reasons.push("Facility clues match more than one contextual reference; no unique facility identity is established.")
    } else reasons.push("Explicit endpoint clues are not all uniquely supported by contextual facility references.")
  }
  if (!clues.some(clue => ["facility", "endpoint", "county", "town", "state"].includes(clue.kind))) reasons.push("No geographic clue is supplied in the source name, description or structured location fields.")
  // Narrower areas are used only if every clue at that precision resolves uniquely.
  for (const kind of ["town", "county"] as const) {
    const relevant = geographicClues.filter(clue => clue.kind === kind)
    if (!relevant.length) continue
    const matches = relevant.map(clue => resolve(clue, kind).filter(reference => reference.representation.kind === "area"))
    if (matches.every(list => list.length === 1) && explicitStates.every(code => matches.flat().some(reference => reference.stateCodes.some(state => (stateCode(state) ?? state.toUpperCase()) === code)))) {
      const references = [...new Map(matches.flat().map(reference => [reference.id, reference])).values()]
      const prefix = unique(reasons).join(" ")
      const area = combineAreas(references, `${prefix ? prefix + " " : ""}Source ${kind} clues uniquely support geographic bounds only; finer project identity/geometry remains unresolved.`, [...attempted])
      if (area) return area
    }
    if (matches.some(list => list.length > 1)) reasons.push(`The ${kind} name is ambiguous in the available context.`)
  }
  if (explicitStates.length) {
    const matches = explicitStates.map(code => (index.names.get(`state:${code.toLowerCase()}`) ?? []).filter(reference => !reference.projectIds.length && sourceCompatible(reference, project) && reference.representation.kind === "area"))
    matches.flat().forEach(reference => attempted.add(reference.id))
    if (matches.every(list => list.length === 1)) {
      const area = combineAreas(matches.flat(), `${unique(reasons).join(" ")} Explicit source state context supports bounding extents only; no finer project geography is established.`.trim(), [...attempted])
      if (area) return area
    }
  }
  return outcome(attempted.size || reasons.some(reason => reason.includes("ambiguous") || reason.includes("multiple")) ? "ambiguous" : "unsupported",
    unique([...reasons, "No supported point, complete endpoint pair or uniquely resolved geographic area is available in this reference revision."]).join(" "), null, [], [...attempted])
}

function reviewed(result: GeographicRecord, previous?: GeographicRecord): GeographicRecord {
  if (!previous?.review) return result
  const review = structuredClone(previous.review)
  if (review.basedOnFingerprint !== result.inputFingerprint) {
    const stale = "The source evidence changed after analyst review. The previous decision and representation are retained for re-review; they are not silently reapplied. "
    return { ...result, review, status: "ambiguous", representation: null, reason: result.reason.startsWith(stale) ? result.reason : stale + result.reason }
  }
  if (review.decision === "rejected") return { ...result, review, status: "unsupported", representation: null, reason: `Analyst rejected this representation: ${review.reason}` }
  if (review.representation) return { ...result, review, status: review.decision === "accepted" && result.status === "located" && JSON.stringify(result.representation) === JSON.stringify(review.representation) ? "located" : "approximate", representation: review.representation, reason: `Analyst ${review.decision} geographic evidence: ${review.reason}` }
  return { ...result, review, status: "unsupported", representation: null, reason: `Analyst ${review.decision} an unresolved outcome: ${review.reason}` }
}

function precisionRank(representation: GeographicRepresentation | null): number {
  if (!representation) return -1
  return ({ project: 6, facility: 5, endpoints: 4, locality: 3, unknown: 3, town: 2, county: 1, state: 0, region: 0 })[representation.precision]
}
function preserveFiner(result: GeographicRecord, prior: GeographicRecord | undefined, referenceRevision: string | undefined): GeographicRecord {
  if (!prior?.representation || prior.inputFingerprint !== result.inputFingerprint || prior.review || precisionRank(prior.representation) <= precisionRank(result.representation)) return result
  const representation = structuredClone(prior.representation)
  const context = `Finer cited geography retained from reference revision ${referenceRevision ?? "unknown"}; the current reference run did not reproduce that precision. Review before relying on it.`
  representation.limitations = unique([...representation.limitations, context])
  return { ...result, representation, status: "approximate", referenceIds: [...prior.referenceIds], candidateReferenceIds: unique([...result.referenceIds, ...result.candidateReferenceIds]), reason: context + " Current outcome: " + result.reason }
}

export async function enrichCollection(dataset: Dataset, references: GeographicReferenceBundle, options: { previous?: GeographicRun | null; onProgress?: (processed: number, total: number) => void } = {}): Promise<GeographicRun> {
  const bundle = geographicReferenceBundleSchema.parse(references), index = indexReferences(bundle)
  const previous = options.previous?.mode === dataset.mode ? options.previous : null
  const previousById = new Map([...(previous?.retainedReviews ?? []), ...(previous?.records ?? [])].map(record => [record.projectId, record]))
  const reusable = previous?.pipelineVersion === PIPELINE_VERSION && previous.referenceRevision === bundle.revision
  const records: GeographicRecord[] = []
  options.onProgress?.(0, dataset.projects.length)
  for (let offset = 0; offset < dataset.projects.length; offset += 32) {
    const batch = dataset.projects.slice(offset, offset + 32)
    const hashes = await Promise.all(batch.map(fingerprint))
    batch.forEach((project, position) => {
      const inputFingerprint = hashes[position], prior = previousById.get(project.id)
      if (reusable && prior?.inputFingerprint === inputFingerprint && prior.status !== "not-processed") {
        records.push(reviewed(structuredClone(prior), prior))
        return
      }
      const clues = extractGeographicClues(project)
      const hint = project.utilityId === "bpa-plan" ? getMapLocationResearchHint({ ...dataset, projects: [project] }, project) : null
      const result = sourcePosition(project) ?? matchReferences(project, clues, inputFingerprint, index, hint ? `${hint.reason} ${hint.needed}` : null)
      records.push(reviewed(preserveFiner({ projectId: project.id, inputFingerprint, clues, ...result }, prior, previous?.referenceRevision), prior))
    })
    options.onProgress?.(records.length, dataset.projects.length)
    await new Promise<void>(resolve => setTimeout(resolve, 0))
  }
  const currentIds = new Set(dataset.projects.map(project => project.id))
  const retainedReviews = [...previousById.values()].filter(record => record.review && !currentIds.has(record.projectId)).map(record => structuredClone(record))
  return geographicRunSchema.parse({ version: 1, pipelineVersion: PIPELINE_VERSION, referenceRevision: bundle.revision, mode: dataset.mode, generatedAt: new Date().toISOString(), collectionTitle: dataset.title, records, ...(retainedReviews.length ? { retainedReviews } : {}) })
}

/** Cold/changed objects remain unprocessed until the async pipeline validates their fingerprints. */
export function geographicCoverage(run: GeographicRun | null, projects: Project[]): Record<GeographicStatus, number> {
  const counts: Record<GeographicStatus, number> = { located: 0, approximate: 0, ambiguous: 0, unsupported: 0, "not-processed": 0 }
  if (!run || run.pipelineVersion !== PIPELINE_VERSION) return { ...counts, "not-processed": projects.length }
  const records = new Map(run?.records.map(record => [record.projectId, record]) ?? [])
  for (const project of projects) {
    const record = records.get(project.id), cached = fingerprints.get(project)
    if (!record || !cached || cached.canonical !== inputText(project) || record.inputFingerprint !== cached.hash) counts["not-processed"]++
    else counts[record.status]++
  }
  return counts
}
