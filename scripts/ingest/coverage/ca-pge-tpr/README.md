# PG&E public May 2026 TPR producer

After sample connection at `3147fce`, this read-only `openpyxl` adapter emits the full accepted inventory and normalizes the accepted public Attachment 11 workbook against the workbook and transmittal SHA-256 hashes. It reads only the visible project table's selected non-person fields; the Project Manager column, prioritization/cost-benefit scores, hidden metadata and confidential attachments are not emitted. Untouched originals remain ignored under `inputs/originals/F27-ca-pge-tpr/`.

```sh
python3 scripts/ingest/coverage/ca-pge-tpr/extract.py \
  --original-dir inputs/originals/F27-ca-pge-tpr \
  --output-dir app/src/data/real/coverage/ca-pge-tpr --scope full \
  --generated-at 2026-09-30T11:51:03+00:00
```

From an isolated worktree, provide the original directory's absolute path. The fixed generation time makes this output reproducible; it does not refresh March 2026 lifecycle evidence. Hash, native-ID, field and enumeration guards stop changed editions from being silently accepted. A new edition requires renewed qualification. No worker runtime/schema checks were run.

The complete declared boundary is `CPUC TPR PUBLIC!B5:CV2675`, with manager column Y omitted: **2,671 = 1,591 imported + 1,080 excluded**, zero pending, failed or located. The exclusions are 1,079 Operational and one Cancelled. The separate 1,434 in-progress transmittal headline has an unreconciled definition and does not override this row ledger. The unchanged extractor preserves the six connected diagnostic records and IDs while projecting every retained entry in original worksheet order. Default `--scope sample` still emits the original diagnostics.

| Native AI identity | Excel row / source line B | Diagnostic |
|---|---|---|
| `5771718` | 500 / 496 | Morro Bay–Cal Flats line component; parent text mixes owner scopes |
| `5792705` | 109 / 105 | Midway relay component; reported construction band |
| `5779902` | 106 / 102 | Table Mountain relay component; on hold |
| `5562465` | 1620 / 1616 | System inspection program/bucket; capital context |
| `Ex112888` | 14 / 10 | As-built process forecast placeholder; planning context, exact ID case |
| `5816828` | 32 / 28 | Public cybersecurity replacement name; planning context |

Project IDs are `ca-pge-tpr:<exact AI token>`, independent of source edition. B is a locator only. Valid AJ parent IDs, including `P.05271`, remain references without synthesized parents or name-based deduplication. The accepted full classification applies terminal exclusions first, then exact forecast/investment/redaction rules, then capital/program/supporting scope: **1,001 transmission work units (977 components, 24 upgrades), 278 capital context and 312 planning context**. Unsupported context units are omitted. Counts describe source work, not unique engineering projects or complete California coverage.

All owners, locations/native geometry, construction starts and construction windows remain null. F retains source city/county text without geocoding. Both public coordinate columns are entirely blank; their defined endpoint meanings do not provide centers, CRS or accuracy. AB line voltage and explicitly kV-labeled AC values remain separate cited source evidence; no MVA conversion is inferred. BI alone supplies lifecycle. Source engineering/construction percentage bands derive from milestone timing, not measured physical progress.

Publication is May 1, 2026; automated extraction is March 10; lifecycle evidence is March 2026 with month precision. BM current projected-or-actual service is primary (1,306 day dates, 285 OAI unknowns in full retained scope). BL original forecasts and BK actual-or-expected starts remain supplementary with explicit labels, never a fallback primary date or a known construction interval. Source costs/ranges retain labeled $000 units and parent/year/actual-versus-forecast scope; they are nonadditive and do not become hypothetical savings.

Outputs are Dataset v2, its standalone manifest, the complete row ledger, source-quality detail and measured payload sizes. The full Dataset occupies **11,733,590 compact / 13,676,455 formatted UTF-8 bytes**, including the manifest. The connected sample was 44,804 compact / 52,607 formatted bytes. Coordinator alone evaluates this measured full addition against the aggregate 64 MiB import guard; the producer does not change that limit or trim useful source context to fit it. Public factual evidence supports authorized private analysis; this delivery publishes neither originals nor an assertion of open/commercial licensing. Full-source integration, aggregate-cap assessment and the bounded check remain coordinator-owned.
