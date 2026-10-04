# FIX-F29 — Recover experimental map startup
- Failed experimental startup now offers Retry experimental map; each retry creates a fresh React.lazy payload and resets the error boundary. Standard → Experimental also starts a fresh attempt.
- This fixes the definite cached-rejection defect: the previous module-level lazy component reused its rejected import after returning from Standard. Adapter identity stays stable during each active attempt.
- Retry retains the ProjectMap wrapper, selection/source/filter inputs and one-shot entrance latch; retry completes that latch rather than replaying entrance. Public props, density/geography calculations, shared UI and packages are unchanged.
- Coordinator found no listener on port 5174 before restarting Vite, plus dependency reoptimization for the new direct deck.gl core import. Those can explain the original load failure; its exact browser exception and GPU behavior remain unconfirmed.
- Source inspected only. No worker runtime/build/browser/visual/mobile checks; coordinator owns the targeted recovery/module-serving case and any Vite configuration change.
