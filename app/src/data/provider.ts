import type { DataMode, Dataset } from "@/domain/schema"

const requests = new Map<DataMode, Promise<Dataset>>()

/** One validated load per mode; failed attempts are evicted so Retry can acquire data again. */
export function loadDataset(mode: DataMode): Promise<Dataset> {
  const existing = requests.get(mode)
  if (existing) return existing
  const request = (mode === "real"
    ? import("./real/provider").then(module => module.loadSourceDataset())
    : import("./demo/provider").then(module => module.loadDemoDataset())
  ).then(dataset => {
    if (dataset.mode !== mode) throw new Error("The dataset mode does not match the requested source.")
    return dataset
  }).catch(error => {
    if (requests.get(mode) === request) requests.delete(mode)
    throw error
  })
  requests.set(mode, request)
  return request
}
