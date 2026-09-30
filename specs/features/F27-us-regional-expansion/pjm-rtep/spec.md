# F27-PJM — Public RTEP inventory

Purpose: expand searchable planned-transmission inventory beyond the initial Southeast and SCE filings. Source location labels and states aid discovery but are not coordinates. This regional increment cannot complete national coverage.

Coordinator screening on 2026-09-30 found the [official status page](https://www.pjm.com/planning/m/project-construction) exposes a [complete public XML export](https://www.pjm.com/pjmfiles/media/planning/projectConstruction-data/projectCostUpgrades.xml). Preserved original: `inputs/originals/F27-pjm-rtep-2026/projectCostUpgrades.xml`; SHA256 `1cc0ae1b78258cbe81108ec2fdd43754098a57cc5ec224f6e7300cafefe2eb31`; 25,476,508 bytes. It contains 15,692 Upgrade records with distinct UpgradeId values. Fields include description, owner, state, named location, equipment, status, required/projected/actual dates, board approval and last-updated dates; no latitude/longitude. Do not geocode or use state centroids. Snapshot retrieval is not publication.

Observed statuses: IS 9,215; EP 3,800; Cancelled 847; Active 831; UC 532; On Hold 256; PL 199; W 6; UC-ISP 6. Types: Supplemental 6,616; Baseline 5,639; Network 3,437. These are raw rows, not an accepted retained scope. A Network upgrade associated with a generation request is not the generator itself. Exact lifecycle, granularity, owner and edition meanings remain to qualify.

## Qualification

Owner: source worker after F26 delivery, explicitly dispatched by coordinator. Exact writes: `specs/features/F27-us-regional-expansion/pjm-rtep/qualification.md` and `sample.json`. Root owns this spec/register. Read-only qualification can overlap F26 integration; production depends on integrated F26.

Reuse the XML/page, with at most 15 minutes of necessary primary-source clarification and six sample records. Resolve native-ID versus parent rollups, status codes, owner evidence/aliases, snapshot/edition semantics, full enumeration scope and regional footprint. Unknowns stay unknown. Look for a directly linked public coordinate companion within the same bound; report absence rather than manufacture map points. State whether the source qualifies for inventory discovery even if spatial comparison remains blocked. No new national survey, private/CEII material, account creation, geocoding or source work outside this boundary.

Before implementation root accepts the source key, edition convention, lifecycle/eligibility mapping and any schema addition. Measure actual normalized size before changing the existing 10MB input guard. No worker verification.

## Full adapter, after accepted qualification and F26 integration

Owner: qualifying worker in its own worktree/branch. Exact writes: `scripts/ingest/coverage/pjm-rtep/*`, `app/src/data/real/coverage/pjm-rtep/*`, `changes/F27-pjm.md`. Root owns provider/register/consumer handoffs.

Connect a small real slice first, then reconcile every raw record as retained, excluded or unresolved. Keep stable source/native identities, public nonterminal transmission upgrades without locations, exact state/location text and source date meanings. Do not infer completion from dates, manufacture construction intervals or merge upgrade rows by name. Keep unknown type/status explicit. Distinguish source upgrade totals from unique engineering projects when the source groups multiple upgrades.

Complete only after full usable declared scope is integrated into discovery/readiness/evidence, revisions survive, counts reconcile and coordinator records the one bounded milestone check. Coverage is partial regional public inventory, never statewide/national completeness. Existing preset, shared contracts and no-browser/visual/mobile rules apply.
