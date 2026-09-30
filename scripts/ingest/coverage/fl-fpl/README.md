# FPL public transmission plan producer

This `pypdf` adapter reads only the accepted text forms and matched engineering narratives from the hash-pinned April 2026 public plan. The five bulk-table rows are frozen factual cells with exact citations. Source PDF/index originals stay ignored under `inputs/originals/F27-fl-fpl/`; no original narrative, map, hidden metadata or contact fields enter the dataset.

```sh
python3 scripts/ingest/coverage/fl-fpl/extract.py \
  --original-dir inputs/originals/F27-fl-fpl \
  --output-dir app/src/data/real/coverage/fl-fpl --scope sample \
  --generated-at 2026-09-30T12:08:18+00:00
```

From an isolated worktree, provide the originals' absolute directory. The fixed generation time reproduces the snapshot without changing April 2026 lifecycle evidence. Hash, field, frozen-locator and source-reconciliation guards stop changed editions; they are producer safeguards, not worker runtime/schema checks.

The complete primary boundary is five Table III.E.1 rows (printed96/PDF110) plus 84 Schedule 10 forms (printed315–398/PDF329–412). Corresponding III.E.1–84 narratives (printed97–180/PDF111–194) add evidence, not projects. Sample ledger: **89 = 5 imported + 34 excluded + 50 pending**, zero failed/located. The accepted full scope is 55 transmission work units; full output waits for coordinator sample connection.

| Sample identity | Locator | Meaning |
|---|---|---|
| `fl-fpl:iii-e1-r01` | Bulk table row 1 | Whidden–Sweatt; explicit line ownership and approval evidence |
| `fl-fpl:iii-e1-r02` | Bulk table row 2 | Andytown–Oasis; line/program dates remain separate |
| `fl-fpl:s10-001` | Schedule 10/III.E.1 | Clover transmission interconnection |
| `fl-fpl:s10-013` | Schedule 10/III.E.13 | Putnam transmission package; conflicting station voltage retained |
| `fl-fpl:s10-023` | Schedule 10/III.E.23 | Spanish Moss; construction-end/connection timing discrepancy |

The sixth qualification diagnostic, Big Brook form 5, remains excluded in the ledger; no artificial sixth runtime record is emitted. Exact excluded forms are 5–11,14–17,26–31,34–39,57,59,61,63,65,69,71,73,75,77,79. Their narratives specify existing 34.5 kV storage collector/protection work and no transmission addition. This uses explicit scope, not a voltage cutoff or generic no-further-upgrades phrase. Retained zero-mile bus/substation work is not discarded. Generator/storage units and Schedule 9 cost references are not extra records.

IDs use source-locator tokens without an edition prefix. Initial positions are frozen, not native engineering IDs; every future edition requires an explicit identity crosswalk before matching, adding or retiring entries. No name-based FMPA merge, synthetic parent ID or extra Andytown–Oasis program record is created. Source order is bulk rows 1–5 followed by forms 1–84, skipping exclusions.

Only the five bulk rows evidence source-scoped FPL equipment ownership. Interconnection owners remain unknown; FPL-owned right-of-way and no other utility participation do not fill them. All locations/native geometry, construction starts/windows and per-record state remain unknown; county/terminal text is preserved without geocoding. April submission precision does not establish a publication day or row-update date.

Bulk primary service dates retain month precision. The 50 interconnection primary dates remain unknown: anticipated construction years and projected connection quarters are separately labeled supplementary milestones. Quarter text is preserved with at most year precision, never fabricated months/days. Putnam voltage, source spellings/endpoints and four timing discrepancies remain explicit. Line kV, circuit miles, capacity/transformer MVA and served-facility MW retain their own meanings; source investment references do not produce transmission costs or hypothetical savings.

`dataset.json` is Dataset v2; `manifest.json`, `row-ledger.json`, `source-quality.json` and `payload-sizes.json` describe the complete boundary. The five-record Dataset is **24,309 compact / 31,528 formatted UTF-8 bytes**, including its manifest. Default sample production remains reproducible; `--scope full` is ready for the later authorized 55-record delivery. This partial utility planning scope is not complete Florida coverage or a statewide denominator. Coordinator alone owns integration and the bounded check; no worker checks ran.
