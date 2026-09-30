---
id: F08
name: Import and compare revised datasets
agent: coordinator
phase: 3
depends_on: ['F00']
owns: ['app/src/features/import/', 'app/src/data/import.ts']
cut: never
---

# F08: Import and compare revised datasets

## Plan
Validate normalized Dataset JSON, preview additions/removals/changed source records, reject duplicate IDs and invalid dates/modes, apply locally with explicit reset. UI receives additive callback/slot; coordinate App edits with UI worker.

## Requirements
Follow mission and shared technical agreement. Preserve source meaning and default shadcn styling. Work only owned paths and `changes/F08.md`; request shared contract changes from coordinator. One active feature per worker.

## Validation
Coordinator is the sole checker at integrated milestones, bounded to one build and the representative core case as needed. No worker test runs or visual verification.

## Defaults
Local-first, public supplied sources, no secrets or raw originals committed. Missing values remain unknown. Commit coherent implementation and a three-to-eight-line receipt; report precise blockers.

The shared provider and schema are sufficient to implement this independently. Final UI connection waits for F03; bulk extraction is not a technical dependency.
