# WestConnect public TPPL qualification

The public February 10, 2026 list contains **389 distinct source records**. Proposed full normalization retains **304 nonterminal records** and excludes **85 rows** with explicit reasons. All retained records lack native geometry and evidenced individual owners, so this adds searchable planning evidence, not proximity candidates. The six cited diagnostics in [sample.json](sample.json) are qualification facts, not a production dataset.

## Public source and preserved edition

The [official TPPL page](https://regplanning.westconnect.com/tppl.htm) distinguishes the downloadable current public project list from the complete member/NDA workbook. Only the public list and public guide were acquired; no private workbook, secure model, credentials or access request was used. Workbook macros were not executed. Guide workflow instructions are documentation, not instructions to send submissions or enable macros.

| Public original | Preserved name | Bytes | SHA256 |
|---|---|---:|---|
| [Project list](https://doc.westconnect.com/Documents.aspx?NID=21174&dl=1) | `02_10_26__wc_tppl_project_list_public.xlsm` | 201900 | `ed9261738c81311d63afdd6c79b49d04f8e201477e01c0c9c08e5afe37570b3a` |
| [December 7, 2023 guide](https://doc.westconnect.com/Documents.aspx?NID=21028&dl=1) | `121207_wc_tppl_guide.pdf` | 718533 | `ec40b10768582f43bc5c564f14cabe7f8b8b590c1b09dfd9e3ed314aefeb4f10` |

Untouched originals and public index HTML are in ignored root `inputs/originals/F27-westconnect-tppl/`. Retrieval: **2026-09-30**. The [library item](https://doc.westconnect.com/Documents.aspx?NID=21174) names edition **2026-02-10**, with a separate library date **2026-03-26**. Use edition `2026-02-10` and retain the posting-date label as context; actual publication date remains unknown. No hidden workbook metadata, contact information, comments or author properties enter the proposed derived dataset.

## Exact enumeration and identity

`All Projects!A2:AR390` contains 389 populated records, with headers on row 1. All 389 `projectid` values in column A are distinct positive integers. Other sheets (`Control`, `ProjectEntry`, `ReportPage`, `PDFReporting`) are support/form/report templates, not additional inventories. Columns AS:AY are auxiliary controls, not project fields. Enumerate every source row once and preserve its disposition/locator; there is no duplicate collapse.

Proposed source/reporting group: `westconnect-tppl`, label **WestConnect public TPPL**. Use `sourceId=String(projectid)`, `id=westconnect-tppl:<projectid>`, `identityBasis=native-id`, `recordUnit=project`. This is the publisher's project-list unit, which may bundle assets; it is not a claim that records across inventories are distinct engineering projects.

Column S (`wcprojectID`) combines expected year and numeric ID, but **55 labels disagree with column N/A**: 36 have a different year and 19 omit the numeric suffix. Four incomplete labels each occur four times. Keep S as a labeled source reference/alias, never the primary identity or authoritative date. Examples: A1236 has S `2025-`; A1262 has N2027 but S `2029-1262`. No parent-ID column exists. Names such as East Side Loop in descriptions remain related-program text; `parentProgramId=null`. No title-based cross-source reconciliation with SCE, SPP, BPA or other inventories is justified.

## Full disposition and lifecycle proposal

| Raw Development (K) | Source rows | Proposed treatment |
|---|---:|---|
| Planned | 248 | 244 retained as planned; four generation-only exclusions below |
| Conceptual | 56 | Retain as unknown; preserve raw conceptual state |
| Under Construction | 4 | Retain as under-construction |
| In-Service | 65 | Exclude from nonterminal inventory |
| Withdrawn | 16 | Exclude as withdrawn, without asserting cancellation |
| **Total** | **389** | **304 retained + 85 excluded + 0 failed + 0 pending** |

The guide's Appendix A (PDF pages 14–18; printed 12–16) explains that planned status can rest on several alternative planning/commitment criteria; it does **not** prove regulatory approval. Conceptual is active development that has not met planned criteria. Withdrawn includes cancellation, postponement or absence of active development, so it cannot map uniformly to cancelled. In-service means commercial operation. Inclusion in the base-plan process and study/permit/financing flags do not override the row lifecycle or demonstrate construction commitment. Do not infer completion from an elapsed forecast.

Four otherwise planned `Other` rows describe only generation rather than transmission equipment: A1575/R267 (RICE), A1579/R271 (wind generation), A1580/R272 and A1581/R273 (generation). Exclude those exact IDs with source citations and generation-only reason. Do not apply a broad generator/solar keyword exclusion: many other rows explicitly describe physical grid interconnections.

## Kind, sponsor and geographic evidence

Retained FacilityType counts are 165 Transmission Line, 108 Substation and 31 Other. Four rows explicitly describe distribution substations: **792/R31, 1204/R83, 1479/R217, 1641/R332**. Preserve these as **planning-context**, including the last row's conflicting Transmission Line type. The proposal is **300 transmission-project + 4 planning-context**, based on actual facility/scope evidence, not a voltage cutoff. Mixed transformer/distribution scope remains visible even when transmission work is explicit.

All 31 retained Other rows identify physical switching, reactive support, transformer, HVDC tie, voltage conversion or reconductoring work. The exact physical-equipment ID set is: `1262, 1267, 1268, 1275, 1450, 1454, 1457, 1524, 1584, 1586, 1587, 1592, 1593, 1594, 1595, 1596, 1600, 1601, 1602, 1606, 1614, 1615, 1616, 1617, 1618, 1625, 1626, 1627, 1629, 1690, 1691`. Keep this explicit classification evidence in the producer rather than treating every future Other value as transmission.

Column B has nine sponsor labels. The guide defines sponsors as owners **or developers**; neither sponsor text nor column R's WestConnect membership flag establishes the individual asset owner. Preserve sponsor verbatim, publisher/process authority WestConnect, and **owner=null** initially. Do not infer corporate parents, global owner IDs or ownership from a filing organization.

Retained StateTraversed values are Arizona 101, New Mexico 39, Colorado 77, Texas 67, Wyoming 7, Nebraska 1, Multiple 10 and blank 2. Keep raw labels and blanks. `Multiple` is not a list of allocated states; the guide also permits it when a desired state is absent from the form options. Regional scope is the submitted WestConnect list, not a complete census of these states, the Western Interconnection or the United States. SWAT/CCPG text is planning-region context, not coordinates or jurisdiction boundaries.

## C2/C3 mapping and uncertainty

| Field | Proposed mapping |
|---|---|
| Name/description/work type | C/D/I, with E/F purpose/drivers and relevant H policy context preserved as labeled source evidence |
| Date | N expected in-service **year**: 254 retained year values; 50 TBD values remain unknown |
| Lifecycle date | `lifecycleAsOf=2026-02-10`, `lifecycleDateMeaning=source-edition`; historical source state, not a change date |
| Source update | AO `modifieddate` only, interpreted with the workbook's Excel epoch when numeric; absent remains null |
| Other timestamps | AP ChangeTime, AQ POST_DATE and AR DateProjectEntered retain their exact labels as source notes; their distinct meanings must not be silently promoted to lifecycle-change/publication dates |
| Location/state | Preserve labeled Origin L, Termination M and StateTraversed Q as source text; no geocoding or state expansion |
| Geometry | `location=null`, `nativeGeometry=null`, `centerRole=unknown`; no coordinate/CRS/accuracy fields and all T map links empty |
| Construction | `constructionStart=null`, `buildWindow=null`; Z Construction_Commitments and AB agreement-date cells are all blank; a forecast year is not a build window |
| Milestones | Expected in-service year only; administrative timestamps are not project timing comparison milestones |
| Voltage/length | Preserve raw J/P. Exact kV values may be parsed where explicit; Below 115 kV is not an exact 115 kV value. Approximate length is not a route or shared corridor |

Guide field meanings appear in Appendix A; the official TPPL page separately identifies modifieddate as the data's last collection/update timestamp. Some timestamp cells are numeric Excel serials despite General formatting; preserve the raw value and locator when normalizing to a calendar day. Do not choose the maximum of different timestamp columns. Two retained Under Construction rows still forecast 2025, and their historical state must remain unchanged.

Thus all 304 retained records are unlocated, with no evidenced owner, and none is spatially eligible. Conceptual and context records also retain their independent eligibility reasons. The producer needs no shared schema or calculation change.

## Reuse and handoff

The current list is explicitly public. The guide permits copying selected All Projects cells for other documents (PDF page 7), while the website reserves rights; no general open-data license was found. This package records factual source fields and citations for private analysis, not permission to redistribute the original workbook or a claim of unrestricted commercial reuse. Original binaries remain ignored. No contact names, emails, phone numbers or hidden metadata belong in samples or derived output.

Coordinator acceptance should fix the 304-record scope, four distribution-context exceptions, four generation-only exclusions, owner-null policy and source/edition identity above. Then connect six retained examples before full production; this qualification's six diagnostics deliberately include two exclusions. No producer, shared/core/UI changes or worker checks were made. Targeted public-source review was bounded to 15 minutes.
