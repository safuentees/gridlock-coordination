import assert from "node:assert/strict"
import { analyzeProjects, compareProjectTiming, estimateImpact } from "../src/core/index"
import sourceDataset from "../src/data/real/dataset.json"
import { datasetSchema, DEFAULT_OPTIONS } from "../src/domain/schema"

// One real producer → schema → core example, including its strict-radius boundary.
const dataset = datasetSchema.parse(sourceDataset)
assert.equal(dataset.mode, "real")
const jasper = dataset.projects.find((project) => project.id === "desc-06367-d-g")
const mcintosh = dataset.projects.find((project) => project.id === "gpc-20277")
assert.ok(jasper && mcintosh, "The representative native source IDs must be present.")
const inputs = [jasper, mcintosh]
const result = analyzeProjects(inputs, DEFAULT_OPTIONS)
assert.equal(result.opportunities.length, 1)
const pair = result.opportunities[0]
assert.ok(Math.abs(pair.distanceMiles - 5.65) < 0.01)
assert.equal(pair.dateGapDays, 152)
assert.equal(pair.locationConfidence, "unverified")
assert.equal(pair.timelineRelation, "date-proximity")
assert.equal(compareProjectTiming(jasper, mcintosh).constructionRelation, "unknown")
assert.equal(analyzeProjects(inputs, { ...DEFAULT_OPTIONS, radiusMiles: pair.distanceMiles }).opportunities.length, 0)
// A user-entered hypothetical scenario for the same pair, not inferred from its distance.
const impact = estimateImpact({ sharedLengthMiles: 1, corridorWidthFeet: 100, costPerAcreUsd: 10000, shareFraction: 0.5 })
assert.ok(Math.abs(impact.sharedAcres - 12.1212121212) < 0.000001)
assert.ok(Math.abs(impact.indicativeSavingsUsd - 60606.060606) < 0.01)
console.log(JSON.stringify({
  case: "Jasper–Okatie / McIntosh–Purrysburg",
  sourceProjectCount: dataset.projects.length,
  distanceMiles: pair.distanceMiles,
  dateGapDays: pair.dateGapDays,
  locationConfidence: pair.locationConfidence,
  constructionOverlap: "unknown",
  strictRadiusBoundary: "excluded",
  hypotheticalImpact: impact,
}, null, 2))
