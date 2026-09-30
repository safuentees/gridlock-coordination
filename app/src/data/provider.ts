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
import hawaiiInventory from "./real/coverage/hi-heco-featured/dataset.json"
import misoInventory from "./real/coverage/miso-mtep/dataset.json"
import newYorkInventory from "./real/coverage/ny-national-grid-ltp/dataset.json"
import floridaInventory from "./real/coverage/fl-fmpa/dataset.json"
import bpaInventory from "./real/coverage/bpa-plan/dataset.json"
import puertoRicoInventory from "./real/coverage/pr-transmission/dataset.json"
import westConnectInventory from "./real/coverage/westconnect-tppl/dataset.json"
import guamInventory from "./real/coverage/gu-gpa-cip/dataset.json"
import { combineSourceDatasets } from "./coverage"

export function loadDataset(mode: DataMode): Dataset {
  const dataset = mode === "demo" ? datasetSchema.parse({
    ...inventoryDemoDataset,
    title: `${demoDataset.projects.length + inventoryDemoDataset.projects.length} synthetic transmission and inventory records`,
    projects: [...demoDataset.projects, ...inventoryDemoDataset.projects],
    coverage: { ...inventoryDemoDataset.coverage, processed: demoDataset.projects.length + inventoryDemoDataset.projects.length },
  })
    : combineSourceDatasets(datasetSchema.parse(realDataset), [
      datasetSchema.parse(sceInventory), datasetSchema.parse(isoNewEnglandInventory),
      datasetSchema.parse(pjmInventory), datasetSchema.parse(sppInventory),
      datasetSchema.parse(alaskaInventory), datasetSchema.parse(ercotInventory),
      datasetSchema.parse(hawaiiInventory), datasetSchema.parse(misoInventory),
      datasetSchema.parse(newYorkInventory), datasetSchema.parse(floridaInventory),
      datasetSchema.parse(bpaInventory), datasetSchema.parse(puertoRicoInventory),
      datasetSchema.parse(westConnectInventory),
      datasetSchema.parse(guamInventory),
    ])
  if (dataset.mode !== mode) throw new Error("The dataset mode does not match the requested source.")
  return dataset
}
