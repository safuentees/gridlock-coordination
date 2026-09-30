# F19 — Find and strengthen source evidence

Purpose: use project purpose/planning area to find relevant work, then close specific evidence gaps that prevent useful ranking. More rows alone are not success.

Inputs: existing Project fields and curated source notes (44 Dominion needs, 208 Georgia zones), supplied source sections, location guide Part 2 and existing normalized revision interface. Missing enabling work: shared search that includes useful planning context; a bounded reviewable evidence-decision batch, exact public citations and defensible project identity matches.

Owners: source_discovery owns lib/project-search.ts, evidence decision artifacts under data/evidence/ and source research notes; coordinator wires the shared search into Explorer and Readiness. No overlapping edits to those UI files. Depends on F12/F11, independently ready with the journey contract. Preserve originals and source meanings.

Part 1: export matchesProjectQuery(project: Project, query: string): boolean; match case-insensitive name, description, source ID, sponsor, voltage, visibleProjectNotes(project) and cited source filenames/locators (preserving existing Readiness search). Do not expose raw ingestion commentary or turn planning-zone identifiers into coordinates. Complete when the same query can find a source project by need/zone in Explore and Data readiness while blank queries and existing fields still work.

Part 2: investigate ten prioritized missing-location records using public source text/feature identities and cited description/zone/landmark comparisons. Produce evidence decisions, not a quota of coordinates: supported center candidates with method/source locator or unresolved records with a specific missing input. No guessed coordinates, restricted material, image verification or promotion of inherited/unverified points to confirmed. Any supported normalized revisions go through the existing preview/apply interface in a small batch; integrate the first supported result without waiting for all ten. If public coordinate evidence is absent, report that actual enabling blocker. No broad geocoding run or source-status claim inferred from historical dates.

Coordinator performs the one composition build for Part 1; one bounded representative normalized revision check only if Part 2 produces a real revision. Workers do not run tests or visual checks.
