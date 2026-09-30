import { useEffect, useId, useState } from "react"
import { DomEvent } from "leaflet"
import { ListIcon } from "lucide-react"
import type { reportingGroups } from "@/lib/reporting-groups"
import { mapReportingGroupColor } from "./map-colors"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverHeader, PopoverTitle, PopoverTrigger } from "@/components/ui/popover"

export interface MapLegendProps {
  groups: ReturnType<typeof reportingGroups>
  boundary: HTMLElement
  connectionCount: number
  selectedPair: boolean
  showConnections: boolean
  onShowConnections: (show: boolean) => void
}

export function MapLegend({ groups, boundary, connectionCount, selectedPair, showConnections, onShowConnections }: MapLegendProps) {
  const id = useId()
  const colors = groups.map(group => mapReportingGroupColor(group.id).css)
  const [content, setContent] = useState<HTMLDivElement | null>(null)
  useEffect(() => {
    if (!content) return
    // Static DOM events avoid Leaflet's touch-to-pointer mapping, preserving Radix dismissal.
    const events = ["mousedown", "touchstart", "touchmove", "dblclick", "contextmenu"] as const
    for (const event of events) content.addEventListener(event, DomEvent.stopPropagation, { passive: true })
    DomEvent.disableScrollPropagation(content)
    return () => {
      for (const event of events) content.removeEventListener(event, DomEvent.stopPropagation)
      DomEvent.off(content)
    }
  }, [content])

  return <Popover>
    <PopoverTrigger asChild><Button type="button" variant="outline" size="sm"><ListIcon aria-hidden="true" data-icon="inline-start" />Legend</Button></PopoverTrigger>
    <PopoverContent ref={setContent} side="bottom" align="end" collisionBoundary={boundary} collisionPadding={12} avoidCollisions
      aria-labelledby={`${id}-title`}
      className="z-40 min-w-0 max-w-[var(--radix-popover-content-available-width)] max-h-[min(24rem,var(--radix-popover-content-available-height))] overflow-y-auto overscroll-contain [overflow-wrap:anywhere] motion-reduce:data-open:animate-none motion-reduce:data-closed:animate-none motion-reduce:transition-none motion-reduce:duration-0"
      onClick={event => event.stopPropagation()}
      onKeyDown={event => event.stopPropagation()}>
      <PopoverHeader><PopoverTitle id={`${id}-title`}>Map legend</PopoverTitle></PopoverHeader>
      <ul className="space-y-2">
        {groups.map((group, index) => <li key={group.id} className="flex items-center gap-3"><MapSymbol kind="group" colors={[colors[index]]} /><span>{group.label}</span></li>)}
        <li className="flex items-center gap-3"><MapSymbol kind="candidate" colors={colors} /><span>Project in a candidate</span></li>
        <li className="flex items-center gap-3"><MapSymbol kind="selected" colors={colors} /><span>Selected project</span></li>
        <li className="flex items-center gap-3"><MapSymbol kind="connection" /><span>Candidate connection</span></li>
      </ul>
      <p>Connections link project centers; they are not transmission routes.</p>
      <div className="space-y-2">
        <div className="flex items-center gap-2"><Checkbox id={`${id}-connections`} checked={showConnections} onCheckedChange={checked => onShowConnections(checked === true)} aria-describedby={`${id}-connection-hint`} /><Label htmlFor={`${id}-connections`}>Candidate connections</Label></div>
        <p id={`${id}-connection-hint`} className="text-muted-foreground">Controls background connections. The selected candidate's connection stays visible when both locations are available.</p>
        <p className="text-muted-foreground">{selectedPair
          ? connectionCount > 0 ? "Selected candidate connection shown." : "Selected connection unavailable without both locations."
          : showConnections ? `${connectionCount} candidate connections shown.` : "Background candidate connections hidden."}</p>
        <p className="text-muted-foreground">Up to 100 candidate connections; see all in Candidates.</p>
      </div>
      <section className="space-y-2 border-t pt-3" aria-labelledby={`${id}-keyboard`}>
        <h3 id={`${id}-keyboard`} className="font-medium">Keyboard</h3>
        <p className="text-muted-foreground">Select projects or candidates in the list with the keyboard. Focus the map to pan with arrow keys or zoom with + and −.</p>
      </section>
    </PopoverContent>
  </Popover>
}

function MapSymbol({ kind, colors = [] }: { kind: "group" | "candidate" | "selected" | "connection"; colors?: string[] }) {
  const fillId = useId()
  const fill = kind === "group" ? colors[0] : colors.length ? `url(#${fillId})` : "#a3a3a3"
  const outlined = kind === "candidate" || kind === "selected"
  return <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" className="size-6 shrink-0">
    {outlined && colors.length > 0 && <defs><linearGradient id={fillId}>{colors.flatMap((color, index) => [
      <stop key={`${index}-start`} offset={`${index / colors.length * 100}%`} stopColor={color} />,
      <stop key={`${index}-end`} offset={`${(index + 1) / colors.length * 100}%`} stopColor={color} />,
    ])}</linearGradient></defs>}
    {kind === "connection"
      ? <line x1="1" y1="12" x2="23" y2="12" stroke="#525252" strokeWidth="1.5" strokeDasharray="5 5" />
      : <circle cx="12" cy="12" r={kind === "selected" ? 8 : 5} fill={fill} fillOpacity="0.85" stroke={outlined ? "#171717" : fill} strokeWidth={kind === "selected" ? 3 : kind === "candidate" ? 2 : 1} />}
  </svg>
}
