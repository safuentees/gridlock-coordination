# F28-F1 — geographic coverage accounting core
- Added getGeographicCoverageReport for the whole current collection, five statuses, seven representation groups, per-source totals and stale-review needs.
- Reuses pipeline geographicCoverage eligibility rather than duplicating fingerprints; cold/changed records remain not-processed, foreign/retained IDs stay outside active counts and current IDs count once.
- Groups by sourceKey/utilityId with distinct sorted project IDs and source edition labels; all totals derive from current inputs without fixed collection counts.
- No mutation, source inference, calculation engine, strict/density changes or worker checks. Coordinator composition/check pending.
