# F28 — shared geographic precision policy
- Pipeline finer-evidence preservation now imports review.ts precisionRank, also used by restore; removed the duplicate ranking table.
- A null outcome remains below every represented precision. Matching, source inputs, review decisions and UI behavior are unchanged.
- Source inspection only; no worker tests or checks ran.
