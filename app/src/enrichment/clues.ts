import type { GeographicClue } from "@/domain/geography"
import type { Project } from "@/domain/schema"

const STATES: Record<string, string> = {
  AL: "Alabama", AK: "Alaska", AZ: "Arizona", AR: "Arkansas", CA: "California", CO: "Colorado", CT: "Connecticut", DE: "Delaware", DC: "District of Columbia",
  FL: "Florida", GA: "Georgia", HI: "Hawaii", ID: "Idaho", IL: "Illinois", IN: "Indiana", IA: "Iowa", KS: "Kansas", KY: "Kentucky", LA: "Louisiana", ME: "Maine",
  MD: "Maryland", MA: "Massachusetts", MI: "Michigan", MN: "Minnesota", MS: "Mississippi", MO: "Missouri", MT: "Montana", NE: "Nebraska", NV: "Nevada", NH: "New Hampshire",
  NJ: "New Jersey", NM: "New Mexico", NY: "New York", NC: "North Carolina", ND: "North Dakota", OH: "Ohio", OK: "Oklahoma", OR: "Oregon", PA: "Pennsylvania", RI: "Rhode Island",
  SC: "South Carolina", SD: "South Dakota", TN: "Tennessee", TX: "Texas", UT: "Utah", VT: "Vermont", VA: "Virginia", WA: "Washington", WV: "West Virginia", WI: "Wisconsin", WY: "Wyoming",
  AS: "American Samoa", GU: "Guam", MP: "Northern Mariana Islands", PR: "Puerto Rico", VI: "United States Virgin Islands",
}

/** Punctuation/case normalization only; no fuzzy aliases or discarded directional words. */
export function normalizeGeographicName(text: string): string {
  return text.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/&/g, " and ").replace(/[^a-z0-9]+/g, " ").trim().replace(/\s+/g, " ")
}

export function stateCode(text: string): string | null {
  const normalized = normalizeGeographicName(text)
  return Object.keys(STATES).find(code => normalized === code.toLowerCase() || normalized === normalizeGeographicName(STATES[code]))
    ?? ({ "us virgin islands": "VI", "u s virgin islands": "VI", "virgin islands": "VI", cnmi: "MP" } as Record<string, string>)[normalized] ?? null
}

const empty = /^(?:n\/?a|none|unknown|not supplied|not available|multiple|various|system ?wide|tbd|[-–—])$/i
function facilityText(text: string): string {
  return text.trim().replace(/^(?:from|between|rebuild|replace|replacement of|upgrade|existing)\s+/i, "")
    .replace(/\s+\d+(?:\.\d+)?(?:\s*\/\s*\d+(?:\.\d+)?)*\s*kV\b.*$/i, "")
    .replace(/\s+(?:transmission\s+)?(?:line\s+)?(?:rebuild|reconstruction|replacement|upgrade|project|expansion|addition)\b.*$/i, "")
    .replace(/\s+(?:substation|station|terminal)\s*$/i, "").trim()
}

export function extractGeographicClues(project: Project): GeographicClue[] {
  const clues: GeographicClue[] = [], seen = new Set<string>()
  const add = (kind: GeographicClue["kind"], text: string, field: string) => {
    const clean = text.trim(), normalized = kind === "state" ? stateCode(clean)?.toLowerCase() : normalizeGeographicName(clean)
    if (!normalized || empty.test(clean) || !project.sources.length) return
    const key = `${kind}:${normalized}:${field}`
    if (seen.has(key)) return
    seen.add(key)
    clues.push({ kind, text: clean, normalized, field, evidence: project.sources })
  }
  if (project.sourceId) add("source-id", project.sourceId, "sourceId")
  for (const alias of project.inventory?.aliases ?? []) add("source-id", alias, "inventory.aliases")
  const rawState = project.inventory?.sourceState
  if (rawState) {
    if (stateCode(rawState)) add("state", rawState, "inventory.sourceState")
    else for (const part of rawState.split(/[,;/|&]+|\s+and\s+/i)) {
      if (stateCode(part)) add("state", part, "inventory.sourceState")
      else for (const token of part.trim().split(/\s+/)) if (/^[A-Z]{2}$/.test(token)) add("state", token, "inventory.sourceState")
    }
  }
  const fields = [["name", project.name], ["description", project.description], ["inventory.sourceLocation", project.inventory?.sourceLocation ?? ""]] as const
  // PG&E field F is the accepted City/County field; it can list several endpoint areas.
  // This source-specific field meaning supplies town/county clues, never a California assumption.
  if (project.inventory?.sourceKey === "ca-pge-tpr" && project.inventory.sourceLocation) {
    for (const part of project.inventory.sourceLocation.split("|")) {
      const items = part.split(",").map(value => value.trim()).filter(Boolean)
      if (items.length === 2) add("town", items[0], "inventory.sourceLocation:City/County")
      if (items.length <= 2 && items.length) add("county", items.at(-1)!, "inventory.sourceLocation:City/County")
    }
  }
  for (const [field, text] of fields) {
    if (!text.trim() || empty.test(text.trim())) continue
    // Full state names are geographic clues only in location context, never a publisher footprint.
    if (field === "inventory.sourceLocation") {
      for (const [code, name] of Object.entries(STATES)) {
        if (new RegExp(`(?:^|[,;|]\\s*|\\bin\\s+)${name}(?=$|[,;|])`, "i").test(text)) add("state", name, field)
        if (new RegExp(`(?:^|[,;]\\s*)${code}(?=$|[,;])`).test(text)) add("state", code, field)
      }
      for (const match of text.matchAll(/(?:^|;)\s*([^;:]+?)\s+Counties\b/g)) {
        for (const county of match[1].split(/,|\s+and\s+/)) add("county", county, field)
      }
    }
    for (const match of text.matchAll(/\b(?:in|within|across)\s+(?:the\s+state\s+of\s+)?([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,3})(?=[,.;]|$)/g)) {
      if (stateCode(match[1])) add("state", match[1], field)
    }
    for (const part of text.split(/[;\n]/)) {
      const labelled = part.match(/^\s*(from terminal|to terminal|starting(?:\/substation)? county|ending county|county|counties|city|town|state)\s*:\s*(.+)$/i)
      if (labelled) {
        const label = labelled[1].toLowerCase(), value = labelled[2]
        if (label.includes("terminal")) add("endpoint", facilityText(value), `${field}:${label.startsWith("from") ? "from" : "to"}`)
        else if (label.includes("count")) for (const county of value.split(/[,/&]|\s+and\s+/i)) add("county", county.replace(/\s+Count(?:y|ies)$/i, ""), field)
        else add(label === "state" ? "state" : "town", value, field)
        continue
      }
      for (const match of part.matchAll(/\b([A-Z][\w.'’-]*(?:\s+(?:[A-Z][\w.'’-]*|and|de|la)){0,4})\s+County\b/g)) add("county", match[1], field)
      for (const match of part.matchAll(/\b(?:city|town)\s+of\s+([A-Z][\w.'’-]*(?:\s+[A-Z][\w.'’-]*){0,3})/g)) add("town", match[1], field)
      for (const match of part.matchAll(/\b([A-Z][\w.'’-]*(?:\s+[A-Z][\w.'’-]*){0,4})\s+(?:Substation|Station|Terminal)\b/g)) add("facility", facilityText(match[1]), field)
    }
    // An explicit "from A to B" or named "A to B" line is a pair; hyphens/commas alone are not.
    const routeText = field === "description" ? text.match(/\bfrom\s+([^.;\n]+?\s+to\s+[^.;\n]+)/i)?.[1] : text
    if (routeText && !routeText.includes(":")) {
      const endpoints = routeText.match(/^(?:from\s+)?(.{2,90}?)\s+to\s+(.{2,90}?)(?=\s+\d+(?:\.\d+)?\s*kV\b|\s+(?:transmission|line|rebuild|replacement|project)\b|[;.\n]|$)/i)
      if (endpoints) {
        add("endpoint", facilityText(endpoints[1]), `${field}:from`)
        add("endpoint", facilityText(endpoints[2]), `${field}:to`)
      }
    }
    if (field === "name") add("facility", facilityText(text.replace(/^\S+\s+[—–]\s+/, "")), field)
    if (field === "inventory.sourceLocation" && project.inventory?.sourceKey !== "ca-pge-tpr") for (const part of text.split(/[,;\n]/)) {
      const clean = part.trim()
      if (clean && !clean.includes(":") && !/\b(?:county|counties|miles?|feet|acres?|to)\b/i.test(clean) && !stateCode(clean)) add("facility", facilityText(clean), field)
    }
  }
  return clues
}
