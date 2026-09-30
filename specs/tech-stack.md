# Shared technical agreement

## Stack and commands
Vite + React + TypeScript in `app/`, npm lockfile, Tailwind 4, official shadcn Nova preset with Radix, neutral colors and Geist, Leaflet/react-leaflet, Zod. No backend. `cd app && npm ci`; `npm run dev -- --host 127.0.0.1`; checker only: `npm run build` and `npx tsx scripts/check-core.ts` once per integrated milestone as appropriate. Python ingestion uses bundled pypdf/openpyxl read-only against originals; generated application builds are ignored.

Official defaults read: [Vite](https://ui.shadcn.com/docs/installation/vite), [CLI](https://ui.shadcn.com/docs/cli), [table](https://ui.shadcn.com/docs/components/radix/table), [tabs](https://ui.shadcn.com/docs/components/radix/tabs), [input](https://ui.shadcn.com/docs/components/radix/input). Preserve generated components and theme; use ordinary layout utilities, no redesign or visual inspection.

## Authoritative contract
`app/src/domain/schema.ts` owns runtime Dataset/Project validation, domain types and analysis options. `app/src/domain/example.ts` is the representative contract record. Coordinator owns these files, package/dependency files, entry point, `app/src/index.css`, shared `components/ui/*`, `data/provider.ts`, specs and integration receipts. UI owns App after F00.

`loadDataset(mode: 'real'|'demo'): Dataset` returns validated records or throws, never falls back from real to demo. Real producer owns `app/src/data/real/*` and `scripts/ingest/*`; UI owns `app/src/data/demo/*`. Both return the same Dataset. UI uses `analyzeProjects(projects, options): AnalysisResult` from `app/src/core/index.ts`; core worker alone implements distance, ranking, date comparison and impact. No UI or ingestion copies of these calculations.

## Field meaning
- `id` is stable source-based identity, `sourceId` native project ID, `utilityId` reporting/filing group (`desc` or `gpc`), `sponsor` separately preserves listed owner/sponsor or null. Reporting-group comparison does not guarantee different asset owners.
- `date.value` ISO source date with explicit precision and kind (`in-service`, `need`, `unknown`); partial values retain precision, not invented day precision. `buildWindow` is null unless actual construction bounds are known.
- `location` is null when unknown; decimal WGS84 lat/lon, method and confidence accompany evidence. Midpoint means arithmetic endpoint average per guide. `unverified` includes workbook-provided coordinates; no invented precision or independently verified claim.
- Distances in statute miles, voltage in kV, time gap absolute UTC calendar days only when both dates have day precision. Geometry uses project centers, never inferred full corridors. Strict distance < radius. Default 25 mi; maxDateGapDays null means no timing exclusion. Unknown dates fail an explicitly enabled date-gap filter and otherwise remain candidates.
- Distance is primary rank, then known date gap, then stable ID. Construction overlap only when explicit windows intersect. Date proximity is milestone context, never proof of simultaneous construction. Date-proximity default <=365 days is a reversible convention.
- SourceRef uses exact filename and page/sheet/range; optional URL only when known. Missing cost, dates, sponsor or location are null. `notes` retain material caveats.
- Dataset includes mode, version, snapshot title/date and processed/skipped/failed counts. Real counts exclude synthetic records. Export demo labels. Treat imported text as plain data.

## Scale and parallel connection
300 deterministic demo projects with realistic names, varied dates, both utilities, clustered and distant locations, missing values and a minority of near pairs. Observed corpus is 252 list records before linking the ten workbook examples. Ingestion first commits the 10-record batch; integrate F01 with F02/F03 immediately, then expand via F04. Source snapshots are not live schedules.

## Ownership and checks
Coordinator acts as named checker sequentially and alone: at most one existing build/compile plus one representative core input/output check, five minutes per milestone. Workers implement and inspect code but do not run planned verification, browser/Playwright, screenshots or visual audits. Check-core is authored by core worker and executed by coordinator. No new test framework or CI.

Core expected example: Jasper–Okatie ↔ McIntosh–Purrysburg from discovery.md gives about 5.65 mi, 152 days, unverified candidate; no confirmed construction interval. Rank IDs stable. Impact is user-supplied shared miles × 5280 × width feet / 43560 square feet per acre, then × cost/acre × share fraction; label hypothetical.
