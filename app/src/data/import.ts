import { datasetSchema, type Dataset, type Project } from "@/domain/schema"

export const MAX_IMPORT_BYTES = 10 * 1024 * 1024
export interface DatasetChanges {
  added: Project[]
  removed: Project[]
  changed: { before: Project; after: Project; fields: string[] }[]
  unchanged: number
}

export function parseSourceDataset(text: string): Dataset {
  if (new TextEncoder().encode(text).length > MAX_IMPORT_BYTES) throw new Error("Choose a dataset smaller than 10 MB.")
  let raw: unknown
  try { raw = JSON.parse(text) } catch { throw new Error("This file is not valid JSON.") }
  const result = datasetSchema.safeParse(raw)
  if (!result.success) {
    const issue = result.error.issues[0]
    throw new Error(`${issue.path.join(".") || "Dataset"}: ${issue.message}`)
  }
  if (result.data.mode !== "real") throw new Error("Source imports must use real mode. Demo records stay in demo mode.")
  return result.data
}

export function compareDatasets(previous: Dataset, next: Dataset): DatasetChanges {
  const previousById = new Map(previous.projects.map(project => [project.id, project]))
  const nextIds = new Set(next.projects.map(project => project.id))
  const changes: DatasetChanges = { added: [], removed: [], changed: [], unchanged: 0 }
  for (const project of next.projects) {
    const before = previousById.get(project.id)
    if (!before) { changes.added.push(project); continue }
    const fields = (Object.keys(project) as (keyof Project)[]).filter(key => JSON.stringify(before[key]) !== JSON.stringify(project[key]))
    if (fields.length) changes.changed.push({ before, after: project, fields })
    else changes.unchanged += 1
  }
  changes.removed = previous.projects.filter(project => !nextIds.has(project.id))
  return changes
}

export function downloadDataset(dataset: Dataset): void {
  const url = URL.createObjectURL(new Blob([JSON.stringify(dataset, null, 2) + "\n"], { type: "application/json" }))
  const anchor = document.createElement("a")
  anchor.href = url
  anchor.download = `gridlock-${dataset.mode}-dataset.json`
  anchor.click()
  setTimeout(() => URL.revokeObjectURL(url), 0)
}
