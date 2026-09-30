# F27-SCE-E1 — Six equipment-ownership decisions

One proposed **planned** owner is supported for coordinator review: Southern California Edison Company for the future Calcite substation. Five decisions remain unresolved. No present equipment title is confirmed and no runtime owner or comparison eligibility changes in this increment.

The public primary-source pass ran September 30, 2026, 12:02:46–12:11:55 UTC (9m 9s). It used ordinary public requests, primary-source search and PDF text only. The complete six-record baseline, exact evidence locators, date/scope limits, original-byte hashes and fingerprints are in [sample.json](sample.json). No producer, UI, map, calculation or shared-contract changes; no worker checks.

## Evidence decisions

| Stable / native ID | Decision and evidence | Remaining limitation |
| --- | --- | --- |
| `ca-sce-tpr:SP-01` / `SP-01` | **Supported planned-owner proposal.** The county's [September 2025 final EIR](https://lus.sbcounty.gov/wp-content/uploads/sites/48/Volume-I_Final-Environmental-Impact-Report.pdf), PDF p200 / printed 2-41 §2.7.2, explicitly assigns future Calcite ownership to SCE. [SCE's May 2023 description](https://lus.sbcounty.gov/wp-content/uploads/sites/48/Planning/Appendix-O-Project-Description-SCES-Calcite-Substation-and-the-Interconnection-of-Sienna-Solar-Project.pdf), pp4/13, identifies the legal company and customer boundary. | Intended station ownership, not present operating-asset title. The distinctive name/purpose match is curated; no external `SP-01`/`6902` crosswalk was found. Exclude generator facilities and the customer gen-tie. |
| `ca-sce-tpr:SP-11` / `SP-11` | **Unresolved.** [SCE GRC capital workpapers](https://docs.cpuc.ca.gov/PublishedDocs/SupDoc/A2305010/7166/528454338.pdf), PDF p44 / printed 42, match program `6791` and breaker work. | Need dated legal ownership of the specific 1AA/2AA conversion equipment and work-order `800308934`; spending attribution is insufficient. |
| `ca-sce-tpr:SP-30` / `SP-30` | **Unresolved mixed boundary.** [CAISO's January 31, 2017 draft plan](https://www.caiso.com/Documents/Draft2016-2017TransmissionPlan.pdf), PDF pp134–135 / printed 128–129, distinguishes SCE and LADWP upgrade portions. The GRC workpaper PDF p43 / printed 41 matches `8029` to Lugo terminal work. | Need the row's exact ownership boundary and current equipment crosswalk. The broad line row cannot silently become a wholly SCE-owned portion. |
| `ca-sce-tpr:SP-172` / `SP-172` | **Unresolved joint ownership.** [CAISO's June 28, 2023 presentation](https://stakeholdercenter.caiso.com/InitiativeDocuments/Presentation-2023-2024-Transmission-Planning-Process-Jun282023.pdf), slide 4, describes the co-owned bus split and relocated terminals. | Need the legal co-owner/participation schedule for Section A and affected equipment. SCE's submitter role does not justify a scalar sole owner. |
| `ca-sce-tpr:PB-02.01` / `PB-02.01` | **Unresolved joint/boundary ownership.** [LADWP's October 3, 2023 preliminary statement](https://www.ladwp.com/sites/default/files/2023-10/CALosAngeles17a-POS.pdf), PDF p62 / printed 56, identifies southern PDCI shared interests and the BPA boundary. | Need `901994846`/insulator-scope ownership for the specific Nevada spans. The broad endpoint geometry and operating-agent role cannot supply it. |
| `ca-sce-tpr:PB-03.02` / `PB-03.02` | **Unresolved.** [SCE GRC rate-base workpapers](https://docs.cpuc.ca.gov/PublishedDocs/SupDoc/A2305010/7194/528920107.pdf), PDF p51 / printed 48, identify the parent `4651` switchrack capital bucket. | Need an equipment-level ownership schedule for PL R9, four reactors and the added switcher, linked to `904011808`. Nuclear-station ownership is not reactor-bank ownership. |

## Scope and time are part of the decision

For Calcite, the [current SCE project page](https://www.sce.com/about-sce/reliability/projects-in-progress/calcite-substation-project) describes the same Lucerne Valley station with planned 2028–2029 construction. The page has no publication date; its September 30 observation does not establish June 1 ownership. The [August 23, 2022 county NOP](https://lus.sbcounty.gov/wp-content/uploads/sites/48/Environmental/NOP-Sienna-Solar-and-Storage-Project.pdf), PDF p3, also states intended SCE ownership. The [2021 Stagecoach appendix](https://files.ceqanet.lci.ca.gov/265209-3/attachment/SxQiQX9DwTUcAyqk1DkZsTrQwExZeRmCE6o_IEL546rNjEjC2kx_MV2IlwXZbopuhGqrR1kVQ9H7ny7U0), E-1–E-2, concerns a different generator customer; it is background, not the current project's controlling scope.

The proposed legal identity `southern-california-edison-company` is a curated key, not a native publisher identifier. Global scope is proposed only because the utility-authored description expressly identifies Southern California Edison Company. This says nothing about ownership of Sienna/Aurora customer assets. A guarded consumer must retain the **planned owner / evidence as of September 2025** qualifier; otherwise the proposal should remain unapplied.

All six current TPR dates, source meanings, locations, confidence, lifecycle and notes remain untouched. Preserve these specific differences:

- Calcite is 230 kV in the TPR and 220 kV in the external descriptions. Eldorado's TPR title says 220 kV while its voltage field and CAISO description say 230 kV.
- The 2023 GRC schedule for Lugo breaker work and the historical Lugo–Victorville plan predate and differ from the June 2026 TPR milestones. No superseded date becomes the current date.
- The rate-base workpaper's `100%` column is `% ISO`, not ownership share. Parent accounting buckets do not resolve child equipment title.
- The final Calcite EIR retains edited connection quantities in extracted text. No quantity or boundary is inferred by interpreting strikeout/underline visually.

## Baseline guard and preservation proposal

Each fingerprint is SHA-256 of the **complete current Project value** read at `22fae130890e2a0fc067af2e1a5356e22ee4bf9d`. The JSON lists the selected top-level fields and embeds their complete baseline values. Serialization recursively sorts object keys with JavaScript `Array.sort()`, retains array order, uses `JSON.stringify()` with ECMAScript number formatting and no whitespace, then hashes UTF-8 bytes. All inventory fields, location/evidence, dates, source references and notes participate. The source dataset byte hash and inherited workbook hash are distinct from these value fingerprints.

A changed baseline is a review condition, never permission to replace the active record. Coordinator must separately accept the proposal and contract an explicit preview/application path with identity/edition guards and preservation of user notes and local evidence. Existing source snapshots and saved reviews are not rewritten. No positive-candidate count is claimed.

Nine originals are preserved unchanged under ignored `inputs/originals/F27-sce-owner-evidence/`, with sizes and SHA-256 values in the sample. The LADWP PDF was readable through public web text extraction, but ordinary direct download returned HTTP 403; its local original/hash are explicitly absent. No alternate access or bypass was attempted. The June 2026 source workbook was not reacquired; its existing manifest hash is identified as inherited provenance.
