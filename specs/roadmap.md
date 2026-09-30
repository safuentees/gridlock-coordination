---
setup: uninitialized
run_start: unset
time_budget: unset
usage_budget: unset
contract_owner: coordinator
reporting_agent: coordinator
merge_owner: coordinator
check_owner: checker
base_commit: unset
lanes:
  A: { name: inputs-and-core, agents: [data-worker] }
  B: { name: app-and-integration, agents: [coordinator, ui-worker] }
  C: { name: limited-checks, agents: [checker] }
frozen_paths: []
check_budget: "5 minutes per integrated milestone; no visual checks"
gates: []
stretch: []
---

# Project roadmap

Coordinator: fill this from the brief during preflight. F00 below is only the shared starting point. Add the complete selected feature map before parallel work: concrete input/coverage, computation, interaction, result/context, useful action and differentiator features. Do not leave a four-task frontend/backend plan or force nineteen features.

## Phases

0. **Bootstrap:** one shared entry point, contracts, examples and common components.
1. **Parallel foundations:** useful inputs and the main interaction connected in a bare draft.
2. **Real product:** meaningful coverage, deeper core behavior and selected user actions.
3. **Differentiators:** valuable capabilities selected for this project's purpose.
4. **Wrap-up:** concise access instructions, implemented outcomes and known gaps.

Phases set priorities; actual dependencies determine readiness. Each product phase extends the integrated experience. Configure gates from the real budget, not an arbitrary overnight duration.

## Features

| ID | Feature | Lane | Agent | Phase | Depends on | Cut |
|---|---|---|---|---|---|---|
| F00 | Shared scaffold, contracts and example input | B | coordinator | 0 | none | never |

`Cut: never` means required for the selected scope; `allowed` means optional under budget pressure. Each row links to or has a matching `features/<ID>-<slug>/spec.md`. Feature count and PR count are not progress targets.

## Critical path

[Required chain to the core user outcome; name independent parallel work and one fallback if a bottleneck is late. For data-backed products, UI starts on the shared contract with synthetic data; record the first small real-data handoff without waiting for the whole corpus.]

## Active workers

| Worker / actual chat | Feature | Branch / worktree | Claim / PR |
|---|---|---|---|

Record real identities/paths only after creation. Default: one active feature per worker. Startup/resume arrangement: [who starts workers; whether direct messaging is authorized and available]. Push/merge permissions: [existing user authorization, or local-only]. Milestone check points: [integrated outcomes to check].

Completion is recorded by `changes/<ID>.md` on main, not duplicate status tables. The active-worker table tracks claims, not verification. No Markdown file wakes an idle agent.
