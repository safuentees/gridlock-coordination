import type { GeographicRun } from "./geography"

export type GeographicRestoreAction = "restore-review" | "retain-review" | "duplicate" | "conflict" | "stale" | "unreviewed"
export interface GeographicRestorePreview {
  base: GeographicRun
  incoming: GeographicRun
  protectedProjectIds: string[]
  entries: { projectId: string; action: GeographicRestoreAction; reason: string }[]
}
