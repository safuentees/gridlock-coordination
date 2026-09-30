# F23 — Hierarchical project concentrations

Purpose: explore geographic concentrations at wider scales, then resolve into actual selectable projects. Selected by the user in the separate map/UI chat; depends on integrated F22. Owner `map-ui`, coordinator merge/check/composition owner. Start from latest main in the existing isolated worktree on `codex/F23-hierarchical-density` after F22 integration.

## Exact ownership and inputs

Own `app/src/features/explorer/density-map/hierarchy.ts`, `density-layers.ts`, `synthetic.ts`, plus the F22-owned `MapLibreProjectMap.tsx`, `DeckOverlay.tsx`, `map-layers.ts`, and `changes/F23.md`. All density-map paths are under `app/src/features/explorer/`. ProjectMap wrapper/map-view changes require coordinator coordination if needed; do not edit Explorer, App, canonical core/schema/storage, source/demo datasets or shared components.

The temporary package-file handoff extends only to installing the agreed `@mapbox/tilebelt` 2.0.3 and `@turf/area` 7.4.0 if F22 did not install them. No other dependency mutation. Use tilebelt conversion/bounds/children and geographic area rather than copying projection formulas.

Normal input is the current mapped project set supplied through the unchanged interface. Every located project contributes once at a chosen hierarchy level; unknown locations stay unknown. Counts describe mapped records, not candidate pairs or coordination benefit. Preserve real/demo state and existing selection callbacks.

## Interaction and encoding

- Use explicit stable Quadkey/Quadbin parent-child squares; GridLayer is not the final subdivision model. Wide views show counts/concentrations, close views show actual selectable points and relevant connections.
- Density means projects per geographic area with visible units. Keep color/height scales consistent across zoom levels; do not normalize independently at every level. Offer optional raised columns and tilt in compact map-local view settings, with a flat alternative.
- Implement continuous anchored transitions. One nonoverlapping child partition may blend area-weighted parent density to actual child density across fractional zoom, including zero-count children. Do not simultaneously count/display parent and children as separate projects. Keep integer observed counts distinct from interpolated visual density. Use stable IDs and smooth thresholds without inventing points; reduced-motion preferences suppress optional animation.
- A compact **Synthetic density preview** choice is allowed inside the experimental map controls. `synthetic.ts` contains deterministic realistic dense points explicitly labeled synthetic. This fixture never enters real results, counts, exports, selected-project callbacks or persistent source data. Return to the user's mapped projects without losing real selection. Explain the active preview in text.
- Selection remains connected to the existing panel; cells may focus/zoom a geographic region but must not fabricate a project selection. Reuse the existing panel-aware fit and view controls. No new toolbar band or page.

## Acceptance and handoff

At successive levels, parent counts equal the sum of child counts and each located input contributes exactly once, including boundary points under a documented convention. Geographic cell areas drive density; interpolation conserves total mass within a parent. At close scale, actual points use the original project IDs/callbacks, while synthetic points cannot mutate source selection. No construction/shared-route/savings inference is added.

Ship the first useful density interaction in one coherent task-linked draft PR; user tries it before any patterned polish. Coordinator alone runs the bounded build and one representative hierarchy input/output conservation case, no worker duplicates. No browser, screenshots, image analysis, visual/mobile audits or new test infrastructure. Document actual GPU/rendering limitations rather than claiming visual verification.

After the user tries the first interaction, an optional geographically anchored square/stipple treatment may be scoped separately from [the supplied reference](https://github.com/runevision/Dither3D/discussions/12). It is visual encoding, never extra records. No custom shaders or effect-polishing are selected for this first increment. Official starting reference: [deck.gl QuadkeyLayer](https://deck.gl/docs/api-reference/geo-layers/quadkey-layer).
