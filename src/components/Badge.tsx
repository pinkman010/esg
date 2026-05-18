import clsx from 'clsx'
import type {
  Dimension,
  DisclosureStatus,
  GapLevel,
  RequirementType,
  RiskLevel,
  Sentiment,
} from '../types/dataset'
import {
  dimensionLabel,
  gapLevelLabel,
  requirementLabel,
  riskLevelLabel,
  sentimentLabel,
} from '../lib/analytics'

const toneMap = {
  green: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  amber: 'bg-amber-50 text-amber-700 ring-amber-200',
  red: 'bg-rose-50 text-rose-700 ring-rose-200',
  blue: 'bg-sky-50 text-sky-700 ring-sky-200',
  slate: 'bg-slate-100 text-slate-700 ring-slate-200',
}

export function Badge({
  children,
  tone = 'slate',
}: {
  children: React.ReactNode
  tone?: keyof typeof toneMap
}) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded px-2 py-1 text-xs font-semibold ring-1',
        toneMap[tone],
      )}
    >
      {children}
    </span>
  )
}

export function DimensionBadge({ value }: { value: Dimension }) {
  return <Badge tone={value === 'E' ? 'green' : value === 'S' ? 'blue' : 'amber'}>{dimensionLabel[value]}</Badge>
}

export function RequirementBadge({ value }: { value: RequirementType }) {
  return <Badge tone={value === 'mandatory' ? 'red' : 'slate'}>{requirementLabel[value]}</Badge>
}

export function GapBadge({ value }: { value: GapLevel }) {
  return (
    <Badge tone={value === 'major' ? 'red' : value === 'minor' ? 'amber' : 'green'}>
      {gapLevelLabel[value]}
    </Badge>
  )
}

export function DisclosureStatusBadge({ value }: { value: DisclosureStatus }) {
  const label = value === 'disclosed' ? '已披露' : value === 'partial' ? '部分披露' : '未披露'
  return <Badge tone={value === 'disclosed' ? 'green' : value === 'partial' ? 'amber' : 'red'}>{label}</Badge>
}

export function RiskBadge({ value }: { value: RiskLevel }) {
  return (
    <Badge tone={value === 'high' ? 'red' : value === 'medium' ? 'amber' : 'green'}>
      {riskLevelLabel[value]}
    </Badge>
  )
}

export function SentimentBadge({ value }: { value: Sentiment }) {
  return (
    <Badge tone={value === 'positive' ? 'green' : value === 'negative' ? 'red' : 'blue'}>
      {sentimentLabel[value]}
    </Badge>
  )
}
