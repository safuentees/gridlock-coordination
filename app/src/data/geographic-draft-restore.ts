import { z } from "zod"
import { geographicDraftSessionSchema, type GeographicDraftSession } from "@/domain/geographic-drafts"
import type { GeographicDraftRestoreAction, GeographicDraftRestorePreview, GeographicDraftSource } from "@/domain/geographic-draft-restore"

const MAX_BYTES = 80 * 1024 * 1024
const sourcesSchema = z.array(z.object({
  projectId: z.string().min(1), inputFingerprint: z.string().regex(/^[a-f0-9]{64}$/).nullable(),
})).refine(sources => new Set(sources.map(source => source.projectId)).size === sources.length, "Current source identities must be unique.")
type DraftEntry = GeographicDraftSession["entries"][number]
type PreviewEntry = GeographicDraftRestorePreview["entries"][number]

function canonical(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonical)
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0).map(([key, item]) => [key, canonical(item)]))
  return value
}
const equal = (left: unknown, right: unknown): boolean => JSON.stringify(canonical(left)) === JSON.stringify(canonical(right))
const dirty = (entry: DraftEntry): boolean => !equal(entry.draft, entry.baseline)

/** Raw strings are validated as unfinished fields, never converted into accepted geometry. */
export function parseGeographicDraftImport(text: string): GeographicDraftSession {
  if (typeof text !== "string") throw new Error("Choose a geographic draft JSON file.")
  if (new TextEncoder().encode(text).length > MAX_BYTES) throw new Error("Geographic drafts exceed the 80 MiB file limit.")
  let value: unknown
  try { value = JSON.parse(text) } catch { throw new Error("This draft file is not valid JSON.") }
  const result = geographicDraftSessionSchema.safeParse(value)
  if (!result.success) {
    const issue = result.error.issues[0]
    throw new Error(`${issue.path.join(".") || "Draft file"}: ${issue.message}`)
  }
  return result.data
}

function validateSession(session: GeographicDraftSession): GeographicDraftSession {
  let text: string
  try { text = JSON.stringify(session) } catch { throw new Error("Geographic drafts could not be serialized. Keep the current draft copy.") }
  return parseGeographicDraftImport(text)
}

function sourceSnapshot(sources: readonly GeographicDraftSource[]): GeographicDraftSource[] {
  return sourcesSchema.parse(sources).sort((left, right) => left.projectId < right.projectId ? -1 : left.projectId > right.projectId ? 1 : 0)
}

function classify(incoming: DraftEntry, current: DraftEntry | undefined, sources: Map<string, string | null>): PreviewEntry {
  const entry = (action: GeographicDraftRestoreAction, reason: string): PreviewEntry => ({ projectId: incoming.projectId, action, reason })
  if (!dirty(incoming)) return entry("duplicate", "This entry matches its baseline and has no unfinished changes to restore.")
  if (current && equal(current.draft, incoming.draft) && equal(current.baseline, incoming.baseline)) return entry("duplicate", "The same unfinished fields and baseline already exist. The local timestamp is preserved.")
  if (current && dirty(current)) return entry("conflict", "A different unfinished local review already exists. A newer file timestamp does not replace local edits.")
  if (!sources.has(incoming.projectId)) return entry("retain-absent", "This source identity is absent from the current collection. Keep its unfinished fields and original fingerprint for a future return; no source row or geometry is created.")
  const fingerprint = sources.get(incoming.projectId)
  if (fingerprint === null) return entry("not-processed", "This source record is present but its current fingerprint has not been processed. Finish processing and make a new preview.")
  if (fingerprint !== incoming.draft.inputFingerprint) return entry("restore-stale", "Source evidence has changed. Restore the original unfinished fields and fingerprint, requiring explicit re-review before any review can be saved.")
  return entry("restore", "The current source fingerprint matches. Restore these unfinished fields without changing accepted evidence.")
}

export function previewGeographicDraftRestore(current: GeographicDraftSession, incoming: GeographicDraftSession, sources: readonly GeographicDraftSource[]): GeographicDraftRestorePreview {
  const base = validateSession(current), imported = validateSession(incoming), snapshot = sourceSnapshot(sources)
  if (base.mode !== imported.mode) throw new Error("Unfinished drafts must use the same source or demo mode as the active drafts.")
  const existing = new Map(base.entries.map(entry => [entry.projectId, entry]))
  const sourceById = new Map(snapshot.map(source => [source.projectId, source.inputFingerprint]))
  return {
    base, incoming: imported, sources: snapshot,
    entries: imported.entries.map(entry => classify(entry, existing.get(entry.projectId), sourceById)),
  }
}

/** Recompute compatible additions against unchanged inputs; no storage or reviewed-data effects. */
export function mergeGeographicDraftRestore(current: GeographicDraftSession, preview: GeographicDraftRestorePreview, sources: readonly GeographicDraftSource[]): GeographicDraftSession {
  const base = validateSession(current), snapshot = sourceSnapshot(sources)
  if (!equal(base, validateSession(preview.base))) throw new Error("Local unfinished drafts changed after this preview. Make a new preview before restoring.")
  if (!equal(snapshot, sourceSnapshot(preview.sources))) throw new Error("The source collection or processed fingerprints changed after this preview. Make a new preview before restoring.")
  const plan = previewGeographicDraftRestore(base, preview.incoming, snapshot)
  const actions = new Map(plan.entries.map(entry => [entry.projectId, entry.action]))
  const merged = new Map(base.entries.map(entry => [entry.projectId, entry]))
  for (const entry of plan.incoming.entries) {
    const action = actions.get(entry.projectId)
    if (action === "restore" || action === "restore-stale" || action === "retain-absent") merged.set(entry.projectId, entry)
  }
  // The merged session must also fit the same bound, even when both input files fit separately.
  return validateSession({ ...base, entries: [...merged.values()] })
}
