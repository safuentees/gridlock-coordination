// Generation gate against the authoritative C2 contracts; no copied schemas or test harness.
import { readFileSync } from 'node:fs'
import { pathToFileURL } from 'node:url'
import { resolve } from 'node:path'

const [schemaRoot, assetPath, manifestPath] = process.argv.slice(2)
if (!schemaRoot || !assetPath || !manifestPath) throw new Error('Expected schema repository root, asset and manifest paths')
const facilities = await import(pathToFileURL(resolve(schemaRoot, 'app/src/domain/geographic-facility.ts')).href)
const attribution = await import(pathToFileURL(resolve(schemaRoot, 'app/src/domain/geographic-attribution.ts')).href)
facilities.geographicFacilityAssetSchema.parse(JSON.parse(readFileSync(assetPath, 'utf8')))
attribution.geographicReferenceAssetSchema.parse(JSON.parse(readFileSync(manifestPath, 'utf8')))
