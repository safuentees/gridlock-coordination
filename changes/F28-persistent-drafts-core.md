# F28-R2 — unfinished geographic draft storage
- Added frozen read/save/download APIs using separate gridlock.geographic-drafts.v1 IndexedDB, drafts store and real/demo keys; no source/run/accepted-review store changes.
- Raw draft fields, baselines, absent IDs and fingerprints survive schema validation; duplicate identities, mixed modes, invalid envelopes and payloads over 80 MiB are rejected.
- Writes capture immutable snapshots, serialize and validate prior values atomically. Malformed saved drafts block overwrite; blocked/unavailable/quota/timeout failures return recovery messages without losing in-memory work.
- Download remains independent of browser persistence and exports validated unfinished drafts, never accepted decisions. No localStorage migration, external transmission or worker checks; coordinator composition/check pending.
