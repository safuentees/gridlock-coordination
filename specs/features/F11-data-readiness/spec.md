---
id: F11
name: Guided location evidence workspace
agent: coordinator + ui
depends_on: [F10]
---

# F11
Add a purposeful Data readiness workspace alongside Explore. Show active-dataset coverage and a searchable list filtered to missing/unverified/all locations. Keep every record reachable; counts are derived, not hard-coded. Explain the next action instead of presenting only shortages.

For a real project, collect explicit coordinates, method, source title/file, locator and optional HTTP(S) URL. Preview old/new coordinates, confidence and source evidence; preserve IDs and original sources. Apply a one-project normalized revision through the existing schema/import validation, or download it. All locally added evidence defaults to unverified. Empty/malformed coordinates and missing source locator are errors, never zero or guessed. Demo is clearly labeled and cannot apply a source revision. No external geocoding.

Coordinator owns `data/readiness.ts`, App composition, Explorer reveal-project interface, specs/receipt. UI owns `features/readiness/*`. Contract: `getReadiness(dataset)` returns total/missing/unverified/confirmed and filing breakdown; `createLocationRevision(dataset, projectId, draft, generatedAt?)` returns validated Dataset or throws. Draft fields: latitude, longitude, method, sourceFile, sourceLocator, sourceUrl (strings except method enum from Project.location). `ReadinessWorkspace({dataset,onApply,onExploreProject})`; root handles source persistence. Default preset and internal scrolling. One coordinator build plus one representative revision input/output check for the combined F11–F13 milestone; workers do not check.
