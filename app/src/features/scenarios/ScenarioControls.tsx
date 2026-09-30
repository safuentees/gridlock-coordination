import { useId, useState, type FormEvent } from "react"
import { SlidersHorizontalIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DEFAULT_OPTIONS, type AnalysisOptions, type AnalysisResult } from "@/domain/schema"

export function ScenarioControls({ options, baseline, analysis, onApply }: {
  options: AnalysisOptions; baseline: AnalysisResult; analysis: AnalysisResult; onApply: (options: AnalysisOptions) => void;
}) {
  const formId = useId()
  const [open, setOpen] = useState(false)
  // Drafts live outside the dialog body so closing a secondary view does not erase edits.
  const [radius, setRadius] = useState(String(options.radiusMiles))
  const [limitDates, setLimitDates] = useState(options.maxDateGapDays !== null)
  const [dateGap, setDateGap] = useState(String(options.maxDateGapDays ?? 365))
  const [includeUnverified, setIncludeUnverified] = useState(options.includeUnverified)
  const [error, setError] = useState<string | null>(null)
  const baselineIds = new Set(baseline.opportunities.map((pair) => pair.id))
  const activeIds = new Set(analysis.opportunities.map((pair) => pair.id))
  const added = analysis.opportunities.filter((pair) => !baselineIds.has(pair.id)).length
  const removed = baseline.opportunities.filter((pair) => !activeIds.has(pair.id)).length
  function apply(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const radiusMiles = Number(radius)
    const maxDateGapDays = limitDates ? Number(dateGap) : null
    if (!radius.trim() || !Number.isFinite(radiusMiles) || radiusMiles <= 0) { setError("Enter a radius greater than zero."); return }
    if (limitDates && (!dateGap.trim() || maxDateGapDays === null || !Number.isFinite(maxDateGapDays) || maxDateGapDays < 0 || !Number.isInteger(maxDateGapDays))) { setError("Enter a whole number of days, zero or greater."); return }
    setError(null)
    onApply({ radiusMiles, maxDateGapDays, includeUnverified })
  }
  function reset() {
    setRadius(String(DEFAULT_OPTIONS.radiusMiles)); setLimitDates(false); setDateGap("365"); setIncludeUnverified(true); setError(null)
    onApply({ ...DEFAULT_OPTIONS })
  }
  return <Dialog open={open} onOpenChange={setOpen}>
    <DialogTrigger asChild><Button variant="outline"><SlidersHorizontalIcon aria-hidden="true" data-icon="inline-start" />Edit scenario</Button></DialogTrigger>
    <DialogContent className="flex max-h-[calc(100dvh-2rem)] min-h-0 flex-col overflow-hidden sm:max-w-2xl">
      <DialogHeader className="shrink-0 pr-8"><DialogTitle>Coordination scenario</DialogTitle><DialogDescription>Adjust which project pairs qualify.</DialogDescription></DialogHeader>
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain" tabIndex={0} role="region" aria-label="Scenario settings">
        <form id={formId} className="space-y-4" onSubmit={apply}>
          <div className="space-y-2"><Label htmlFor="scenario-radius">Radius (miles)</Label><Input id="scenario-radius" type="number" min="0" step="any" value={radius} onChange={(event) => setRadius(event.target.value)} required /><p className="text-xs text-muted-foreground">Strictly less than this distance.</p></div>
          <div className="space-y-2"><div className="flex items-center gap-2"><Checkbox id="scenario-limit-date" checked={limitDates} onCheckedChange={(value) => setLimitDates(value === true)} /><Label htmlFor="scenario-limit-date">Limit milestone gap (days)</Label></div><Input aria-label="Maximum milestone separation in days" type="number" min="0" step="1" value={dateGap} disabled={!limitDates} onChange={(event) => setDateGap(event.target.value)} /><p className="text-xs text-muted-foreground">Includes the maximum; excludes missing and partial dates.</p></div>
          <div className="space-y-2"><div className="flex items-center gap-2"><Checkbox id="scenario-unverified" checked={includeUnverified} onCheckedChange={(value) => setIncludeUnverified(value === true)} /><Label htmlFor="scenario-unverified">Include unverified locations</Label></div><p className="text-xs text-muted-foreground">Turn off to require two confirmed locations.</p></div>
          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        </form>
        <section className="space-y-2 border-t pt-4" aria-live="polite" aria-label="Scenario comparison">
          <p className="text-sm font-medium">Compared with defaults</p>
          <div className="flex flex-wrap gap-2"><Badge variant="outline">Default: {baseline.opportunities.length}</Badge><Badge>Applied: {analysis.opportunities.length}</Badge><Badge variant="secondary">{added} added</Badge><Badge variant="secondary">{removed} removed</Badge></div>
          <p className="text-xs text-muted-foreground">Before list filters. {analysis.summary.excludedUnverified.toLocaleString()} pairs excluded for unverified locations.</p>
        </section>
      </div>
      <DialogFooter className="shrink-0"><Button type="button" variant="outline" onClick={reset}>Reset defaults</Button><Button type="submit" form={formId}>Apply scenario</Button></DialogFooter>
    </DialogContent>
  </Dialog>
}
