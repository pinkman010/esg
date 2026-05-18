import { Info } from 'lucide-react'

export function Panel({
  title,
  action,
  children,
  className = '',
  showInfo = false,
}: {
  title?: string
  action?: React.ReactNode
  children: React.ReactNode
  className?: string
  showInfo?: boolean
}) {
  return (
    <section className={`panel ${className}`}>
      {title ? (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="h-4 w-1 rounded-full bg-emerald-500" />
            <h2 className="text-base font-semibold text-slate-950">{title}</h2>
            {showInfo ? (
              <Info className="h-4 w-4 text-slate-400" />
            ) : null}
          </div>
          {action}
        </div>
      ) : null}
      {children}
    </section>
  )
}
