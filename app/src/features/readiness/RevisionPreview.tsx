import type { DatasetChanges } from "@/data/import"
import type { Project, SourceRef } from "@/domain/schema"

export const LOCATION_METHODS = {
  "source-point": "Point stated by the source",
  "single-endpoint": "Single known endpoint",
  "endpoint-midpoint": "Midpoint of stated endpoints",
} as const

export function EvidenceSources({ sources }: { sources: SourceRef[] }) {
  if (!sources.length) return <p className="text-sm text-muted-foreground">No source supplied.</p>
  return <ul className="space-y-2 text-sm [overflow-wrap:anywhere]">{sources.map((source, index) => <li key={`${source.file}-${source.locator}-${index}`}>
    <span className="font-medium">{source.file}</span><span className="block text-muted-foreground">{source.locator}</span>
    {source.url && /^https?:\/\//i.test(source.url) && <a href={source.url} target="_blank" rel="noreferrer" className="block underline underline-offset-2">Open source</a>}
  </li>)}</ul>
}

export function LocationEvidence({ location }: { location: Project["location"] }) {
  if (!location) return <p className="text-sm text-muted-foreground">Location unknown.</p>
  return <div className="space-y-3">
    <dl className="grid grid-cols-[minmax(0,1fr)_minmax(0,2fr)] gap-x-3 gap-y-2 text-sm [overflow-wrap:anywhere]">
      <dt className="text-muted-foreground">Latitude</dt><dd>{location.lat}</dd>
      <dt className="text-muted-foreground">Longitude</dt><dd>{location.lon}</dd>
      <dt className="text-muted-foreground">Method</dt><dd>{LOCATION_METHODS[location.method]}</dd>
      <dt className="text-muted-foreground">Confidence</dt><dd>{location.confidence}</dd>
    </dl>
    <EvidenceSources sources={location.evidence} />
  </div>
}

export function RevisionPreview({ before, after, changes }: { before: Project; after: Project; changes: DatasetChanges }) {
  return <section className="space-y-4" aria-label="Location revision preview">
    <h3 className="font-medium">Review the proposed location</h3>
    <div className="grid gap-4 lg:grid-cols-2">
      <section className="space-y-3 rounded-lg border p-4"><h4 className="font-medium">Current evidence</h4><LocationEvidence location={before.location} /></section>
      <section className="space-y-3 rounded-lg border p-4"><h4 className="font-medium">Proposed evidence</h4><LocationEvidence location={after.location} /></section>
    </div>
    <p className="text-sm">{changes.changed.length} changed, {changes.added.length} added, {changes.removed.length} removed, {changes.unchanged} unchanged projects.</p>
    <details className="rounded-lg border p-3"><summary className="cursor-pointer font-medium">Project sources</summary><div className="mt-3"><EvidenceSources sources={before.sources} /></div></details>
  </section>
}
