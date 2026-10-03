import type { Project } from "@/domain/schema"

function canonical(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonical)
  if (value !== null && typeof value === "object") return Object.fromEntries(
    Object.entries(value).sort(([left], [right]) => left < right ? -1 : left > right ? 1 : 0).map(([key, item]) => [key, canonical(item)]),
  )
  return value
}

/** Source identity and all evidence must still match; local analyst notes may differ. */
export function matchesEvidenceBaseline(project: Project, expected: Project): boolean {
  return JSON.stringify(canonical({ ...project, notes: [] })) === JSON.stringify(canonical({ ...expected, notes: [] }))
}
