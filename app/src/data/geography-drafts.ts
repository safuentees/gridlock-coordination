import { geographicDraftSessionSchema, type GeographicDraftSession } from "@/domain/geographic-drafts"
import type { DataMode } from "@/domain/schema"

const DATABASE = "gridlock.geographic-drafts.v1"
const STORE = "drafts"
const MAX_BYTES = 80 * 1024 * 1024
const TIMEOUT_MS = 10_000
const UNAVAILABLE = "Browser draft storage is unavailable or full. Your unfinished work remains in this tab; download drafts before leaving."
const PRESERVED = "Saved review drafts could not be read safely and were preserved. The saved copy will not be overwritten; download current drafts to keep unfinished work."
const BLOCKED = "Draft saving is blocked because saved work could not be read safely. Download current drafts before leaving this tab."
const INVALID = "Review drafts failed validation or exceeded the 80 MiB limit. The previous saved drafts are unchanged."

type DraftRead = { session: GeographicDraftSession | null; error: string | null; writeBlocked: boolean }
let writes: Promise<void> = Promise.resolve()

function parseSession(text: unknown, mode?: DataMode): GeographicDraftSession {
  if (typeof text !== "string" || new TextEncoder().encode(text).length > MAX_BYTES) throw new Error(INVALID)
  const session = geographicDraftSessionSchema.parse(JSON.parse(text))
  if (mode !== undefined && session.mode !== mode) throw new Error("Source and demo drafts must remain separate.")
  return session
}

/** A short-lived transaction owns only the unfinished-draft database. */
function transact<T>(mode: IDBTransactionMode, operation: (store: IDBObjectStore, result: (value: T) => void, fail: (message: string) => void) => void): Promise<T> {
  return new Promise((resolve, reject) => {
    let database: IDBDatabase | undefined
    let active: IDBTransaction | undefined
    let request: IDBOpenDBRequest | undefined
    let settled = false
    const fail = (message = UNAVAILABLE) => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      try { active?.abort() } catch { /* An error may already have ended the transaction. */ }
      try { request?.transaction?.abort() } catch { /* An upgrade may already have ended. */ }
      database?.close()
      reject(new Error(message))
    }
    const timer = setTimeout(() => fail("Browser draft storage did not respond in time. Close other Gridlock tabs and retry, or download drafts to preserve this work."), TIMEOUT_MS)
    try { request = indexedDB.open(DATABASE, 1) }
    catch { fail(); return }
    const opening = request
    opening.onerror = () => fail()
    opening.onblocked = () => fail("Browser draft storage is blocked by another tab. Close other Gridlock tabs and retry, or download current drafts.")
    opening.onupgradeneeded = () => {
      if (settled) { opening.transaction?.abort(); return }
      try {
        if (!opening.result.objectStoreNames.contains(STORE)) opening.result.createObjectStore(STORE)
      } catch { fail() }
    }
    opening.onsuccess = () => {
      database = opening.result
      if (settled) { database.close(); return }
      database.onversionchange = () => fail()
      try {
        active = database.transaction(STORE, mode)
        let value: T
        let supplied = false
        active.onerror = () => fail()
        active.onabort = () => fail()
        active.oncomplete = () => {
          if (settled) return
          if (!supplied) { fail(); return }
          settled = true
          clearTimeout(timer)
          database?.close()
          resolve(value)
        }
        operation(active.objectStore(STORE), result => { value = result; supplied = true }, fail)
      } catch { fail() }
    }
  })
}

export async function readGeographicDrafts(mode: DataMode): Promise<DraftRead> {
  if (mode !== "real" && mode !== "demo") return { session: null, error: "Choose source or demo mode before restoring drafts.", writeBlocked: true }
  await writes
  try {
    const rows = await transact<unknown[]>("readonly", (store, result, fail) => {
      // getAll distinguishes absent keys from stored null/undefined, which are malformed.
      const request = store.getAll(mode, 1)
      request.onerror = () => fail(UNAVAILABLE)
      request.onsuccess = () => result(request.result)
    })
    if (!rows.length) return { session: null, error: null, writeBlocked: false }
    try { return { session: parseSession(rows[0], mode), error: null, writeBlocked: false } }
    catch { return { session: null, error: PRESERVED, writeBlocked: true } }
  } catch (error) {
    return { session: null, error: error instanceof Error ? error.message : UNAVAILABLE, writeBlocked: true }
  }
}

export function saveGeographicDrafts(session: GeographicDraftSession, writeBlocked = false): Promise<string | null> {
  if (writeBlocked) return Promise.resolve(BLOCKED)
  let serialized: string, mode: DataMode
  try {
    // Snapshot before queueing: later edits or mode switches cannot alter this write.
    const validated = parseSession(JSON.stringify(session))
    serialized = JSON.stringify(validated)
    mode = validated.mode
  } catch { return Promise.resolve(INVALID) }
  const save = writes.then(async (): Promise<string | null> => {
    try {
      await transact<void>("readwrite", (store, result, fail) => {
        const request = store.getAll(mode, 1)
        request.onerror = () => fail(UNAVAILABLE)
        request.onsuccess = () => {
          // Safety read and write share one transaction, including across open tabs.
          try { if (request.result.length) parseSession(request.result[0], mode) }
          catch { fail(PRESERVED); return }
          try {
            const put = store.put(serialized, mode)
            put.onerror = () => fail(UNAVAILABLE)
            put.onsuccess = () => result(undefined)
          } catch { fail(UNAVAILABLE) }
        }
      })
      return null
    } catch (error) { return error instanceof Error ? error.message : UNAVAILABLE }
  })
  writes = save.then(() => undefined, () => undefined)
  return save
}

export function downloadGeographicDrafts(session: GeographicDraftSession): void {
  const validated = parseSession(JSON.stringify(session))
  // Compact output keeps a valid bounded session inside the same 80 MiB file limit.
  const url = URL.createObjectURL(new Blob([JSON.stringify(validated)], { type: "application/json" }))
  try {
    const anchor = document.createElement("a")
    anchor.href = url
    anchor.download = `gridlock-${validated.mode}-unfinished-geographic-drafts.json`
    anchor.click()
  } finally { setTimeout(() => URL.revokeObjectURL(url), 0) }
}
