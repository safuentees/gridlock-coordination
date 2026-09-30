# Shared technical agreement

Fill this once during setup; update only affected decisions as features require them.

| Agreement | Project value |
|---|---|
| Stack and package manager | [appropriate to the project] |
| Install / development commands | [actual commands after choosing the stack] |
| Authoritative schema/types + example | [paths] |
| Producer → consumer interface | [function, props or API; inputs and outputs] |
| Field meanings / units / unknowns | [brief definitions or link to the schema] |
| Shared shell, navigation, dependencies and theme owner | [owner and exact paths] |
| Baseline input source | [local/public source; distinguish examples from real records] |
| Optional bounded check command | [one existing build/compile command; checker only] |
| Representative core check | [one expected input/output case; checker only] |

Workers import shared types; they do not create competing copies. The UI uses the same interface for example and real records. Shared changes go through their owner, name affected consumers and preserve compatibility where possible. Coordinate a migration when field meanings must change.

## UI defaults

For applicable web UI, read official shadcn component/block documentation and choose one suitable preset. Initialize it if absent; use the CLI or existing MCP tools. Keep documented typography, spacing, variants and theme. Use only necessary layout utilities; avoid arbitrary CSS, padding, custom card styles and a second design system.

Build bare connected drafts first. Use minimal controls and content; no extra export, accounts or dashboards unless the feature needs them. Keep built-in responsive behavior, but do not add mobile optimization or inspection unless requested.

Every string must help identify, interpret or act on a result. No filler, redundant captions, developer status, fixture labels or evidence-issue panels. No inline decorative dot/bullet separators. Use meaningful result lists and concise fields, not metadata clutter. Keep material uncertainty honest through a short contextual label or source link.

No browser, screenshot or visual-verification step is required. Checking policy lives in `overnight.md`.
