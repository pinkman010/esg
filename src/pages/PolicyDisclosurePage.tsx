import { useEffect, useMemo, useState } from 'react'
import { FileSearch } from 'lucide-react'
import type { DemoDataset, Dimension, DisclosureGap, DisclosureStatus, GapLevel, RequirementType } from '../types/dataset'
import {
  DimensionBadge,
  DisclosureStatusBadge,
  GapBadge,
  RequirementBadge,
} from '../components/Badge'
import { EChart } from '../components/EChart'
import { Panel } from '../components/Panel'
import { useCountUp } from '../hooks/useCountUp'
import {
  dimensionLabel,
  formatNumber,
  getChineseDisclosureRecommendation,
  getChineseDisclosureTopic,
  getChineseEvidenceSummary,
  getFullStandardProgress,
  getRequirementDistribution,
  requirementLabel,
  sortByPriority,
} from '../lib/analytics'

type FilterValue<T extends string> = 'all' | T

const fullStandardSummary = {
  outputName: '远景能源_ESRS_GRI全量标准库披露差距分析.xlsx',
  rawRows: { esrs: 7222, gri: 795 },
  requirementRows: { total: 1448, esrs: 945, gri: 503 },
  reviewCount: 335,
  statusCounts: [
    { label: '已披露', value: 1113, tone: 'text-emerald-700' },
    { label: '部分披露', value: 254, tone: 'text-amber-700' },
    { label: '未披露', value: 1, tone: 'text-rose-700' },
    { label: '待人工确认', value: 80, tone: 'text-slate-700' },
  ],
  topGaps: [
    { standard: 'ESRS', clause: 'E3 IRO-1 8 b', topic: '水与海洋资源影响识别中，是否及如何与受影响社区开展磋商', status: '部分披露', gap: '轻微差距', priority: 84 },
    { standard: 'ESRS', clause: 'BP-1 5 a', topic: '可持续发展声明是否按合并或单体口径编制', status: '部分披露', gap: '轻微差距', priority: 82 },
    { standard: 'ESRS', clause: 'BP-1 5 c', topic: '可持续发展声明对上下游价值链的覆盖程度', status: '部分披露', gap: '轻微差距', priority: 82 },
    { standard: 'ESRS', clause: 'BP-1 5 e', topic: '是否使用特定敏感信息豁免及对应说明', status: '部分披露', gap: '轻微差距', priority: 82 },
    { standard: 'ESRS', clause: 'BP-2 6', topic: '特殊情形披露', status: '部分披露', gap: '轻微差距', priority: 82 },
    { standard: 'ESRS', clause: 'GOV-3 29 d', topic: '可变薪酬中与可持续目标挂钩的比例', status: '部分披露', gap: '轻微差距', priority: 82 },
    { standard: 'ESRS', clause: 'GOV-3 29 e', topic: '激励方案审批和更新层级', status: '部分披露', gap: '轻微差距', priority: 82 },
    { standard: 'ESRS', clause: 'GOV-5 36 b', topic: '风险评估方法和优先级排序方法', status: '部分披露', gap: '轻微差距', priority: 82 },
    { standard: 'ESRS', clause: 'IRO-1 53 b ii', topic: '自有运营及价值链影响识别覆盖', status: '部分披露', gap: '轻微差距', priority: 82 },
    { standard: 'ESRS', clause: 'IRO-1 53 c i', topic: '影响和依赖关系与风险机遇的连接', status: '部分披露', gap: '轻微差距', priority: 82 },
    { standard: 'ESRS', clause: 'IRO-1 53 c iii', topic: '可持续相关风险与其他风险的优先级关系', status: '部分披露', gap: '轻微差距', priority: 82 },
    { standard: 'ESRS', clause: 'MDR-P 65 c', topic: '政策落实的最高责任层级', status: '部分披露', gap: '轻微差距', priority: 82 },
    { standard: 'ESRS', clause: 'MDR-T 80 e', topic: '目标适用期间和阶段性里程碑', status: '部分披露', gap: '轻微差距', priority: 82 },
    { standard: 'ESRS', clause: 'MDR-T 81', topic: '目标跟踪相关补充披露', status: '部分披露', gap: '轻微差距', priority: 82 },
    { standard: 'ESRS', clause: 'SBM-2 45 a ii', topic: '利益相关方参与频次和对象类别', status: '部分披露', gap: '轻微差距', priority: 82 },
    { standard: 'ESRS', clause: 'SBM-2 45 a iv', topic: '利益相关方参与目的', status: '部分披露', gap: '轻微差距', priority: 82 },
    { standard: 'ESRS', clause: 'SBM-2 45 a v', topic: '利益相关方参与结果如何纳入决策', status: '部分披露', gap: '轻微差距', priority: 82 },
    { standard: 'ESRS', clause: 'SBM-3 46', topic: '重大影响、风险和机遇相关补充披露', status: '部分披露', gap: '轻微差距', priority: 82 },
    { standard: 'ESRS', clause: 'SBM-3 48 c iii', topic: '重大影响的预期时间范围', status: '部分披露', gap: '轻微差距', priority: 82 },
    { standard: 'ESRS', clause: 'E1 E1-1 16 g 1 d-g', topic: '与欧盟巴黎协定基准排除相关说明', status: '部分披露', gap: '轻微差距', priority: 80 },
  ],
}

export function PolicyDisclosurePage({ dataset }: { dataset: DemoDataset }) {
  const [dimension, setDimension] = useState<FilterValue<Dimension>>('all')
  const [requirement, setRequirement] = useState<FilterValue<RequirementType>>('all')
  const [status, setStatus] = useState<FilterValue<DisclosureStatus>>('all')
  const [gap, setGap] = useState<FilterValue<GapLevel>>('all')

  const filtered = useMemo(
    () =>
      sortByPriority(dataset.policyDisclosureAnalysis).filter((item) => {
        if (dimension !== 'all' && item.dimension !== dimension) return false
        if (requirement !== 'all' && item.requirementType !== requirement) return false
        if (status !== 'all' && item.disclosureStatus !== status) return false
        if (gap !== 'all' && item.gapLevel !== gap) return false
        return true
      }),
    [dataset.policyDisclosureAnalysis, dimension, gap, requirement, status],
  )
  const esrsFiltered = filtered.filter((item) => item.standardType === 'ESRS')
  const griFiltered = filtered.filter((item) => item.standardType === 'GRI')

  const standardProgress = getFullStandardProgress()
  const requirementDistribution = useMemo(
    () => getRequirementDistribution(dataset.policyDisclosureAnalysis),
    [dataset.policyDisclosureAnalysis],
  )

  return (
    <div className="space-y-5">
      <div className="grid gap-5 xl:grid-cols-[0.9fr,1.1fr]">
        <Panel title="标准覆盖概览">
          <div className="grid gap-3">
            {standardProgress.map((item) => (
              <div key={item.standardType} className="rounded border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-950">{item.standardType}</p>
                  <p className="text-2xl font-semibold text-emerald-700">{item.completion}%</p>
                </div>
                <AnimatedProgressBar target={item.completion} />
                <div className="mt-4 flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
                    已披露 {item.disclosed}
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="inline-block h-2 w-2 rounded-full bg-amber-400" />
                    部分 {item.partial}
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="inline-block h-2 w-2 rounded-full bg-slate-300" />
                    缺失 {item.missing}
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="inline-block h-2 w-2 rounded-full bg-slate-400" />
                    待确认 {item.pending}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="披露属性状态">
          <DisclosureAttributeChart requirementDistribution={requirementDistribution} />
        </Panel>
      </div>

      <Panel title="全量标准库分析摘要">
        <div className="space-y-4">
          <div className="grid gap-3 md:grid-cols-4">
            <SummaryStat label="ESRS 原始数据点" value={formatNumber(fullStandardSummary.rawRows.esrs)} />
            <SummaryStat label="GRI 原始数据点" value={formatNumber(fullStandardSummary.rawRows.gri)} />
            <SummaryStat label="聚合披露要求" value={formatNumber(fullStandardSummary.requirementRows.total)} />
            <SummaryStat label="待复核项目" value={formatNumber(fullStandardSummary.reviewCount)} />
          </div>

          <div className="rounded border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm leading-6 text-slate-700">
              全量分析以披露要求层为主，覆盖 ESRS {formatNumber(fullStandardSummary.requirementRows.esrs)} 条、GRI {formatNumber(fullStandardSummary.requirementRows.gri)} 条；原始数据点保留在 Excel 的追溯表中。全量结果已导出为 {fullStandardSummary.outputName}，前端仅展示摘要和高优先级项目。
            </p>
            <div className="mt-3 grid gap-2 sm:grid-cols-4">
              {fullStandardSummary.statusCounts.map((item) => (
                <div key={item.label} className="flex items-center justify-between rounded border border-slate-200 bg-white px-3 py-2 text-sm">
                  <span className="text-slate-500">{item.label}</span>
                  <span className={`font-semibold ${item.tone}`}>{formatNumber(item.value)}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-slate-950">高优先级缺口 Top 20</p>
              <p className="text-xs text-slate-500">规则初筛结果，需人工复核</p>
            </div>
            <TopGapTable items={fullStandardSummary.topGaps} />
          </div>
        </div>
      </Panel>

      <Panel title="筛选条件">
        <div className="grid gap-3 md:grid-cols-4">
          <Select label="维度" value={dimension} onChange={setDimension} options={['all', 'C', 'E', 'S', 'G']} format={(value) => (value === 'all' ? '全部维度' : dimensionLabel[value as Dimension])} />
          <Select label="披露属性" value={requirement} onChange={setRequirement} options={['all', 'mandatory', 'conditional', 'voluntary', 'pending']} format={(value) => (value === 'all' ? '全部属性' : requirementLabel[value as RequirementType])} />
          <Select label="披露状态" value={status} onChange={setStatus} options={['all', 'disclosed', 'partial', 'missing', 'pending']} format={(value) => ({ all: '全部状态', disclosed: '已披露', partial: '部分披露', missing: '未披露', pending: '待确认' }[value] ?? value)} />
          <Select label="差距等级" value={gap} onChange={setGap} options={['all', 'major', 'minor', 'pending', 'none']} format={(value) => ({ all: '全部等级', major: '重大差距', minor: '轻微差距', pending: '待人工确认', none: '无差距' }[value] ?? value)} />
        </div>
      </Panel>

      <Panel title={`ESRS 披露差距分析结果（${esrsFiltered.length}）`}>
        <DisclosureGapTable items={esrsFiltered} />
      </Panel>

      <Panel title={`GRI 披露差距分析结果（${griFiltered.length}）`}>
        <DisclosureGapTable items={griFiltered} />
      </Panel>
    </div>
  )
}

type RequirementDistributionItem = {
  name: string
  value: number
}

function DisclosureAttributeChart({
  requirementDistribution,
}: {
  requirementDistribution: RequirementDistributionItem[]
}) {
  const requirementValues = useMemo(
    () => requirementDistribution.map((item) => item.value),
    [requirementDistribution],
  )
  const animatedRequirementValues = useAnimatedBarValues(requirementValues, 760, 90)
  const requirementAxisMax = Math.ceil(Math.max(...requirementValues, 1) * 1.15)

  const barChartOption = useMemo(
    () => ({
      animation: false,
      tooltip: { trigger: 'axis' as const },
      color: ['#ef4444', '#10b981', '#f59e0b', '#22c55e', '#38bdf8', '#0f766e', '#94a3b8', '#64748b'],
      grid: { left: 36, right: 16, top: 20, bottom: 54 },
      xAxis: {
        type: 'category' as const,
        data: requirementDistribution.map((item) => item.name),
        axisLabel: { interval: 0, rotate: 18, fontSize: 11 },
      },
      yAxis: { type: 'value' as const, min: 0, max: requirementAxisMax, minInterval: 1 },
      series: [
        {
          type: 'bar' as const,
          barWidth: 22,
          data: animatedRequirementValues,
          itemStyle: { borderRadius: [4, 4, 0, 0] },
        },
      ],
    }),
    [animatedRequirementValues, requirementAxisMax, requirementDistribution],
  )

  return <EChart option={barChartOption} className="h-56 w-full" />
}

function easeOutCubic(progress: number) {
  return 1 - Math.pow(1 - progress, 3)
}

function useAnimatedBarValues(targets: number[], duration = 760, delayStep = 90) {
  const [values, setValues] = useState(() => targets.map(() => 0))
  const targetsKey = targets.join('|')

  useEffect(() => {
    let rafId: number
    const startTime = performance.now()
    const totalDuration = duration + Math.max(0, targets.length - 1) * delayStep

    setValues(targets.map(() => 0))

    const tick = (now: number) => {
      const elapsed = now - startTime
      setValues(
        targets.map((target, index) => {
          const progress = Math.min(Math.max((elapsed - index * delayStep) / duration, 0), 1)
          return Math.round(easeOutCubic(progress) * target)
        }),
      )

      if (elapsed < totalDuration) {
        rafId = requestAnimationFrame(tick)
      }
    }

    rafId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId)
  }, [delayStep, duration, targetsKey])

  return values
}

function AnimatedProgressBar({ target }: { target: number }) {
  const animated = useCountUp(target, 700)
  return (
    <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
      <div
        className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-none"
        style={{ width: `${animated}%` }}
      />
    </div>
  )
}

function SummaryStat({ label, value }: { label: string; value: string }) {
  const numericValue = parseInt(value.replace(/,/g, ''), 10) || 0
  const animatedValue = useCountUp(numericValue)
  const displayValue = Number.isNaN(numericValue) ? value : animatedValue.toLocaleString('zh-CN')

  return (
    <div className="rounded border border-slate-200 bg-white px-4 py-3">
      <p className="text-xs font-semibold text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-slate-950">{displayValue}</p>
    </div>
  )
}

function DisclosureGapTable({ items }: { items: DisclosureGap[] }) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50/80 p-8 text-center">
        <FileSearch className="h-8 w-8 text-slate-300" />
        <p className="mt-3 text-sm font-medium text-slate-500">当前条件下暂无对应披露差距结果</p>
        <p className="mt-1 text-xs text-slate-400">请尝试调整上方筛选条件</p>
      </div>
    )
  }

  return (
    <div className="max-h-[1011px] overflow-auto pr-2 [scrollbar-gutter:stable]">
      <table className="w-full min-w-[1100px] table-fixed text-left text-sm">
        <colgroup>
          <col className="w-[13%]" />
          <col className="w-[18%]" />
          <col className="w-[10%]" />
          <col className="w-[10%]" />
          <col className="w-[10%]" />
          <col className="w-[29%]" />
          <col className="w-[10%]" />
        </colgroup>
        <thead className="sticky top-0 z-10">
          <tr className="border-b border-slate-200 bg-slate-50/80 text-xs uppercase text-slate-500">
            <th className="py-3 pr-4 font-semibold">条款</th>
            <th className="py-3 pr-4 font-semibold">议题</th>
            <th className="py-3 pr-4 font-semibold">属性</th>
            <th className="py-3 pr-4 font-semibold">状态</th>
            <th className="py-3 pr-4 font-semibold">差距</th>
            <th className="py-3 pr-4 font-semibold">证据与建议</th>
            <th className="py-3 text-right font-semibold">优先级</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className="border-b border-slate-100 align-top transition-colors hover:bg-slate-50 even:bg-slate-50/30">
              <td className="py-3 pr-4 font-semibold text-slate-950">{item.clauseId}</td>
              <td className="py-3 pr-4">
                <div className="flex flex-col gap-2">
                  <span className="overflow-hidden font-medium leading-5 text-slate-900 [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]">{getChineseDisclosureTopic(item)}</span>
                  <DimensionBadge value={item.dimension} />
                </div>
              </td>
              <td className="py-3 pr-4">
                <RequirementBadge value={item.requirementType} />
              </td>
              <td className="py-3 pr-4">
                <DisclosureStatusBadge value={item.disclosureStatus} />
              </td>
              <td className="py-3 pr-4">
                <GapBadge value={item.gapLevel} />
              </td>
              <td className="py-3 pr-4">
                <p className="overflow-hidden leading-5 text-slate-700 [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]">{getChineseEvidenceSummary(item)}</p>
                <p className="mt-1 overflow-hidden text-xs leading-5 text-emerald-700 [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:1]">建议：{getChineseDisclosureRecommendation(item)}</p>
              </td>
              <td className="py-3 text-right text-lg font-semibold text-slate-950">{item.priority}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

const topGapStatusMap: Record<string, DisclosureStatus> = {
  '已披露': 'disclosed',
  '部分披露': 'partial',
  '未披露': 'missing',
}

const topGapLevelMap: Record<string, GapLevel> = {
  '重大差距': 'major',
  '轻微差距': 'minor',
  '无差距': 'none',
}

function TopGapTable({ items }: { items: typeof fullStandardSummary.topGaps }) {
  return (
    <div className="max-h-[440px] overflow-auto pr-2 [scrollbar-gutter:stable]">
      <table className="w-full min-w-[960px] table-fixed text-left text-sm">
        <colgroup>
          <col className="w-[7%]" />
          <col className="w-[8%]" />
          <col className="w-[16%]" />
          <col className="w-[38%]" />
          <col className="w-[11%]" />
          <col className="w-[11%]" />
          <col className="w-[9%]" />
        </colgroup>
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50/80 text-xs uppercase text-slate-500">
            <th className="whitespace-nowrap py-3 pr-4 font-semibold">排名</th>
            <th className="whitespace-nowrap py-3 pr-4 font-semibold">标准</th>
            <th className="whitespace-nowrap py-3 pr-4 font-semibold">条款</th>
            <th className="py-3 pr-4 font-semibold">重点缺口</th>
            <th className="whitespace-nowrap py-3 pr-4 font-semibold">状态</th>
            <th className="whitespace-nowrap py-3 pr-4 font-semibold">差距</th>
            <th className="whitespace-nowrap py-3 text-right font-semibold">优先级</th>
          </tr>
        </thead>
        <tbody>
          {items.slice(0, 10).map((item, index) => {
            const rank = index + 1
            const rankStyle =
              rank === 1
                ? 'border-l-4 border-l-rose-500'
                : rank === 2
                  ? 'border-l-4 border-l-amber-500'
                  : rank === 3
                    ? 'border-l-4 border-l-sky-500'
                    : ''
            const priorityColor = item.priority >= 82 ? 'text-rose-600' : 'text-amber-600'
            return (
              <tr
                key={`${item.standard}-${item.clause}`}
                className={`border-b border-slate-100 align-top transition-colors hover:bg-slate-50 even:bg-slate-50/30 ${rankStyle}`}
              >
                <td className="whitespace-nowrap py-4 pr-4">
                  <span
                    className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                      rank <= 3 ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {rank}
                  </span>
                </td>
                <td className="whitespace-nowrap py-4 pr-4 font-semibold text-slate-950">{item.standard}</td>
                <td className="whitespace-nowrap py-4 pr-4 text-slate-600">{item.clause}</td>
                <td className="py-4 pr-4 leading-6 text-slate-700">{item.topic}</td>
                <td className="whitespace-nowrap py-4 pr-4">
                  <DisclosureStatusBadge value={topGapStatusMap[item.status] ?? 'partial'} />
                </td>
                <td className="whitespace-nowrap py-4 pr-4">
                  <GapBadge value={topGapLevelMap[item.gap] ?? 'minor'} />
                </td>
                <td className={`whitespace-nowrap py-4 text-right text-lg font-semibold ${priorityColor}`}>{item.priority}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function Select<T extends string>({
  label,
  value,
  options,
  onChange,
  format,
}: {
  label: string
  value: T
  options: T[]
  onChange: (value: T) => void
  format?: (value: T) => string
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold text-slate-500">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as T)}
        className="w-full rounded border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {format ? format(option) : option === 'all' ? '全部' : option}
          </option>
        ))}
      </select>
    </label>
  )
}
