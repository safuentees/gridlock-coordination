import { useState, type FormEvent } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DEFAULT_OPTIONS, type AnalysisOptions, type AnalysisResult } from "@/domain/schema"

export function ScenarioControls({ options, baseline, analysis, onApply }: {
  options: AnalysisOptions; baseline: AnalysisResult; analysis: AnalysisResult; onApply: (options: AnalysisOptions) => void;
}) {
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
  return <Card><CardHeader><CardTitle>Coordination scenario</CardTitle><CardDescription>Change eligibility and compare the result with the default 25-mile scenario.</CardDescription></CardHeader><CardContent className="space-y-4">
    <form className="space-y-4" onSubmit={apply}>
      <div className="grid items-start gap-4 sm:grid-cols-3">
        <div className="space-y-2"><Label htmlFor="scenario-radius">Radius (miles)</Label><Input id="scenario-radius" type="number" min="0" step="any" value={radius} onChange={(event) => setRadius(event.target.value)} required /><p className="text-xs text-muted-foreground">Strictly less than this distance.</p></div>
        <div className="space-y-2"><div className="flex items-center gap-2"><Checkbox id="scenario-limit-date" checked={limitDates} onCheckedChange={(value) => setLimitDates(value === true)} /><Label htmlFor="scenario-limit-date">Limit milestone separation</Label></div><Input aria-label="Maximum milestone separation in days" type="number" min="0" step="1" value={dateGap} disabled={!limitDates} onChange={(event) => setDateGap(event.target.value)} /><p className="text-xs text-muted-foreground">Days, inclusive. When enabled, unknown or partial dates are excluded.</p></div>
        <div className="space-y-2"><div className="flex items-center gap-2"><Checkbox id="scenario-unverified" checked={includeUnverified} onCheckedChange={(value) => setIncludeUnverified(value === true)} /><Label htmlFor="scenario-unverified">Include unverified locations</Label></div><p className="text-xs text-muted-foreground">Unchecked requires both centers to be marked confirmed in the records.</p></div>
      </div>
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      <div className="flex flex-wrap items-center gap-2"><Button type="submit">Apply scenario</Button><Button type="button" variant="outline" onClick={reset}>Reset defaults</Button><span className="text-xs text-muted-foreground">Applied: &lt;{options.radiusMiles} mi; {options.maxDateGapDays === null ? "any milestone gap" : `≤${options.maxDateGapDays} days`}; {options.includeUnverified ? "all located evidence" : "confirmed locations only"}</span></div>
    </form>
    <div className="space-y-2 border-t pt-3" aria-live="polite"><div className="flex flex-wrap gap-2"><Badge variant="outline">Default: {baseline.opportunities.length} candidates</Badge><Badge>Current: {analysis.opportunities.length}</Badge><Badge variant="secondary">{added} added</Badge><Badge variant="secondary">{removed} removed</Badge></div><p className="text-xs text-muted-foreground">Comparison uses the full dataset before inventory filters. {analysis.summary.comparedPairs.toLocaleString()} cross-filing pairs considered; {analysis.summary.excludedUnverified.toLocaleString()} excluded by location confidence. {analysis.summary.unlocatedProjects} projects have no usable location.</p></div>
  </CardContent></Card>
}
