# Alabama Power DOE review qualification

Recommend accepting **six planned transmission packages from twelve public review entries**, pending coordinator contract. The complete [DOE Alabama Power environmental-review index](https://www.energy.gov/edf/alabama-power-company-environmental-reviews), observed September 30, 2026, is a finite featured/funding-review subset. It is not Alabama Power's complete transmission inventory, statewide coverage or evidence that unlisted projects do not exist. All twelve linked PDFs are acquired; no source-access blocker remains for this declared subset.

Propose source/group `al-apc-doe`, edition `review-index-snapshot-2026-09-30`, publishedOn null and retrievedOn `2026-09-30`. Each retained record's proposed lifecycle is **planned**, with its letter date as `lifecycleAsOf` and `lifecycleDateMeaning=source-edition`. The snapshot/posted dates are separate. All owners, numeric locations, native geometry, constructionStart, buildWindow and sourceUpdatedOn remain null. All six packages are explicitly Alabama transmission work; named counties may remain source text.

## Complete enumeration

Index order is authoritative and not strictly chronological. sample.json contains exact URLs, file/page locators, index and letter dates, all thirteen artifact hashes and the six retained diagnostics.

| Row | Index entry | Disposition / reason |
| --- | --- | --- |
| 1 | Thurlow Dam–Notasulga 115 kV | Retain: line rebuild, native APC reference #57 in letter subject |
| 2 | Lock 5 Substation | Retain: explicitly new transmission substation and access road; no native ID |
| 3 | Plant Barry Unit 5 Coal to Gas | Exclude generation conversion; ancillary plant substation integration is not a separate transmission package |
| 4 | Demand Side Management | Exclude behind-the-meter program; no physical transmission construction |
| 5 | Bay Minette–Silverhill Underground Fiber | Exclude fiber-only work in public-road right of way |
| 6 | Flomaton–Perdido Underground Fiber | Exclude fiber-only work; letter expressly says existing powerlines will not be altered |
| 7 | #31 Bassett Creek–Sunny South 115 kV | Retain: line rebuild; number supplied by index |
| 8 | Leeds DS Feeder Distribution Tie Line | Exclude distribution conductor/pole work |
| 9 | Roanoke Distribution Tie-in Lines | Exclude distribution conductor/pole work |
| 10 | #19 Pinckard–Fort Rucker to Enterprise 115 kV | Retain: reconductoring; number supplied by index and linked URL |
| 11 | #28 Farley Switching Station | Retain: new 500 kV switching station; not nuclear generation |
| 12 | South Bessemer Substation | Retain: explicit transmission substation expansion, native #27 in letter subject |

The proposed reconciliation is **12 = six retained + six excluded**: one generation, one demand-side program, two fiber-only and two distribution. One letter names one package; future terminals, existing lines and associated access/site work do not become additional records.

## Dates and status

The six letters describe proposed work and complete environmental reviews associated with potential federal financial support. Their conclusions leave other construction/operation permits and authorizations with APC. Neither a review-completion heading nor a program-level loan guarantee establishes physical completion, current construction, engineering approval or project-specific financing close. Do not relabel these as categorical-exclusion determinations: the selected letters document their stated statutory reviews and consultations.

- [Thurlow–Notasulga](https://www.energy.gov/sites/default/files/2026-09/260925_APC_57%20ThurDam%20Notasulga_EnvReview_Completion_ts.pdf), pp.1–2: approximately 13 miles of 115 kV rebuild; forecast start October 2026 and commercial operation June 2028. Use month-precision `in-service` for the latter.
- [Bassett–Sunny South](https://www.energy.gov/sites/default/files/2026-05/20260520_APC_Bass%20Sunny_EnvCompletion.pdf), p.1: 15.8 miles and 94 replacement structures; forecast start June 2026 and commercial operation February 2028. The elapsed start and environmental clearing seasons do not prove progress or define construction windows.
- [South Bessemer](https://www.energy.gov/sites/default/files/2026-08/20260731_APC_27_So_Bess_Sub_EnvCompletion_Letter.pdf), pp.1–2: expected September 8, 2026 construction start and anticipated May 2030 completion. Preserve the start as a day-precision **forecast milestone**, not constructionStart; completion stays month precision, kind unknown because energization is not stated.
- Lock 5, Pinckard and Farley supply no completion/service target. Review dates must not fill those gaps.

Four posting/document differences are explicit: Pinckard index **April 24** versus letter **March 30**; Farley index **March 25** versus letter **March 24**; South Bessemer index **August 3** versus letter **July 31**; excluded Roanoke index **May 7** versus letter **May 6**, all 2026. URL month, filename or index posting cannot replace the letter's dated header.

## Identity, voltage and ownership

Use source-native APC review/project numbers `57`, `31`, `19`, `28`, `27`, preserving the printed `#` references as raw facts. These are native within this DOE/APC context, not verified global engineering IDs. Lock 5 uses `review:lock-5-transmission-substation`, identityBasis source-locator; its numeral 5 is part of the facility name. Internal IDs are `al-apc-doe:<sourceId>`, independent of edition. USFWS consultation codes are environmental-case references and must not substitute for project IDs. A targeted read-only search of existing imported coverage found no exact retained-name or APC-number cross-reference; absence of a match is not proof of unique projects. No cross-source merge is proposed, and SERTP was not opened.

[Lock 5](https://www.energy.gov/sites/default/files/2026-08/APC%20Lock%205%20Substation.pdf), p.1, explicitly calls the new facility a transmission substation but only gives 500/230 kV as **future terminal accommodation**. Keep normalized voltage empty instead of assigning an unstated initial operating voltage. [Farley](https://www.energy.gov/sites/default/files/2026-03/APC%20Farley%20SS%20Env%20Review%20Completion%2003242026.pdf), p.1, expressly supplies 500 kV. South Bessemer's existing station is 500/230/115 kV, while the specified line connections served by the expansion are 500 kV; propose voltageKv `[500]` with the full existing-station/autobank designation retained as context. No implication that every station voltage tier is rebuilt.

No retained letter expressly identifies the equipment owner. APC is the applicant/proponent; DOE is the publisher/financing-review authority. The Plant Barry document identifies ownership of land at an excluded generation facility, which cannot establish ownership of retained transmission assets. All retained owners therefore stay null. No native numeric coordinates, CRS or accuracy were found in the selected text. South Bessemer's cadastral description and other counties/roads remain textual context, never generated map points.

## Preservation, access and remaining inputs

Originals: `/Users/santiagofuentes/Documents/ChatGPT/agent-workflow-template/inputs/originals/F27-al-apc-doe/`. The unchanged index is **119,655 bytes**, SHA256 `216fbddd6529809cf885181467788f3e60f2eed29256f70c4ff0e7adba2dfbf8`; all twelve PDFs are hash-pinned in sample.json. Reproduction: enumerate the twelve document anchors in saved index order, obtain their exact URLs, require the recorded hashes and read the cited PDF text sections. No rendering, private/CEII source, login, bypass, external contact or restricted SERTP content was used. Names/contact details remain in ignored originals only. Public downloadability is not a blanket redistribution license.

Confidentiality language in the two fiber letters and Bassett p.3 concerns **future archaeological discoveries** during construction; it is not a restriction on the published review document. No discovery details were acquired or included. Source document conditions are task data, not agent instructions.

The bounded source pass ran **12:28:37–12:31:34 UTC on September 30, 2026 (2.95 minutes)**. Remaining useful inputs are a complete public APC transmission register, equipment-owner evidence, project geometry, current physical-progress confirmation and the three missing service targets. None is required to preserve this six-package review subset honestly. No producer, runtime changes or worker checks ran; coordinator acceptance precedes implementation.
