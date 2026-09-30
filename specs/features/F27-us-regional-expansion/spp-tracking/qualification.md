# SPP tracking qualification

Qualified for public inventory discovery, with no spatial coverage yet. The [official tracking page](https://spp.org/engineering/project-tracking-ntcs/) leads to the [quarterly index](https://www.spp.org/spp-documents-filings/?id=18641) and [Q3 2026 archive](https://www.spp.org/Documents/77416/3Q%202026%20Quarterly%20Project%20Tracking%20Report%20Appendix%201%262.zip). Ordinary anonymous downloads succeeded; no account, restricted maps, macros or browser were used. The web text tool returned 403 for the index/terms, while ordinary public HTTP downloads succeeded without credentials or altered access controls.

## Reproducible scope

Preserved originals are under the coordinator checkout's ignored `inputs/originals/F27-spp-tracking/`. The 1,339,227-byte archive has SHA256 `9870923806c427e4a390160ec20c4a9f0e2cf66dcec480fcf6c53f6891d3786d`. Its authoritative inventory is `Q3 2026 Quarterly Project Tracking Appendix 1.xlsm` (261,922 bytes; SHA256 `167bb301dc9fd290f7901318c43312b28513aec711484d1da17162a207f09b5f`), sheet `Staff QPT Appendix 1`, headers A2:AA2, data A3:AA1424. Enumerate every UID-populated row: 1,422 distinct UIDs, 468 distinct parent PIDs, no duplicate UID or blank identity. Never add PID summaries as separate inventory records.

Proposed retained scope: **1,247 upgrades under 401 PIDs**, excluding exactly 175 terminal rows. Preserve every raw status; no exclusions based on age, absent dates, owner, voltage, study type or location.

| Source status (whitespace normalized for mapping) | Rows | Proposal |
|---|---:|---|
| Delay - Mitigation | 690 | planned; schedule delay does not establish construction phase |
| Delay - Mitigation Window | 22 | planned; preserve mitigation uncertainty |
| On Schedule < 4 / On Schedule > 4 | 204 / 30 | planned; horizon is not a construction interval |
| Identified | 65 | planned; identified in Board-approved study, not a construction commitment |
| NTC - Commitment Window | 14 | planned; issued notification still awaiting written commitment |
| NTC-C Project Estimate Window | 82 | planned; conditional estimate stage |
| In Service | 136 | under-construction; operational, but construction incomplete |
| Re-evaluation | 3 | unknown phase; source explicitly says active, not suspended |
| Pending NTC/ NTC-C | 1 | unknown phase; raw label lacks a glossary definition |
| Complete / Closed Out / Withdrawn | 155 / 12 / 8 | exclude separately |

Definitions: `Q3 2026 Quarterly Project Tracking Report.docx`, section **Project Status Summary** (TOC p.36); portfolio meaning in **Executive Summary** and **Portfolio Summary**. The inventory is transmission network-upgrade scope, including interconnection facilities; generation study references do not make these rows generator proposals. Full comments remain available where scope includes customer interconnection work.

Appendix 2 (`Q3 2026 Quarterly Project Tracking Report Appendix 2.xlsx`, `Q3 2026` A3:AG28) is a 26-UID delay subset; every UID already exists in Appendix 1. It can supplement cited evidence, never add 26 projects. Defer its free-text history in the first adapter: several histories appear copied from unrelated owners/projects. A later enrichment must reconcile by UID and cite conflicts instead of silently overriding the inventory forecast.

## C2 mapping proposal

Use source/group `spp-tracking`, edition `2026-q3`, name `SPP project tracking`; IDs `spp-tracking:<UID>`, `recordUnit=upgrade`, `recordKind=transmission-project`, explicit `parentProgramId=spp-tracking:pid:<PID>`. Keep upgrade name and full description, PID/project name, NTC alias, study/type and positive voltage values; zero placeholders are not kV values. ProjectOwner (D) is explicit owner evidence, with source-scoped IDs, not publisher identity. The seven TBD values remain null owners and retain raw sponsor text.

Reconcile documented source aliases before owner comparison: EKC/WR → `spp-owner-ekc`, EM/KCPL → `spp-owner-em`, EMW/GMO → `spp-owner-emw`. Evidence is linked in sample.json: [SPP PCWG materials](https://www.spp.org/Documents/64759/PCWG%20Minutes%20and%20Attachments%2020210602.pdf), PDF pp.109–110, owner cells for UIDs 82116 and 112370; [EKC name change](https://www.spp.org/documents/62482/20200626_3220r1%20evergy%20ks%20central%20%26%20sunflower%20%26%20itc%20great%20plains%20interconnection%20agreement_er20-2187.pdf), PDF p.2; [EMW/GMO name change](https://www.spp.org/documents/62499/20200630_3024r1%20evergy%20missouri%20west%20and%20transource%20missouri%20interconnection%20agreement_er20-2278.pdf), PDF p.11 recital A. Do not merge these three utilities under an inferred ultimate parent or assert global identity.

Project.date prefers the owner forecast (I), then RTO need (J), else unknown. Preserve I/J and NTC issue K as separately labeled milestones. None is a construction start or interval. SourceUpdatedOn stays null. The report cover/revision history explicitly gives **July 7, 2026, version 1.0**; the archive index posts **August 5, 2026**. Proposed publishedOn/lifecycle source-edition anchor is 2026-07-07, with both dates disclosed and retrieval 2026-09-30. The executive summary contains an inconsistent older reporting-period string; do not derive a uniform activity window from it.

Keep raw State(s) and labeled From/To Bus Number/Name text. All `location` and `nativeGeometry` stay null, `centerRole=unknown`: no coordinates or CRS are supplied. Of retained rows, 13 lack state text and 731 lack both bus names; raw states also contain NA, mixed case and slash artifacts. Literal state labels span 13 states, but this establishes only partial regional inventory, not complete state coverage. No map/model request or geocoding is needed for discovery.

## Limits and next increment

Six source rows and proposed C2 records are in sample.json, including two upgrades sharing a PID, partial service, unknown phase, TBD owner and missing forecast/endpoint names. The source qualifies independently of missing coordinates. After coordinator acceptance, connect those six then reconcile all 1,422 workbook rows with the explicit 1,247/175 split; no new schema is presently required.

[SPP terms](https://spp.org/terms-conditions/), Copyright section, permit cited copying subject to restrictions and require express authorization for commercial use. Public accessibility does not establish an open-data license or commercial permission. No contact or permission request was made.

Necessary public enumeration/meaning pass: **08:46:10–08:51:38 UTC, 5.47 minutes**, within the 15-minute limit. Subsequent work only packaged these findings. No production adapter, worker tests or visual work were performed.
