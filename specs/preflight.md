# One-time project setup

Coordinator: read this at project setup, not for every feature. Use supplied context; ask only for missing decisions that materially block work. Defaults are reversible choices, not invented facts or permissions.

1. Fill `mission.md`: user, problem, central experience, full intended capabilities, differentiation and available budget. Keep the vision broad and implementation increments small. A static shortlist is not the default product.
2. Fill `tech-stack.md`: choose the stack, one authoritative schema/example, producer-consumer interface and owners of truly shared files. Define field meanings, units and missing values. For web UI, use one suitable official shadcn preset; read relevant component/block docs. Avoid a separate MCP setup project when the CLI works.
3. Expand `roadmap.md` into concrete product features across all relevant phases, not just frontend/backend buckets. Include meaningful inputs, the central interaction, useful next actions and selected differentiators. Assign real workers, dependencies and owned paths; copy `features/TEMPLATE.md` for each feature. Detail near-term work, keep later specs short. Feature count is not a quota.
4. Record actual startup/dispatch arrangements and permissions already granted. The default is coordinator merging and one limited checker. In a solo run, the same agent can hold roles sequentially. Do not launch separate chats or publish beyond the user's authorization.
5. Implement F00: minimal entry point, shell/navigation where relevant, shared types, example records and default common components. Commit/integrate this shared base, then record its SHA in the roadmap and create initial worker worktrees from it. The UI can consume the agreed examples while real inputs are prepared.
6. Mark setup `ready` and start the next assigned features. Later tasks start from the latest integrated main. Do not turn setup into a documentation, testing or polish project.

If this checkout still points at the workflow-template remote, do not push application changes there. Use the authorized project remote; local work can proceed without remote publishing.
