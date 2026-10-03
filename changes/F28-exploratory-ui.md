# F28-E — Exploratory results presentation

- Added ExploratoryResults using the frozen transient props. It preserves core ordering and displays every supplied match through a 25-row internally scrolling queue, with page/scroll/disclosure context retained per selected project.
- Approximate point separation, sampled endpoint separation and coarse bounding-extent context are distinguished; only numeric relations use the applied radius. Unknown ownership, source IDs, date kinds/precision, lifecycle observations, timing, limitations and source links remain visible or disclosed beside the result.
- Navigation uses onProject; the UI performs no distance, overlap, owner or timing calculations and does not save strict candidates or benefit claims. Real/demo identification stays with the parent workspace because this contract has no mode prop.
- No persisted fixture, application build, tests or visual checks. Coordinator integration and bounded checking pending; this is the selection-driven presentation slice, not full F28 completion.
