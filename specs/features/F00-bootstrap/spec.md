---
id: F00
name: Shared scaffold and contracts
agent: coordinator
phase: 0
depends_on: []
owns: ['app/', 'specs/', 'README.md']
cut: never
---

# F00: Shared scaffold and contracts

## Plan
Minimal working shell, authoritative types/example, default shadcn components and explicit data provider. Commit before worker creation.

## Requirements
Follow mission and shared technical agreement. Preserve source meaning and default shadcn styling. Work only owned paths and `changes/F00.md`; request shared contract changes from coordinator. One active feature per worker.

## Validation
Coordinator is the sole checker at integrated milestones, bounded to one build and the representative core case as needed. No worker test runs or visual verification.

## Defaults
Local-first, public supplied sources, no secrets or raw originals committed. Missing values remain unknown. Commit coherent implementation and a three-to-eight-line receipt; report precise blockers.
