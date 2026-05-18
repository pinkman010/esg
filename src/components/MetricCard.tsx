import type { LucideIcon } from 'lucide-react'

interface MetricCardProps {
  label: string
  value: string
  hint: string
  icon: LucideIcon
  tone: 'green' | 'blue' | 'amber' | 'red'
  sparkline?: number[]
  delta?: { value: number; percent: number; direction: 'up' | 'down' }
}

const toneMap = {
  green: 'bg-gradient-to-br from-emerald-50 to-emerald-100 text-emerald-700',
  blue: 'bg-gradient-to-br from-sky-50 to-sky-100 text-sky-700',
  amber: 'bg-gradient-to-br from-amber-50 to-amber-100 text-amber-700',
  red: 'bg-gradient-to-br from-rose-50 to-rose-100 text-rose-700',
}

const toneBorder = {
  green: 'border-emerald-200/60',
  blue: 'border-sky-200/60',
  amber: 'border-amber-200/60',
  red: 'border-rose-200/60',
}

function Sparkline({ data, tone }: { data: number[]; tone: MetricCardProps['tone'] }) {
  const colorMap = {
    green: '#10b981',
    blue: '#0ea5e9',
    amber: '#f59e0b',
    red: '#ef4444',
  }
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const width = 64
  const height = 24
  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * width
      const y = height - ((v - min) / range) * height
      return `${x},${y}`
    })
    .join(' ')

  return (
    <svg width={width} height={height} className="opacity-70">
      <polyline
        points={points}
        fill="none"
        stroke={colorMap[tone]}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function MetricCard({ label, value, hint, icon: Icon, tone, sparkline, delta }: MetricCardProps) {
  return (
    <section className={`panel min-h-[118px] border ${toneBorder[tone]}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <p className="text-sm text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">{value}</p>
          {delta ? (
            <div className="mt-1.5 flex items-center gap-1 text-xs">
              <span className={delta.direction === 'up' ? 'text-emerald-600' : 'text-rose-500'}>
                {delta.direction === 'up' ? '↑' : '↓'} {Math.abs(delta.value)}
              </span>
              <span className="text-slate-400">{delta.percent}%</span>
            </div>
          ) : null}
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className={`rounded-lg p-2 ${toneMap[tone]}`}>
            <Icon className="h-5 w-5" />
          </span>
          {sparkline ? <Sparkline data={sparkline} tone={tone} /> : null}
        </div>
      </div>
      <p className="mt-2 text-xs leading-5 text-slate-500">{hint}</p>
    </section>
  )
}
