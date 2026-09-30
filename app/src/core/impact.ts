import type { ImpactInputs, ImpactResult } from "../domain/schema"

/** Hypothetical rectangular corridor area and an assumed share of its land cost. */
export function estimateImpact(inputs: ImpactInputs): ImpactResult {
  const fields: Array<[keyof ImpactInputs, string]> = [
    ["sharedLengthMiles", "Shared length"],
    ["corridorWidthFeet", "Corridor width"],
    ["costPerAcreUsd", "Land cost per acre"],
    ["shareFraction", "Potentially avoided share"],
  ]
  for (const [key, label] of fields) {
    if (!Number.isFinite(inputs[key]) || inputs[key] < 0) {
      throw new RangeError(`${label} must be a finite nonnegative number.`)
    }
  }
  if (inputs.shareFraction > 1) throw new RangeError("Potentially avoided share must be between 0 and 1.")

  const sharedAcres = inputs.sharedLengthMiles * 5280 * inputs.corridorWidthFeet / 43560
  const indicativeSavingsUsd = sharedAcres * inputs.costPerAcreUsd * inputs.shareFraction
  if (!Number.isFinite(sharedAcres) || !Number.isFinite(indicativeSavingsUsd)) {
    throw new RangeError("These assumptions are too large to produce a finite estimate.")
  }
  return {
    sharedAcres,
    indicativeSavingsUsd,
    assumptions: [
      `Hypothetical shared length: ${inputs.sharedLengthMiles} miles; corridor width: ${inputs.corridorWidthFeet} feet.`,
      `Assumed land cost: $${inputs.costPerAcreUsd} per acre; potentially avoided share: ${inputs.shareFraction * 100}%.`,
      "Length and width are user assumptions, not inferred from project-center separation or verified route geometry.",
      "Rectangular land area only; this estimate excludes engineering, construction, permitting, acquisition and schedule effects.",
      "Indicative avoided land cost is hypothetical, not verified savings or evidence that sharing is feasible.",
    ],
  }
}
