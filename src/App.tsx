import { useEffect } from 'react'
import { HashRouter, Route, Routes } from 'react-router-dom'
import { AlertCircle, LoaderCircle } from 'lucide-react'
import { AppShell } from './components/AppShell'
import { ClawMonitorPage } from './pages/ClawMonitorPage'
import { MaterialityBenchmarkPage } from './pages/MaterialityBenchmarkPage'
import { OverviewPage } from './pages/OverviewPage'
import { PolicyDisclosurePage } from './pages/PolicyDisclosurePage'
import { useDemoStore } from './store/useDemoStore'

function App() {
  const { dataset, isLoading, error, loadDataset } = useDemoStore()

  useEffect(() => {
    void loadDataset()
  }, [loadDataset])

  if (isLoading || !dataset) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
        <div className="panel max-w-md text-center">
          {error ? (
            <>
              <AlertCircle className="mx-auto h-10 w-10 text-rose-500" />
              <h1 className="mt-4 text-xl font-semibold text-slate-950">演示数据加载失败</h1>
              <p className="mt-3 text-sm leading-6 text-slate-500">{error}</p>
            </>
          ) : (
            <>
              <LoaderCircle className="mx-auto h-10 w-10 animate-spin text-emerald-600" />
              <h1 className="mt-4 text-xl font-semibold text-slate-950">正在加载演示数据</h1>
              <p className="mt-3 text-sm leading-6 text-slate-500">
                正在读取 public/data/demo-dataset.json 并校验数据契约。
              </p>
            </>
          )}
        </div>
      </div>
    )
  }

  return (
    <HashRouter>
      <AppShell dataset={dataset}>
        <Routes>
          <Route path="/" element={<OverviewPage dataset={dataset} />} />
          <Route path="/policy" element={<PolicyDisclosurePage dataset={dataset} />} />
          <Route path="/benchmark" element={<MaterialityBenchmarkPage dataset={dataset} />} />
          <Route path="/claw" element={<ClawMonitorPage dataset={dataset} />} />
        </Routes>
      </AppShell>
    </HashRouter>
  )
}

export default App
