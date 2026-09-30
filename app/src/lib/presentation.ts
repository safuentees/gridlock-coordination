import type { Project } from "@/domain/schema"

// Exact display translations for accepted public-source notes; raw evidence is unchanged.
const PUBLIC_SOURCE_NOTE_COPY = new Map<string, Map<string, string | null>>([
  ["al-apc-doe", new Map<string, string | null>([
    ["Alabama Power Company is the applicant/project proponent; equipment ownership is not expressly established by this review.", null],
    ["Environmental-review completion does not establish physical construction, commissioning, engineering approval or project-specific financing close. Required construction/operation permits remain separate.", "Environmental review does not confirm construction, service, engineering approval or project-specific financing. Other permits remain required."],
    ["Review completion applies to proposed federal financial support, not physical completion or project-specific financing approval.", null],
    ["The completion-letter title refers to environmental reviews; physical commissioning is not reported.", null],
    ["The 500/230 kV values expressly describe future terminal accommodation. Initial installed voltage is not established, so normalized voltage stays empty.", "500/230 kV describes future terminal accommodation; the initial installed voltage is unknown."],
    ["Lock 5 is the facility name; the numeral is not a supplied project ID.", null],
    ["Site dimensions and road intersection descriptions do not identify a verified substation center.", null],
    ["The cadastral description remains text; no point or route is derived.", null],
    ["Route directions, acreages and right-of-way widths describe scope; they do not establish numeric geometry or a shared-resource estimate.", "Route, acreage and right-of-way figures describe project scope, not a shared-resource estimate."],
    ["Two existing 500 kV lines, an existing autobank, one new line connection and space for future lines/autobank are context for one expansion, not additional project records.", "Existing lines/autobank, a new line connection and space for future equipment belong to one expansion."],
  ])],
  ["ga-gpc-public", new Map<string, string | null>([
    ["Georgia Power is the reporter/developer. The reviewed public text does not establish specific equipment ownership.", null],
    ["Lifecycle was observed on September 30, 2026. Page publication/update dates are unknown; retrieval and HTTP Last-Modified do not establish current physical progress.", null],
    ["Quarter and season milestone labels are retained as published; no exact project date or construction interval is inferred. The source schedule is tentative.", "Quarter and seasonal targets are tentative; exact dates and construction windows are unknown."],
    ["Two roughly 5-mile 230 kV lines plus Tomochichi substation. Planning text coexists with a substation construction-began milestone; do not assign one component stage to the program.", "Two roughly 5-mile 230 kV lines and Tomochichi substation have differing component stages."],
    ["Approximately 102-mile line to a new Big Tazewell substation. Detail adds Houston County, Alabama; index lists Georgia counties only. FAQ construction wording conflicts with future line-construction schedule.", "Approximately 102 miles to Big Tazewell. The index omits the Alabama endpoint; construction prose conflicts with the future line schedule."],
    ["Rebuild of approximately 2.5 miles and relocation of approximately 0.7 miles. Do not sum these as independent route lengths; 1965 is existing infrastructure history, not the project date.", "The 2.5-mile rebuild and 0.7-mile relocation are not separate lengths to sum. The 1965 date describes the existing line."],
    ["The roughly 2.5-mile rebuild and roughly 0.7-mile relocation are not independent lengths to sum. The stated 1965 construction year belongs to the existing infrastructure, not this upgrade.", null],
    ["Callaway Road 500/230 kV substation plus two 500 kV lines, approximately 10 and 7 miles. Preserve the area-program unit; timeline uses seasons and publishes no completion milestone.", "One area program includes Callaway Road substation and two 500 kV lines of approximately 10 and 7 miles."],
    ["Detail scope is two substations and three lines, not one line: a 500 kV loop and two 230 kV links. Planning prose, Q2 2026 construction schedule and July clearing notice are retained separately.", "The Q2 2026 construction schedule differs from planning prose and the July notice of clearing before future construction."],
    ["The page title gives 500/230 kV while introductory prose shortens it to 500 kV. The detailed program includes both voltage classes; the index single-line label does not define its full unit.", "The title specifies 500/230 kV; introductory text says 500 kV. The program includes both voltage classes and multiple facilities."],
    ["New approximately 35-mile 500 kV line; detail adds Fulton and Coweta counties. Dated 2025 letter distinguishes line surveying from substation construction; do not transfer the substation stage to the line.", "The detailed route adds Fulton and Coweta counties, which the index omits."],
    ["The page explicitly describes planning with scope subject to engineering, environmental and routing studies. It publishes no completion target or project map; the program is not a single defined line.", "Program scope and routes remain under study; no completion target or project map is published."],
    ["The undated construction-activity notice says work may include pre-construction and construction activities without establishing a dated current stage. The elapsed Q2 2026 construction target does not confirm work began; lifecycle remains unknown.", "The undated notice describes possible preparation and construction work. The Q2 2026 target does not confirm construction began."],
    ["The undated project-information notice states that surveys are underway as the proposed route is finalized. This is planning evidence, not confirmation that the line is under construction. The generic phases diagram does not define the current stage.", "An undated notice reports route surveys underway; it does not confirm line construction."],
    ["The FAQ uses constructing wording while the timeline forecasts Q1 2027 line construction. Current lifecycle remains unknown. Existing and proposed Conyers–Klondike lines share endpoint names; they are not proven to be the same record.", "Construction wording conflicts with the Q1 2027 forecast. Existing and proposed lines share endpoint names; their identity is unverified."],
  ])],
  ["aep-doe", new Map<string, string | null>([
    ["Planned status is observed in the dated readable letter. Environmental review does not establish physical completion, construction progress, financing approval or engineering feasibility.", "Environmental review does not confirm construction, service, financing approval or engineering feasibility."],
    ["Identity is a frozen review-document locator, not an engineering project ID. This featured DOE subset may overlap other inventories; it is not a count of net-new unique projects.", null],
    ["Anticipated start and operation dates are source forecasts, not an established construction interval; constructionStart and buildWindow remain unknown.", "Anticipated start and operation dates are forecasts, not a confirmed construction window."],
    ["Consultation code USFWS 2026-0090834 appears in both of the first two review packages; it is not an engineering identity or a basis for merging them.", "USFWS consultation code 2026-0090834 is shared by two reviews; it does not establish the same engineering project."],
    ["The July 24 completion letter does not state voltage. The public June 16 consultation letter supplies 138 kV for the matching scope; no confidential attachment was consulted.", "The July 24 letter omits voltage; 138 kV comes from the June 16 public consultation for the same scope."],
    ["Physical scope and planned status rely on the readable May 8 public letter. The later indexed completion PDF has no extractable body text; its signed date, status, schedule and conditions remain unread. No image interpretation or withheld attachment was used.", "Scope and planned status use the May 8 letter. Later letter details—including signed date, status, schedule and conditions—are unavailable."],
  ])],
])

function publicSourceNote(project: Project, note: string): string[] | null {
  const inventory = project.inventory
  const sourceKey = inventory?.sourceKey
  const translations = sourceKey ? PUBLIC_SOURCE_NOTE_COPY.get(sourceKey) : undefined
  if (translations?.has(note)) {
    const copy = translations.get(note)
    return copy ? [copy] : []
  }
  if (sourceKey === "al-apc-doe") {
    const dates = note.match(/^The DOE letter is dated (\d{4}-\d{2}-\d{2}); the index posting date is (\d{4}-\d{2}-\d{2})\. Lifecycle reflects the proposed scope described in that letter, not the retrieval date\.$/)
    if (dates) {
      // These two accepted records already explain their date discrepancy in a specific note.
      const hasDateException = project.notes.includes("The index posting date April 24 differs from the March 30 letter date; neither is a construction or service date.")
        || project.notes.includes("March 24 letter date differs from March 25 index posting; completion means the review process.")
      return dates[1] === dates[2] || hasDateException ? [] : [`Review dates differ: letter ${dates[1]}; index posting ${dates[2]}.`]
    }
  }
  if (sourceKey === "ga-gpc-public") {
    if (note === `Index type: ${inventory?.workType}. Index county/region: ${inventory?.sourceLocation}.`) return []
    const related = note.match(/^Possible name-based historical review lead: (gpc-\d+(?:, gpc-\d+)*)\. No authoritative identity crosswalk is supplied; dates, ownership, geometry and identity are not inherited\.$/)
    if (related) return [`Possible historical match: ${related[1]}; project identity remains unverified.`]
  }
  if (sourceKey === "aep-doe") {
    const affiliate = note.match(/^DOE index affiliate label: (AEP Transco|AEP Texas)\. American Electric Power is the applicant; no specific legal asset owner is evidenced\.$/)
    if (affiliate) return [`DOE index affiliate: ${affiliate[1]}.`]
    const related = note.match(/^Possible related source observation only: ((?:pjm-rtep:s[\d.]+|ercot-tpit:\d+))\. No explicit identity crosswalk exists; no alias, merge or date\/owner transfer is asserted\.$/)
    if (related) return [`Possible related record: ${related[1]}; project identity remains unverified.`]
  }
  return null
}

// These are display translations of known ingestion notes, never edits to source evidence.
// Unknown/imported notes remain visible rather than being discarded by broad keyword matching.
export function visibleProjectNotes(project: Project): string[] {
  return project.notes.flatMap(note => {
    const publicCopy = publicSourceNote(project, note)
    if (publicCopy !== null) return publicCopy
    if (project.inventory?.identityBasis === "source-locator" && note === "Source locator identity; not a native engineering project ID. Later editions require explicit identity review.") return []
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
