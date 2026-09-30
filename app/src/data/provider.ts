import { datasetSchema, type DataMode, type Dataset } from "@/domain/schema"
import { demoDataset } from "./demo"
import realDataset from "./real/dataset.json"
import sceInventory from "./real/coverage/ca-sce-tpr/dataset.json"
import { combineSourceDatasets } from "./coverage"

export function loadDataset(mode: DataMode): Dataset {
  const dataset = mode === "demo" ? datasetSchema.parse(demoDataset)
    : combineSourceDatasets(datasetSchema.parse(realDataset), [datasetSchema.parse(sceInventory)])
  if (dataset.mode !== mode) throw new Error("The dataset mode does not match the requested source.")
  return dataset
}
