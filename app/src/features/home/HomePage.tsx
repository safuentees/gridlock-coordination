import { useMemo } from "react"
import { MapIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getReadiness } from "@/data/readiness"
import type { HomePageProps } from "@/domain/workspace"
import { sourceEditionLabels } from "@/lib/presentation"

export function HomePage({ dataset, onNavigate, onDemo }: HomePageProps) {
  const coverage = useMemo(() => getReadiness(dataset), [dataset])
  const sourceEditions = useMemo(() => sourceEditionLabels(dataset.projects), [dataset])
  const counts = [
    { label: "Projects", value: coverage.total },
    { label: "Missing locations", value: coverage.missing },
    { label: "Unverified locations", value: coverage.unverified },
    { label: "Confirmed locations", value: coverage.confirmed },
  ]

  return <section aria-labelledby="home-heading" className="h-full min-h-0 min-w-0 overflow-auto overscroll-contain p-4">
    <div className="mx-auto w-full max-w-5xl space-y-6 [overflow-wrap:anywhere]">
      <header className="space-y-3">
        <h2 id="home-heading" className="text-2xl font-semibold">Compare neighboring transmission plans</h2>
        <p className="max-w-3xl text-sm text-muted-foreground">Gridlock brings separate utility plans together for transmission planners and coordination analysts. Prioritize nearby projects, inspect the evidence, and prepare questions for a coordination review.</p>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => onNavigate("explore")}><MapIcon aria-hidden="true" data-icon="inline-start" />Open workspace</Button>
          <Button variant="outline" onClick={onDemo}>Try demo</Button>
        </div>
      </header>

      <Card>
        <CardHeader>
          <CardTitle><h3>Active {dataset.mode === "demo" ? "demo" : "source"} data</h3></CardTitle>
          <CardDescription>{dataset.title}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">{counts.map(({ label, value }) => <div key={label}><dt className="text-sm text-muted-foreground">{label}</dt><dd className="text-xl font-semibold">{value.toLocaleString()}</dd></div>)}</dl>
          {coverage.missing > 0 && <p className="text-sm text-muted-foreground">Projects without locations remain in the inventory, but cannot be compared by distance.</p>}
          {sourceEditions.length > 0 && <div className="space-y-1 text-sm text-muted-foreground"><p>{sourceEditions.join("; ")}</p><p>Historical plans; dates do not confirm current construction status.</p></div>}
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle><h3>Outcomes</h3></CardTitle><CardDescription>Understand what the applied scenario supports and choose the next investigation or review action.</CardDescription></CardHeader>
          <CardContent><Button variant="outline" onClick={() => onNavigate("outcomes")}>View outcomes</Button></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle><h3>Data readiness</h3></CardTitle><CardDescription>Review missing or unverified locations and the evidence needed to compare more projects.</CardDescription></CardHeader>
          <CardContent><Button variant="outline" onClick={() => onNavigate("readiness")}>Review location evidence</Button></CardContent>
        </Card>
      </div>
    </div>
  </section>
}
