import type { Dataset } from "@/domain/schema"
import { parseSourceDataset } from "./import"

// This source-only database and the legacy key are independent of saved reviews.
const LEGACY_SOURCE_SESSION_KEY = "gridlock.source-session.v1"
const SOURCE_DATABASE = "gridlock.source-revisions.v1"
const SOURCE_STORE = "revisions"
const SOURCE_RECORD_KEY = "active"
const STORAGE_TIMEOUT_MS = 10_000
const BLOCKED_WRITE_MESSAGE = "Source persistence is blocked because saved data could not be read safely. Download the active dataset to keep this session, or use Restore supplied snapshot to clear its saved revision."
const INVALID_STORED_MESSAGE = "The saved source revision failed validation and was preserved. Apply revisions for this tab only, or use Restore supplied snapshot to clear the saved revision."
const STORAGE_ERROR_MESSAGE = "Browser source storage could not complete the operation; storage may be unavailable or full. The active session can continue. Download the active dataset before leaving this tab."
const OPEN_ERROR_MESSAGE = "Browser source storage is unavailable or blocked. Close other Gridlock tabs and retry, or download the active dataset to keep this session."
const TIMEOUT_MESSAGE = "Browser source storage did not respond in time. Close other Gridlock tabs and retry, or download the active dataset to keep this session."

type SourceSession = { dataset: Dataset | null; error: string | null; writeBlocked: boolean }
let mutations: Promise<void> = Promise.resolve()

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : STORAGE_ERROR_MESSAGE
}

function parseStoredRevision(stored: unknown): Dataset {
  try {
    if (typeof stored !== "string") throw new Error()
    return parseSourceDataset(stored)
  } catch {
    throw new Error(INVALID_STORED_MESSAGE)
  }
}

function readLegacySession(): SourceSession {
  let stored: string | null
  try { stored = localStorage.getItem(LEGACY_SOURCE_SESSION_KEY) }
  catch { return { dataset: null, error: OPEN_ERROR_MESSAGE, writeBlocked: true } }
  if (stored === null) return { dataset: null, error: null, writeBlocked: false }
  try { return { dataset: parseStoredRevision(stored), error: null, writeBlocked: false } }
  catch { return { dataset: null, error: INVALID_STORED_MESSAGE, writeBlocked: true } }
}

function openSourceDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    let request: IDBOpenDBRequest
    try { request = indexedDB.open(SOURCE_DATABASE, 1) }
    catch { reject(new Error(OPEN_ERROR_MESSAGE)); return }
    let settled = false
    const finishError = (message: string) => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      try { request.transaction?.abort() } catch { /* An open error may already have ended the upgrade. */ }
      reject(new Error(message))
    }
    const timer = setTimeout(() => finishError(TIMEOUT_MESSAGE), STORAGE_TIMEOUT_MS)
    request.onblocked = () => finishError(OPEN_ERROR_MESSAGE)
    request.onerror = () => finishError(OPEN_ERROR_MESSAGE)
    request.onupgradeneeded = () => {
      // A timed-out/blocked request may resume later; it must not make a late change.
      if (settled) { request.transaction?.abort(); return }
      try {
        if (!request.result.objectStoreNames.contains(SOURCE_STORE)) request.result.createObjectStore(SOURCE_STORE)
      } catch {
        request.transaction?.abort()
        finishError(OPEN_ERROR_MESSAGE)
      }
    }
    request.onsuccess = () => {
      const database = request.result
      if (settled) { database.close(); return }
      settled = true
      clearTimeout(timer)
      database.onversionchange = () => database.close()
      resolve(database)
    }
  })
}

async function sourceTransaction<T>(mode: IDBTransactionMode, operation: (store: IDBObjectStore, result: (value: T) => void, fail: (message: string) => void) => void): Promise<T> {
  const database = await openSourceDatabase()
  return new Promise((resolve, reject) => {
    let transaction: IDBTransaction
    try { transaction = database.transaction(SOURCE_STORE, mode) }
    catch { database.close(); reject(new Error(STORAGE_ERROR_MESSAGE)); return }
    let settled = false
    let result: T
    let hasResult = false
    const fail = (message: string) => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      try { transaction.abort() } catch { /* It may already have aborted. */ }
      database.close()
      reject(new Error(message))
    }
    const timer = setTimeout(() => fail(TIMEOUT_MESSAGE), STORAGE_TIMEOUT_MS)
    transaction.onabort = () => fail(STORAGE_ERROR_MESSAGE)
    transaction.onerror = () => fail(STORAGE_ERROR_MESSAGE)
    transaction.oncomplete = () => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      database.close()
      if (hasResult) resolve(result)
      else reject(new Error(STORAGE_ERROR_MESSAGE))
    }
    try {
      operation(transaction.objectStore(SOURCE_STORE), value => { result = value; hasResult = true }, fail)
    } catch { fail(STORAGE_ERROR_MESSAGE) }
  })
}

function serializeMutation(operation: () => Promise<string | null>): Promise<string | null> {
  const result = mutations.then(operation).catch(() => STORAGE_ERROR_MESSAGE)
  mutations = result.then(() => undefined)
  return result
}

export async function readSourceSession(): Promise<SourceSession> {
  await mutations
  let stored: unknown[]
  try {
    stored = await sourceTransaction<unknown[]>("readonly", (store, result) => {
      // An empty result is absent; a stored undefined/null is malformed, not absent.
      const request = store.getAll(SOURCE_RECORD_KEY, 1)
      request.onsuccess = () => result(request.result)
    })
  } catch (error) {
    const legacy = readLegacySession()
    return { dataset: legacy.dataset, error: legacy.error ?? errorMessage(error), writeBlocked: true }
  }
  if (!stored.length) return readLegacySession()
  try { return { dataset: parseStoredRevision(stored[0]), error: null, writeBlocked: false } }
  catch { return { dataset: null, error: INVALID_STORED_MESSAGE, writeBlocked: true } }
}

export async function saveSourceSession(dataset: Dataset, writeBlocked = false): Promise<string | null> {
  if (writeBlocked) return BLOCKED_WRITE_MESSAGE
  let serialized: string
  try {
    // Capture this invocation before queuing so later calls cannot alter its payload.
    const proposed = JSON.stringify(dataset)
    if (typeof proposed !== "string") throw new Error()
    serialized = JSON.stringify(parseSourceDataset(proposed))
  } catch {
    return "The source revision failed validation or exceeded the import size limit and was not stored. Use a valid source dataset to save a revision."
  }
  return serializeMutation(async () => {
    try {
      await sourceTransaction<void>("readwrite", (store, result, fail) => {
        const request = store.getAll(SOURCE_RECORD_KEY, 1)
        request.onsuccess = () => {
          // Validation and put share a transaction: another tab cannot replace the
          // saved revision between the safety read and this write.
          try {
            if (request.result.length) parseStoredRevision(request.result[0])
            else {
              const legacy = readLegacySession()
              if (legacy.writeBlocked) { fail(legacy.error ?? BLOCKED_WRITE_MESSAGE); return }
            }
          } catch { fail(INVALID_STORED_MESSAGE); return }
          try {
            store.put(serialized, SOURCE_RECORD_KEY)
            result(undefined)
          } catch { fail(STORAGE_ERROR_MESSAGE) }
        }
      })
      // Legacy data stays intact. Only explicit reset removes it.
      return null
    } catch (error) { return errorMessage(error) }
  })
}

export async function clearSourceSession(): Promise<string | null> {
  return serializeMutation(async () => {
    let legacyError: string | null = null
    try { localStorage.removeItem(LEGACY_SOURCE_SESSION_KEY) }
    catch { legacyError = "The legacy source revision could not be cleared because browser storage is unavailable." }
    try {
      await sourceTransaction<void>("readwrite", (store, result) => {
        store.delete(SOURCE_RECORD_KEY)
        result(undefined)
      })
      return legacyError
    } catch (error) {
      return `${legacyError ? `${legacyError} ` : ""}The saved source revision could not be fully cleared. ${errorMessage(error)}`
    }
  })
}
