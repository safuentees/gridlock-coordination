import { geographicRunSchema, type GeographicRun } from "@/domain/geography"
import type { DataMode } from "@/domain/schema"

const DATABASE = "gridlock.geographic-evidence.v1"
const STORE = "runs"
const MAX_BYTES = 80 * 1024 * 1024
const unavailable = "Geographic evidence could not be saved in this browser. Download the results to keep this run."
const invalid = "Saved geographic evidence could not be read and has been preserved. This run can be downloaded; the saved copy will not be overwritten."
let writes: Promise<unknown> = Promise.resolve()

export function parseGeographicRun(text: string): GeographicRun {
  if (new TextEncoder().encode(text).length > MAX_BYTES) throw new Error("Geographic evidence exceeds the 80 MiB companion-file limit.")
  return geographicRunSchema.parse(JSON.parse(text))
}

async function transaction<T>(mode: IDBTransactionMode, operation: (store: IDBObjectStore, result: (value: T) => void) => void): Promise<T> {
  return new Promise((resolve, reject) => {
    let database: IDBDatabase | undefined
    let active: IDBTransaction | undefined
    let done = false
    const fail = (message = unavailable) => {
      if (done) return
      done = true; clearTimeout(timer)
      try { active?.abort() } catch { /* Already completed. */ }
      database?.close(); reject(new Error(message))
    }
    const timer = setTimeout(() => fail(), 10_000)
    let request: IDBOpenDBRequest
    try { request = indexedDB.open(DATABASE, 1) } catch { fail(); return }
    request.onerror = () => fail()
    request.onblocked = () => fail()
    request.onupgradeneeded = () => {
      if (done) { request.transaction?.abort(); return }
      if (!request.result.objectStoreNames.contains(STORE)) request.result.createObjectStore(STORE)
    }
    request.onsuccess = () => {
      database = request.result
      if (done) { database.close(); return }
      database.onversionchange = () => database?.close()
      try {
        active = database.transaction(STORE, mode)
        let result: T
        let supplied = false
        active.onerror = () => fail()
        active.onabort = () => fail()
        active.oncomplete = () => {
          if (done) return
          if (!supplied) { fail(); return }
          done = true; clearTimeout(timer); database?.close(); resolve(result)
        }
        operation(active.objectStore(STORE), value => { result = value; supplied = true })
      } catch (error) { fail(error instanceof Error ? error.message : unavailable) }
    }
  })
}

export async function readGeographySession(mode: DataMode): Promise<{ run: GeographicRun | null; error: string | null; writeBlocked: boolean }> {
  await writes
  try {
    const rows = await transaction<unknown[]>("readonly", (store, result) => {
      const request = store.getAll(mode, 1); request.onsuccess = () => result(request.result)
    })
    if (!rows.length) return { run: null, error: null, writeBlocked: false }
    try {
      if (typeof rows[0] !== "string") throw new Error()
      const run = parseGeographicRun(rows[0])
      if (run.mode !== mode) throw new Error()
      return { run, error: null, writeBlocked: false }
    } catch { return { run: null, error: invalid, writeBlocked: true } }
  } catch { return { run: null, error: unavailable, writeBlocked: true } }
}

export function saveGeographySession(run: GeographicRun, writeBlocked = false): Promise<string | null> {
  if (writeBlocked) return Promise.resolve(invalid)
  let serialized: string
  try { serialized = JSON.stringify(parseGeographicRun(JSON.stringify(run))) }
  catch { return Promise.resolve("Geographic evidence failed validation or exceeded its file limit. The previous saved run is preserved.") }
  const save = writes.then(async () => {
    let invalidExisting = false
    try {
      await transaction<void>("readwrite", (store, result) => {
        const request = store.getAll(run.mode, 1)
        request.onsuccess = () => {
          try {
            if (request.result.length) {
              if (typeof request.result[0] !== "string" || parseGeographicRun(request.result[0]).mode !== run.mode) throw new Error()
            }
            store.put(serialized, run.mode); result(undefined)
          } catch { invalidExisting = true; store.transaction.abort() }
        }
      })
      return null
    } catch { return invalidExisting ? invalid : unavailable }
  })
  writes = save.then(() => undefined, () => undefined)
  return save
}

export function downloadGeographicRun(run: GeographicRun): void {
  const validated = parseGeographicRun(JSON.stringify(run))
  const url = URL.createObjectURL(new Blob([JSON.stringify(validated, null, 2) + "\n"], { type: "application/json" }))
  const anchor = document.createElement("a"); anchor.href = url
  anchor.download = `gridlock-${run.mode}-geographic-evidence.json`; anchor.click()
  setTimeout(() => URL.revokeObjectURL(url), 0)
}
