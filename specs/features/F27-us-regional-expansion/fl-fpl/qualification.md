# FPL public 2026 plan qualification

Recommendation: accept **two explicit scopes totaling 89 primary entries: 55 retained transmission work units and 34 excluded storage-side-only entries**. Schedule 10 alone has 84 forms; the adjacent five-line bulk-transmission table must remain a separate declared scope. The 84 corresponding engineering narratives supply evidence for the forms, not 84 additional projects. This is a finite FPL planning inventory, including Northwest Florida, not complete Florida coverage. No statewide denominator is known.

Public-source clarification ran September 30, 2026, 11:57–12:02 UTC, within the 15-minute bound. Only PDF text was read; no images, maps, restricted sources, application checks or source production were used. The [official FPL index](https://www.fpl.com/about/10-year-site-plan.html) identifies the 2026–2035 plan submitted in April 2026. The [public plan](https://www.fpl.com/content/dam/fplgp/us/en/about/pdf/ten-year-site-plan.pdf) is accessible, 441 PDF pages. The PSC mirror returned a web 502 and a direct TLS EOF; the accessible FPL original is sufficient, and byte equality with the unavailable mirror is not asserted.

## Originals and source dates

Untouched files are ignored under `inputs/originals/F27-fl-fpl/`; no originals enter Git.

| Original | Bytes | SHA-256 |
|---|---:|---|
| `fpl-2026-plan.pdf` | 4,286,567 | `30231eb609f4011fa579030e2294483cb7f34c58aed1a05b72eed1055ddecedd` |
| `fpl-2026-index.html` | 45,466 | `093a5273ae8cff324c2313a342e33dc1a23a0eb77a64ce619695847ee5c0c195` |

PDF p.3 states April 2026 submission; printed p.1 / PDF p.15 says analyses occurred in 2025 and Q1 2026 and forecasts remain tentative. Propose source/group `fl-fpl`, edition and lifecycle-as-of `2026-04` with source-edition meaning, retrieval `2026-09-30`, publication day and row-updated dates null. Do not manufacture April 1 or imply September status refresh. The source copyright remains reserved; concise factual private analysis is proposed, with no original publication or open/commercial reuse claim.

## Complete finite enumeration

1. **Table III.E.1, printed p.96 / PDF p.110, rows 1–5:** five proposed bulk lines requiring Transmission Line Siting Act certification, all retained. The table explicitly supplies line ownership. It is not Schedule 10 and not a complete list of every FPL transmission project.
2. **Schedule 10, forms 1–84, printed pp.315–398 / PDF pp.329–412:** one primary work package per form, 50 retained and 34 excluded. Source number-of-lines is metadata, not an instruction to expand rows: 83 forms say one line; Hendry Solar form21 says zero, although its narrative proposes 500kV bus/breaker work.
3. **III.E.1–84, printed pp.97–180 / PDF pp.111–194:** matching supporting engineering narratives. Join by explicit section/form number plus identity, retain conflicts, and never count twice. Sections include the specific voltage and type of work absent from the terse forms.
4. Schedules 8/9, generation/storage units, demand forecasts, unsited future resources, site maps and other sections are outside the primary denominator. Their rows do not become transmission projects. Schedule9 investment references are not new rows or standalone transmission costs.

| Bulk row | From → to | Circuit miles | kV | Capacity MVA | Projected commercial service |
|---:|---|---:|---:|---:|---|
| 1 | Whidden → Sweatt | 79 | 230 | 1,195 | 2026-06 |
| 2 | Andytown → Oasis | 30 | 500 | 3,464 | 2031-12 |
| 3 | Quarry → Oasis | 15 | 500 | 3,464 | 2033-12 |
| 4 | Oasis → Quarry | 15 | 230 | 1,195 | 2033-12 |
| 5 | Oasis → Levee | 15 | 230 | 1,195 | 2033-12 |

Table footnote1 records need approval on 2022-05-17 and certification conditions received September2022: row1 is approved, without an inferred construction stage. Footnote2 groups rows2–5 as four related Andytown–Oasis lines, need filed 2026-03-11, overall planned service December2033. Keep all four line units, both voltage-distinct Quarry–Oasis rows and the separate row2 December2031 forecast. The program is not an extra project and filing is not approval.

Schedule10 excluded form numbers are **5–11, 14–17, 26–31, 34–39, 57, 59, 61, 63, 65, 69, 71, 73, 75, 77, 79** (34). Each matched III.E narrative limits new work to an existing 34.5kV BESS collector bus and protection, with no additional transmission work or upgrades. These are storage-side work, despite the higher connection voltage printed on Schedule10. This is a scope-based exclusion, not an invented voltage threshold. Do not apply the generic phrase about no additional upgrades to other entries: many retained solar forms explicitly add transmission-side buses, breakers or substations before saying no further upgrades are expected.

The retained complement is **48 solar-linked transmission packages plus two BESS transmission packages** (Lansing Smith form12 and Putnam form13). They explicitly construct or extend transmission lines, buses, terminals, breakers or substations. No generation plant or storage capacity is imported as a project. Zero route miles is not an exclusion when a transmission-side bus/substation modification is explicit. Exact retained and excluded form arrays are in `sample.json`. Proposed ledger: **89 = 55 imported + 34 excluded**, zero pending/failed at eventual full production.

## C2/C3 meanings

| Field | Proposed mapping and limitation |
|---|---|
| Identity | No native engineering IDs appear. Use `identityBasis=source-locator`: `2026-iii-e1-r01`…`r05`, and `2026-s10-001`…`084`, prefixed `fl-fpl:` for runtime IDs. Freeze these edition-bound locators; a new edition requires explicit identity review, never automatic row-number matching. |
| Work unit | All 55 retained are `transmission-project`. Whidden–Sweatt is one project; four related bulk lines and 50 interconnection work packages are components. Do not split every breaker/transformer into another record. No synthetic parent ID; preserve the named program/served facility in context. |
| Lifecycle | One approved bulk line, four planned bulk components, 50 proposed/planned interconnections. Year forecasts and elapsed starts do not establish construction or completion. |
| Owner/publisher | FPL is publisher/reporting group. Only the five bulk rows explicitly say Line Ownership=FPL; a source-scoped FPL owner can be evidenced there. All 50 interconnection owners remain null: FPL-owned right-of-way and no utility participation do not establish ownership of every asset. No global owner alias is proposed. |
| Main date | Five bulk rows have month-precision commercial in-service dates. Schedule10 gives anticipated construction start/end, not a stated transmission in-service date: keep primary date unknown for 50 interconnections. |
| Supplementary dates | Preserve all Schedule10 start/end years as year-precision, kind unknown, with their actual labels. III.E connection quarters remain exact raw labels; year precision may retain the year, but never invent a month/day or claim the schema has quarter precision. Preserve contradictory years side by side. |
| Windows | `constructionStart` and `buildWindow` null: anticipated years are not actual day-precision bounds. |
| Location | All 55 remain unlocated; no native coordinates, roles, CRS or accuracy are supplied in these scopes. Preserve Florida/county/terminal context. Right-of-way, miles, site maps and endpoints by name do not establish a center or route. |
| Units | Schedule10 line kV and bulk nominal kV are voltage. Keep circuit miles, source line counts, transformer/capacity MVA and generation MW as distinct labeled context, never voltage conversions or inferred corridor length. |
| Costs | All84 forms refer transmission/substation investment to Schedule9's total installed cost. No standalone transmission amount is given. Do not import generation $/kW values as transmission cost or savings. |
| Uncertainty | Printed p.96 says longer-term sites are not definitive and transmission analyses may be incomplete; retain that source qualification alongside later detailed proposed work. No work here establishes a mapped or coordination-eligible pair. |

No cross-source FMPA identity relationship is established. Keep its observations separate; matching names, terminals or owner labels do not authorize a merge.

## Six diagnostics and material source discrepancies

`sample.json` contains six cited examples only: bulk rows1/2; retained Schedule10 forms1/13/23; excluded form5. They cover approval/owner evidence, a multi-line program, explicit transmission work, conflicting voltage, conflicting timing and storage-side exclusion.

Preserve these edition discrepancies rather than correcting source facts:

- Form13/III.E.13 (printed327/109): Schedule10 and terminal/string-bus evidence are115kV; narrative itemI.1 labels a new230/34.5kV substation while later items specify115/34.5kV. Retain reported line115kV and the conflicting station statement separately.
- Construction-end year versus narrative connection timing differ for form23 Spanish Moss (2027 vs Q1 2028), form46 Ambersweet (2028 vs Q1 2027), and forms74/75 Ladybug solar/storage (2028 vs Q1 2029; form75 is excluded). These statements have different labels and unresolved timing implications; neither overwrites the other.
- Form31 heading says Orange Blossom but its narrative sentence says Sawgrass; matched III.E.31 says Orange Blossom. It is excluded, but its ledger should preserve the mismatch.
- Form76 heading says Leafcutter while its narrative sentence says Grapefruit; matched III.E.76 says Leafcutter. Keep the heading identity and discrepancy.
- Form58 uses Lilly while nearby forms/narratives use Lily; form82 says Limkin while III.E.82 says Limpkin. Preserve spellings and locators rather than silently merging or repairing them.
- Some endpoint details differ between Schedule10 and the matched narrative, including Spanish Moss and several facilities described as connecting from Witt. Preserve both sourced meanings without geocoding. Repeated item(9) on forms13/42/44 is a repeated field, not another work package.

There is no blocker to the proposed 55-record finite inventory. Coordinator acceptance must freeze the two-scope inclusion rule, the 34 explicit exclusions and the conservative date/owner mapping before any adapter or small-batch production. This qualification changes no application contract or runtime data.
