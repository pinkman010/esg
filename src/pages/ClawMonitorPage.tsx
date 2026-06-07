import { useMemo, useState } from 'react'
import { AlertTriangle, FileText, Megaphone, ThumbsDown } from 'lucide-react'
import type { DemoDataset, PublicOpinionItem, RiskLevel, Sentiment } from '../types/dataset'
import { RiskBadge, SentimentBadge } from '../components/Badge'
import { EChart } from '../components/EChart'
import { EmptyState } from '../components/EmptyState'
import { MetricCard } from '../components/MetricCard'
import { Panel } from '../components/Panel'
import { Select } from '../components/Select'
import {
  formatNumber,
  getOpinionTopicHotspots,
  getOpinionTrend,
  riskLevelLabel,
  sentimentLabel,
} from '../lib/analytics'
import {
  chartCategoryAxis,
  chartGrid,
  chartLegend,
  chartPalette,
  chartTooltip,
  chartValueAxis,
} from '../lib/chartTheme'

type Filter<T extends string> = 'all' | T

export function ClawMonitorPage({ dataset }: { dataset: DemoDataset }) {
  const [company, setCompany] = useState('all')
  const [sentiment, setSentiment] = useState<Filter<Sentiment>>('all')
  const [risk, setRisk] = useState<Filter<RiskLevel>>('all')

  const filtered = useMemo(
    () =>
      dataset.publicOpinion
        .filter((item) => {
          if (company !== 'all' && item.companyId !== company) return false
          if (sentiment !== 'all' && item.sentiment !== sentiment) return false
          if (risk !== 'all' && item.riskLevel !== risk) return false
          return true
        })
        .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()),
    [company, dataset.publicOpinion, risk, sentiment],
  )

  const trend = useMemo(() => getOpinionTrend(filtered), [filtered])
  const hotspots = useMemo(() => getOpinionTopicHotspots(filtered).slice(0, 6), [filtered])
  const averageReachIndex = useMemo(
    () => Math.round(filtered.reduce((sum, item) => sum + item.reach, 0) / Math.max(filtered.length, 1)),
    [filtered],
  )
  const highRiskCount = useMemo(
    () => filtered.filter((item) => item.riskLevel === 'high').length,
    [filtered],
  )
  const negativeCount = useMemo(
    () => filtered.filter((item) => item.sentiment === 'negative').length,
    [filtered],
  )
  const opinionCountSparkline = useMemo(
    () => trend.map((item) => item.high + item.medium + item.low),
    [trend],
  )
  const reachSparkline = useMemo(
    () =>
      getOpinionDailySparkline(filtered, (items) =>
        Math.round(items.reduce((sum, item) => sum + item.reach, 0) / Math.max(items.length, 1)),
      ),
    [filtered],
  )
  const highRiskSparkline = useMemo(() => trend.map((item) => item.high), [trend])
  const negativeSparkline = useMemo(
    () => getOpinionDailySparkline(filtered, (items) => items.filter((item) => item.sentiment === 'negative').length),
    [filtered],
  )

  return (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="舆情条数"
          value={`${filtered.length}`}
          hint="当前筛选结果"
          icon={FileText}
          tone="blue"
          sparkline={opinionCountSparkline}
        />
        <MetricCard
          label="平均声量指数"
          value={formatNumber(averageReachIndex)}
          hint="当前筛选舆情的平均关注强度"
          icon={Megaphone}
          tone="green"
          sparkline={reachSparkline}
        />
        <MetricCard
          label="高风险事件"
          value={`${highRiskCount}`}
          hint="需进入披露关注"
          icon={AlertTriangle}
          tone="red"
          sparkline={highRiskSparkline}
        />
        <MetricCard
          label="负面舆情"
          value={`${negativeCount}`}
          hint="关联实质性议题"
          icon={ThumbsDown}
          tone="amber"
          sparkline={negativeSparkline}
        />
      </div>

      <div className="grid items-stretch gap-5 xl:grid-cols-2">
        <Panel
          title="风险趋势"
          className="flex h-full flex-col"
          contentClassName="flex flex-1"
          action={
            <div className="grid gap-2 sm:grid-cols-3">
              <Select compact label="公司" value={company} onChange={setCompany} options={['all', ...dataset.companies.map((item) => item.id)]} format={(value) => value === 'all' ? '全部公司' : dataset.companies.find((item) => item.id === value)?.shortName ?? value} />
              <Select compact label="情绪" value={sentiment} onChange={setSentiment} options={['all', 'positive', 'neutral', 'negative']} format={(value) => value === 'all' ? '全部情绪' : sentimentLabel[value as Sentiment]} />
              <Select compact label="风险" value={risk} onChange={setRisk} options={['all', 'high', 'medium', 'low']} format={(value) => value === 'all' ? '全部风险' : riskLevelLabel[value as RiskLevel]} />
            </div>
          }
        >
          <EChart
            className="min-h-[288px] w-full flex-1"
            option={{
              tooltip: { ...chartTooltip, trigger: 'axis' },
              color: chartPalette.riskLine,
              legend: chartLegend,
              grid: { ...chartGrid, left: 30, bottom: 44 },
              xAxis: { ...chartCategoryAxis, type: 'category', data: trend.map((item) => item.day) },
              yAxis: { ...chartValueAxis, type: 'value', minInterval: 1 },
              series: [
                { name: '高风险', type: 'line', smooth: true, symbolSize: 5, lineStyle: { width: 2 }, data: trend.map((item) => item.high) },
                { name: '中风险', type: 'line', smooth: true, symbolSize: 5, lineStyle: { width: 2 }, data: trend.map((item) => item.medium) },
                { name: '低风险', type: 'line', smooth: true, symbolSize: 5, lineStyle: { width: 2 }, data: trend.map((item) => item.low) },
              ],
            }}
          />
        </Panel>

        <Panel title="热点议题" className="flex h-full flex-col" contentClassName="flex flex-1 flex-col">
          <div className="flex flex-1 flex-col justify-between gap-3">
            {hotspots.map((item) => (
              <div key={item.topicName}>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-800">{item.topicName}</span>
                  <span className="text-slate-500">{formatNumber(item.reach)}</span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-sky-500"
                    style={{ width: `${Math.min(100, Math.round((item.reach / Math.max(hotspots[0]?.reach ?? 1, 1)) * 100))}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <Panel title="Claw 舆情结果列表">
        {filtered.length === 0 ? (
          <EmptyState
            title="当前条件下暂无舆情结果"
            description="请尝试调整上方筛选条件"
            onReset={() => { setCompany('all'); setSentiment('all'); setRisk('all') }}
            resetLabel="重置筛选条件"
            variant="filter"
          />
        ) : (
          <div className="max-h-[1624px] overflow-y-auto overscroll-contain pr-2 [scrollbar-gutter:stable]">
            <div className="space-y-3">
              {filtered.map((item) => (
                <article key={item.id} className="subpanel p-4 transition hover:border-slate-300 hover:bg-slate-100/70">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-slate-950">{item.title}</h3>
                      <p className="mt-1 text-xs text-slate-500">
                        {item.companyName} · {item.source} · {item.publishedAt.slice(0, 16).replace('T', ' ')}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <SentimentBadge value={item.sentiment} />
                      <RiskBadge value={item.riskLevel} />
                    </div>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{item.summary}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                    <span>关联议题：{item.topicName}</span>
                    <span>声量指数：{formatNumber(item.reach)}</span>
                    <span>任务：{item.clawTaskId}</span>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}
      </Panel>

      <Panel title="声量指数说明">
        <div className="grid gap-3 lg:grid-cols-[1fr,1fr,1fr]">
          <div className="subpanel-muted p-4">
            <p className="text-sm font-semibold text-slate-950">平均声量指数</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              表示当前筛选范围内单条舆情的平均关注强度，用来判断外部关注是否集中升温。
            </p>
          </div>
          <div className="subpanel-muted p-4">
            <p className="text-sm font-semibold text-slate-950">单条指数来源</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              单条舆情指数由 Claw 综合媒体来源、转载引用、平台传播范围和事件热度估算，范围为 10-100。
            </p>
          </div>
          <div className="subpanel p-4 border-amber-100 bg-amber-50/70">
            <p className="text-sm font-semibold text-amber-900">使用限制</p>
            <p className="mt-2 text-sm leading-6 text-slate-700">
              声量指数是相对强度指标，不代表精确阅读人数或官方流量；筛选条件变化后，平均指数和热点议题会同步重算。
            </p>
          </div>
        </div>
      </Panel>
    </div>
  )
}

function getOpinionDailySparkline(
  items: PublicOpinionItem[],
  getValue: (items: PublicOpinionItem[]) => number,
) {
  const grouped = new Map<string, PublicOpinionItem[]>()

  items.forEach((item) => {
    const day = item.publishedAt.slice(5, 10)
    grouped.set(day, [...(grouped.get(day) ?? []), item])
  })

  return Array.from(grouped.entries())
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([, values]) => getValue(values))
}
