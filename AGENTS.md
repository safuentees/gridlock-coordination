# Agent instructions

Build concrete product capabilities in small, coherent increments.

## Read only what applies
- **New project:** follow [preflight](specs/preflight.md) once.
- **Purpose and scope:** [mission](specs/mission.md).
- **Contracts, stack, commands and UI defaults:** [tech stack](specs/tech-stack.md).
- **Assignments and dependencies:** [roadmap](specs/roadmap.md).
- **Your feature:** `specs/features/<ID>-<slug>/spec.md`.
- **Claim, implement, merge, continue:** [workflow](specs/overnight.md).

Refresh affected instructions when they change, not after every edit.

## Working rules
- Commit one shared scaffold and contract before parallel implementation.
- For data-backed products, parallelize UI on realistic synthetic data and ingestion on the same schema; follow the technical agreement.
- Use separate branches/worktrees and respect feature ownership.
- Claim ready assigned work; keep one implementation feature active per worker.
- Keep drafts bare. Use documented component defaults and useful, concise copy.
- Preserve source meanings; unknown values stay unknown.
- Inspect Git at meaningful work boundaries, not between ordinary edits.
- Commit coherent changes; preserve unrelated work and exclude secrets/generated files.
- Only the named checker runs bounded nonvisual milestone checks. Do not duplicate them.
- No Playwright, screenshots, visual verification or mobile audits unless explicitly requested.
- Follow existing user permissions for messaging workers, pushes, PRs and merges; this template grants none.
- Record integrated completion, then continue with the next ready feature.
- Keep handoffs brief. Idle chats need resuming unless a real scheduler exists.
