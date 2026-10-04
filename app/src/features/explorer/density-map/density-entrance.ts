import { useLayoutEffect, useRef, useState } from "react"

export interface DensityEntranceLatch {
  phase: "pending" | "running" | "complete"
  startedAt: number | null
  finish: (() => void) | null
  onComplete: (() => void) | null
}
export function createDensityEntranceLatch(): DensityEntranceLatch { return { phase: "pending", startedAt: null, finish: null, onComplete: null } }
export function finishDensityEntrance(latch: DensityEntranceLatch): void {
  latch.phase = "complete"
  latch.finish?.()
  latch.onComplete?.()
}
export function densityEntranceProgress(elapsedMs: number): number {
  const t = Math.max(0, Math.min(1, elapsedMs / 1_000))
  return 1 - (1 - t) ** 3
}

/** Only presentation progresses; the retained wrapper owns the session lifetime. */
export function useDensityEntrance(latch: DensityEntranceLatch, ready: boolean, visible: boolean, enabled: boolean): number {
  const [progress, setProgress] = useState(() => latch.phase === "complete" ? 1 : 0)
  const setupGeneration = useRef(0)
  useLayoutEffect(() => {
    const generation = ++setupGeneration.current
    let alive = true
    let frame: number | null = null
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)")
    function cancel() { if (frame !== null) cancelAnimationFrame(frame); frame = null }
    function finish() {
      cancel()
      latch.phase = "complete"
      latch.onComplete?.()
      if (alive) setProgress(1)
    }
    latch.finish = finish
    function motionChanged() { if (reducedMotion.matches) finish() }
    reducedMotion.addEventListener("change", motionChanged)
    if (latch.phase === "complete" || !visible || reducedMotion.matches || (ready && !enabled)) finish()
    else if (ready) {
      latch.phase = "running"
      latch.startedAt ??= performance.now()
      const startedAt = latch.startedAt
      function step(now: number) {
        frame = null
        if (!alive || latch.phase !== "running") return
        const value = densityEntranceProgress(now - startedAt)
        setProgress(value)
        if (value >= 1) finish()
        else frame = requestAnimationFrame(step)
      }
      frame = requestAnimationFrame(step)
    }
    return () => {
      alive = false
      cancel()
      reducedMotion.removeEventListener("change", motionChanged)
      if (latch.finish === finish) latch.finish = null
      // React StrictMode replays setup immediately. Cancel work now, but distinguish
      // that replay from a real unmount before consuming the retained latch.
      queueMicrotask(() => { if (setupGeneration.current === generation) finishDensityEntrance(latch) })
    }
  }, [latch, ready, visible, enabled])
  return latch.phase === "complete" ? 1 : progress
}
