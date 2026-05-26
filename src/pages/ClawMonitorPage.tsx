import { useMemo, useState } from 'react'
import { AlertTriangle, FileText, Megaphone, ThumbsDown } from 'lucide-react'
import type { DemoDataset, RiskLevel, Sentiment } from '../types/dataset'
import { RiskBadge, SentimentBadge } from '../components/Badge'
import { EChart } from '../components/EChart'
import { Panel } from '../components/Panel'
import {
  formatNumber,
  getOpinionTopicHotspots,
  getOpinionTrend,
  riskLevelLabel,
  sentimentLabel,
} from '../lib/analytics'

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

  const trend = getOpinionTrend(filtered)
  const hotspots = getOpinionTopicHotspots(filtered).slice(0, 6)
  const averageReachIndex = Math.round(filtered.reduce((sum, item) => sum + item.reach, 0) / Math.max(filtered.length, 1))

  return (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-4">
        <Summary label="舆情条数" value={`${filtered.length}`} hint="当前筛选结果" icon={FileText} tone="blue" />
        <Summary label="平均声量指数" value={formatNumber(averageReachIndex)} hint="当前筛选舆情的平均关注强度" icon={Megaphone} tone="green" />
        <Summary label="高风险事件" value={`${filtered.filter((item) => item.riskLevel === 'high').length}`} hint="需进入披露关注" icon={AlertTriangle} tone="red" />
        <Summary label="负面舆情" value={`${filtered.filter((item) => item.sentiment === 'negative').length}`} hint="关联实质性议题" icon={ThumbsDown} tone="amber" />
      </div>

      <Panel title="声量指数说明">
        <div className="grid gap-3 lg:grid-cols-[1fr,1fr,1fr]">
          <div className="rounded border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-950">平均声量指数</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              表示当前筛选范围内单条舆情的平均关注强度，用来判断外部关注是否集中升温。
            </p>
          </div>
          <div className="rounded border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-950">单条指数来源</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              单条舆情指数由 Claw 综合媒体来源、转载引用、平台传播范围和事件热度估算，范围为 10-100。
            </p>
          </div>
          <div className="rounded border border-amber-100 bg-amber-50 p-4">
            <p className="text-sm font-semibold text-amber-900">使用限制</p>
            <p className="mt-2 text-sm leading-6 text-slate-700">
              声量指数是相对强度指标，不代表精确阅读人数或官方流量；筛选条件变化后，平均指数和热点议题会同步重算。
            </p>
          </div>
        </div>
      </Panel>

      <div className="grid gap-5 xl:grid-cols-[1.2fr,0.8fr]">
        <Panel
          title="风险趋势"
          action={
            <div className="grid gap-2 sm:grid-cols-3">
              <Select compact label="公司" value={company} onChange={setCompany} options={['all', ...dataset.companies.map((item) => item.id)]} format={(value) => value === 'all' ? '全部公司' : dataset.companies.find((item) => item.id === value)?.shortName ?? value} />
              <Select compact label="情绪" value={sentiment} onChange={setSentiment} options={['all', 'positive', 'neutral', 'negative']} format={(value) => value === 'all' ? '全部情绪' : sentimentLabel[value as Sentiment]} />
              <Select compact label="风险" value={risk} onChange={setRisk} options={['all', 'high', 'medium', 'low']} format={(value) => value === 'all' ? '全部风险' : riskLevelLabel[value as RiskLevel]} />
            </div>
          }
        >
          <EChart
            className="h-72 w-full"
            option={{
              tooltip: { trigger: 'axis' },
              color: ['#ef4444', '#f59e0b', '#10b981'],
              legend: { bottom: 0 },
              grid: { left: 28, right: 16, top: 20, bottom: 44 },
              xAxis: { type: 'category', data: trend.map((item) => item.day) },
              yAxis: { type: 'value', minInterval: 1 },
              series: [
                { name: '高风险', type: 'line', smooth: true, data: trend.map((item) => item.high) },
                { name: '中风险', type: 'line', smooth: true, data: trend.map((item) => item.medium) },
                { name: '低风险', type: 'line', smooth: true, data: trend.map((item) => item.low) },
              ],
            }}
          />
        </Panel>

        <Panel title="热点议题">
          <div className="space-y-3">
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
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50/80 p-8 text-center">
              <FileText className="h-8 w-8 text-slate-300" />
              <p className="mt-3 text-sm font-medium text-slate-500">当前条件下暂无舆情结果</p>
              <p className="mt-1 text-xs text-slate-400">请尝试调整上方筛选条件</p>
            </div>
          ) : filtered.map((item) => (
            <article key={item.id} className="rounded border border-slate-200 bg-white p-4 transition hover:border-slate-300 hover:shadow-sm">
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
      </Panel>
    </div>
  )
}

const summaryToneMap = {
  green: 'bg-gradient-to-br from-emerald-50 to-emerald-100 text-emerald-700',
  blue: 'bg-gradient-to-br from-sky-50 to-sky-100 text-sky-700',
  amber: 'bg-gradient-to-br from-amber-50 to-amber-100 text-amber-700',
  red: 'bg-gradient-to-br from-rose-50 to-rose-100 text-rose-700',
}

const summaryBorderMap = {
  green: 'border-emerald-200/60',
  blue: 'border-sky-200/60',
  amber: 'border-amber-200/60',
  red: 'border-rose-200/60',
}

function Summary({ label, value, hint, icon: Icon, tone }: { label: string; value: string; hint: string; icon: React.ElementType; tone: 'green' | 'blue' | 'amber' | 'red' }) {
  return (
    <section className={`panel border ${summaryBorderMap[tone]}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-semibold text-slate-950">{value}</p>
        </div>
        <span className={`rounded-lg p-2 ${summaryToneMap[tone]}`}>
          <Icon className="h-5 w-5" />
        </span>
      </div>
      <p className="mt-2 text-xs text-slate-500">{hint}</p>
    </section>
  )
}

function Select<T extends string>({
  label,
  value,
  options,
  onChange,
  format,
  compact = false,
}: {
  label: string
  value: T
  options: T[]
  onChange: (value: T) => void
  format?: (value: T) => string
  compact?: boolean
}) {
  return (
    <label className={compact ? 'block min-w-[130px]' : 'block min-w-[150px]'}>
      <span className={`${compact ? 'mb-1' : 'mb-2'} block text-xs font-semibold text-slate-500`}>{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as T)}
        className={`${compact ? 'py-1.5' : 'py-2'} w-full rounded border border-slate-200 bg-white px-3 text-sm outline-none focus:border-emerald-500`}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {format ? format(option) : option}
          </option>
        ))}
      </select>
    </label>
  )
}
