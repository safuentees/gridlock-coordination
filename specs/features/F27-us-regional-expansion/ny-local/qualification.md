# New York local-plan qualification

Public acquisition and meaning review on 2026-09-30 found a reproducible **National Grid New York October 2025 inventory: 152 source rows, with 136 nonterminal rows proposed for retention and 16 terminal exclusions**. It covers one utility's local plan, not all New York. No native coordinates or project-ID column are supplied. The six factual diagnostics in [sample.json](sample.json) are qualification examples, not an application dataset or producer.

## Source, edition and preservation

The [National Grid New York index](https://www.nationalgridus.com/Wholesale-Interconnections/New-York/) and [OASIS filings index](https://www.nationalgridus.com/Oasis/Filings-and-Studies) both link the [55-page 2025 LTP](https://www.nationalgridus.com/media/pdfs/microsites/wholesale-interconnections/national_grid_local_transmission_plan_2025.pdf). Its cover and page footers date the plan **2025-10-30**. PDF metadata says modified 2025-11-12; that is not a row-update or verified publication date. Retrieval is 2026-09-30. Proposed edition ID: `2025-10-30`; publication date remains unknown.

Untouched original: ignored root `inputs/originals/F27-ny-local/national-grid-local-transmission-plan-2025.pdf`, **3,532,098 bytes**, SHA256 `5f13264b522f017649867bc9f217568935a80f2a648c2d851c8aaccdcba27a33`. The public utility index, OASIS index and terms HTML are preserved beside it. Ordinary direct public download succeeded without credentials.

The linked [2026 criteria deck](https://www.nationalgridus.com/media/pdfs/microsites/wholesale-interconnections/2026-ng-ltp-assumptions-criteria.pdf), dated 2026-09-17, is **not a project inventory**. Page 5 references an August 20 LTP update, but the two live indexes still list the 2025 plan. Targeted public search did not locate that update within this pass. Thus this is the latest complete inventory located, **not a claim that no newer edition exists**. The criteria original is preserved as `national-grid-2026-criteria.pdf`, 864,580 bytes, SHA256 `62581cf4d383e71eee4165fd281ee9dcc49b9f760a81f1a05e1daa2ef9249c11`.

The assigned [Central Hudson April 2025 starting source](https://www.nyiso.com/documents/20142/50731925/07_Local%20Transmission%20Plan-2025%20April%20update.pdf/) was readable through public text retrieval and is a smaller, different utility scope. It was not combined with National Grid. Direct NYISO download returned an empty body; the utility mirror returned 212 bytes of HTML despite a PDF filename. That failed response remains preserved but is not represented as a valid original. Its table has generation retirements and edited dates, so it needs separate accepted mapping before ingestion.

## Scope, enumeration and identity

The selected plan's title and page 2 identify National Grid's New York scope (NYISO Zones A–F). Ten planning areas partition the table sequence. These area/county labels are source context, not a statewide project census or project coordinates. Central Hudson, Con Edison, NYSEG/RG&E, LIPA/PSEG and other owners are not covered merely by using a New York reporting label.

| Planning area | PDF project-table pages (one based) | Rows |
|---|---|---:|
| Frontier | 5–7 | 11 |
| Southwest | 9–10 | 10 |
| Genesee | 12–15 | 17 |
| Finger Lakes | 17 | 4 |
| Syracuse/Oswego/Cortland | 19–26 | 36 |
| Northern | 28–35 | 25 |
| Utica/Rome | 37–38 | 7 |
| Mohawk | 40–43 | 14 |
| Northeast | 45–46 | 9 |
| Capital/Hudson Valley | 48–53 | 19 |
| **40 table pages** | | **152** |

Each table has nine columns: project name, scope, driver, firm/non-firm, SIS, facilities study, Article VII, project status and expected in-service date. Count non-header body rows only. Other pages are cover, statistics, planning-area context or contacts; no other project table was found. Table text is machine-readable without image interpretation. Line-wrapped words sometimes join during extraction, so retain source cell text and normalize whitespace only; do not silently rewrite names or values.

There is **no native engineering-project ID column**. Names are unique in this edition, but that is not an identity guarantee. Proposed C3 `identityBasis=source-locator`, e.g. `sourceId=2025-p029-r03`, where row 1 means the first body row after the header. Keep edition/page/row evidence. Reuse only for this preserved edition; a later edition requires explicit identity review, never automatic title or ordinal matching. Queue references, line numbers and equipment labels are related identifiers, not row identities or parent projects. Do not collapse distinct rows sharing a corridor or infer cross-utility duplicates. `recordUnit=project` denotes the publisher's project-table entry, which can combine several assets; counts remain inventory records rather than deduplicated engineering projects.

## Lifecycle and complete retention proposal

| Exact project-status cell | Rows | Proposed treatment |
|---|---:|---|
| Planned | 90 | Retain, lifecycle planned |
| Under Construction | 15 | Retain, lifecycle under-construction |
| Concept | 28 | Retain, lifecycle unknown |
| N/A | 1 | Retain, lifecycle unknown |
| Initiated | 1 | Retain, lifecycle unknown |
| Application Deemed Complete | 1 | Retain, lifecycle unknown |
| In-Service | 12 | Exclude from nonterminal inventory; retain locator/reason in ledger |
| Cancelled | 4 | Exclude from nonterminal inventory; retain locator/reason in ledger |

Proposed reconciliation: **152 = 136 retained + 16 excluded + 0 failed + 0 pending**, with no deduplication. Retained lifecycle totals: 90 planned, 15 under-construction, 31 unknown. The status comes from its own column; firm/non-firm, completed studies and permit progress do not grant approval or construction status. Page 31 row 2 places a permit-like phrase in the project-status column; preserve the source anomaly instead of swapping columns or inventing lifecycle. All statuses are historical **as of the 2025-10-30 source edition**, never updated by an elapsed expected date.

All 136 retained rows have `MM/YYYY` expected in-service values, mapped to `YYYY-MM`, precision month, kind in-service. The four cancelled rows have N/A. No construction start/end columns exist: `constructionStart=null`, `buildWindow=null`. Preserve raw dates and field labels; no first-of-month day precision, invented construction duration or inferred completion.

## Transmission evidence, ownership and spatial eligibility

The plan includes mixed equipment work and customer interconnections. Neither its title nor a voltage cutoff proves every row is a transmission construction project. Two 34.5 kV breaker-only rows, mixed transformer/breaker work, distribution feeders and broadly described interconnections must keep their exact scope. Do not reclassify subtransmission/distribution by an invented voltage threshold, and do not equate a generation name with a generation-only scope when a physical interconnection is actually described.

A bounded, deliberately conservative C3 proposal can retain the full inventory without asserting unresolved kinds: **eight rows explicitly describe transmission lines or substations in their own name/scope** (p7/r1, p13/r4, p14/r5, p24/r1, p25/r1, p29/r3, p42/r3, p50/r2). These support `transmission-project`; retain the other **128 as planning-context** until more specific classification evidence is accepted. This eight-row set is a documented minimum, not a claim that the other 128 are non-transmission. Preserve mixed work in the evidence even for the eight. No new core eligibility rule is needed.

The utility index explicitly identifies Niagara Mohawk Power Corporation as owner of its New York transmission assets. That distinguishes the publisher's brand from a named legal owner, but the project table has **no row-owner field**, and some scopes involve customer, Avangrid or other assets. Proposed initial `inventory.owner=null` for every row rather than assigning NMPC globally from the masthead or inventing global owner IDs. Keep the index ownership statement as manifest context. A later row-specific ownership decision needs exact supporting evidence.

No table supplies latitude/longitude, georeferenced geometry, CRS or accuracy. Overview maps and locality names are not native project centers. Proposed `location=null`, `nativeGeometry=null`, `centerRole=unknown`; do not geocode, digitize map imagery or use planning-area centroids. Consequently **zero located and zero spatially eligible records** are expected, regardless of kind/lifecycle. The useful product gain is searchable, dated planning inventory and evidence follow-up, not new proximity matches.

## Remaining C2/C3 field choices and handoff

- Coordinator assigns source/reporting IDs (suggested `ny-national-grid-ltp`) and a label explicitly limited to National Grid's New York local plan.
- Keep name, scope, firm flag, driver, study and permit states as attributed source facts/evidence. Preserve labeled queue/equipment references without parent inference.
- `lifecycleAsOf=2025-10-30`, `lifecycleDateMeaning=source-edition`, `sourceUpdatedOn=null`; source date is separate from retrieval.
- The table has no state column: `sourceState=null`; the explicit New York footprint belongs in manifest scope. `sourceLocation` may preserve planning-area and named place text with its field/page label, never coordinates.
- Only one date milestone is supplied per row. Preserve its expected in-service meaning; no other milestones or costs are inferred.

[National Grid's US terms](https://www.nationalgridus.com/our-company/terms-conditions), “Use of Site and App,” permit informational use while restricting other reproduction/distribution and commercial use. No open-data license was found. This package records factual qualification and locators; it does not grant permission to republish the PDF or promise that a full derived commercial dataset is licensed. Keep that concrete reuse limitation in source acceptance rather than treating public download access as an open license.

Coordinator handoff: accept the precise historical, utility-limited scope and conservative kind/owner mapping, or require the referenced newer inventory before production; resolve the intended factual-reuse basis before a full republishing decision. No producer has started. Once accepted, connect six retained real examples before the complete 136-record normalization and retain the full 152-row ledger. No app/shared/core/UI changes, builds, tests, browser automation or visual checks were made.
