---
id: F03
name: Connected map and project explorer
agent: ui
phase: 1
depends_on: ['F00']
owns: ['app/src/App.tsx', 'app/src/features/explorer/', 'app/src/data/demo/']
cut: never
---

# F03: Connected map and project explorer

## Plan
Build 300 realistic deterministic demo records, mode switch, search/filter inventory, interactive Leaflet map, ranked pair list and source detail through provider/core. Connect real seed as soon as integrated.

## Requirements
Follow mission and shared technical agreement. Preserve source meaning and default shadcn styling. Work only owned paths and `changes/F03.md`; request shared contract changes from coordinator. One active feature per worker.

## Validation
Coordinator is the sole checker at integrated milestones, bounded to one build and the representative core case as needed. No worker test runs or visual verification.

## Defaults
Local-first, public supplied sources, no secrets or raw originals committed. Missing values remain unknown. Commit coherent implementation and a three-to-eight-line receipt; report precise blockers.
