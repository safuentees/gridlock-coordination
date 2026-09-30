import type { Project } from "../domain/schema"

export type Coordinates = Pick<NonNullable<Project["location"]>, "lat" | "lon">
const EARTH_RADIUS_MILES = 3958.7613

export function hasUsableCoordinates(location: Coordinates | null): location is Coordinates {
  return location !== null && Number.isFinite(location.lat) && Number.isFinite(location.lon)
    && Math.abs(location.lat) <= 90 && Math.abs(location.lon) <= 180
}

/** Great-circle distance between project centers, in statute miles; not a route length. */
export function haversineMiles(left: Coordinates, right: Coordinates): number {
  if (!hasUsableCoordinates(left) || !hasUsableCoordinates(right)) {
    throw new RangeError("Project centers must have valid WGS84 coordinates.")
  }
  const radians = Math.PI / 180
  const deltaLatitude = (right.lat - left.lat) * radians
  const deltaLongitude = (right.lon - left.lon) * radians
  const a = Math.sin(deltaLatitude / 2) ** 2
    + Math.cos(left.lat * radians) * Math.cos(right.lat * radians)
    * Math.sin(deltaLongitude / 2) ** 2
  return EARTH_RADIUS_MILES * 2 * Math.asin(Math.sqrt(Math.min(1, Math.max(0, a))))
}
