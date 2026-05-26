import { AlertTriangle, BarChart3, Database, FileWarning, Network, ShieldAlert } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { DemoDataset } from '../types/dataset'
import { EChart } from '../components/EChart'
import { MetricCard } from '../components/MetricCard'
import { Panel } from '../components/Panel'
import {
  formatNumber,
  generateSparkline,
  getFullStandardProgress,
  getGapDistribution,
  getOverviewMetrics,
  getOpinionTopicHotspots,
  sortByPriority,
} from '../lib/analytics'

export function OverviewPage({ dataset }: { dataset: DemoDataset }) {
  const metrics = getOverviewMetrics(dataset)
  const standardProgress = getFullStandardProgress()
  const hotspotTopics = getOpinionTopicHotspots(dataset.publicOpinion).slice(0, 5)
  const keyGaps = sortByPriority(dataset.policyDisclosureAnalysis)
    .filter((item) => item.gapLevel !== 'none')
    .slice(0, 4)

  const gapLevelBorder: Record<string, string> = {
    major: 'border-l-4 border-l-rose-500',
    minor: 'border-l-4 border-l-amber-400',
  }

  const gapLevelBg: Record<string, string> = {
    major: 'bg-rose-50/30',
    minor: 'bg-amber-50/30',
  }

  return (
    <div className="space-y-5">
      {/* Row 1: 统计卡 */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="披露缺口"
          value={`${metrics.totalGaps}`}
          hint={`重大差距 ${metrics.majorGaps} 项，优先进入披露补强清单`}
          icon={FileWarning}
          tone="red"
          sparkline={generateSparkline(metrics.totalGaps, 'up')}
          delta={{ value: 2, percent: 21.7, direction: 'up' }}
        />
        <MetricCard
          label="强制披露缺口"
          value={`${metrics.mandatoryGaps}`}
          hint="来自 ESRS 与 GRI 强制条款对照"
          icon={ShieldAlert}
          tone="amber"
          sparkline={generateSparkline(metrics.mandatoryGaps, 'up')}
          delta={{ value: 1, percent: 15.3, direction: 'up' }}
        />
        <MetricCard
          label="竞对议题均分"
          value={`${metrics.averageEnvisionScore}`}
          hint={`覆盖 ${metrics.benchmarkTopics} 个实质性议题`}
          icon={BarChart3}
          tone="green"
          sparkline={generateSparkline(metrics.averageEnvisionScore, 'up')}
          delta={{ value: 5, percent: 7.2, direction: 'up' }}
        />
        <MetricCard
          label="高风险舆情"
          value={`${metrics.highRiskOpinions}`}
          hint={`负面舆情 ${metrics.negativeOpinions} 条，已关联议题库`}
          icon={AlertTriangle}
          tone="blue"
          sparkline={generateSparkline(metrics.highRiskOpinions, 'down')}
          delta={{ value: 1, percent: 8.2, direction: 'down' }}
        />
      </div>

      {/* Row 2: 三模块汇报链路 + 标准匹配进度 */}
      <div className="grid gap-4 xl:grid-cols-[1fr,0.42fr]">
        <Panel title="三模块汇报链路">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {[
              {
                title: 'GPT 结构化数据',
                desc: '报告、标准、竞对、舆情统一进入 JSON 契约',
                icon: Database,
              },
              {
                title: '披露差距分析',
                desc: 'ESRS / GRI 条款与远景报告逐项对照',
                icon: FileWarning,
              },
              {
                title: '竞对议题分析',
                desc: '远景、西门子能源、VESTAS、明阳、金风横向比较',
                icon: BarChart3,
              },
              {
                title: 'Claw 舆情监测',
                desc: '外部声量指数反向验证议题重要性和风险热度',
                icon: Network,
              },
            ].map((item, index) => {
              const Icon = item.icon
              return (
                <div key={item.title} className="flex flex-col rounded-lg border border-slate-200/80 bg-gradient-to-b from-white to-slate-50/80 p-3 transition hover:shadow-md">
                  <div className="flex items-center justify-between">
                    <span className="rounded-lg bg-gradient-to-br from-emerald-50 to-emerald-100 p-2 text-emerald-700 ring-1 ring-emerald-100/60">
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-50 text-[10px] font-bold text-emerald-600 ring-1 ring-emerald-100">
                      0{index + 1}
                    </span>
                  </div>
                  <h3 className="mt-2 text-sm font-semibold text-slate-950">{item.title}</h3>
                  <p className="mt-1 text-xs leading-4 text-slate-500">{item.desc}</p>
                </div>
              )
            })}
          </div>
        </Panel>

        <Panel title="标准匹配进度" showInfo>
          <div className="space-y-5">
            {standardProgress.map((item) => (
              <div key={item.standardType}>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-slate-800">{item.standardType}</span>
                  <span className="text-sm font-bold text-emerald-600">{item.completion}%</span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400"
                    style={{ width: `${item.completion}%` }}
                  />
                </div>
                <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500">
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
      </div>

      {/* Row 3: 披露差距分布 + 优先披露补强项 */}
      <div className="grid gap-4 xl:grid-cols-[0.95fr,1.05fr]">
        <Panel title="披露差距分布" showInfo>
          <EChart
            className="h-[420px] w-full"
            option={{
              tooltip: { trigger: 'item' },
              color: ['#ef4444', '#f59e0b', '#10b981'],
              legend: { bottom: 0, itemWidth: 12, itemHeight: 12, textStyle: { fontSize: 14 } },
              series: [
                {
                  type: 'pie',
                  radius: ['44%', '70%'],
                  center: ['50%', '46%'],
                  data: getGapDistribution(dataset.policyDisclosureAnalysis),
                  label: { formatter: '{b}\n{c}项', fontSize: 14, lineHeight: 16, overflow: 'break', width: 84 },
                  labelLine: { length: 8, length2: 6 },
                },
              ],
            }}
          />
        </Panel>

        <Panel
          title="优先披露补强项"
          action={
            <Link to="/policy" className="text-sm font-semibold text-emerald-700 hover:text-emerald-800">
              查看全部 →
            </Link>
          }
        >
          <div className="space-y-3">
            {keyGaps.map((item) => (
              <div
                key={item.id}
                className={`rounded-lg border border-slate-200 p-3 ${gapLevelBorder[item.gapLevel] || ''} ${gapLevelBg[item.gapLevel] || 'bg-white'}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-950">
                      {item.clauseId} · {item.topicName}
                    </p>
                    <p className="mt-1 text-sm leading-6 text-slate-500">{item.recommendation}</p>
                  </div>
                  <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-rose-100 text-base font-bold text-rose-700">{item.priority}</span>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      {/* Row 4: Claw 议题热度 */}
      <Panel title="Claw 议题热度">
        <div className="grid gap-3 md:grid-cols-5">
          {hotspotTopics.map((item) => (
            <div
              key={item.topicName}
              className="group rounded-lg border border-slate-200/80 bg-white p-3 transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <p className="text-sm font-semibold text-slate-950">{item.topicName}</p>
              <p className="mt-2 text-2xl font-bold tracking-tight text-slate-950">{formatNumber(item.reach)}</p>
              <p className="mt-1 text-xs text-slate-500">平均指数 · {item.count} 条</p>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  )
}
