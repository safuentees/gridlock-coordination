# CTPC source catalog and normalizer

Accepted contract: 1732ccf, `specs/features/F27-us-regional-expansion/carolinas-tpc/spec.md`. The public August 2026 update's PDF/printed pages 8–17 define 120 native-ID project rows: 98 reliability, 17 public policy and five MVST. The factual catalog retains all native IDs, locators, full named scopes, issue text, raw status/owner/date/cost cells and dispositions. The coordinator connected six diagnostic records at b03d608 before dispatching the complete import; their project values and IDs remain unchanged.

Originals are unchanged under coordinator `inputs/originals/F27-carolinas-tpc/`. The normalizer hash-pins all three inputs: update PDF `1f16698d87d414c98478e0f1199a062211c0f2873417fd7ba185c81d49d45753`, supporting final plan `9374c5f9565ce77d14ea1499b2dd8589a55725ee8609994bcd0d1f12a4437099`, and official index `f7b83048262fbd8b34bbc43310a9a1220ab8305baf0508fa9f1ce86bb4252061`. URLs and file names are in catalog.json. Public access does not establish a redistribution license. No maps, contacts, models or restricted documents are used.

`read_table.py` fills the source catalog from pinned PDF text: native-ID/status row endings delimit wrapped project and issue cells in the selected tables, while owner/target/cost retain their source columns. It preserves the six qualified diagnostic catalog entries. It uses pypdf text extraction only, with no rendering. The committed full catalog can be normalized directly; the first command reproduces its remaining raw-cell extraction if needed.

```sh
python3 scripts/ingest/coverage/carolinas-tpc/read_table.py \
  --input '/absolute/path/inputs/originals/F27-carolinas-tpc/2026-08-13-midyear.pdf'
python3 scripts/ingest/coverage/carolinas-tpc/extract.py \
  --originals-dir '/absolute/path/inputs/originals/F27-carolinas-tpc' \
  --output-dir app/src/data/real/coverage/carolinas-tpc \
  --scope full --generated-at 2026-09-30T11:34:49+00:00
```

Complete reconciliation: **120 = 98 imported + 22 excluded**, zero pending/failed/located. Seventeen In-Service and five Removed rows remain terminal exclusions. Imported classes are 89 transmission projects and nine conceptual planning-context observations; lifecycles are 89 planned and nine unknown. Native table order is retained. This completes the declared update table scope, not all North/South Carolina projects. Previous plans and change summaries do not create extra runtime rows.

Underway spans budget provision through construction, so it maps conservatively to planned. Conceptual never becomes approved construction; three MVST concepts remain explicitly unapproved. Singular DEC/DEP responsible-owner tokens use source-scoped identities; composite DEC/DEP remains null owner. All locations, per-row geography, construction windows and update days remain unknown. June 1/December 1 targets retain only displayed year precision with raw seasonal meaning, including winter crossing calendar years. E200161's June 30 estimate remains day precision despite its still-Underway status. Costs are rounded nominal expenditure context, not benefits; missing values remain unknown. Multi-voltage/multi-line packages are not split, related removed IDs are not extra projects, and no cross-source identity is inferred.

Outputs are Dataset2, manifest, exhaustive row ledger and payload sizes. Full source dataset: **565,495 compact / 717,938 formatted UTF-8 bytes**, including final newline. The generation timestamp is retained for reproduction, not source freshness. No worker tests/build/visual checks ran. Coordinator owns integration and milestone checks.
