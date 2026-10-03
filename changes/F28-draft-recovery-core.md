# F28-R3 — downloaded unfinished-draft recovery core
- Added frozen 80 MiB parse/preview/merge APIs using the shared raw-draft schema and unique source-ID/fingerprint snapshots; source/demo modes cannot mix.
- Duplicate draft/baseline pairs ignore timestamps; clean imported entries add no work. Different dirty local drafts are conflicts, never overwritten.
- Compatible, changed-source and absent-source work restores only as unfinished fields with original baseline/fingerprint/time; present unprocessed records wait.
- Merge revalidates unchanged local/source snapshots, recomputes actions and bounds the combined output; no mutation, storage, accepted-evidence, calculation or UI effects.
- No worker checks ran; UI connection and coordinator bounded recovery case pending.
