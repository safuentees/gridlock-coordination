# PJM RTEP qualification

**Qualify inventory discovery; spatial eligibility remains blocked by absent coordinates.** Proposed source/reporting group `pjm-rtep`; edition `snapshot-2026-09-30-1cc0ae1b7825`. The [six-row sample](sample.json) is qualification data, not a runtime import. Implementation waits for coordinator acceptance and F26 integration.

## Enumeration and lifecycle

The [official status page](https://www.pjm.com/planning/m/project-construction) links the [public XML export](https://www.pjm.com/pjmfiles/media/planning/projectConstruction-data/projectCostUpgrades.xml). Enumerate every `/Upgrades/Upgrade`, keyed by the exact `UpgradeId`; the preserved snapshot has **15,692 unique upgrade rows**. Retain **5,624**, exclude **10,068** by source status:

| Raw status | Rows | Proposed disposition / lifecycle |
|---|---:|---|
| EP | 3,800 | Retain / planned; engineering and procurement |
| Active | 831 | Retain / planned, pre-agreement caveat |
| UC | 532 | Retain / under-construction |
| On Hold | 256 | Retain / on-hold |
| PL | 199 | Retain / planned |
| UC-ISP | 6 | Retain / under-construction, partially in service |
| IS | 9,215 | Exclude / in-service |
| Cancelled | 847 | Exclude / cancelled |
| W | 6 | Exclude / withdrawn; preserve raw W |

The page's status-information table defines Active as a network upgrade tied to a queue project with a system impact study but no ISA/ICSA. Its normalized planned category is an implementation proposal, not evidence of approval. On Hold can reflect suspension or a retool. Elapsed dates never change lifecycle.

Retained types: Baseline **1,249**, Network **1,994**, Supplemental **2,381**. The Upgrade-ID information tooltip distinguishes reliability-driven baseline work, service-request-driven network facilities and supplemental enhancements. Network rows describe upgrades, not the generating project itself. Keep native suffixes such as `b1570.3` intact. There is no parent-ID field; neither name matching nor stripping suffixes establishes unique engineering-project totals. `ProposalIds` is an association, not a replacement identity.

## Meaning, footprint and gaps

`TransmissionOwner` explicitly identifies the source-reported transmission owner, unlike SCE's manager field. Preserve its token and cite the exact element. Do not infer ultimate corporate parents. There are **38 retained blanks**; two `MISO` values do not establish an asset-owning entity and should stay unresolved. `DL` and `Duquesne Light (DL)` require an explicit reviewed alias rule before sharing an owner ID. Source-qualified single tokens may use namespaced IDs such as `pjm-to-ppl`; cross-source owner equivalence remains a separate evidenced mapping.

The [official footprint](https://www.pjm.com/about-pjm/who-we-are/territory-served) covers all or parts of 13 states and DC; this export is partial planning coverage, not every project in those jurisdictions. Retained `State` has 396 blanks, multistate strings and out-of-footprint values including `VI` (3) and `MA` (1). Preserve these as raw text pending review; do not silently correct them or assert new territorial coverage. `Location` has 320 blanks. No latitude/longitude or native geometry fields occur. The bounded review found no coordinate companion directly linked in status-page content. Named stations, states and generic existing-infrastructure maps cannot manufacture upgrade centers.

The page's date tooltips distinguish required system-need, owner-projected in-service and actual in-service dates. Preserve all supplied milestones; a display choice may prefer projected then required, with the correct label/kind. Nine retained rows have actual dates despite nonterminal status; retain both facts. There is no construction-start/end field. Sample `n0613` also conflicts between Voltage 138 and description 345kV; keep the discrepancy rather than rewriting the source.

## Snapshot, access and handoff

The root XML has no publication date or edition attribute. `LastUpdated` varies by row, spanning **2025-02-20–2026-09-29** across the file. Use `publishedOn=null`, retrieval `2026-09-30`, checksum-specific snapshot identity, and preserve row update dates separately from lifecycle observation. LastUpdated can reflect any changed field; it is not proof of when lifecycle changed. Refresh by exact upgrade ID; omission is not cancellation.

Original: coordinator `inputs/originals/F27-pjm-rtep-2026/projectCostUpgrades.xml`, 25,476,508 bytes, SHA-256 `1cc0ae1b78258cbe81108ec2fdd43754098a57cc5ec224f6e7300cafefe2eb31`. Public status-page HTML was retained beside it for tooltip locators. Access required no account; the separately linked TC Planner requires an account and was not accessed. [PJM's legal notice](https://www.pjm.com/about-pjm/legal.aspx) reserves rights and says access confers no license; no dataset-specific open reuse grant was identified. Preserve attribution/provenance and make no unrestricted-redistribution claim.

Before the adapter, root should accept status/owner mappings and a place for source state/location, row-update date and multiple milestones. Keep all 5,624 upgrades unlocated, with zero spatially eligible records until separate evidence qualifies locations. Measure the normalized payload before revising the existing 10MB guard; original XML size is not normalized size. Qualification supports inventory expansion, not national completion or useful proximity pairs.

Necessary clarification ran from `2026-09-30T08:20:41Z` to `08:25:17Z` (**4.60 minutes**); research then closed. Six samples cover all retained status categories and all three source types. Remaining work only packages these outputs. No importer, schema/register edits, geocoding, private data, account access, worker checks or visual work.
