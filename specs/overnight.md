# Execute features

The filename follows the reference project; this is also the daytime workflow. It runs only while agents are active. No scheduler is installed.

## Pick and claim

1. At assignment time, read mission, relevant technical agreements, roadmap and your feature spec. Refresh only changed context. Inspect Git at startup and meaningful commit/integration/ownership boundaries, not after every edit.
2. Choose the highest-priority ready assigned feature, breaking ties by lowest ID. Ready means prerequisites are integrated, inputs/contracts exist, no other claim exists and the budget permits it.
3. Use a separate worktree and `codex/<ID>-<slug>` branch from the shared base for initial workers, latest integrated main afterward. Do not switch another worker's checkout. Where publishing is authorized, open a draft `[FXX] <feature>` PR once the branch has a commit; otherwise record a local claim in the roadmap.

## Implement and integrate

4. Edit owned files, use shared interfaces and keep drafts bare. Read necessary source/docs, install dependencies and start the app as needed. Fix encountered errors; do not turn implementation into speculative cleanup or verification.
5. Commit coherent increments. A larger feature can use sequential `[FXX] part 1/3` PRs, one open implementation PR per feature. Other independent features proceed in parallel. `[C01]` identifies a shared-owner contract change; `[FIX-FXX]` fixes a feature. These do not automatically create new product goals.
6. In the final implementation commit, add `changes/FXX.md`: three to eight lines covering shipped behavior, cuts, known gaps and any actual check result or pending check. Intermediate parts do not declare the whole feature complete. Never create receipt-only PRs.
7. The authorized merge owner incorporates compatible work when prerequisites are present, ownership is respected, no known blocking defect remains and enforced repository requirements are satisfied. Default owner: coordinator. Worker self-merge requires explicit authorization. Do not add repeated human approvals once merging is authorized. No branch deletion, force-push or publication is implicitly granted.
8. A receipt on main means integrated, not fully verified. Dispatch the next ready feature immediately. Resume stopped workers through authorized tools, or give the operator one concise instruction. No ready task means name the blocker or stop; do not poll continuously or invent work.

Coordinate shared-file changes with their owner and affected consumers. Keep useful parts independently integrable. Prefer additive contract changes; update affected specs and ownership with the change, and name the consumer follow-up. Do not claim integration complete while that connection is missing. Do not repeatedly rebase for unrelated merges; update when an actual dependency, conflict or enforced requirement needs it. Preserve others' changes and keep secrets, source credentials and generated files out of commits.

## One limited check owner

Only `check_owner` runs planned verification at an integrated milestone. Default total budget: five minutes, at most one existing build/compile command plus one representative core input/output check. Reuse applicable successful exact-revision CI; do not rerun it locally or duplicate typechecking included in a build. Skip checking docs, copy and routine styling changes.

No Playwright, browser automation, screenshots, image analysis, viewport/mobile/zoom audits, exhaustive suites, coverage targets, extra reviewers or new CI/bot setup unless explicitly requested. Developers and the coordinator do not repeat the check owner's work. Existing enforced checks still apply; report blockers rather than bypassing them.

The checker returns a short revision/result/limitation note. On failure, return the defect to its owner; recheck only the affected case after a fix. Pause affected dependent work while unrelated work continues. Stop at the budget and report unchecked items. Never describe an unrun check as passing.

## Grow the product

At milestones, material feedback or blockers, compare integrated capabilities to the mission. Continue approved scope; propose larger additions with benefit and effort. Once selected, assign a new ID, owner, dependencies and short spec before implementation. Independent additions need not wait for every original task. Preserve existing IDs and ownership.

Keep reports to implemented outcome, access instructions, actual blockers and next assignment. Avoid status-only PRs, document reorganizations and tooling detours. Follow existing permissions; ask only for material decisions the context cannot resolve. Broader scope should produce user capabilities, not longer coordination rituals.
