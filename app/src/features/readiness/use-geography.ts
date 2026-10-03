import { useEffect, useRef, useState } from "react"
import type { Dataset } from "@/domain/schema"
import { geographicReferenceBundleSchema, type GeographicReferenceBundle, type GeographicRun } from "@/domain/geography"
import { enrichCollection } from "@/enrichment"
import { reviewGeographicOutcome, type GeographicReviewInput } from "@/enrichment/review"
import { previewGeographicRestore, restoreGeographicReviews } from "@/enrichment/restore"
import type { GeographicRestorePreview } from "@/domain/geographic-restore"
import { downloadGeographicRun, parseGeographicRun, readGeographySession, saveGeographySession } from "@/data/geography-session"

let referencePromise: Promise<GeographicReferenceBundle> | null = null
function loadReferences(): Promise<GeographicReferenceBundle> {
  referencePromise ??= fetch(new URL("../../data/geography/references.json", import.meta.url)).then(async response => {
    if (!response.ok) throw new Error("Geographic references could not be loaded. Retry processing.")
    return geographicReferenceBundleSchema.parse(await response.json())
  }).catch(error => { referencePromise = null; throw error })
  return referencePromise
}

export function useGeography(dataset: Dataset | null) {
  const [revision, setRevision] = useState(0)
  const [state, setState] = useState<{ base: Dataset | null; run: GeographicRun | null; busy: boolean; progress: {processed:number;total:number} | null; error: string | null }>({ base: dataset, run: null, busy: Boolean(dataset), progress: null, error: null })
  const cached = useRef<Partial<Record<Dataset["mode"], GeographicRun>>>({})
  const activeDataset = useRef(dataset)
  activeDataset.current = dataset
  useEffect(() => {
    if (!dataset) return
    let cancelled = false
    setState({ base: dataset, run: null, busy: true, progress: {processed:0,total:dataset.projects.length}, error: null })
    void (async () => {
      try {
        const [references, saved] = await Promise.all([loadReferences(), readGeographySession(dataset.mode)])
        if (cancelled) return
        const run = await enrichCollection(dataset, references, {
          previous: cached.current[dataset.mode] ?? saved.run,
          onProgress: (processed, total) => { if (!cancelled) setState(previous => ({...previous, progress: {processed,total}})) },
        })
        if (cancelled) return
        cached.current[dataset.mode] = run
        setState({ base: dataset, run, busy: false, progress: null, error: saved.error })
        const error = saved.writeBlocked ? saved.error : await saveGeographySession(run)
        if (!cancelled && error) setState(previous => ({ ...previous, error }))
      } catch (error) {
        if (!cancelled) setState({ base: dataset, run: null, busy: false, progress: null, error: error instanceof Error ? error.message : "Geographic processing could not finish. Retry processing." })
      }
    })()
    return () => { cancelled = true }
  }, [dataset, revision])
  const current = state.base === dataset ? state : {run:null,busy:Boolean(dataset),progress:null,error:null}
  const onReview = async (projectId: string, input: GeographicReviewInput) => {
    const latest = current.run
    if (!dataset || activeDataset.current !== dataset || current.busy || !latest || latest.mode !== dataset.mode) throw new Error("The active geographic results changed. Reopen this record before reviewing it.")
    try {
      const reviewed = reviewGeographicOutcome(latest, projectId, input)
      cached.current[dataset.mode] = reviewed
      setState(previous => previous.base === dataset ? { ...previous, run: reviewed, error: null } : previous)
      const error = await saveGeographySession(reviewed)
      if (error) {
        setState(previous => previous.base === dataset && previous.run === reviewed ? { ...previous, error } : previous)
        throw new Error(error)
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "This geographic review could not be saved."
      setState(previous => previous.base === dataset ? { ...previous, error: message } : previous)
      throw new Error(message)
    }
  }
  const onPreviewRestore = (text: string, protectedProjectIds: readonly string[]): GeographicRestorePreview => {
    if (!dataset || activeDataset.current !== dataset || current.busy || !current.run) throw new Error("Wait for current geographic processing to finish before previewing reviews.")
    return previewGeographicRestore(current.run, parseGeographicRun(text), protectedProjectIds)
  }
  const onRestore = async (preview: GeographicRestorePreview, protectedProjectIds: readonly string[]) => {
    if (!dataset || activeDataset.current !== dataset || current.busy || !current.run) throw new Error("The active geographic results changed. Make a new preview before restoring.")
    const base = current.run
    const restored = restoreGeographicReviews(base, preview, protectedProjectIds)
    setState(previous => previous.base === dataset && previous.run === base ? { ...previous, busy: true, error: null } : previous)
    try {
      const error = await saveGeographySession(restored)
      if (error) throw new Error(error)
      // A failed Apply keeps both the displayed run and future reruns on the prior decisions.
      cached.current[dataset.mode] = restored
      setState(previous => previous.base === dataset && previous.run === base ? { ...previous, run: restored, busy: false, error: null } : previous)
    } catch (error) {
      const message = error instanceof Error ? error.message : "Geographic reviews could not be restored. The preview is preserved."
      setState(previous => previous.base === dataset && previous.run === base ? { ...previous, busy: false, error: message } : previous)
      throw new Error(message)
    }
  }
  return { ...current, onProcess: () => setRevision(value => value + 1), onReview, onPreviewRestore, onRestore, onDownload: () => {
    if (!current.run) return
    try { downloadGeographicRun(current.run) }
    catch (error) { setState(previous => ({...previous,error:error instanceof Error ? error.message : "The geographic evidence could not be downloaded."})) }
  } }
}

export type GeographyController = ReturnType<typeof useGeography>
