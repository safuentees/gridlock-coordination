# PacifiCorp public planning qualification

Two separately reproducible scopes are useful: **18 current featured website entries, with 10 proposed retained**, and **20 historical local-improvement entries in the March 2025 IRP, with 14 proposed retained**. These are source records, not a deduplicated utility/state project census. Six factual diagnostics and hashes for every preserved input are in [sample.json](sample.json). No producer has started.

## Public inputs and editions

The [project index](https://www.pacificorp.com/transmission/transmission-projects.html) links six other projects and the [Energy Gateway program](https://www.pacificorp.com/transmission/transmission-projects/energy-gateway.html), whose structured list contains 11 segment entries. Its four detail pages and the linked E8 child provide explicit project/segment text. The original program total and navigation sections are containers, not extra imported projects.

The [IRP index](https://www.pacificorp.com/energy/integrated-resource-plan.html) identifies the [2025 Volume I](https://www.pacificorp.com/content/dam/pcorp/documents/en/pacificorp/energy/integrated-resource-plan/2025-irp/2025_IRP_Vol_1.pdf) filing as **2025-03-31** and directly links the newer [2025 IRP Update](https://www.pacificorp.com/content/dam/pcorp/documents/en/pacificorp/energy/integrated-resource-plan/2025-irp/2025_IRP_Update.pdf), filed **2026-03-31**. Both public PDFs were preserved without credentials. Website observations were acquired **2026-09-30**, but individual pages retain older or absent update labels; observation date does not establish fresh project status.

| Preserved original | Bytes | SHA256 |
|---|---:|---|
| `transmission-projects.html` | 44137 | `80d201e1159e1119ed30fb27df12b2310f6e74ead55678f23134f76e9f75cdc3` |
| `energy-gateway.html` | 39588 | `0dc2c87bba893c4a803718a9588738f71124e7f2f7aafbf9f175fdaed83a5bcf` |
| `2025_IRP_Vol_1.pdf` | 14075881 | `c540ce2974d538f5f6305794700026298f529aae237469dab1f4280a8eb5da64` |
| `2025_IRP_Update.pdf` | 14089517 | `e79300d73a910433791d3e35647ae826f0cdadfd47204ecbdddeafe0f57676de` |

Untouched inputs are ignored under root `inputs/originals/F27-pacificorp-plan/`; the sample source catalog records all 17 acquired PDF/HTML originals, exact URLs, sizes and hashes. Contact sections, meeting access details and hidden document metadata are excluded from derived facts. No maps or images were interpreted.

## Scope A: current featured project pages

The declared boundary is the **11 structured Energy Gateway segment entries + six Other transmission line project rows + the explicitly linked E8 child = 18 entries**. Repeated links to the same project page are evidence references, not extra rows. In particular, the Segment B maintenance page is linked from both the index and Gateway Central and appears once. Components/phases within a retained entry remain bundled; no guessed child inventory is generated.

| Declared entry | Source locator | Proposed disposition |
|---|---|---|
| A Wallula–McNary | Energy Gateway list; West of Hemingway / Completed segment | Exclude: explicitly completed January 2019 |
| B original Populus–Terminal | Energy Gateway list; Gateway Central / Completed segments | Exclude: explicitly in service November 2010 |
| C Mona–Oquirrh | Energy Gateway list; Gateway Central / Completed segments | Exclude: explicitly in service May 2013 |
| C Limber–Terminal | Energy Gateway list; Gateway Central / Segments in progress | Retain physical segment; November 2030 service forecast |
| D1 Windstar–Aeolus | Energy Gateway list; Gateway West / D1 | Exclude: explicitly completed November 2024 |
| D2 Aeolus–Bridger/Anticline | Energy Gateway list; Gateway West / D2 | Exclude: explicitly completed/energized 2020 |
| D3 Bridger/Anticline–Populus | Energy Gateway list; Gateway West / D3 | Retain physical segment; 2034 at earliest on page, conditional timing |
| E Populus–Hemingway aggregate | Energy Gateway list; Gateway West / Segment E | Exclude imported aggregate; retain context/parent relationship for E8 |
| F Aeolus–Mona/Clover | Energy Gateway list; Gateway South / Completed segments | Exclude: explicitly completed November 2024 |
| G Sigurd–Red Butte | Energy Gateway list; Gateway South / Completed segments | Exclude: explicitly completed May 2015 |
| H Boardman–Hemingway | Energy Gateway list; West of Hemingway / Segment in progress | Retain physical proposal with conditional website context; projected late 2027 |
| Apex–Maverick | Other projects row; apex-to-maverick / description and Preliminary project schedule | Retain planned physical line; construction 2027–2029 is not an explicit service event |
| Black Rock–Sigurd | Other projects row; black-rock-to-sigurd / About and Project timeline | Retain planned physical line; anticipated service 2027 |
| Blueprint South | Other projects row; blueprint-south / opening scope and Preliminary project schedule | Retain one proposed physical multi-asset project; construction 2030–2033 is not an explicit service event |
| Honeyville–Populus and Threemile Knoll maintenance | Other projects row; segment-b-honeyville-populus-threemile / overview and phases | Retain one two-phase maintenance project; overall completion 2030 |
| Spanish Fork–Mercer | Other projects row; spanish-fork-to-mercer / overview and Project map | Retain planned physical line; index timeline is not an explicit service event |
| Three Peaks–Purgatory Flat | Other projects row; three-peaks-to-purgatory-flat / equipment facts and timeline | Retain planned physical line; detail explicitly forecasts service 2033 |
| E8 Midpoint–Hemingway child | Gateway West / E8 link; segment-e8 / scope and Project timeline | Retain child instead of E aggregate; June 2030 service forecast |

Reconciliation proposal: **18 = 10 retained + seven completed exclusions + one aggregate-parent exclusion**. This does not claim the unenumerated remainder of Segment E is absent. Its full scope and uncertain timing remain contextual evidence; importing its parent total alongside E8 would inflate projects. Old Wallula–Walla Walla extension and former Gateway H configurations are historical narrative context, not additional structured entries in this declared list.

All ten retained entries have actual physical transmission scope. Proposed lifecycle is planned for nine; H remains unknown under the website's explicit alternative-selection language until coordinator chooses a source precedence policy. None is approved/under-construction merely because permits exist or a forecast start has passed. The March 2026 update separately reports H under construction; that later fact must retain its own edition rather than silently changing this webpage's meaning.

The ten records support five year dates (Black Rock, maintenance B overall, Three Peaks, earliest D3, H), two month dates (Limber and E8), and three unknown service dates (Apex, Blueprint, Spanish Fork). Keep earliest/late/quarter wording. Generic index timelines and construction-year endpoints are not service milestones. Construction bounds are at month/quarter/year precision, so the existing day-precision construction fields remain null.

### Concrete disagreements to preserve

- Maintenance B phase 1: dedicated page says end of 2028, Gateway Central says end of 2029. Phase 2 says end of 2030/Q4 2030. Preserve the phase-one conflict; do not confuse this rebuild with the original Segment B completed in 2010.
- Three Peaks: index timeline ends 2032; detail explicitly states service in 2033. Prefer the labeled service event for that field, retaining the index discrepancy.
- D3: current Gateway West page (updated September 2025) gives 2034 earliest; March 2026 IRP update gives 2035 earliest. These are separate observations, not a reason to merge editions silently.
- E8: Gateway West link description gives 128 miles; child page gives 133. Keep both source values; do not infer a geometry or subtract E8 from Segment E's differing aggregate mileage.

## Scope B: historical local improvements in 2025 IRP chapter 4

The machine-readable local sections span **PDF pages 109–113 / printed pages 93–97**. They are narrative project bullets, not an all-company asset register. Enumerate each top-level project bullet once, excluding driver/benefit sub-bullets. Six entries under the explicitly completed heading are excluded: Mona reactor; Bridgerland 345 kV yard/line loop; Magna capacitors plus Tooele–Pine Canyon; St. George–Purgatory Flat reconductor; Snow Goose–Klamath Falls second line; Houston Lake–Ponderosa second line. The first four are on PDF109; the last two on PDF110.

The 14 retained planned-list entries have these exact local locators:

| PDF / printed page | Area and project-bullet locator | Factual project scope |
|---|---|---|
| 110 / 94 | PACE Central Utah 1 | Camp Williams transformer replacement |
| 110 / 94 | PACE Central Utah 2 | Second Oquirrh transformer |
| 111 / 95 | PACE Central Utah 3 | Spanish Fork–Mercer 345 kV line |
| 111 / 95 | PACE Utah/Idaho/Wyoming program 1 | Over-dutied breaker replacement program |
| 111 / 95 | PACE Salt Lake City 1 | North Salt Lake conversion to 138 kV |
| 111 / 95 | PACE Salt Lake City 2 | 90th South–Terminal loop into Midvalley |
| 111 / 95 | PACE Salt Lake City 3 | New 230/46 kV substation near Eden |
| 111 / 95 | PACE Southeast Idaho 1 | Franklin 138 kV shunt capacitor |
| 112 / 96 | PACW Eastern Oregon 1 | Burns 500 kV reactive-station replacement |
| 112 / 96 | PACW Portland 1 | St. Johns/Columbia/Knott/Albina line conversions |
| 112 / 96 | PACW Roseburg 1 | Lines 30/65 conversion, distribution substations and Roberts Creek tie |
| 112 / 96 | PACW Roseburg 2 | Dixonville transformer replacement |
| 113 / 97 | PACW Medford 1 | Lone Pine–Whetstone 230 kV line |
| 113 / 97 | PACW Medford 2 | Sams Valley 500/230 kV substation |

Historical reconciliation proposal: **20 = 14 retained + six explicitly completed exclusions**, separate from Scope A. Thirteen retained entries explicitly describe physical transmission work and can retain planned status from the heading. The breaker program spans 12 substations but supplies no 12-item inventory: keep one planning-context record with unknown lifecycle because the planned heading conflicts with completed-tense wording. Do not invent project children or infer its completion. All 14 lack service dates and native project IDs; construction/location/owner remain unknown. Mixed distribution work and explicitly identified BPA/PacifiCorp line interests in the Portland scope stay visible rather than assigning one owner.

Spanish Fork–Mercer has the same named endpoints/345 kV scope in both declared sources. Record an evidenced overlap relationship; it is not a second engineering project or permission to replace the historical record with today's page. Other same-name BPA/WestConnect overlaps are unresolved without exact source evidence.

Chapter 4's separate Table 4.1 (PDF108 / printed92) has 11 Energy Gateway rows, including a different Oquirrh–Terminal entry. It is not combined into the local scope: it mixes five completed rows with six historical permitting/preconstruction rows and conflicts with other narrative, notably D1/F completion. Its Oquirrh–Terminal must not be assumed identical to current Limber–Terminal solely from the reused C label. Model-selected resource pathways and program totals elsewhere in the chapter are also outside the local-improvement boundary.

## Newer update and specific missing input

The March 2026 update is useful evidence, but **Table 1.1 at PDF13 / printed3 and Table 7.6 at PDF103 / printed93 embed their selection bodies as images**. Text extraction exposes titles/surrounding narrative, not rows; the read-only table extractor returns no table. Under the current no-image-interpretation policy, the exact broader current portfolio enumeration is unavailable. The required additional input is a text-accessible/exported version of those tables or separately authorized image interpretation; no such request was sent.

PDF69 / printed59 explicitly allows fractional transmission selection, including portions in different years and a remainder never built. These modeled selections are planning-context unless independent evidence establishes physical project scope and lifecycle. Do not convert fractions into constructed line segments. PDF44 / printed34 provides separate, usable narrative evidence: D3 earliest 2035, E earliest 2036, and H construction underway with expected service December 31, 2027. Pending BPA redirect rights are not another physical line.

## C2/C3 contract proposal

- Keep source groups distinct, suggested `pacificorp-projects` for Scope A and `pacificorp-irp-local` for Scope B. The coordinator owns exact IDs and acceptance. Use webpage snapshot `observed-2026-09-30` versus IRP edition `2025-03-31`; do not merge the 2026 update into either without an explicit rule.
- All source identities are **source-locator**, not guessed engineering IDs. Use page slug plus named subsection for web records and edition/chapter/printed-page/area/bullet for IRP entries. Segment B/C labels are reused; they cannot alone identify a record. Preserve them as labeled aliases.
- Preserve evidenced Energy Gateway/Segment E parent relationships without importing aggregates twice. E8 can be a component of E; maintenance B remains one upgrade; bundled projects and historical bullet entries are one source unit each.
- Scope A uses `lifecycleDateMeaning=snapshot-observed`, `lifecycleAsOf=2026-09-30`, publication unknown. Preserve month-only page-update labels in notes rather than inventing a day for sourceUpdatedOn. Scope B uses `source-edition`, `lifecycleAsOf=2025-03-31`, with the official filing date and no inferred row-update dates.
- Only explicit state/area/endpoints belong in sourceState/sourceLocation. Operating footprint is not project jurisdiction. Preserve all meaningful milestone labels and precision; unresolved conflicting dates stay in evidence.
- PacifiCorp is the publisher/developer context; some projects explicitly involve Idaho Power/BPA or mixed assets. No universal singular asset owner is established, so initial owner is null. No corporate parent/global owner IDs are inferred.
- Text provides no qualified project-center coordinates/CRS/accuracy. Some pages link interactive route maps and static maps, but their native geometry was not qualified and no map was interpreted. Use null location/nativeGeometry and unknown centerRole; do not claim every possible linked spatial source was exhausted.

No shared schema or calculation change is required for the proposed bounded inventories. Every retained record would remain unlocated and spatially ineligible until separately evidenced geometry/ownership is provided.

## Reuse and next handoff

[PacifiCorp's terms](https://www.pacificorp.com/terms), ownership section, reserve content rights and do not supply an open-data license. Qualification therefore uses concise factual paraphrases/locators for private analysis, preserves originals outside Git, and does not authorize publishing PDFs, images, website prose or unrestricted commercial reuse. No contact names, email addresses, phones, event access details or hidden metadata are in the diagnostic data.

Coordinator should accept the two declared scopes independently, including identity, chronology, aggregate exclusions and overlap handling, before assigning producers. A later current-portfolio expansion must resolve the image-only table input and distinguish model options from physical work. No producer, shared/core/UI/map/dependency changes or worker checks were made. The targeted source pass stayed within the assigned 15-minute bound.
