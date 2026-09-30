# F27 — Import limit presentation

- Source import label and oversized-file error derive their MiB limit from the authoritative `MAX_IMPORT_BYTES`; existing import behavior remains unchanged.
- No worker checks or visual verification. Coordinator integration review pending.
