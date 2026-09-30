import { useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getReadiness } from "@/data/readiness"
import type { OutcomesWorkspaceProps } from "@/domain/workspace"
import { sourceEditionLabels } from "@/lib/presentation"

export function OutcomesWorkspace({ dataset, options, analysis, onExplore, onReadiness, onSavedFindings }: OutcomesWorkspaceProps) {
  const readiness = useMemo(() => getReadiness(dataset), [dataset])
  const projectsById = useMemo(() => new Map(dataset.projects.map((project) => [project.id, project])), [dataset])
  const sourceEditions = useMemo(() => sourceEditionLabels(dataset.projects), [dataset])
  const dates = useMemo(() => {
    const counts = { day: 0, month: 0, year: 0, unknown: 0, construction: 0 }
    for (const project of dataset.projects) {
      counts[project.date.precision] += 1
      if (project.buildWindow !== null) counts.construction += 1
    }
    return counts
  }, [dataset])
  const candidateEvidence = useMemo(() => {
    const counts = { unverified: 0, dated: 0, constructionUnknown: 0, constructionOverlap: 0 }
    for (const candidate of analysis.opportunities) {
      if (candidate.locationConfidence === "unverified") counts.unverified += 1
      if (candidate.dateGapDays !== null) counts.dated += 1
      // Availability only: overlap classification stays authoritative in the core output.
      if (candidate.projectIds.some((id) => !projectsById.get(id)?.buildWindow)) counts.constructionUnknown += 1
      if (candidate.timelineRelation === "confirmed-overlap") counts.constructionOverlap += 1
    }
    return counts
  }, [analysis, projectsById])
  const candidateCount = analysis.opportunities.length
  const examples = analysis.opportunities.slice(0, 3)

  return <section className="flex h-full min-h-0 min-w-0 flex-col gap-4 overflow-hidden" aria-label="Supported outcomes">
    <header className="shrink-0 space-y-2">
      <h2 className="text-lg font-semibold">Outcomes</h2>
      <p className="break-words text-sm text-muted-foreground">{sourceEditions.length ? sourceEditions.join(" · ") : dataset.title}</p>
    </header>
    <div className="min-h-0 min-w-0 flex-1 space-y-4 overflow-auto overscroll-contain pb-1 [overflow-wrap:anywhere]" tabIndex={0} role="region" aria-label="Outcome evidence and next steps">
      <Card>
        <CardHeader>
          <CardTitle>{candidateCount ? `${candidateCount.toLocaleString()} ${candidateCount === 1 ? "candidate" : "candidates"} to investigate` : "No candidates under the applied criteria"}</CardTitle>
          <CardDescription>Centers less than {options.radiusMiles} miles apart; {options.maxDateGapDays === null ? "any milestone gap" : `milestone gap up to ${options.maxDateGapDays} days`}; {options.includeUnverified ? "unverified locations included" : "confirmed locations required"}. Before Explore search, filing and location filters.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {candidateCount ? <>
            <p className="text-sm">These pairs support a closer review of nearby projects. They do not establish a shared route or resource compatibility.</p>
            <dl className="grid gap-4 sm:grid-cols-3">
              <div><dt className="text-xs text-muted-foreground">Candidates using unverified centers</dt><dd className="font-medium">{candidateEvidence.unverified.toLocaleString()} of {candidateCount.toLocaleString()}</dd></div>
              <div><dt className="text-xs text-muted-foreground">Candidates with a known milestone gap</dt><dd className="font-medium">{candidateEvidence.dated.toLocaleString()} of {candidateCount.toLocaleString()}</dd></div>
              <div><dt className="text-xs text-muted-foreground">Candidates with unknown construction overlap</dt><dd className="font-medium">{candidateEvidence.constructionUnknown.toLocaleString()} of {candidateCount.toLocaleString()}</dd></div>
            </dl>
          </> : <p className="text-sm">{readiness.missing ? `${readiness.missing.toLocaleString()} projects lack locations and cannot enter proximity analysis. ` : ""}A lack of matches does not rule out coordination opportunities.</p>}
          <Button onClick={() => onExplore()}>{candidateCount ? "Review candidates in Explore" : "Review criteria in Explore"}</Button>
        </CardContent>
      </Card>

      <div className="grid min-w-0 gap-4 lg:grid-cols-2">
        <Card className="min-w-0">
          <CardHeader><CardTitle>Start with the nearest pairs</CardTitle><CardDescription>Open a pair to inspect its sources, project scope and timing.</CardDescription></CardHeader>
          <CardContent>
            {examples.length ? <ol className="divide-y">{examples.map((candidate) => <li key={candidate.id} className="space-y-2 py-3 first:pt-0 last:pb-0">
              <button type="button" className="min-w-0 text-left font-medium underline-offset-4 hover:underline focus-visible:underline" onClick={() => onExplore(candidate.id)}>
                <span className="text-muted-foreground">#{candidate.rank} </span>{projectsById.get(candidate.projectIds[0])?.name ?? "Project unavailable"}
                <span className="block text-sm">↔ {projectsById.get(candidate.projectIds[1])?.name ?? "Project unavailable"}</span>
              </button>
              <dl className="grid grid-cols-2 gap-3 text-sm">
                <div><dt className="text-xs text-muted-foreground">Center distance</dt><dd className="tabular-nums">{candidate.distanceMiles.toFixed(2)} mi</dd></div>
                <div><dt className="text-xs text-muted-foreground">Milestone gap</dt><dd className="tabular-nums">{candidate.dateGapDays === null ? "Unknown" : `${candidate.dateGapDays.toLocaleString()} days`}</dd></div>
              </dl>
              <p className="text-xs text-muted-foreground">{candidate.locationConfidence} locations</p>
            </li>)}</ol> : <p className="text-sm text-muted-foreground">Candidate evidence will appear here when a pair meets the applied criteria.</p>}
          </CardContent>
        </Card>
        <Card className="min-w-0">
          <CardHeader><CardTitle>What the records can establish</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <dl className="space-y-4 text-sm">
              <div><dt className="font-medium">Location coverage</dt><dd className="mt-1 text-muted-foreground">{analysis.summary.locatedProjects.toLocaleString()} of {readiness.total.toLocaleString()} projects have centers; {readiness.missing.toLocaleString()} are missing. {readiness.unverified.toLocaleString()} centers are unverified and {readiness.confirmed.toLocaleString()} are marked confirmed.</dd></div>
              <div><dt className="font-medium">Milestone precision</dt><dd className="mt-1 text-muted-foreground">{dates.day.toLocaleString()} day-level dates, {dates.month.toLocaleString()} month-level dates, {dates.year.toLocaleString()} year-level dates and {dates.unknown.toLocaleString()} unknown. Need and planned in-service dates are milestones, not construction intervals.</dd></div>
              <div><dt className="font-medium">Construction evidence</dt><dd className="mt-1 text-muted-foreground">{dates.construction ? `${dates.construction.toLocaleString()} projects have explicit construction windows.` : "No explicit construction windows are recorded."}{candidateCount > 0 && ` ${candidateEvidence.constructionOverlap.toLocaleString()} candidate pairs have stated windows that overlap; ${candidateEvidence.constructionUnknown.toLocaleString()} lack two windows and remain unknown.`}</dd></div>
            </dl>
            <Button variant="outline" onClick={onReadiness}>{dataset.mode === "demo" ? "View demo coverage" : readiness.missing ? "Add missing location evidence" : "Review location evidence"}</Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Turn a candidate into an investigation</CardTitle><CardDescription>Use project evidence to decide which resource question to pursue.</CardDescription></CardHeader>
        <CardContent className="space-y-4">
          <ul className="space-y-2 text-sm">
            <li><span className="font-medium">Right-of-way:</span> Do the actual routes share a usable corridor?</li>
            <li><span className="font-medium">Crews and equipment:</span> Are work needs, availability and construction windows compatible?</li>
            <li><span className="font-medium">Substation capacity:</span> Is there usable capacity or a justified shared upgrade?</li>
          </ul>
          <p className="text-sm text-muted-foreground">A candidate's Impact tab can explore a hypothetical land-cost scenario using your assumptions. Actual savings and feasibility remain unestablished.</p>
          <Button variant="outline" onClick={onSavedFindings}>Saved reviews</Button>
        </CardContent>
      </Card>
    </div>
  </section>
}
