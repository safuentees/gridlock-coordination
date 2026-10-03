# F28-R — geographic review core
- Added immutable reviewGeographicOutcome with the required caller inputFingerprint, active-ID/stale-action guards and schema-validated input/output.
- Accept retains current cited geography; reject keeps it in review metadata while clearing active geography; correction requires complete cited evidence and remains approximate.
- Reviews bind to the current source fingerprint, permit explicit re-review after source changes, and prevent weaker corrections from replacing a more precise reviewed representation.
- All source records, pipeline/calculations, persistence and UI remain unchanged. No worker checks ran; coordinator composition/check pending.
