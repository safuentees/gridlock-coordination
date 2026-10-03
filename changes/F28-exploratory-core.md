# F28-E — selection-driven exploratory core
- Added analyzeExploratoryProximity over one selected companion representation and the full current collection, using canonical haversine/timing and strict full-precision point/endpoint radius filtering.
- Area intersections and point/endpoint containment return coarse context with null distance; no centroid, route, accuracy or benefit is inferred. All matches remain available in stable distance/ID order.
- Ownership requires cited compatible-scope identities; contextual kinds, lifecycle, planned-owner qualifiers and geographic limitations remain explicit. Unknown and stale/rejected/foreign companion rows cannot supply geometry.
- Caller must supply the current fingerprint-compatible run; root controller owns that boundary. Strict engine, source records, shared schemas, persistence and map remain untouched.
- No worker checks ran; coordinator composition and bounded case pending.
