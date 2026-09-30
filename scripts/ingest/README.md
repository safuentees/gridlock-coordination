# Source ingestion

`seed.py` reads the preserved workbook and explicitly joins its ten examples to public project-list rows. It writes the app's shared Dataset shape to `app/src/data/real/dataset.json`. It never changes originals, copies reported overlap results, infers construction windows or performs proximity calculations.

Use a Python environment with `openpyxl` and `pypdf` (the bundled Codex Python environment includes both):

```sh
python3 scripts/ingest/seed.py --inputs /path/to/Sperry-Tech-Challenge
```

Pass `--generated-at <ISO timestamp>` to reproduce metadata as well as content, and `--output <path>` for a local preview. Keep inputs and scratch extraction outside versioned application files.

Native source IDs define stable application IDs. Workbook aliases remain notes. `utilityId` identifies the filing group; `sponsor` retains the actual listed sponsor, including SAV. Georgia need dates and Dominion planned in-service dates are distinct. The script uses cached workbook center formulas with unverified confidence and preserves single-endpoint approximations. Blank values remain unknown. Read errors fail the command; no synthetic replacement is emitted.

Seed coverage is ten successfully linked records; the remaining filing rows are outside this batch, not silently counted as processed. Only the public project list is used from the Georgia filing. Redacted/private details and the opportunity document are excluded.
