# F28-M1 — Persistent panel header

- Replaced the Results/Detail/Collapsed toggle variants with one mounted square IconButton beside the shared search input. Up/down chevrons, Expand panel/Collapse panel names, tooltips and aria-expanded follow the current state.
- Manual toggle focus returns to that same trigger; Back and selection keep their existing focus behavior. One responsive panel width and p-3 search inset apply in every state; the local shell radius includes the nested control radius plus header padding.
- Browsing filters/tabs/counts, list scroll, selected detail, saved/scenario drafts, viewport measurements and map contracts are preserved. The separate primary-checkout Explorer patch was not edited.
- Integrated from PR180 into the published F28 branch; coordinator source review confirmed the single mounted trigger, stable width/search slot and separate Back/selection focus paths. Latest user steering removes the redundant collapsed search-header count while retaining tab/pagination/comparison counts.
- No additional build, tests or visual checks for this local composition follow-up; keyboard interaction remains unexercised.
