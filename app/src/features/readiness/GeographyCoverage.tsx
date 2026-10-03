import { useId, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { GEOGRAPHIC_STATUSES, type GeographicStatus } from "@/domain/geography"
import { GEOGRAPHIC_REPRESENTATION_GROUPS, type GeographicCoverageCounts, type GeographicCoverageReport, type GeographicRepresentationGroup } from "@/domain/geographic-coverage"
import type { Project } from "@/domain/schema"
import { reportingGroupLabel } from "@/lib/reporting-groups"

interface GeographyCoverageProps {
  report: GeographicCoverageReport
  projects: readonly Project[]
}
const STATUS_LABELS: Record<GeographicStatus, string> = {
  located: "Source-located", approximate: "Approximate", ambiguous: "Ambiguous", unsupported: "Unsupported", "not-processed": "Not processed",
}
const REPRESENTATION_LABELS: Record<GeographicRepresentationGroup, string> = {
  "source-point": "Source-located points",
  facility: "Approximate facility points",
  "approximate-point": "Other approximate points",
  endpoints: "Evidenced endpoints",
  "town-area": "Town extents",
  "county-area": "County extents",
  "state-region-area": "State or regional extents",
}
function StatusCounts({ counts }: { counts: GeographicCoverageCounts }) {
  return <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm sm:grid-cols-3" aria-label="Geographic statuses">{GEOGRAPHIC_STATUSES.map(status => <div key={status} className="min-w-0"><dt className="text-muted-foreground">{STATUS_LABELS[status]}</dt><dd className="font-medium tabular-nums">{counts.statuses[status].toLocaleString()}</dd></div>)}</dl>
}
function PrecisionCounts({ counts }: { counts: GeographicCoverageCounts }) {
  return <dl className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-4 gap-y-2 text-sm" aria-label="Representation precision">{GEOGRAPHIC_REPRESENTATION_GROUPS.map(group => <div key={group} className="contents"><dt className="min-w-0 text-muted-foreground">{REPRESENTATION_LABELS[group]}</dt><dd className="text-right font-medium tabular-nums">{counts.representations[group].toLocaleString()}</dd></div>)}</dl>
}

/** Supporting presentation only; the report supplies all coverage classifications and counts. */
export function GeographyCoverage({ report, projects }: GeographyCoverageProps) {
  const id = useId()
  const [tab, setTab] = useState("collection")
  const [search, setSearch] = useState("")
  const labels = useMemo(() => new Map(projects.map(project => [project.inventory?.sourceKey ?? project.utilityId, reportingGroupLabel(project)])), [projects])
  const sources = useMemo(() => {
    const query = search.trim().toLocaleLowerCase()
    return report.sources.filter(source => [labels.get(source.sourceKey), source.sourceKey, ...source.editions].join(" ").toLocaleLowerCase().includes(query))
  }, [report.sources, labels, search])

  return <Dialog>
    <DialogTrigger asChild><Button variant="outline" size="sm">Coverage details</Button></DialogTrigger>
    <DialogContent className="flex h-[min(85dvh,44rem)] min-h-0 min-w-0 flex-col overflow-hidden sm:max-w-2xl">
      <DialogHeader className="shrink-0 pr-8"><DialogTitle>Coverage details</DialogTitle><DialogDescription>Geographic coverage of the active collection. Retained reviews for absent records are outside these totals.</DialogDescription></DialogHeader>
      <Tabs value={tab} onValueChange={setTab} className="min-h-0 min-w-0 flex-1 overflow-hidden">
        <TabsList aria-label="Coverage detail views" className="shrink-0"><TabsTrigger value="collection">Collection</TabsTrigger><TabsTrigger value="sources">By source</TabsTrigger></TabsList>
        <TabsContent value="collection" forceMount hidden={tab !== "collection"} inert={tab !== "collection"} className="min-h-0 min-w-0 space-y-5 overflow-auto overscroll-contain pt-3 data-[state=inactive]:hidden" tabIndex={0} aria-label="Collection coverage details">
          <section className="space-y-3"><h3 className="font-medium">{report.total.toLocaleString()} active records</h3><StatusCounts counts={report} /><p className="text-xs text-muted-foreground">Source-located means supplied coordinates, without independent verification. Approximate coverage includes points, endpoints and areas.</p></section>
          <section className="space-y-3"><h3 className="font-medium">Representation precision</h3><PrecisionCounts counts={report} /><p className="text-xs text-muted-foreground">These groups describe represented records only. Area extents provide geographic context, not project centers or surveyed boundaries.</p></section>
          <section className="space-y-2"><h3 className="font-medium">{report.needsReview.toLocaleString()} reviews need attention</h3><p className="text-sm text-muted-foreground">Their source evidence changed after the saved review. This count does not change their geographic status; inspect the current evidence in the record queue.</p></section>
        </TabsContent>
        <TabsContent value="sources" forceMount hidden={tab !== "sources"} inert={tab !== "sources"} className="flex min-h-0 min-w-0 flex-col gap-3 overflow-hidden pt-3 data-[state=inactive]:hidden">
          <div className="shrink-0 space-y-2"><Label htmlFor={`${id}-source-search`}>Find a source or edition</Label><Input id={`${id}-source-search`} value={search} onChange={event => setSearch(event.target.value)} placeholder="Source name or edition" /></div>
          <div className="min-h-0 min-w-0 flex-1 space-y-4 overflow-auto overscroll-contain [overflow-wrap:anywhere]" tabIndex={0} role="region" aria-label="Coverage by source">
            {sources.length ? sources.map(source => <section key={source.sourceKey} className="space-y-3 rounded-lg border p-3">
              <div className="space-y-1"><h3 className="font-medium">{labels.get(source.sourceKey) ?? source.sourceKey}</h3><p className="text-xs text-muted-foreground">{source.sourceKey}; {source.total.toLocaleString()} active records</p></div>
              <div className="space-y-1"><h4 className="text-sm font-medium">Source editions</h4>{source.editions.length ? <ul className="space-y-1 text-xs text-muted-foreground">{source.editions.map(edition => <li key={edition}>{edition}</li>)}</ul> : <p className="text-xs text-muted-foreground">Edition not specified.</p>}</div>
              <StatusCounts counts={source} />
              <p className="text-xs text-muted-foreground">{source.needsReview.toLocaleString()} reviews need attention after source changes.</p>
              <details className="space-y-3"><summary className="cursor-pointer text-sm font-medium">Representation precision</summary><PrecisionCounts counts={source} /></details>
            </section>) : <p className="text-sm text-muted-foreground">{report.sources.length ? "No sources match this search." : "No active source records."}</p>}
          </div>
        </TabsContent>
      </Tabs>
    </DialogContent>
  </Dialog>
}
