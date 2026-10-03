// Canonical companion fingerprints use JavaScript number encoding and ignore analyst notes.
import { readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
const canonicalize = (value) => Array.isArray(value) ? value.map(canonicalize)
  : value && typeof value === 'object' ? Object.fromEntries(Object.keys(value).sort().map(key => [key, canonicalize(value[key])]))
  : value
const accepted = JSON.parse(readFileSync(process.argv[2], 'utf8'))
const result = Object.fromEntries(accepted.proposals.map(({ projectId, expected }) => [projectId,
  createHash('sha256').update(JSON.stringify(canonicalize({ ...expected, notes: [] })), 'utf8').digest('hex'),
]))
process.stdout.write(JSON.stringify(result))
