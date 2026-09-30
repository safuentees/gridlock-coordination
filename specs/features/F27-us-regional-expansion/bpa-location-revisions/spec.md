# F27-BPA-E2 — Preview useful native map locations

Purpose: let an analyst explicitly add cited map context for Keeler, Olympia compensation and Schultz capacitors while preserving the distinction between a displayed pin and a qualified project center. Depends on the six-decision F27-BPA-E1 report and the shared exact-baseline helper. No new source retrieval, schema, calculation, map or dependency change.

## Accepted evidence and limits

Coordinator accepts three **general-pin**, unverified existing-yard locations, not the report's proposed substation-center interpretation. The public layer permits a yard center or baseline intersection and does not distinguish them per feature; accuracy and equipment/construction position are unknown. Runtime `location.method` is source-point; both `inventory.centerRole` and nativeGeometry.role are general-pin. Existing core excludes this role regardless of any later owner evidence. Keeler/Olympia/Schultz coordinates exactly retain the source-server EPSG:4326 response, with original WKID 102100/3857 documented. Never average, geocode, infer equipment sites or upgrade confidence.

The source-locator Olympia child and aliases stay unchanged. Buckley (old yard versus new station), Bonanza (Ponderosa versus planned Bonanza), and Pearl (one part of multifacility scope) remain unlocated, with concise source-linked hints. No lifecycle, owner, date, cost, build window or bundled record changes. Qualifying public map context does not increase the number of comparison-eligible records or prove coordination benefit. The E1 artifact stays unchanged as the research proposal; this contract is the authoritative narrower acceptance.

## Frozen interfaces and ownership

| Owner | Exact files | Work |
| --- | --- | --- |
| coordinator | `app/src/data/evidence/f27-map-location-proposals.json`, `app/src/data/evidence-baseline.ts`, `app/src/data/owner-proposals.ts`, specs/register, `changes/F27-bpa-location-revisions.md` | Accepted values, shared guard, contract, integration and sole bounded check |
| core | `app/src/data/map-location-proposals.ts`, `changes/F27-bpa-map-helper.md` only | Guarded proposal/hint lookup and normalized revision helper; no calculation changes |
| ui | `app/src/features/readiness/ReadinessWorkspace.tsx`, `app/src/features/readiness/RevisionPreview.tsx`, `changes/F27-bpa-map-ui.md` only | Suggested evidence, preview/apply/download and unresolved hints |
| source_discovery | F27-BPA-E1 report/sample/receipt only | Completed source evidence; no runtime changes |

Workers branch from this contract commit in retained separate worktrees. Coordinator keeps merge and check ownership. Core/UI implement in parallel against this interface; no worker builds/checks, map edits or shared-file expansion.

`map-location-proposals.ts` exports:
- `MapLocationProposal`: parsed accepted entry with `decisionId`, `projectId`, `expected: Project`, `location: NonNullable<Project["location"]>`, `nativeGeometry`, `centerRole: "general-pin"`, `locationAssumptions: string[]`, `caveat: string`, `limitations: string[]`.
- `getMapLocationProposals(dataset: Dataset): MapLocationProposal[]`.
- `createMapLocationRevision(dataset: Dataset, decisionId: string, generatedAt?: string): Dataset`.
- `getMapLocationResearchHint(dataset: Dataset, project: Project): {projectId, expected, reason, needed, evidence: SourceRef[]} | null` (type may be exported).

Use existing Zod Project/location/nativeGeometry schemas for JSON validation and the `matchesEvidenceBaseline` shared helper. Require real mode, exact project ID/full baseline except notes, still-null location and nativeGeometry. At application and download, recheck against the current dataset and reject changed source/evidence; no overwrite of a prior revision. Preserve all analyst notes and append the caveat/limitations without duplicates; merge assumptions without duplicates. Replace only location and inventory's nativeGeometry/centerRole/locationAssumptions. Preserve every other field, unrelated records, dataset manifests and snapshot; run the normal `parseSourceDataset` boundary. Never mutate arguments. Unknown decision IDs and demo application fail clearly. Hints obey the same real/baseline/missing-location guards; they never propose or apply a coordinate.

## UI and completion

Add the three proposals to the existing Suggested evidence queue and location-suggestion ID set (deduplicate project IDs); retain the owner and legacy location suggestions. A concise card says the yard pin is for map context and cannot qualify a candidate, with **Preview map location**. The existing preview uses a `map-location` kind, exact selected project/dataset identity and proposal ID. It is independent of unsaved location draft values, like ownership evidence. Preview/apply/download leave the form draft untouched and preserve mode/project/queue/page/search behavior; re-run helper on apply and download. Dataset changes invalidate previews. Do not change storage or invent a second Apply flow.

RevisionPreview shows current/proposed evidence, general-pin role and concise material limitations, plus source links in the existing details area. Its new-location wording must not falsely say the original record already had these published positions. Existing manual revision still preserves native positions and resets center role to unknown; ownership wording and planned-owner qualifier remain intact. Add the three unresolved reasons/needed evidence beside their records, with sources behind a labeled details control. No new dialogs/tabs/pages or extra icons. Preserve shadcn defaults, internal scrolling, primary actions, raw source notes/exports and demo separation.

Observable completion: three guarded source-only suggestions can each preview/apply/download; the bundled 14,923 records and 113 mapped locations remain unchanged until explicit application. All three applications yield 116 displayed locations with ten eligible records and six unchanged candidates. Three withheld records remain null. Stale source/evidence or manual locations block application; analyst-only notes survive. Native CRS/accuracy/role/evidence survive normalized import and saved snapshots. One sole coordinator build plus one representative revision/round-trip/guard/eligibility case within five minutes. Source inspection only for UI state wiring; no browser, screenshot, visual/mobile, persistence-interaction checks or new infrastructure.
