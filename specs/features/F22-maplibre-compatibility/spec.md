# F22 — Experimental map compatibility

Selected by the user in the separate `Implement F20 map focus` chat on 2026-09-30. Purpose: enable an experimental MapLibre + deck.gl view for future density exploration while preserving the working map and surrounding user state. Depends on integrated F20/F21. Coordinator remains composition, contract, merge and sole check owner; `map-ui` implements one active increment at a time in its own managed worktree on `codex/F22-maplibre-compatibility` from latest main.

## Exact ownership

- `app/src/features/explorer/ProjectMap.tsx` — existing public wrapper, default Leaflet view and experimental switch.
- `app/src/features/explorer/map-view.ts` — compatible internal shared map types/helpers; exported ProjectMap props and MapViewportInsets shape remain unchanged.
- `app/src/features/explorer/density-map/MapLibreProjectMap.tsx`
- `app/src/features/explorer/density-map/DeckOverlay.tsx`
- `app/src/features/explorer/density-map/map-layers.ts`
- `app/package.json`, `app/package-lock.json` — temporary exclusive dependency handoff for only the agreed pins below; no scripts, unrelated upgrades or removal of Leaflet.
- `changes/F22.md` — final short receipt with actual checks/limitations.

Explorer, App, domain/core, storage, source/demo datasets, shared UI/styles and all other files are read-only. Coordinate any new path/interface with coordinator before editing; no broad directory claim. UI retains Explorer/comparison and coordinator retains shared composition. Reuse a free existing worktree when suitable; never switch the coordinator's checkout.

## Behavior and placement

Use MapLibre GL JS for navigation, zoom, bearing/pitch and basemap; react-map-gl for React integration; deck.gl for project markers and center connections. Normal input remains the existing ProjectMap projects/opportunities/selection/callbacks/visible/insets. Render only supplied coordinates. Preserve clicks opening the same detail, selected emphasis, F20 fit actions/connection toggle and F21 panel-aware padding. Do not duplicate ranking/proximity/impact calculations.

Keep Leaflet as the default. Put a clearly labeled experimental-view selector with existing map-local controls, not a new Explorer band. Preserve selection and surrounding query/filter/draft state when switching. Lazy-load the experimental adapter where practical. WebGL/style/worker failures must provide a concise way back to the working default. Preserve attribution and the existing public OSM raster source; no new service, account or credential. Use the existing shadcn controls and bounded viewport.

## Dependency handoff

Map worker researched official docs/npm compatibility; coordinator accepted exact pins: `maplibre-gl` **6.11.2**, `react-map-gl` **8.1.3**, `@deck.gl/core`, `@deck.gl/layers`, `@deck.gl/maplibre`, `@deck.gl/geo-layers`, `@deck.gl/extensions` all **9.4.0**. For F23, `@mapbox/tilebelt` **2.0.3** and `@turf/area` **7.4.0** may be installed here or in F23; no extra dependencies without agreement. Retain existing Leaflet packages. Use the documented Vite worker integration; scoped library CSS imports stay in owned map modules. No application preset/global CSS changes.

Sources: [deck.gl MapLibre integration](https://deck.gl/docs/developer-guide/base-maps/using-with-maplibre), [react-map-gl](https://visgl.github.io/react-map-gl/docs), [MapLibre](https://maplibre.org/maplibre-gl-js/docs/). Worker consults current official guidance for implementation, without browser/visual inspection.

## Completion and checks

Complete when both renderers consume the unchanged interface, existing selection/fitting and connection meanings are connected, the experimental view is explicitly entered and recoverable, and one small draft PR targets the project main. Missing coordinates remain in the existing inventory and never become invented markers. Coordinator integrates and checks at most one build plus one representative helper case as needed in five minutes; worker runs no planned checks. No Playwright, browser, screenshots, image analysis, visual/mobile audits or new infrastructure. Report unexercised GPU interactions honestly. F23 starts after this compatibility slice is integrated; stipple/pattern polishing is not part of F22.
