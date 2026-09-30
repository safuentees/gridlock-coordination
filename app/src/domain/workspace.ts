import type { AnalysisOptions, AnalysisResult, Dataset } from "./schema"

export type Workspace = "home" | "explore" | "outcomes" | "readiness"

export interface HomePageProps {
  dataset: Dataset
  onNavigate: (workspace: Exclude<Workspace, "home">) => void
  onDemo: () => void
}

export interface OutcomesWorkspaceProps {
  dataset: Dataset
  options: AnalysisOptions
  analysis: AnalysisResult
  onExplore: (opportunityId?: string) => void
  onReadiness: () => void
  onSavedFindings: () => void
}
