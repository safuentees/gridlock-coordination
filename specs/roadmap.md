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

F00–F14 deliver the working tool and remain complete. The next milestone surrounds it with entry, supported outcomes and useful return/handoff workflows while independently strengthening real evidence. All listed features are selected scope; increments remain independently deliverable and no task quota applies.

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

## Critical path
F00 → F01 + F02 + F03 → first connected real milestone, without waiting for F04. F04 expands independent ingestion while F05/F06 extend UI and F07 extends canonical calculations. F08 builds against the shared schema independently and connects after F03; bulk extraction is not a dependency. UI works against 300 synthetic records on the shared schema and core interface. Unknown coordinates never block showing inventory.

## Active workers

F15/F16 and F19 contextual search are integrated through PR30–34. Home/Outcomes are connected to retained working views and one applied scenario; need/zone search is shared by Explore/Readiness. The coordinator build passed at8eff2e7 with existing warnings; no browser or visual checks. F19 public evidence research continues independently.

F17 is now assigned: core owns the additive storage/export contract; ui owns review/calculator/Explorer presentation after that contract lands, with exact boundaries in its spec. Coordinator retains App/Readiness and integration. Core proceeds to F18's restore module/component when its prerequisite contract is integrated; UI supplies the BriefWorkspace insertion. No other workers edit shared consumers.

Next ready handoffs: ui takes F17 after F15 integration and saved-data contract agreement; core takes F18 when that contract is integrated. F19 continues with ten evidence decisions and integrates any supported small revision early; absent public coordinate evidence is a real blocker for data changes, not for other work. Do not leave workers idle when a ready selected increment exists. Never guess coordinates to meet a batch count.

F14 is complete through PR27–29. UI delivered the single panel, restored browsing context and map occlusion; core delivered per-candidate impact drafts and detail topics. The coordinator's sole composition build passed at 5502dcd with the existing bundle-size and future Vite-loader warnings. No browser, visual or mobile checks ran. Source data, canonical calculations and storage interfaces were unchanged.

F00–F13 are complete. F10 integrated in PR15–17; its single build passed at 6e63757. Stage 2 assessed arrival, working, understanding, acting and returning against the mission. F11–F13 deliver guided coverage work, source context and local source-revision continuity through PR18–22. Final combined build and representative revision/storage check passed at 5404535; existing bundle-size and future Vite config-loader warnings remain nonblocking.

The F11 shared revision/readiness contract was integrated before dispatch. UI delivered the readiness workspace against real/demo-scale data; ingestion independently retained 44 project needs and 208 planning zones in the same schema; core delivered safe browser persistence. Coordinator integrated and checked; no duplicate core calculation checks and no visual/browser checks.

The focused copy/control pass is integrated through PR24–26: shared tooltip-backed controls and persistent UI instructions, concise secondary workspaces, and curated comparison/source context. Project-specific limitations remain beside their evidence; source data and calculation/storage interfaces are unchanged. The coordinator's one composition build passed at e0d2b92 with the same nonblocking warnings; no browser or visual checks were run.

The previously proposed ten-record evidence batch is now F19 selected work. Current schedule refresh, additional utilities, explicit related-record navigation and verified route geometry remain proposed extensions; they need concrete source evidence and should not be disguised as more landing-page content.

Coordinator dispatches and resumes up to three subagents in this chat directly. Separate managed worktrees/branches begin at integrated F00; subsequent features use latest main. No separate chats or scheduler. User has authorized project pushes, small PRs and coordinator integration; private project creation was explicitly authorized. Only origin (gridlock-coordination) accepts application pushes; workflow-template push is disabled. No branch deletion.

Milestones: M1 F01–F03 connected real/demo explorer; M2 source coverage + scenarios/briefs + impact; M3 validated revision import and final mission review. Only coordinator checks; receipts on integrated main record completion. M2 and M3 shared one final bounded check at c709368; see changes/M2-M3.md. No redundant status-only PRs.
