# AEP DOE public review producer

This standard-library adapter projects the accepted factual catalog for the eight entries in DOE's September 30, 2026 public AEP review-index snapshot. It emits four diagnostic records first; the remaining four wait for coordinator provider connection. The catalog preserves the complete accepted scope independently of the emitted sample.

```sh
python3 scripts/ingest/coverage/aep-doe/normalize.py \
  --original-dir inputs/originals/F27-aep-doe \
  --output-dir app/src/data/real/coverage/aep-doe --scope sample \
  --generated-at 2026-09-30T13:00:00+00:00
```

Use the absolute ignored original directory from a separate worktree. The eleven original hashes cover the index, eight linked PDFs and two supplemental public letters. Original files, contact fields and restricted attachments are not published. Source hash, identity/order and disposition guards are producer safeguards, not application/schema checks. The fixed generation timestamp reproduces this sample and does not establish project freshness.

| Frozen source locator | Connected-sample diagnostic |
|---|---|
| `review-001` | North McConnelsville–South Rokeby: day-precision anticipated start and operation kept separate |
| `review-004` | Hamlin–Roby: September forecast start, unknown operation date, different index/signed dates |
| `review-006` | Falfurrias–King Ranch: 138 kV from June 16 matching-scope consultation; late-July start qualifier retained |
| `review-008` | East Munday: May 8 readable station scope; later indexed PDF body explicitly unread |

Dataset IDs are `aep-doe:review-001` through `aep-doe:review-008`, with edition `review-index-snapshot-2026-09-30`. These are frozen document locators, not native engineering IDs; future index reorderings require an explicit crosswalk. Catalog order is source order. Shared consultation codes and possible PJM/ERCOT name/scope matches do not authorize a merge, alias asserting equality or transfer of dates/owners.

Sample ledger: **8 = 4 imported + 4 pending**, zero excluded/failed/located. Accepted full scope: seven transmission-line upgrade units and one station project. All are planned as of their readable signed letters, not as of retrieval or elapsed forecast dates. East Munday uses May 8 evidence because the later indexed PDF has no readable body. Environmental review completion does not establish construction progress, service, financing approval or engineering feasibility.

The three Ohio operation forecasts retain day precision; all five Texas primary dates remain unknown. Signed review, index posting, anticipated construction start and anticipated operation are separate milestones. Four index/signed-letter discrepancies remain explicit. Starts are forecasts only, including King Ranch's late-July qualifier; `constructionStart` and `buildWindow` remain null. AEP applicant and affiliate labels are context, not legal asset owners. All owners, locations and native geometry remain null. County/endpoints, route lengths, widths and station/disturbance acres are descriptive evidence, not centers or a shared-corridor calculation.

`dataset.json` is Dataset v2; `manifest.json`, `row-ledger.json`, `source-quality.json` and `payload-sizes.json` carry the declared scope and diagnostics. Sample Dataset payload is **22,674 compact / 28,773 formatted UTF-8 bytes**. Complete enumeration refers only to this featured funding-review subset, not AEP/state/RTO completeness or net-new distinct engineering projects. Source reuse is concise factual private analysis with citations; no original-publication or open/commercial license is asserted.

After the coordinator connects the sample, `--scope full` emits all eight retained entries using the same catalog and projection, preserving the four sample values, IDs and relative order. Coordinator alone integrates/checks. No worker build, schema/runtime check, browser or visual verification ran.
