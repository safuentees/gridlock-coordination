import type { GeographicRecord } from "@/domain/geography"
import type { Project } from "@/domain/schema"
import { projectLocationLabel } from "@/lib/reporting-groups"
import { Sources } from "./ProjectDetails"

export function projectGeographyLabel(project: Project, record?: GeographicRecord): string {
  if (!record) return projectLocationLabel(project)
  const representation = record.representation
  if (!representation) return record.status === "ambiguous" ? "Ambiguous geography" : record.status === "not-processed" ? "Geography not yet processed" : "No supported geographic match"
  if (representation.kind === "area") return `Approximate ${representation.precision} extent · ${representation.label}`
  if (representation.kind === "endpoints") return "Approximate endpoints"
  return record.status === "located" ? "Source point" : `Approximate ${representation.precision === "unknown" ? "point" : representation.precision} location`
}

export function GeographicEvidence({ record }: { record?: GeographicRecord }) {
  if (!record) return <p className="text-sm text-muted-foreground">Geographic evidence is not yet available. Original source evidence remains below.</p>
  const representation = record.representation
  return <section className="min-w-0 space-y-3 text-sm [overflow-wrap:anywhere]" aria-label="Geographic evidence">
    <h4 className="font-medium">Geographic evidence</h4>
    <p>{record.reason}</p>
    {representation && <>
      <dl className="grid grid-cols-[minmax(0,1fr)_minmax(0,2fr)] gap-x-4 gap-y-2 [&_dd]:min-w-0">
        <dt className="text-muted-foreground">Representation</dt><dd>{representation.label}</dd>
        <dt className="text-muted-foreground">Method / precision</dt><dd>{representation.method.replaceAll("-", " ")} / {representation.precision}</dd>
        {representation.accuracyMeters !== null && <><dt className="text-muted-foreground">Source-stated accuracy</dt><dd>{representation.accuracyMeters} m</dd></>}
      </dl>
      <ul className="list-disc space-y-1 pl-4 text-xs text-muted-foreground">{representation.limitations.map((text, index) => <li key={index}>{text}</li>)}</ul>
      <Sources sources={representation.evidence} />
      <details className="space-y-2 rounded-lg border p-3"><summary className="cursor-pointer font-medium">Positions and matching clues</summary>
        {representation.kind === "area" ? <p className="text-xs">Bounding extent: west {representation.bounds[0]}, south {representation.bounds[1]}, east {representation.bounds[2]}, north {representation.bounds[3]}. This is geographic context; no project center or route is supplied.</p>
          : <ul className="space-y-1 text-xs">{(representation.kind === "point" ? [representation.position] : representation.positions).map(([lon, lat], index) => <li key={index}>Longitude {lon}; latitude {lat}</li>)}</ul>}
        <Clues record={record} />
      </details>
    </>}
    {!representation && <details className="space-y-2 rounded-lg border p-3"><summary className="cursor-pointer font-medium">Matching clues</summary><Clues record={record} /></details>}
    {record.review && <p className="text-xs text-muted-foreground">Analyst review: {record.review.decision}. {record.review.reason}{record.review.basedOnFingerprint !== record.inputFingerprint && " Source evidence changed; review is needed."}</p>}
  </section>
}

function Clues({ record }: { record: GeographicRecord }) {
  return record.clues.length ? <ul className="space-y-2 text-xs">{record.clues.map((clue, index) => <li key={index}><p>{clue.kind.replaceAll("-", " ")}: {clue.text}</p><Sources sources={clue.evidence} /></li>)}</ul> : <p className="text-xs text-muted-foreground">No supported geographic clue was found in this source record.</p>
}
