import { z } from 'zod'

export const dimensionSchema = z.enum(['E', 'S', 'G'])
export const standardTypeSchema = z.enum(['ESRS', 'GRI'])
export const requirementTypeSchema = z.enum(['mandatory', 'voluntary'])
export const disclosureStatusSchema = z.enum(['disclosed', 'partial', 'missing'])
export const gapLevelSchema = z.enum(['major', 'minor', 'none'])
export const disclosureDepthSchema = z.enum(['leading', 'adequate', 'weak', 'missing'])
export const sentimentSchema = z.enum(['positive', 'neutral', 'negative'])
export const riskLevelSchema = z.enum(['high', 'medium', 'low'])

export const companySchema = z.object({
  id: z.string(),
  name: z.string(),
  shortName: z.string(),
  country: z.string(),
  marketPosition: z.string(),
  color: z.string(),
})

export const reportSchema = z.object({
  id: z.string(),
  companyId: z.string(),
  companyName: z.string(),
  year: z.number(),
  title: z.string(),
  language: z.string(),
  fileName: z.string(),
  pages: z.number(),
})

export const standardClauseSchema = z.object({
  id: z.string(),
  standardType: standardTypeSchema,
  clauseId: z.string(),
  topicId: z.string(),
  topicName: z.string(),
  dimension: dimensionSchema,
  requirementType: requirementTypeSchema,
  requirementText: z.string(),
  disclosureExpectation: z.string(),
})

export const disclosureGapSchema = z.object({
  id: z.string(),
  standardType: standardTypeSchema,
  clauseId: z.string(),
  topicId: z.string(),
  topicName: z.string(),
  dimension: dimensionSchema,
  requirementType: requirementTypeSchema,
  disclosureStatus: disclosureStatusSchema,
  gapLevel: gapLevelSchema,
  currentDisclosure: z.string(),
  evidence: z.string(),
  recommendation: z.string(),
  sourcePage: z.string(),
  priority: z.number(),
})

export const materialityBenchmarkItemSchema = z.object({
  id: z.string(),
  topicId: z.string(),
  topicName: z.string(),
  dimension: dimensionSchema,
  companyId: z.string(),
  companyName: z.string(),
  score: z.number(),
  disclosureDepth: disclosureDepthSchema,
  evidence: z.string(),
  signal: z.string(),
  sourceReport: z.string(),
})

export const publicOpinionItemSchema = z.object({
  id: z.string(),
  companyId: z.string(),
  companyName: z.string(),
  topicId: z.string(),
  topicName: z.string(),
  title: z.string(),
  source: z.string(),
  publishedAt: z.string(),
  sentiment: sentimentSchema,
  riskLevel: riskLevelSchema,
  reach: z.number(),
  summary: z.string(),
  clawTaskId: z.string(),
})

export const auditEventSchema = z.object({
  id: z.string(),
  time: z.string(),
  actor: z.string(),
  action: z.string(),
  target: z.string(),
  result: z.string(),
})

export const demoDatasetSchema = z.object({
  meta: z.object({
    projectName: z.string(),
    reportYear: z.number(),
    generatedAt: z.string(),
    dataVersion: z.string(),
  }),
  companies: z.array(companySchema).min(1),
  reports: z.array(reportSchema),
  standards: z.object({
    esrs: z.array(standardClauseSchema),
    gri: z.array(standardClauseSchema),
  }),
  policyDisclosureAnalysis: z.array(disclosureGapSchema),
  materialityBenchmark: z.array(materialityBenchmarkItemSchema),
  publicOpinion: z.array(publicOpinionItemSchema),
  auditTrail: z.array(auditEventSchema),
})

export type Dimension = z.infer<typeof dimensionSchema>
export type StandardType = z.infer<typeof standardTypeSchema>
export type RequirementType = z.infer<typeof requirementTypeSchema>
export type DisclosureStatus = z.infer<typeof disclosureStatusSchema>
export type GapLevel = z.infer<typeof gapLevelSchema>
export type DisclosureDepth = z.infer<typeof disclosureDepthSchema>
export type Sentiment = z.infer<typeof sentimentSchema>
export type RiskLevel = z.infer<typeof riskLevelSchema>
export type Company = z.infer<typeof companySchema>
export type Report = z.infer<typeof reportSchema>
export type StandardClause = z.infer<typeof standardClauseSchema>
export type DisclosureGap = z.infer<typeof disclosureGapSchema>
export type MaterialityBenchmarkItem = z.infer<typeof materialityBenchmarkItemSchema>
export type PublicOpinionItem = z.infer<typeof publicOpinionItemSchema>
export type AuditEvent = z.infer<typeof auditEventSchema>
export type DemoDataset = z.infer<typeof demoDatasetSchema>
