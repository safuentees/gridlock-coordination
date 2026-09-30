---
id: F00
name: Shared scaffold and contracts
lane: B
agent: coordinator
phase: 0
depends_on: []
owns: []
cut: never
bootstrap: true
---

# F00: one shared starting point

## Plan
After preflight, create the smallest app structure that lets workers implement the mission in parallel. Fill `owns` with the actual scaffold paths before editing them.

## Requirements
- Establish authoritative shared input/result types, one example and producer-consumer interface. For data-backed products, provide a minimal explicit demo/real adapter, reserve separate producer paths and name the core-logic owner. Leave large synthetic generation and bulk ingestion to their assigned parallel features.
- Include an entry point, minimal shell/navigation where relevant, common components/default theme and development command.
- Keep field meanings, units and unknowns explicit; avoid speculative infrastructure.
- Commit/integrate the scaffold, add its completion receipt and record the base SHA in the roadmap. Initial workers inherit this same base in separate worktrees.

## Validation
No standalone acceptance audit. The named checker covers this through the first integrated milestone's limited check.

## Defaults
Use the appropriate simplest stack; no backend, deployment, CI/bots or custom design system unless the selected product actually needs it and the action is authorized. This template repository itself is not completed F00.
