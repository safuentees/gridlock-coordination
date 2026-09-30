import { datasetSchema, type DataMode, type Dataset } from "@/domain/schema"
import { demoDataset } from "./demo"
import realDataset from "./real/dataset.json"

export function loadDataset(mode: DataMode): Dataset {
  const dataset = datasetSchema.parse(mode === "demo" ? demoDataset : realDataset)
  if (dataset.mode !== mode) throw new Error("The dataset mode does not match the requested source.")
  return dataset
}
