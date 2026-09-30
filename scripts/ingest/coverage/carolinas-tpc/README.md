# CTPC source catalog and normalizer

Accepted contract: 1732ccf, `specs/features/F27-us-regional-expansion/carolinas-tpc/spec.md`. The public August 2026 update's PDF/printed pages 8–17 define 120 native-ID project rows: 98 reliability, 17 public policy and five MVST. The reviewed factual catalog retains every ID, locator, raw status, owner token and disposition. Six diagnostic rows additionally contain their complete qualified project/issue/date/cost fields. Full normalization remains pending the coordinator's connection and dispatch; `--scope full` refuses incomplete retained catalog rows.

Originals are unchanged under coordinator `inputs/originals/F27-carolinas-tpc/`. The producer hash-pins all three inputs: update PDF `1f16698d87d414c98478e0f1199a062211c0f2873417fd7ba185c81d49d45753`, supporting final plan `9374c5f9565ce77d14ea1499b2dd8589a55725ee8609994bcd0d1f12a4437099`, and official index `f7b83048262fbd8b34bbc43310a9a1220ab8305baf0508fa9f1ce86bb4252061`. URLs and file names are in catalog.json. The source is a public factual catalog, not permission to redistribute original documents. No maps, contacts, models or restricted documents are used.

```sh
python3 scripts/ingest/coverage/carolinas-tpc/extract.py \
  --originals-dir '/absolute/path/inputs/originals/F27-carolinas-tpc' \
  --output-dir app/src/data/real/coverage/carolinas-tpc \
  --scope sample --generated-at 2026-09-30T11:34:49+00:00
```

Current reconciliation: **120 = 6 imported + 22 excluded + 92 pending**, no failed/located records. Seventeen In-Service and five Removed rows are terminal exclusions immediately. The six exact diagnostics are W170306, W210482, E200161, E240038, CTPCDEC01 and MVSTDEC03 (stored in source-table order). Sample classes: four transmission and two planning context; lifecycle four planned and two unknown. Full accepted scope is 89 transmission/planned plus nine conceptual planning-context/unknown observations.

Preserve native IDs and whole named project packages. Underway spans budget provision through construction and therefore maps conservatively to planned. Conceptual never becomes an approved/planned project. DEC/DEP singular responsible-owner tokens use source-scoped identities; composite DEC/DEP remains null owner. All locations, per-row geography, construction windows and update days remain unknown. June1/December1 targets become displayed year precision with raw season meaning retained, including winter crossing calendar years. E200161's June30 estimate remains day precision despite its still-Underway status; elapsed forecasts do not establish completion. Costs remain labeled rounded nominal expenditure context, not benefits.

Outputs are Dataset2, source manifest, exhaustive row ledger and measured payload sizes. Sample dataset: **37,288 compact / 46,882 formatted UTF-8 bytes**, including final newline. Use the recorded generatedAt for exact reproduction; it is not source freshness. No worker tests/build/visual checks ran. Coordinator owns provider connection, remaining dispatch and milestone checks.
