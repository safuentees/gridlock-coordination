# Santee Cooper public-source normalizer

Accepted contract: `faf628311134f3b7bedca6a83b5d6247604d773f`, `specs/features/F27-us-regional-expansion/sc-santee/spec.md`. The declared union contains all 23 named headings in the 2025 IRP Appendix B (PDF pp.94–98 / printed pp.87–91) and all 12 cards in the public Power Line Projects index. The 2026 generation/transmission/distribution report enriches four existing observations without adding rows.

`catalog.json` is the curated factual transcription with all 35 locators and explicit dispositions, six diagnostic descriptions/date mappings, 17 original hashes, regulatory evidence and unresolved relationships. The producer consumes this committed catalog and verifies input hashes before generation; it does not claim to rediscover the catalog automatically. To reproduce source acquisition, use each artifact's exact URL/file and require its recorded SHA256. Originals remain unchanged outside Git under coordinator `inputs/originals/F27-sc-santee/`. Text extraction used pypdf and ordinary HTML text only; no maps, images, restricted sources, contact/person fields or interactive endpoints enter the catalog or dataset. Public accessibility does not establish a redistribution license.

```sh
python3 scripts/ingest/coverage/sc-santee/extract.py \
  --originals-dir '/absolute/path/inputs/originals/F27-sc-santee' \
  --output-dir app/src/data/real/coverage/sc-santee \
  --scope sample --generated-at 2026-09-30T12:09:58+00:00
```

Connection sample: source rows 6, 15, 16, 18, 29 and 31 retain the six qualified source-locator identities in source order. Reconciliation is **35 = six imported + eleven excluded + eighteen pending**, zero failed/located. Two exclusions are based on explicit work-concluded notices; nine are supporting web pages for existing IRP units. The source remains sample/incomplete. Full generation is intentionally blocked until the remaining accepted rows are normalized after coordinator connection/dispatch. No production is dispatched by the script itself.

Six imported records are four planned and two approved; complete accepted lifecycle counts are 20 planned, three approved and one unknown. Marion–Conway stays unknown despite historical April 2022 clearing evidence; no current construction is verified. All owners, locations/native geometry, windows, actual construction starts and source-update days remain null. The snapshot date is observation time, not a common status update date. The downloaded IRP's November 21 filing stamp differs from the library's original September 16 filing; webpage publication dates are unknown.

IRP years are completion forecasts with unknown kind. Explicit website in-service targets retain their supplied precision. Bluffton's conflicting 2030/2028 forecasts leave its primary date unknown with both milestones cited. Winter completion, July construction end and December administrative closeout keep separate meanings. Both circuits/station work stay within one named package; no parent/child or cross-source merge is inferred. The Seaboard–Indian Field / Indian Field–Varnville relationship remains possible overlap, so retained observations are not a unique-project or complete utility/statewide count.

Outputs are Dataset2, standalone manifest, exhaustive row ledger and payload sizes. Sample dataset: **26,925 compact / 34,545 formatted UTF-8 bytes**, including final newline. `generatedAt` is a reproducibility timestamp, not source freshness. No worker tests, build, runtime/schema or visual checks ran; coordinator owns provider connection and the later milestone case.
