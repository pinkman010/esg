import { useMemo, useState } from 'react'
import type { DemoDataset, Dimension, DisclosureStatus, GapLevel, RequirementType, StandardType } from '../types/dataset'
import {
  DimensionBadge,
  DisclosureStatusBadge,
  GapBadge,
  RequirementBadge,
} from '../components/Badge'
import { EChart } from '../components/EChart'
import { Panel } from '../components/Panel'
import {
  dimensionLabel,
  getRequirementDistribution,
  getStandardProgress,
  requirementLabel,
  sortByPriority,
} from '../lib/analytics'

type FilterValue<T extends string> = 'all' | T

export function PolicyDisclosurePage({ dataset }: { dataset: DemoDataset }) {
  const [standard, setStandard] = useState<FilterValue<StandardType>>('all')
  const [dimension, setDimension] = useState<FilterValue<Dimension>>('all')
  const [requirement, setRequirement] = useState<FilterValue<RequirementType>>('all')
  const [status, setStatus] = useState<FilterValue<DisclosureStatus>>('all')
  const [gap, setGap] = useState<FilterValue<GapLevel>>('all')

  const filtered = useMemo(
    () =>
      sortByPriority(dataset.policyDisclosureAnalysis).filter((item) => {
        if (standard !== 'all' && item.standardType !== standard) return false
        if (dimension !== 'all' && item.dimension !== dimension) return false
        if (requirement !== 'all' && item.requirementType !== requirement) return false
        if (status !== 'all' && item.disclosureStatus !== status) return false
        if (gap !== 'all' && item.gapLevel !== gap) return false
        return true
      }),
    [dataset.policyDisclosureAnalysis, dimension, gap, requirement, standard, status],
  )

  const esrs = getStandardProgress(dataset, 'ESRS')
  const gri = getStandardProgress(dataset, 'GRI')

  return (
    <div className="space-y-5">
      <div className="grid gap-5 xl:grid-cols-[0.9fr,1.1fr]">
        <Panel title="标准覆盖概览">
          <div className="grid gap-3 sm:grid-cols-2">
            {[esrs, gri].map((item) => (
              <div key={item.standardType} className="rounded border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-950">{item.standardType}</p>
                  <p className="text-2xl font-semibold text-emerald-700">{item.completion}%</p>
                </div>
                <div className="mt-4 h-2 rounded bg-white">
                  <div className="h-2 rounded bg-emerald-500" style={{ width: `${item.completion}%` }} />
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs text-slate-500">
                  <span>已披露 {item.disclosed}</span>
                  <span>部分 {item.partial}</span>
                  <span>未披露 {item.missing}</span>
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="强制/自愿披露状态">
          <EChart
            className="h-56 w-full"
            option={{
              tooltip: { trigger: 'axis' },
              color: ['#ef4444', '#10b981', '#f59e0b', '#94a3b8'],
              grid: { left: 30, right: 16, top: 20, bottom: 30 },
              xAxis: {
                type: 'category',
                data: getRequirementDistribution(dataset.policyDisclosureAnalysis).map((item) => item.name),
                axisLabel: { interval: 0 },
              },
              yAxis: { type: 'value', minInterval: 1 },
              series: [
                {
                  type: 'bar',
                  barWidth: 28,
                  data: getRequirementDistribution(dataset.policyDisclosureAnalysis).map((item) => item.value),
                  itemStyle: { borderRadius: [4, 4, 0, 0] },
                },
              ],
            }}
          />
        </Panel>
      </div>

      <Panel title="筛选条件">
        <div className="grid gap-3 md:grid-cols-5">
          <Select label="标准" value={standard} onChange={setStandard} options={['all', 'ESRS', 'GRI']} />
          <Select label="维度" value={dimension} onChange={setDimension} options={['all', 'E', 'S', 'G']} format={(value) => (value === 'all' ? '全部维度' : dimensionLabel[value as Dimension])} />
          <Select label="披露属性" value={requirement} onChange={setRequirement} options={['all', 'mandatory', 'voluntary']} format={(value) => (value === 'all' ? '全部属性' : requirementLabel[value as RequirementType])} />
          <Select label="披露状态" value={status} onChange={setStatus} options={['all', 'disclosed', 'partial', 'missing']} format={(value) => ({ all: '全部状态', disclosed: '已披露', partial: '部分披露', missing: '未披露' }[value] ?? value)} />
          <Select label="差距等级" value={gap} onChange={setGap} options={['all', 'major', 'minor', 'none']} format={(value) => ({ all: '全部等级', major: '重大差距', minor: '轻微差距', none: '无差距' }[value] ?? value)} />
        </div>
      </Panel>

      <Panel title={`披露差距清单（${filtered.length}）`}>
        <div className="overflow-x-auto">
          <table className="min-w-[1100px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase text-slate-500">
                <th className="py-3 pr-4">条款</th>
                <th className="py-3 pr-4">议题</th>
                <th className="py-3 pr-4">属性</th>
                <th className="py-3 pr-4">状态</th>
                <th className="py-3 pr-4">差距</th>
                <th className="py-3 pr-4">证据与建议</th>
                <th className="py-3 text-right">优先级</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.id} className="border-b border-slate-100 align-top">
                  <td className="py-4 pr-4 font-semibold text-slate-950">{item.clauseId}</td>
                  <td className="py-4 pr-4">
                    <div className="flex flex-col gap-2">
                      <span className="font-medium text-slate-900">{item.topicName}</span>
                      <DimensionBadge value={item.dimension} />
                    </div>
                  </td>
                  <td className="py-4 pr-4">
                    <RequirementBadge value={item.requirementType} />
                  </td>
                  <td className="py-4 pr-4">
                    <DisclosureStatusBadge value={item.disclosureStatus} />
                  </td>
                  <td className="py-4 pr-4">
                    <GapBadge value={item.gapLevel} />
                  </td>
                  <td className="py-4 pr-4">
                    <p className="leading-6 text-slate-700">{item.currentDisclosure}</p>
                    <p className="mt-2 text-xs leading-5 text-slate-500">证据：{item.evidence}（{item.sourcePage}）</p>
                    <p className="mt-2 text-xs leading-5 text-emerald-700">建议：{item.recommendation}</p>
                  </td>
                  <td className="py-4 text-right text-lg font-semibold text-slate-950">{item.priority}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
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
