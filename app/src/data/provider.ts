import { datasetSchema, type DataMode, type Dataset } from "@/domain/schema"
import { demoDataset } from "./demo"
import { inventoryDemoDataset } from "./demo/inventory"
import realDataset from "./real/dataset.json"
import sceInventory from "./real/coverage/ca-sce-tpr/dataset.json"
import isoNewEnglandInventory from "./real/coverage/iso-ne-rsp/dataset.json"
import pjmInventory from "./real/coverage/pjm-rtep/dataset.json"
import sppInventory from "./real/coverage/spp-tracking/dataset.json"
import alaskaInventory from "./real/coverage/ak-aea-rstp/dataset.json"
import ercotInventory from "./real/coverage/ercot-tpit/dataset.json"
import { combineSourceDatasets } from "./coverage"

export function loadDataset(mode: DataMode): Dataset {
  const dataset = mode === "demo" ? datasetSchema.parse({
    ...inventoryDemoDataset,
    title: `${demoDataset.projects.length + inventoryDemoDataset.projects.length} synthetic transmission and inventory records`,
    projects: [...demoDataset.projects, ...inventoryDemoDataset.projects],
    coverage: { ...inventoryDemoDataset.coverage, processed: demoDataset.projects.length + inventoryDemoDataset.projects.length },
  })
    : combineSourceDatasets(datasetSchema.parse(realDataset), [datasetSchema.parse(sceInventory), datasetSchema.parse(isoNewEnglandInventory), datasetSchema.parse(pjmInventory), datasetSchema.parse(sppInventory), datasetSchema.parse(alaskaInventory), datasetSchema.parse(ercotInventory)])
  if (dataset.mode !== mode) throw new Error("The dataset mode does not match the requested source.")
  return dataset
}
