# F17 — Save an actionable investigation

Purpose: turn an interesting pair into an evidence-backed handoff and make its assumptions understandable when revisited.

Inputs: current saved-opportunity schema, candidate/project evidence, review drafts, ImpactDraft and canonical estimateImpact. Missing enabling work: additive optional investigation fields, capture of impact assumptions from the single detail owner, migration-safe persistence and inclusion in TXT/JSON exports.

Owner: ui after F15, coordinated with core for the storage/impact contract. Own features/briefs/* (except F18 restore module/component), ComparisonPanel.tsx and ImpactPanel.tsx only after explicit handoff. Coordinator owns schema contract and consumer composition. Depends on F06/F07/F14 and the F15/F16 navigation integration. Keep increments separate: investigation objective/next question first, then saved impact scenario and export.

Complete when a user can retain an optional resource to investigate (right-of-way, crews/equipment, substation capacity or another stated question), next research action and analyst/owner text with their review. Empty fields remain optional. Valid user-entered impact inputs and the canonical result can be explicitly saved/exported with assumption labels; incomplete draft inputs stay editable and never masquerade as a computed result. Old saved reviews load unchanged; evidence refresh preserves notes and investigation work. No external sending or contact discovery.

Source basis: challenge §1 and bonus deliverable; location guide Part 2; Dominion p23 new line and p31 existing right-of-way illustrate why project scope matters. Construction timing, actual shared route, resource compatibility and current status are enabling evidence to request, not facts to infer. No savings attribution without explicit assumptions. Coordinator runs one bounded build and one representative save/export input/output check at this milestone; no visual checks.
