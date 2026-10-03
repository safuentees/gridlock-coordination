import { useCallback, useEffect, useMemo, useRef, useState, type SetStateAction } from "react"
import { downloadGeographicDrafts, readGeographicDrafts, saveGeographicDrafts } from "@/data/geography-drafts"
import type { GeographicDraftSession, GeographicReviewDraft } from "@/domain/geographic-drafts"
import type { DataMode } from "@/domain/schema"

export interface ReviewState {
  tab: "evidence" | "review"
  draft?: GeographicReviewDraft
  baseline?: GeographicReviewDraft
  updatedAt?: string
  error?: string
  notice?: string
}
type Reviews = Record<string, ReviewState>
type StorageState = { error: string | null; writeBlocked: boolean }
const MODES = ["real", "demo"] as const
const emptySession = (mode: DataMode): GeographicDraftSession => ({ version: 1, mode, entries: [] })
export function reviewIsDirty(state: ReviewState): boolean {
  return !!state.draft && !!state.baseline && JSON.stringify(state.draft) !== JSON.stringify(state.baseline)
}
function sessionFor(mode: DataMode, reviews: Reviews): GeographicDraftSession {
  return { version: 1, mode, entries: Object.entries(reviews).flatMap(([key, state]) => {
    const [draftMode, projectId] = JSON.parse(key) as [DataMode, string]
    return draftMode === mode && reviewIsDirty(state) && state.draft && state.baseline && state.updatedAt
      ? [{ projectId, draft: state.draft, baseline: state.baseline, updatedAt: state.updatedAt }] : []
  }).sort((left, right) => left.projectId.localeCompare(right.projectId)) }
}

export function useGeographicDrafts(activeMode: DataMode) {
  const [reviews, setRawReviews] = useState<Reviews>({})
  const [hydrated, setHydrated] = useState(false)
  const [storage, setStorage] = useState<Record<DataMode, StorageState>>({ real: { error: null, writeBlocked: false }, demo: { error: null, writeBlocked: false } })
  const [retry, setRetry] = useState(0)
  const dismissed = useRef(new Set<string>())
  const urgentWrite = useRef(false)
  const lastSaved = useRef<Record<DataMode, string | null>>({ real: null, demo: null })
  const inFlight = useRef<Record<DataMode, string | null>>({ real: null, demo: null })
  const latestReviews = useRef(reviews)
  latestReviews.current = reviews
  const mounted = useRef(false)
  useEffect(() => { mounted.current = true; return () => { mounted.current = false } }, [])

  const setReviews = useCallback((update: SetStateAction<Reviews>) => {
    const updatedAt = new Date().toISOString()
    setRawReviews(previous => {
      const next = typeof update === "function" ? update(previous) : update
      return Object.fromEntries(Object.entries(next).map(([key, state]) => {
        const prior = previous[key]
        const changed = JSON.stringify(state.draft) !== JSON.stringify(prior?.draft) || JSON.stringify(state.baseline) !== JSON.stringify(prior?.baseline)
        return [key, reviewIsDirty(state) && (changed || !state.updatedAt) ? { ...state, updatedAt } : state]
      }))
    })
  }, [])
  // Explicit save/discard must not be undone by a late initial read.
  const dismissStoredDraft = useCallback((key: string) => { dismissed.current.add(key); urgentWrite.current = true }, [])

  useEffect(() => {
    let cancelled = false
    void Promise.all(MODES.map(async mode => {
      try { return { mode, ...await readGeographicDrafts(mode) } }
      catch { return { mode, session: null, error: "Browser draft storage could not be read. Current work remains in this tab; download drafts before leaving.", writeBlocked: true } }
    })).then(results => {
      const loaded: Reviews = {}
      const nextStorage = { real: { error: null, writeBlocked: false }, demo: { error: null, writeBlocked: false } } as Record<DataMode, StorageState>
      for (const result of results) {
        nextStorage[result.mode] = { error: result.error, writeBlocked: result.writeBlocked }
        for (const entry of result.session?.entries ?? []) {
          if (reviewIsDirty({ tab: "review", ...entry })) loaded[JSON.stringify([result.mode, entry.projectId])] = { tab: "review", draft: entry.draft, baseline: entry.baseline, updatedAt: entry.updatedAt }
        }
        // Compare with the actual stored payload so old clean entries can be removed.
        if (!cancelled) lastSaved.current[result.mode] = JSON.stringify({ ...(result.session ?? emptySession(result.mode)), entries: [...(result.session?.entries ?? [])].sort((left, right) => left.projectId.localeCompare(right.projectId)) })
      }
      function mergeLoaded(previous: Reviews): Reviews {
        const next = { ...previous }
        for (const [key, state] of Object.entries(loaded)) {
          if (dismissed.current.has(key) || (previous[key] && reviewIsDirty(previous[key]))) continue
          next[key] = { ...state, tab: previous[key]?.tab ?? state.tab }
        }
        return next
      }
      if (cancelled) {
        // If unmounted during the first read, finish the safe merge before persisting
        // edits made while it was pending. A replacement StrictMode effect owns its read.
        if (!mounted.current) {
          const merged = mergeLoaded(latestReviews.current)
          for (const result of results) {
            if (result.writeBlocked) continue
            const session = sessionFor(result.mode, merged)
            const stored = { ...(result.session ?? emptySession(result.mode)), entries: [...(result.session?.entries ?? [])].sort((left, right) => left.projectId.localeCompare(right.projectId)) }
            if (JSON.stringify(session) !== JSON.stringify(stored)) void saveGeographicDrafts(session).catch(() => undefined)
          }
        }
        return
      }
      setRawReviews(mergeLoaded)
      setStorage(nextStorage)
      setHydrated(true)
    })
    return () => { cancelled = true }
  }, [])

  // Include absent source identities; only an explicit save/discard removes unfinished work.
  const sessions = useMemo(() => ({ real: sessionFor("real", reviews), demo: sessionFor("demo", reviews) }), [reviews])
  const realSnapshot = JSON.stringify(sessions.real)
  const demoSnapshot = JSON.stringify(sessions.demo)
  const blockedReal = storage.real.writeBlocked
  const blockedDemo = storage.demo.writeBlocked
  const latest = useRef({ hydrated, snapshots: { real: realSnapshot, demo: demoSnapshot }, blocked: { real: blockedReal, demo: blockedDemo } })
  latest.current = { hydrated, snapshots: { real: realSnapshot, demo: demoSnapshot }, blocked: { real: blockedReal, demo: blockedDemo } }
  const persist = useCallback(() => {
    const current = latest.current
    if (!current.hydrated) return
    urgentWrite.current = false
    for (const mode of MODES) {
      const snapshot = current.snapshots[mode]
      if (current.blocked[mode] || inFlight.current[mode] === snapshot || (!inFlight.current[mode] && lastSaved.current[mode] === snapshot)) continue
      // A pending older write can reintroduce a saved/discarded draft. Queue the
      // latest snapshot even when it matches the last completed save.
      inFlight.current[mode] = snapshot
      void saveGeographicDrafts(JSON.parse(snapshot) as GeographicDraftSession).catch(() => "Drafts could not be saved. Download drafts before leaving this tab.").then(error => {
        if (inFlight.current[mode] === snapshot) inFlight.current[mode] = null
        if (!error) lastSaved.current[mode] = snapshot
        if (mounted.current) {
          setStorage(previous => ({ ...previous, [mode]: { ...previous[mode], error } }))
          if (!error && latest.current.snapshots[mode] !== snapshot) setRetry(value => value + 1)
        }
      })
    }
  }, [])
  useEffect(() => {
    if (!hydrated) return
    const timer = window.setTimeout(persist, urgentWrite.current ? 0 : 500)
    return () => window.clearTimeout(timer)
  }, [hydrated, realSnapshot, demoSnapshot, blockedReal, blockedDemo, retry, persist])
  // Flush before navigation/backgrounding where possible; abrupt browser termination
  // still cannot guarantee an asynchronous IndexedDB transaction will finish.
  useEffect(() => {
    const onHidden = () => { if (document.visibilityState === "hidden") persist() }
    window.addEventListener("pagehide", persist)
    document.addEventListener("visibilitychange", onHidden)
    return () => {
      window.removeEventListener("pagehide", persist)
      document.removeEventListener("visibilitychange", onHidden)
      persist()
    }
  }, [activeMode, persist])

  function download(mode: DataMode) {
    try { downloadGeographicDrafts(sessions[mode]) }
    catch (failure) { setStorage(previous => ({ ...previous, [mode]: { ...previous[mode], error: failure instanceof Error ? failure.message : "Drafts could not be downloaded. Keep this tab open to preserve your work." } })) }
  }
  return { reviews, setReviews, dismissStoredDraft, hydrated, storage, download, retrySave: () => setRetry(value => value + 1) }
}
