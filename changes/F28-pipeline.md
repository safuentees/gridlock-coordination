# F28-A — full-collection enrichment pipeline
- Added the frozen extraction/enrichment/coverage API for every input record, with explicit state/county/town/facility/endpoint clues and field/source evidence.
- Preserves source positions first, exact-ID/fingerprint BPA seeds, unique contextual facilities/endpoints and area extents; ambiguous/unsupported outcomes retain reasons and reference attempts without changing strict Project locations or calculations.
- SHA-256 canonicalizes full Project with notes: []; mode/reference/pipeline/fingerprint cache guards reuse positive and negative outcomes. Processing yields with progress every 32 rows.
- Analyst reviews survive source changes/removal; stale decisions require re-review. Unchanged-input finer cited evidence survives a lower-precision reference rerun with prior-reference context.
- Reference reach remains limited to the supplied versioned bundle; no network/geocoder calls or promised location for every record. Cold/changed-object coverage stays not-processed until fingerprint processing finishes.
- No worker checks ran; coordinator full-collection integration and bounded check pending.
