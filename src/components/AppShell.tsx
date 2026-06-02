import { useLayoutEffect } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  BarChart3,
  Bell,
  FileSearch,
  Gauge,
  Network,
  Search,
  ShieldCheck,
} from 'lucide-react'
import clsx from 'clsx'
import type { DemoDataset } from '../types/dataset'
import { BackToTop } from './BackToTop'

const navItems = [
  { to: '/', label: '首页总览', icon: Gauge },
  { to: '/policy', label: '政策与披露分析', icon: FileSearch },
  { to: '/benchmark', label: '实质性议题竞对', icon: BarChart3 },
  { to: '/claw', label: 'Claw 舆情监测', icon: Network },
]

const pageMeta: Record<string, { title: string; description: string }> = {
  '/': {
    title: '首页总览',
    description: 'ESG 披露、竞对议题与 Claw 舆情一体化展示',
  },
  '/policy': {
    title: '政策与 ESG 报告披露分析',
    description: '以远景能源 2024 年 ESG 报告为对象，对照 ESRS / GRI 条款识别强制披露缺口和补充建议。',
  },
  '/benchmark': {
    title: '实质性议题竞对分析',
    description: '固定范围：远景能源、西门子能源、VESTAS、明阳智能、金风科技。对比议题覆盖、披露深度和证据质量。',
  },
  '/claw': {
    title: 'Claw 舆情监测',
    description: '展示 Claw 工具抓取后的舆情结果，用于说明外部声量如何影响实质性议题判断。',
  },
}

function BrandWordmark({ compact = false }: { compact?: boolean }) {
  return (
    <div className={clsx('leading-none', compact ? 'py-1' : 'py-0.5')}>
      <div
        className={clsx(
          'font-semibold tracking-normal text-[#0d6672]',
          compact ? 'text-lg' : 'text-2xl',
        )}
      >
        远景能源
      </div>
      <div
        className={clsx(
          'mt-1 whitespace-nowrap font-semibold uppercase tracking-[0.05em] text-[#5b7b80]',
          compact ? 'text-[10px]' : 'text-sm',
        )}
      >
        ESG智能分析系统
      </div>
    </div>
  )
}

function SidebarDataSnapshot({ dataset }: { dataset: DemoDataset }) {
  const items = [
    { label: '分析对象', value: '远景能源' },
    { label: '报告周期', value: `${dataset.meta.reportYear}` },
    { label: '标准口径', value: 'ESRS / GRI' },
    { label: '条款覆盖', value: `${dataset.standards.esrs.length + dataset.standards.gri.length} 条` },
    { label: '竞对样本', value: `${dataset.companies.length} 家` },
    { label: '舆情样本', value: `Claw ${dataset.publicOpinion.length} 条` },
  ]

  return (
    <section className="rounded border border-emerald-100 bg-emerald-50/60 p-4">
      <div className="mb-3 flex items-center gap-2">
        <div className="h-4 w-1 rounded-full bg-emerald-500" />
        <h2 className="text-sm font-semibold text-slate-950">数据快照</h2>
      </div>
      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.label} className="flex items-center justify-between gap-2 text-xs">
            <span className="shrink-0 text-slate-500">{item.label}</span>
            <span className="whitespace-nowrap font-semibold text-slate-800">{item.value}</span>
          </div>
        ))}
      </div>
    </section>
  )
}

export function AppShell({
  dataset,
  children,
}: {
  dataset: DemoDataset
  children: React.ReactNode
}) {
  const location = useLocation()
  const currentMeta = pageMeta[location.pathname] ?? pageMeta['/']

  useLayoutEffect(() => {
    const previousScrollRestoration = window.history.scrollRestoration

    window.history.scrollRestoration = 'manual'

    return () => {
      window.history.scrollRestoration = previousScrollRestoration
    }
  }, [])

  useLayoutEffect(() => {
    const { style } = document.documentElement
    const previousScrollBehavior = style.scrollBehavior

    style.scrollBehavior = 'auto'
    window.scrollTo({ top: 0, left: 0 })
    const frameId = window.requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0 })
      style.scrollBehavior = previousScrollBehavior
    })

    return () => {
      window.cancelAnimationFrame(frameId)
      style.scrollBehavior = previousScrollBehavior
    }
  }, [location.pathname])

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[236px] border-r border-slate-200 bg-white lg:block">
        <div className="flex h-full flex-col">
          <div className="border-b border-slate-200 px-7 py-6">
            <BrandWordmark />
          </div>
          <nav className="flex-1 space-y-1 px-3 py-5">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    clsx(
                      'flex items-center gap-3 rounded px-3 py-3 text-sm font-medium transition',
                      isActive
                        ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950',
                    )
                  }
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </NavLink>
              )
            })}
          </nav>
          <div className="px-3 pb-5">
            <SidebarDataSnapshot dataset={dataset} />
          </div>
        </div>
      </aside>

      <div className="lg:pl-[236px]">
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur lg:px-7">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="lg:hidden">
                <BrandWordmark compact />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-slate-950 md:text-2xl">
                  {currentMeta.title}
                </h1>
                <p className="mt-1 text-sm text-slate-500">{currentMeta.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <label className="hidden min-w-[280px] items-center gap-2 rounded border border-slate-200 bg-white px-3 py-2 text-sm text-slate-500 transition focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-100 focus-within:shadow-md md:flex">
                <Search className="h-4 w-4" />
                <input
                  className="w-full bg-transparent outline-none"
                  placeholder="搜索报告、标准、议题、舆情..."
                />
              </label>
              <div className="rounded border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700">
                {dataset.meta.reportYear} 年报告周期
              </div>
              <button
                className="relative rounded border border-slate-200 bg-white p-2 text-slate-600 transition hover:bg-slate-50 hover:text-slate-800 hover:scale-95 active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50"
                type="button"
                aria-label="通知"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute right-0 top-0 inline-flex h-4 min-w-[16px] -translate-y-1/3 translate-x-1/3 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-semibold text-white">
                  3
                </span>
              </button>
            </div>
          </div>
          <nav className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-4 lg:hidden">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    clsx(
                      'flex items-center justify-center gap-2 rounded border px-2 py-2 text-xs font-semibold',
                      isActive
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                        : 'border-slate-200 bg-white text-slate-600',
                    )
                  }
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </NavLink>
              )
            })}
          </nav>
        </header>
        <main className="px-4 py-5 lg:px-7">
          <div key={location.pathname} className="animate-fade-in">
            {children}
          </div>
        </main>
        <BackToTop />
        <footer className="border-t border-slate-200 bg-white/80 px-4 py-3 text-xs text-slate-500 backdrop-blur lg:px-7">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span>数据截止：{new Date(dataset.meta.generatedAt).toLocaleString('zh-CN')}</span>
            <span className="flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              技术支持：ESG 智能分析团队
            </span>
          </div>
        </footer>
      </div>
    </div>
  )
}
