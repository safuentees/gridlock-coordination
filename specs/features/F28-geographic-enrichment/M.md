# F28-M — Approximate geography on map and list

After shared contract and map-owner handoff, display source points, approximate facility/endpoints and geographic extents distinctly; never invent a dot for an area. Selection/fitting include real bounds, and full evidence stays in the one panel. The list retains all records and geographic status/uncertainty. Preserve strict candidates, controls, insets, real/demo, experimental map and all user edits. No map work starts before exact F28-M handoff.

Dependencies, owner, exact file boundaries and observable acceptance are fixed in [the parent spec](spec.md). Coordinator owns shared changes and sole bounded checks.

## First map-only handoff

Worker `map-ui` may build independently from the committed shared F28 contract after coordinator dispatch; integration follows A/B/D. Exact files: `app/src/features/explorer/ProjectMap.tsx`, `MapLegend.tsx`, `map-view.ts`, new `geography-map.ts`, `density-map/MapLibreProjectMap.tsx`, `density-map/map-layers.ts`, optional new `density-map/geography-layers.ts`, `changes/F28-map.md`. No Explorer/App/readiness/schema/packages/density hierarchy edits. Root owns the later current-run prop connection and list/detail geography presentation; preserve the local user Explorer patch.

Add optional `geographicRecords?: readonly GeographicRecord[]` to ProjectMapProps; absent preserves all existing behavior. Root will pass only the validated active-mode/current-dataset companion records. Ignore IDs outside the supplied projects. Keep original source positions authoritative and avoid rendering them twice. Supplement with distinctly approximate points/endpoints and labeled area extents. Areas never become center dots, strict candidate endpoints or density point inputs. Group identical extents if necessary so thousands of rows do not stack thousands of identical shapes; selection of a record still highlights its own representation. No arbitrary row removal from the list. Both renderers must keep map selection callbacks and fit selection/projects using true endpoint/area bounds outside panel insets. Preserve stationary controls, attribution, tile errors, event isolation and labeled synthetic previews.

The first map commit is an independently reusable adapter; root connects it in a subsequent small integration. No worker checks/browser/screenshots. Report implementation limitations honestly and retain trial worktrees.

## Connected increment

PR175's adapter is integrated into the published F28 branch. UI explicitly handed App/Explorer/ComparisonPanel to coordinator for this connection; root also owns the new `GeographicEvidence.tsx` presentation helper, the one-word Sources export in ProjectDetails, and the guarded optional reveal insertion in GeographyPanel. The user's primary-checkout Explorer patch remains outside this worktree. One App-owned geographic controller feeds both Explore and Readiness; no second processing/review copy. Current compatible records are passed to both maps and the existing single detail panel. The All projects list adds meaningful geographic-state/extent filters, retains every imported record, and opens the same selected ID as map callbacks. Review geography reveals the same record in Readiness without clearing existing browsing or drafts. Source geometry and strict calculations stay authoritative; map interaction/GPU behavior is unexercised.
