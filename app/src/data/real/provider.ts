import { datasetSchema, type Dataset } from "@/domain/schema"
import { combineSourceDatasets } from "../coverage"

// Static URLs are rewritten to hashed JSON assets by Vite, never JavaScript object literals.
// Keep source order stable so additive revisions retain the established record order.
const sourceUrls = [
  new URL("./dataset.json", import.meta.url),
  new URL("./coverage/ca-sce-tpr/dataset.json", import.meta.url),
  new URL("./coverage/iso-ne-rsp/dataset.json", import.meta.url),
  new URL("./coverage/pjm-rtep/dataset.json", import.meta.url),
  new URL("./coverage/spp-tracking/dataset.json", import.meta.url),
  new URL("./coverage/ak-aea-rstp/dataset.json", import.meta.url),
  new URL("./coverage/ercot-tpit/dataset.json", import.meta.url),
  new URL("./coverage/hi-heco-featured/dataset.json", import.meta.url),
  new URL("./coverage/miso-mtep/dataset.json", import.meta.url),
  new URL("./coverage/ny-national-grid-ltp/dataset.json", import.meta.url),
  new URL("./coverage/fl-fmpa/dataset.json", import.meta.url),
  new URL("./coverage/bpa-plan/dataset.json", import.meta.url),
  new URL("./coverage/pr-transmission/dataset.json", import.meta.url),
  new URL("./coverage/westconnect-tppl/dataset.json", import.meta.url),
  new URL("./coverage/gu-gpa-cip/dataset.json", import.meta.url),
  new URL("./coverage/nv-nvenergy/dataset.json", import.meta.url),
  new URL("./coverage/pacificorp-projects/dataset.json", import.meta.url),
  new URL("./coverage/pacificorp-irp-local/dataset.json", import.meta.url),
  new URL("./coverage/as-aspa-pcap/dataset.json", import.meta.url),
  new URL("./coverage/tva-public/dataset.json", import.meta.url),
  new URL("./coverage/mp-cuc-irp/dataset.json", import.meta.url),
  new URL("./coverage/mp-cuc-ccr/dataset.json", import.meta.url),
  new URL("./coverage/vi-wapa-recovery/dataset.json", import.meta.url),
  new URL("./coverage/vi-wapa-upgrades/dataset.json", import.meta.url),
  new URL("./coverage/carolinas-tpc/dataset.json", import.meta.url),
  new URL("./coverage/sdge-tpr/dataset.json", import.meta.url),
  new URL("./coverage/ca-pge-tpr/dataset.json", import.meta.url),
  new URL("./coverage/sc-santee/dataset.json", import.meta.url),
  new URL("./coverage/fl-fpl/dataset.json", import.meta.url),
  new URL("./coverage/al-apc-doe/dataset.json", import.meta.url),
  new URL("./coverage/ga-gpc-public/dataset.json", import.meta.url),
]

export type SourceJsonReader = (url: URL) => Promise<unknown>

const readAsset: SourceJsonReader = async url => {
  const response = await fetch(url)
  if (!response.ok) throw new Error("Source data could not be downloaded. Please retry.")
  return response.json()
}

/** Load the complete declared collection; never expose a partial result after a failed asset. */
export async function loadSourceDataset(readJson: SourceJsonReader = readAsset): Promise<Dataset> {
  const [baseline, ...additions] = await Promise.all(sourceUrls.map(async url => {
    const dataset = datasetSchema.parse(await readJson(url))
    if (dataset.mode !== "real") throw new Error("A source asset has an unexpected dataset mode.")
    return dataset
  }))
  return combineSourceDatasets(baseline, additions)
}
