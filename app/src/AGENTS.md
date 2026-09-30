# Product UI copy and controls

For every visible paragraph, field and label, ask: “What does the user need this for at this moment?” Remove content without a useful answer. Preserve useful field labels, units, error recovery and decision-relevant uncertainty.

- Keep extraction, deduplication, workbook-linking and implementation commentary in repository documentation. Never render `dataset.coverage.notes` wholesale in product screens. Preserve raw records and exports; use curated presentation helpers for known ingestion notes, retaining unfamiliar imported notes.
- Do not display `generatedAt` as freshness. Show a concise source edition/date only when grounded in actual sources. Preserve historical planned/need-date meanings; local saved dates are useful history, not source freshness.
- Keep missing locations, confidence and material limitations beside the affected result. Keep phase-date exceptions with the relevant project, including Dawson. Explain methodology and source background once in a clearly named, curated details view, never a disclaimer dump or a large popover.
- Show counts only for browsing, filtering, selection or active coverage. Avoid repeated instructions, metadata, empty-field filler and repeated real/demo paragraphs; retain a clear mode label wherever needed to interpret the content.
- Familiar close, previous/next, zoom and contextual panel toggles can be icon-only. Remove redundant visible text, use `IconButton` for accessible names plus hover/focus tooltips, preserve disabled/active states and shadcn default hit areas. A native `title` alone is not a keyboard-focus tooltip.
- Keep visible text for destinations, domain actions, destructive/recovery actions and distinctions an icon cannot explain. Reuse Lucide consistently; decorative icons are hidden from assistive technology. Do not decorate result rows.
- Preserve the current shadcn preset, readable defaults and viewport-contained layout with internally scrolling panels. Follow the repository's bounded checking policy; no visual checks.
