# F28-B — Complete declared Census area references

- Added 19,729 incorporated places and 12,913 CDPs; the bundle now has 35,936 references including 56 states/territories, 3,235 county equivalents and the three accepted guarded BPA general pins.
- Published compact asset: 40,865,532 bytes; reference revision census-acs2025-bpa-0221b350b2cdfaf4. All four declared Census layers are complete.
- Preserved 185 public original files / 955,292,226 bytes outside Git, with exact URLs, hashes, CRS/use meanings and acquisition counts; no centroids, invented precision or withheld BPA coordinates.
- Added bounded transport retries and incremental state/county reuse against matching source hashes after an older local polygon read stalled; reference revision now covers emitted semantics as well as upstream bytes.
- County subdivisions, GNIS-only localities, historical area editions and broader facility coverage remain gaps; area-reference completion is not full F28 or matching completion.
- No worker application checks or visuals; coordinator owns the combined milestone check and integration.
