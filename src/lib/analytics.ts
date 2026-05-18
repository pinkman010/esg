import type {
  Company,
  DemoDataset,
  Dimension,
  DisclosureGap,
  GapLevel,
  MaterialityBenchmarkItem,
  PublicOpinionItem,
  RequirementType,
  RiskLevel,
  Sentiment,
  StandardType,
} from '../types/dataset'

export const dimensionLabel: Record<Dimension, string> = {
  E: '环境',
  S: '社会',
  G: '治理',
}

export const requirementLabel: Record<RequirementType, string> = {
  mandatory: '强制披露',
  voluntary: '自愿披露',
}

export const gapLevelLabel: Record<GapLevel, string> = {
  major: '重大差距',
  minor: '轻微差距',
  none: '无差距',
}

export const riskLevelLabel: Record<RiskLevel, string> = {
  high: '高风险',
  medium: '中风险',
  low: '低风险',
}

export const sentimentLabel: Record<Sentiment, string> = {
  positive: '正面',
  neutral: '中性',
  negative: '负面',
}

export const formatNumber = (value: number) => new Intl.NumberFormat('zh-CN').format(value)

export const pct = (value: number, total: number) =>
  total === 0 ? 0 : Math.round((value / total) * 100)

export const getOverviewMetrics = (dataset: DemoDataset) => {
  const gaps = dataset.policyDisclosureAnalysis
  const majorGaps = gaps.filter((item) => item.gapLevel === 'major').length
  const mandatoryGaps = gaps.filter(
    (item) => item.requirementType === 'mandatory' && item.gapLevel !== 'none',
  ).length
  const highRiskOpinions = dataset.publicOpinion.filter((item) => item.riskLevel === 'high').length
  const negativeOpinions = dataset.publicOpinion.filter((item) => item.sentiment === 'negative').length
  const benchmarkTopics = new Set(dataset.materialityBenchmark.map((item) => item.topicId)).size
  const envisionScores = dataset.materialityBenchmark.filter((item) => item.companyId === 'envision')
  const averageEnvisionScore = Math.round(
    envisionScores.reduce((sum, item) => sum + item.score, 0) / Math.max(envisionScores.length, 1),
  )

  return {
    totalGaps: gaps.filter((item) => item.gapLevel !== 'none').length,
    majorGaps,
    mandatoryGaps,
    highRiskOpinions,
    negativeOpinions,
    benchmarkTopics,
    averageEnvisionScore,
    reportCount: dataset.reports.length,
  }
}

/* ── Sparkline / 趋势数据（纯模拟，仅用于视觉） ── */

export const generateSparkline = (endValue: number, direction: 'up' | 'down', points = 7) => {
  const data: number[] = []
  let current = endValue * (1 + (direction === 'up' ? -0.12 : 0.12))
  const step = (endValue - current) / (points - 1)
  for (let i = 0; i < points - 1; i++) {
    data.push(Math.round(current + step * i + (Math.random() - 0.5) * endValue * 0.06))
  }
  data.push(endValue)
  return data
}

export interface MetricTrend {
  label: string
  value: number
  unit: string
  delta: number
  percent: number
  direction: 'up' | 'down'
  sparkline: number[]
}

export const getMetricTrends = (dataset: DemoDataset): MetricTrend[] => {
  const standardCount = dataset.standards.esrs.length + dataset.standards.gri.length
  const clauseCount = dataset.policyDisclosureAnalysis.length
  const reviewCount = dataset.policyDisclosureAnalysis.filter((item) => item.gapLevel !== 'none').length

  const trends: MetricTrend[] = [
    {
      label: '已分析报告',
      value: dataset.reports.length,
      unit: '份',
      delta: 2,
      percent: 21.7,
      direction: 'up',
      sparkline: generateSparkline(dataset.reports.length, 'up'),
    },
    {
      label: '识别议题',
      value: standardCount,
      unit: '个',
      delta: 8,
      percent: 15.3,
      direction: 'up',
      sparkline: generateSparkline(standardCount, 'up'),
    },
    {
      label: '匹配标准条款',
      value: clauseCount,
      unit: '条',
      delta: 156,
      percent: 18.9,
      direction: 'up',
      sparkline: generateSparkline(clauseCount, 'up'),
    },
    {
      label: '待复核建议',
      value: reviewCount,
      unit: '条',
      delta: 5,
      percent: 8.2,
      direction: 'down',
      sparkline: generateSparkline(reviewCount, 'down'),
    },
  ]

  return trends
}

/* ── 标准匹配详细表格 ── */

export interface StandardMatchRow {
  dimension: Dimension
  dimensionLabel: string
  total: number
  disclosed: number
  partial: number
  missing: number
  matchRate: number
}

export const getStandardMatchTable = (dataset: DemoDataset): StandardMatchRow[] => {
  const allStandards = [...dataset.standards.esrs, ...dataset.standards.gri]
  const gaps = dataset.policyDisclosureAnalysis

  const dims: Dimension[] = ['E', 'S', 'G']

  return dims.map((dim) => {
    const total = allStandards.filter((s) => s.dimension === dim).length
    const disclosed = gaps.filter((g) => g.dimension === dim && g.disclosureStatus === 'disclosed').length
    const partial = gaps.filter((g) => g.dimension === dim && g.disclosureStatus === 'partial').length
    const missing = gaps.filter((g) => g.dimension === dim && g.disclosureStatus === 'missing').length

    return {
      dimension: dim,
      dimensionLabel: dimensionLabel[dim],
      total,
      disclosed,
      partial,
      missing,
      matchRate: pct(disclosed + partial, total),
    }
  })
}

/* ── 人工复核状态 ── */

export interface ReviewStatusItem {
  name: string
  count: number
  color: string
}

export const getReviewStatus = (dataset: DemoDataset): { items: ReviewStatusItem[]; total: number } => {
  const gaps = dataset.policyDisclosureAnalysis
  const disclosed = gaps.filter((g) => g.disclosureStatus === 'disclosed').length
  const partial = gaps.filter((g) => g.disclosureStatus === 'partial').length
  const missing = gaps.filter((g) => g.disclosureStatus === 'missing').length
  const majorMissing = gaps.filter((g) => g.disclosureStatus === 'missing' && g.gapLevel === 'major').length

  const rejectCount = Math.max(1, Math.round(majorMissing * 0.3))

  const items: ReviewStatusItem[] = [
    { name: '待处理', count: missing - rejectCount, color: '#f59e0b' },
    { name: '进行中', count: partial, color: '#3b82f6' },
    { name: '已完成', count: disclosed, color: '#10b981' },
    { name: '已驳回', count: rejectCount, color: '#94a3b8' },
  ]

  return { items, total: items.reduce((sum, i) => sum + i.count, 0) }
}

/* ── 最新分析任务 ── */

export interface RecentTask {
  id: string
  title: string
  fileName: string
  fileType: 'pdf' | 'docx' | 'xlsx'
  uploadedAt: string
  status: 'completed' | 'analyzing' | 'queued'
  progress: number
}

export const getRecentTasks = (dataset: DemoDataset): RecentTask[] => {
  const statuses: RecentTask['status'][] = ['completed', 'analyzing', 'queued']
  const progressMap: Record<RecentTask['status'], number> = { completed: 100, analyzing: 68, queued: 0 }

  return dataset.reports.slice(0, 5).map((report, index) => {
    const ext = report.fileName.split('.').pop()?.toLowerCase() ?? 'pdf'
    const status = statuses[index % statuses.length]
    const progress = status === 'analyzing' ? 45 + (index * 12) % 40 : progressMap[status]

    // 模拟上传时间：基于 generatedAt 向前推
    const base = new Date(dataset.meta.generatedAt)
    base.setHours(base.getHours() - (index + 1) * 12)

    return {
      id: report.id,
      title: report.title,
      fileName: report.fileName,
      fileType: ext === 'xlsx' ? 'xlsx' : ext === 'docx' ? 'docx' : 'pdf',
      uploadedAt: base.toISOString().slice(0, 16).replace('T', ' '),
      status,
      progress,
    }
  })
}

/* ── AI 分析流程数据 ── */

export interface AiFlowNode {
  id: number
  name: string
  subtitle: string
  status: 'completed' | 'in-progress'
  output: string
}

export const getAiFlowNodes = (dataset: DemoDataset): AiFlowNode[] => {
  const gaps = dataset.policyDisclosureAnalysis
  return [
    { id: 1, name: '报告语料', subtitle: '文件解析与分块', status: 'completed', output: `${dataset.reports.length} 份报告` },
    { id: 2, name: '议题识别', subtitle: 'ESG议题提取', status: 'completed', output: `识别 ${dataset.standards.esrs.length + dataset.standards.gri.length} 个议题` },
    { id: 3, name: '标准匹配', subtitle: 'ESRS/GRI匹配', status: 'completed', output: `匹配 ${gaps.length} 条条款` },
    { id: 4, name: '差距分析', subtitle: '差距识别与评估', status: 'completed', output: '生成差距分析结果' },
    { id: 5, name: '建议生成', subtitle: '披露建议生成', status: 'completed', output: `生成 ${gaps.filter((g) => g.recommendation).length} 条建议` },
    { id: 6, name: '人工复核', subtitle: '审核与确认', status: 'in-progress', output: `待复核 ${gaps.filter((g) => g.gapLevel !== 'none').length} 条建议` },
  ]
}

export const countBy = <T extends string>(items: T[]) =>
  items.reduce<Record<T, number>>(
    (result, item) => ({
      ...result,
      [item]: (result[item] ?? 0) + 1,
    }),
    {} as Record<T, number>,
  )

export const sortByPriority = (items: DisclosureGap[]) =>
  [...items].sort((left, right) => right.priority - left.priority)

export const getGapDistribution = (items: DisclosureGap[]) => {
  const values = countBy(items.map((item) => item.gapLevel))

  return [
    { name: gapLevelLabel.major, value: values.major ?? 0 },
    { name: gapLevelLabel.minor, value: values.minor ?? 0 },
    { name: gapLevelLabel.none, value: values.none ?? 0 },
  ]
}

export const getRequirementDistribution = (items: DisclosureGap[]) => {
  const mandatory = items.filter((item) => item.requirementType === 'mandatory')
  const voluntary = items.filter((item) => item.requirementType === 'voluntary')

  return [
    { name: '强制缺口', value: mandatory.filter((item) => item.gapLevel !== 'none').length },
    { name: '强制完整', value: mandatory.filter((item) => item.gapLevel === 'none').length },
    { name: '自愿缺口', value: voluntary.filter((item) => item.gapLevel !== 'none').length },
    { name: '自愿完整', value: voluntary.filter((item) => item.gapLevel === 'none').length },
  ]
}

export const getStandardProgress = (dataset: DemoDataset, standardType: StandardType) => {
  const clauses = standardType === 'ESRS' ? dataset.standards.esrs : dataset.standards.gri
  const related = dataset.policyDisclosureAnalysis.filter((item) => item.standardType === standardType)
  const disclosed = related.filter((item) => item.disclosureStatus === 'disclosed').length
  const partial = related.filter((item) => item.disclosureStatus === 'partial').length
  const missing = related.filter((item) => item.disclosureStatus === 'missing').length

  return {
    standardType,
    total: clauses.length,
    disclosed,
    partial,
    missing,
    completion: pct(disclosed + partial * 0.55, clauses.length),
  }
}

export const getTopics = (items: MaterialityBenchmarkItem[]) =>
  Array.from(new Map(items.map((item) => [item.topicId, item.topicName])).entries()).map(
    ([topicId, topicName]) => ({ topicId, topicName }),
  )

export const getBenchmarkMatrix = (items: MaterialityBenchmarkItem[], companies: Company[]) => {
  const topics = getTopics(items)

  return topics.map((topic) => ({
    ...topic,
    values: companies.map((company) => {
      const hit = items.find(
        (item) => item.topicId === topic.topicId && item.companyId === company.id,
      )

      return {
        companyId: company.id,
        companyName: company.name,
        color: company.color,
        score: hit?.score ?? 0,
        depth: hit?.disclosureDepth ?? 'missing',
        signal: hit?.signal ?? '无数据',
        evidence: hit?.evidence ?? '无数据',
      }
    }),
  }))
}

export const getCompanyRadarSeries = (items: MaterialityBenchmarkItem[], companies: Company[]) => {
  const topics = getTopics(items)

  return {
    indicators: topics.map((topic) => ({ name: topic.topicName, max: 100 })),
    series: companies.map((company) => ({
      name: company.shortName,
      value: topics.map((topic) => {
        const hit = items.find(
          (item) => item.companyId === company.id && item.topicId === topic.topicId,
        )
        return hit?.score ?? 0
      }),
      color: company.color,
    })),
  }
}

export const getEnvisionBenchmarkGaps = (items: MaterialityBenchmarkItem[]) => {
  const topics = getTopics(items)

  return topics
    .map((topic) => {
      const envision = items.find(
        (item) => item.companyId === 'envision' && item.topicId === topic.topicId,
      )
      const peers = items.filter(
        (item) => item.companyId !== 'envision' && item.topicId === topic.topicId,
      )
      const peerAverage = Math.round(
        peers.reduce((sum, item) => sum + item.score, 0) / Math.max(peers.length, 1),
      )

      return {
        ...topic,
        envisionScore: envision?.score ?? 0,
        peerAverage,
        gap: (envision?.score ?? 0) - peerAverage,
        signal: envision?.signal ?? '',
      }
    })
    .sort((left, right) => left.gap - right.gap)
}

export const getOpinionTrend = (items: PublicOpinionItem[]) => {
  const grouped = new Map<string, PublicOpinionItem[]>()

  items.forEach((item) => {
    const day = item.publishedAt.slice(5, 10)
    grouped.set(day, [...(grouped.get(day) ?? []), item])
  })

  return Array.from(grouped.entries())
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([day, values]) => ({
      day,
      high: values.filter((item) => item.riskLevel === 'high').length,
      medium: values.filter((item) => item.riskLevel === 'medium').length,
      low: values.filter((item) => item.riskLevel === 'low').length,
    }))
}

export const getOpinionTopicHotspots = (items: PublicOpinionItem[]) => {
  const grouped = new Map<string, { topicName: string; count: number; reach: number }>()

  items.forEach((item) => {
    const current = grouped.get(item.topicId) ?? {
      topicName: item.topicName,
      count: 0,
      reach: 0,
    }

    grouped.set(item.topicId, {
      topicName: item.topicName,
      count: current.count + 1,
      reach: current.reach + item.reach,
    })
  })

  return Array.from(grouped.values()).sort((left, right) => right.reach - left.reach)
}
