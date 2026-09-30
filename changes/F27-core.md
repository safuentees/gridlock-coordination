# F27 core compatibility
- Different inventories now require two globally scoped, evidenced owner identities; absent scope stays source-scoped without changing stored records.
- Same-owner IDs remain excluded, same-source evidenced owner distinctions remain supported, and legacy/legacy behavior is unchanged.
- Brief text exports source record units, state/location text, row updates, lifecycle date meaning, owner scope and all reported milestones with evidence; JSON retains the optional snapshot fields.
- No shared schemas, storage defaults, calculation formulas or source adapters changed.
- Coordinator integration check pending; no worker builds, tests, browser or visual checks run.
