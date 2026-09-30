import { datasetSchema, type Dataset } from "@/domain/schema"
import { compareDatasets, parseSourceDataset } from "./import"

/** Compose independently reconciled sources; never mutate the preserved legacy snapshot. */
export function combineSourceDatasets(baseline: Dataset, additions: Dataset[]): Dataset {
  if ([baseline, ...additions].some(dataset => dataset.mode !== "real")) throw new Error("Source inventory composition accepts real records only.")
  if (!additions.length) return baseline
  const datasets = [baseline, ...additions]
  return datasetSchema.parse({
    schemaVersion: 2, mode: "real", title: "Public transmission project inventories",
    generatedAt: datasets.map(dataset => dataset.generatedAt).sort().at(-1),
    projects: datasets.flatMap(dataset => dataset.projects),
    sourceEditions: datasets.flatMap(dataset => dataset.sourceEditions ?? []),
    coverage: {
      processed: datasets.reduce((sum, dataset) => sum + dataset.coverage.processed, 0),
      skipped: datasets.reduce((sum, dataset) => sum + dataset.coverage.skipped, 0),
      failed: datasets.reduce((sum, dataset) => sum + dataset.coverage.failed, 0),
      notes: datasets.flatMap(dataset => dataset.coverage.notes),
    },
  })
}

/** An explicit additive offer: never replace an existing project or silently delete an omission. */
export function prepareBundledUpdate(active: Dataset, bundled: Dataset): Dataset | null {
  if (active.mode !== "real" || bundled.mode !== "real") return null
  const ids = new Set(active.projects.map(project => project.id))
  const additions = bundled.projects.filter(project => !ids.has(project.id))
  const editions = new Map((active.sourceEditions ?? []).map(edition => [`${edition.sourceKey}:${edition.editionId}`, edition]))
  for (const edition of bundled.sourceEditions ?? []) {
    const key = `${edition.sourceKey}:${edition.editionId}`
    // Local evidence/snapshots may retain prior records. Preserve their reporting-group meaning.
    const compatible = active.projects.every(project => !project.inventory || `${project.inventory.sourceKey}:${project.inventory.editionId}` !== key || (project.utilityId === edition.reportingGroupId && project.inventory.reportingGroupName === edition.reportingGroupName))
    if (compatible) editions.set(key, edition)
  }
  const candidate = parseSourceDataset(JSON.stringify({
    ...active,
    schemaVersion: editions.size ? 2 : active.schemaVersion,
    ...(editions.size ? { sourceEditions: [...editions.values()] } : {}),
    generatedAt: new Date().toISOString(),
    projects: [...active.projects, ...additions],
    coverage: { ...active.coverage, processed: active.coverage.processed + additions.length },
  }))
  const changes = compareDatasets(active, candidate)
  return additions.length || changes.editionChanges.length ? candidate : null
}
