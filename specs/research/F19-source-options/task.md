# F19-R1 / F25 — Qualify the first source for selected US expansion

Status: F25 completed and selected SCE `ca-sce-tpr` / `2026-06-01` through PR56. See recommendation and source-options for the six records, full enumeration and timing overrun. US-wide planned-transmission discovery remains incomplete; F26 is now the implementation handoff. Prior coordinator-screening active time was not recorded; reuse that screening and cap the first new active qualification pass at 20 minutes, recording elapsed time and that uncertainty without resetting the cumulative 60-minute ceiling.
Owner: `source_discovery` (existing data/research worker). Coordinator owns this brief, selection, shared contracts and integration.
Parent evidence: [F19](../../features/F19-evidence-led-discovery/spec.md) is complete: ten decisions, one guarded Okatie permit-area suggestion and nine unresolved records. Reuse them without reopening that batch. [F25](../../features/F25-source-qualification/spec.md), F26 and F27 now govern qualification, full inventory and national expansion. This file integrates the relevant source screening and interface reasoning from commit `34f1c63`.

## Decision and unchanged budget

Compare three approaches on user benefit, usable geographic coverage, authority/quality, available fields, missing information, integration effort and a demonstrable first import:

1. Enrich the existing projects with defensible location evidence.
2. Import a coherent regional inventory of planned transmission projects with usable locations.
3. Establish a repeatable path toward the selected US-wide planned-transmission goal. Compare implementation paths, not whether national expansion is selected.

The supplied baseline at `03a7cc4` has 252 projects: 44 Dominion and 208 Georgia; five per filing are located, all unverified. Thus only 25 of 9,152 cross-filing pairs are geographically assessable. These are coverage counts, not candidates or benefits. There are 242 missing locations, 251 day-precision milestones and no explicit construction windows. Assess current evidence work before repeating any of these investigations.

Keep the existing ceiling: **60 minutes total active source-selection research, three authoritative source families and at most ten representative records across all approaches combined**. This amendment does not reset the clock or grant a fresh ten-record quota. Reuse existing F19 records, findings and coordinator screening below; record time already spent and use only the remainder. If exhausted, synthesize evidence already collected and name unresolved gates. The completed F19 batch retains its original scope and ownership; do not create a duplicate evidence batch. This timebox applies only to source selection. It does not cap full-inventory ingestion, later adapters or the national product goal.

The three families are existing-project primary evidence (utility publications/public permits), regional transmission planning/reporting, and federal nationwide inventories. Within remaining time, use one regional lead plus one fallback only if the first is inaccessible. Do not exhaustively survey operators or build scrapers during research. Nationwide evaluation is a repeatability assessment using the same regional evidence and one national comparator, not a new nationwide extraction exercise.

Use public text, tables or documented APIs. No restricted/CEII material, access bypass, bulk geocoding, guessed coordinates, visual inspection or screenshots. Preserve originals. Separate project plans, existing infrastructure, generation proposals and completed/cancelled projects. Existing assets can support an identity match; their existence does not establish a future project, route or construction interval.

## Initial comparison and recommendation

This is coordinator screening from official source descriptions on 2026-09-30, not the worker's completed sample report. Geographic claims below describe published scope; usable coordinate coverage remains to be measured. Effort ranges are preliminary one-worker engineering estimates after source access and field mapping, not extra research budget or delivery promises.

| Approach | Decision value and usable geography | Source/fields and remaining gaps | Small demonstration and estimated effort |
|---|---|---|---|
| Enrich existing projects | Directly brings currently excluded Dominion/Georgia records into geographic screening; stays within two supplied inventories. Manual identity research may yield few locations and does not refresh historical schedules. | Reuse F19 public evidence: native identity, cited point/endpoints, location role and match rationale. F19 yielded one supported permit-area suggestion and nine unresolved records; coordinates are not automatically confirmed. | Apply 1–3 supported revisions from the existing batch, preserving unknowns. About 2–6 hours for a batch adapter/revision handoff if evidence is already complete; unresolved matching is outside that estimate. |
| Regional planned transmission | Strongest near-term expansion: users can investigate a coherent regional pipeline, potentially across several owners, instead of only a few seed locations. Regional scope alone does not establish comparable pairs or sufficient precision. | California public TPR reports are the primary lead; MISO MTEP is a fallback with documented general-location pins. Verify downloadable public records, native IDs, owner, status, milestone meaning and point precision before choosing. Neither source's usable coordinate count has been established here. | Import 6–10 records from one public edition, preferably two owners, including one missing/ambiguous-location case. About 2–4 engineer-days including shared identity/coverage contract, adapter and retained-work integration if public structured fields suffice; manual PDF/permit joins increase effort. |
| Repeatable national path | Highest eventual reach; establish it by repeating a regional adapter and edition manifest. A nationwide asset map is not nationwide future-project coverage. | Federated transmission sources need stable IDs, comparable lifecycle/date/geometry meaning, overlap handling and refresh provenance. EIA-860 is a national planned-generation comparator, not a substitute transmission-project inventory. | After qualifying and importing the first full usable public inventory, add a distinct regional adapter with the same contract; a same-source refresh does not count as geographic expansion. About 1–3 days for a small accessible compatible adapter after shared foundations; full inventory effort depends on actual volume and joins. National rollout cannot yet be estimated credibly. A one-state EIA Proposed slice is an alternative 1–3 day adapter experiment only if generation scope is selected. |

**Selected direction:** US-wide planned-transmission discovery, delivered through F25 source qualification, F26 full usable public inventory and F27 additional regional adapters. California TPR is the first screening lead, MISO a fallback; neither is selected for production until representative public rows prove access, project identity and usable location meaning. Prefer sources with actual planned-project locations. A pilot qualifies a source and connects an early sample; it is not the final inventory or national deliverable.

If qualification is blocked at the research limit, record the exact blocker and viable alternatives. Preserve the integrated F19 suggestion, but do not count it as national expansion. Generation inventories remain comparators and are not part of the selected transmission inventory. A refresh of one source improves freshness, not geographic coverage.

### Reusable authoritative leads

- [California Energy Commission project tracking](https://www.energy.ca.gov/programs-and-topics/topics/california-transmission-system/tracking-and-approving-transmission) describes public biannual TPR reporting for active transmission developments, covering CAISO-approved projects and utility repair/replacement projects. [CPUC TPR](https://www.cpuc.ca.gov/industries-and-topics/electrical-energy/electric-costs/transmission-project-review-process) links public versions for PG&E, SCE and SDG&E and distinguishes confidential material. Confirm location fields in a public export; report descriptions alone do not establish coordinates. Do not pursue NDA material. These public reports also contain historical/current/forecast projects: filter using stated lifecycle, not a date guessed to indicate completion.
- [MISO MTEP Portal FAQ](https://help.misoenergy.org/knowledgebase/article/KA-01438/en-us) documents downloadable projects/facilities, lifecycle updates and latitude/longitude pins, explicitly general rather than precise locations. Portal access is required; an anonymous public spatial export has not been verified. Do not classify these pins as confirmed asset centers or route geometry. Unknown spatial error may limit their use to contextual display rather than a precise radius threshold.
- [EIA-860 detailed data](https://www.eia.gov/electricity/data/eia860/index.php) publishes annual downloadable tables with separate Proposed, Operable, and Retired/Canceled generator categories and plant/utility data. This is a national generation inventory. Verify current-edition layout, plant-coordinate joins and missingness before recommending a planned-generator sample. Keep planned generators separate from existing plants/units and from transmission expansion; do not count plant coordinates as evidence for a transmission build.

These are leads with observed semantics, not an authorization to fetch private data or a claim of record-level validation. The researcher should start from them and existing F19 findings instead of repeating discovery.

## Separate owned outputs and observable completion

Only `source_discovery` edits:
- `specs/research/F19-source-options/source-options.md`
- `specs/research/F19-source-options/representative-records.json`
- `specs/research/F19-source-options/recommendation.md`

Coordinator owns this task and the roadmap. Do not edit UI, originals/baselines, schemas, calculations, ingestion scripts or existing F19 proposal files in this deliverable. Reuse/link existing evidence rather than moving or overwriting it.

Return one compact comparison plus:
1. **Source options:** exact publisher/URL/locator, edition date versus retrieval date, public access/reuse conditions, format, stated cadence, geographic extent and record type. State observed sample counts separately from advertised inventory size; give missing-location rate only for inspected rows. Distinguish authoritative identity from coordinate precision and current status.
2. **Representative records:** at most ten total, reused where possible. Include `approach`, `sourceFamily`, native ID, existing `projectId` or null for new records, exact citation, raw useful fields, normalized candidate fields, explicit planned/existing/unknown classification, location role/method/precision, match evidence, missing fields and next question. A new record is not forced to match an existing project. Failed access yields an unresolved source decision, never a fabricated example.
3. **Fields and missing information:** publisher/reporting group versus asset owner, project identity/scope, voltage, region, source edition, raw and normalized lifecycle, milestone type/precision, explicit construction bounds if stated, geometry/CRS and geographic uncertainty. Explain which decision each field supports. Existing asset points and permit-area centers need a cited project relationship.
4. **Recommendation:** select the strongest first source for the approved expansion, or document a qualification blocker. Give a named source/edition and small sample manifest when supported, expected newly assessable records without assuming useful proximity pairs, integration prerequisites, extraction/normalization/integration effort ranges and refresh path. Compare national generation expansion honestly against regional transmission usefulness.

Complete when the coordinator can select a bounded import without guessing access, source authority, coordinate meaning, joins or lifecycle. Report unresolved questions at the budget limit. A blocked qualification report is acceptable at the research limit, but is not successful source qualification or completion of national expansion.

## Shared interface proposal — agree before implementation

These are proposed contract requirements, not schema edits or permission to implement competing interfaces.

**Existing-record enrichment:** retain Dataset/Project/SourceRef v1 and the current location proposal envelope (`projectId`, native `sourceId`, expected-current-location guard, caveat, `LocationEvidenceDraft`). The consumer uses `createLocationRevision` and existing preview/apply. Locations remain unverified; do not silently change dates/status from a location notice.

**Regional/new records:** `Project.utilityId` is currently the two-value filing group `desc|gpc`, and the canonical engine excludes pairs with equal `utilityId`. A regional publisher cannot be substituted for all asset owners, nor can every owner be invented as a different filing. The coordinator/core agreement must separate these meanings before adding records:

| Contract element | Meaning and producer/consumer responsibility |
|---|---|
| Source/edition manifest | Stable source key, publisher, edition ID/date, retrieval date, public URL/locator, declared region, record kind, acquisition method and observed imported/missing counts. Do not use generation timestamp as source freshness. |
| Stable identity | Source key + native project ID; edition separate from persistent identity. Explicit cross-source links require evidence; no automatic name-only merge. Preserve legacy IDs and saved findings. |
| Ownership and eligibility | Distinct reporting group, planning region and listed owner/sponsor (nullable). Agree a named pair-eligibility policy and its explanation; migrate legacy data without changing existing cross-filing results. No second distance/ranking engine. |
| Project kind/lifecycle | Transmission project versus generation proposal versus existing asset; preserve raw source status and normalized planned/approved/under-construction/in-service/cancelled/unknown with its source date. Unknown stays unknown. Existing assets are contextual evidence, not future opportunities. |
| Location evidence | Original geometry/type and CRS when supplied, derived WGS84 point only by an agreed method, point role (asset center/endpoint/permit-area/general pin), precision or unknown, source references and confidence. County/region centroids cannot silently become project centers. Define eligibility for approximate locations before radius matching. |
| Dates | Existing date kind/precision and nullable construction window continue. Preserve source milestone meaning; no conversion of need/in-service dates into build intervals. |
| Reviewable import envelope | Manifest + new/changed/unresolved records + citations + expected baseline/edition guard. Preview additions, revisions and identity conflicts before applying; retain real/demo distinction, local revisions and saved drafts. Missing from a new edition does not automatically mean cancelled. |

Coordinator commits the final additive schema/version and legacy migration/consumer contract first if required; schema v1 is not stretched to encode false identities. Keep full original geometry in source artifacts until geometry consumers are deliberately selected. National repeatability uses source/edition manifests and the same normalized boundary, with a coverage register distinguishing imported, located, comparable, stale and unsupported regions. It is not a new backend or a full national platform build.

## Selected implementation sequence and execution

The prior conditional F19-C1/I1/I2/R2 proposals are superseded by the concrete selected increments in [F25](../../features/F25-source-qualification/spec.md), [F26](../../features/F26-full-public-inventory/spec.md) and [F27](../../features/F27-us-regional-expansion/spec.md). In particular, F26 requires the full usable public inventory after early sample integration; F27 requires additional regional coverage, not a second edition of the same source. The [US coverage register](../../us-coverage/us-register.json) records actual imports and unresolved areas.

After source selection, the coordinator fixes the source slug/edition, exact adapter and consumer paths, shared runtime contract and owner handoffs before assigning implementation. Producer and consumer preparation can proceed in parallel after the contract lands; connect the small real batch immediately and keep processing the full inventory. Independent later adapters use separate branches/worktrees and source-specific output directories. The map owner continues F22/F23 against the shared Project interface and isolated synthetic data; ingestion does not edit map or demo files.

Owner assignment is recorded here, not proof of dispatch. This side conversation cannot launch or message workers. The main coordinator resumes the existing source owner, records source choice and proceeds with selected F26/F27 work without treating every adapter as a new product-scope decision. Use the project remote and existing authorized small PR/merge workflow; no template-remote push, branch deletion or history rewrite.

Only the named coordinator checks integrated runtime changes within the existing five-minute nonvisual budget. Documentation needs no build. No Playwright, screenshots, image analysis, visual verification or mobile audits. Report actual source coverage and blockers at each integration; a completed pilot or refresh never closes national expansion.
