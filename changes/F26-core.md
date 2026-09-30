# F26 — Canonical inventory eligibility and saved compatibility
- Added source-qualified record/pair eligibility with explicit exclusions for lifecycle, kind, location role and missing or same-owner evidence; filing/sponsor labels never supply an owner.
- Legacy pair calculations, reasons, filters and ranking stay unchanged; added pre-scenario record counts without conflating mapped records with eligible records.
- Saved snapshots accept dataset versions 1 and 2 and retain matching source editions plus project inventory metadata; legacy records receive no defaults and brief/store envelopes remain version 1.
- Text/JSON exports preserve edition, lifecycle, owner and geometry context; restoration reuses the extended saved schema and existing conflict guards.
- No worker checks ran. Coordinator compatibility/source case and production build pending; full F26 inventory integration remains separate.
