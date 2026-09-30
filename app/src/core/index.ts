import type { AnalysisOptions, AnalysisResult, Project } from "../domain/schema"
// F00 interface only. F02 replaces this scaffold with the sole domain implementation.
export function analyzeProjects(projects: Project[], _options: AnalysisOptions): AnalysisResult {
  const locatedProjects = projects.filter((project) => project.location !== null).length
  return { opportunities: [], summary: { totalProjects: projects.length, locatedProjects, unlocatedProjects: projects.length - locatedProjects, comparedPairs: 0, excludedUnverified: 0 } }
}
