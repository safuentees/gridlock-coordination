# F27-GU-Q — Guam Power Authority public-source qualification

Recommend accepting the **44 named FY2026–2027 capital-budget detail entries** in GPA’s August 26, 2025 CCU presentation as a bounded source inventory. The proposed reconciliation is **27 retained source work units: 2 explicit transmission, 14 capital context and 11 unresolved planning context; 17 exclusions**. Six diagnostic mappings and every source row are in `sample.json`. This is a qualification, not a producer or runtime dataset.

The [official legislative packet](https://guamlegislature.gov/38th_Guam_Legislature/Mess_Comms_38th/Doc.%20No.%2038GL-25-1107.pdf) preserves the presentation on slides **36–40**, packet pages **57–61**, PDF pages **725–729**. The GPA admin download failed DNS/HTTP access; this ordinary public government mirror is usable. Earlier August 21 copies inside the same packet are duplicate versions, not additional projects. The selected boundary is every named detail row in A–E/G, not only rows whose names look like transmission.

Source review ran **8 minutes 24 seconds**, September 30, 2026, **10:07:20–10:15:44 UTC**. Packaging followed. Public originals remain in ignored `inputs/originals/F27-gu-gpa/`; URLs, sizes and SHA256 hashes are recorded in the JSON. Only text was inspected, with no private/CEII requests, geocoding, map-image interpretation or application checks.

## Exact declared enumeration

T = transmission-project; C = capital-project-context; P = planning-context; X = excluded. Ordinals below are curated positions within the named source section, not publisher project IDs. Names remain exact source labels; the JSON gives the disposition reason and exact citation for each.

| Locator | Source entry | Mapping |
|---|---|---|
| A.1 | Diesel | X |
| A.2 | Gas Combustion Turbine (CT) | X |
| A.3 | Piti 7 | X |
| A.4 | Safety | X |
| B.1 | Information Technology | X |
| B.2 | CFO | X |
| B.3 | PSCC | C |
| B.4 | SPORD | C |
| C.1 | T&D | C |
| D.1 | Transportation | X |
| E.1 | Safety | C |
| E.2 | T&D | C |
| E.3 | Transportation | X |
| E.4 | Facilities | X |
| E.5 | Other | X |
| G.1 | T7 Transformer Replacement | P |
| G.2 | Substation Hardening/Concrete Fencing - Harmon | C |
| G.3 | EV Charging Station | X |
| G.4 | EPCM Contract - Stanley Consultants | X |
| G.5 | P-111 and P-047 Metal Cross Arm Refurbishment | P |
| G.6 | 115kV Cabras to Agana - monotube upgrade | T |
| G.7 | Smart grid Controller Conversion and T&D Line Maintenance Support/Distribution Improvement | C |
| G.8 | Substation and Transmission Improvements | C |
| G.9 | Automated Omni Rupter Switch | P |
| G.10 | SCADA Ready Switched Cap Banks | P |
| G.11 | Predictive Based Maintenance - Island wide | C |
| G.12 | P-087 GWA Wells Underground Conversion - GPA Portion | P |
| G.13 | ULSD Quick flash Installation | X |
| G.14 | Grid-Enhancing Data Analytics Demonstrations for Operations, Monitoring, and Control - GPA portion | C |
| G.15 | Piti-Harmon 115 kV Pole Upgrade | T |
| G.16 | Piti Power plant Smokestack Demolition | X |
| G.17 | Route 1 Pole Relocation | P |
| G.18 | Talofofo Backup Generator - Installation Cost | X |
| G.19 | Hagatna Power Plant Building Renovation to include Fencing Upgrades | X |
| G.20 | Physical Access Control System (PACS) - Fadian | C |
| G.21 | Piti Substation Grounding | C |
| G.22 | Barrigada Ingress/Egress | C |
| G.23 | Underserved & Indigenous Community Microgrids - GPA portion | P |
| G.24 | Tamuning T51 Transformer - installation | P |
| G.25 | ULSD - Additional Connection to Backup Diesel Generator | X |
| G.26 | Voltage Regulator - North, Central, and South Installations | P |
| G.27 | P-090 underground extension to Battulo Street | P |
| G.28 | Pulantat Substation Upgrades | C |
| G.29 | P-005 extension to Apra (Steel Arms) | P |

**44 = A4 + B4 + C1 + D1 + E5 + G29 = 27 retained + 17 excluded.** No pending/failed entries remain inside this qualification boundary. Named sub-items in a combined budget row are not split. Summary slide 35/PDF 724 has F Water Well System Improvements, H Line Extensions and I MEC Recapitalization but no corresponding child enumeration in these detail slides; those aggregates and totals are outside the declared 44-row universe. This is neither a full capital-budget extraction nor complete current Guam coverage.

Only G.6 and G.15 explicitly establish physical 115 kV line work. C.1 includes **34.5 and 115 kV** relay work along with equipment and tools; preserve it as a combined capital-context program instead of inventing one center or a single voltage. No continental voltage cutoff applies. P-prefixed line identifiers do not by themselves prove distribution or transmission classification. Transformer, regulator and microgrid titles with unresolved role remain planning context. Mixed protection/SCADA/security/site programs remain capital context. Generation, fuel, vehicle/charging, office and standalone consulting entries are excluded with individual reasons.

Budget entries may overlap: category C and G.8 both describe substation/transmission improvements, and broader programs can include named upgrades. Retain them as **source work units**, disclose this overlap, and make no deduplicated engineering-project claim. No similarity-based merge with the 2022 IRP is justified.

## C2/C3 mapping and six diagnostics

| Diagnostic | Kind | Material meaning |
|---|---|---|
| C.1 T&D | Capital context | Mixed 34.5/115 kV protection/equipment program, not one physical project. |
| G.6 Cabras–Agana monotubes | Transmission | 115 kV explicit; no service date or center. |
| G.15 Piti–Harmon poles | Transmission | 115 kV explicit; FY2026 funding is not a completion date. |
| G.1 T7 transformer | Planning context | Transformer identifier alone does not establish location, voltage or transmission role. |
| G.7 grid controller/line support | Capital context | Mixed control, maintenance and distribution work remains combined. |
| G.12 P-087 wells conversion | Planning context | Underground line role and voltage unresolved; “GPA Portion” does not establish complete asset ownership. |

- Source/reporting group proposal `gu-gpa-cip`, label Guam Power Authority. Edition `fy2026-2027-board-2025-08-26`; meeting date August 26, 2025, exact public posting day unknown. Retrieval September 30, 2026 is separate. Lifecycle proposal `planned`, `lifecycleAsOf=2025-08-26`, `lifecycleDateMeaning=source-edition`; raw status remains “Proposed FY2026–2027 CIP budget.” Budget adoption is not proof of each engineering authorization, active construction or completion.
- IDs `gu-gpa-cip:cip-<section>-row-<ordinal>`, `identityBasis=source-locator`, refer to this frozen table. Section resolves repeated Safety/T&D labels. These are **not native publisher project IDs**. Circuit/transformer labels remain aliases where useful. Future-edition continuity requires an explicit crosswalk; do not merge by title or ordinal.
- GPA is the reporting authority and budget sponsor, not automatically the proven asset owner. All six diagnostics retain `owner=null`; no regional/global owner ID is invented. The 2022 Grid Controller discussion even proposes contractor-owned/operated equipment, reinforcing why reporting responsibility is insufficient ownership evidence.
- All centers and native geometry remain null, center role unknown. Named endpoint/locality text remains source context; no geocoding, endpoint inference or midpoint creation. All retained records remain spatially ineligible until suitable evidence is supplied; context kinds remain context regardless of future location.
- FY2026/FY2027 are spending columns, not construction windows, in-service dates or project-need years. Diagnostics have unknown milestone date/precision/kind and no construction interval. Numeric voltage is 115 only for the two explicit line upgrades; combined and unstated values stay null rather than taking a maximum.
- After acceptance, `scope=full` could describe **only these 44 detail entries**, with all manifest gaps explicit. Keep `recordUnit` absent for broad combined programs unless the coordinator approves a narrower unit convention. No adapter is authorized by this document.

## Older and newer evidence kept separate

The [GPA IRP library](https://www.guampowerauthority.com/gpa-initiatives/clean-energy-master-plan) links the public 2022 IRP and March 26, 2021 transmission presentation. Its “Updated 3/29/2023” page text is not an IRP publication date or current project status. The 2022 IRP Table 22-1 (printed 144/PDF 152) has 15 named capital groups, but includes conditional synchronous-condenser alternatives and generation/demand programs. Appendix G (printed 218/PDF 226) contains spending years and repeated “Project Number” labels; those are neither reliable engineering IDs nor service dates. Some early pages retain DRAFT footers. The 2021 recommendation for Malojloj–Agana and 2022 Malojloj–Hagatna line naming do not establish a completed/current project or a cross-edition merge. Restricted underlying study material was not sought.

The [FY2025 citizen report](https://fe40979c-838a-406f-a7ed-25d2b7816fd5.usrfiles.com/ugd/fe4097_cd252fb6c8844a25a39b5e60a311f2d3.pdf), PDF 2, reports ongoing DoD Piti–Apra Heights underground transmission work. PDF 4 describes a proposed broad undergrounding program and relay/controller/condenser themes. These useful leads are outside the selected detail table and are not silently added or merged. The fiscal edition contains 2026/2029 forward-looking references; its fiscal label is not an exact publication or all-project status date. The [2024 annual report](https://2a377536-af1c-47a6-86dd-c3514d705b4a.usrfiles.com/ugd/2a3775_80eaac67ae864c5a91042949bdc02040.pdf), printed 24–25/PDF 14, describes northern-loop work mentioning Dededo but omits the other endpoint; no route is inferred.

The [2025 audited statements](https://fe40979c-838a-406f-a7ed-25d2b7816fd5.usrfiles.com/ugd/fe4097_7f16eef0bba5409e9f2e5c4556391bbd.pdf), printed 11/PDF 13, the [adopted FY2026–27 budget](https://guamlegislature.gov/38th_Guam_Legislature/Mess_Comms_38th/Doc.%20No.%2038GL-25-1192.pdf), Exhibit A8/PDF 17, and the [2026 capital report](https://guamlegislature.gov/38th_Guam_Legislature/Mess_Comms_38th/Doc.%20No.%2038GL-26-1968.pdf), printed 25/PDF 55, provide aggregate capital context rather than a complete named transmission register in the passages reviewed. An indexed February 2025 board excerpt mentions Mangilao Medical Campus substation/underground work, but its GPA-host original failed acquisition; it is a lead, not a qualified record here.

**Remaining public input:** a dated comprehensive project register/crosswalk is needed to claim current Guam-wide inventory, reconcile budget rows with IRP/annual-report programs and resolve the unenumerated categories. The selected public packet itself is usable. Unknown owners, milestones and locations remain field gaps, not a reason to invent them or report Guam as having no projects. Coordinator acceptance of the 44-row boundary and context mapping is the next step.
