# F14 — One map panel with stack navigation

Selected scope: replace the separate results and comparison panels with one bounded floating container. Preserve all project inventory, calculations, source/demo separation, Data readiness and dialog workflows.

## Interaction and state contract
- Results is the initial view. Collapsed keeps search, meaningful result count and a labeled Expand button; expansion returns to the prior Results/Detail view. Collapse never clears state.
- Results contains Candidates / All projects, compact filters/scenario access and internal list scrolling. All imported records, including missing-location records, remain browseable.
- A list, map, timeline or saved-current selection opens Detail without mutating the query, filters, list tab, page or recorded list scroll. Back to results restores that exact browsing context and keyboard focus without scrolling to a different selected row. Deliberate edits to query/filters still update their own state.
- Search stays available in Detail. Candidate details show both projects, distance, timing, location confidence, material uncertainty and save/review actions. Longer topics use Evidence, Impact and Supporting. Candidate Previous/Next uses the current filtered candidate set and never changes the stored result page.
- Results and Detail remain mounted; hidden views are inert and unavailable to focus. ScenarioControls and BriefWorkspace have one stable mount outside conditional bodies. Preserve their existing drafts. Keep impact raw input strings per dataset mode + candidate ID, and retain detail tab state per selection. Drafts are in-session; existing saved-review persistence is unchanged.
- Retain existing ComparisonPanel and ProjectMap public props. ImpactPanel may add optional `draft: ImpactDraft` and `onDraftChange` inputs; export the small draft type and keep standalone uncontrolled use working. No domain/calculation/storage changes.
- Map remains interactive outside the container. Measure the one panel and optional timeline into the existing MapViewportInsets contract; no phantom right-panel inset. Refit on selection or occlusion changes, keeping a positive usable map region. No popup duplicates of full details.
- Native buttons provide collapse, expand and Back. Use a short restrained transition with reduced-motion support. No dragging needed. Preserve 100dvh, min-h-0/min-w-0 boundaries, internal overflow and current preset typography/spacing/colors.

## Ownership and increments
1. Coordinator: this contract, roadmap/mission/technical agreement, local UI instructions and README; merge/check owner.
2. `ui`: Explorer.tsx and ProjectMap.tsx, plus changes/F14.md; shell, navigation, preserved browsing context, stable action mounts and measured occlusion.
3. `core`: ComparisonPanel.tsx and ImpactPanel.tsx only; persistent draft ownership and detail tabs. No canonical calculation edits. Separate worktree/PR; public composition remains compatible.

Dependency: integrated F10–F13 and shared F14 contract. Both implementation slices can proceed independently. Only coordinator runs one production build after composition; source review covers lifecycle/ownership. No Playwright, screenshots, visual/mobile audits or extra test setup.

## Component decision
[Blueprint PanelStack](https://blueprintjs.com/docs/#core/components/panel-stack) supplies the stack/back model and optional retained inactive panels. Its [PanelView implementation](https://github.com/palantir/blueprint/blob/develop/packages/core/src/components/panel-stack/panelView.tsx) imports Blueprint Button/Text and Blueprint style classes; PanelStack also uses its transition system. Reproduce the small interaction with existing shadcn Button/Input/Tabs and retained React state instead of importing a second design system. No dependency or preset changes.

## FIX-F14 — Square comparison body

User correction: the embedded Project comparison body should have square corners. Coordinator hands `ui` only the root Card radius in `app/src/features/explorer/ComparisonPanel.tsx` and `changes/FIX-F14-comparison.md`; this supersedes the historical core claim only for this styling change. Draft/tab/calculation logic is read-only. No Explorer/map/shared Card edits. Coordinator owns this spec, roadmap and `app/src/AGENTS.md`, incorporating them in the same small implementation PR.

Complete when ComparisonPanel locally uses `rounded-none`, leaving the outer floating shell, default shared components, padding, internal overflow and state unchanged. Source/diff inspection suffices under the routine-styling check exemption; no build, browser, screenshot or visual check.
