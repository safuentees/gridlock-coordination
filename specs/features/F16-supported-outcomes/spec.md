# F16 — Explain supported outcomes

Purpose: help an analyst understand what the available results establish, what they cannot establish and which investigation/action is worth doing next. This is a dedicated Outcomes screen, not a savings scoreboard or a second explorer.

Inputs: OutcomesWorkspaceProps (active Dataset, shared applied AnalysisOptions and authoritative AnalysisResult, navigation callbacks), getReadiness and sourceEditionLabels. Missing enabling work: lift scenario state/analysis into the shell so Explore and Outcomes agree, reveal a candidate and open the existing saved-review dialog from Outcomes.

Delivery: core owns features/outcomes/OutcomesWorkspace.tsx and changes/F16.md. Coordinator owns App/Explorer/BriefWorkspace composition; ui retains other UI ownership. Depends on F14 and shared journey interfaces; independent of F15 component delivery.

Complete when the view describes the applied full-dataset scenario (explicitly before Explore text/location filters), derives candidate and coverage counts, distinguishes dated milestones from explicit construction windows, retains source/demo labeling and exposes purposeful actions. A few ranked evidence examples open the same Explore detail. Missing locations lead to Data readiness; preparing/returning to a brief opens Saved reviews. Zero candidates and unknown dates/windows are useful states, never zero impact or proof of no opportunity.

Resource questions may cover right-of-way, crews/equipment and substation capacity (challenge §1). These are investigation topics only. Reuse existing core output and the existing per-candidate Impact calculator; explain that it needs user-supplied assumptions and excludes feasibility. Do not infer shared miles from center distance, sum hypothetical savings, equate project budgets with savings or create a benefit score. Default components, bounded internal scrolling, no new dependencies. Coordinator performs the single composition build; no worker or visual checks.
