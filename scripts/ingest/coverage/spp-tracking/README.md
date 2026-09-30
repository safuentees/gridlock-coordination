# SPP Q3 2026 public workbook adapter

Reads the unchanged public Appendix 1 workbook using openpyxl read-only/cached values, never macros or network calls. Source SHA256 is pinned to `167bb301dc9fd290f7901318c43312b28513aec711484d1da17162a207f09b5f`; a changed source requires a separately qualified edition. Preserved original: coordinator checkout `inputs/originals/F27-spp-tracking/Q3 2026 Quarterly Project Tracking Appendix 1.xlsm`. [Public archive](https://www.spp.org/Documents/77416/3Q%202026%20Quarterly%20Project%20Tracking%20Report%20Appendix%201%262.zip).

```sh
python3 scripts/ingest/coverage/spp-tracking/extract.py \
  --input '/absolute/path/Q3 2026 Quarterly Project Tracking Appendix 1.xlsm' \
  --scope sample \
  --output-dir app/src/data/real/coverage/spp-tracking \
  --generated-at 2026-09-30T00:00:00+00:00
```

Use a prior Dataset's generatedAt for reproducible output. `--scope full` is the subsequent increment after the coordinator connects the sample. The six qualified UIDs are 50442, 50444, 51487, 71933, 157811 and 171264. The sample ledger lists every source row, with all other UIDs pending. Full scope excludes Complete/Closed Out/Withdrawn individually and retains all other upgrades. PID is an explicit parent relationship, never an extra project. Appendix 2 is a subset outside this adapter.

Owner forecast, RTO need and NTC issue dates stay distinct. Precision comes from the cell's displayed format, not hidden Excel date storage. In this pinned workbook all 3,204 populated I/J/K date cells display `mm-dd-yy`; 1,062 cells are empty. Coarser supported display formats produce month/year precision; unresolved formats/placeholders remain unknown. None produces a construction window.

Source status text stays unchanged. In Service is partial service with construction incomplete; schedule statuses do not establish construction phase. Re-evaluation and undefined pending notifications stay unknown. Explicit ProjectOwner tokens have source-scoped identity; accepted EKC/WR, EM/KCPL and EMW/GMO aliases carry primary citations. Blank/TBD/composite values have no qualified owner.

Bus names/numbers, states, study/type, cost fields and quantity columns are source context. Costs are not savings, zero/formula placeholders are not proof of free work, quantity units are not inferred, and no coordinates/routes are generated. Report publication is July 7, index posting August 5, retrieval September 30; publication is an edition anchor rather than a row update or status-change date.

Outputs: source-only Dataset 2, matching manifest, exhaustive ledger and compact/formatted UTF-8 payload sizes. Full Dataset output is compact. This private attributed analysis does not claim public/commercial reuse permission; original binaries remain outside Git. Only the coordinator runs bounded integration checks.
