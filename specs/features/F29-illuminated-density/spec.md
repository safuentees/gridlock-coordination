# F29 — Illuminated density and first-entry presentation

Status: A/B implemented through PR197/198; final integration PR200. F28-F completion is not a dependency. Technical prerequisites were integrated F22/F23 hierarchy/rendering and PR175 map interfaces, with overlapping claims released. Owner: existing `map-ui` worker, **Chat 1 Unrelated** (`01a0f10a-93cd-7b30-9823-ee2e2fb42e34`), with separate managed A/B worktrees retained. Coordinator owns integration/checks. Independent F28 work and UI ownership are preserved. The [bounded receipt](../../../changes/F29-check.md) records build and case timeouts; no runtime or GPU pass is claimed.

## Purpose and unchanged agreement

Help users read mapped-project concentrations while retaining browsing and selection. Inputs are the integrated density hierarchy, final cell counts/areas/density, active real/demo source, existing geographic layers and workspace visibility. The current grid uses exact square cell bounds and extruded `PolygonLayer`, not a new aggregation. Retain the existing fixed logarithmic scale in locations per 1,000 km², count and area tooltip facts, hierarchy/subdivision, precision policy and eligible inputs. Height exaggeration is presentation, not physical project height or geographic accuracy. Areas must not acquire invented centers; density never measures coordination benefit.

Preserve Leaflet default/experimental choice, flat/raised controls, cell focus, project/pair selection and synchronized list/detail callbacks. Keep selected features, project markers, uncertainty symbols, legends, attribution and error messages readable with existing insets, event isolation and viewport containment. No shared contracts, authoritative core calculations, source/demo records or drafts change.

## F29-A — Illuminated density rendering

Integrated from PR197 at main `7cf5704`. Branch: `codex/F29-A-illuminated-density`, separate managed map-owner worktree. Final feature check follows B; GPU drawing/picking is unexercised.

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

Implemented and integrated through PR198 after A, from separate `codex/F29-B-density-entrance` worktree into coordinator `codex/F29-integration`; final main integration is PR200. One retained wrapper latch and private adapter props preserve existing public map/shell interfaces.

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

## FIX-F29 — Experimental startup recovery

User-reported startup failure takes priority over new map work. Map-ui owns `ProjectMap.tsx` and `changes/FIX-F29.md`; retry is integrated through PR202. Coordinator owns `app/vite.config.ts`, this spec, the roadmap and `changes/FIX-F29-startup.md`. No Explorer/App, data or calculation handoff is required. Each retry resets the lazy payload and boundary while retaining wrapper inputs and the consumed entrance latch; switching from Standard starts a fresh attempt. Prepare the direct lighting dependency before lazy map entry, following [Vite dependency optimization](https://vite.dev/config/dep-optimization-options).

Completion requires the served experimental modules and lighting bundle to resolve, with explicit retry/standard recovery and preserved input interfaces. Coordinator runs only the affected bounded module-loading case. That establishes module delivery, not GPU rendering or physical interaction. Local package repair must use the exact locked version/integrity, preserve a backup and never commit dependencies. Independent F28 producer ownership remains unchanged.

Startup preparation is delivered in PR203. After the exact-lock local runtime repair, the affected case passed in 0.39 seconds at application code `7ca4479`, serving six map modules and eleven optimized dependencies. The [receipt](../../../changes/FIX-F29-startup.md) retains the failed first attempt and environment rollback locations; original GPU/interaction check limits still apply. Map ownership is released; no facility-map consumer starts before its active geometry/attribution interface is agreed.

## FIX-F29 — Overlay lifecycle and matching controls

Current user feedback requests equal Zoom in/Zoom out/Fit buttons and correction of the running-map failure. Existing Vite client logs report a duplicate WebGL-device attachment. Source inspection identifies effect replay starting overlapping asynchronous attachments through `useControl`; defer cancellable overlay registration until the live effect, retain interleaved rendering and preserve real cleanup. Do not disable StrictMode, patch installed libraries or suppress genuine failures. Distinguish background-resource failures from project-layer failures and retain useful recovery actions.

Owner: existing map-ui chat in a separate `codex/FIX-F29-map-controls-errors` worktree. Exact files: `ProjectMap.tsx` for the three corresponding Standard controls; `density-map/MapLibreProjectMap.tsx`, `DeckOverlay.tsx`, optional map-only lifecycle/error helpers; `changes/FIX-F29-map-controls.md`. Coordinator owns `app/vite.config.ts` (preserve automatic workspace serving plus the exact resolved installed dependency path for linked fonts), this spec/roadmap and the final receipt. Shared buttons, Explorer, core/data/calculations and drafts are read-only.

Complete when all three top icon controls use the same explicit preset size without extra zoom-group padding, discarded effect setup creates no overlay/device, the live overlay updates and cleans up once, and supported failure types have accurate recovery copy. Coordinator alone runs one bounded build plus the affected lifecycle/font-serving case; no GPU/browser/visual/mobile checks or new checking infrastructure. Independent F28 ownership remains unchanged.

Delivered in PR205. The build passed at `dc33377` after the owner's one-line generic correction; the affected lifecycle/error/font case passed before that type-only change and was reused without duplication. [Receipt](../../../changes/FIX-F29-map-controls.md). Map files are released after integration; facility consumers still require an agreed active geometry/attribution interface. Actual GPU drawing/physical interaction is unverified.
