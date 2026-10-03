# F28-R — guarded review restore core
- Added validated preview/apply APIs covering every imported active/retained ID, with mode, fingerprint, duplicate-identity, review-consistency and protected-draft guards.
- Compatible analyst decisions merge into current rows; different local reviews, finer evidence and stale inputs remain untouched. Automatic imported outcomes cannot replace the current run.
- Absent reviewed identities can be retained outside active coverage; original decision/time/reason/citations survive. Apply recomputes the plan and rejects a changed base or protected-ID set.
- Reused review.ts precision/citation policy via exports; no source, pipeline, strict-calculation, persistence, map or UI changes. No worker checks ran; coordinator composition/check pending.
