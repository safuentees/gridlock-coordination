# F28-B — Complete declared Census area references

- Added 19,729 incorporated places and 12,913 CDPs; the bundle now has 35,936 references including 56 states/territories, 3,235 county equivalents and the three accepted guarded BPA general pins.
- Published compact asset: 40,865,532 bytes; reference revision census-acs2025-bpa-0221b350b2cdfaf4. All four declared Census layers are complete.
- Preserved 185 public original files / 955,292,226 bytes outside Git, with exact URLs, hashes, CRS/use meanings and acquisition counts; no centroids, invented precision or withheld BPA coordinates.
- Added bounded transport retries and incremental state/county reuse against matching source hashes after an older local polygon read stalled; reference revision now covers emitted semantics as well as upstream bytes.
- County subdivisions, GNIS-only localities, historical area editions and broader facility coverage remain gaps; area-reference completion is not full F28 or matching completion.
- No worker application checks or visuals; coordinator owns the combined milestone check and integration.

## Reusable facility-source inventory continuation

- Assessed authoritative national/state/owner GIS leads against the entire collection and its recorded 680 ambiguous / 2,061 unsupported outcomes; the saved case has no per-source breakdown, so no such counts are asserted.
- Recorded priority inventory clues and eight candidate decisions in `scripts/enrichment/source-inventory.json`, including CEC token gating, National Grid HTTP 403, unnamed Arkansas points, and ATC's ten pins with unqualified role/identity.
- Preserved three metadata-only originals (19,386 bytes) with exact URLs and SHA-256 hashes. Added zero speculative runtime points; the 35,936-reference asset is unchanged.
- Identified current USGS GNIS populated places as a broadly reusable locality fallback. It needs a coordinator/core handoff because the current town matcher accepts area geometry only; national acquisition is not started.
- No application checks or visuals. F28-B/full-collection refinement remains open.

## New PJM utility evidence increment

- Completed a new 6.8-minute pass (17:48:33–17:55:21 UTC, October 3; maximum 20 minutes) on AEP Ohio, Potomac Edison, PPL and Dominion public utility leads.
- Recorded exact new blockers: named AEP hosting-grid polygons are not station sites; Potomac Edison points lack facility identities; PPL does not publish hosting maps; Dominion's linked terms prohibit reuse without authorization.
- Preserved 15 public metadata/explanation snapshots, 5,496,597 bytes, with URLs/hashes. No feature geometry, GNIS/NAD83 ingestion, inferred positions or application checks.
- No candidate qualified for a finite facility adapter, so the existing reference asset is unchanged. Each source decision records its concrete enabling input; broader F28-B stays open.


## Complete GNIS county-context increment

- Added the full September 2, 2026 official Populated Places extract as coarse locality county context: 3,215 references / 138,836 canonical names; bundle now 39,151 references / 49,975,890 bytes (`census-acs2025-bpa-gnis-f745fdb66ed6b69f`).
- Reconciled all 190,923 observations: 139,374 retained, 51,549 excluded, zero pending/failed. Exclusions cover historical names, finer Census names, missing state identities and unmatched county codes; repeated native ID 1406241 retains both row locators.
- Preserved five complete official downloads / 7,773,095 bytes, metadata/use hashes and a 190,923-row coordinate-free disposition ledger outside Git. Added reproducible acquisition and full offline generation using the actual application normalizer.
- Preserved existing Census/BPA values. No GNIS coordinates, datum transform, facility/project centers or accuracy claim; 6,994 same-state homonyms across counties stay separate and potentially ambiguous.
- No worker application checks or visuals. This completes the selected GNIS reference increment; coordinator integration/full-collection case and broader facility evidence remain separate.
