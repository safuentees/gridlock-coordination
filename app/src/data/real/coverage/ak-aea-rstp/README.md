# AEA Railbelt strategic transmission — full

Source-only Dataset version 2: 28 chapter-3 leaves = 26 imported + 2 standalone BESS exclusions + 0 pending; zero failed and zero mapped records. Full accepted scope is 26 retained improvements/context records, not statewide completeness.

All IDs are explicit source locators, not native engineering project IDs. Unknown conceptual maturity, composite owners, cost/voltage/endpoint conflicts and conditional alternatives stay visible. CIPLink alone has an explicit scheduled completion (August 2032, month precision, unknown date kind). No construction windows or coordinates are inferred.

`manifest.json` matches the embedded source edition; `row-ledger.json` records every disposition and both official PDF hashes. Payload: 63119 compact UTF-8 bytes; 79034 formatted UTF-8 bytes.

Reproduce using `python3 scripts/ingest/coverage/ak-aea-rstp/extract.py --scope full`. Source transcription and exact citations live beside that script. Originals stay ignored under `inputs/originals/F27-ak-railbelt/` in the UI worktree. No original PDF, images or long report passages are included. Coordinator owns runtime validation and integration.
