# Shared technical agreement

## Stack and commands
Vite + React + TypeScript in `app/`, npm lockfile, Tailwind 4, official shadcn Nova preset with Radix, neutral colors and Geist, Leaflet/react-leaflet, Zod. No backend. `cd app && npm ci`; `npm run dev -- --host 127.0.0.1`; checker only: `npm run build` and `node --import tsx scripts/check-core.ts` once per integrated milestone as appropriate. Python ingestion uses bundled pypdf/openpyxl read-only against originals; generated application builds are ignored.

Official defaults read: [Vite](https://ui.shadcn.com/docs/installation/vite), [CLI](https://ui.shadcn.com/docs/cli), [table](https://ui.shadcn.com/docs/components/radix/table), [tabs](https://ui.shadcn.com/docs/components/radix/tabs), [input](https://ui.shadcn.com/docs/components/radix/input). Preserve generated components and theme; use ordinary layout utilities, no redesign or visual inspection.

F22/F23 authorize an optional MapLibre/react-map-gl/deck.gl adapter while Leaflet remains default. Exact pinned dependency and package-file ownership is temporarily delegated to map-ui in those specs; no other worker changes dependencies. Existing ProjectMap props, MapViewportInsets, dataset and selection interfaces stay authoritative. Hierarchy/area encoding is map-only and cannot change canonical proximity/ranking/impact or real data. These additions are assigned, not yet shipped.

Product copy and icon-control rules are maintained in `app/src/AGENTS.md`. Shared `IconButton` composes the existing Button and official Nova Tooltip defaults, with a name and hover/focus label; ordinary text buttons remain appropriate for domain actions. `lib/presentation.ts` curates known ingestion notes and source editions without changing raw data or exports. The global TooltipProvider is in main.tsx.

## Authoritative contract
`app/src/domain/schema.ts` owns runtime Dataset/Project validation, domain types and analysis options. `app/src/domain/example.ts` is the representative contract record. Coordinator owns these files, package/dependency files, entry point, `app/src/index.css`, shared `components/ui/*`, `data/provider.ts`, specs and integration receipts. UI owns App after F00.

`loadDataset(mode: 'real'|'demo'): Dataset` returns validated records or throws, never falls back from real to demo. Real producer owns `app/src/data/real/*` and `scripts/ingest/*`; UI owns `app/src/data/demo/*`. Both return the same Dataset. UI uses `analyzeProjects(projects, options): AnalysisResult` from `app/src/core/index.ts`; core worker alone implements distance, ranking, date comparison and impact. No UI or ingestion copies of these calculations.

## Field meaning
- `id` is stable source-based identity, `sourceId` native project ID, `utilityId` reporting/filing group (`desc` or `gpc`), `sponsor` separately preserves listed owner/sponsor or null. Reporting-group comparison does not guarantee different asset owners.
- `date.value` ISO source date with explicit precision and kind (`in-service`, `need`, `unknown`); partial values retain precision, not invented day precision. `buildWindow` is null unless actual construction bounds are known.
- `location` is null when unknown; decimal WGS84 lat/lon, method and confidence accompany evidence. Midpoint means arithmetic endpoint average per guide. `unverified` includes workbook-provided coordinates; no invented precision or independently verified claim.
- Distances in statute miles, voltage in kV, time gap absolute UTC calendar days only when both dates have day precision. Geometry uses project centers, never inferred full corridors. Strict distance < radius. Default 25 mi; maxDateGapDays null means no timing exclusion. Unknown dates fail an explicitly enabled date-gap filter and otherwise remain candidates.
- Distance is primary rank, then known date gap, then stable ID. Construction overlap only when explicit windows intersect. Date proximity is milestone context, never proof of simultaneous construction. Date-proximity default <=365 days is a reversible convention.
- SourceRef uses exact filename and page/sheet/range; optional URL only when known. Missing cost, dates, sponsor or location are null. `notes` retain material caveats.
- Dataset includes mode, version, snapshot title/date and processed/skipped/failed counts. Real counts exclude synthetic records. Export demo labels. Treat imported text as plain data.

## Scale and parallel connection
300 deterministic demo projects with realistic names, varied dates, both utilities, clustered and distant locations, missing values and a minority of near pairs. Observed corpus is 252 list records before linking the ten workbook examples. Ingestion first commits the 10-record batch; integrate F01 with F02/F03 immediately, then expand via F04. Source snapshots are not live schedules.

## Ownership and checks
Coordinator is the shared UI composition owner: action scopes, destinations, shared slots and conflicting placement changes follow [UI composition](ui-composition.md). Feature specs name exact temporary file owners. This adds no approval gate and does not transfer F20 map ownership.

Coordinator acts as named checker sequentially and alone: at most one existing build/compile plus one representative core input/output check, five minutes per milestone. Workers implement and inspect code but do not run planned verification, browser/Playwright, screenshots or visual audits. Check-core is authored by core worker and executed by coordinator. No new test framework or CI.

Core expected example: Jasper–Okatie ↔ McIntosh–Purrysburg from discovery.md gives about 5.65 mi, 152 days, unverified candidate; no confirmed construction interval. Rank IDs stable. Impact is user-supplied shared miles × 5280 × width feet / 43560 square feet per acre, then × cost/acre × share fraction; label hypothetical.

## Viewport workspace (F09)
The shell owns 100dvh and forbids document scrolling. Flex/grid boundaries use min-height:0 and min-width:0; overflowing content scrolls inside bounded panels. Main views and details use tabs; secondary dataset/scenario/saved-review actions use the existing preset's Dialog. Native overflow is sufficient, so no extra scroll component is installed. Keep default type/spacing, primary actions visible and source uncertainty intact. Detailed ownership and the applied design references are in the F09 spec.

## Map workspace and evidence readiness (F10–F13)
Explore keeps the map mounted behind one floating results/detail stack (F14). ProjectMap receives measured viewportInsets in pixels; these only describe occlusion, never geographic values. Data readiness is a separate bounded workspace; switching surfaces preserves Explore state. `data/readiness.ts` derives active coverage and creates one-project location revisions through projectSchema and parseSourceDataset. Locally supplied coordinates remain unverified and require source title/file plus exact locator. UI never duplicates geographic calculations. `data/source-session.ts` stores validated real revisions under its own versioned browser key; malformed storage is reported and not silently overwritten. Source/demo and saved-review storage remain separate.

F14 retains results/detail component lifetimes, browsing state and draft owners across Back/collapse. Scenario and review workspaces mount once; comparison owns impact drafts per mode/candidate. Follow the F14 spec for ownership and the additive ImpactPanel draft interface. Existing shadcn components implement Blueprint-style stack/back navigation without Blueprint dependencies.

## Complete-product composition (F15–F19)
`domain/workspace.ts` owns HomePageProps, OutcomesWorkspaceProps and the four destination names. App owns applied scenario options per mode and one authoritative active analysis; Explorer consumes that analysis/options plus an update callback. Outcomes receives the same applied full-dataset analysis (before Explore text/location filters). No second matching engine or benefit score. Home/Explore/Outcomes/Readiness stay mounted and inactive wrappers are hidden/inert so navigation preserves drafts. Root owns App/Explorer/BriefWorkspace/Readiness consumer edits for this milestone; worker boundaries are in the roadmap.

Outcome candidate navigation uses a monotonically changing reveal request, leaving Explore's query/tab/page/scroll untouched. Saved-findings navigation opens the single existing BriefWorkspace through a request prop; do not read a second stale localStorage copy for counts. F19's `matchesProjectQuery(project, query)` lives in lib/project-search.ts and searches source context via visibleProjectNotes; both search consumers use it. No schema migration or dependencies were needed.

F17's optional `investigation` preserves version 1 saved records and briefs: resource, objective, nextAction, owner and nullable validated ImpactInputs. Existing `estimateImpact` is the only impact calculation. Explicit scenario saving preserves existing evidence and dirty review fields; export includes saved assumptions and labeled derived results. F18 `parseBrief` validates version/mode/identity and discards imported derived output; `previewRestore`/`mergeRestored` preserve duplicates by default and block conflicts with all dirty draft IDs. BriefWorkspace alone commits merged records through its existing error/write-block handling. Restore never applies a dataset or analysis scenario.

F19's evidence proposal applies only to a real record with the exact stable/native IDs and a still-missing location. Data readiness previews it through `createLocationRevision` and the existing dataset comparison; Apply/Download remain explicit. The supplied snapshot is immutable, form drafts remain intact, and permit-area limitations stay attached to the cited suggestion.

## Selected national source expansion (F25–F27)

US-wide planned-transmission discovery is selected. Follow [coverage meanings/register](us-coverage/README.md) and F25/F26/F27. The runtime schema remains v1 until F26-C1 commits the selected source's shared contract; qualification is documentation/sample work, not permission to encode a new publisher as `desc` or `gpc`. All adapters share source/native identity independent of edition, explicit lifecycle, location role/precision and public provenance. Core remains the only calculation/eligibility implementation.

Connect the first qualified sample early, then complete the full usable public inventory and add distinct regional adapters. A pilot or same-source refresh does not complete national expansion. Coordinator alone integrates source-specific manifests into the common provider and maintained coverage register. Missing locations remain visible; existing assets and generation proposals never count as planned-transmission coverage.

F22/F23 map ownership, dependency handoff and public ProjectMap props are preserved. Map-ui continues against the agreed shared schema and separate synthetic fixtures; source adapters cannot edit map/demo files. Any required schema extension must preserve legacy consumer compatibility through the coordinator's shared migration/adapter before real integration. National ingestion scale is measured from the selected full inventory; keep synthetic fixtures realistic at that scale without mixing them into real results.
