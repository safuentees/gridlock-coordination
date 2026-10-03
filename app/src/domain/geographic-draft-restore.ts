import type { GeographicDraftSession } from "./geographic-drafts"

export interface GeographicDraftSource { projectId: string; inputFingerprint: string | null }
export type GeographicDraftRestoreAction = "restore" | "restore-stale" | "retain-absent" | "duplicate" | "conflict" | "not-processed"
export interface GeographicDraftRestorePreview {
  base: GeographicDraftSession
  incoming: GeographicDraftSession
  sources: GeographicDraftSource[]
  entries: { projectId: string; action: GeographicDraftRestoreAction; reason: string }[]
}
