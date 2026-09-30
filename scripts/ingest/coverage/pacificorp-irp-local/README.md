# PacifiCorp historical local improvements — full accepted local scope

Normalizes the separately accepted 20 local-improvement bullets in the March 31, 2025 IRP, chapter 4, PDF109–113/printed93–97. `catalog.json` is an audited factual catalog with frozen page/area/bullet locators and concise scope paraphrases. It contains six completed exclusions and fourteen retained planned-section entries; driver/benefit sub-bullets, Gateway Table4.1 and modeled portfolios are outside this scope.

```sh
python3 scripts/ingest/coverage/pacificorp-irp-local/normalize.py \
  --original-dir inputs/originals/F27-pacificorp-plan \
  --output-dir app/src/data/real/coverage/pacificorp-irp-local --scope full \
  --generated-at 2026-09-30T10:42:00+00:00
```

The independent standard-library adapter verifies exact preserved original hashes before normalizing. Original `2025_IRP_Vol_1.pdf` remains ignored; its SHA256 is `c540ce2974d538f5f6305794700026298f529aae237469dab1f4280a8eb5da64`. The IRP index establishes the filing date; the current Spanish Fork page is cited only as relationship evidence. It cannot update historical facts. Fixed generation time reproduces bytes, not source freshness.

| Source locator ID | Diagnostic |
|---|---|
| `2025-ch4-p095-pace-breaker-program-1` | One program for twelve individually unlisted substations; planned heading conflicts with completed-tense text, so planning-context/unknown |
| `2025-ch4-p095-pace-central-utah-3` | Planned Spanish Fork–Mercer 345 kV line; explicit overlap with current featured source without merging epochs or claiming two unique projects |
| `2025-ch4-p096-pacw-portland-1` | Mixed BPA/PacifiCorp line interests and 57/69-to-115 kV conversion; no inferred singular owner |

IDs prefix these locators with `pacificorp-irp-local:`. They are frozen source references, not native engineering IDs. Full ledger: **20 = 14 imported + 6 excluded + 0 pending + 0 failed**, zero located. The complete accepted scope has thirteen explicit physical planned records and one breaker-program planning-context record with unknown lifecycle. Do not invent twelve child projects or erase mixed distribution work in other entries.

Edition/publication/lifecycle-as-of is 2025-03-31 with source-edition meaning. All fourteen service dates, owners, locations/native geometry and exact construction intervals remain unknown. Area headings are source geography, not coordinates or an operating-footprint allocation. No newer webpage or March 2026 update silently changes this historical inventory.

The three-record sample was provider-connected at `d108589` before this full output. `--scope full` now emits all fourteen accepted records; default `--scope sample` preserves the initial three-record increment. The normalizer and catalog are unchanged, preserving the connected sample values and IDs. Source-hash, identity, disposition and reconciliation safeguards are part of producing requested data, not worker schema/build checks.

`dataset.json` is the provider-ready Dataset v2; the companion manifest, complete row ledger, source-quality catalog and payload file preserve the accepted boundary. Full Dataset: **26,270 compact / 33,826 formatted UTF-8 bytes**. This historical local subset is not current utility/state completeness. Contacts, hidden metadata and images are excluded; originals and copied source prose are not published. Factual paraphrases/citations support authorized private analysis without asserting an open/commercial license. Coordinator alone integrates/checks; no worker checks ran.
