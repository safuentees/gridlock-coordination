# F27 source revision persistence
- Source sessions now use async IndexedDB read/save/reset with the shared real-dataset validator and import byte limit; saved reviews are unchanged.
- Reads retain valid legacy localStorage fallback when no IndexedDB revision exists; successful writes preserve that legacy data, and explicit reset removes both source entries.
- Malformed revisions block implicit writes. Transactions validate existing data before replacing it; saves/reset are serialized in call order and resolve only after completion.
- Blocked/unavailable storage, quotas and timeouts return recovery messages without discarding the active in-memory session; no localStorage write fallback or new dependencies.
- Coordinator integration check pending. Browser persistence interaction remains unverified under the no-browser policy; no worker builds/tests/visual checks run.
