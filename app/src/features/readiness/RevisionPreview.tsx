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

function CurrentLocationMeaning({ project }: { project: Project }) {
  if (!project.inventory) return null
  return <div className="space-y-2 text-xs text-muted-foreground"><p>Displayed location role: {project.inventory.centerRole.replaceAll("-", " ")}.</p>{project.inventory.locationAssumptions.map((assumption, index) => <p key={index}>{assumption}</p>)}</div>
}

function OwnershipEvidence({ owner }: { owner: NonNullable<Project["inventory"]>["owner"] }) {
  if (!owner) return <p className="text-sm text-muted-foreground">Unknown; no ownership evidence.</p>
  return <div className="space-y-3">
    <p className="text-sm font-medium">{owner.name}</p>
    {owner.ownershipStatement && <div className="space-y-2 text-sm">
      <p>Planned ownership; source evidence as of {owner.ownershipStatement.asOf}. Present equipment title is unconfirmed.</p>
      <p className="text-muted-foreground">{owner.ownershipStatement.scope}</p>
    </div>}
    {owner.identityScope !== "global" && <p className="text-sm text-muted-foreground">Identified within this source; cross-source identity unverified.</p>}
    <EvidenceSources sources={owner.evidence} />
  </div>
}

interface RevisionPreviewProps {
  before: Project
  after: Project
  changes: DatasetChanges
  kind?: "location" | "owner"
  caveat?: string
  limitations?: string[]
}

export function RevisionPreview({ before, after, changes, kind = "location", caveat, limitations = [] }: RevisionPreviewProps) {
  const ownership = kind === "owner"
  return <section className="space-y-4" aria-label={ownership ? "Ownership revision preview" : "Location revision preview"}>
    <h3 className="font-medium">{ownership ? "Review the proposed ownership evidence" : "Review the proposed location"}</h3>
    <div className="grid gap-4 lg:grid-cols-2">
      <section className="space-y-3 rounded-lg border p-4"><h4 className="font-medium">{ownership ? "Current owner" : "Current evidence"}</h4>{ownership ? <OwnershipEvidence owner={before.inventory?.owner ?? null} /> : <><LocationEvidence location={before.location} /><CurrentLocationMeaning project={before} /></>}</section>
      <section className="space-y-3 rounded-lg border p-4"><h4 className="font-medium">{ownership ? "Proposed owner" : "Proposed evidence"}</h4>{ownership ? <OwnershipEvidence owner={after.inventory?.owner ?? null} /> : <><LocationEvidence location={after.location} /><CurrentLocationMeaning project={after} /></>}</section>
    </div>
    {ownership && <div className="space-y-2 text-sm text-muted-foreground">{caveat && <p>{caveat}</p>}{limitations.length > 0 && <ul className="list-disc space-y-1 pl-4">{limitations.map((limitation, index) => <li key={index}>{limitation}</li>)}</ul>}<p>Location, dates and lifecycle stay unchanged. Existing notes and your location draft are retained.</p></div>}
    <p className="text-sm">{changes.changed.length} changed, {changes.added.length} added, {changes.removed.length} removed, {changes.unchanged} unchanged records.</p>
    {changes.editionChanges.length > 0 && <ul className="space-y-1 text-sm" aria-label="Source edition changes">{changes.editionChanges.map(edition => <li key={`${edition.sourceKey}:${edition.editionId}`}>{edition.label}: {edition.kind}</li>)}</ul>}
    {!ownership && after.inventory && <p className="text-sm text-muted-foreground">Original published positions are preserved. A local location alone does not establish ownership or eligibility for comparison.</p>}
    <details className="rounded-lg border p-3"><summary className="cursor-pointer font-medium">Project sources</summary><div className="mt-3"><EvidenceSources sources={before.sources} /></div></details>
  </section>
}
