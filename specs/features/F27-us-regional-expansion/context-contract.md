# F27-C3 — Unresolved planning context

ERCOT qualification establishes that nonterminal TPIT rows are not uniformly physical transmission work: some are distribution context and many lack enough equipment evidence to establish their scope. Retain useful unresolved planning records without calling them capital projects or counting them as transmission-qualified.

Coordinator owns `domain/coverage.ts` and temporarily the single Record type label in `features/explorer/ProjectDetails.tsx` (coordinated with ui while it owns only Alaska qualification files). Add `planning-context` to inventory.recordKind; no schema-version change or default is injected. Existing v1/v2 records stay unchanged. Display this kind as “Planning context”; its raw description and evidence explain the unresolved scope. Exports already preserve the exact kind.

Core owns the small follow-up to `core/eligibility.ts` and `changes/F27-context-core.md` after delivering ERCOT qualification: existing non-transmission exclusion stays authoritative; use an accurate planning-context exclusion explanation for this new value, preserving all existing eligibility outcomes and calculation behavior. No worker checks. Coordinator's next regional build/case covers compatibility once accepted real samples and complete source increments are integrated.

Exact ERCOT row classification, owner/date semantics and producer acceptance remain in its source spec; this contract does not accept a source merely because it validates. Explicit generation/load-model-only proposals remain outside transmission inventory scope. Readiness/Home count inventory records, not deduplicated engineering projects or transmission-qualified totals.
