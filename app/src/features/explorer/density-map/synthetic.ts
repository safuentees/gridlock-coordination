import type { DensityPoint } from "./hierarchy"

// Invented map-only locations; never Project/Dataset records or analysis inputs.
// Metro centres, outskirts and rural clusters exercise concentrations at several scales.
const metros: [slug: string, longitude: number, latitude: number, count: number][] = [
  ["atlanta", -84.39, 33.75, 700], ["columbia", -81.03, 34.01, 400],
  ["charleston-inland", -80.13, 33.03, 300], ["savannah-inland", -81.23, 32.17, 250],
  ["augusta", -81.97, 33.47, 250], ["greenville", -82.40, 34.85, 200],
]
const rural: [slug: string, longitude: number, latitude: number][] = [
  ["macon", -83.63, 32.84], ["athens", -83.36, 33.95], ["albany", -84.16, 31.58],
  ["valdosta", -83.28, 30.83], ["florence", -79.76, 34.20], ["aiken", -81.72, 33.56],
  ["columbus", -84.99, 32.46], ["orangeburg", -80.86, 33.49],
  ["lagrange", -85.03, 33.04], ["anderson", -82.65, 34.50],
]

function createSample(): DensityPoint[] {
  let seed = 0x47524944
  const points: DensityPoint[] = []
  function random() {
    seed = (Math.imul(seed, 1_664_525) + 1_013_904_223) >>> 0
    return (seed + 0.5) / 4_294_967_296
  }
  function cluster(slug: string, longitude: number, latitude: number, count: number, sparse: boolean) {
    for (let index = 0; index < count; index += 1) {
      const radius = Math.sqrt(-2 * Math.log(random()))
      const angle = 2 * Math.PI * random()
      const outskirts = index % 4 === 0
      const width = sparse ? 0.24 : outskirts ? 0.13 : 0.035
      const height = sparse ? 0.18 : outskirts ? 0.10 : 0.026
      points.push({
        id: `synthetic-density-${slug}-${index + 1}`,
        position: [longitude + radius * Math.cos(angle) * width, latitude + radius * Math.sin(angle) * height],
      })
    }
  }
  metros.forEach(([slug, longitude, latitude, count]) => cluster(slug, longitude, latitude, count, false))
  rural.forEach(([slug, longitude, latitude]) => cluster(slug, longitude, latitude, 30, true))
  return points
}

/** Explicitly replace the map preview source; never append to actual project locations. */
export const syntheticDensityPoints: readonly DensityPoint[] = createSample()
