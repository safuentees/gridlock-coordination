import { useState, type ReactNode } from "react"
import { CalculatorIcon, FileTextIcon, InfoIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { compareProjectTiming } from "@/core"
import { UTILITIES, type Dataset, type Opportunity, type Project } from "@/domain/schema"
import { ImpactPanel } from "@/features/impact/ImpactPanel"
import { ProjectEvidence } from "./ProjectDetails"
import { sourceEditionLabels } from "@/lib/presentation"
import { dateKind, projectDate } from "./format"

export interface ComparisonPanelProps {
  dataset: Dataset
  selectedOpportunity: Opportunity | null
  selectedProject: Project | null
  actions?: ReactNode
  onProject: (id: string) => void
}

const BODY_CLASS = "min-h-0 min-w-0 flex-1 overflow-auto overscroll-contain [overflow-wrap:anywhere]"

export function ComparisonPanel({ dataset, selectedOpportunity, selectedProject, actions, onProject }: ComparisonPanelProps) {
  const [tab, setTab] = useState("evidence")
  const pair = selectedOpportunity?.projectIds.map((id) => dataset.projects.find((project) => project.id === id)) ?? []
  const [left, right] = pair
  const canEstimate = Boolean(selectedOpportunity && left && right)
  const activeTab = tab === "impact" && !canEstimate ? "evidence" : tab
  const timing = left && right ? compareProjectTiming(left, right) : null
  const constructionLabel = timing?.constructionRelation === "overlap" ? "Construction windows overlap"
    : timing?.constructionRelation === "separate" ? "Construction windows do not overlap" : "Construction overlap unknown"
  const sourceEditions = sourceEditionLabels(selectedOpportunity
    ? pair.filter((project): project is Project => Boolean(project))
    : selectedProject ? [selectedProject] : dataset.projects)

  return <Card className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden" aria-label="Project comparison">
    <CardHeader className="max-h-[55%] min-h-0 shrink-0 overflow-auto overscroll-contain [overflow-wrap:anywhere]">
      <div className="flex flex-wrap items-center gap-2"><CardTitle>{selectedOpportunity ? `Candidate #${selectedOpportunity.rank}` : selectedProject ? "Project evidence" : "Compare projects"}</CardTitle>{dataset.mode === "demo" && <Badge variant="secondary">Synthetic demo</Badge>}</div>
      {selectedOpportunity ? <div className="space-y-3">
        <div className="grid min-w-0 grid-cols-2 gap-4">
          {selectedOpportunity.projectIds.map((id, index) => <ProjectSummary key={id} project={pair[index] ?? null} missingId={id} onProject={onProject} />)}
        </div>
        <dl className="grid min-w-0 grid-cols-3 gap-3 text-sm">
          <div className="min-w-0"><dt className="text-xs text-muted-foreground">Center distance</dt><dd className="font-medium">{selectedOpportunity.distanceMiles.toFixed(2)} mi</dd></div>
          <div className="min-w-0"><dt className="text-xs text-muted-foreground">Milestone gap</dt><dd className="font-medium">{selectedOpportunity.dateGapDays === null ? "Unknown" : `${selectedOpportunity.dateGapDays} days`}</dd></div>
          <div className="min-w-0"><dt className="text-xs text-muted-foreground">Locations</dt><dd className="font-medium">{selectedOpportunity.locationConfidence}</dd></div>
        </dl>
        <div className="space-y-1 text-xs text-muted-foreground">
          <p>{constructionLabel}. Shared route unconfirmed.</p>
          {(!left || !right) && <p>Project evidence is missing; impact is unavailable.</p>}
        </div>
      </div> : selectedProject ? <div className="space-y-2">
        <ProjectSummary project={selectedProject} onProject={onProject} />
        <p className="text-xs text-muted-foreground">{selectedProject.location
          ? `${selectedProject.location.confidence} project center`
          : "Location missing; not ranked by distance."}</p>
      </div> : <CardDescription>Select a candidate to compare, or a project to view its evidence.</CardDescription>}
    </CardHeader>
    {/* This stable slot keeps the parent's saved-review workspace mounted across selections and tabs. */}
    <div className="min-w-0 shrink-0 px-4">{actions}</div>
    <CardContent className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
      <Tabs value={activeTab} onValueChange={setTab} className="min-h-0 min-w-0 flex-1 overflow-hidden">
        <TabsList className="max-w-full shrink-0 justify-start overflow-x-auto"><TabsTrigger value="evidence"><FileTextIcon aria-hidden="true" data-icon="inline-start" />Evidence</TabsTrigger><TabsTrigger value="impact" disabled={!canEstimate}><CalculatorIcon aria-hidden="true" data-icon="inline-start" />Impact</TabsTrigger><TabsTrigger value="supporting"><InfoIcon aria-hidden="true" data-icon="inline-start" />Method &amp; sources</TabsTrigger></TabsList>
        <TabsContent forceMount value="evidence" className={activeTab === "evidence" ? BODY_CLASS : "hidden"}>
          <div className="min-w-0 space-y-4 pt-3">
            {selectedOpportunity ? <>
              {pair.filter((project): project is Project => Boolean(project)).map((project) => <div key={project.id} className="min-w-0 border-t pt-4 first:border-t-0 first:pt-0"><ProjectEvidence project={project} /></div>)}
            </> : selectedProject ? <ProjectEvidence project={selectedProject} /> : null}
          </div>
        </TabsContent>
        <TabsContent forceMount value="impact" className={activeTab === "impact" ? BODY_CLASS : "hidden"}>
          <div className="min-w-0 pt-3">{selectedOpportunity && left && right && <ImpactPanel opportunity={selectedOpportunity} projects={[left, right]} />}</div>
        </TabsContent>
        <TabsContent forceMount value="supporting" className={activeTab === "supporting" ? BODY_CLASS : "hidden"}>
          <div className="min-w-0 space-y-5 pt-3">
            <section className="space-y-2"><h3 className="text-sm font-medium">Comparison method</h3><ul className="list-disc space-y-2 pl-4 text-xs text-muted-foreground">
              <li>Cross-filing candidates rank by straight-line center distance, then milestone gap.</li>
              <li>Date gaps require day-precision dates. Construction overlap requires stated construction windows.</li>
              <li>A reporting utility may differ from the asset sponsor.</li>
            </ul></section>
            <section className="space-y-2"><h3 className="text-sm font-medium">Sources</h3>{sourceEditions.length > 0
              ? <ul className="space-y-1 text-xs">{sourceEditions.map(edition => <li key={edition}>{edition}</li>)}</ul>
              : <p className="text-xs">{dataset.title}</p>}</section>
          </div>
        </TabsContent>
      </Tabs>
    </CardContent>
  </Card>
}

function ProjectSummary({ project, missingId, onProject }: { project: Project | null; missingId?: string; onProject: (id: string) => void }) {
  if (!project) return <div className="min-w-0"><p className="text-sm font-medium">Project unavailable</p><p className="break-words text-xs text-muted-foreground">{missingId}</p></div>
  return <div className="min-w-0 space-y-1">
    <button type="button" className="min-w-0 break-words text-left text-sm font-medium underline-offset-4 hover:underline focus-visible:underline" onClick={() => onProject(project.id)} title="Inspect this project's evidence">{project.name}</button>
    <p className="break-words text-xs text-muted-foreground">{UTILITIES[project.utilityId]}</p>
    <p className="break-words text-xs"><span className="text-muted-foreground">{dateKind(project)}: </span>{projectDate(project)}</p>
  </div>
}
