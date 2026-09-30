# TVA public transmission-project index — sample

Dataset version 2: 41 index placements = 6 imported + 1 duplicate excluded + 34 pending, with zero failed or located. Full accepted scope is 40 page work units, not TVA-wide or state-wide engineering coverage. Multi-part line/station work is not split into invented records.

The six diagnostics are New Liberty, Kentucky Phase II, Beulah Grove, Appalachia, Shooting Creek and Hardin Valley. Operating/design voltage, explicit hold/restart, separate component schedules and historical construction evidence remain distinct. Seasonal forecasts preserve source labels; contradictory or cross-year dates remain unknown. Owners, centers/native geometry and actual construction windows are null.

`manifest.json` matches the embedded edition `observed-2026-09-30`. Its primary hash identifies the derived index text capture, never original HTML. Ordinary HTML downloads returned 403; the coordinator accepted captured text. `source-catalog.json` separately identifies all 41 text captures and 14 original public GIS JSON responses by URL, size and SHA-256. `source-quality.json` preserves capture meaning and GIS scope/status conflicts; no route geometry is converted to a center. Artifacts remain ignored under `inputs/originals/F27-tva-public/` in the UI worktree.

`row-ledger.json` retains every index placement and links the excluded Tennessee Appalachia placement to its retained North Carolina placement. The sample is ready for coordinator provider connection before the other 34 unique pages are normalized. Payload: 22272 compact UTF-8 bytes / 29962 formatted UTF-8 bytes.

Reproduce with `python3 scripts/ingest/coverage/tva-public/extract.py --scope sample` and the preserved artifacts. Coordinator owns runtime validation and provider integration; no worker checks were run.
