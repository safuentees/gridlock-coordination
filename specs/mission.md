# Gridlock mission

Gridlock helps transmission planners and regional coordination analysts compare neighboring utilities' public plans, investigate nearby projects, and prepare an evidence-backed coordination proposal.

The central experience is a connected map, searchable project inventory and ranked opportunity list. Selecting a pair reveals where its locations and dates came from, distinguishes uncertainty, and supports comparison, scenario exploration and a reusable coordination brief.

Explore uses one floating panel over the map: searchable results by default, details replacing the body, and Back restoring the browsing context. A compact collapsed state preserves search and selection. Navigation preserves unsaved scenario, impact and review work; longer evidence remains inside the same panel or the existing occasional-action dialogs.

## Full selected product
- Ingest the supplied Dominion and Georgia public planning records reproducibly, link the starter workbook's locations, and preserve source identifiers, dates, sponsor, provenance and missing values.
- Explore all projects from both filings on an interactive map and searchable inventory. Keep unlocated projects discoverable. Separate real source mode from a realistic 300-record demo.
- Compute cross-filing proximity in one canonical engine, use distance as the primary ranking signal and date separation as secondary context, and explain exclusions and assumptions.
- Inspect project and pair evidence, map connections and timeline context. Distinguish a scheduled need date, planned in-service date and an actual construction interval.
- Change radius, date-gap and location-confidence criteria, compare the resulting candidate set, and see what remains unknown.
- Save and compare opportunities with local notes and review states, then export a labeled, source-referenced coordination brief for follow-up.
- Estimate potential shared-corridor acreage and indicative avoided land cost using explicit user assumptions. Do not claim engineering feasibility or actual savings.
- Import a revised normalized dataset with validation and preview, retain stable identities, and compare additions, removals and changed records locally.

## Differentiation
Evidence and uncertainty travel with each result. Candidate proximity is never represented as confirmed shared right-of-way, simultaneous construction or verified savings. Source-date precision and reporting utility versus sponsor stay visible.

## Next milestone: evidence readiness and returning to work
The map-first Explore workspace is the default arrival screen. Data readiness is a separate purposeful workspace for understanding coverage and preparing source-backed location revisions. Saved reviews and occasional dataset imports remain dialogs. Both workspaces fill a viewport; switching workspaces preserves exploration state.

| Journey | Present | Next useful improvement |
|---|---|---|
| Arriving | Source/demo label, searchable list, map and scenario summary | Actionable coverage orientation explaining why most records cannot be ranked |
| Working | All 252 real records, 300 demo records, filters, synchronized selection and timeline | A searchable missing/unverified-location queue with guided evidence editing |
| Understanding | Paired evidence, timing precision, confidence, uncertainty and impact assumptions | Retain Georgia planning zones and Dominion project-need text already in approved source sections |
| Acting | Save/compare reviews and export briefs; preview normalized JSON imports | Preview, apply and download one-project location revisions without editing JSON |
| Returning | Separate local saved reviews and notes | Persist validated source revisions locally, with clear recovery/reset and download fallbacks |

Source discovery found 242 missing locations (39 Dominion, 203 Georgia), not parse failures. Ten supplied centers are unverified; no record supplies an explicit construction window. The next selected milestone is F11 guided location evidence, F12 deterministic public-source context enrichment and F13 local revision persistence. New coordinates require actual user-supplied evidence and remain unverified; no automatic geocoding, guessed coordinates, private-document ingestion or new calculation engine. Originals and stable IDs are preserved. This extends the existing evidence-backed purpose without a change in direction.

## Requirements and reversible assumptions
The brief requires at least two utilities, interactive project display and highlighted overlaps, and ranked coordination opportunities. Geography is primary; timing is secondary. A rough impact estimate is a bonus that we select. Details and one input/output example are in discovery.md.

The guide says under 25 miles; default eligibility is strictly distance < 25 mi. Radius is adjustable. Endpoint arithmetic midpoints and single-known-endpoint centers follow the supplied guide. Workbook coordinates are unverified supplied evidence, not independently confirmed infrastructure locations. Plans are historical snapshots; dates before today are not proof of completion. We do not hide them automatically.

A local-first web app is sufficient. No accounts, backend, paid APIs or deployment are needed for this iteration. Intended demo scale is 300 projects, near the observed 252 source-list records, with a minority of located pairs within the radius. Bulk source rows without locations remain useful inventory records. Applied source revisions are retained locally in the browser where available; users can download and restore normalized snapshots.

## Budget and permissions
No time or token budget was supplied. Work in small integrated milestones with at most three concurrent subagents. Continue selected capabilities; report real blockers and propose additions rather than silently expanding scope. Coordinator is the sole limited checker (five minutes per milestone, one build and one representative core case, no visual checks).

The user authorizes subagent coordination, project pushes, PRs and integration, and creation of a private repository with a different name. Project remote: https://github.com/safuentees/gridlock-coordination. The workflow-template push URL is disabled. Original attachments, credentials, personal information and generated builds stay out of Git. No release publishing or branch deletion is authorized.

## Exclusions
No private/CEII material ingestion, autonomous engineering decisions, real-time utility schedule claims, external messaging, live geocoding at scale, authentication, or production hosting. Additional utility adapters and verified route geometry are worthwhile later extensions, not prerequisites for this product.
