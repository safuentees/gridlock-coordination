---
id: F13
name: Return to validated source revisions
agent: core + coordinator
depends_on: [F08, F10]
---

# F13
Retain an explicitly applied real dataset revision in browser local storage; restore it through the same parseSourceDataset validation on arrival. Separate from demo and existing saved-review storage. Missing storage loads the supplied snapshot. Malformed/inaccessible/over-quota storage reports a useful message without discarding the active session or silently overwriting malformed saved content. Explicit Restore supplied snapshot clears only this feature's key. Downloads remain a portable fallback.

Core owns `app/src/data/source-session.ts`, `changes/F13.md`; coordinator owns App composition and DatasetImport copy. Contract: `readSourceSession(): {dataset:Dataset|null,error:string|null,writeBlocked:boolean}`; `saveSourceSession(dataset,writeBlocked=false): string|null`; `clearSourceSession(): string|null`. Errors are user-safe strings, no exceptions past the boundary. Versioned key; schema/import validator authoritative. No automatic migrations, accounts, new dependencies or calculation changes. Combined F11–F13 coordinator build and representative check only.
