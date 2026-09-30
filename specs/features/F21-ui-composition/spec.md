# F21 — Task-based UI organization

Purpose: make browsing, comparison and follow-through easier to scan by placing controls at their action scope, removing redundant bands and bounding content scrolling. Preserve current functionality, data, contracts, shadcn defaults and 100dvh layout. Current source is authoritative; no screenshot attachment was available to the coordinator, so do not claim screenshot findings.

Dependencies: integrated F14–F19. F20 remains independent and reserved to map-ui; no ProjectMap/map-view edits. Read the local composition guidance and existing app instructions. No preflight rerun.

## Ownership and shared agreement

- Coordinator: `App.tsx`, `features/home/HomePage.tsx`, `features/outcomes/OutcomesWorkspace.tsx`, `components/ui/dropdown-menu.tsx`, specs/instructions and README. Composition, merge and sole check owner. Other shared component/preset files remain unchanged.
- `ui`: `features/explorer/Explorer.tsx`, `ComparisonPanel.tsx`, `features/briefs/BriefWorkspace.tsx`, `features/scenarios/ScenarioControls.tsx`, `ProjectTimeline.tsx`, `changes/F21.md`.
- `core` (presentation assignment): `features/import/DatasetImport.tsx`, `features/briefs/RestoreBrief.tsx`, `features/readiness/ReadinessWorkspace.tsx`, `RevisionPreview.tsx`, `changes/F21-secondary.md`. No calculation, parser, storage, evidence-data or shared-schema edits.
- All app paths above are relative to `app/src/`. The UI worker explicitly released the coordinator/core files on 2026-09-30. Each worker uses its own existing worktree and new codex/F21 branch. This temporary assignment overrides earlier broad ownership only for these paths.

App places **Saved reviews** consistently in collection navigation and uses Explorer's existing `reviewsRequest` to open the single review owner. No second localStorage reader or second review instance. BriefWorkspace may add optional `saveActionTarget?: HTMLElement | null` and `hideReviewsTrigger?: boolean`; portal only its selection save/refresh action and associated status into a stable target passed through ComparisonPanel's existing `actions` slot. Existing use remains compatible. Keep store/dialog/scenario/draft owners mounted through navigation and collapse; keep storage errors reachable in review management and save feedback beside the action. Domain and ProjectMap props remain unchanged.

## Surface review and planned corrections

| Surface / primary task | Action scope | Visible/contextual/secondary placement | Source finding / correction |
|---|---|---|---|
| Shell navigation / choose work | Workspace destinations; collection mode, dataset and saved reviews | Destinations together; collection actions together with clear source/demo state | Saved reviews currently buried inside Explore. Add consistent navigation access using existing request. Keep existing purposeful pages. |
| Home / understand and enter | Workspace entry and explicit demo choice | Entry remains primary; supporting destinations secondary | Review emphasis/copy; retain working structure unless a concrete issue is found. |
| Outcomes / interpret evidence | Applied-scenario summary; candidate/item links; collection follow-through | Visible evidence limits and next actions; candidate details through Explore | Review label consistency and action emphasis, preserving canonical conclusions and no inferred benefit. |
| Explore results / browse | Collection tabs, query, filters and pagination | Browsing controls together above a single results scroller; pagination below | Current scenario/layout/save bands consume result height. Remove these bands; investigate tab overflow source and isolate tabs from content scrolling. |
| Explore workspace / choose analysis/view | Scenario affects whole analysis; timeline/layout affect the view | One workspace area outside browsing body; applied scenario readable; timeline state explicit; Reset layout inside labeled Layout menu | Current scope mixed with list filters. Reuse controls and preserve scenario drafts, list state and measured map occlusion. |
| Candidate/project detail / understand selection | Pair save/refresh, project evidence links, candidate navigation | Save beside selected pair; Back and Previous/Next retained; Evidence/Impact/Supporting retained | Current Save selected floats above results even without useful selection context. Keep metrics/uncertainty and both projects visible. |
| Evidence/Impact / assess provenance or hypothetical assumptions | Item evidence; pair-specific assumptions and scenario save | Source references and limitations with evidence; assumptions/results/save within Impact | Reviewed existing implementations: units, date kinds, missing values, hypothetical labels and per-pair drafts already have useful scope. Retain content and calculation structure. |
| Result rows / select evidence | Item selection | Consistent names/native identification; aligned center-distance and milestone-gap fields | Free-form metric sentence impedes comparison. Keep complete names, units, unknowns and location confidence; do not decorate every row. |
| Timeline/scenario / inspect dates or apply criteria | View and analysis settings | Explicit applied versus draft state; close/reset/apply in relevant context | Review labels and bounded body; retain milestone versus construction meanings. |
| Saved reviews / retain and compare findings | Collection selection/export/restore; item save/remove/show-current | Export with selected collection context; review save with item; Restore action in its tab | Review tab overflow, empty counts and export footer shown on irrelevant tabs. Preserve dirty drafts and restoration conflict rules. |
| Data readiness / improve evidence | Queue filters; selected project evidence; preview/apply revision | Queue controls stay with queue; selected limitations/actions stay with editor | Review repeated header counts, suggestion scope and scroll boundaries. Preserve evidence guards and unfinished forms. |
| Dataset revisions / preview/apply source change | Collection download/reset; incoming revision apply | Separate backup/reset from incoming revision controls; primary apply visible | Review nested table/body scrolling and destructive-reset grouping without changing validation. |
| Restore dialog / bring back findings | Collection import; duplicate replacement | File and restore action accessible; row decisions with incoming records | Review redundant counts/copy and bounded preview while retaining explicit conflicts and storage safeguards. |
| Map / explore geography | Map-local controls and selected geometry | Reserved to F20 | Source inspection only; preserve public props and account for new workspace control occlusion from Explorer. |

Workers report concrete secondary findings/corrections, including retained working surfaces, in PRs; coordinator updates this table if the final scope differs. Do not add changes just to make every row have a diff.

Implemented review outcome: navigation, results/detail controls, scenario status, timeline scrolling, review export context, readiness queues and revision/restore presentation received concrete corrections. Home kept its structure and omits Try demo when already in demo. Outcomes kept its conclusions and aligns pair metrics/labels. Evidence, Impact, RevisionPreview and the existing pages remain structurally intact. Tab overflow now belongs to padded, naturally sized wrappers rather than fixed-height TabsList elements; rows retain their separate scroller. Search remains mounted in Results, Detail and Collapsed. F20's independent map controls integrated without a composition contract change.

## Acceptance

1. Browse controls are grouped; results tabs and essential controls are outside the results scroller. Full names, native identifiers, comparable metrics and uncertainty remain accessible. No artificial reduction of type/spacing or hidden data.
2. Scenario, timeline and layout controls have understandable scope and state. Reset layout is secondary. Saving appears with selected comparison; Saved reviews is consistently reachable. No duplicated owner/store or loss of query/filter/tab/page/scroll/focus/drafts across existing navigation.
3. Secondary corrections follow the surface review above and preserve action targets, active/disabled states, errors and recovery. Existing presets, accessible component semantics and internal overflow remain intact.
4. Small compatible PRs integrate under coordinator ownership while F20 and unrelated evidence work remain free to continue. Receipts distinguish implemented behavior from actual checks.

## Bounded validation

Only coordinator runs at most one production build after composition, within five minutes; no duplicated typecheck/lint and no new framework. No calculation changes warrant a new core test. Review component lifetime, portal target, scroll boundaries and action scope in source. No Playwright/browser automation, screenshots, image analysis, visual verification or mobile audits. Do not claim source review proves usability or exercised interactions.

Actual result: one build passed at 1a518aa with the existing Vite-loader and bundle-size warnings. The same bounded milestone ran F20's one representative map-helper case successfully. No additional F21 tests or visual checks; interactions remain unverified.
