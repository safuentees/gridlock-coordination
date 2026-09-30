# ERCOT TPIT producer

Input is the unchanged public `ERCOT-July-Ad-Hoc-TPIT-No-Cost-071326-UPDATE.xlsx` (SHA256 `4a08ea0f26af780f0d63c21304f3969ee876a49b152b827be8b48b8edb655b05`), preserved under ignored `inputs/originals/F27-ercot-tpit/`. Use Python with the existing openpyxl runtime; no application dependency is added.

```sh
python3 scripts/ingest/coverage/ercot-tpit/extract.py \
  --input inputs/originals/F27-ercot-tpit/ERCOT-July-Ad-Hoc-TPIT-No-Cost-071326-UPDATE.xlsx \
  --output-dir app/src/data/real/coverage/ercot-tpit \
  --scope sample --generated-at 2026-09-30T09:10:00Z
```

`--scope sample` is the default and emits six retained records; other retained rows remain pending. Run `--scope full` only after the coordinator connects the first sample. Hash, repeated-ID and reconciliation guards reject unqualified changes before output. These are production extraction guards, not a test suite. The coordinator alone runs shared schema/build checks.

Use the accepted mapping in `specs/features/F27-us-regional-expansion/ercot-tpit/spec.md`. Native A IDs retain suffixes/leading zeros. Only the five approved equal non-contact duplicate payloads coalesce, with both locators retained. Phase, MOD, owner-project and RTP references remain labeled aliases, never parents or deduplication keys. Record units are components, with native-id identity basis.

Classification is ordered: finite positive O/P circuit miles or Q autotransformer MVA, or an actually numeric nonzero R reactive Mvar value, establishes transmission equipment. Otherwise explicit `load record(s)` in B+C without the accepted physical-work terms is model-only and excluded. Remaining `distribution transformer(s)` and unresolved scope are planning-context. Quantities, classification fields and citations remain in the ledger; missing/zero quantities do not prove absence of physical work. Completed/Cancelled sheet disposition precedes stale G status; Future/Planned In-Service is excluded. Planned and Under Construction map directly; Conceptual/blank stays unknown.

The exact single-owner token allowlist is in the extractor. Tokens are preserved as names and given `ercot-<lowercase-hyphenated-token>` source-scoped IDs, with I-cell evidence. There are no alias expansions; generic `AEP`, joint/composite and unrecognized labels remain owner=null. Contacts in J and the contact worksheet are never accessed by the extractor or written to any derived output.

L/M/W/X/Y dates use source-displayed month precision. Main comparison uses projected L only; all supplied milestones remain supplementary with their labels. Year 9999 in any L/M/W/X/Y cell becomes an unknown/unusable milestone, with the exact raw cell and locator retained in source notes/ledger. `source-quality.json` counts these cells across all source rows, retained distinct rows and the emitted batch. Other reported actual dates do not override lifecycle. Terminal/county names are context, sourceState is null, and geometry/windows remain null.

`row-ledger.json` reconciles all 2,216 project-table rows. `rtp-context.json` preserves the 89 supplemental RTP rows and exact forward/reverse links, including unresolved references; it does not add projects. The full accepted target is 1,766 retained (795 transmission + 971 planning-context), 450 excluded, zero failed/pending. Sample counts are 6 retained, 450 excluded, 1,760 pending. `payload-sizes.json` reports actual UTF-8 source Dataset sizes.

Source: [ERCOT public TPIT](https://www.ercot.com/gridinfo/sysplan); [Terms of Use §5](https://www.ercot.com/help/terms). Public raw data is attributed for analysis; no ERCOT endorsement, complete Texas coverage, geometry or realized benefit is claimed.
