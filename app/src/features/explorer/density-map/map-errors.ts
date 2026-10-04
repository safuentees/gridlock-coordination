type Fields = Record<string, unknown>
function fields(value: unknown): Fields { return value !== null && typeof value === "object" ? value as Fields : {} }
function tileKey(event: Fields): string | null {
  const key = fields(fields(event.tile).tileID).key
  return typeof key === "string" || typeof key === "number" ? `tile:${key}` : null
}
export function mapErrorMessage(error: unknown): string {
  const message = fields(error).message
  return (typeof message === "string" && message.trim() ? message : "Unknown map error").slice(0, 300)
}
export function mapErrorDetails(value: unknown): { scope: "basemap" | "map"; key: string; message: string } {
  const event = fields(value)
  return { scope: event.sourceId === "osm" ? "basemap" : "map", key: tileKey(event) ?? "source", message: mapErrorMessage(event.error) }
}
/** A source can be 'loaded' while its tiles are errored. Clear only confirmed recovery. */
export function recoveredBasemapKey(value: unknown): string | null {
  const event = fields(value)
  if (event.sourceId !== "osm") return null
  if (fields(event.tile).state === "loaded") return tileKey(event)
  return event.sourceDataType === "metadata" && event.isSourceLoaded === true ? "source" : null
}
