# F27-BPA-E2 — guarded map-location helper
- Added the frozen proposal/hint interfaces for three accepted general pins and three withheld locations, with existing Project/location/nativeGeometry schema validation.
- Real mode, exact current evidence except analyst notes, and still-null location/nativeGeometry are required at lookup and revision; unknown/stale proposals fail without overwriting records.
- Revisions retain analyst notes, unrelated fields, manifests and exact native position/CRS evidence, append unique caveats/assumptions and pass through parseSourceDataset.
- General pins remain unverified and comparison-ineligible; no calculation, map, schema, dependency or bundled-record changes.
- No worker checks ran. UI composition and sole coordinator check remain pending.
