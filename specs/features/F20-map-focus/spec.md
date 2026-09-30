---
id: F20
name: "Map focus and connection visibility"
lane: map
agent: map-ui
phase: 10
depends_on: [F14, F15, F16]
owns:
  - app/src/features/explorer/ProjectMap.tsx
  - app/src/features/explorer/map-view.ts
  - changes/F20.md
cut: allowed
---

# F20 — Map focus and connection visibility

## Role and readiness

`map-ui` is the user's second teammate in a separate map/UI chat. Implement this one bounded map capability in a separate managed worktree on `codex/F20-map-focus`, starting from latest integrated `origin/main` after this assignment lands. Coordinator remains contract, merge and check owner. Existing `ui` explicitly confirmed on 2026-09-30 that ProjectMap has no pending work and released the files below; it retains Explorer, comparison, briefs and other UI work.

Dependencies are satisfied: F14 supplies the single panel and measured MapViewportInsets; F15/F16 preserve the mounted map and existing selection callbacks across destinations. No source research, data migration, new package or consumer edit is required. Existing 252-record source and 300-record demo inputs remain the intended scale.

## Purpose and bounded task

Let a planner recover the selected project's or candidate pair's map context after panning, and temporarily remove background connection clutter without changing results or selection. Today Fit projects fits all located projects supplied to the map; there is no explicit fit-selection action or connection-visibility choice.

1. Keep **Fit projects** and add a concise **Fit selection** action using existing shadcn controls. Fit selection uses the selected candidate's project IDs, otherwise selectedProjectId; ignore missing coordinates. Disable it when no selected feature has coordinates. Fit projects uses all located `projects` supplied by the caller and is disabled when none have coordinates.
2. Add a labeled **Candidate connections** toggle in the existing Map key disclosure, default on. It controls background connections when no candidate is selected. Off hides those lines without hiding markers or changing matching/list results. A selected candidate's dashed center-to-center connection always stays visible regardless of the toggle; explain this briefly in the same disclosure. Preserve the existing 100-background-connection cap and selected-pair-only behavior.
3. Keep the toggle in ProjectMap state so panel navigation, collapse and switching away from and back to Explore preserve it while the component remains mounted. No new persistence or shell state.
4. Reuse current inset-aware fitting and nonanimated movement. Fit commands, selection changes and panel/viewport changes must respect the unobscured map area; changing the line toggle or an ordinary rerender must not reset a user's pan/zoom. Use existing Leaflet projection/fit APIs, never duplicate geographic calculations.

## Exact ownership and interfaces

The implementation worker may edit only:
- `app/src/features/explorer/ProjectMap.tsx` — map-local controls, fit intent, rendering and state.
- `app/src/features/explorer/map-view.ts` — optional new, pure map-only helpers for fit targets or displayed connections; no unrelated helper extraction.
- `changes/F20.md` — final 3–8-line implementation receipt with actual limitations and pending coordinator check.

All other files are read-only for this assignment, including `Explorer.tsx`, App, ComparisonPanel, ProjectDetails, ImpactPanel, shared UI components, styles, dependencies, source/demo records, domain schemas, canonical core, saved storage and specs/roadmap. Coordinator owns assignment/spec updates. Do not introduce a broad map-helper directory claim.

Keep ProjectMap's public props and exported MapViewportInsets type compatible and unchanged. Existing projects/opportunities/selection inputs are authoritative; onProject/onOpportunity remain the only selection outputs. Map choices must not alter query, filters, scenario, pagination, list scroll, drafts, data mode or evidence. Any required Explorer or shared-file change is a dependency to report to the coordinator, who must obtain a named handoff from `ui` and update ownership before edits. Do not expand your own boundary.

## Observable acceptance criteria

- With a located selected pair, Fit selection fits both supplied centers into the current unobscured region. With a single located selection it fits that point; with an unlocated or absent selection it is disabled. Fit projects still fits all located supplied projects without clearing selection or opening a different panel.
- Candidate connections defaults on and retains the current background cap. Turning it off removes only background lines; project points, selected pair line, click callbacks, current selection and list results are unchanged. Returning it on restores the same eligible background connections. Map key wording/counts describe lines actually rendered and retain the warning that connections are not routes.
- Pan/zoom remains stable when toggling connections. Existing selection/layout refits and map interactivity outside the floating panel continue. Basemap failure messaging, attribution, missing-location behavior and source/demo distinctions remain intact.
- All added controls work through native keyboard interaction, have accessible names and expose toggle state. Use visible labels for the two fit destinations and the connection choice; reuse Lucide only if it adds value. Preserve the shadcn preset, default readable styling, viewport bounds and internal scrolling; add no full-detail popup, second panel or window scroll.
- A small draft `[F20] Map focus and connection visibility` PR targets this project's `main`, contains only the owned implementation paths and receipt, and explains behavior and unrun checks. Coordinator integrates it; the worker does not merge, delete branches or push to the workflow-template remote.

## Checking and defaults

Read root AGENTS.md, `app/src/AGENTS.md`, the mission, technical agreement and workflow once as applicable. Preflight is already complete; do not reinitialize. Reuse current components/docs; consult official documentation only for unresolved implementation choices.

Only coordinator performs bounded milestone checking after composition: at most one existing production build and, if helper logic warrants it, one representative map-target/connection selection case within five minutes. No duplicated build/typecheck/lint, new test framework, Playwright, browser automation, screenshots, image analysis, visual verification, viewport/mobile/zoom audits or worker check runs. This assignment-only PR needs no build. Source review is allowed; report interactive behavior as unverified.

No dragging, clustering, new basemap, route inference, data acquisition or Explorer redesign. Use the reversible defaults above and keep unrelated workers progressing. If blocked by a shared-file need, report the exact interface change and continue independent map-local work; do not request a project-wide pause.

## New-chat handoff

You are `map-ui`, implementing F20. Read this spec and applicable local instructions; inspect Git before editing. Create or reuse a free separate managed worktree from latest origin/main on `codex/F20-map-focus`. Own only ProjectMap.tsx, optional map-view.ts and changes/F20.md as listed above. Preserve existing public props and all product state. Implement the bounded map controls, commit coherent changes and open/attach one draft PR on safuentees/gridlock-coordination. Do not run planned checks or merge. Return the PR URL, commit, owned files and any blocker to the coordinator; the user may steer map-only details within this boundary. Obtain coordinator/UI handoff before any Explorer edit.
