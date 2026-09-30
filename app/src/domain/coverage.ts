import { z } from "zod"

export const sourceSchema = z.object({
  file: z.string(), locator: z.string(), url: z.url().refine(value => /^https?:\/\//i.test(value), "Source links must use HTTP or HTTPS").nullable(),
})
export const sourceKeySchema = z.string().regex(/^[a-z][a-z0-9-]*$/)
const evidenceSchema = z.array(sourceSchema).min(1)
const countSchema = z.number().int().nonnegative()
const positionSchema = z.tuple([z.number().min(-180).max(180), z.number().min(-90).max(90)])
export const dateSchema = z.object({ value: z.string().nullable(), precision: z.enum(["day", "month", "year", "unknown"]), kind: z.enum(["in-service", "need", "unknown"]), label: z.string() }).superRefine((date, ctx) => {
  const valid = date.precision === "unknown" ? date.value === null
    : date.precision === "year" ? /^\d{4}$/.test(date.value ?? "")
    : date.precision === "month" ? /^\d{4}-(0[1-9]|1[0-2])$/.test(date.value ?? "")
    : z.iso.date().safeParse(date.value).success
  if (!valid) ctx.addIssue({ code: "custom", message: "Date value must match its stated precision", path: ["value"] })
})

/** Published positions, not inferred routes. Coordinate order is longitude, latitude. */
export const nativeGeometrySchema = z.object({
  type: z.enum(["Point", "MultiPoint"]), coordinates: z.array(positionSchema).min(1),
  role: z.enum(["substation-center", "tower-location", "line-endpoints", "multiple-locations", "general-pin", "permit-area", "unknown"]),
  crs: z.string().nullable(), accuracyMeters: z.number().nonnegative().nullable(),
  rawLatitude: z.string().nullable(), rawLongitude: z.string().nullable(), evidence: evidenceSchema,
}).refine(geometry => geometry.type === "Point" ? geometry.coordinates.length === 1 : geometry.coordinates.length > 1, "Geometry type must match its position count")

/** Optional on legacy records; required for every new reporting group. */
export const inventorySchema = z.object({
  sourceKey: sourceKeySchema, editionId: z.string().min(1), editionLabel: z.string().min(1),
  reportingGroupName: z.string().min(1),
  recordKind: z.enum(["transmission-project", "capital-project-context", "planning-context"]),
  lifecycle: z.enum(["planned", "approved", "under-construction", "on-hold", "in-service", "cancelled", "unknown"]),
  lifecycleAsOf: z.union([z.iso.date(), z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/)]),
  owner: z.object({ id: sourceKeySchema, name: z.string().min(1), evidence: evidenceSchema, identityScope: z.enum(["source", "global"]).optional() }).nullable(),
  recordUnit: z.enum(["project", "upgrade", "component"]).optional(),
  sourceState: z.string().nullable().optional(), sourceLocation: z.string().nullable().optional(),
  sourceUpdatedOn: z.iso.date().nullable().optional(),
  lifecycleDateMeaning: z.enum(["source-edition", "snapshot-observed"]).optional(),
  milestones: z.array(z.object({ field: z.string().min(1), date: dateSchema, evidence: evidenceSchema })).optional(),
  parentProgramId: z.string().nullable(), aliases: z.array(z.string()),
  workType: z.string().nullable(), constructionStart: z.iso.date().nullable(),
  nativeGeometry: nativeGeometrySchema.nullable(),
  centerRole: z.enum(["substation-center", "tower-location", "endpoint-midpoint", "single-endpoint", "general-pin", "permit-area", "unknown"]),
  locationAssumptions: z.array(z.string()),
})

export const sourceEditionSchema = z.object({
  sourceKey: sourceKeySchema, editionId: z.string().min(1), label: z.string().min(1),
  reportingGroupId: sourceKeySchema, reportingGroupName: z.string().min(1),
  publisher: z.string().min(1), processAuthority: z.string().nullable(),
  publishedOn: z.iso.date().nullable(), retrievedOn: z.iso.date(),
  source: sourceSchema, sha256: z.string().regex(/^[a-f0-9]{64}$/),
  geographicScope: z.string().min(1), inventoryScope: z.string().min(1),
  scope: z.enum(["sample", "full"]),
  counts: z.object({ sourceRows: countSchema, importedRecords: countSchema, excludedRows: countSchema, failedRows: countSchema, pendingRows: countSchema, locatedRecords: countSchema }),
  exclusions: z.array(z.object({ reason: z.string().min(1), count: countSchema })),
  limitations: z.array(z.string()),
}).superRefine((edition, ctx) => {
  const counts = edition.counts
  if (counts.sourceRows !== counts.importedRecords + counts.excludedRows + counts.failedRows + counts.pendingRows) ctx.addIssue({ code: "custom", path: ["counts"], message: "Every source row must be reconciled" })
  if (counts.locatedRecords > counts.importedRecords) ctx.addIssue({ code: "custom", path: ["counts", "locatedRecords"], message: "Located count cannot exceed imported count" })
  if (edition.exclusions.reduce((sum, row) => sum + row.count, 0) !== counts.excludedRows) ctx.addIssue({ code: "custom", path: ["exclusions"], message: "Exclusion counts must reconcile" })
  if (edition.scope === "full" && (counts.pendingRows || counts.failedRows)) ctx.addIssue({ code: "custom", path: ["scope"], message: "Full scope cannot contain pending or failed rows" })
})

export type SourceEdition = z.infer<typeof sourceEditionSchema>
export type InventoryMetadata = z.infer<typeof inventorySchema>
