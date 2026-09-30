# Alabama Power DOE public review normalizer

Accepted contract: `e20e3df81eec946aae2b11e3e2af7ad48bdfdd6e`, `specs/features/F27-us-regional-expansion/al-apc-doe/spec.md`. The complete DOE Alabama Power index has twelve entries: six named physical transmission packages and six generation/program/fiber/distribution exclusions. It is a finite featured/funding-review subset, not a complete utility or statewide transmission register. The coordinator connected the three-record sample at `a97224fa3346ca9a3b2675e113f99bfe07f47fc5` before dispatching the full six.

`catalog.json` contains the accepted factual transcription: all twelve index rows, exact dates/locators/dispositions, six source-qualified diagnostic mappings and thirteen original hashes. The producer consumes this catalog and requires unchanged hashes; it does not claim automatic rediscovery of source facts. Originals remain outside Git under coordinator `inputs/originals/F27-al-apc-doe/`. For reacquisition, enumerate the saved index's twelve PDF links in order, fetch the exact artifact URLs and require each recorded SHA256. Only ordinary-public PDF text was read; no source images, contact fields, restricted SERTP content or numeric locations inferred from text are included.

```sh
python3 scripts/ingest/coverage/al-apc-doe/extract.py \
  --originals-dir '/absolute/path/inputs/originals/F27-al-apc-doe' \
  --output-dir app/src/data/real/coverage/al-apc-doe \
  --scope full --generated-at 2026-09-30T12:43:32+00:00
```

Complete reconciliation: **12 = 6 imported + 6 excluded**, zero pending/failed/located. Records remain in index order: rows 1, 2, 7, 10, 11 and 12. The catalog and normalizer are unchanged, preserving the connected sample IDs `57`, `review:lock-5-transmission-substation` and `31` and their project values. `--scope sample` still selects those first three and reconciles the remaining retained entries as pending. All exclusions retain detailed source reasons in the ledger. This completes the accepted declared subset; broader inventory coverage remains unknown.

All six retained mappings are planned transmission-project/project. Each lifecycleAsOf uses the letter date, while retrieval and index posting dates remain separate. Four index dates differ from letter dates, including excluded Roanoke. Environmental-review completion and program-level funding do not establish physical construction, commissioning, engineering approval or project-specific financing close. Five APC references are native only within this source context; Lock 5's numeral is a facility name, not an ID. No cross-source equivalence is inferred.

Thurlow June 2028 and Bassett February 2028 are month-precision commercial-service forecasts; South Bessemer May 2030 is completion with unknown kind. The other three have no completion/service target. Forecast starts stay supplementary milestones, not actual constructionStart or buildWindow. Lock 5 voltage is empty because only future terminal accommodation is stated. South Bessemer maps the specified 500 kV circuits and preserves existing 500/230/115 kV station/autobank context. Owners, native geometry, centers, construction windows and source-update days remain unknown; applicant identity is not ownership evidence.

Outputs: Dataset2, manifest, exhaustive row ledger and payload sizes. The manifest hash is the preserved index; all twelve document hashes accompany it in the catalog/ledger. Full source JSON measures **28,443 compact / 36,980 formatted UTF-8 bytes**, including final newline. `generatedAt` is a reproduction timestamp, not source freshness. Public availability does not establish a blanket redistribution license. No worker tests/build, runtime/schema or visual checks ran; coordinator owns integration and milestone checking.
