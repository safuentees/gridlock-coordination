# Gridlock

Explore neighboring utilities' transmission plans, investigate coordination candidates and prepare source-referenced briefs.

## Run locally

```sh
cd app
npm ci
npm run dev -- --host 127.0.0.1
```

Open the local URL printed by Vite. No credentials or backend are required. Map basemap tiles come from OpenStreetMap; the inventory and calculations use bundled local records.

## Use the workspace

1. Start with **Source data**: 252 planning records from the supplied Dominion and Georgia filings. Ten have supplied, unverified locations; 242 remain searchable without coordinates. **Explore 300-project demo** switches explicitly to synthetic scenarios.
2. Search by name, native source ID, sponsor or voltage; filter reporting group or location coverage. Switch the main panel between Candidates, Inventory, Map and Timeline. Selection updates the existing detail panel, where evidence and impact are alternate views.
3. Open **Edit scenario** to change radius, optional milestone gap and location confidence, then apply the scenario. Compare it with the default under-25-mile candidate set. The timeline preserves date precision; milestone dates do not establish construction overlap.
4. For a selected pair, enter hypothetical shared corridor length, width, land cost and avoided share. The estimate never derives shared route length from distance between centers.
5. Use **Save selected** and **Saved reviews** to compare evidence, add local notes and review state, and download a source-referenced coordination brief. Real and demo collections remain separate. Changed or missing projects in a revision keep their saved evidence and notes.
6. Open **Dataset → Revisions** to download the normalized JSON format, preview changed records and apply a revision for this session. **Dataset → Coverage** retains source limitations and provenance. Reloading or restoring the supplied snapshot discards the imported override. Originals remain unchanged.

The workspace fills one viewport. Long results, details and dialog bodies scroll internally; tables can scroll horizontally within their panel. Header controls remain available.

## Data and methods

Source mode contains 44 Dominion descriptions and 208 active rows from Georgia's public Table 2. Reporting group and sponsor are distinct: the Georgia filing includes GPC, GTC, SAV, MEAG and DU projects. Dates are historical plan milestones, not live completion claims. Raw originals are preserved in ignored `inputs/originals/`; hashes are in `inputs/manifest.json`. See [source discovery](specs/discovery.md) and [reproducible ingestion](scripts/ingest/README.md).

Eligibility uses haversine distance between supplied centers, strictly less than the radius (default 25 statute miles). Distance ranks first, then known milestone gap, then stable identity. Unknown dates remain unknown; an enabled day-gap filter excludes unknown or partial dates. Construction overlap requires explicit windows. Locations in the real snapshot have not been independently verified.

Representative example: Jasper–Okatie / McIntosh–Purrysburg is about 5.6501 miles apart with 152 days between an in-service milestone and a need-date milestone. The locations are unverified and construction overlap is unknown.

## Project and checks

Private application repository: https://github.com/safuentees/gridlock-coordination. Application pushes never target the workflow-template remote.

[Mission](specs/mission.md), [roadmap and ownership](specs/roadmap.md), [shared contract](specs/tech-stack.md).

The coordinator alone runs bounded milestone checks:

```sh
cd app
npm run build
node --import tsx scripts/check-core.ts
```

No browser, screenshot or visual verification has been performed. Source coverage and UI interactions are not exhaustive audits. Verified route geometry, current schedule refresh and independently checked locations remain future work.
