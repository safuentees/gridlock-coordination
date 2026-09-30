import { datasetSchema, type DataMode, type Dataset } from "@/domain/schema"
import { demoDataset } from "./demo"
import { inventoryDemoDataset } from "./demo/inventory"
import realDataset from "./real/dataset.json"
import sceInventory from "./real/coverage/ca-sce-tpr/dataset.json"
import isoNewEnglandInventory from "./real/coverage/iso-ne-rsp/dataset.json"
import { combineSourceDatasets } from "./coverage"

export function loadDataset(mode: DataMode): Dataset {
  const dataset = mode === "demo" ? datasetSchema.parse({
    ...inventoryDemoDataset,
    title: "600 synthetic transmission and inventory records",
    projects: [...demoDataset.projects, ...inventoryDemoDataset.projects],
    coverage: { ...inventoryDemoDataset.coverage, processed: demoDataset.projects.length + inventoryDemoDataset.projects.length },
  })
    : combineSourceDatasets(datasetSchema.parse(realDataset), [datasetSchema.parse(sceInventory), datasetSchema.parse(isoNewEnglandInventory)])
  if (dataset.mode !== mode) throw new Error("The dataset mode does not match the requested source.")
  return dataset
}
