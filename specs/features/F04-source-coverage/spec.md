---
id: F04
name: Expand both planning inventories
agent: ingestion
phase: 2
depends_on: ['F01']
owns: ['scripts/ingest/', 'app/src/data/real/']
cut: never
---

# F04: Expand both planning inventories

## Plan
Extract all 44 Dominion and 208 active Georgia Table 2 rows, link seed records without duplication, preserve unlocated inventory, provenance and sponsor differences. Report processed/skipped/failed and parsing exceptions.

## Requirements
Follow mission and shared technical agreement. Preserve source meaning and default shadcn styling. Work only owned paths and `changes/F04.md`; request shared contract changes from coordinator. One active feature per worker.

## Validation
Coordinator is the sole checker at integrated milestones, bounded to one build and the representative core case as needed. No worker test runs or visual verification.

## Defaults
Local-first, public supplied sources, no secrets or raw originals committed. Missing values remain unknown. Commit coherent implementation and a three-to-eight-line receipt; report precise blockers.
