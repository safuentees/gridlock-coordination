# WAPA historical recovery catalog and normalizer

Source-specific factual catalog accepted at fea7322 from qualification PR124. The scope is every named work package in public PDF pages 6–8: four island composite-pole packages, three substations and 17 underground entries (four completed, thirteen upcoming). One compound entry names transmission lines 0D0E2 and 0C0D; it stays one package. Ridge Road is a separate distribution feeder. Source units are observations, not unique engineering-project totals.

The unchanged original lives under coordinator `inputs/originals/F27-vi-wapa/2023-09-12-investments-public.pdf`, SHA256 `20db94628fe067568fb929589307a1080f39ccf09e1fe0a5dc400e03d9fd3b8b`. The catalog retains qualified raw fields, exact locators and supplemental primary citations, excluding contacts and unrelated sections. Normalization consumes that reviewed factual catalog after pinning the original checksum; it does not reinterpret changing web content or perform visual extraction. Public availability is not a redistribution license.

```sh
python3 scripts/ingest/coverage/vi-wapa-recovery/extract.py \
  --input '/absolute/path/inputs/originals/F27-vi-wapa/2023-09-12-investments-public.pdf' \
  --output-dir app/src/data/real/coverage/vi-wapa-recovery \
  --scope full --generated-at 2026-09-30T11:00:00+00:00
```

The full accepted catalog retains nineteen packages, preserving connected rows 1/5/7/17. Five known completed exclusions remain in the exhaustive ledger: Water Island poles and Midland/Golden Grove/Container Port/Feeder7E Cruz Bay underground packages. Reconciliation: 24 = 19 imported + 5 excluded, with zero pending, failed or located. Imported classes are one transmission and eighteen capital context; lifecycle counts are fourteen planned, three historically under construction and two unknown. Excluded units are not runtime projects. This completes the declared historical report scope, not a current territory-wide inventory.

Only page 6 dates its status to August 2023. Pages 7–8 remain historical snapshot observations retrieved September 30, 2026, with unknown actual status date; retrieval must never appear as a 2026 status update. Filename date is not publication, so publishedOn is null. Partial installed-pole counts establish historical physical work; unqualified substation progress percentages retain unknown lifecycle. Target-end month/day forecasts have kind unknown; invalid November 31 stays unknown with raw evidence. Project starts and Tutu Design & Engineering RFP start are supplementary milestones, not construction starts.

SourceId suffixes are exactly the qualified snapshot/page/package locators, prefixed only with `vi-wapa-recovery:` for internal IDs. WAPA remains sponsor/operator context, not an inferred asset owner. All qualified owners, normalized voltage, centers/geometry and construction intervals remain unknown. Source island/affected-area text is contextual and may describe served areas rather than facility location. No crosswalk to the separately observed July 2026 work is invented.

Outputs: separate Dataset2, manifest, exhaustive raw ledger and payload sizes. The full recovery dataset is 56,395 compact / 72,381 formatted UTF-8 bytes including final newline. The separately connected two-record dated release dataset is unchanged. Use the committed generatedAt for exact reproduction; it is not source freshness. No worker tests/build/browser/visual checks ran; generation is not verification. Coordinator owns connection, acceptance and milestone checks.
