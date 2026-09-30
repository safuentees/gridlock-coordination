---
id: F07
name: Transparent shared-corridor scenario
agent: core
phase: 3
depends_on: ['F02']
owns: ['app/src/core/', 'app/src/features/impact/']
cut: never
---

# F07: Transparent shared-corridor scenario

## Plan
Implement sole acreage/indicative savings calculation and a self-contained default shadcn panel accepting selected opportunity; user supplies assumptions, defaults clearly hypothetical. UI integrates panel in pair detail. Do not infer feasibility from distance.

## Requirements
Follow mission and shared technical agreement. Preserve source meaning and default shadcn styling. Work only owned paths and `changes/F07.md`; request shared contract changes from coordinator. One active feature per worker.

## Validation
Coordinator is the sole checker at integrated milestones, bounded to one build and the representative core case as needed. No worker test runs or visual verification.

## Defaults
Local-first, public supplied sources, no secrets or raw originals committed. Missing values remain unknown. Commit coherent implementation and a three-to-eight-line receipt; report precise blockers.
