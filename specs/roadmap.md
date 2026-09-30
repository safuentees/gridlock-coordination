---
setup: ready
run_start: 2026-09-30
time_budget: not supplied
usage_budget: not supplied
contract_owner: coordinator
reporting_agent: coordinator
merge_owner: coordinator
check_owner: coordinator
base_commit: 9dfc2cea1221d064cb30a03386c50b40df5f58b0
check_budget: "5 minutes per integrated milestone; no visual checks"
---

# Product roadmap

F00–F14 deliver the working tool and remain complete. F15–F19 surround it with entry, supported outcomes and useful return/handoff workflows while independently strengthening real evidence. F20 adds independent map focus controls; F21 organizes actions and scrolling around user tasks. F00–F21 are integrated; evidence gaps remain explicit. Increments are independently deliverable and no task quota applies.

| ID | Capability | Owner | Phase | Depends on | Owned paths |
|---|---|---|---|---|---|
| F00 | [Shared scaffold and contracts](features/F00-bootstrap/spec.md) | coordinator | 0 | none | `app/`, `specs/`, `README.md` |
| F01 | [Connect ten source-backed projects](features/F01-real-seed/spec.md) | ingestion | 1 | F00 | `scripts/ingest/`, `app/src/data/real/` |
| F02 | [Canonical proximity and ranking](features/F02-matching-core/spec.md) | core | 1 | F00 | `app/src/core/`, `app/scripts/check-core.ts` |
| F03 | [Connected map and project explorer](features/F03-explorer/spec.md) | ui | 1 | F00 | `app/src/App.tsx`, `app/src/features/explorer/`, `app/src/data/demo/` |
| F04 | [Expand both planning inventories](features/F04-source-coverage/spec.md) | ingestion | 2 | F01 | `scripts/ingest/`, `app/src/data/real/` |
| F05 | [Explore geographic and temporal scenarios](features/F05-scenario-timeline/spec.md) | ui | 2 | F02, F03 | `app/src/App.tsx`, `app/src/features/explorer/`, `app/src/features/scenarios/` |
| F06 | [Save comparisons and coordination briefs](features/F06-coordination-brief/spec.md) | ui | 2 | F05 | `app/src/App.tsx`, `app/src/features/briefs/`, `app/src/features/explorer/Explorer.tsx` |
| F07 | [Transparent shared-corridor scenario](features/F07-impact-estimate/spec.md) | core | 3 | F02 | `app/src/core/`, `app/src/features/impact/` |
| F08 | [Import and compare revised datasets](features/F08-dataset-revisions/spec.md) | coordinator | 3 | F00 | `app/src/features/import/`, `app/src/data/import.ts`, `app/src/App.tsx` (agreed composition) |
| F09 | [Viewport-sized workspace](features/F09-viewport-workspace/spec.md) | coordinator + ui + workspace-briefs | 4 | F03, F05–F08 | `App.tsx`, `index.css`, shared dialog, explorer/scenarios, brief presentation and import presentation |
| F10 | [Map-first workspace](features/F10-map-workspace/spec.md) | coordinator + ui + comparison | 5 | F09 | coordinator: `App.tsx`, `Explorer.tsx`; ui: `ProjectMap.tsx`; comparison: `ComparisonPanel.tsx`, `ProjectDetails.tsx` |
| F11 | [Guided location evidence](features/F11-data-readiness/spec.md) | coordinator + ui | 6 | F10 | coordinator: `data/readiness.ts`, App/Explorer composition; ui: `features/readiness/*` |
| F12 | [Public planning context](features/F12-source-context/spec.md) | ingestion | 6 | F10 | `scripts/ingest/*`, `data/real/*`, `changes/F12.md` |
| F13 | [Return to source revisions](features/F13-source-return/spec.md) | core + coordinator | 6 | F08, F10 | core: `data/source-session.ts`, `changes/F13.md`; coordinator: App composition, import copy |
| F14 | [One map panel with stack navigation](features/F14-panel-stack/spec.md) | ui + core + coordinator | 7 | F10–F13 | ui: Explorer/ProjectMap + receipt; core: ComparisonPanel/ImpactPanel; coordinator: shared contract/docs/integration |
| F15 | [Product entry and navigation](features/F15-product-entry/spec.md) | ui + coordinator | 8 | F14, journey contract | ui: `features/home/HomePage.tsx`, receipt; coordinator: App/navigation |
| F16 | [Supported outcomes and next actions](features/F16-supported-outcomes/spec.md) | core + coordinator | 8 | F14, journey contract | core: `features/outcomes/*`, receipt; coordinator: App/Explorer scenario and reveal wiring |
| F17 | [Actionable saved investigations](features/F17-actionable-investigations/spec.md) | ui + core contract | 9 | F06/F07/F14, F15/F16 composition | `features/briefs/*` excluding restore files, ComparisonPanel/ImpactPanel after handoff; coordinator: shared contracts |
| F18 | [Restore and revisit findings](features/F18-return-to-findings/spec.md) | core + ui insertion | 9 | F17 saved-data contract | core: `briefs/restore.ts`, `RestoreBrief.tsx`, receipt; ui: agreed BriefWorkspace insertion |
| F19 | [Evidence-led discovery and coverage](features/F19-evidence-led-discovery/spec.md) | source_discovery + coordinator | 8–9 | F11/F12, journey contract | source: `lib/project-search.ts`, `data/evidence/*`, research notes/receipt; coordinator: Explorer/Readiness consumers |
| F20 | [Map focus and connection visibility](features/F20-map-focus/spec.md) | map-ui (user's separate chat) | 10 | F14, F15/F16 integrated; UI ownership released | `app/src/features/explorer/ProjectMap.tsx`, optional `app/src/features/explorer/map-view.ts`, `changes/F20.md` only |
| F21 | [Task-based UI organization](features/F21-ui-composition/spec.md) | coordinator + ui + core presentation | 10 | F14–F19; shared composition contract | Exact split in spec: root App/Home/Outcomes/shared menu; ui Explorer/comparison/briefs/scenarios; core readiness/import/restore presentation. F20 paths excluded. |
| F22 | [Experimental map compatibility](features/F22-maplibre-compatibility/spec.md) | map-ui (separate chat) | 11 | F20/F21 integrated; pinned dependency handoff | Exact ProjectMap/map-view + three density-map adapter files, package files and receipt in spec; default Leaflet retained |
| F23 | [Hierarchical project concentrations](features/F23-hierarchical-density/spec.md) | map-ui (separate chat) | 12 | F22 integrated | Exact hierarchy/layer/synthetic files and F22 adapter files; only agreed hierarchy dependencies; receipt |

## Critical path
F00 → F01 + F02 + F03 → first connected real milestone, without waiting for F04. F04 expands independent ingestion while F05/F06 extend UI and F07 extends canonical calculations. F08 builds against the shared schema independently and connects after F03; bulk extraction is not a dependency. UI works against 300 synthetic records on the shared schema and core interface. Unknown coordinates never block showing inventory.

## Current milestone and assignments

**F22 ready; F23 follows compatibility integration.** The user explicitly requested an experimental MapLibre/deck.gl density view in the separate map/UI chat. Coordinator agreed the exact file/dependency handoff in F22/F23; map-ui proceeds without blocking unrelated evidence/UI work. Leaflet stays default, shared contracts/data remain unchanged, and an explicitly isolated synthetic density preview is allowed. Pattern/stipple work waits until the user tries the first density interaction. Coordinator alone merges/checks; no worker or visual checks.

**F21 — complete through PR45/46/47/49 and the final guide update.** Relevant template v1.9.0 composition rules are local without replacing Gridlock decisions. UI grouped browsing/workspace/selection controls and fixed tab scrolling; core independently corrected readiness and revision/restore presentation; coordinator connected consistent Saved reviews navigation. The surface review and retained patterns are in F21. No source/calculation/storage changes or new pages. Coordinator's one build passed at 1a518aa, alongside F20's representative helper case. Existing Vite-loader/bundle warnings remain; no browser, visual or mobile checks. Source review caught and repaired hidden Detail search before integration; interactions were not exercised.

**F20 — complete through PR48.** Role `map-ui` delivered Fit selection and a reversible background Candidate connections toggle. Public ProjectMap props stayed unchanged and fitting consumes F21's updated workspace insets. Coordinator's representative case at 1a518aa confirmed two selected source points, exclusion of missing locations, selected-line preservation while background lines are hidden and unchanged original records. The same combined production build covered F20/F21; no duplicate checks or visual verification.

The existing UI worker confirmed no pending ProjectMap edits and released its ownership on 2026-09-30. This F20 allocation supersedes earlier broad UI claims only for the three exact paths above. Explorer.tsx and all other UI files remain with `ui`; changes there require a coordinator-arranged handoff before assignment or editing. Coordinator keeps merge/check ownership and owns roadmap/spec changes. The new worker uses a separate managed worktree/branch from integrated main; unrelated source/core/UI work is unaffected. No implementation or visual checks are part of this assignment update.

F15/F16 and F19 contextual search are integrated through PR30–34. Home/Outcomes are connected to retained working views and one applied scenario; need/zone search is shared by Explore/Readiness. The coordinator build passed at 8eff2e7 with existing warnings; no browser or visual checks.

F17 is integrated through PR36/37/40: core supplied backward-compatible investigation storage/export and ui connected optional resource questions, next actions, analyst ownership and explicit saving of hypothetical inputs. F18 is integrated through PR41/42: core supplied brief validation/conflict handling and ui connected Restore inside Saved reviews. Existing evidence, mode boundaries and dirty review drafts are preserved. No schema migration or new calculation engine was needed.

F19 is integrated through PR31/34/35/38/39. The source worker completed ten evidence decisions: one supported Okatie permit-area suggestion and nine unresolved records with exact next inputs. Coordinator connected the suggestion to the existing preview/apply/download workflow and the unresolved guidance to affected records. The supplied 252-record snapshot and originals remain unchanged; explicitly applying the suggestion would change coverage from 10 located / 242 missing to 11 unverified / 241 missing. Never guess coordinates to meet a batch count.

The coordinator's final bounded check passed at 7a41fc9: one production build and one representative save/export/restore-and-revision case, within five minutes. The temporary case was corrected to select stable native IDs after its initial case-sensitive name lookup failed; no application defect or second build resulted. It verified legacy compatibility, input-derived hypothetical output, duplicate/draft protection, mode separation and a single-record revision without changing the supplied dataset. Existing bundle-size and future Vite config-loader warnings remain. No worker, browser, visual or mobile checks ran; interactive behavior was not exercised.

| Owner | Next concrete assignment / readiness | Dependency and boundary |
|---|---|---|
| map-ui | F22 ready: experimental MapLibre compatibility; then F23 hierarchy after F22 integration. | Exact files and temporary pinned dependency ownership in F22/F23. Keep interfaces/default map; Explorer excluded. No pattern polish before user trial. |
| source_discovery | Resume an unresolved F19 record when its specified public identity/location evidence becomes available; first actionable target is `desc-6809-g`'s native corridor endpoints, kept distinct from `6809 E`. No additional research batch is selected. | Exact public endpoint/route citation; `data/evidence/*` only. See the nine next-input entries in `f19-location-decisions.json`. No evidence means no coordinate change. |
| coordinator | Integrate a supported evidence proposal through existing preview/revision interfaces when supplied; retain baseline and confidence meanings. | Source/native-ID agreement, then `data/location-proposals.ts` and Readiness composition only if necessary. |
| ui / core | F21 composition slices complete; retain worktrees for the next selected capability. | No ready assigned implementation dependency; no duplicate checks. |

The highest-value proposed extension is a **current public-plan edition refresh**: source_discovery would establish edition/identity continuity, core would reuse revision comparison, and coordinator/UI would surface changed or withdrawn findings. This is medium-sized source/integration work and needs accessible public documents; it would improve present-day usefulness without treating elapsed historical dates as completion. Related-record navigation is a smaller follow-up for distinct phases and linked projects; verified route geometry is a larger evidence effort. These remain proposals, not silently dispatched work.

F14 is complete through PR27–29. UI delivered the single panel, restored browsing context and map occlusion; core delivered per-candidate impact drafts and detail topics. The coordinator's sole composition build passed at 5502dcd with the existing bundle-size and future Vite-loader warnings. No browser, visual or mobile checks ran. Source data, canonical calculations and storage interfaces were unchanged.

F00–F13 are complete. F10 integrated in PR15–17; its single build passed at 6e63757. Stage 2 assessed arrival, working, understanding, acting and returning against the mission. F11–F13 deliver guided coverage work, source context and local source-revision continuity through PR18–22. Final combined build and representative revision/storage check passed at 5404535; existing bundle-size and future Vite config-loader warnings remain nonblocking.

The F11 shared revision/readiness contract was integrated before dispatch. UI delivered the readiness workspace against real/demo-scale data; ingestion independently retained 44 project needs and 208 planning zones in the same schema; core delivered safe browser persistence. Coordinator integrated and checked; no duplicate core calculation checks and no visual/browser checks.

The focused copy/control pass is integrated through PR24–26: shared tooltip-backed controls and persistent UI instructions, concise secondary workspaces, and curated comparison/source context. Project-specific limitations remain beside their evidence; source data and calculation/storage interfaces are unchanged. The coordinator's one composition build passed at e0d2b92 with the same nonblocking warnings; no browser or visual checks were run.

The previously proposed ten-record evidence batch is now F19 selected work. Current schedule refresh, additional utilities, explicit related-record navigation and verified route geometry remain proposed extensions; they need concrete source evidence and should not be disguised as more landing-page content.

Coordinator dispatches and resumes up to three subagents in this chat directly. F20 additionally authorizes a user-led separate map/UI chat with the explicit ownership boundary above; do not create or start that chat as part of the assignment-only update. Separate managed worktrees/branches begin at integrated F00; subsequent features use latest main. No scheduler. User has authorized project pushes, small PRs and coordinator integration; private project creation was explicitly authorized. Only origin (gridlock-coordination) accepts application pushes; workflow-template push is disabled. No branch deletion.

Milestones: M1 F01–F03 connected real/demo explorer; M2 source coverage + scenarios/briefs + impact; M3 validated revision import and final mission review. Only coordinator checks; receipts on integrated main record completion. M2 and M3 shared one final bounded check at c709368; see changes/M2-M3.md. No redundant status-only PRs.
