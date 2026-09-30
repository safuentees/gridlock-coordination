import { useId, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getCoverageGaps, getSourceCoverage, type SourceCoverageRow } from "@/data/source-coverage"
import type { Dataset, Project, SourceRef } from "@/domain/schema"
import { sourceEditionLabels } from "@/lib/presentation"

type Topic = "sources" | "gaps"
interface LegacyReferences { editions: string[]; sources: SourceRef[] }

function PublicSource({ source, example = false }: { source: SourceRef; example?: boolean }) {
  const href = source.url && /^https?:\/\//i.test(source.url) ? source.url : null
  return <div className="space-y-1">
    <p>{href ? <a className="underline underline-offset-4" href={href} target="_blank" rel="noreferrer">{source.file}</a> : source.file}</p>
    <p className="text-muted-foreground">{example && "Example record reference: "}{source.locator}</p>
  </div>
}

function SourceRow({ row, legacy, demo }: { row: SourceCoverageRow; legacy?: LegacyReferences; demo: boolean }) {
  const manifest = row.manifest
  const changedCounts = manifest && (row.activeRecords !== manifest.counts.importedRecords || row.locatedRecords !== manifest.counts.locatedRecords)
  return <li className="space-y-3 py-4 first:pt-0 last:pb-0">
    <div className="space-y-1">
      <h3 className="font-medium">{row.label}</h3>
      {manifest ? <>
        <p className="text-muted-foreground">{manifest.geographicScope}</p>
        <p>{manifest.scope === "full" ? "Full declared scope" : "Sample of declared scope"}</p>
      </> : <p className="text-muted-foreground">{legacy?.editions.length ? legacy.editions.join("; ") : demo ? "Fictional reporting group" : "Original filing; edition not specified"}</p>}
    </div>
    <dl className="grid grid-cols-2 gap-3">
      <div><dt className="text-muted-foreground">Active records</dt><dd className="font-medium tabular-nums">{row.activeRecords.toLocaleString()}</dd></div>
      <div><dt className="text-muted-foreground">With mapped locations</dt><dd className="font-medium tabular-nums">{row.locatedRecords.toLocaleString()}</dd></div>
    </dl>
    {manifest && changedCounts && <p className="text-muted-foreground">Original import: {manifest.counts.importedRecords.toLocaleString()} records; {manifest.counts.locatedRecords.toLocaleString()} mapped. Active counts reflect this dataset.</p>}
    <details>
      <summary className="cursor-pointer font-medium">Scope and source reference</summary>
      <div className="mt-3 space-y-3">
        {manifest ? <>
          <p>{manifest.inventoryScope}</p>
          <dl className="space-y-2">
            <div><dt className="text-muted-foreground">Publisher</dt><dd>{manifest.publisher}</dd></div>
            {manifest.publishedOn && <div><dt className="text-muted-foreground">Published</dt><dd>{manifest.publishedOn}</dd></div>}
            <div><dt className="text-muted-foreground">Source retrieved</dt><dd>{manifest.retrievedOn}</dd></div>
            <div><dt className="text-muted-foreground">Original import scope</dt><dd>{manifest.counts.sourceRows.toLocaleString()} source entries; {manifest.counts.importedRecords.toLocaleString()} retained; {manifest.counts.excludedRows.toLocaleString()} excluded.{manifest.counts.pendingRows > 0 && ` ${manifest.counts.pendingRows.toLocaleString()} pending.`}{manifest.counts.failedRows > 0 && ` ${manifest.counts.failedRows.toLocaleString()} unresolved.`}</dd></div>
          </dl>
          <PublicSource source={manifest.source} />
        </> : <>
          <p className="text-muted-foreground">{demo ? "Fictional source references for the active demo records." : "No import-scope summary accompanies this filing. Counts describe the active records only."}</p>
          {legacy?.sources.map(source => <PublicSource key={JSON.stringify([source.file, source.url])} source={source} example />)}
        </>}
      </div>
    </details>
  </li>
}

export function SourceCoverageDialog({ dataset }: { dataset: Dataset }) {
  const searchId = useId()
  const [topic, setTopic] = useState<Topic>("sources")
  const [queries, setQueries] = useState<Record<Topic, string>>({ sources: "", gaps: "" })
  const sources = useMemo(() => getSourceCoverage(dataset), [dataset])
  const gaps = useMemo(() => getCoverageGaps(dataset), [dataset])
  const legacyReferences = useMemo(() => {
    const groups = new Map<string, Project[]>()
    for (const project of dataset.projects) {
      if (project.inventory) continue
      const group = groups.get(project.utilityId) ?? []
      group.push(project)
      groups.set(project.utilityId, group)
    }
    return new Map([...groups].map(([key, projects]) => {
      const refs = new Map<string, SourceRef>()
      for (const project of projects) for (const source of project.sources) {
        const sourceKey = JSON.stringify([source.file, source.url])
        if (!refs.has(sourceKey)) refs.set(sourceKey, source)
      }
      return [key, { editions: sourceEditionLabels(projects), sources: [...refs.values()] } satisfies LegacyReferences] as const
    }))
  }, [dataset])
  const sourceQuery = queries.sources.trim().toLocaleLowerCase()
  const gapQuery = queries.gaps.trim().toLocaleLowerCase()
  const visibleSources = sources.filter(row => [row.label, row.sourceKey, row.editionId, row.manifest?.publisher, row.manifest?.reportingGroupName, row.manifest?.geographicScope, row.manifest?.inventoryScope, row.manifest?.source.file, ...(legacyReferences.get(row.sourceKey)?.editions ?? []), ...(legacyReferences.get(row.sourceKey)?.sources.map(source => source.file) ?? [])].filter(Boolean).join(" ").toLocaleLowerCase().includes(sourceQuery))
  const visibleGaps = gaps.filter(gap => [gap.label, gap.sourceKey, gap.summary, gap.needed].join(" ").toLocaleLowerCase().includes(gapQuery))

  return <Dialog>
    <DialogTrigger asChild><Button variant="outline">Source coverage</Button></DialogTrigger>
    <DialogContent className="flex h-[min(44rem,calc(100dvh-2rem))] min-h-0 min-w-0 flex-col overflow-hidden sm:max-w-3xl motion-reduce:animate-none">
      <DialogHeader className="shrink-0 pr-8">
        <DialogTitle>Source coverage</DialogTitle>
        <DialogDescription>{dataset.mode === "demo" ? "Synthetic demo records. Source labels and counts describe fictional examples." : "Imported source observations. Local and featured scopes do not establish complete regional or national coverage."}</DialogDescription>
      </DialogHeader>
      <Tabs value={topic} onValueChange={value => { if (value === "sources" || value === "gaps") setTopic(value) }} className="min-h-0 min-w-0 flex-1 gap-3 overflow-hidden">
        <TabsList className="shrink-0" aria-label="Source coverage topics">
          <TabsTrigger value="sources">Sources</TabsTrigger>
          <TabsTrigger value="gaps">Known gaps</TabsTrigger>
        </TabsList>
        <div className="shrink-0 space-y-2">
          <Label htmlFor={searchId}>Search coverage</Label>
          <Input id={searchId} placeholder={topic === "sources" ? "Source, edition or area" : "Area or missing evidence"} value={queries[topic]} onChange={event => setQueries(previous => ({ ...previous, [topic]: event.target.value }))} />
          <p className="text-muted-foreground" aria-live="polite">{topic === "sources" ? `${visibleSources.length} of ${sources.length} sources` : dataset.mode === "demo" ? "Synthetic examples" : `${visibleGaps.length} of ${gaps.length} known gaps`}</p>
        </div>
        <TabsContent forceMount hidden={topic !== "sources"} inert={topic !== "sources"} value="sources" className="min-h-0 min-w-0 overflow-auto overscroll-contain pr-1 [overflow-wrap:anywhere]" aria-label="Imported sources">
          {dataset.mode === "real" && <p className="mb-4 text-muted-foreground">Mapped counts can include unverified centers. Source status and milestones do not confirm current construction.</p>}
          {visibleSources.length ? <ul className="divide-y">{visibleSources.map(row => <SourceRow key={row.key} row={row} legacy={legacyReferences.get(row.sourceKey)} demo={dataset.mode === "demo"} />)}</ul> : <p className="text-muted-foreground">{sources.length ? "No sources match this search." : "No source records or editions are present in this dataset."}</p>}
        </TabsContent>
        <TabsContent forceMount hidden={topic !== "gaps"} inert={topic !== "gaps"} value="gaps" className="min-h-0 min-w-0 overflow-auto overscroll-contain pr-1 [overflow-wrap:anywhere]" aria-label="Known coverage gaps">
          {dataset.mode === "demo" ? <p className="text-muted-foreground">Real-source access gaps do not apply to synthetic demo records. Switch to source data to review assessed gaps.</p> : <>
            <p className="mb-4 text-muted-foreground">Unavailable evidence does not mean zero projects. These assessed gaps are not a complete list of missing sources.</p>
            {visibleGaps.length ? <ul className="divide-y">{visibleGaps.map(gap => <li key={gap.sourceKey} className="space-y-3 py-4 first:pt-0 last:pb-0">
              <div className="space-y-1"><h3 className="font-medium">{gap.label}</h3><p className="text-muted-foreground">Assessed {gap.assessedOn}</p></div>
              <p>{gap.summary}</p>
              <div className="space-y-1"><p className="font-medium">Evidence needed</p><p>{gap.needed}</p></div>
              <a className="inline-block underline underline-offset-4" href={gap.url} target="_blank" rel="noreferrer">Public source page</a>
            </li>)}</ul> : <p className="text-muted-foreground">{gaps.length ? "No known gaps match this search." : "None of the tracked gaps remains open in this dataset. Other coverage gaps may remain."}</p>}
          </>}
        </TabsContent>
      </Tabs>
    </DialogContent>
  </Dialog>
}
