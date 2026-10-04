# FIX-F29 — Prepare experimental map dependencies
- Vite explicitly prepares the direct deck.gl core lighting dependency at startup, before entering the lazy experimental renderer. Existing packages, calculation/data contracts and preset are unchanged.
- Map-owner PR202 is integrated at `5c487dc`: fresh lazy attempts, Retry experimental map and Standard recovery retain the wrapper and selection/entrance state.
- Coordinator found no original dev-server listener, then a missing optimized core bundle and stalled reoptimization. The exact browser exception is unavailable; these are concrete startup/recovery defects, not a diagnosed GPU failure.
- Local dependency reads also stall: fresh Lucide reads took 3.07/3.85 seconds and one timed out at five seconds. Its exact locked npm archive passed SHA-512 integrity before replacement; the complete original package is retained under ignored node_modules.
- At code `7ca4479`, the affected HTTP module-loading case reached transformed map modules but timed out awaiting an optimized dependency after 35 seconds. Runtime repair and recheck remain pending; no production build, browser/GPU/visual/mobile check passed.
- Independent F28 producer ownership, source records, drafts and the primary checkout's unrelated Explorer edit are preserved. Coordinator owns only startup configuration/integration; map ownership is released after recovery.
