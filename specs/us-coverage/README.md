# US planned-transmission coverage

US-wide discovery is selected scope (F25–F27). `us-register.json` is the canonical planning register, maintained by the coordinator after each source decision/import/integration. This initial register is documentation, not a shipped application coverage dashboard. F26 connects the runtime manifest to Readiness/Outcomes using existing composition and internal scrolling.

## Shared contract before adapters

All producers emit the same versioned source/edition manifest and normalized project envelope once F26-C1 is committed. Required meanings:
- Source: stable key, publisher, reporting group, public URL/locator, declared geography and inclusion/exclusion rules. Source footprint is not the same as complete coverage of a state or ISO territory.
- Edition: stable edition ID and publication/as-of date separate from retrieval/generation time; explicit full/sample scope and processed/imported/excluded/failed counts. Preserve original artifacts according to repository rules.
- Identity: source key plus native project ID, independent of edition. Keep legacy IDs unchanged and cite cross-source identity links. Do not conflate publishers and owners or silently deduplicate similar names.
- Project: record kind, raw/normalized lifecycle and as-of source; sponsor nullable; source milestone kind/precision; build interval only when explicit; source references for assertions.
- Geography: source point/endpoints/route and CRS when supplied; normalized point plus derivation, role and precision/confidence. Unknown stays null. General pins/permit areas are not surveyed centers. Geometry unsuitable for precise radius matching needs an explicit canonical eligibility policy and clear user explanation.
- Envelope: source manifest plus proposed additions/changes/unresolved records, expected baseline/edition and exact evidence. Shared import preview/apply preserves local revisions, drafts, reviews and real/demo boundaries. Never silently remove a project merely because a new edition omitted it.

These are selected semantic requirements, not a claim that runtime schema v1 already supports regional sources. F26-C1 commits exact validation/types, migration and consumer signatures before parallel implementation. The current two-value utilityId/filing comparison cannot be used as a fake owner model. The canonical core remains authoritative; map props stay compatible via the agreed shared adapter. Keep map-only synthetic fixtures isolated and excluded from source counts/exports.

## Register rules

- Per source/edition: public inventory scope, imported record count, located count, confidence counts, missing fields, source locator, blockers and task/owner. Count projects after explicit source grouping, not arbitrary raw rows; reconcile raw row accounting separately in the producer manifest.
- Per jurisdiction: assessed/partial/uncovered/blocked state and linked source scopes. Jurisdiction entries must not imply source counts can be apportioned by state when no such assignment exists. Do not sum overlapping jurisdiction rows for US totals.
- `null` means not measured or no defensible denominator. Zero imported records means no imported inventory, not zero projects in that area. Existing assets and generation proposals never raise planned-transmission totals.
- National totals derive from integrated real records, with source-overlap accounting explicit. Suggested local revisions and synthetic previews are separate. A completed sample is `sample`, not `full-usable-public-inventory`; stale source status remains source-as-of, not current reality.
- Regions with inaccessible evidence are `blocked` only with a named cause. Untested source leads are `unqualified`, not claimed accessible or technically blocked. Uncovered areas stay visible even when no source has yet been identified.
- Coordinator updates this file from each producer manifest and integration receipt; producers own separate source folders and submit facts without racing shared register edits. F26 runtime coverage must use the same definitions, not hardcoded success counts.

Success for qualification, a full source inventory, an additional region and the national goal is defined separately in F25/F26/F27. Same-source refreshes update freshness but do not advance geographic coverage. Continue approved adapters after integration; real blockers remain open rather than being converted into completion.
