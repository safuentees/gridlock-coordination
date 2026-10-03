# F28-R2 — Persistent unfinished geographic reviews
- Implemented the GeographyPanel consumer and a dedicated draft hook; coordinator integration/check pending.
- Both modes hydrate before automatic writes; dirty raw fields, baselines, original fingerprints and absent identities survive without applying geography. Newer edits and explicit save/discard take precedence over late reads.
- Writes debounce for 500 ms, flush on mode change/unmount/backgrounding, and queue clears behind older writes. Dirty drafts protect companion restores; saved/discarded entries leave draft storage.
- Storage failures retain current work, preserve blocked saved data, and expose draft download plus retry for writable storage. Abrupt browser termination can still interrupt asynchronous writes; draft downloads are recovery files, not reviewed-geography imports.
- Existing selection, browsing, reveal, scroll, review/restore and coverage behavior retained. No worker builds, tests, browser or visual checks run.
