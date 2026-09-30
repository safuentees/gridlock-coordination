import { useId, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { estimateImpact } from "@/core"
import type { ImpactResult, Opportunity, Project } from "@/domain/schema"

export interface ImpactPanelProps {
  opportunity: Opportunity
  projects: [Project, Project]
}

type Fields = { length: string; width: string; cost: string; share: string }
const EMPTY_FIELDS: Fields = { length: "", width: "", cost: "", share: "" }
const EXAMPLE_FIELDS: Fields = { length: "1", width: "100", cost: "10000", share: "50" }
const FIELD_DEFINITIONS: Array<{ key: keyof Fields; label: string; max?: number }> = [
  { key: "length", label: "Assumed shared length (miles)" },
  { key: "width", label: "Assumed corridor width (feet)" },
  { key: "cost", label: "Assumed land cost (USD per acre)" },
  { key: "share", label: "Land cost potentially avoided (%)", max: 100 },
]
const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })
const acres = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 })

// Key the form by candidate so assumptions never silently transfer to another pair.
export function ImpactPanel(props: ImpactPanelProps) {
  return <ImpactForm key={props.opportunity.id} {...props} />
}

function ImpactForm({ opportunity, projects }: ImpactPanelProps) {
  const fieldId = useId()
  const [fields, setFields] = useState<Fields>(EMPTY_FIELDS)
  const errors: Partial<Record<keyof Fields, string>> = {}
  for (const field of FIELD_DEFINITIONS) {
    if (fields[field.key].trim() === "") continue
    const value = Number(fields[field.key])
    if (!Number.isFinite(value) || value < 0) errors[field.key] = "Enter a finite number of zero or more."
    else if (field.max !== undefined && value > field.max) errors[field.key] = "Enter a percentage between 0 and 100."
  }
  const complete = FIELD_DEFINITIONS.every(({ key }) => fields[key].trim() !== "")
  let result: ImpactResult | null = null
  let calculationError: string | null = null
  if (complete && Object.keys(errors).length === 0) {
    try {
      result = estimateImpact({
        sharedLengthMiles: Number(fields.length),
        corridorWidthFeet: Number(fields.width),
        costPerAcreUsd: Number(fields.cost),
        shareFraction: Number(fields.share) / 100,
      })
    } catch (error) {
      calculationError = error instanceof Error ? error.message : "These assumptions cannot be calculated."
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Hypothetical shared-corridor impact</CardTitle>
        <CardDescription>
          Explore land cost assumptions for {projects[0].name} and {projects[1].name}.
          The {opportunity.distanceMiles.toFixed(2)}-mile center separation does not establish shared corridor length.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => setFields(EXAMPLE_FIELDS)}>Use hypothetical example</Button>
          <Button type="button" variant="ghost" size="sm" onClick={() => setFields(EMPTY_FIELDS)}>Clear assumptions</Button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {FIELD_DEFINITIONS.map(({ key, label, max }) => (
            <div key={key} className="space-y-2">
              <Label htmlFor={`${fieldId}-${key}`}>{label}</Label>
              <Input
                id={`${fieldId}-${key}`}
                type="number"
                min={0}
                max={max}
                step="any"
                inputMode="decimal"
                value={fields[key]}
                onChange={(event) => setFields((previous) => ({ ...previous, [key]: event.target.value }))}
                aria-invalid={Boolean(errors[key])}
                aria-describedby={errors[key] ? `${fieldId}-${key}-error` : undefined}
              />
              {errors[key] && <p id={`${fieldId}-${key}-error`} className="text-sm text-destructive">{errors[key]}</p>}
            </div>
          ))}
        </div>
        <div aria-live="polite" aria-atomic="true" className="space-y-3">
          {result ? (
            <>
              <dl className="grid gap-3 sm:grid-cols-2">
                <div><dt className="text-muted-foreground">Hypothetical shared area</dt><dd className="text-lg font-medium">{acres.format(result.sharedAcres)} acres</dd></div>
                <div><dt className="text-muted-foreground">Indicative avoided land cost</dt><dd className="text-lg font-medium">{currency.format(result.indicativeSavingsUsd)}</dd></div>
              </dl>
              <p className="text-sm text-muted-foreground">Hypothetical results from your inputs. Shared-route feasibility and actual savings are unknown.</p>
            </>
          ) : (
            <p className={calculationError ? "text-sm text-destructive" : "text-sm text-muted-foreground"}>
              {calculationError ?? (Object.keys(errors).length > 0 ? "Correct the assumptions to calculate an estimate." : "Enter all four assumptions to calculate an estimate, or load the hypothetical example.")}
            </p>
          )}
        </div>
        <details className="text-sm">
          <summary className="cursor-pointer">Calculation and limitations</summary>
          <div className="mt-2 space-y-2 text-muted-foreground">
            <p>Acres = shared miles × 5,280 × width in feet ÷ 43,560. Indicative avoided land cost = acres × cost per acre × avoided share.</p>
            <p>This rectangular land-area estimate excludes engineering, construction, permitting, acquisition and schedule effects.</p>
            {result && <ul className="list-disc space-y-1 pl-5">{result.assumptions.map((assumption) => <li key={assumption}>{assumption}</li>)}</ul>}
          </div>
        </details>
      </CardContent>
    </Card>
  )
}
