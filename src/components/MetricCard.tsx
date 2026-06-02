import { useMemo } from 'react'
import { useCountUp } from '../hooks/useCountUp'
import type { LucideIcon } from 'lucide-react'
import clsx from 'clsx'

interface MetricCardProps {
  label: string
  value: string
  hint: string
  icon: LucideIcon
  tone: 'green' | 'blue' | 'amber' | 'red'
  sparkline?: number[]
  delta?: { value: number; percent: number; direction: 'up' | 'down' }
  animate?: boolean
}

const toneStyles = {
  green: {
    card: 'border-emerald-200/70 bg-[radial-gradient(circle_at_84%_16%,rgba(16,185,129,0.16),transparent_34%),linear-gradient(135deg,rgba(255,255,255,0.98),rgba(236,253,245,0.9))]',
    accent: 'bg-emerald-500',
    icon: 'bg-white/72 text-emerald-700 ring-emerald-100',
    ghost: 'text-emerald-500/10',
    spark: '#059669',
  },
  blue: {
    card: 'border-sky-200/70 bg-[radial-gradient(circle_at_84%_16%,rgba(14,165,233,0.15),transparent_34%),linear-gradient(135deg,rgba(255,255,255,0.98),rgba(240,249,255,0.9))]',
    accent: 'bg-sky-500',
    icon: 'bg-white/72 text-sky-700 ring-sky-100',
    ghost: 'text-sky-500/10',
    spark: '#0284c7',
  },
  amber: {
    card: 'border-amber-200/70 bg-[radial-gradient(circle_at_84%_16%,rgba(245,158,11,0.14),transparent_34%),linear-gradient(135deg,rgba(255,255,255,0.98),rgba(255,251,235,0.9))]',
    accent: 'bg-amber-500',
    icon: 'bg-white/72 text-amber-700 ring-amber-100',
    ghost: 'text-amber-500/10',
    spark: '#d97706',
  },
  red: {
    card: 'border-rose-200/70 bg-[radial-gradient(circle_at_84%_16%,rgba(244,63,94,0.12),transparent_34%),linear-gradient(135deg,rgba(255,255,255,0.98),rgba(255,241,242,0.9))]',
    accent: 'bg-rose-500',
    icon: 'bg-white/72 text-rose-700 ring-rose-100',
    ghost: 'text-rose-500/10',
    spark: '#e11d48',
  },
}

function Sparkline({ data, tone }: { data: number[]; tone: MetricCardProps['tone'] }) {
  const color = toneStyles[tone].spark
  const points = useMemo(() => {
    const safeData = data.length > 0 ? data : [0]
    const min = Math.min(...safeData)
    const max = Math.max(...safeData)
    const range = max - min || 1
    const width = 88
    const height = 32
    const steps = Math.max(safeData.length - 1, 1)

    return safeData
      .map((v, i) => {
        const x = (i / steps) * width
        const y = height - ((v - min) / range) * height
        return `${x},${y}`
      })
      .join(' ')
  }, [data])
  const areaPoints = `0,32 ${points} 88,32`

  return (
    <svg width={88} height={32} viewBox="0 0 88 32" className="overflow-visible opacity-90">
      <polygon points={areaPoints} fill={color} opacity="0.08" />
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth={5}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.10"
      />
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function MetricCard({ label, value, hint, icon: Icon, tone, sparkline, delta, animate = true }: MetricCardProps) {
  const numericValue = parseInt(value.replace(/,/g, ''), 10) || 0
  const animatedValue = useCountUp(numericValue, 600, animate)
  const displayValue = Number.isNaN(numericValue) ? value : animatedValue.toLocaleString('zh-CN')
  const styles = toneStyles[tone]

  return (
    <section
      className={clsx(
        'panel group relative min-h-[118px] overflow-hidden border p-4 transition duration-200 hover:-translate-y-0.5 hover:shadow-md',
        styles.card,
      )}
    >
      <div className={clsx('absolute inset-x-0 top-0 h-1', styles.accent)} />
      <Icon className={clsx('pointer-events-none absolute -right-4 -top-5 h-24 w-24 transition group-hover:scale-105', styles.ghost)} />
      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-4xl font-semibold tracking-tight text-slate-950">{displayValue}</p>
          {delta ? (
            <div className="mt-1.5 flex items-center gap-1 text-xs">
              <span className={delta.direction === 'up' ? 'font-semibold text-emerald-600' : 'font-semibold text-rose-500'}>
                {delta.direction === 'up' ? '↑' : '↓'} {Math.abs(delta.value)}
              </span>
              <span className="font-medium text-slate-500">{delta.percent}%</span>
            </div>
          ) : null}
        </div>
        <div className="flex shrink-0 flex-col items-end gap-3">
          <span className={clsx('rounded-lg p-2 shadow-sm ring-1 backdrop-blur', styles.icon)}>
            <Icon className="h-5 w-5" />
          </span>
          {sparkline ? <Sparkline data={sparkline} tone={tone} /> : null}
        </div>
      </div>
      {hint ? <p className="relative mt-2 text-xs leading-5 text-slate-500">{hint}</p> : null}
    </section>
  )
}
