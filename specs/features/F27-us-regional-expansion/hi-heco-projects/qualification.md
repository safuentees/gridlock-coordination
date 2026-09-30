# F27-HI-Q — Hawaiian Electric featured-project qualification

Recommendation: accept a **featured public subset**, not a Hawaii-wide or utility-wide inventory. The frozen [Investing in the Future index](https://www.hawaiianelectric.com/about-us/our-vision-and-commitment/investing-in-the-future) has seven topics. Four are useful nonterminal records: two transmission improvements, one capital context program and one unresolved planning context. Three topics are excluded. This proposal adds no producer or runtime data.

Source review: **3 minutes 37 seconds**, September 30, 2026, 09:14:32–09:18:09 UTC. Originals are preserved in ignored `inputs/originals/F27-hi-heco-projects/`; hashes and every URL are also in `sample.json`. Review used HTML/PDF text only, without maps, images or application checks. Packaging followed the source pass.

## Exact topic reconciliation

| Index topic | Proposed disposition and evidence |
|---|---|
| [Downtown Honolulu Network Upgrades](https://www.hawaiianelectric.com/about-us/our-vision-and-commitment/investing-in-the-future/downtown-honolulu-network-upgrades) | Retain one `capital-project-context` program. Equipment/cable work is underway; horizon 2030 is not a promised in-service date. Five workstreams remain subordinate context. |
| [Kalaeloa overhead replacement](https://www.hawaiianelectric.com/about-us/our-vision-and-commitment/investing-in-the-future/overhead-power-line-replacement-project-in-kalaeloa) | Retain `transmission-project`, explicitly subtransmission at 46 kV. PUC approved May 27, 2025. Forecast start September 2026 and service April 2027 keep month precision. Index says 21 replacement poles; detail says 20. Preserve conflict. |
| [Waiau transmission structures](https://www.hawaiianelectric.com/about-us/our-vision-and-commitment/investing-in-the-future/waiau-transmission-structure-replacements) | Retain `transmission-project`, planned. Survey/permitting forecast 2030 is not a construction or completion date. Numeric voltage unknown. |
| [Koa Ridge relocation](https://www.hawaiianelectric.com/about-us/our-vision-and-commitment/investing-in-the-future/koa-ridge-46kv-overhead-line-relocation-project) | Exclude completed work: detail explicitly gives December 15, 2023 completion despite the index's future-tense summary. Do not recast completion as a separately asserted in-service date. |
| [North Kohala Microgrid](https://www.hawaiianelectric.com/about-us/our-vision-and-commitment/investing-in-the-future/north-kohala-microgrid) | Retain `planning-context`, lifecycle unknown: mixed proposed line rebuilding/storage with unresolved next steps. Closed storage procurement is not cancellation of the whole concept. |
| [Waiau Repower](https://www.hawaiianelectric.com/about-us/our-vision-and-commitment/investing-in-the-future/waiau-repower) | Exclude generation turbines. |
| [Waena BESS](https://www.hawaiianelectric.com/about-us/our-vision-and-commitment/investing-in-the-future/development-team-projects) | Exclude standalone storage. Its linked page's historical Keahole mention is outside this seven-topic universe. |

**7 topics = 4 retained + 3 excluded; no pending/failed topics.** All four examples are supplied, with zero established centers. These are source topics/programs, not a claim of four distinct engineering projects. Do not split pole counts, phases, downtown workstreams, or the North Kohala BESS into invented extra rows.

The [2026 annual update](https://hawaiipowered.com/igp/2026-0001_2026-06-30_IGP_Action_Plan_2026_Annual_Update.pdf), §1.3.7, printed page 10 / PDF page 18, confirms North Kohala is being reevaluated after funding efforts failed. This newer evidence supplements its page dated March 19, 2024. Existing-line 34.5 kV is context, not BESS voltage. Ownership of a controller is not ownership of the entire mixed proposal.

## Identity, schema and uncertainty proposal

- Use `hi-heco-featured:<page-slug>`, `inventory.identityBasis=source-locator`. These are reproducible page references, **not native engineering project IDs**. Dockets 2023-0345 and 2022-0012 are proceeding aliases. Slug changes, topic splits and future-edition continuity require explicit review; do not merge by similar titles.
- Publisher/reporting group is Hawaiian Electric. The retained pages support its sponsor/implementation role, but do not establish complete project-asset ownership. All four `owner` values stay null; no source/global owner identity is fabricated.
- Coordinates/native geometry stay null, center role unknown; street/substation/island names remain raw location context. No map interpretation or geocoding. All four are ineligible for spatial candidates under the existing gate.
- Forecast date kinds stay explicit. Kalaeloa's service forecast is `in-service`; program horizon and survey/permitting are `unknown` kind with meaningful labels. No day invented from month/year, no construction interval inferred, no calendar-driven promotion to construction. Unstated raw status stays null while the documented lifecycle mapping is preserved.
- Snapshot edition `snapshot-2026-09-30-7a3266df`; publication day unknown, retrieval September 30, 2026. Topic lifecycle observations use `snapshot-observed`; North Kohala's updated assessment cites the June 30, 2026 annual filing as `source-edition`. Page update, source publication and forecast milestones remain separate.
- After acceptance and exhaustive production, `scope=full` may describe **only this seven-topic snapshot**. Manifest limits must prominently exclude utility/statewide completeness, other Hawaii utilities, unlisted projects and current status beyond the evidence. This qualification JSON is not a Dataset.

## Broader public inventory examined

The index's [Integrated Grid Planning link](https://www.hawaiianelectric.com/clean-energy-hawaii/integrated-grid-planning) leads to the [official report library](https://hawaiipowered.com/igp/). The current June 30, 2026 annual filing (posted July 8) has five named distribution examples in §1.3.2, printed page 8 / PDF page 16: Kewalo T4, Waikoloa T2, Waipio Tsf 3, Auiki and an energized Kulanihakoi entry. The text explicitly presents examples, not exhaustive coverage. They are outside this proposed featured-topic boundary and are not silently appended.

The annual REZ attachment references the [November 2021 transmission REZ study](https://www.hawaiianelectric.com/a/9996). Its §§2–3 (printed/PDF pages 11–13), Table 5-7 (page 33), and conclusions (pages 58–59) establish conditional network alternatives used in resource modeling. Different options, zone enablements and offshore sensitivities overlap. The 2040 planning target is not a project service date. The current attachment also uses partial screenshot tables for project-step estimates (printed page 15 / PDF page 59); no image interpretation was attempted. The [2023 Appendix C](https://hawaiipowered.com/igp/06_IGP-AppendixC_DataTables.pdf) is resource/adequacy/operating data, not a transmission-project register.

**Broader-source limitation:** a dated, enumerated project register or an accepted scenario/option-level identity and deduplication contract is needed before treating these studies as a larger engineering inventory. The official sources are accessible; access is not the blocker. They do not establish a complete current statewide project universe. A separately scoped REZ planning inventory remains possible, but must retain alternatives and historical study meaning instead of presenting them as committed work.

## Preserved sources

| Original | SHA256 |
|---|---|
| [downtown-honolulu-network-upgrades.html](https://www.hawaiianelectric.com/about-us/our-vision-and-commitment/investing-in-the-future/downtown-honolulu-network-upgrades) | `cc8cefb70189f8e8be588702e0727c5daa884b7530701ed3eb2455b4d7a7e8d1` |
| [overhead-power-line-replacement-project-in-kalaeloa.html](https://www.hawaiianelectric.com/about-us/our-vision-and-commitment/investing-in-the-future/overhead-power-line-replacement-project-in-kalaeloa) | `526ba09c612c6f7528416671e5e9b1a5ed9ba6f3174ed6fc562a5940ff68be3a` |
| [waiau-transmission-structure-replacements.html](https://www.hawaiianelectric.com/about-us/our-vision-and-commitment/investing-in-the-future/waiau-transmission-structure-replacements) | `8f5d78c11f19111ebbbb6a9dde9c859aec4acf46d323a2beffd19cbe854ac801` |
| [koa-ridge-46kv-overhead-line-relocation-project.html](https://www.hawaiianelectric.com/about-us/our-vision-and-commitment/investing-in-the-future/koa-ridge-46kv-overhead-line-relocation-project) | `043f0dcb6bb256add458dea2a040a322e3c4685076d2449a92bc32b7990fee27` |
| [waiau-repower.html](https://www.hawaiianelectric.com/about-us/our-vision-and-commitment/investing-in-the-future/waiau-repower) | `39b7bed11d4afafb234c14f4e899e8bd955942c1ecbba30190930214359ded0e` |
| [north-kohala-microgrid.html](https://www.hawaiianelectric.com/about-us/our-vision-and-commitment/investing-in-the-future/north-kohala-microgrid) | `446df9d7c52dfdcd910d7980e3e35739e6a6e29de3080520b3696f262eda925b` |
| [development-team-projects.html](https://www.hawaiianelectric.com/about-us/our-vision-and-commitment/investing-in-the-future/development-team-projects) | `04d9cb1a17147f2f90aebb4039fc15daf6c04775ced9646ea402f9fddf2f66e0` |
| [investing-in-the-future.html](https://www.hawaiianelectric.com/about-us/our-vision-and-commitment/investing-in-the-future) | `7a3266df72a13e0312daea561e685d2fba1fab86ef48648d634c6f453ac98c2d` |
| [integrated-grid-planning.html](https://www.hawaiianelectric.com/clean-energy-hawaii/integrated-grid-planning) | `d27a23ec71641d7c0f9be62b82b101b5eb70b37b347c4a7869b5441fb87babdf` |
| [igp.html](https://hawaiipowered.com/igp/) | `1ad527f64907ede1e47c2d43aa39a66a74f1434cfc2ccbc5e355d950e2378cd3` |
| [key-stakeholder-documents.html](https://www.hawaiianelectric.com/clean-energy-hawaii/integrated-grid-planning/stakeholder-and-community-engagement/key-stakeholder-documents) | `4abe6bb2d9e71b4e5bdc4eb4cfe3d17a350a4f9c46f8d214d6808a2981c1fd90` |
| [2026-06-30-igp-action-plan-annual-update.pdf](https://hawaiipowered.com/igp/2026-0001_2026-06-30_IGP_Action_Plan_2026_Annual_Update.pdf) | `d40aa4ae0c551a5de2206e3366213c673ff6c18ccf19cddc84d8596c362295d2` |
| [2023-igp-appendix-c-data-tables.pdf](https://hawaiipowered.com/igp/06_IGP-AppendixC_DataTables.pdf) | `32f75a416fe75669650ed62cecb4b769918f419b3fc381d8f4e841dab7570553` |
| [2021-11-transmission-rez-study.pdf](https://www.hawaiianelectric.com/a/9996) | `a2ea94fe1dcadce2315a15de1f922accd310f42de898b1158dc233da418e7173` |

Coordinator acceptance of the four-record mapping, especially North Kohala context, is required before producer ownership is dispatched. No checks were run.
