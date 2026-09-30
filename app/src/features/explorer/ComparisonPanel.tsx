import { useState, type ReactNode } from "react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { compareProjectTiming } from "@/core"
import { UTILITIES, type Dataset, type Opportunity, type Project } from "@/domain/schema"
import { ImpactPanel } from "@/features/impact/ImpactPanel"
import { ProjectEvidence } from "./ProjectDetails"
import { dateKind, projectDate, timelineLabels } from "./format"

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
  const constructionLabel = timing?.constructionRelation === "overlap" ? "Explicit windows overlap"
    : timing?.constructionRelation === "separate" ? "Explicit windows do not overlap" : "Unknown"

  return <Card className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden" aria-label="Project comparison">
    <CardHeader className="max-h-[55%] min-h-0 shrink-0 overflow-auto overscroll-contain [overflow-wrap:anywhere]">
      <div className="flex flex-wrap items-center gap-2"><CardTitle>{selectedOpportunity ? `Coordination candidate #${selectedOpportunity.rank}` : selectedProject ? "Project evidence" : "Compare projects"}</CardTitle>{dataset.mode === "demo" && <Badge variant="secondary">Synthetic demo</Badge>}</div>
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
          <p>{timelineLabels[selectedOpportunity.timelineRelation]}. Construction overlap: {constructionLabel.toLowerCase()}.</p>
          <p>Center proximity does not confirm a shared route. Milestone proximity does not establish simultaneous construction.</p>
          {(!left || !right) && <p>One or both source projects are unavailable in this dataset. Impact cannot be estimated for this selection.</p>}
        </div>
      </div> : selectedProject ? <div className="space-y-2">
        <ProjectSummary project={selectedProject} onProject={onProject} />
        <p className="text-xs text-muted-foreground">{selectedProject.location
          ? `${selectedProject.location.confidence === "unverified" ? "Unverified supplied" : "Source-confirmed"} project center; it does not describe the full transmission route.`
          : "Location unknown. This project remains in the inventory and cannot be ranked by proximity."}</p>
      </div> : <CardDescription>Select a candidate to compare both projects, or select an inventory project to inspect its evidence.</CardDescription>}
    </CardHeader>
    {/* This stable slot keeps the parent's saved-review workspace mounted across selections and tabs. */}
    <div className="min-w-0 shrink-0 px-4">{actions}</div>
    <CardContent className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
      <Tabs value={activeTab} onValueChange={setTab} className="min-h-0 min-w-0 flex-1 overflow-hidden">
        <TabsList className="max-w-full shrink-0 justify-start overflow-x-auto"><TabsTrigger value="evidence">Evidence</TabsTrigger><TabsTrigger value="impact" disabled={!canEstimate}>Impact</TabsTrigger><TabsTrigger value="supporting">Supporting</TabsTrigger></TabsList>
        <TabsContent forceMount value="evidence" className={activeTab === "evidence" ? BODY_CLASS : "hidden"}>
          <div className="min-w-0 space-y-4 pt-3">
            {selectedOpportunity ? <>
              {pair.filter((project): project is Project => Boolean(project)).map((project) => <div key={project.id} className="min-w-0 border-t pt-4 first:border-t-0 first:pt-0"><ProjectEvidence project={project} /></div>)}
            </> : selectedProject ? <ProjectEvidence project={selectedProject} /> : <p className="text-sm text-muted-foreground">Project sources, location evidence and date meanings will appear here.</p>}
          </div>
        </TabsContent>
        <TabsContent forceMount value="impact" className={activeTab === "impact" ? BODY_CLASS : "hidden"}>
          <div className="min-w-0 pt-3">{selectedOpportunity && left && right && <ImpactPanel opportunity={selectedOpportunity} projects={[left, right]} />}</div>
        </TabsContent>
        <TabsContent forceMount value="supporting" className={activeTab === "supporting" ? BODY_CLASS : "hidden"}>
          <div className="min-w-0 space-y-5 pt-3">
            {selectedOpportunity && <section className="space-y-2"><h3 className="text-sm font-medium">Why this candidate appears</h3><ul className="list-disc space-y-2 pl-4 text-xs text-muted-foreground">{selectedOpportunity.reasons.map((reason, index) => <li key={index}>{reason}</li>)}</ul></section>}
            <section className="space-y-2"><h3 className="text-sm font-medium">Comparison method</h3><ul className="list-disc space-y-2 pl-4 text-xs text-muted-foreground">
              <li>Cross-filing candidates compare project centers using straight-line distance. Ranking prioritizes distance, then known milestone separation.</li>
              <li>Milestone gaps require source dates with day precision. Construction overlap requires explicit source construction windows.</li>
              <li>Reporting groups may include other asset sponsors. A nearby center does not establish shared right-of-way or engineering feasibility.</li>
            </ul></section>
            <section className="space-y-2"><h3 className="text-sm font-medium">Dataset context</h3><dl className="space-y-2 text-xs">
              <div><dt className="text-muted-foreground">Dataset</dt><dd>{dataset.title}</dd></div>
              <div><dt className="text-muted-foreground">Mode</dt><dd>{dataset.mode === "demo" ? "Synthetic demonstration; not a utility plan" : "Source records"}</dd></div>
              <div><dt className="text-muted-foreground">Dataset generated</dt><dd>{dataset.generatedAt}</dd></div>
            </dl><p className="text-xs text-muted-foreground">Historical planning evidence is not a live schedule. Past milestones do not establish completed work.</p>{dataset.coverage.notes.length > 0 && <ul className="list-disc space-y-2 pl-4 text-xs text-muted-foreground">{dataset.coverage.notes.map((note, index) => <li key={index}>{note}</li>)}</ul>}</section>
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
