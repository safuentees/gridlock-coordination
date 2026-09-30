import type { Dataset, Project } from "@/domain/schema"

type Place = { name: string; lat: number; lon: number }
const descPlaces: Place[] = [
  { name: "Columbia", lat: 34.01, lon: -81.03 }, { name: "Charleston", lat: 32.82, lon: -79.97 },
  { name: "Sumter", lat: 33.92, lon: -80.34 }, { name: "Orangeburg", lat: 33.49, lon: -80.86 },
  { name: "Beaufort", lat: 32.43, lon: -80.67 }, { name: "Florence", lat: 34.2, lon: -79.76 },
  { name: "Newberry", lat: 34.27, lon: -81.62 }, { name: "Aiken", lat: 33.56, lon: -81.72 },
]
const gpcPlaces: Place[] = [
  { name: "Atlanta", lat: 33.75, lon: -84.39 }, { name: "Macon", lat: 32.84, lon: -83.63 },
  { name: "Albany", lat: 31.58, lon: -84.16 }, { name: "Valdosta", lat: 30.83, lon: -83.28 },
  { name: "Columbus", lat: 32.46, lon: -84.99 }, { name: "Rome", lat: 34.25, lon: -85.17 },
  { name: "Athens", lat: 33.95, lon: -83.36 }, { name: "Brunswick", lat: 31.15, lon: -81.49 },
]
const borderPlaces: Place[] = [
  { name: "Savannah River", lat: 32.24, lon: -81.13 },
  { name: "Augusta", lat: 33.47, lon: -81.97 },
  { name: "Lake Hartwell", lat: 34.49, lon: -82.86 },
]
const stationNames = ["Riverbend", "Oak Grove", "Cedar Creek", "Westgate", "Pine Ridge", "Industrial Park", "Mill Creek", "Northfield", "South Junction", "East Fork"]
const workTypes = ["line rebuild", "transformer addition", "substation expansion", "line reconductor", "new switching station"]
let seed = 26701
function random() {
  seed = (seed * 1664525 + 1013904223) >>> 0
  return seed / 4294967296
}

function createProject(index: number): Project {
  const utilityId = index < 150 ? "desc" : "gpc"
  const local = index % 150
  const place = local < 15 ? borderPlaces[local % borderPlaces.length] : (utilityId === "desc" ? descPlaces : gpcPlaces)[local % 8]
  const number = String(local + 1).padStart(3, "0")
  const source = { file: "Synthetic demonstration scenarios", locator: `${utilityId.toUpperCase()} scenario ${number}`, url: null }
  const year = 2024 + (local % 9)
  const month = String(1 + (local * 5) % 12).padStart(2, "0")
  const day = String(1 + (local * 7) % 27).padStart(2, "0")
  const precision = local % 13 === 0 ? "unknown" : local % 9 === 0 ? "year" : local % 7 === 0 ? "month" : "day"
  const dateValue = precision === "unknown" ? null : precision === "year" ? String(year) : precision === "month" ? `${year}-${month}` : `${year}-${month}-${day}`
  const spread = local < 15 ? 0.15 : 0.65
  const lat = Number((place.lat + (random() - 0.5) * spread).toFixed(4))
  const lon = Number((place.lon + (random() - 0.5) * spread).toFixed(4))
  const voltage = [115, 230, 500, 115, 230][local % 5]
  return {
    id: `demo-${utilityId}-${number}`, utilityId, sourceId: `DEMO-${utilityId.toUpperCase()}-${number}`,
    sponsor: local % 11 === 0 ? null : utilityId === "desc" ? "Dominion Energy South Carolina (synthetic)" : "Georgia Power (synthetic)",
    name: `${place.name} – ${stationNames[Math.floor(local / 8) % stationNames.length]} ${voltage} kV ${workTypes[local % workTypes.length]}`,
    description: `Synthetic ${workTypes[local % workTypes.length]} near ${place.name} to illustrate ${local % 2 ? "load growth and reliability" : "asset renewal and capacity"}. This is not a utility commitment.`,
    status: local % 10 === 0 ? null : ["Planning", "Engineering", "Proposed", "Scheduled"][local % 4],
    voltageKv: local % 17 === 0 ? [] : [voltage],
    date: { value: dateValue, precision, kind: utilityId === "desc" ? "in-service" : "need", label: utilityId === "desc" ? "Synthetic planned in-service date" : "Synthetic need date" },
    buildWindow: local % 31 === 1 ? { start: `${year}-02-01`, end: `${year}-10-31` } : null,
    location: local % 12 === 11 ? null : { lat, lon, method: local % 4 === 0 ? "endpoint-midpoint" : "source-point", confidence: local % 5 === 0 ? "confirmed" : "unverified", evidence: [source] },
    sources: [source],
    notes: ["All names, dates, coordinates and confidence labels in this record are synthetic.", ...(local % 12 === 11 ? ["No location supplied in this scenario; the project remains in the inventory."] : [])],
  }
}

export const demoDataset: Dataset = {
  schemaVersion: 1, mode: "demo", title: "300 synthetic regional transmission projects", generatedAt: "2026-09-30",
  projects: Array.from({ length: 300 }, (_, index) => createProject(index)),
  coverage: { processed: 300, skipped: 0, failed: 0, notes: ["Deterministic demonstration data with two reporting groups, varied date precision, missing locations and a minority of nearby cross-group pairs. No record represents a real utility plan."] },
}
