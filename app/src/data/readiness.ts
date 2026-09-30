import { parseSourceDataset } from "@/data/import"
import { projectSchema, type Dataset, type Project } from "@/domain/schema"

type LocationMethod = NonNullable<Project["location"]>["method"]
export interface LocationEvidenceDraft {
  latitude: string
  longitude: string
  method: LocationMethod
  sourceFile: string
  sourceLocator: string
  sourceUrl: string
}
export interface ReadinessCounts { total: number; missing: number; unverified: number; confirmed: number }
export interface ReadinessSummary extends ReadinessCounts { byUtility: Record<Project["utilityId"], ReadinessCounts> }
const emptyCounts = (): ReadinessCounts => ({ total: 0, missing: 0, unverified: 0, confirmed: 0 })
export function getReadiness(dataset: Dataset): ReadinessSummary {
  const summary: ReadinessSummary = { ...emptyCounts(), byUtility: { desc: emptyCounts(), gpc: emptyCounts() } }
  for (const project of dataset.projects) {
    const state = project.location?.confidence ?? "missing"
    summary.total += 1; summary[state] += 1
    summary.byUtility[project.utilityId].total += 1; summary.byUtility[project.utilityId][state] += 1
  }
  return summary
}

export function createLocationRevision(dataset: Dataset, projectId: string, draft: LocationEvidenceDraft, generatedAt = new Date().toISOString()): Dataset {
  if (dataset.mode !== "real") throw new Error("Switch to source data to apply location evidence. Demo records stay separate.")
  const original = dataset.projects.find(project => project.id === projectId)
  if (!original) throw new Error("This project is no longer in the active dataset. Select a current project.")
  const coordinate = (text: string, label: string, limit: number) => {
    const value = Number(text.trim())
    if (!text.trim() || !Number.isFinite(value) || Math.abs(value) > limit) throw new Error(`Enter ${label} between −${limit} and ${limit}.`)
    return value
  }
  const lat = coordinate(draft.latitude, "latitude", 90)
  const lon = coordinate(draft.longitude, "longitude", 180)
  const file = draft.sourceFile.trim(), locator = draft.sourceLocator.trim(), url = draft.sourceUrl.trim() || null
  if (!file || !locator) throw new Error("Add a source title or filename and an exact page, sheet, section or other locator.")
  const evidence = { file, locator, url }
  const priorEvidence = original.location?.evidence ?? []
  const next = projectSchema.safeParse({
    ...original,
    location: { lat, lon, method: draft.method, confidence: "unverified", evidence: [...priorEvidence.filter(source => JSON.stringify(source) !== JSON.stringify(evidence)), evidence] },
    notes: [...original.notes.filter(note => note !== "Location updated from locally supplied evidence; coordinates remain unverified. Original source notes may describe earlier coverage."), "Location updated from locally supplied evidence; coordinates remain unverified. Original source notes may describe earlier coverage."],
  })
  if (!next.success) throw new Error(next.error.issues[0]?.message ?? "Check the location evidence fields.")
  const revision: Dataset = {
    ...dataset,
    generatedAt,
    projects: dataset.projects.map(project => project.id === projectId ? next.data : project),
  }
  // Reuse the import boundary for schema, stable-identity uniqueness and size validation.
  return parseSourceDataset(JSON.stringify(revision))
}
