# UI composition for Gridlock

Adapted from the requested [template v1.9.0 composition guidance](https://github.com/safuentees/agent-workflow-template/blob/main/specs/ui-composition.md), read 2026-09-30. These rules supplement, not replace, Gridlock's single-panel navigation, source meanings, preset and bounded-checking decisions.

- State the primary user task for a surface. Organize supporting content around that task; additional pages are justified by distinct workflows, not by a desire to distribute controls.
- Identify whether each action affects the workspace, collection, selection or item. Place it beside that context and make its target clear before activation.
- Group controls by meaning and frequency. Keep browsing tabs, search and filters together; keep scenario/view controls with the workspace they affect. Avoid adding another toolbar band simply because a feature arrived later.
- Keep frequent actions visible. Put rare layout choices in a labeled menu. Familiar icon-only actions need accessible names and hover/focus labels; domain actions and meaningful state retain text. Do not use an arbitrary button-count limit.
- Give repeated rows a stable identification pattern and align comparable fields. Retain full-name access, units, date kinds, unknowns and material uncertainty. Formatting must not imply stronger evidence.
- Bound the scrolling body, leaving tabs and essential controls outside it. Use shrinkable flex/grid ancestors; preserve default readable typography, spacing and focus outlines. Do not fix scrolling by clipping content.
- Before adding a UI capability, specify action scope, destination and placement, including which existing control is reused, moved or replaced. Coordinator is the shared composition owner; coordinate slots and file handoffs without adding a new approval gate.
- Use existing Radix/shadcn semantics for tabs, dialogs and menus. A visually grouped set of buttons does not need `role="toolbar"` unless its keyboard behavior implements that pattern. Hidden retained views remain inert.

## Evidence used

[Brumby and Zhuang (2015)](https://discovery.ucl.ac.uk/id/eprint/1499240/) supports semantic grouping; unrelated controls should not appear to form one task. [Rosenholtz et al. (2007)](https://pubmed.ncbi.nlm.nih.gov/18217832/) explains how clutter can hinder recognition/search; it does not establish a numeric control quota. [Shneiderman (1996)](https://drum.lib.umd.edu/items/155a868e-fb83-4115-9899-9187ea8c0498) informs overview, filtering and details on demand.

[Carbon data tables](https://carbondesignsystem.com/components/data-table/usage/) informs consistent rows, collection versus selected-item actions and pagination placement. [Fluent toolbars](https://fluent2.microsoft.design/components/web/react/core/toolbar/usage/) informs task grouping and labeled overflow. [NN/G heuristics](https://www.nngroup.com/articles/ten-usability-heuristics/) informs visible state, consistency and concise recovery. [W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/), especially tabs and menu buttons, informs keyboard/semantic behavior. These are interaction references; keep the existing shadcn library and preset. The [official dropdown-menu documentation](https://ui.shadcn.com/docs/components/radix/dropdown-menu) applies to Layout options.

Source inspection supports composition decisions, not a claim of proven usability. No browser, new screenshots, visual verification or mobile audits; only the existing named-checker budget applies.
