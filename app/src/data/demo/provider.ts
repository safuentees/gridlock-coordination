import { datasetSchema, type Dataset } from "@/domain/schema"
import { demoDataset } from "./index"
import { inventoryDemoDataset } from "./inventory"

/** Existing deterministic fixtures are constructed only when demo mode is requested. */
export function loadDemoDataset(): Dataset {
  return datasetSchema.parse({
    ...inventoryDemoDataset,
    title: `${demoDataset.projects.length + inventoryDemoDataset.projects.length} synthetic transmission and inventory records`,
    projects: [...demoDataset.projects, ...inventoryDemoDataset.projects],
    coverage: { ...inventoryDemoDataset.coverage, processed: demoDataset.projects.length + inventoryDemoDataset.projects.length },
  })
}
