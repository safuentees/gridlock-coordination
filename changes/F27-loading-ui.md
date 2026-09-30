# F27-L1 — Deferred collection loading shell

- App now consumes Promise-based collection loading with viewport-contained initial loading/retry and pending-switch Retry/Cancel states. Mode, badge, dataset and analysis commit together only when the requested collection is usable.
- Saved revision restoration and supplied-source loading run independently; active overrides remain usable on bundle failure. Additive offers wait for both inputs, and reset loads the full supplied replacement before clearing saved data or the active override.
- Request/unmount guards prevent stale updates. Pending/failed switches retain mounted workspaces and drafts; explicit navigation supersedes a queued demo destination. Existing successful mode key-reset semantics, scenarios and persistence write locks remain intact.
- Only App and this receipt changed. No worker checks, browser/visual work or measured speed claims; coordinator composition build and loader/data case pending.
