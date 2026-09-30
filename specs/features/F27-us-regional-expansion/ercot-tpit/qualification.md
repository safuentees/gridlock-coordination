# ERCOT TPIT public inventory qualification

Qualified source access and complete enumeration on 2026-09-30 within the assigned 15-minute bound. **A conservative proposed import retains 1,766 TPIT records: 795 with explicit transmission-equipment quantities and 971 distribution/unresolved context records. None has native geometry.** This is a mapping proposal for coordinator acceptance, not a production inventory or a claim that every TPIT entry is a construction project. Six cited examples are in [sample.json](sample.json).

## Exact source and access

The [official Market Reports index](https://www.ercot.com/gridinfo/sysplan) links the [public July TPIT workbook](https://www.ercot.com/files/docs/2022/03/02/ERCOT-July-Ad-Hoc-TPIT-No-Cost-071326-UPDATE.xlsx), posted **July 17, 2026**. The workbook title in each TPIT sheet states **as of July 13, 2026**; use that source edition date separately from publication/retrieval. Do not take the URL's old directory date as the edition. Workbook modified metadata is July 17.

Unchanged original: ignored root `inputs/originals/F27-ercot-tpit/ERCOT-July-Ad-Hoc-TPIT-No-Cost-071326-UPDATE.xlsx`, **560,265 bytes**, SHA256 `4a08ea0f26af780f0d63c21304f3969ee876a49b152b827be8b48b8edb655b05`. The public web-text fetch returned 403 for the binary, but one ordinary direct download succeeded without login or credentials. This is not an access blocker. The public planning-guide PDF used below is preserved beside it. No restricted data or confidential cost file was requested.

Derived qualification and adapter fields must exclude **column J (contacts)** and the `TransmissionOwnerProjContac` sheet. Keep the original ignored and unchanged; never export contact data. The no-cost workbook publishes aggregate cost summaries, not project cost evidence suitable for savings claims.

## Meaning and geographic extent

ERCOT's [April 2026 Planning Guide](https://www.ercot.com/files/docs/2026/03/30/April-1-2026-Planning-Guide.pdf), §§6.4.1–6.4.5 (PDF pages 99–101), describes TPIT as TSP-supplied near-term transmission planning information at 60 kV and above. It explicitly permits omissions, including certain early-review, distant-horizon and minor/replacement work. It is not every future transmission project. The [ERCOT profile](https://www.ercot.com/about/profile/index.html) describes a Texas grid footprint covering most state load; **do not claim all Texas transmission or infer coordinates from the footprint**.

The workbook also contains modeling and distribution-context entries: e.g. `FutureTPIT071326NoCost!A8:R8` describes load records, not evidenced line construction. A generator-tie line is transmission equipment, whereas a generation/load proposal alone is not. Quantities and exact project text must support this distinction; the workbook's general title is insufficient for every row.

## Complete enumeration and identity

| Sheet | Data rows | Count | Distinct native IDs |
|---|---|---:|---:|
| FutureTPIT071326NoCost | 3–1431 | 1,429 | 1,424 |
| PlannedTPIT071326NoCost | 3–360 | 358 | 358 |
| CompletedTPIT071326NoCost | 3–264 | 262 | 262 |
| CancelledTPIT071326NoCost | 3–80 | 78 | 78 |
| RTPProjects | 2–90 | 89 | 89 RTP IDs, not additive TPIT projects |

There are **2,127 TPIT rows and 2,122 distinct ERCOT Project Numbers**. Only five IDs repeat: `110733` (Future rows 363/364), `110749` (365/366), `110751` (536/542), `110753` (919/921), and `102795` (1175/1176). Each pair is identical across all non-contact fields. Coalesce only these identical native-ID payloads, preserve both locators, and ledger the redundant row. A future nonidentical repeated ID must be surfaced as a conflict, not overwritten.

Column A is the source-assigned ERCOT Project Number. Preserve its full string, including leading zeros and alphabetic suffixes such as `105622A`. Column AE Phase Number and AF MOD Project Number explain related modeling granularity; 1,768 nonterminal TPIT IDs span repeated MOD groups. Never collapse rows by MOD number, owner number, title, bus or similar name. Treat rows conservatively as source components (`recordUnit=component`), not proven distinct engineering projects. Preserve related IDs with their field labels; do not invent parent IDs. Cross-edition reuse of the issued ID is the proposed adapter identity rule; this qualification inspected one edition.

## Lifecycle and proposed full-scope partition

The tabs and status column can disagree. Completed contains 104 Planned and 11 Under Construction status strings; Cancelled contains 37 Planned. The workbook's `Cost Summary Info` explains its tab grouping, and `TSPResponsibility!A16:B16` distinguishes actual energization reporting. Proposed precedence: **Completed and Cancelled tab disposition first**, then explicit In-Service in Future/Planned, then remaining status. Preserve contradictions in the exclusion ledger; never infer completion from an elapsed projected date.

After coalescing five repeated rows and excluding Completed 262, Cancelled 78 and 14 In-Service rows in Future/Planned, **1,768 nonterminal distinct TPIT entries remain**: 1,409 Planned, 31 Under Construction, 292 Conceptual and 36 blank. Map only Planned → planned and Under Construction → under-construction. Conceptual/blank remain unknown, with raw status retained.

The following ordered, reproducible **conservative proposal** quantifies physical evidence separately from context. It is not a source-supplied project-kind field:

| Rule on the 1,768 nonterminal IDs | Count | Proposed handling |
|---|---:|---|
| O or P circuit miles >0, Q autotransformer MVA >0, or R is a numeric nonzero reactive-Mvar value | 795 | Retain as transmission-project, with exact quantity-field evidence |
| No above metric; B+C explicitly contain `load record`/`load records`, and no physical-work term below | 2 | Exclude as explicit model-only records |
| No above metric; B+C explicitly contain `distribution transformer`/plural | 18 | Retain proposed planning-context; do not assert transmission construction |
| All other nonterminal entries | 953 | Retain proposed planning-context with physical scope unresolved; do not label them non-transmission or invent missing scope |

For the two model-only exclusions, physical-work terms conservatively retain ambiguous rows as context: whole-word prefixes `line`, `substation`, `switchyard`, `breaker`, `transformer`, `reactor`, `capacitor`, `rebuild`, `reconductor`, `upgrade`. Match case-insensitively against B+C only. Numeric conversion of O/P/Q must be finite; blank, multiple-value or malformed text is not positive evidence. R requires an actual numeric cell with a nonzero value; do not parse a text list as a single quantity. A zero or absent quantity never proves absence of physical work. The 795 evidence-backed entries comprise 645 Planned, 25 Under Construction, 123 Conceptual and 2 blank; one has missing voltage, which stays unknown.

Proposed retained count: **795 + 18 + 953 = 1,766**, with **no located or spatially eligible records**. Proposed full workbook project-table ledger: **2,216 rows = 1,766 retained + 450 exclusions** (5 duplicates, 262 completed, 78 cancelled, 14 explicitly in-service, 2 model-only, 89 supplemental RTP rows). Supporting summary/definition/contact sheets are not project tables. Context counts must remain distinct from evidenced physical transmission counts. The material acceptance decision is this conservative kind partition; it must not silently become “1,766 transmission projects.” Coordinator proposes a narrow `planning-context` record-kind extension for the 971 context records; the existing capital-context label would assert capital scope not established by these rows. No schema change is included here.

## RTP overlap and reconciliation

Planning Guide §6.4.4 explicitly says an RTP project can gain a TPIT ID while remaining in the regional-plan section. Do not append the 89 RTP rows as 89 unique active projects: all their status cells are blank. Four RTP rows provide six explicit TPIT ID references; only `71178` and `65648` exist in this workbook, while `67170`, `63661`, `65642` and `45640` are absent. TPIT column AG independently links `76135` to RTP `2022-NC6`. Preserve these exact links/directions and unresolved references. Missing links do not establish uniqueness, cancellation or completion. No name-based merging. The first adapter can retain this table as supplemental ledger/context evidence; broader independent RTP import needs lifecycle and identity qualification.

## C2 field mapping

| Target | Source and meaning |
|---|---|
| `sourceId`, stable Project ID | A full native string; coordinator assigns source key, then `<sourceKey>:<nativeId>`. Edition is excluded from stable ID. |
| Name/description | B/C; 39 nonterminal records lack title and 36 lack both title and description. Use an explicit ID-based label if needed; keep missing source text unknown. |
| Owner vs publisher | I explicitly labels Transmission Owner; all nonterminal rows have a token. Preserve raw token as sponsor and field evidence. Single supported tokens may receive source-scoped IDs after explicit alias handling. Composite/ambiguous owner tokens stay owner=null; never split joint owners, infer parent companies or use contacts/publisher as owner. |
| Lifecycle evidence | G plus source tab, as of `2026-07-13`; `lifecycleDateMeaning=source-edition`. Publication `2026-07-17`, retrieval `2026-09-30`; `sourceUpdatedOn=null` because no row-update field exists. |
| Main comparison date | L Projected In-Service Date, **month precision**. All 1,768 nonterminal dates are datetime cells displayed `mmm-yy`; stored days/minutes do not prove day precision. |
| Supplementary milestones | M Actual In-Service; W submitted for RPG review; X RPG review completed; Y ERCOT board review completed. Preserve all supplied labels/values at month precision and field evidence. Nonterminal rows have 26 actual-date values, including 17 after the source as-of date; keep contradictions explicit, not inferred completion. |
| Geography | E/F named terminals and S/T county text become labeled raw sourceLocation context. No state field: `sourceState=null`; ERCOT footprint belongs in manifest scope. Missing starting county on 177 nonterminal rows remains unknown. Bus names/numbers are not coordinates. |
| Native geometry / center | No latitude, longitude or geometry columns; `nativeGeometry=null`, `location=null`, `centerRole=unknown`. No geocoding. |
| Construction | `constructionStart=null`, `buildWindow=null`; projected/actual in-service and review dates are not construction boundaries. |
| Related identifiers | H associated projects, K owner project number, V RPG number, AE phase, AF MOD, AG RTP; preserve labeled aliases/evidence without deduplicating on them. |

## Reuse, remaining decision and handoff

ERCOT's [Terms of Use §5](https://www.ercot.com/help/terms) allow reuse of public raw data in compilations/charts/analyses and separately address unchanged contents with notices. Keep source attribution and the untouched original; do not claim ERCOT endorses the derived classification or guarantees accuracy. No special open-data license label is invented.

Access, enumeration, month precision, owner-field meaning and absent native geometry are established. **The unresolved issue is record-kind qualification, not acquisition:** accept the explicit conservative physical/context/model-only rules above or assign narrower source clarification before a producer. No broad physical-project total is justified from the workbook alone. Coordinator also assigns exact source/reporting IDs and producer paths and accepts terminal-tab precedence. Then connect six appropriately retained real examples early and reconcile the entire agreed scope; the diagnostic six in this package intentionally include excluded/context cases. No production/shared files, builds, tests, browser automation or visual checks were changed or run.
