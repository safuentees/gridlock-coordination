# WestConnect public TPPL producer — full accepted inventory

Reads only the accepted public `All Projects!A2:AR390` table from `02_10_26__wc_tppl_project_list_public.xlsm`, SHA256 `ed9261738c81311d63afdd6c79b49d04f8e201477e01c0c9c08e5afe37570b3a`. The unchanged original is ignored under root `inputs/originals/F27-westconnect-tppl/`. Uses the existing bundled Python/openpyxl runtime, without added dependencies or macro execution. No private/member workbook, form sheet, comments, contact data or hidden metadata enters derived output.

```sh
python3 scripts/ingest/coverage/westconnect-tppl/extract.py \
  --input inputs/originals/F27-westconnect-tppl/02_10_26__wc_tppl_project_list_public.xlsm \
  --output-dir app/src/data/real/coverage/westconnect-tppl --scope full \
  --generated-at 2026-09-30T10:11:28+00:00
```

The six-record sample was provider-connected at `adc2397` before this full output. `--scope full` now emits all 304 retained records and the complete 389-row disposition ledger. The default `--scope sample` still reproduces the initial six-record increment. The producer and its per-record projection are unchanged from the connected sample, preserving those six values and IDs. `--generated-at` pins generation time for reproducibility, not source freshness. Source hash, table headers, ID uniqueness, lifecycle totals, physical-Other set and reconciliation guards stop changed source material before output. These are production safeguards; no worker schema/build/test checks are run.

| Native projectid | Source row | Diagnostic purpose |
|---|---:|---|
| 5 | 2 | Planned mixed-voltage substation, ordinary numeric identity |
| 17 | 3 | Conceptual lifecycle remains unknown; TBD service year |
| 1236 | 86 | Under Construction with historical 2025 forecast and incomplete `2025-` combined label |
| 1262 | 100 | Physical Other switching station; forecast 2027 differs from combined `2029-1262` label; source modified date |
| 1595 | 287 | Physical Other capacitor bank explicitly 69 kV despite Below 115 kV category |
| 1641 | 332 | Distribution-substation name/scope conflicts with Transmission Line type; planning-context |

Project IDs are `westconnect-tppl:<projectid>`, independent of forecast and edition. Column S is only a labeled source reference. Never use its 55 stale/incomplete labels as identity or dates. Source rows are not deduplicated by title, corridor, sponsor or another inventory; parent IDs remain null.

Full accepted source scope is **389 = 304 retained + 85 excluded**. Exclusions are 65 In-Service, 16 Withdrawn and exact generation-only IDs 1575/1579/1580/1581. Withdrawn does not mean uniformly cancelled. The full ledger is **304 imported + 85 excluded + 0 pending + 0 failed**, with zero located records. Sample mode still reconciles six imported, 85 excluded and 298 pending. Full lifecycle counts are 244 planned, 56 unknown Conceptual and four under-construction. Planned/base-plan inclusion does not prove regulatory approval, and elapsed forecasts never update lifecycle.

Explicit distribution-substation IDs 792/1204/1479/1641 remain planning-context; the other 300 retained records are accepted transmission-projects. The exact 31 physical Other IDs are encoded as a source-qualified set and recorded in `source-quality.json`, not a general Other-to-transmission inference. Descriptions retain mixed scope and physical generation interconnections; only the four accepted generation-only IDs are excluded. No voltage threshold determines kind.

The accepted comparison milestone is N InService: 254 year-precision values and 50 unknown TBD values across retained scope. Construction intervals remain null. AO modifieddate alone maps to sourceUpdatedOn; numeric Excel serials use the workbook epoch. Its raw value and locator remain in notes. AP ChangeTime, AQ POST_DATE and AR DateProjectEntered preserve their original labels/raw values but are neither comparison milestones nor lifecycle-change dates. `lifecycleAsOf=2026-02-10`, source-edition meaning; March 26 library posting is separate context, with publication unknown.

Raw sponsor, Origin, Termination, StateTraversed, voltage category, approximate length, purpose/drivers and supplied planning/permit flags remain source evidence. Sponsor means owner or developer, so all owners remain null. Multiple/blank states are not allocated to places. No geometry, centers, geocoding, routes or sharing calculations are added. Explicit kV expressions may be read from names/descriptions and exact categories; Below 115 kV itself supplies no exact voltage.

`dataset.json` is provider-ready Dataset v2; `manifest.json` repeats its source manifest; `row-ledger.json` cites all 389 dispositions; `source-quality.json` separates full accepted scope from the emitted scope and records identifier/classification/date limitations; `payload-sizes.json` measures Dataset UTF-8 payloads. Full Dataset size: **748,620 compact / 1,011,996 formatted bytes**.

The [public list](https://doc.westconnect.com/Documents.aspx?NID=21174&dl=1) and [public guide](https://doc.westconnect.com/Documents.aspx?NID=21028&dl=1) are distinct from private member/NDA materials. This is partial regional evidence for authorized private factual analysis. No original-workbook publication, open-data license or unrestricted commercial reuse is asserted. The original stays outside Git. Coordinator alone owns provider connection and milestone checks.
