# F29 — Illuminated density and first-entry presentation

Status: prioritized for implementation October 3, 2026. F28-F completion is not a dependency. Technical prerequisites are integrated F22/F23 hierarchy/rendering and PR175 map interfaces, with overlapping map/UI claims integrated or explicitly released. They are satisfied for A; the coordinator has dispatched it in a new worktree. Owner: existing `map-ui` worker, **Chat 1 Unrelated** (`01a0f10a-93cd-7b30-9823-ee2e2fb42e34`). Coordinator owns assignment, integration and bounded milestone checks. Independent F28 work and UI ownership are preserved.

## Purpose and unchanged agreement

Help users read mapped-project concentrations while retaining browsing and selection. Inputs are the integrated density hierarchy, final cell counts/areas/density, active real/demo source, existing geographic layers and workspace visibility. The current grid uses exact square cell bounds and extruded `PolygonLayer`, not a new aggregation. Retain the existing fixed logarithmic scale in locations per 1,000 km², count and area tooltip facts, hierarchy/subdivision, precision policy and eligible inputs. Height exaggeration is presentation, not physical project height or geographic accuracy. Areas must not acquire invented centers; density never measures coordination benefit.

Preserve Leaflet default/experimental choice, flat/raised controls, cell focus, project/pair selection and synchronized list/detail callbacks. Keep selected features, project markers, uncertainty symbols, legends, attribution and error messages readable with existing insets, event isolation and viewport containment. No shared contracts, authoritative core calculations, source/demo records or drafts change.

## F29-A — Illuminated density rendering

Ready and assigned after the technical/ownership handoff above. Branch: `codex/F29-A-illuminated-density`, new separate map-owner worktree from latest main. Deliver one coherent PR.

- Attach a deck.gl `LightingEffect` with directional light and ambient fill through the existing overlay; enable shaded material on raised density polygons. Isolate treatment from ordinary markers/selected geography.
- Use a muted stone basemap, teal lower columns and amber peaks, with the same palette in the metric legend. Prefer local raster-style adjustments using existing permitted tiles and attribution; add no provider, credentials or dependency. Keep default shadcn controls, typography, colors and spacing.
- Keep a readable, bounded height exaggeration and identify it as display height. Preserve the final density scale, precise cell footprints, zoom-level fades and flat alternative. Do not use raw heights as tooltip facts.
- Experimental cast shadows are optional and may be omitted if they obscure layers or complicate compatibility. Hexagons and custom shaders are deferred.

Exact write ownership:

| Path | Purpose |
|---|---|
| `app/src/features/explorer/density-map/density-layers.ts` | Existing fill palette, raised material and presentation height |
| `app/src/features/explorer/density-map/MapLibreProjectMap.tsx` | Basemap style, effect wiring and existing inline density legend |
| `app/src/features/explorer/density-map/DeckOverlay.tsx` | Effect forwarding only if existing props do not suffice |
| `app/src/features/explorer/density-map/density-style.ts` | Optional map-only shared palette/material/light constants |
| `changes/F29-A.md` | Integrated behavior and actual checks/limitations |

Complete when the illuminated square layer and its legend communicate the unchanged metric, both flat/raised views remain available, and cell/project selection and contextual overlays retain their existing interfaces. A must integrate before B starts.

## F29-B — Interruptible entrance animation

Ready after A integrates. Branch: `codex/F29-B-density-entrance`, separate worktree from latest main. Deliver a second coherent PR.

- Once per mounted application/workspace session, on the first visible, ready density-renderer entry, fade the density layer and raise active columns to their final display heights over about 1,000 ms. Flat mode fades only. Do not force renderer, density or column activation or move the camera for the entrance.
- Hold the one-shot latch in the retained `ProjectMap` wrapper so changing renderer, source mode, filters, selection, layout or destination cannot replay it. Returning from hidden navigation or remounting the experimental adapter uses the final state. A full app reload begins a new session.
- Animate only presentation scalars such as opacity/elevation scale. Compose with the existing zoom opacity; retain final cell objects/accessors and tooltip/count/density facts throughout.
- Pointer, wheel/touch or keyboard interaction, control activation, selection/filter/source changes during entry finish immediately. Consume the entrance if interaction precedes renderer readiness. Do not delay picking, replay on raised-mode toggle, block navigation or schedule a second camera transition.
- Reduced-motion preference shows the final state immediately, including preference changes during entry. Cancel animation work on interruption, hide or unmount; hiding completes the latch rather than pausing it for return.

Exact write ownership: `app/src/features/explorer/ProjectMap.tsx` for the private entrance latch/adapter handoff; `app/src/features/explorer/density-map/MapLibreProjectMap.tsx` for visibility and interaction wiring; `app/src/features/explorer/density-map/density-layers.ts` for presentation multipliers; optional map-only `app/src/features/explorer/density-map/density-entrance.ts`; `changes/F29-B.md`.

Complete when there is one short entrance with final facts, an immediate final state on interaction/reduced motion, and no replay or lost cell/project selection across normal navigation and updates.

## Ownership, dispatch and checking

Read-only dependencies include `hierarchy.ts`, `synthetic.ts`, `map-layers.ts`, `geography-layers.ts`, `geography-map.ts`, `map-view.ts`, `MapLegend.tsx`, domain/core/data/storage and package files. `Explorer.tsx`, `App.tsx`, global styles and shared UI components are excluded. The existing visible prop and retained wrapper avoid shell changes; if that proves insufficient, coordinator and current UI owner record an exact handoff first. Preserve all prior worker branches and worktrees.

Coordinator dispatches A to the existing map chat now, integrates/records its completion, then immediately sends B without operator relay. F28 progresses in disjoint files; no facility producer or consumer acquires F29's map paths before release. No scheduler is installed. Workers inspect source and commit only their boundaries. Only coordinator runs the established milestone allowance: at most one existing build with a hard deadline and one representative case within five minutes, or applicable exact-revision checks. Reuse the density case to compare unchanged count/area/density and presentation final/interruption state where feasible; add no testing infrastructure. No Playwright, screenshots, image analysis, visual verification or mobile audits. Rendering, picking and physical keyboard interactions remain unverified unless covered by permitted existing checks; report that honestly.

## Official implementation guidance

Use [deck.gl effects and lighting](https://deck.gl/docs/developer-guide/using-effects) for existing ambient/directional lights, layer materials and optional experimental shadows. Use [deck.gl animations and transitions](https://deck.gl/docs/developer-guide/animations-and-transitions) for layer-property presentation transitions; its aggregation examples do not authorize replacing the square hierarchy or animating calculated data. Preserve user-controlled camera behavior.
