---
id: F12
name: Preserve useful public planning context
agent: ingestion
depends_on: [F10]
---

# F12
Retain Georgia planning-zone values and Dominion project-need text from the already selected public source sections, in existing description/notes fields with exact locators. Reproduce the normalized source snapshot without adding coordinates or inferred facts. Do not change stable identity, dates, sponsorship, original source files or the shared schema. Actual source limitations remain explicit.

Owner: ingestion; `scripts/ingest/*`, `app/src/data/real/*`, `changes/F12.md`. Coordinator performs the combined integrated build/check. Generation is allowed and necessary; no duplicate tests, browser or visual checks. Report actual fields/counts and unresolved gaps.
