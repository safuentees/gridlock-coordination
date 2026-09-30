# F15 — A useful product entry

Purpose: orient transmission planners and coordination analysts before they enter a dense workspace. Explain the visibility problem, the benefit of prioritizing evidence-backed investigations and the next action in concise language.

Inputs: active Dataset, getReadiness, sourceEditionLabels and HomePageProps from domain/workspace.ts. Missing enabling work: Home component, purpose-based shell navigation and stable shared workspace composition.

Delivery: ui owns features/home/HomePage.tsx and changes/F15.md; coordinator owns App.tsx, domain/workspace.ts and shell integration. Depends on F14 and the shared journey contract. Initial destination is Home; primary Open workspace enters Explore, secondary Outcomes/Data readiness explain their purpose, and Try demo explicitly selects demo mode. Derive coverage from current data, never hard-code corpus counts. No regulatory, current-status or savings claims.

Complete when an arrival can identify intended user, problem, benefit, active data mode/source coverage and a clear entry action; all four destinations work and navigation preserves mounted Explore/Readiness state and drafts. Each screen fills the viewport and scrolls internally. Default shadcn components and current copy rules apply. No hero artwork, onboarding wizard, accounts or new router dependency.

Coordinator only: one build at the integrated F15/F16/F19 first slice milestone; workers run no checks or visual audits.
