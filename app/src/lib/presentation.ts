import type { Project } from "@/domain/schema"

// These are display translations of known ingestion notes, never edits to source evidence.
// Unknown/imported notes remain visible rather than being discarded by broad keyword matching.
export function visibleProjectNotes(project: Project): string[] {
  return project.notes.flatMap(note => {
    if (note.startsWith("Workbook alias:") || note === "Location supplied in workbook; not independently verified.") return []
    if (note === "Location updated from locally supplied evidence; coordinates remain unverified. Original source notes may describe earlier coverage.") return []
    if (note === "All names, dates, coordinates and confidence labels in this record are synthetic." || note === "No location supplied in this scenario; the project remains in the inventory.") return []
    if (note === "Only one endpoint is located; the center represents that endpoint, not the whole project.") return ["Single known endpoint; full route unknown."]
    if (note === "The workbook gives different McIntosh longitudes across these two projects; each source value is retained.") return ["Conflicting McIntosh longitudes in the supplied location evidence."]
    if (note === "Source estimated total is $1,100,000 despite the filing's $2M-and-above title; the listed project is retained.") return ["Source project estimate: $1,100,000."]
    if (note.startsWith("Source planned in-service dates:")) return [note.replace(/ No single date selected\.$/, "")]
    return [note]
  })
}

/** Plan editions, not generation timestamps or claims of current construction status. */
export function sourceEditionLabels(projects: Project[]): string[] {
  const files = new Set(projects.flatMap(project => project.sources.map(source => source.file)))
  const labels: string[] = []
  if (files.has("2024-2028-2million-and-above-project-descriptions.pdf")) labels.push("Dominion 2024–2028 plan")
  if (files.has("2025 IRP Volume 3 PUBLIC DISCLOSURE.pdf")) labels.push("Georgia 2025 IRP")
  for (const project of projects) if (project.inventory && !labels.includes(project.inventory.editionLabel)) labels.push(project.inventory.editionLabel)
  return labels
}
