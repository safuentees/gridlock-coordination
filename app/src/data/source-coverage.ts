import { z } from "zod"
import type { Dataset } from "@/domain/schema"
import type { SourceEdition } from "@/domain/coverage"
import { reportingGroupLabel } from "@/lib/reporting-groups"
import gapsJson from "./evidence/coverage-gaps.json"

export interface SourceCoverageRow {
  key: string
  sourceKey: string
  editionId: string | null
  label: string
  activeRecords: number
  locatedRecords: number
  manifest: SourceEdition | null
}

const gaps = z.object({ version: z.literal(1), gaps: z.array(z.object({
  sourceKey: z.string(), label: z.string(), assessedOn: z.iso.date(),
  summary: z.string(), needed: z.string(), url: z.url().refine(value => /^https?:\/\//i.test(value)),
})) }).parse(gapsJson).gaps
export type CoverageGap = typeof gaps[number]

/** Active record counts and original import manifests deliberately retain distinct meanings. */
export function getSourceCoverage(dataset: Dataset): SourceCoverageRow[] {
  const rows = new Map<string, SourceCoverageRow>()
  const keyFor = (sourceKey: string, editionId: string | null) => JSON.stringify([sourceKey, editionId])
  for (const manifest of dataset.sourceEditions ?? []) {
    const key = keyFor(manifest.sourceKey, manifest.editionId)
    rows.set(key, { key, sourceKey: manifest.sourceKey, editionId: manifest.editionId, label: manifest.label, activeRecords: 0, locatedRecords: 0, manifest })
  }
  for (const project of dataset.projects) {
    const sourceKey = project.inventory?.sourceKey ?? project.utilityId
    const editionId = project.inventory?.editionId ?? null
    const key = keyFor(sourceKey, editionId)
    const row = rows.get(key) ?? { key, sourceKey, editionId, label: project.inventory?.editionLabel ?? reportingGroupLabel(project), activeRecords: 0, locatedRecords: 0, manifest: null }
    row.activeRecords += 1
    if (project.location) row.locatedRecords += 1
    rows.set(key, row)
  }
  return [...rows.values()]
}

/** Dated research context, not a claim that an unlisted source or area is complete. */
export function getCoverageGaps(dataset: Dataset): CoverageGap[] {
  if (dataset.mode !== "real") return []
  const importedTransmission = new Set(dataset.projects.filter(project => project.inventory?.recordKind === "transmission-project").map(project => project.inventory!.sourceKey))
  const completeScopes = new Set((dataset.sourceEditions ?? []).filter(edition => edition.scope === "full").map(edition => edition.sourceKey))
  return gaps.filter(gap => !importedTransmission.has(gap.sourceKey) || !completeScopes.has(gap.sourceKey))
}
