---
id: F05
name: Explore geographic and temporal scenarios
agent: ui
phase: 2
depends_on: ['F02', 'F03']
owns: ['app/src/App.tsx', 'app/src/features/explorer/', 'app/src/features/scenarios/']
cut: never
---

# F05: Explore geographic and temporal scenarios

## Plan
Add radius, optional day-gap and verified-location controls, baseline comparison, and selectable chronological context. Consume sole core calculations; unknown window stays unknown.

## Requirements
Follow mission and shared technical agreement. Preserve source meaning and default shadcn styling. Work only owned paths and `changes/F05.md`; request shared contract changes from coordinator. One active feature per worker.

## Validation
Coordinator is the sole checker at integrated milestones, bounded to one build and the representative core case as needed. No worker test runs or visual verification.

## Defaults
Local-first, public supplied sources, no secrets or raw originals committed. Missing values remain unknown. Commit coherent implementation and a three-to-eight-line receipt; report precise blockers.
