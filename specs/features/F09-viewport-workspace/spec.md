---
id: F09
name: Viewport-sized coordination workspace
agent: coordinator + ui + workspace-briefs
phase: 4
depends_on: [F03, F05, F06, F07, F08]
cut: never
---

# F09: one viewport workspace

Fit the existing application to 100dvh, with no document scrolling. Keep typography, spacing, preset, data, canonical calculations and user workflows. Use shrinkable min-h-0/min-w-0 flex/grid containers and native panel overflow. Do not clip unreachable content or reduce readable type to fit.

## Agreed ownership before editing
- Coordinator: App.tsx, index.css, shared dialog component/dependencies, dataset/import presentation, specs/receipts and integration. Header stays visible; dataset revisions/coverage move to a labeled dialog. UI ownership was handed back for the final tab-alignment integration adjustment.
- UI worker in existing UI worktree: features/explorer/* and features/scenarios/*. Search/filter/scenario controls remain visible. Candidate/inventory/map/timeline tabs share available space; selection replaces the existing right detail panel. Detail/impact use tabs. Map follows its container instead of a fixed pixel height.
- Workspace-briefs worker in existing core worktree: features/briefs/BriefWorkspace.tsx only (plus new brief presentation helpers if needed). Preserve storage/export semantics and existing props. Component becomes persistent Save selected + Saved reviews toolbar; saved lists/comparison/review appear in a bounded dialog with internal overflow. No appended page content.
- Only coordinator runs the bounded integrated build. No calculation changes, so no repeat core check. No browser automation, screenshots, image analysis, visual verification or mobile audits.

## Design guidance applied
- shadcn Tabs: https://ui.shadcn.com/docs/components/radix/tabs
- shadcn Dialog (scrollable body, visible header/footer): https://ui.shadcn.com/docs/components/radix/dialog
- shadcn Scroll Area: https://ui.shadcn.com/docs/components/radix/scroll-area (native overflow selected; no new scroll styling needed).
- NN/g Progressive Disclosure: https://www.nngroup.com/articles/progressive-disclosure/ — clear secondary actions, keep frequent controls visible.
- NN/g Visual Hierarchy: https://www.nngroup.com/articles/visual-hierarchy-ux-definition/ — group by task, preserve the preset's existing typographic hierarchy.
- NN/g Dashboard Organization: https://www.nngroup.com/articles/dashboards-preattentive/ — prioritize the facts needed for decisions; avoid a wall of repeated metrics.

## Acceptance
All previous capabilities remain reachable. Primary headers/actions remain visible while panel bodies scroll. Long tables may scroll horizontally inside their panel. Large source names wrap. Tabs preserve drafts where changing views should not discard edits. Dialogs keep focus management and accessible titles. Changes ship through small project PRs under existing push/merge authorization.
