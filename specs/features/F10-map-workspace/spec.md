---
id: F10
name: Map-first coordination workspace
agent: coordinator + ui + comparison
depends_on: [F09]
---

# F10

Use the map as the workspace surface with a persistent searchable left list and one right comparison panel. Candidates and All projects are alternate list views; unlocated imported records remain accessible. Selection in either surface highlights the relevant projects and updates the existing comparison. Fit selected features within measured panel insets. Optional timeline occupies a bounded bottom panel. No dragging or resizing dependency; collapse/reset controls work without rearrangement.

Ownership agreed before edits: coordinator owns App.tsx, Explorer.tsx, specs and integration; UI owns ProjectMap.tsx; comparison worker owns ComparisonPanel.tsx and ProjectDetails.tsx. Map adds optional viewportInsets {top,right,bottom,left} in pixels. ComparisonPanel accepts dataset, selectedOpportunity, selectedProject, actions (ReactNode), onProject. Canonical calculations and data schema stay unchanged.

Keep both selected project names, dates, distance, confidence, uncertainty and primary actions visible above internally scrolling Evidence/Impact/Supporting tabs. Keep existing saved-review and dataset revision dialogs, source/demo labels and shadcn preset. All flex/grid boundaries shrink; no document scrolling.

Official guidance read: shadcn [Tabs](https://ui.shadcn.com/docs/components/radix/tabs), [Collapsible](https://ui.shadcn.com/docs/components/radix/collapsible), [Resizable](https://ui.shadcn.com/docs/components/radix/resizable). Reuse existing tabs/buttons and native overflow; no new dragging library.

Coordinator alone runs one integrated production build. No calculation changes require another core check. No Playwright, screenshots, visual, image or mobile checks. Stage 2 mission assessment follows integration.
