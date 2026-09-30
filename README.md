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
2. Search the persistent left list by name, native source ID, sponsor or voltage; expand Filters for reporting group or location coverage. Candidates and All projects share the list. The map stays visible behind it, including when browsing projects without coordinates. Selecting a list result or map feature updates one comparison panel on the right.
3. Open **Edit scenario** to change radius, optional milestone gap and location confidence, then apply the scenario. Compare it with the default under-25-mile candidate set. The timeline preserves date precision; milestone dates do not establish construction overlap.
4. For a selected pair, enter hypothetical shared corridor length, width, land cost and avoided share. The estimate never derives shared route length from distance between centers.
5. Use **Save selected** and **Saved reviews** to compare evidence, add local notes and review state, and download a source-referenced coordination brief. Real and demo collections remain separate. Changed or missing projects in a revision keep their saved evidence and notes.
6. Open **Data readiness** to see missing/unverified location coverage, search the project queue and prepare an evidence-backed coordinate update. Supply a source title/file and exact locator, preview the changed project, then apply or download the revision. All locally supplied locations remain unverified. **Explore project** returns to that record in the list and comparison panel; switching workspaces preserves your exploration state.
7. Open **Dataset → Revisions** to download the normalized JSON format or preview and apply a complete revision. Applied real revisions return after reload when browser storage is available. Storage failures are shown and the active session remains usable; download a backup before leaving. **Restore supplied snapshot** clears the saved revision. Saved reviews and original source files remain unchanged. **Dataset → Coverage** retains source limitations and provenance.

The workspace fills one viewport. Both candidate projects, key metrics and uncertainty share the comparison header; Evidence, Impact and Supporting tabs hold longer content. Timeline opens an optional bottom panel. Hide list and Reset layout provide more map space without dragging. Map selection fits around the panels. Long results, details and dialog bodies scroll internally; tables can scroll horizontally within their panel. Header controls remain available.

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
