# F28-R — Geographic review controls

- Added selected-record Evidence/Review tabs with explicit accept, reject and corrected geography decisions, a required reason, and a fixed Save review action. Corrections support points, cited endpoints and bounding areas with method, precision, source-stated accuracy, limitations and exact citations.
- Raw drafts and selected tabs are retained by mode/project; source changes leave drafts intact and require an explicit review of the current fingerprint. Browsing state and queue scroll remain independent; inactive detail panels are retained and inert.
- Saves await the parent review callback, preserve drafts on validation/stale/storage errors, and only acknowledge success after the callback resolves. Original Dataset coordinates and strict candidate matching are unchanged.
- This slice does not add companion import or cross-session draft storage. No worker build, tests, browser or visual checks; coordinator integration and bounded checks pending.
