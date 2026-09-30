import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { parseSourceDataset, compareDatasets } from "../src/data/import"
import { createLocationRevision, getReadiness, type LocationEvidenceDraft } from "../src/data/readiness"
import { clearSourceSession, readSourceSession, saveSourceSession } from "../src/data/source-session"

// One isolated end-to-end evidence revision; no bundled source or real browser storage is changed.
const source = parseSourceDataset(readFileSync(new URL("../src/data/real/dataset.json", import.meta.url), "utf8"))
const project = source.projects.find(value => value.location === null)!
assert.ok(project, "Representative source record without a location must exist")
const draft: LocationEvidenceDraft = { latitude: "33.25", longitude: "-81.5", method: "source-point", sourceFile: "Synthetic check fixture", sourceLocator: "Case 1 (not source evidence)", sourceUrl: "" }
const revision = createLocationRevision(source, project.id, draft, "2026-09-30T00:00:00Z")
const diff = compareDatasets(source, revision)
assert.equal(diff.added.length, 0)
assert.equal(diff.removed.length, 0)
assert.equal(diff.changed.length, 1)
assert.equal(diff.changed[0].after.id, project.id)
assert.deepEqual(diff.changed[0].after.sources, project.sources)
assert.equal(diff.changed[0].after.location?.confidence, "unverified")
assert.equal(getReadiness(revision).missing, getReadiness(source).missing - 1)
assert.equal(getReadiness(revision).unverified, getReadiness(source).unverified + 1)
assert.equal(project.location, null, "Original input remains unchanged")
assert.throws(() => createLocationRevision(source, project.id, { ...draft, latitude: "" }), /latitude/)
assert.throws(() => createLocationRevision(source, project.id, { ...draft, sourceLocator: " " }), /locator/)
assert.throws(() => createLocationRevision({ ...source, mode: "demo" }, project.id, draft), /Demo/)

const stored = new Map<string, string>([["gridlock.unrelated-check", "preserve"]])
Object.defineProperty(globalThis, "localStorage", { configurable: true, value: {
  getItem: (key: string) => stored.get(key) ?? null,
  setItem: (key: string, value: string) => { stored.set(key, value) },
  removeItem: (key: string) => { stored.delete(key) },
} })
assert.equal(readSourceSession().dataset, null)
assert.equal(saveSourceSession(revision), null)
assert.deepEqual(readSourceSession().dataset, revision, "Revision survives return through validation")
const revisionKey = [...stored.keys()].find(key => key !== "gridlock.unrelated-check")!
stored.set(revisionKey, "not JSON")
assert.equal(readSourceSession().writeBlocked, true)
assert.ok(saveSourceSession(revision), "Malformed saved content is not overwritten")
assert.equal(stored.get(revisionKey), "not JSON")
assert.equal(clearSourceSession(), null)
assert.equal(readSourceSession().dataset, null)
assert.equal(stored.get("gridlock.unrelated-check"), "preserve")
console.log(`PASS: one sourced revision for ${project.id}; stable identity and provenance, unverified location, preview, return, malformed-storage protection and scoped reset.`)
