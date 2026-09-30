import type { Project } from "../domain/schema"
import { hasUsableCoordinates } from "./geography"

export interface Eligibility { eligible: boolean; reasons: string[] }
const activeLifecycles = new Set(["planned", "approved", "under-construction"])
const qualifiedCenterRoles = new Set(["substation-center", "tower-location", "endpoint-midpoint", "single-endpoint"])
const legacyPairReason = "Projects belong to different reporting filings; their asset sponsors may differ from the filing utilities."

function evidencedOwner(project: Project) {
  const owner = project.inventory?.owner
  return owner && owner.id.trim() && owner.evidence.some(source => source.file.trim() && source.locator.trim()) ? owner : null
}

/** Record eligibility precedes scenario confidence, radius and milestone filters. */
export function projectEligibility(project: Project): Eligibility {
  const reasons: string[] = []
  const located = hasUsableCoordinates(project.location)
  if (!located) reasons.push("A usable project location is not available.")
  const inventory = project.inventory
  if (!inventory) {
    if (project.utilityId !== "desc" && project.utilityId !== "gpc") reasons.push("This reporting group has no source-qualified inventory metadata.")
    return { eligible: reasons.length === 0, reasons }
  }
  if (inventory.recordKind !== "transmission-project") reasons.push(inventory.recordKind === "planning-context"
    ? "This record is planning context; physical transmission work has not been established for matching."
    : "This record is capital-project context, not a transmission project.")
  if (!activeLifecycles.has(inventory.lifecycle)) reasons.push(`Lifecycle is ${inventory.lifecycle.replaceAll("-", " ")} as of ${inventory.lifecycleAsOf}; matching requires planned, approved or under-construction work.`)
  if (located && !qualifiedCenterRoles.has(inventory.centerRole)) reasons.push(`The displayed location role is ${inventory.centerRole.replaceAll("-", " ")}; it is not a qualified center for distance matching.`)
  if (!evidencedOwner(project)) reasons.push("No asset-owner identity with a cited source file and locator is available. Reporting groups and sponsor labels are not owner evidence.")
  return { eligible: reasons.length === 0, reasons }
}

/** Legacy comparisons retain filing semantics; cross-inventory owners need global identity evidence. */
export function pairEligibility(left: Project, right: Project): Eligibility {
  if (left.id === right.id) return { eligible: false, reasons: ["A project cannot be compared with itself."] }
  const reasons = [left, right].flatMap(project => projectEligibility(project).reasons.map(reason => `${project.name}: ${reason}`))
  if (reasons.length) return { eligible: false, reasons }
  if (!left.inventory && !right.inventory) {
    return left.utilityId !== right.utilityId
      ? { eligible: true, reasons: [legacyPairReason] }
      : { eligible: false, reasons: ["Legacy candidates require different reporting filings."] }
  }
  const leftOwner = evidencedOwner(left), rightOwner = evidencedOwner(right)
  if (!leftOwner || !rightOwner) return {
    eligible: false,
    reasons: ["Pairs involving source-qualified inventory require evidenced owner identities for both projects; a legacy filing or sponsor label does not establish ownership."],
  }
  if (leftOwner.id === rightOwner.id) return { eligible: false, reasons: ["Source evidence identifies the same asset owner for both projects."] }
  const sameInventory = left.inventory!.sourceKey === right.inventory!.sourceKey
  if (!sameInventory && (leftOwner.identityScope !== "global" || rightOwner.identityScope !== "global")) return {
    eligible: false,
    reasons: ["Comparing different source inventories requires globally scoped, evidenced owner identities for both projects. Source-scoped or unspecified owner identities do not establish distinct owners across inventories."],
  }
  return {
    eligible: true,
    reasons: [
      `Source evidence identifies distinct asset owners: ${leftOwner.name} (${leftOwner.id}) and ${rightOwner.name} (${rightOwner.id}).`,
      `Location roles are ${left.inventory!.centerRole.replaceAll("-", " ")} and ${right.inventory!.centerRole.replaceAll("-", " ")}; these points do not establish a shared route.`,
    ],
  }
}
