---
id: F02
name: Canonical proximity and ranking
agent: core
phase: 1
depends_on: ['F00']
owns: ['app/src/core/', 'app/scripts/check-core.ts']
cut: never
---

# F02: Canonical proximity and ranking

## Plan
Implement haversine, strict radius, stable ranking, honest temporal context, missing data and summary. Author one representative script, do not run it.

## Requirements
Follow mission and shared technical agreement. Preserve source meaning and default shadcn styling. Work only owned paths and `changes/F02.md`; request shared contract changes from coordinator. One active feature per worker.

## Validation
Coordinator is the sole checker at integrated milestones, bounded to one build and the representative core case as needed. No worker test runs or visual verification.

## Defaults
Local-first, public supplied sources, no secrets or raw originals committed. Missing values remain unknown. Commit coherent implementation and a three-to-eight-line receipt; report precise blockers.
