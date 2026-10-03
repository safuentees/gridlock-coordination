# F28-R — Restore reviewed geography dialog

- Added the optional parent preview/restore callbacks and a labeled Restore reviews dialog. File size uses GEOGRAPHY_IMPORT_MAX_BYTES; mode/collection context and all six core dispositions are shown with a filtered 25-row affected list and explicit Apply compatible reviews.
- Preview records the active Dataset/run, selected file and normalized protected draft IDs. A changed source/run/file/draft set requires a new preview; core remains authoritative for compatibility and restore policy. Files, previews and errors persist across failure and dialog closure, separately by mode.
- Dirty protection compares each raw per-mode/project draft against its initial or successfully saved baseline, including records no longer active. Untouched forms are not conflicts; edited drafts survive restore, and explicit Discard draft is available. Clean forms may refresh from restored evidence.
- Success is acknowledged only after the parent persistence callback resolves. Root's projectToReveal insertion, browsing, manual review and map contracts remain intact. No worker build, tests or visual checks; coordinator integration/verification pending.
