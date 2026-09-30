# F24 — Stationary map controls and accessible legend

Purpose: keep map actions predictable while the geographic view and surrounding panels change, and explain map symbols without expanding the control layout. Depends on F20/F21; preserve F22/F23 work in the separate map chat.

## Ownership and handoff

Coordinator owns `app/src/features/explorer/ProjectMap.tsx` temporarily (map-ui explicitly released its untouched file), `app/src/components/ui/popover.tsx`, this spec, roadmap, local UI instructions and `changes/F24.md`. Map-ui retains `map-view.ts`, all F22/F23 adapter files and exclusive package-file ownership. Return ProjectMap to map-ui with the integrated commit. Public props, data and calculations are unchanged.

Existing UI worker owns exactly `app/src/features/explorer/Explorer.tsx` and new `app/src/features/explorer/MapLegend.tsx` on `codex/F24-map-legend`. Coordinator integrates that commit into the small F24 PR; only coordinator runs checks and merges. Independent F22 work continues.

## Implementation and completion

- MapView controls use constant top/right spacing relative to the map container. Panel insets continue to govern geographic fitting and attribution only. Keep zoom together; Fit projects is a separate square Scan IconButton with that exact accessible name and hover/focus tooltip. Fit selection remains available. No selection reset or fullscreen action.
- The existing workspace settings row occupies normal flex flow above the bounded map workspace, preventing overlap with its new top-right controls. The map continues behind results/detail/timeline panels; exclude the settings row from map-local measured insets. Bound the panel width to leave room for the compact map-control column, including when collapsed. Keep mounted state owners and all controls, drafts and callbacks intact.
- Legend uses a labeled Lucide icon + text Button, official radix-nova Popover, bottom/end placement, map-bound collision handling and internally scrolling bounded content. Five symbol/label rows reflect actual project/connection marks. Preserve the center/route distinction, 100-connection limit, connection toggle and selected-connection context; keyboard help is a separate secondary section.
- `MapLegend` takes `{ boundary: HTMLElement, connectionCount: number, selectedPair: boolean, showConnections: boolean, onShowConnections: (show: boolean) => void }`. It owns only disclosure state and presentation. Native Leaflet event isolation must attach to portalled content too, while preserving activation, Escape dismissal and trigger focus return.
- Opening the legend cannot move controls/map. Unmount its disclosure when Explore is inactive so portalled content cannot remain on another workspace; retain connection choice in ProjectMap. Keep popup above the map and below app dialogs, reduce motion when requested, retain attribution and tile-error recovery. No document scrolling or default typography/spacing/theme changes. Add only the missing shared Popover component; no package mutations.

## Guidance and checking

Applied [shadcn Popover](https://ui.shadcn.com/docs/components/radix/popover) and [Tooltip](https://ui.shadcn.com/docs/components/radix/tooltip) defaults, [Radix Popover](https://www.radix-ui.com/primitives/docs/components/popover) collision/portal/keyboard behavior and [W3C button pattern](https://www.w3.org/WAI/ARIA/apg/patterns/button/) activation/naming. Zoom → Plus/Minus → familiar map scale controls; Fit projects → Scan → compact framing action with explicit tooltip; Legend → List + text → recognizable explanation destination without an ambiguous icon-only control.

Coordinator: one existing production build, at most five minutes. Existing fit/calculation helpers are unchanged, so no repeated core case. Inspect source for event boundaries/retained callback and state wiring; do not claim exercised interactions. No Playwright, screenshots, image analysis, visual/mobile audits or new test infrastructure.
