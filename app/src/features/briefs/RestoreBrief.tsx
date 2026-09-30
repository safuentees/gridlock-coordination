import { useEffect, useId, useMemo, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { DataMode } from "@/domain/schema"
import { MAX_BRIEF_BYTES, mergeRestored, parseBrief, previewRestore, type ParsedBrief } from "./restore"
import type { SavedOpportunity } from "./storage"

export interface RestoreBriefProps {
  mode: DataMode
  records: SavedOpportunity[]
  dirtyIds: ReadonlySet<string>
  onRestore: (records: SavedOpportunity[]) => void
}

export function RestoreBrief(props: RestoreBriefProps) {
  return <RestorePanel key={props.mode} {...props} />
}
function RestorePanel({ mode, records, dirtyIds, onRestore }: RestoreBriefProps) {
  const fieldId = useId()
  const fileInput = useRef<HTMLInputElement>(null)
  const request = useRef(0)
  const [brief, setBrief] = useState<ParsedBrief | null>(null)
  const [replacementIds, setReplacementIds] = useState<Set<string>>(new Set())
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const preview = useMemo(() => brief ? previewRestore(brief, records, dirtyIds) : null, [brief, records, dirtyIds])
  const replacementCount = preview?.duplicates.filter(({ incoming, dirty }) => !dirty && replacementIds.has(incoming.id)).length ?? 0
  const restoreCount = (preview?.additions.length ?? 0) + replacementCount
  useEffect(() => () => { request.current += 1 }, [])

  function restore() {
    if (!brief || !preview || !restoreCount) return
    try {
      onRestore(mergeRestored(records, brief, replacementIds, dirtyIds))
      setNotice(`Restored ${preview.additions.length} new ${preview.additions.length === 1 ? "finding" : "findings"}; replaced ${replacementCount}.`)
      setBrief(null)
      setReplacementIds(new Set())
      if (fileInput.current) fileInput.current.value = ""
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "The findings could not be restored.")
    }
  }

  return <section aria-label="Restore saved findings" className="flex h-full min-h-0 min-w-0 flex-col gap-4 overflow-hidden">
    <div className="shrink-0 space-y-2">
      <Label htmlFor={`${fieldId}-file`}>Restore {mode === "demo" ? "demo" : "source"} JSON brief (up to 10 MB)</Label>
      <Input ref={fileInput} id={`${fieldId}-file`} type="file" accept=".json,application/json" onChange={async event => {
        const file = event.target.files?.[0]
        const token = ++request.current
        setBrief(null); setReplacementIds(new Set()); setError(null); setNotice(null); setBusy(false)
        if (!file) return
        if (file.size > MAX_BRIEF_BYTES) { setError("Choose a JSON brief no larger than 10 MB."); return }
        setBusy(true)
        try {
          const parsed = parseBrief(await file.text(), mode)
          if (token === request.current) setBrief(parsed)
        } catch (failure) {
          if (token === request.current) setError(failure instanceof Error ? failure.message : "The brief could not be read.")
        } finally { if (token === request.current) setBusy(false) }
      }} />
      <p className="text-xs text-muted-foreground">Findings retain their saved evidence and scenario. Your current dataset stays unchanged.</p>
    </div>
    <div className="min-h-0 min-w-0 flex-1 space-y-4 overflow-auto overscroll-contain [overflow-wrap:anywhere]">
      {busy && <p role="status" className="text-sm">Reading brief…</p>}
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      {notice && <p role="status" className="text-sm">{notice}</p>}
      {preview && brief && <>
        <div className="space-y-1">
          <p className="text-sm">{preview.additions.length} additions · {preview.duplicates.length} duplicates · {preview.rejected.length} rejected{preview.blockedAdditions.length > 0 && ` · ${preview.blockedAdditions.length} blocked by unsaved drafts`}</p>
          <p className="text-xs text-muted-foreground">Brief exported {brief.exportedAt.slice(0, 10)}. Existing findings are kept unless you select a replacement.</p>
        </div>
        {(preview.additions.length > 0 || preview.duplicates.length > 0 || preview.blockedAdditions.length > 0) && <ul className="min-w-0 divide-y rounded-lg border">
          {preview.additions.map(record => <li className="space-y-2 p-3" key={record.id}><FindingSummary record={record} /><p className="text-xs text-muted-foreground">Add finding</p></li>)}
          {preview.duplicates.map(({ incoming, existing, dirty }, index) => <li className="space-y-3 p-3" key={incoming.id}>
            <FindingSummary record={incoming} />
            <p className="text-xs text-muted-foreground">Existing review: {existing.reviewState}; last saved {existing.updatedAt.slice(0, 10)}.</p>
            <div className="flex items-center gap-2">
              <Checkbox id={`${fieldId}-replace-${index}`} checked={!dirty && replacementIds.has(incoming.id)} disabled={dirty} onCheckedChange={checked => setReplacementIds(previous => {
                const next = new Set(previous)
                if (checked === true) next.add(incoming.id)
                else next.delete(incoming.id)
                return next
              })} />
              <Label htmlFor={`${fieldId}-replace-${index}`}>Replace existing finding and notes</Label>
            </div>
            {dirty && <p className="text-xs text-muted-foreground">Unsaved draft retained; replacement blocked.</p>}
          </li>)}
          {preview.blockedAdditions.map(record => <li className="space-y-2 p-3" key={record.id}><FindingSummary record={record} /><p className="text-xs text-muted-foreground">An unsaved draft for this pair is retained; restoration blocked.</p></li>)}
        </ul>}
        {preview.rejected.length > 0 && <div className="space-y-2"><h3 className="text-sm font-medium">Rejected findings</h3><ul className="space-y-2 text-xs text-muted-foreground">{preview.rejected.map(record => <li key={record.position}>Finding {record.position}{record.id ? ` (${record.id})` : ""}: {record.reason}</li>)}</ul></div>}
        {brief.records.length === 0 && preview.rejected.length === 0 && <p className="text-sm text-muted-foreground">This brief contains no saved findings.</p>}
      </>}
    </div>
    <div className="flex shrink-0 flex-wrap items-center gap-3 border-t pt-3">
      <Button type="button" disabled={busy || !restoreCount} onClick={restore}>{restoreCount ? `Restore ${restoreCount} ${restoreCount === 1 ? "finding" : "findings"}` : "Restore findings"}</Button>
      {preview && restoreCount > 0 && <p className="text-xs text-muted-foreground">{preview.additions.length} new; {replacementCount} replacements.</p>}
      {preview && !restoreCount && preview.duplicates.some(({ dirty }) => !dirty) && <p className="text-xs text-muted-foreground">Choose a replacement to restore an existing finding.</p>}
    </div>
  </section>
}

function FindingSummary({ record }: { record: SavedOpportunity }) {
  return <div className="space-y-1">
    <p className="text-sm font-medium">{record.projects[0].name}<span className="block">↔ {record.projects[1].name}</span></p>
    <p className="text-xs text-muted-foreground">Saved {record.savedAt.slice(0, 10)} · {record.reviewState}</p>
    <p className="text-xs text-muted-foreground">Saved scenario: &lt;{record.options.radiusMiles} mi; {record.options.maxDateGapDays === null ? "any milestone gap" : `≤${record.options.maxDateGapDays} days`}; {record.options.includeUnverified ? "unverified locations included" : "confirmed locations required"}.</p>
    {record.investigation?.objective && <p className="text-xs">{record.investigation.objective}</p>}
  </div>
}
