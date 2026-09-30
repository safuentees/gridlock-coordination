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
| Synthetic / real data modes and intended scale | [adapter path; record count/range and basis; separate fixture/ingestion owners and paths] |
| Canonical domain logic | [calculation/ranking module and owner; UI consumes its results] |
| Optional bounded check command | [one existing build/compile command; checker only] |
| Representative core check | [one expected input/output case; checker only] |

Workers import shared types; they do not create competing copies. The UI uses the same interface for example and real records. Shared changes go through their owner, name affected consumers and preserve compatibility where possible. Coordinate a migration when field meanings must change; update affected synthetic and real producers together.

## Parallel data handoff

Apply this to data-backed products; omit irrelevant parts for other projects.

Have the UI worker use realistic synthetic data at the intended scale, clearly separated from real records, while the data worker independently implements ingestion against the same shared schema.

- Choose a representative record count from the brief, or state a reversible assumption. Use a small deterministic generator with plausible distributions, relationships, varied text and missing values. Do not make dataset generation a separate infrastructure project.
- Give synthetic fixtures and real ingestion disjoint owned paths. Both use the agreed input/result types and one UI data-provider interface. Explicit demo mode works without live services or secrets; real-mode failures return unavailable/empty/error, never silently synthetic data. Use one concise demo indicator. Keep synthetic records out of real coverage counts and real ingestion outputs; label any demo exports.
- Implement eligibility, ranking and calculations once in the agreed core module or service. UI renders its results; ingestion produces its inputs. Until core logic is ready, synthetic result records can exercise the agreed interface without a second implementation of the rules.
- Deliver a small representative real batch through the same interface before bulk ingestion finishes, then expand coverage incrementally. Preserve stable IDs, source references (file/page/version when relevant), unknowns and a brief processed/skipped/failed summary in developer artifacts. Do not turn diagnostics into required UI panels.

## UI defaults

For applicable web UI, read official shadcn component/block documentation and choose one suitable preset. Initialize it if absent; use the CLI or existing MCP tools. Keep documented typography, spacing, variants and theme. Use only necessary layout utilities; avoid arbitrary CSS, padding, custom card styles and a second design system.

Build bare connected drafts first. Use minimal controls and content; no extra export, accounts or dashboards unless the feature needs them. Keep built-in responsive behavior, but do not add mobile optimization or inspection unless requested.

Every string must help identify, interpret or act on a result. No filler, redundant captions, developer status, repeated fixture labels or evidence-issue panels. Keep the concise demo indicator when using synthetic data. No inline decorative dot/bullet separators. Use meaningful result lists and concise fields, not metadata clutter. Keep material uncertainty honest through a short contextual label or source link.

No browser, screenshot or visual-verification step is required. Checking policy lives in `overnight.md`.
