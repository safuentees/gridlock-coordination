import assert from "node:assert/strict"
import { analyzeProjects, compareProjectTiming } from "../src/core/index"
import { exampleProject } from "../src/domain/example"
import { DEFAULT_OPTIONS } from "../src/domain/schema"
import type { Project } from "../src/domain/schema"

// One representative source pair, including its strict-radius boundary.
const mcintosh: Project = {
  ...exampleProject,
  id: "example-gpc", utilityId: "gpc", sponsor: "SAV", sourceId: "20277",
  name: "McIntosh–Purrysburg", description: "Representative source example.",
  date: { value: "2026-06-01", precision: "day", kind: "need", label: "Need date" },
  location: {
    lat: 32.352116, lon: -81.175112, method: "single-endpoint", confidence: "unverified",
    evidence: [{ file: "Projects_Overlaps.xlsx", locator: "projects!A8:Q8", url: null }],
  },
  sources: [{ file: "2025 IRP Volume 3 PUBLIC DISCLOSURE.pdf", locator: "physical page 180, Table 2", url: null }],
}
const inputs = [exampleProject, mcintosh]
const result = analyzeProjects(inputs, DEFAULT_OPTIONS)
assert.equal(result.opportunities.length, 1)
const pair = result.opportunities[0]
assert.ok(Math.abs(pair.distanceMiles - 5.65) < 0.01)
assert.equal(pair.dateGapDays, 152)
assert.equal(pair.locationConfidence, "unverified")
assert.equal(pair.timelineRelation, "date-proximity")
assert.equal(compareProjectTiming(exampleProject, mcintosh).constructionRelation, "unknown")
assert.equal(analyzeProjects(inputs, { ...DEFAULT_OPTIONS, radiusMiles: pair.distanceMiles }).opportunities.length, 0)
console.log(JSON.stringify({
  case: "Jasper–Okatie / McIntosh–Purrysburg",
  distanceMiles: pair.distanceMiles,
  dateGapDays: pair.dateGapDays,
  locationConfidence: pair.locationConfidence,
  constructionOverlap: "unknown",
  strictRadiusBoundary: "excluded",
}, null, 2))
