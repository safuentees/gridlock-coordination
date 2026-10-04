interface ControlHost<Control> {
  addControl(control: Control): unknown
  hasControl(control: Control): boolean
  removeControl(control: Control): unknown
}

/** Cancel discarded effect setup before creating an asynchronous GPU attachment. */
export function scheduleMapControl<Control>(map: ControlHost<Control>, create: () => Control, onAttached: (control: Control) => void, onDetached: (control: Control) => void, onError: (error: unknown) => void): () => void {
  let cancelled = false
  let control: Control | null = null
  queueMicrotask(() => {
    if (cancelled) return
    try {
      control = create()
      map.addControl(control)
      onAttached(control)
    } catch (error) { onError(error) }
  })
  return () => {
    cancelled = true
    if (control !== null) {
      onDetached(control)
      if (map.hasControl(control)) map.removeControl(control)
    }
  }
}
