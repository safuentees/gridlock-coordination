# CUC IRP network recommendations producer

This independent standard-library adapter projects the accepted factual catalog against exact preserved original hashes. It emits three provider-ready diagnostics first, then stops for coordinator connection. No original PDF, image, contact data or copied source prose is published.

```sh
python3 scripts/ingest/coverage/mp-cuc-irp/normalize.py \
  --original-dir inputs/originals/F27-mp-cuc \
  --output-dir app/src/data/real/coverage/mp-cuc-irp --scope sample \
  --generated-at 2026-09-30T10:59:16+00:00
```

Run from the project root containing the ignored originals, or provide its absolute input path from an isolated worktree. The fixed generation time makes this sample reproducible; it does not update source status. `catalog.json` freezes source hashes, factual paraphrases, locators, accepted classifications and every source-row disposition. A new edition requires explicit identity review. Hash, identity and reconciliation guards are production safeguards, not worker runtime/schema checks.

| Frozen source locator | Diagnostic |
|---|---|
| `2025-p055-t45-r03` | Saipan Kalabera modeled connections; separate aggressive-scenario values retained |
| `2025-p055-t45-r07` | Tinian Marpo Heights modeled connection |
| `2025-p055-t45-r09` | Rota model-line and terminal ratings kept distinct; normalized operating voltage unknown |

Project IDs prefix these locators with `mp-cuc-irp:`. They are source references, not native engineering IDs. Sample ledger: **10 = 3 imported + 7 pending, zero exclusions/failed/located**. All ten accepted Table45 rows are planning-context with unknown lifecycle. The source cover edition is 2025-03-27; publication day remains unknown. All seven printed Table25 scenario rows, including the repeated Naftan entry, are accounted separately in the catalog and source-quality file and do not become extra projects. Other narrative RTU work remains supplementary, not an invented asset list.

All records retain unknown owners, service/need dates, construction bounds, locations/native geometry and center roles. Explicit modeled voltage values remain model evidence; no voltage threshold confers a transmission role. Rota’s 15 kV model line type and 13.8 kV terminal do not establish an operating voltage. Source islands, terminals, program labels, operator identity, budget years and elapsed forecasts do not fill missing fields.

`dataset.json` is Dataset v2; `manifest.json`, `row-ledger.json`, `source-quality.json` and `payload-sizes.json` preserve the bounded scope and pending work. Sample payload is **8,929 compact / 11,102 formatted UTF-8 bytes**. Both CNMI scopes are contextual inventories, not transmission-qualified coverage or a territory project census. No source is silently merged or deduplicated across editions.

After coordinator connection, `--scope full` can emit the complete accepted catalog while preserving diagnostic values/IDs. Full output has not been generated in this increment. Source reuse is concise factual private analysis with citations; no open/commercial license or original-PDF publication is asserted. Coordinator alone integrates and checks; no worker checks ran.
