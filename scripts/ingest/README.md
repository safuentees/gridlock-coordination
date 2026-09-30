# Source ingestion

`corpus.py` reads all 44 Dominion public project listings and the 208 active Georgia Table 2 rows. It links the ten workbook examples by native source identity, preserving their supplied locations without adding duplicate projects. The app loads the resulting shared Dataset from `app/src/data/real/dataset.json`; `ingestion-summary.json` records the extraction scope and exceptions.

Use a Python environment with `openpyxl` and `pypdf` (the bundled Codex Python environment includes both):

```sh
python3 scripts/ingest/corpus.py --inputs /path/to/Sperry-Tech-Challenge
```

The input directory must contain `Projects_Overlaps.xlsx` and the original `Project Listings/Dominion Energy/` and `Project Listings/Georgia Power/` folders. Pass `--generated-at <ISO timestamp>` to reproduce metadata as well as content. Use `--output <path>` and `--summary <path>` for local previews. Source-edition, malformed-row or duplicate-identity failures stop ingestion before replacing the dataset; there is no synthetic fallback.

`seed.py` remains the small first-batch adapter. To regenerate that batch without replacing the complete app inventory:

```sh
python3 scripts/ingest/seed.py --inputs /path/to/Sperry-Tech-Challenge --output inputs/extracted/seed.json
```

## Source meanings

- Native Dominion project IDs and Georgia TEAMS IDs define stable application IDs. Workbook aliases remain notes. `utilityId` identifies the filing group; `sponsor` retains the actual listed sponsor, including SAV, GTC, MEAG and DU.
- Georgia need dates and Dominion planned in-service dates are distinct. Dawson's two phase dates remain verbatim notes, with no single date or construction interval selected.
- Cached workbook center formulas supply ten unverified locations. All other locations remain null; unlocated projects still belong in the inventory. Single-endpoint centers are explicitly marked as approximations.
- Voltages come from values explicitly written in source project names. Georgia cost values remain redacted. No other missing values are guessed.
- Coverage counts refer to the 252 listed records in the selected sections. Ten linked workbook records add location evidence, not ten additional projects. Cancelled tables and restricted details are excluded sections, not silently processed records.

Originals are never changed. The adapters copy no workbook overlap results, perform no proximity/ranking calculations, and recover no restricted details. Preserve originals and scratch extraction outside versioned application files. The private opportunity document is not an ingestion input.
