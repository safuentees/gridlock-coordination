# F18 — Restore and revisit saved findings

Purpose: make exported work recoverable beyond one browser and let users revisit historical findings without replacing current evidence or losing local edits.

Inputs: existing coordination-brief JSON, saved snapshots, mode, scenario, review/investigation fields and savedAvailability. Missing enabling work: versioned import validation, preview, explicit duplicate handling and a return path to current versus saved evidence.

Owner: core after F16/F17 schema agreement. Own features/briefs/restore.ts, features/briefs/RestoreBrief.tsx and changes/F18.md; ui owns the small BriefWorkspace insertion after coordination. Depends on F17's backward-compatible saved contract. Independent first slice validates/previews legacy and current supported brief versions; UI integration follows.

Complete when a user can export, restore into the matching real/demo collection and reopen the saved evidence/notes/assumptions. Preview added/duplicate/rejected records; retain existing records by default, require explicit replacement for duplicates, and do not silently overwrite drafts or malformed storage. Reuse existing snapshot identity validation and storage error handling. Distinguish saved evidence from changed/missing current records and disclose when a saved scenario differs. No automatic dataset import, cloud account or external messaging.

Coordinator bounded build plus one representative export/restore conflict check; no extra framework, browser or visual checking.
