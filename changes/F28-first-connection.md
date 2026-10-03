# F28 first connected capability

F28's shared contract and first implementation increments are committed on the `codex/F28-geographic-enrichment` branch. The integrated branch includes PR171's full-collection extraction/matching/cache pipeline, PR172's reusable references, and PR170's Data readiness coverage panel plus coordinator-owned processing/storage wiring. The separate strict candidate engine and source Project fields are unchanged.

The current real collection contains 14,923 records. Against 35,936 references (all 56 Census states/territories, 3,235 county equivalents, 19,729 incorporated places, 12,913 Census-designated places, and three exact-ID guarded BPA general pins), the representative case reconciled every row:

| Outcome | Records |
|---|---:|
| Source-located | 68 |
| Approximate | 12,114 |
| Ambiguous | 680 |
| Unsupported with a specific reason | 2,061 |
| Not processed | 0 |

The case confirmed source Projects were not mutated. Approximate includes evidence-supported geographic areas and endpoint/facility context; it does not promise project-center accuracy. The reference bundle is 40,865,532 bytes. Census bounds remain labeled geographic extents; cited numeric accuracy is null unless the source explicitly supplies it. Original Census pages remain preserved in the ignored source cache, not Git.

## Bounded check and limitation

The direct whole-collection case passed using the existing esbuild dependency. `npm run build` did not finish: `tsc -b` remained idle without output for five minutes. A direct diagnostic `tsc -b --verbose` invocation also stalled after creating the missing ignored `node_modules/.tmp` build-info directory and was stopped; no compiler diagnostic was produced. The temporary runtime case through `tsx` likewise stalled in its loader before executing, so the same case was run through the installed esbuild binary. No browser, visual, Playwright, mobile, or UI-interaction checks ran. Production compilation remains unverified.

## Remaining F28 work

The current result is an early connection, not completion. It exposes where coverage is coarse or unavailable. The next high-value work is reliable official source-GIS/facility matching for the entire unresolved collection, followed by approximate map/list rendering, explicit review and correction, uncertainty-aware exploratory proximity, and final coverage reconciliation. No national substation reference was found in the initial source survey; gated or restricted sources and bulk public geocoder calls remain excluded. If a record has no permitted supporting evidence, it stays accessible with its unresolved reason.
