#!/usr/bin/env node
/** Extend the existing complete Census/BPA bundle with full GNIS county context.
 * Requires Node 22.18+ native TypeScript support to reuse the actual normalizer.
 * Never reads GNIS coordinates or runs the application enrichment pipeline.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { normalizeGeographicName } from '../../app/src/enrichment/clues.ts'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const args = process.argv.slice(2)
const arg = (name, fallback) => { const i = args.indexOf(name); return i === -1 ? fallback : args[i + 1] }
const originals = arg('--originals')
if (!originals) throw new Error('--originals is required; run acquire_gnis.py first')
const output = arg('--output', resolve(root, 'app/src/data/geography/references.json'))
const baseline = arg('--base-references', output)
const read = path => readFileSync(path, 'utf8')
const sha = raw => createHash('sha256').update(raw).digest('hex')
const snapshot = JSON.parse(read(resolve(originals, 'administrative-snapshot.json')))
for (const [name, source] of Object.entries(snapshot.downloads)) {
  if (sha(readFileSync(resolve(originals, name))) !== source.sha256) throw new Error(`Original hash mismatch: ${name}`)
}
const raw = read(resolve(originals, 'administrative-rows.jsonl'))
if (sha(raw) !== snapshot.administrativeRowsSha256) throw new Error('Administrative extraction hash mismatch')
const bundle = JSON.parse(read(baseline))
const prefix = 'gnis-county-context:'
// Removing our own prior extension makes a repeated offline generation idempotent.
const baseReferences = bundle.references.filter(ref => !ref.id.startsWith(prefix))
const baseSources = bundle.sources.filter(source => !source.id.startsWith(prefix))
const states = new Map(baseReferences.filter(ref => ref.id.startsWith('census-acs2025:state:')).map(ref => [ref.id.split(':').at(-1), ref.stateCodes[0]]))
const counties = new Map(baseReferences.filter(ref => ref.id.startsWith('census-acs2025:county:')).map(ref => [ref.id.split(':').at(-1), ref]))
const finer = new Set()
for (const ref of baseReferences) {
  if (ref.kind !== 'town' || ref.representation.kind !== 'area' || ref.representation.precision !== 'town') continue
  for (const state of ref.stateCodes) for (const name of ref.names) finer.add(`${state}:${normalizeGeographicName(name)}`)
}
if (states.size !== 56 || counties.size !== 3235) throw new Error('Complete supported Census ACS2025 baseline required')
const groups = new Map(), counts = {}, unsupportedStates = new Map(), unsupportedCounties = new Map(), ledger = [], homonyms = new Map()
let retained = 0, rawRows = 0
const counted = reason => { counts[reason] = (counts[reason] ?? 0) + 1 }
for (const line of raw.trimEnd().split('\n')) {
  const row = JSON.parse(line)
  rawRows++
  const state = states.get(row.state_numeric)
  const countyCode = row.state_numeric + row.county_numeric
  const county = counties.get(countyCode)
  const canonical = normalizeGeographicName(row.feature_name)
  let reason = null
  if (row.historical) reason = 'historical-feature'
  else if (row.feature_class !== 'Populated Place') reason = 'other-feature-class'
  else if (!row.feature_id || !canonical) reason = 'missing-identity-or-name'
  else if (!state) reason = 'unsupported-state-code'
  else if (!county || county.stateCodes[0] !== state || !/^\d{2}$/.test(row.state_numeric) || !/^\d{3}$/.test(row.county_numeric)) reason = 'missing-or-changed-county-code'
  else if (finer.has(`${state}:${canonical}`)) reason = 'finer-census-town-name-in-state'
  if (reason) {
    counted(reason)
    if (reason === 'unsupported-state-code') {
      const key = `${row.state_numeric}:${row.state_name}`
      unsupportedStates.set(key, (unsupportedStates.get(key) ?? 0) + 1)
    }
    if (reason === 'missing-or-changed-county-code') {
      const key = `${countyCode}:${row.state_name}:${row.county_name}`
      unsupportedCounties.set(key, (unsupportedCounties.get(key) ?? 0) + 1)
    }
  } else {
    retained++
    if (!groups.has(countyCode)) groups.set(countyCode, { county, names: new Map(), rows: 0 })
    const group = groups.get(countyCode)
    // Distinct source features in one county share only that county context.
    // They remain distinct native IDs/rows in the complete offline ledger.
    if (!group.names.has(canonical)) group.names.set(canonical, row.feature_name)
    group.rows++
    const key = `${state}:${canonical}`
    if (!homonyms.has(key)) homonyms.set(key, new Set())
    homonyms.get(key).add(countyCode)
  }
  ledger.push({ line: row.line, featureId: row.feature_id, name: row.feature_name, canonicalName: canonical, stateNumeric: row.state_numeric, countyNumeric: row.county_numeric, sourceCountyName: row.county_name, stateCode: state ?? null, disposition: reason ?? 'retained', referenceId: reason ? null : prefix + countyCode })
}
if (rawRows !== snapshot.rawRows || retained + Object.values(counts).reduce((sum, n) => sum + n, 0) !== rawRows) throw new Error('Full GNIS reconciliation failed')
const zipUrl = snapshot.downloads[snapshot.populated.archive].url
const newReferences = [...groups.entries()].sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0).map(([countyCode, group]) => {
  const county = group.county, stateCode = county.stateCodes[0]
  return {
    id: prefix + countyCode,
    kind: 'town', names: [...group.names.entries()].sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0).map(([, name]) => name),
    stateCodes: [stateCode], sourceKeys: [], projectIds: [],
    representation: {
      ...county.representation,
      label: `County context for named locality — ${county.representation.label}`,
      evidence: [
        { file: `${snapshot.populated.archive}!${snapshot.populated.textMember}`, locator: `Published ${snapshot.populated.publication}; state_numeric=${countyCode.slice(0, 2)}, county_numeric=${countyCode.slice(2)}; feature_name canonical match to reference.names; ${group.rows} retained native rows. Complete feature_id/line lookup: county-context-ledger.jsonl, referenceId=${prefix}${countyCode}.`, url: zipUrl },
        ...county.representation.evidence,
      ],
      limitations: [
        'County context for named locality only: GNIS identifies the county of its primary feature location, not the locality boundary, whole settlement extent, project position or facility identity.',
        'Only official nonhistorical names and administrative codes are consumed. GNIS coordinates are unused; no NAD83 conversion, centroid or locality point is emitted.',
        'Current GNIS names are joined to Census ACS2025 county codes. Missing/changed codes are excluded; no historical county remapping is inferred.',
        'Same-named localities in different counties remain separate ambiguous references. Canonical name/state matches to finer Census town areas are omitted from this fallback.',
        ...county.representation.limitations,
      ],
    },
  }
})
const sources = [...baseSources]
for (const [name, source] of Object.entries(snapshot.downloads)) {
  sources.push({ id: prefix + name, evidence: { file: name, locator: name.endsWith('.zip') ? 'Complete preserved official national extract; contained XML access/use constraints None; see administrative-snapshot.json for member hashes and publication edition' : 'Official GNIS field definitions, download scope or current/historical name meanings; preserved complete source', url: source.url }, sha256: source.sha256, permittedUse: 'USGS source XML states access/use constraints None and requests acknowledgment. Geographic nomenclature/administrative facts are attributed to USGS; no accuracy or completeness warranty.' })
}
const limitations = bundle.limitations.filter(text => !text.startsWith('GNIS county context:')).map(text => text === 'The four declared Census layers do not include every locally named settlement: county subdivisions, GNIS-only localities and historical boundary editions are not in this bundle.' ? 'County subdivisions and historical boundary editions are not in this bundle; GNIS contributes county context only for supported nonhistorical locality names.' : text)
limitations.push('GNIS county context: full national official populated-place names are grouped by supported Census county. This coarse locality fallback uses no GNIS coordinates and is never a facility/project center or a locality boundary.')
const references = [...baseReferences, ...newReferences]
const normalizerSha256 = sha(readFileSync(resolve(root, 'app/src/enrichment/clues.ts')))
const revision = `census-acs2025-bpa-gnis-${sha(JSON.stringify({ producerVersion: 1, normalizerSha256, sources, references, limitations })).slice(0, 16)}`
const dates = [bundle.retrievedOn, ...Object.values(snapshot.downloads).map(source => source.retrievedAt.slice(0, 10))]
const result = { ...bundle, revision, retrievedOn: dates.sort().at(-1), sources, references, limitations }
const content = JSON.stringify(result) + '\n'
const ledgerContent = ledger.map(row => JSON.stringify(row)).join('\n') + '\n'
writeFileSync(resolve(originals, 'county-context-ledger.jsonl'), ledgerContent)
writeFileSync(output, content)
const summary = {
  version: 1, edition: snapshot.populated.publication, retrievedOn: result.retrievedOn,
  sourceArchiveSha256: snapshot.downloads[snapshot.populated.archive].sha256,
  historicalArchiveSha256: snapshot.downloads[snapshot.historical.archive].sha256,
  populatedTextSha256: snapshot.populated.textSha256, sourceMetadataSha256: snapshot.populated.metadataSha256,
  baselineReferencesSha256: sha(JSON.stringify(baseReferences)), normalizerSha256,
  rawRows, uniqueFeatureIds: snapshot.uniqueFeatureIds, repeatedFeatureIds: snapshot.repeatedFeatureIds, retainedRows: retained, excludedRows: rawRows - retained, exclusions: counts, pending: 0, failed: 0,
  unsupportedStateCodes: [...unsupportedStates.entries()].map(([source, rows]) => ({ source, rows })),
  unsupportedCountyCodes: [...unsupportedCounties.entries()].map(([source, rows]) => ({ source, rows })),
  countyContextReferences: newReferences.length, namesAcrossCountyReferences: newReferences.reduce((n, ref) => n + ref.names.length, 0),
  sameStateCanonicalNamesInMultipleCounties: [...homonyms.values()].filter(set => set.size > 1).length,
  totalReferences: references.length, referenceRevision: revision, compactBytes: Buffer.byteLength(content),
  ledger: { file: 'county-context-ledger.jsonl', sha256: sha(ledgerContent), bytes: Buffer.byteLength(ledgerContent), rows: ledger.length },
  meanings: [
    'Raw rows retain every source observation, including repeated native feature IDs; the source ID plus original line distinguishes evidence. Aliases are grouped only for county context, never to merge physical features.',
    'Exclusions are applied in the stated producer order; historical rows precede unsupported county and finer Census name exclusions.',
    'County codes are exact administrative joins; unknown/retired codes are not translated. GNIS county fields identify the primary location county, not whole-feature containment.',
    'Names are canonicalized by the application normalizer; a same-name/state finer Census town takes precedence. Different counties retain separate references.',
    'All original coordinates are unused. Numeric accuracy remains unknown. No application enrichment/check was run by this producer.',
  ],
}
writeFileSync(resolve(root, 'scripts/enrichment/gnis-county-context-summary.json'), JSON.stringify(summary, null, 2) + '\n')
console.log(JSON.stringify(summary, null, 2))
