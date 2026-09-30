---
id: F06
name: Save comparisons and coordination briefs
agent: ui
phase: 2
depends_on: ['F05']
owns: ['app/src/App.tsx', 'app/src/features/briefs/', 'app/src/features/explorer/Explorer.tsx', 'app/src/features/explorer/format.ts']
cut: never
---

# F06: Save comparisons and coordination briefs

## Plan
Persist saved pairs, review state and notes locally with separate demo/real namespaces. Compare saved pairs and export a source-referenced plain-text or JSON coordination brief with settings and caveats. No external messaging.

## Requirements
Follow mission and shared technical agreement. Preserve source meaning and default shadcn styling. Work only owned paths and `changes/F06.md`; request shared contract changes from coordinator. One active feature per worker.

## Validation
Coordinator is the sole checker at integrated milestones, bounded to one build and the representative core case as needed. No worker test runs or visual verification.

## Defaults
Local-first, public supplied sources, no secrets or raw originals committed. Missing values remain unknown. Commit coherent implementation and a three-to-eight-line receipt; report precise blockers.
