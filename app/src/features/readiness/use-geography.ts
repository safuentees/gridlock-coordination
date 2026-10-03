import { useEffect, useRef, useState } from "react"
import type { Dataset } from "@/domain/schema"
import { geographicReferenceBundleSchema, type GeographicReferenceBundle, type GeographicRun } from "@/domain/geography"
import { enrichCollection } from "@/enrichment"
import { reviewGeographicOutcome, type GeographicReviewInput } from "@/enrichment/review"
import { downloadGeographicRun, readGeographySession, saveGeographySession } from "@/data/geography-session"

let referencePromise: Promise<GeographicReferenceBundle> | null = null
function loadReferences(): Promise<GeographicReferenceBundle> {
  referencePromise ??= fetch(new URL("../../data/geography/references.json", import.meta.url)).then(async response => {
    if (!response.ok) throw new Error("Geographic references could not be loaded. Retry processing.")
    return geographicReferenceBundleSchema.parse(await response.json())
  }).catch(error => { referencePromise = null; throw error })
  return referencePromise
}

export function useGeography(dataset: Dataset) {
  const [revision, setRevision] = useState(0)
  const [state, setState] = useState<{ base: Dataset; run: GeographicRun | null; busy: boolean; progress: {processed:number;total:number} | null; error: string | null }>({ base: dataset, run: null, busy: true, progress: null, error: null })
  const cached = useRef<Partial<Record<Dataset["mode"], GeographicRun>>>({})
  useEffect(() => {
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
  const current = state.base === dataset ? state : {run:null,busy:true,progress:null,error:null}
  const onReview = async (projectId: string, input: GeographicReviewInput) => {
    const latest = cached.current[dataset.mode] ?? current.run
    if (!latest || latest.mode !== dataset.mode) return
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
  return { ...current, onProcess: () => setRevision(value => value + 1), onReview, onDownload: () => {
    if (!current.run) return
    try { downloadGeographicRun(current.run) }
    catch (error) { setState(previous => ({...previous,error:error instanceof Error ? error.message : "The geographic evidence could not be downloaded."})) }
  } }
}
