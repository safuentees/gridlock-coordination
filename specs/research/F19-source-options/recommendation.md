# F25 recommendation

Qualify **`ca-sce-tpr` / `2026-06-01`** for F26-C1. Use the [six source rows](representative-records.json), [source accounting](source-options.md) and original public workbook. No application data, schema or importer has changed.

The first composition sample should use **SP-01** (`CPUC TPR Public!A355:CM355`): a planned 230kV substation project with a published center and projected in-service milestone. The other examples establish necessary cases: PB-02.01 (two endpoints and ongoing-replacement caveat), SP-05 (three points), PB-32.03 (missing location), PB-04.01 (unknown lifecycle) and SP-118 (on-hold). Do not create a proximity-pair promise from this sample.

Agree these interfaces before dispatching implementation:

1. Stable source/native ID independent of edition; preserve TPR line IDs and repeated work-order aliases separately. Manifest records source edition, retrieval, original checksum, complete raw-row accounting and sample/full scope.
2. Separate SCE reporting group, CPUC process authority, geographic extent and nullable asset owner. Project Manager is not owner. The canonical core owner defines eligibility; a new reporting source cannot be encoded as `desc` or `gpc`.
3. Retain transmission-capital work type, raw lifecycle, on-hold and unknown cases. Keep operational/canceled exclusions auditable. The 167-row scope includes ancillary work and unknown program-like context, not just new lines.
4. Preserve published coordinate collections, role, unknown CRS/accuracy and unverified confidence. A source center can be displayed with its caveat; any latitude/longitude datum assumption or radius eligibility must be explicit. The two-endpoint midpoint and multi-point policy belong to the authoritative core/interface, not this sample. No route is inferred.
5. Preserve construction start separately from projected-or-actual in-service. Do not form a construction interval from those two fields. Retain notes where an operating asset has unfinished replacement work.

Then connect SP-01 early through the shared preview/apply path while the producer reconciles the **full 494 source rows** into 167 proposed retained project lines and 327 explicit exclusions (44 program aggregates, 279 operational, 4 canceled). Full located count remains unmeasured. The six-row sample has four coordinate-bearing rows, but only a subset presently has a direct usable single-point role; missing records remain visible.

Estimated implementation effort after contract agreement: 0.5–1 engineer-day for extraction/identity/lifecycle accounting; 0.5–1.5 days for geographic/date normalization and retained-work integration. These are engineering estimates, not research-budget extensions. Refresh from the next public SCE edition with native-ID/change-field reconciliation; absence is never silent deletion. A second independent regional inventory is required for geographic expansion, and all uncovered jurisdictions remain open.

The [existing F19 proposal](../../../app/src/data/evidence/f19-location-proposals.json) remains available separately and is not national expansion. SDG&E is an accessible location-poor next adapter; MISO is still unqualified, and EIA generation is outside the selected transmission scope. Public-download reuse terms, unknown coordinate datum/accuracy, ownership and multi-point center policy remain explicit limitations rather than invented facts. Acquisition has stopped; timing and the first-pass overrun are recorded in source-options.md. No worker tests or visual verification were performed.
