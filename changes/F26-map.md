# F26 — Map reporting-group compatibility
- Both map renderers and the legend share one reporting-group color function: existing Dominion blue/Georgia amber remain, SCE TPR uses teal, and additional groups receive stable palette colors independent of filtering/order.
- Legend labels come from C1 reportingGroups and include only groups represented by the renderer's located input. Candidate/selection symbols reflect the active colors; a finite palette may repeat, so text labels remain authoritative.
- Public map props, fixed controls, connection explanation, event/keyboard behavior, panel fitting and F22/F23 density semantics remain unchanged. Synthetic density preview stays isolated and labeled.
- Depends on shared C1 325f8dc and the coordinated F26 consumer integration. The separate F23 checkout and port 5175 preview are preserved.
- Source inspected only; coordinator owns the integrated build and representative compatibility case. No worker checks, browser/visual/mobile work, dependency changes or patterned polish.
