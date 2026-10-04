import { useEffect, useRef } from "react"
import { useMap } from "react-map-gl/maplibre"
import { MapLibreOverlay, type MapLibreOverlayProps } from "@deck.gl/maplibre"
import { scheduleMapControl } from "./overlay-lifecycle"

// MapLibre owns camera/input. Cancel StrictMode's replay before an asynchronous
// luma device attachment starts against the same WebGL context a second time.
export function DeckOverlay(props: MapLibreOverlayProps) {
  const { current } = useMap()
  const overlay = useRef<MapLibreOverlay | null>(null)
  const latestProps = useRef(props)
  useEffect(() => {
    latestProps.current = props
    overlay.current?.setProps(props)
  }, [props])
  useEffect(() => {
    if (!current) return
    return scheduleMapControl(current.getMap(),
      () => new MapLibreOverlay(latestProps.current),
      control => { overlay.current = control },
      control => { if (overlay.current === control) overlay.current = null },
      error => { latestProps.current.onError?.(error instanceof Error ? error : new Error(String(error))) },
    )
  }, [current])
  return null
}
