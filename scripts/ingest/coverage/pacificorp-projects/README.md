# PacifiCorp featured projects — sample producer

Normalizes the accepted 18-entry featured website scope from `catalog.json`, a manually audited factual catalog of page/subsection entries tied to the exact original hashes and citations. It uses concise paraphrases rather than reproducing source prose or inferring records from images. `normalize.py` uses Python's standard library only; a changed original hash stops production pending qualification. Source originals remain ignored in root `inputs/originals/F27-pacificorp-plan/`.

```sh
python3 scripts/ingest/coverage/pacificorp-projects/normalize.py \
  --original-dir inputs/originals/F27-pacificorp-plan \
  --output-dir app/src/data/real/coverage/pacificorp-projects --scope sample \
  --generated-at 2026-09-30T10:36:24+00:00
```

The three-record sample is the only emitted scope. The prepared `--scope full` option remains unexecuted until coordinator provider connection. Fixed `--generated-at` permits byte reproduction; it is not freshness. Source-hash, identity, disposition and reconciliation safeguards are part of production, not worker schema/build checks.

| Source locator ID | Diagnostic and authoritative evidence |
|---|---|
| `west-of-hemingway--boardman-to-hemingway` | H: March 2026 update PDF44/printed34 reports construction underway and expected service 2027-12-31; older website conditional wording and late-2027 forecast remain separate evidence |
| `gateway-west--bridger-anticline-to-populus` | D3: same update page supplies earliest 2035; website earliest 2034 remains a separately labeled milestone |
| `segment-e8--midpoint-to-hemingway` | E8 child: June 2030 service, partial-completion months, and child/parent 133-versus-128-mile discrepancy |

IDs prefix these source locators with `pacificorp-projects:`. Reused segment letters alone are not native IDs. The frozen catalog reconciles 11 Energy Gateway entries, six Other Project rows and the explicitly linked E8 child: **18 = 3 imported + 8 excluded + 7 pending**. Exclusions are seven explicitly completed entries and the Segment E aggregate parent, whose remaining scope stays contextual and is not declared absent. E8 is one component, maintenance B one upgrade, and other retained entries project work units. Bundled phases/equipment are not split into invented projects.

The accepted full scope will contain ten physical transmission records, nine planned plus H under construction. H's lifecycle is source-edition evidence as of 2026-03-31; other webpage lifecycles are planned as observed 2026-09-30. The manifest edition remains `observed-2026-09-30`, with publication unknown, and clearly documents this field-level source precedence. The full date distribution is four year, two month, one day and three unknown. Earliest/late/quarter qualifiers remain attached; index/construction timeline endpoints do not become service dates.

No singular owner, native project center, inferred parent ID or exact-day construction window is created. Publisher/developer context remains separate from ownership. Parent/program labels are notes/aliases. E8 partial completion and supplied construction months remain evidence milestones, not a day-precision buildWindow. The historical Spanish Fork–Mercer overlap is an explicit relationship, not a silent merge or a second unique engineering-project claim. Contacts, meeting access details, hidden metadata and maps are excluded from derived facts.

`dataset.json` is the provider-ready Dataset v2. `manifest.json` repeats its source manifest; `row-ledger.json` reconciles every declared entry; `source-quality.json` preserves source hashes, accepted totals, precedence and relationships; `payload-sizes.json` measures the actual Dataset. Sample payload: **13,825 compact / 18,372 formatted UTF-8 bytes**.

This featured subset is not a current utility/state inventory. The March 2026 model-selection tables remain image-only and unenumerated under the no-image policy. Public originals and website prose are not republished; concise factual data is retained for authorized private analysis without asserting an open/commercial license. Coordinator alone owns provider integration and checks; no worker checks ran.
