import { useLayoutEffect, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  BarChart3,
  Bell,
  FileSearch,
  Gauge,
  Network,
  Search,
  ShieldCheck,
  X,
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

const pageMeta: Record<
  string,
  {
    title: string
    description: string
    visual: string
    visualFillPosition: string
    visualFocusPosition: string
    visualFocusFit: string
    visualFocusScale: string
    visualFocusShift: string
  }
> = {
  '/': {
    title: '首页总览',
    description: 'ESG 披露、竞对议题与 Claw 舆情一体化展示',
    visual: '/visuals/overview-dashboard-hero.webp',
    visualFillPosition: 'object-[58%_50%]',
    visualFocusPosition: 'object-[58%_50%]',
    visualFocusFit: 'object-cover',
    visualFocusScale: 'scale-100',
    visualFocusShift: 'translate-x-0 translate-y-0',
  },
  '/policy': {
    title: '政策与 ESG 报告披露分析',
    description: '以远景能源 2024 年 ESG 报告为对象，对照 ESRS / GRI 条款识别强制披露缺口和补充建议。',
    visual: '/visuals/module-policy-disclosure.webp',
    visualFillPosition: 'object-[28%_50%]',
    visualFocusPosition: 'object-[28%_50%]',
    visualFocusFit: 'object-cover',
    visualFocusScale: 'scale-125',
    visualFocusShift: 'translate-x-10 translate-y-0',
  },
  '/benchmark': {
    title: '实质性议题竞对分析',
    description: '固定范围：远景能源、西门子能源、VESTAS、明阳智能、金风科技。对比议题覆盖、披露深度和证据质量。',
    visual: '/visuals/module-materiality-benchmark.webp',
    visualFillPosition: 'object-[64%_48%]',
    visualFocusPosition: 'object-[64%_48%]',
    visualFocusFit: 'object-cover',
    visualFocusScale: 'scale-125',
    visualFocusShift: 'translate-x-0 translate-y-0',
  },
  '/claw': {
    title: 'Claw 舆情监测',
    description: '展示 Claw 工具抓取后的舆情结果，用于说明外部声量如何影响实质性议题判断。',
    visual: '/visuals/module-claw-monitor.webp',
    visualFillPosition: 'object-[34%_56%]',
    visualFocusPosition: 'object-[34%_56%]',
    visualFocusFit: 'object-cover',
    visualFocusScale: 'scale-125',
    visualFocusShift: 'translate-x-0 translate-y-0',
  },
}

function BrandWordmark({ compact = false }: { compact?: boolean }) {
  return (
    <div className={clsx('flex flex-col items-center', compact ? 'gap-1 py-1' : 'gap-1.5 py-0.5')}> 
      <img
        src="/brand/envision-wordmark.png"
        alt="Envision"
        className={clsx(
          'w-auto shrink-0 object-contain drop-shadow-sm',
          compact ? 'h-6' : 'h-7',
        )}
      />
      <div
        className={clsx(
          'whitespace-nowrap font-semibold tracking-[0.04em] text-[#0d6672]',
          compact ? 'text-[10px]' : 'text-lg md:text-xl',
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
    <section className="rounded border border-white/75 bg-white/72 p-4 shadow-sm backdrop-blur-md">
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
  const [searchOpen, setSearchOpen] = useState(false)

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
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[236px] overflow-hidden border-r border-white/70 bg-white lg:block">
        <img
          src="/visuals/sidebar-renewable-energy.webp"
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 h-full w-full object-cover object-[88%_58%] opacity-[0.48] brightness-95 saturate-125 contrast-125"
        />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.66)_0%,rgba(255,255,255,0.50)_28%,rgba(255,255,255,0.34)_58%,rgba(236,253,245,0.24)_100%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_76%_10%,rgba(20,184,166,0.12),transparent_38%),radial-gradient(circle_at_25%_86%,rgba(16,185,129,0.12),transparent_34%)]" />
        <div className="relative flex h-full flex-col">
          <div className="border-b border-white/70 bg-white/52 px-5 py-5 backdrop-blur-md">
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
                      'flex items-center gap-3 rounded border px-3 py-3 text-sm shadow-sm backdrop-blur-md transition',
                      isActive
                        ? 'border-emerald-200/80 bg-white/78 font-semibold text-emerald-700 ring-1 ring-emerald-100/80'
                        : 'border-white/45 bg-white/38 font-medium text-slate-600 hover:border-white/80 hover:bg-white/68 hover:text-slate-950 hover:shadow-md',
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
        <header className="sticky top-0 z-20 overflow-hidden border-b border-emerald-100/70 bg-emerald-50/70 px-4 py-3 backdrop-blur-xl lg:px-7">
          <img
            src={currentMeta.visual}
            alt=""
            aria-hidden="true"
            className={clsx(
              'pointer-events-none absolute inset-0 h-full w-full object-cover opacity-[0.34] brightness-95 saturate-125 contrast-125',
              currentMeta.visualFillPosition,
            )}
          />
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.82)_0%,rgba(236,253,245,0.56)_52%,rgba(209,250,229,0.36)_100%)]" />
          <div className="pointer-events-none absolute inset-y-0 right-8 hidden w-[50vw] min-w-[380px] max-w-[720px] overflow-hidden [mask-image:linear-gradient(90deg,transparent_0%,black_16%,black_84%,transparent_100%)] [-webkit-mask-image:linear-gradient(90deg,transparent_0%,black_16%,black_84%,transparent_100%)] md:block lg:right-[214px]">
            <img
              src={currentMeta.visual}
              alt=""
              aria-hidden="true"
              className={clsx(
                'absolute inset-0 h-full w-full opacity-[0.88] brightness-95 saturate-135 contrast-125',
                currentMeta.visualFocusFit,
                currentMeta.visualFocusPosition,
                currentMeta.visualFocusScale,
                currentMeta.visualFocusShift,
              )}
            />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(236,253,245,0.68)_0%,rgba(236,253,245,0.06)_44%,rgba(209,250,229,0.24)_100%)]" />
          </div>
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_0%,rgba(16,185,129,0.16),transparent_34%),radial-gradient(circle_at_78%_18%,rgba(14,165,233,0.10),transparent_30%)]" />
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.88)_0%,rgba(236,253,245,0.52)_52%,rgba(209,250,229,0.24)_100%)]" />
          <div className="relative flex flex-wrap items-center justify-between gap-3">
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
              {searchOpen ? (
                <div className="hidden items-center gap-2 rounded border border-emerald-200/80 bg-white/75 px-3 py-2 shadow-md ring-1 ring-emerald-100/70 backdrop-blur transition md:flex">
                  <Search className="h-4 w-4 text-emerald-600" />
                  <input
                    autoFocus
                    className="w-[240px] bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
                    placeholder="搜索报告、标准、议题、舆情..."
                    onBlur={() => setSearchOpen(false)}
                  />
                  <button
                    type="button"
                    onClick={() => setSearchOpen(false)}
                    className="rounded p-0.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setSearchOpen(true)}
                  className="hidden items-center gap-2 rounded border border-white/80 bg-white/60 px-3 py-2 text-sm text-slate-500 backdrop-blur transition hover:border-emerald-100 hover:bg-white/85 hover:text-slate-700 md:flex"
                  title="搜索"
                >
                  <Search className="h-4 w-4" />
                  <span className="text-xs">搜索...</span>
                </button>
              )}
              <div className="rounded border border-white/80 bg-white/62 px-3 py-2 text-sm font-medium text-slate-700 shadow-sm backdrop-blur">
                {dataset.meta.reportYear} 年报告周期
              </div>
              <button
                className="relative rounded border border-white/80 bg-white/62 p-2 text-slate-600 shadow-sm backdrop-blur transition hover:bg-white/85 hover:text-slate-800 hover:scale-95 active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50"
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
          <nav className="relative mt-3 grid grid-cols-2 gap-2 md:grid-cols-4 lg:hidden">
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
                        ? 'border-emerald-200/90 bg-emerald-50/85 text-emerald-700'
                        : 'border-white/80 bg-white/55 text-slate-600 backdrop-blur',
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
