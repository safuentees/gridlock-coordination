# CUC FY2025 reported grid work producer

This independent standard-library adapter projects the accepted factual catalog against exact preserved original hashes. It emits three provider-ready diagnostics first, then stops for coordinator connection. No original PDF, image, contact data or copied source prose is published.

```sh
python3 scripts/ingest/coverage/mp-cuc-ccr/normalize.py \
  --original-dir inputs/originals/F27-mp-cuc \
  --output-dir app/src/data/real/coverage/mp-cuc-ccr --scope sample \
  --generated-at 2026-09-30T10:59:16+00:00
```

Run from the project root containing the ignored originals, or provide its absolute input path from an isolated worktree. The fixed generation time makes this sample reproducible; it does not update source status. `catalog.json` freezes source hashes, factual paraphrases, locators, accepted classifications and every source-row disposition. A new edition requires explicit identity review. Hash, identity and reconciliation guards are production safeguards, not worker runtime/schema checks.

| Frozen source locator | Diagnostic |
|---|---|
| `fy2025-p04-power-b06` | Saipan PP1–CHCC underground distribution; construction application pending |
| `fy2025-p04-power-b16` | Tinian/Rota combined pole entry; never split into invented project IDs |
| `fy2025-p04-power-b17` | Saipan design-phase poles; printed p2 supplies island context |

Project IDs prefix these locators with `mp-cuc-ccr:`. They are source references, not native engineering IDs. Sample ledger: **26 = 3 imported + 18 excluded + 5 pending, zero failed/located**. The full accepted source has five capital-project-context entries (bullets6/8/16/17/18) and three planning-context entries (5/19/20); four planned and four unknown lifecycle. All three emitted diagnostics are capital-project-context/planned. October2025 is the publication month and lifecycle-as-of; publication day is unknown. Printed p4 power bullets define the complete boundary; p2 supplies evidence only. The legislature copy is not imported a second time.

All records retain unknown owners, service/need dates, construction bounds, locations/native geometry and center roles. Explicit modeled voltage values remain model evidence; no voltage threshold confers a transmission role. Rota’s 15 kV model line type and 13.8 kV terminal do not establish an operating voltage. Source islands, terminals, program labels, operator identity, budget years and elapsed forecasts do not fill missing fields.

`dataset.json` is Dataset v2; `manifest.json`, `row-ledger.json`, `source-quality.json` and `payload-sizes.json` preserve the bounded scope and pending work. Sample payload is **9,529 compact / 12,400 formatted UTF-8 bytes**. Both CNMI scopes are contextual inventories, not transmission-qualified coverage or a territory project census. No source is silently merged or deduplicated across editions.

After coordinator connection, `--scope full` can emit the complete accepted catalog while preserving diagnostic values/IDs. Full output has not been generated in this increment. Source reuse is concise factual private analysis with citations; no open/commercial license or original-PDF publication is asserted. Coordinator alone integrates and checks; no worker checks ran.
