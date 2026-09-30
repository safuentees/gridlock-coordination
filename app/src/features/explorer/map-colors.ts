type RGB = [number, number, number]

const reportingColors = new Map<string, RGB>([
  ["desc", [37, 99, 235]],
  ["gpc", [180, 83, 9]],
  ["sce-tpr", [15, 118, 110]],
])
const additionalColors: RGB[] = [[190, 18, 60], [77, 124, 15], [71, 85, 105], [14, 116, 144]]

/** Reporting group encoding only; independent of filters/order, ownership or eligibility. */
export function mapReportingGroupColor(id: string): { css: string; rgb: RGB } {
  let hash = 0
  for (let index = 0; index < id.length; index += 1) hash = (Math.imul(hash, 31) + id.charCodeAt(index)) >>> 0
  // A finite palette can repeat; the legend always retains the source's text label.
  const [red, green, blue] = reportingColors.get(id) ?? additionalColors[hash % additionalColors.length]
  const rgb: RGB = [red, green, blue]
  return { css: `#${rgb.map(channel => channel.toString(16).padStart(2, "0")).join("")}`, rgb }
}
