# F27-AK-Q — Railbelt source qualification

Recommendation: accept a **partial-Alaska, text-defined strategic inventory**, subject to the identity/disposition proposal below. This is qualification only; no producer or runtime Dataset has been added. No source inference establishes routes, current construction, ownership across inventories or statewide completeness.

## Sources and boundary

- [AEA 2050 Railbelt Strategic Transmission Plan](https://www.akenergyauthority.org/Portals/0/Home/2026.02.26%20AEA%202050%20RSTP%20%28Final%29.pdf?ver=qI3vDZwWypffLMqvLm9WEg%3D%3D), dated February 26, 2026, 42 PDF pages. SHA256 `2503e90711cfc45603fc5871586d817ab2b754737397dfa87bc3dd76ff7d1d6d`.
- [Official companion Statewide Railbelt Energy Vision](https://www.akenergyauthority.org/Portals/0/Home/2026.02.19%20AEA%20Statewide%20Railbelt%20Energy%20Vision%20%28Optimized%20Final%29.pdf?ver=s4gynDAydbr9YM7gWGJZBg%3D%3D), cover February 2026 (filename day is not treated as publication evidence), 23 PDF pages. SHA256 `e1beaf0dc562ff532dd32027ffa5a1b9181cf1079d40f8bb0f564266b561b94b`. Its **PDF page 19 / printed page 34 text table** supplies map keys A–J, owner labels and timeline text. Map geometry was not inspected.
- Originals remain under ignored `inputs/originals/F27-ak-railbelt/`. Text extraction only; no images, screenshots, map interpretation or application checks. Public text/table review began 2026-09-30 08:54:27 UTC; review ended 09:00:26 UTC: **5 minutes 59 seconds**, within the 15-minute bound (PR packaging follows).
- The main report describes its public/less-technical purpose in section 2.1, page 16; reference [1] is the 2025 utility-engineers technical report, not an additional public inventory acquired here. Scope is the Railbelt, not all Alaska.

## Complete text enumeration proposal

Count every chapter 3 child entry once: **28 leaves in 12 parent groups**. Exclude two standalone BESS entries; propose **25 transmission improvements plus one mixed transmission/distribution context record**. The 12 parents, executive summaries, alternatives inside a child and companion repetitions are lineage/context, not additional projects. These are study improvements, not a proven count of distinct engineering projects.

`map-X` uses the companion's published map key; it is **not a native engineering project ID**. `sec-…-item-N` is a proposed curated locator using the cited section and child order. Full record IDs would be `ak-aea-rstp:<locator>`. Titles plus parent sections distinguish all leaves except the two repeated Anchorage–Soldotna cost-row titles. The companion identifies the Kenai Tie and CIPLink concepts as A/B; retain both concepts but leave their cost-row allocation unresolved. Future-edition continuity for either identity form requires explicit review; do not automatically rename/rekey/reconcile by title or ordinal.

| Source locator proposal | Main section / PDF page | Normalized concept | Disposition |
|---|---|---|---|
| map-A | 3.2.1 / 27–28 | Anchorage–Soldotna existing intertie | retain; duplicate cost-title mapping unresolved |
| map-B | 3.2.1 / 27–29 | CIPLink HVDC | retain; duplicate cost-title mapping unresolved |
| map-C | 3.2.2 / 29–30 | Anchorage–Fairbanks existing interties | retain; composite owners |
| map-D | 3.2.2 / 29–30 | Additional Central–Healy connection | retain |
| map-E | 3.2.3 / 30 | Bradley–Soldotna existing line | retain; composite owners |
| map-F | 3.2.3 / 30 | Second Bradley–Soldotna path | retain one objective; alternative alignments |
| map-I | 3.2.4 / 31 | East–west Knik Arm 230 kV cables | retain |
| map-J | 3.2.4 / 31 | Point MacKenzie–Sullivan overhead conductors | retain |
| map-G | 3.2.5 / 32 | Existing BESS grid-forming conversion | exclude standalone storage |
| map-H | 3.2.5 / 32 | Additional regional BESS | exclude standalone storage |
| sec-3-3-1-item-1 | 3.3.1 / 33 | North Pole–Fort Knox line | retain |
| sec-3-3-1-item-2 | 3.3.1 / 33 | North Pole/Fairbanks–Delta Junction line | retain; heading/narrative endpoint distinction |
| sec-3-3-2-item-1 | 3.3.2 / 34 | Teeland eastward capacity | retain |
| sec-3-3-2-item-2 | 3.3.2 / 34 | Two MEA 230 kV paths | retain; Fossil Creek subcomponent conflict |
| sec-3-4-1-item-1 | 3.4.1 / 35 | Downtown Anchorage 115 kV capacity | retain |
| sec-3-4-1-item-2 | 3.4.1 / 35 | Third University transformer | retain |
| sec-3-4-1-item-3 | 3.4.1 / 35 | Sullivan transformer | retain |
| sec-3-4-1-item-4 | 3.4.1 / 35 | Anchorage subtransmission/distribution program | capital-project-context; no invented children |
| sec-3-4-2-item-1 | 3.4.2 / 35–36 | North–south Knik Arm cable replacement | retain; 139/138 kV conflict |
| sec-3-4-2-item-2 | 3.4.2 / 35–36 | Woronzof–International conductors | retain |
| sec-3-4-2-item-3 | 3.4.2 / 35–36 | Second Point MacKenzie 230/138 kV transformer | retain |
| sec-3-4-3-item-1 | 3.4.3 / 36 | Central Fairbanks 69 kV capacity | retain |
| sec-3-4-3-item-2 | 3.4.3 / 36 | Goldhill transformer | retain |
| sec-3-4-3-item-3 | 3.4.3 / 36 | Fort Wainright–Carney 69 kV conductors | retain; preserve source spelling |
| sec-3-4-4-item-1 | 3.4.4 / 37 | Puppy Dog Lake substation | retain conditional interconnection; exclude generators |
| sec-3-4-5-item-1 | 3.4.5 / 37 | Beluga–Point MacKenzie existing line | retain; printed 139 kV unresolved |
| sec-3-4-5-item-2 | 3.4.5 / 37 | Susitna Valley plant transmission connection | retain new transmission only, not generation |
| sec-3-4-5-item-3 | 3.4.5 / 37 | Lake Lorraine plant substation connection | retain new transmission only, not generation |

Proposed future ledger: 28 child entries = 26 retained + 2 excluded. Keep 12 parent cross-references separately. A full manifest can describe this bounded text inventory only after coordinator acceptance and exhaustive transcription; this six-record qualification is not a full Dataset. Figure-only differences, engineering subcomponents, generation/storage inventories and historical assets are outside the enumerated universe.

## C2 mapping and limits

| Field | Evidence-preserving proposal |
|---|---|
| Source / edition | `ak-aea-rstp`, `2026-02-26`; publisher AEA. Every companion-derived owner/date cites that companion separately. |
| Record meaning | Discrete transmission improvement; component/upgrade/project where explicit. Broad mixed program is capital-project-context. Priority stays in status/notes, not approval status. |
| Lifecycle | Default unknown/conceptual as of source edition. CIPLink may map to planned from its explicit scheduled-completion statement; partially funded/shovel-ready does not imply under construction. Some Kenai Tie works already completed does not classify the entire remaining upgrade. |
| Owner | A/C/E composite labels remain `owner=null`. B/D: AEA; F: HEA; I/J: CEA, supported by the companion table, `identityScope=source`. No owner inferred for the other leaves from service territory, publisher or asset vicinity. |
| Dates | Keep raw table values: A `1-10`, B `8**`, C `2-10`, D/F `5-10`, E `5-7`, I/J `4-6`. No origin/unit or exact dates inferred from these numbers. Only B's footnote supplies **August 2032**, precision month, kind unknown, label scheduled project completion. 2050 is a study horizon. No construction interval. |
| Geometry | No explicit native coordinate pairs in inspected text/tables. `location=null`, `nativeGeometry=null`, `centerRole=unknown`; named endpoints are sourceLocation text only. |
| Supplementary evidence | Record source raw priority/timeline/owner text and cited assumptions. `sourceUpdatedOn=null`; publication does not establish status-change time. No costs imported or interpreted as savings. |

Source conflicts remain visible: duplicated high-priority cost labels (p27); Fairbanks versus North Pole endpoint wording (p33); printed 139 kV versus narrative 138 kV for the low-priority crossing (pp35–36), and a separate printed 139 kV line label (p37); Fossil Creek described as omitted (p26) but conditionally needed inside the MEA upgrade (p34). Do not invent separate Fossil Creek records or collapse the distinct 230 kV east–west and 138/139 kV north–south cable proposals. The companion table clarifies high-priority identities without resolving every detail in the main report.

`sample.json` contains six cited, non-runtime mapping proposals spanning explicit completion, composite owner, alternative path, endpoint discrepancy, voltage discrepancy and generation-contingent transmission. No provider, producer, shared schema, source register, UI or core changes are included. Acceptance of curated identity and text scope is the next decision; exact routes, engineering IDs and full construction schedules are unavailable from this reviewed public material.
