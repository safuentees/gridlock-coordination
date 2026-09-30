# F26 — Import the first full usable public inventory

Selected national-coverage increment 2, dependent on F25 qualification and the shared contract below. Source `ca-sce-tpr` / `2026-06-01` is selected through PR56. The exact implementation agreement is [F26-C1](contract.md). Purpose: let users discover and investigate the complete usable public planned-transmission inventory in the chosen source edition, beyond the qualification sample.

## Concrete tasks and owners

| Task | Owner and exact boundaries | Dependency | Observable completion |
|---|---|---|---|
| F26-C1 Shared import contract | coordinator: `app/src/domain/schema.ts`, `example.ts`, new `coverage.ts`, `specs/tech-stack.md`; core: agreed canonical eligibility slice under `app/src/core/` | F25 selected source/sample and existing saved-source contracts | Runtime fields/version, stable IDs, migration, edition manifest, lifecycle/location meaning, pair eligibility and producer/consumer signatures committed; existing saved data and legacy cross-filing analysis retain meaning |
| F26-I1 Source ingestion, early sample then full inventory | ingestion: `scripts/ingest/coverage/<source-key>/*`, `app/src/data/real/coverage/<source-key>/*` | C1; coordinator replaces `<source-key>` with the chosen exact slug/edition before assignment | Reproducible complete public extraction with source row accounting, normalized records, manifest, exclusions and missing-field counts; first sample handed over early without waiting for full extraction |
| F26-I2 Product integration and coverage | coordinator: provider/import/readiness/source-session composition and `specs/us-coverage/*`; ui: exact agreed Readiness/import consumer files; core: only C1-agreed canonical changes | C1 for parallel consumer preparation; I1 sample for first real connection, full I1 inventory for completion | Full imported inventory is searchable, located records feed existing map props, unlocated records remain accessible, source/lifecycle limits are clear, revision preview preserves drafts/reviews and coverage reconciles with imported records |

The selected source, exact paths and API signatures are recorded in [F26-C1](contract.md); dispatch begins after its shared commit. Owners use separate worktrees and one active implementation feature. The source worker can transition to ingestion without duplicate research. UI prepares consumers with synthetic records on the committed shared contract while ingestion produces real records. Map-ui retains F22/F23 files and package ownership; do not edit them or block them on bulk extraction.

## Shared meanings

Follow the [national coverage contract](../../us-coverage/README.md). The current schema accepts only `desc|gpc`; do not relabel new projects as either group. Source key and native project ID define stable identity independently of edition; preserve legacy IDs. Keep publisher/reporting group, region and listed owner distinct. Agreement must resolve regional pair eligibility in the canonical engine rather than relying on publisher inequality or inventing distinct owners. Preserve SourceRef provenance, date kinds/precision and null construction windows. Retain geometry role/precision and raw lifecycle; no generic pin is silently upgraded to a confirmed asset center.

C1 provides a backwards-compatible Project consumer boundary or explicit migration/adapter before real ingestion. Map props stay compatible; map and synthetic fixtures use the same declared record contract, never a private map schema. Existing infrastructure and generation proposals remain outside the planned-transmission inventory; preserved context must be typed and excluded from project/coverage totals.

## Full-inventory completion

Enumerate the entire accessible public source edition within its declared planned-transmission scope. Reconcile each source row/facility grouping as an imported project, a documented nonproject/duplicate child record, an explicit lifecycle/type exclusion or an unresolved processing failure. Do not cherry-pick located records. All valid projects lacking coordinates remain imported and searchable. Unresolved technical failures or unprocessed pages mean the full-inventory task is incomplete; publisher-redacted or unavailable fields remain explicit gaps and never trigger a claim of full regional completeness.

Complete only when the whole usable public inventory is integrated through the shared schema, coverage/register counts match the source manifest and active baseline, users can inspect source dates/evidence and apply revisions without losing work, and the sole coordinator's bounded integration check is reported. A 6–10-record sample, an export-only artifact or a refresh cannot satisfy this milestone. Original attachments and legacy source data stay preserved.

Ship small coherent producer/consumer PRs and integrate the first sample early. Continue extraction after sample integration under this selected scope. Only coordinator runs the five-minute nonvisual check budget as appropriate; no worker duplicate checks, browser/Playwright, screenshots or mobile audits. On full integration update the register and dispatch the next qualified F27 regional adapter; do not return to recommendations-only mode.

## Integrated result

C1 and the early six-record sample are followed by the full 167-record source inventory; 494 rows reconcile with 327 exclusions and no pending/failed rows. Source 103 centers are unverified,64 unresolved and all owners unknown. Aggregate 419 records retains the original 252 unchanged. Dynamic workspace/source evidence, saved v1/v2 compatibility, canonical eligibility and explicit additive bundled-update preview are connected. Coordinator build plus representative source/save/revision case passed at de3b170; no worker/browser/visual checks. F27 qualification is dispatched; national coverage remains partial.
