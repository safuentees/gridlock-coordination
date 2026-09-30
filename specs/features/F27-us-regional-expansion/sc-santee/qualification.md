# Santee Cooper public transmission qualification

Recommend a **declared public-source union**, pending coordinator acceptance: the complete 23 named projects in the 2025 IRP transmission appendix and all 12 cards in the current Power Line Projects index. Proposed reconciliation is **35 source observations = 24 retained observations + two explicitly concluded projects + nine supporting pages that create no extra runtime record**. All retained observations describe transmission work; all remain unlocated and have unknown per-project owners. Possible corridor overlap means 24 is not a count of unique engineering projects or full utility/statewide coverage.

## Scope and edition evidence

The official [IRP library](https://www.santeecooper.com/about/integrated-resource-plan/) links the [2025 IRP Update](https://www.santeecooper.com/About/Integrated-Resource-Plan/presentations/Santee-Cooper-2025-IRP-Update.pdf). **Appendix B, PDF pp.94–98 / printed pp.87–91**, lists 17 Active and six Planned projects. Enumerate each named heading once, including continuations across pages. The library describes an initial September 16, 2025 filing, but the downloaded document bears an **SCPSC November 21, 2025 filing stamp**; preserve both instead of relabeling the file as the September version. This is a useful finite appendix, not the complete transmission capital register. The 2026 triennial IRP is described as being developed; no newer completed transmission appendix was identified in this bounded pass.

The [Power Line Projects index](https://www.santeecooper.com/community/power-line-projects/) has exactly 12 cards and directly linked project pages. Nine correspond to IRP named scopes and provide supporting evidence. The three additional page observations are Indian Field–Sugar Hill, Varnville–Robertville and Indian Field–Varnville. The last may overlap the IRP's Seaboard–Indian Field corridor, but endpoint naming differs and there is no engineering-ID crosswalk. Preserve both observations with an explicit possible-overlap note, not a forced merge or unique-project claim. The Marion–Conway page also discusses the associated Conway switching station; the separately listed IRP station remains its own unit.

The [2026 Generation, Transmission and Distribution Report](https://www.santeecooper.com/Rates/Rate-Study/_pdfs/RatesDocuments2026/Generation-Transmission-and-Distribution-Report.pdf), linked from the [public rate study](https://www.santeecooper.com/rates/rate-study/), supplies four transmission approval/pending bullets on **pp.10–11**. Each corresponds to an already enumerated scope, so they add evidence, not four more records. The financial report gives aggregate capital categories rather than another finite named-project inventory. Generation, distribution, model portfolios and capital totals are outside this selected transmission scope.

Propose source/group `sc-santee`, edition `public-plans-snapshot-2026-09-30`. The composite snapshot has no single publication date: publishedOn null, retrievedOn September 30, 2026. A snapshot-observed lifecycle date must visibly retain the older IRP/undated-page context and never imply that all statuses were updated in September 2026. Complete URLs, file hashes and all 35 row locators/dispositions are in sample.json.

## Status and identity proposal

| Evidence | Proposed treatment |
| --- | --- |
| IRP Active / Planned without stronger evidence | Planned; Active does not establish physical construction |
| Johns Island and Conway–Perry Road pages explicitly say work concluded | Exclude the two matched IRP units; actual completion date remains unknown |
| Report records certificates for Indian Field–Wassamassaw, Kingstree–Hemingway and Indian Field–Sugar Hill | Approved, with the reported decision dates kept separately; not construction |
| Marion–Conway FAQ says clearing began April 2022, alongside constructing wording | Historical under-construction claim, snapshot-observed with stale/contradictory timeline caveat; does not verify current construction |
| Generic constructing copy contradicted by future design/construction schedules | Planned; no physical progress inferred |

Under that conservative proposal the 24 retained observations are **20 planned, three approved and one historical construction observation**. The three approval dates are November 7, 2025; April 10, 2026; and February 13, 2026 respectively. Cross–Wassamassaw remained pending in the report with a May 5 hearing forecast; a past hearing date does not establish approval. The coordinator may keep Marion–Conway unknown if the product requires current construction confirmation; that would change only its lifecycle, not retention.

No native engineering IDs are supplied. Use stable named-heading references `irp-appendix-b:<heading-slug>` and page references `power-line-projects:<page-slug>`, labeled source-locator identities. Docket/order numbers identify regulatory proceedings and must not masquerade as engineering IDs. One named package stays one record even when it includes two circuits, phases or an associated substation. Nine matched website rows are explicit supporting-observation exclusions linked to their primary IRP source reference. Do not merge into Dominion/CTPC records by similar names.

## Dates, ownership and geography

IRP completion years are **completion forecasts, kind unknown**, not automatic in-service dates. Six Planned headings supply no date. Explicit website service targets may retain their stated day/month precision with forecast labels; no Santee source rule found establishes that June 1/December 1 are placeholders, so CTPC's separate rule must not be imported. Coarse construction ranges, spring/winter labels and phase durations remain supplementary text/year milestones; buildWindow and constructionStart stay null rather than inventing boundary days.

Important cases are carried into the six diagnostics and ledger:

- **Bluffton Phase 2:** IRP completion 2030 conflicts with the undated page's June 1, 2028 service target; county wording also differs. Keep primary comparison date unknown and both forecasts as labeled evidence pending a dated authoritative revision.
- **Varnville–Robertville:** existing/title voltage 69 kV differs from the new 115 kV scope. July 2026 is projected construction end; December 23 is administrative wrap-up, not energization. Neither elapsed date proves completion.
- **Marion–Conway:** the page contains multiple old construction forecasts and makes service dependent on the switching station. Its explicit April 2022 clearing statement supports historical work only; station-timeline dates are not actual commissioning confirmations.
- **Marion–Red Bluff:** its page has conflicting start ranges and an inverted June 2025–May 2025 clearing interval. Preserve these as source discrepancies; never manufacture a window. December 2028 is an explicit forecast service month.
- **Indian Field–Sugar Hill:** one two-line-plus-substation package; winter 2026 is approximate completion, not a precise day. Approval is distinct from construction.

**All owners remain null.** The 2026 report **p.4, Transmission**, explicitly describes an operated network containing both Authority-owned and Central-owned lines. Santee Cooper publishing, planning, obtaining a certificate or operating the system does not establish ownership of every named package. A served cooperative, landowner or contractor is not the project owner. Record Santee Cooper as sponsor/proponent context only until equipment ownership is supplied.

No native numerical project coordinates, CRS or accuracy were acquired. Images, interactive maps, venues and text place names were not converted into geography. Preserve named endpoints/counties as source context without resolving inconsistent locations. The remaining material inputs are a current public engineering register with project IDs, ownership and status dates, plus a Seaboard/Indian Field/Varnville crosswalk and a dated Bluffton schedule revision.

## Reproduction and limits

All originals remain unchanged outside Git under `inputs/originals/F27-sc-santee/`. Primary IRP: **7,568,271 bytes**, SHA256 `dc4f715aa51e4a201e36c06692728c8a845f0b417b1202e27d1d008e8e1a4774`. Index: **48,931 bytes**, SHA256 `39373bb945294206ef4eeb5f2c84494c56ad817d316cd332899a1a49caed42f2`. Supporting 2026 report: **490,548 bytes**, SHA256 `0394d5a775c172cbbb18c7963a8109365aec5453e44e5cc1d81c1349240ffb19`. sample.json includes all 17 artifact hashes, 35 exact locators and six retained diagnostics. PDF layout extraction warned about rotated filing text; ordinary text extraction recovered the filing stamp and complete selected appendix. No images were read and no restricted marking was found in the selected report text. Public accessibility is not a blanket redistribution license.

The source pass ran **September 30, 2026, 11:49:47–11:55:00 UTC: 5.2 minutes** of the 15-minute ceiling. No SERTP document, login, private source, bypass or external contact was used. Contact/person details stay out of the delivered facts and runtime proposal. No producer or worker checks ran; production remains pending coordinator acceptance.
