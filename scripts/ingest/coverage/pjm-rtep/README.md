# PJM public RTEP adapter

Consumes the preserved public `projectCostUpgrades.xml` snapshot at SHA256 `1cc0ae1b78258cbe81108ec2fdd43754098a57cc5ec224f6e7300cafefe2eb31`; it makes no network calls. The original remains outside Git in `inputs/originals/F27-pjm-rtep-2026/` at the coordinator checkout. [Public export](https://www.pjm.com/pjmfiles/media/planning/projectConstruction-data/projectCostUpgrades.xml), [status definitions](https://www.pjm.com/planning/m/project-construction), and the accepted F27-C2 contract define this mapping.

```sh
python3 scripts/ingest/coverage/pjm-rtep/extract.py \
  --input /absolute/path/to/projectCostUpgrades.xml \
  --scope sample \
  --output-dir app/src/data/real/coverage/pjm-rtep \
  --generated-at 2026-09-30T00:00:00+00:00
```

Use `--scope full` for every accepted nonterminal upgrade; use the output's `generatedAt` to reproduce a prior generated payload. The six-record connection slice is s0275, n0613, b1570.3, b2970, b3869.3 and n8733.0. All other rows remain pending in the sample ledger. Full extraction classifies every native UpgradeId independently: EP/PL/Active are planned, UC/UC-ISP are under construction, On Hold stays on hold; IS/Cancelled/W are excluded with separate reasons. Unknown nonterminal statuses remain unknown. No deduplication by name, suffix or inferred engineering-project parent occurs.

Owner identity uses the explicit TransmissionOwner field within this source only. Blank, MISO or visibly composite values have no qualified owner. DL and Duquesne Light (DL) normalize to `pjm-to-dl`; other literal tokens form source-scoped IDs. No ultimate-parent or cross-source identity is asserted. Raw sponsor, state, location, description, upgrade unit and update date are preserved. Named places and states never become coordinates. Every location/geometry stays null.

Project.date prefers projected in-service, then required need date, then unknown. All supplied required/projected/actual/revised/ISA/board/TEAC dates are separately cited milestones; TEAC lists retain individual dates. Unparseable values remain explicit notes with unknown precision. LastUpdated is a row update, and lifecycleAsOf is snapshot observation, neither a status-change date. No construction window is inferred. The n0613 source voltage discrepancy remains explicit.

Outputs are source-only Dataset 2, identical embedded/standalone manifest, exhaustive row ledger, and UTF-8 payload-size measurements. Full Dataset JSON is compact; download-size measurement uses two-space formatted JSON. The aggregate and its export envelope can be larger. Source generation is not runtime validation; only the coordinator runs the bounded integration checks.
