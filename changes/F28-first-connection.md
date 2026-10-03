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

An additional source-inventory pass recorded eight official facility/GIS candidates and rejected speculative ingestion: CEC is token-gated, National Grid metadata returned HTTP 403, Arkansas's layer has no facility names, ATC's ten general project pins lack a native MISO identity/role, and Eversource layers represent distribution hosting capacity rather than transmission project centers. GNIS populated-place data could improve locality context only after its coordinate meaning, CRS and matching precedence are explicitly agreed. This pass added no points to the reference bundle; three small public metadata originals remain hash-pinned in ignored storage.

## Bounded check and limitation

The direct whole-collection case passed using the existing esbuild dependency. `npm run build` did not finish: `tsc -b` remained idle without output for five minutes. A direct diagnostic `tsc -b --verbose` invocation also stalled after creating the missing ignored `node_modules/.tmp` build-info directory and was stopped; no compiler diagnostic was produced. The temporary runtime case through `tsx` likewise stalled in its loader before executing, so the same case was run through the installed esbuild binary. No browser, visual, Playwright, mobile, or UI-interaction checks ran. Production compilation remains unverified.

Local integration is committed on `codex/F28-geographic-enrichment`. Publishing it is currently blocked: `git push origin codex/F28-geographic-enrichment` returned `Repository not found`, and a live GitHub repository lookup returned a connection error. The configured `origin` is the Gridlock project; the workflow-template remote remains fetch-only. PR169 still points at the prior branch head, so the local integration must not be described as merged to main.

## Remaining F28 work

The current result is an early connection, not completion. It exposes where coverage is coarse or unavailable. The next high-value work is reliable official source-GIS/facility matching for the entire unresolved collection, followed by approximate map/list rendering, explicit review and correction, uncertainty-aware exploratory proximity, and final coverage reconciliation. No national substation reference was found in the initial source survey; gated or restricted sources and bulk public geocoder calls remain excluded. If a record has no permitted supporting evidence, it stays accessible with its unresolved reason.

## Subsequent local increments

After the first case, PR173 added the immutable fingerprint-bound review helper, the coordinator wired accepted/rejected/corrected decisions through the separate companion cache, and PR174 added selected-record review controls with cited correction forms. Drafts survive selection/tab/workspace navigation while mounted; cross-session draft storage and companion import preview are not part of this increment. The map-only F28-M task is assigned in the existing map chat. These increments are integrated locally on the isolated feature branch and remain subject to a successful publish/merge; the primary checkout's unrelated uncommitted files are preserved.
