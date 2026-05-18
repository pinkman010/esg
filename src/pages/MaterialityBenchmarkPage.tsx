import { useMemo, useState } from 'react'
import type { DemoDataset, Dimension } from '../types/dataset'
import { DimensionBadge } from '../components/Badge'
import { EChart } from '../components/EChart'
import { Panel } from '../components/Panel'
import {
  dimensionLabel,
  getBenchmarkMatrix,
  getCompanyRadarSeries,
  getEnvisionBenchmarkGaps,
} from '../lib/analytics'

type DimensionFilter = 'all' | Dimension

const depthTone = {
  leading: 'bg-emerald-600 text-white',
  adequate: 'bg-sky-500 text-white',
  weak: 'bg-amber-500 text-white',
  missing: 'bg-slate-300 text-slate-700',
}

const depthLabel = {
  leading: '领先',
  adequate: '充分',
  weak: '偏弱',
  missing: '缺失',
}

export function MaterialityBenchmarkPage({ dataset }: { dataset: DemoDataset }) {
  const [dimension, setDimension] = useState<DimensionFilter>('all')
  const [selectedTopic, setSelectedTopic] = useState<string>('carbon_emission')

  const filteredItems = useMemo(
    () =>
      dataset.materialityBenchmark.filter((item) =>
        dimension === 'all' ? true : item.dimension === dimension,
      ),
    [dataset.materialityBenchmark, dimension],
  )

  const matrix = getBenchmarkMatrix(filteredItems, dataset.companies)
  const radar = getCompanyRadarSeries(filteredItems, dataset.companies)
  const gaps = getEnvisionBenchmarkGaps(filteredItems)
  const topicDetails = dataset.materialityBenchmark.filter((item) => item.topicId === selectedTopic)

  return (
    <div className="space-y-5">
      <div className="grid gap-5 xl:grid-cols-[1.1fr,0.9fr]">
        <Panel
          title="五家公司实质性议题雷达"
          action={
            <label className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500">ESG 维度</span>
              <select
                value={dimension}
                onChange={(event) => setDimension(event.target.value as DimensionFilter)}
                className="min-w-[128px] rounded border border-slate-200 bg-white px-3 py-1.5 text-sm outline-none focus:border-emerald-500"
              >
                <option value="all">全部维度</option>
                <option value="E">环境</option>
                <option value="S">社会</option>
                <option value="G">治理</option>
              </select>
            </label>
          }
        >
          <EChart
            className="h-[420px] w-full"
            option={{
              tooltip: {},
              color: dataset.companies.map((company) => company.color),
              legend: { bottom: 0, type: 'scroll' },
              radar: {
                radius: '62%',
                indicator: radar.indicators,
                splitLine: { lineStyle: { color: '#dbe3ea' } },
                axisName: { color: '#475569', fontSize: 12 },
              },
              series: [
                {
                  type: 'radar',
                  data: radar.series.map((series) => ({
                    value: series.value,
                    name: series.name,
                    areaStyle: { opacity: 0.08 },
                  })),
                },
              ],
            }}
          />
        </Panel>

        <Panel title="远景相对竞对差距">
          <div className="space-y-3">
            {gaps.slice(0, 7).map((item) => (
              <button
                key={item.topicId}
                type="button"
                onClick={() => setSelectedTopic(item.topicId)}
                className="w-full rounded border border-slate-200 bg-white p-3 text-left transition hover:border-emerald-300 hover:bg-emerald-50"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="font-semibold text-slate-950">{item.topicName}</span>
                  <span className={item.gap < 0 ? 'text-rose-600' : 'text-emerald-700'}>
                    {item.gap > 0 ? '+' : ''}
                    {item.gap}
                  </span>
                </div>
                <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                  <span>远景 {item.envisionScore}</span>
                  <span>竞对均值 {item.peerAverage}</span>
                </div>
                <p className="mt-2 text-xs leading-5 text-slate-500">{item.signal}</p>
              </button>
            ))}
          </div>
        </Panel>
      </div>

      <Panel title="议题覆盖热力图">
        <div className="overflow-x-auto">
          <table className="min-w-[980px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase text-slate-500">
                <th className="py-3 pr-4">议题</th>
                {dataset.companies.map((company) => (
                  <th key={company.id} className="py-3 pr-4">
                    {company.shortName}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {matrix.map((row) => (
                <tr key={row.topicId} className="border-b border-slate-100">
                  <td className="py-3 pr-4 font-semibold text-slate-950">
                    <button type="button" onClick={() => setSelectedTopic(row.topicId)} className="hover:text-emerald-700">
                      {row.topicName}
                    </button>
                  </td>
                  {row.values.map((value) => (
                    <td key={value.companyId} className="py-3 pr-4">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex w-14 justify-center rounded px-2 py-1 text-xs font-semibold ${depthTone[value.depth]}`}>
                          {value.score}
                        </span>
                        <span className="text-xs text-slate-500">{depthLabel[value.depth]}</span>
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <Panel title="选中议题证据详情">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          {topicDetails.map((item) => (
            <div key={item.id} className="rounded border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-semibold text-slate-950">{item.companyName}</h3>
                <DimensionBadge value={item.dimension} />
              </div>
              <p className="mt-3 text-3xl font-semibold text-slate-950">{item.score}</p>
              <p className="mt-2 text-xs font-semibold text-emerald-700">{depthLabel[item.disclosureDepth]}</p>
              <p className="mt-3 text-xs leading-5 text-slate-600">{item.evidence}</p>
              <p className="mt-3 text-xs leading-5 text-slate-500">判断：{item.signal}</p>
            </div>
          ))}
        </div>
      </Panel>

      <Panel title="维度说明">
        <div className="grid gap-3 md:grid-cols-3">
          {(['E', 'S', 'G'] as Dimension[]).map((item) => (
            <div key={item} className="rounded border border-slate-200 bg-slate-50 p-3">
              <DimensionBadge value={item} />
              <p className="mt-2 text-sm text-slate-600">
                {dimensionLabel[item]}维度用于汇总竞对报告中与新能源行业相关的实质性议题覆盖。
              </p>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  )
}
