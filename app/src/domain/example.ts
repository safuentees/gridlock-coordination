import type { Project } from "./schema"
// Contract example only. F01 owns the sourced production records.
export const exampleProject: Project = {
  id: "example-desc", utilityId: "desc", sponsor: "DESC", sourceId: "06367 D - G",
  name: "Jasper–Okatie 230 kV", description: "Contract example from the supplied challenge workbook.",
  status: null, voltageKv: [230],
  date: { value: "2025-12-31", precision: "day", kind: "in-service", label: "Planned in-service date" },
  buildWindow: null,
  location: { lat: 32.346439, lon: -81.0785475, method: "endpoint-midpoint", confidence: "unverified", evidence: [{ file: "Projects_Overlaps.xlsx", locator: "projects!A4:Q4", url: null }] },
  sources: [{ file: "2024-2028-2million-and-above-project-descriptions.pdf", locator: "physical page 23", url: null }],
  notes: ["Location supplied in workbook; independent verification pending."],
}
