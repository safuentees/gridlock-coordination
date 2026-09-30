import { useControl } from "react-map-gl/maplibre"
import { MapLibreOverlay, type MapLibreOverlayProps } from "@deck.gl/maplibre"

// MapLibre owns the camera and input. Deck only renders/picks the synchronized layers.
export function DeckOverlay(props: MapLibreOverlayProps) {
  const overlay = useControl<MapLibreOverlay>(() => new MapLibreOverlay(props))
  overlay.setProps(props)
  return null
}
