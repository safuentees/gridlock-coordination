import { useEffect, useRef } from "react"
import { useMap } from "react-map-gl/maplibre"
import { MapLibreOverlay, type MapLibreOverlayProps } from "@deck.gl/maplibre"

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
    const map = current.getMap()
    let cancelled = false
    let control: MapLibreOverlay | null = null
    queueMicrotask(() => {
      if (cancelled) return
      try {
        control = new MapLibreOverlay(latestProps.current)
        map.addControl(control)
        overlay.current = control
      } catch (error) {
        latestProps.current.onError?.(error instanceof Error ? error : new Error(String(error)))
      }
    })
    return () => {
      cancelled = true
      if (overlay.current === control) overlay.current = null
      if (control && map.hasControl(control)) map.removeControl(control)
    }
  }, [current])
  return null
}
