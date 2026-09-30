import type { Dataset } from "@/domain/schema"
export const demoDataset: Dataset = {
  schemaVersion: 1, mode: "demo", title: "Demonstration projects", generatedAt: "2026-09-30",
  projects: [], coverage: { processed: 0, skipped: 0, failed: 0, notes: ["Synthetic generator is assigned to F03."] },
}
