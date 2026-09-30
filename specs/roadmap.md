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

Phases: 0 shared base; 1 first connected map/ranking/real batch; 2 complete inventory, scenario timeline and coordination workflow; 3 impact and revision comparison; then concise access and gaps. All listed features are selected scope; increments remain small.

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

## Critical path
F00 → F01 + F02 + F03 → first connected real milestone, without waiting for F04. F04 expands independent ingestion while F05/F06 extend UI and F07 extends canonical calculations. F08 builds against the shared schema independently and connects after F03; bulk extraction is not a dependency. UI works against 300 synthetic records on the shared schema and core interface. Unknown coordinates never block showing inventory.

## Active workers

F00–F09 are complete. F10 is active with coordinator owning the shell/list, `/root/ui` the inset-aware map and `/root/core` the comparison panel in separate branches/worktrees. Ingestion performed read-only gap discovery for Stage 2; no data edits before F10 integration. Existing data, calculations and storage/export semantics are preserved.

The prior single coordinator build passed at 5bab886; see `changes/F09.md`. F10 will receive one integrated build. No visual or browser checks. After integration, coordinator selects and begins the highest-value journey/real-coverage milestone within the existing mission. Additional utility adapters and verified route geometry remain proposals, not automatic scope.

Coordinator dispatches and resumes up to three subagents in this chat directly. Separate managed worktrees/branches begin at integrated F00; subsequent features use latest main. No separate chats or scheduler. User has authorized project pushes, small PRs and coordinator integration; private project creation was explicitly authorized. Only origin (gridlock-coordination) accepts application pushes; workflow-template push is disabled. No branch deletion.

Milestones: M1 F01–F03 connected real/demo explorer; M2 source coverage + scenarios/briefs + impact; M3 validated revision import and final mission review. Only coordinator checks; receipts on integrated main record completion. M2 and M3 shared one final bounded check at c709368; see changes/M2-M3.md. No redundant status-only PRs.
