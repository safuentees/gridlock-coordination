# Gridlock mission

Gridlock helps transmission planners and regional coordination analysts move from fragmented public plans to a prioritized, evidence-backed investigation and a reusable coordination handoff. The product must help people arrive, do the work, understand what it supports, act and return—not only operate a map.

The central experience is a connected map, searchable project inventory and ranked opportunity list. Selecting a pair reveals where its locations and dates came from, distinguishes uncertainty, and supports comparison, scenario exploration and a reusable coordination brief.

Explore uses one floating panel over the map: searchable results by default, details replacing the body, and Back restoring the browsing context. A compact collapsed state preserves search and selection. Navigation preserves unsaved scenario, impact and review work; longer evidence remains inside the same panel or the existing occasional-action dialogs.

## Full selected product
- Orient a new user with a concise Home page explaining audience, visibility problem, investigation benefit, source coverage and a clear entry to the workspace.
- Ingest the supplied Dominion and Georgia public planning records reproducibly, link the starter workbook's locations, and preserve source identifiers, dates, sponsor, provenance and missing values.
- Explore all projects from both filings on an interactive map and searchable inventory. Keep unlocated projects discoverable. Separate real source mode from a realistic 300-record demo.
- Compute cross-filing proximity in one canonical engine, use distance as the primary ranking signal and date separation as secondary context, and explain exclusions and assumptions.
- Inspect project and pair evidence, map connections and timeline context. Distinguish a scheduled need date, planned in-service date and an actual construction interval.
- Change radius, date-gap and location-confidence criteria, compare the resulting candidate set, and see what remains unknown.
- Save and compare opportunities with local notes and review states, then export a labeled, source-referenced coordination brief for follow-up.
- Estimate potential shared-corridor acreage and indicative avoided land cost using explicit user assumptions. Do not claim engineering feasibility or actual savings.
- Import a revised normalized dataset with validation and preview, retain stable identities, and compare additions, removals and changed records locally.
- Explain supported outcomes in a dedicated view linked to the same applied scenario: candidate evidence, limits on conclusions, coverage gaps and concrete next actions. Potential sharing of land, crews, equipment or substation capacity is a question to investigate, never an inferred benefit.
- Retain an investigation objective, next research action and optional analyst ownership; explicitly save hypothetical impact inputs/results with their evidence and export them in a usable handoff.
- Restore exported findings without losing existing reviews, confusing source/demo data or silently replacing saved evidence with a changed dataset.
- Find projects by imported need/zone context and grow usable real-data coverage through small, reviewable evidence decisions rather than forced coordinates.

## Differentiation
Evidence and uncertainty travel with each result. Candidate proximity is never represented as confirmed shared right-of-way, simultaneous construction or verified savings. Source-date precision and reporting utility versus sponsor stay visible.

## Complete user journey and next milestone
Home becomes the concise entry screen. Explore remains the full map-first working surface, Outcomes explains supported conclusions and actions, and Data readiness addresses evidence gaps. These are four purposeful destinations within one application; each fills a viewport with internal scrolling. Existing Explore/Readiness instances and drafts stay mounted across navigation. Saved-review management and dataset revisions remain dialogs, not extra pages.

| Capability and user purpose | Required inputs | Present / missing enabling work | Observable completion |
|---|---|---|---|
| Entry: understand relevance and begin | Active dataset mode, source editions and derived coverage | Labels/coverage exist; concise Home and shell destinations missing (F15) | User can identify audience, problem, benefit and enter source workspace or explicitly choose demo |
| Core work: locate, compare and investigate | Stable projects, provenance, location/date precision, authoritative scenario analysis | F00–F14 complete; shared scenario navigation and need/zone search remain (F15/F16/F19) | All imported records stay reachable; search finds useful context; selection opens the same retained detail with unchanged calculations |
| Outcomes: understand what results support | Applied full-dataset analysis, coverage/confidence, dates/windows and source meanings | Evidence exists; dedicated interpretation and action paths missing (F16) | Counts and conclusions match the applied scenario, unknowns remain explicit, and actions open candidate evidence/readiness/reviews |
| Act: prepare a useful handoff | Saved pair evidence, analyst objective/next question and explicit optional impact assumptions | Notes/states/export exist; structured investigation and saved impact context missing (F17) | Export carries the investigation question, evidence, next action and any labeled hypothetical calculation; legacy reviews survive |
| Return: retain work beyond one browser | Versioned exported brief, saved identity/mode and conflict decisions | Local persistence exists; safe export restoration missing (F18) | A restored brief retains evidence and notes, previews duplicates and never silently overwrites existing work |
| Strengthen coverage: enable more defensible comparisons | Need/zone context, exact public location evidence and identity match | F11/F12 provide context/revision workflow; search and external evidence decisions missing (F19) | Context searches work; a bounded batch records supported or unresolved decisions and any real revision can be previewed without invented coordinates |

F15/F16 and the first F19 increment start in parallel now; no reset of completed work. F17 follows entry integration and its shared saved-data agreement; F18 follows that additive contract. F19 research can continue independently of presentation work. Each capability has owners, file boundaries, inputs and completion criteria in the roadmap and short spec.

Supplied-source review adds useful direction: challenge §1 names crews/equipment/right-of-way/substation capacity, while its bonus asks for an explained impact estimate. The location guide Part 2 requires identity checks against description, zone and landmarks. Dominion p31's existing right-of-way and p23's new line illustrate distinct scope; pp14–15 contain related but separate Stevens Creek–Hooks records, and p34 contains Dawson phases. These justify resource-specific research questions, searchable source context and retained assumptions. Related-record navigation is a worthwhile later addition; do not merge records or infer shared geometry.

The real-data limit remains 242 missing locations, ten supplied unverified centers and no explicit construction windows. Counts describe the supplied historical snapshot, not current utility status. Evidence acquisition is an enabling capability, not a reason to postpone entry/outcomes. New source matches require exact public evidence and remain unverified through the current revision workflow; no bulk geocoding, guessed coordinates, private-document ingestion or second calculation engine. A current-plan refresh needs its own source-edition review before making new status claims.

## Requirements and reversible assumptions
The brief requires at least two utilities, interactive project display and highlighted overlaps, and ranked coordination opportunities. Geography is primary; timing is secondary. A rough impact estimate is a bonus that we select. Details and one input/output example are in discovery.md.

The guide says under 25 miles; default eligibility is strictly distance < 25 mi. Radius is adjustable. Endpoint arithmetic midpoints and single-known-endpoint centers follow the supplied guide. Workbook coordinates are unverified supplied evidence, not independently confirmed infrastructure locations. Plans are historical snapshots; dates before today are not proof of completion. We do not hide them automatically.

A local-first web app is sufficient. No accounts, backend, paid APIs or deployment are needed for this iteration. Intended demo scale is 300 projects, near the observed 252 source-list records, with a minority of located pairs within the radius. Bulk source rows without locations remain useful inventory records. Applied source revisions are retained locally in the browser where available; users can download and restore normalized snapshots.

## Budget and permissions
No time or token budget was supplied. Work in small integrated milestones with at most three concurrent subagents. Continue selected capabilities; report real blockers and propose additions rather than silently expanding scope. Coordinator is the sole limited checker (five minutes per milestone, one build and one representative core case, no visual checks).

The user authorizes subagent coordination, project pushes, PRs and integration, and creation of a private repository with a different name. Project remote: https://github.com/safuentees/gridlock-coordination. The workflow-template push URL is disabled. Original attachments, credentials, personal information and generated builds stay out of Git. No release publishing or branch deletion is authorized.

## Exclusions
No private/CEII material ingestion, autonomous engineering decisions, real-time utility schedule claims, external messaging, live geocoding at scale, authentication, or production hosting. Additional utility adapters and verified route geometry are worthwhile later extensions, not prerequisites for this product.
