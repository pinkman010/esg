import { demoDatasetSchema, type DemoDataset } from '../types/dataset'

export interface DemoDataRepository {
  load: () => Promise<DemoDataset>
}

const datasetUrl = '/data/demo-dataset.json'
const fullStandardDisclosureUrl = '/generated/full-standard-disclosure.json'

const formatZodError = (error: unknown) => {
  if (!error || typeof error !== 'object' || !('issues' in error)) {
    return '数据格式不符合前端契约'
  }

  const issues = (error as { issues: Array<{ path: Array<string | number>; message: string }> }).issues

  return issues
    .slice(0, 6)
    .map((issue) => `${issue.path.join('.') || 'root'}: ${issue.message}`)
    .join('；')
}

export const demoDataRepository: DemoDataRepository = {
  async load() {
    // 先加载基础数据，确保首屏尽快可用
    const response = await fetch(datasetUrl, { cache: 'no-store' })
    if (!response.ok) {
      throw new Error(`无法加载演示数据：${response.status} ${response.statusText}`)
    }
    const base = await response.json()

    // 再加载全量标准库大数据（容错：即使失败也不影响基础展示）
    let fullStandard: {
      standards?: unknown
      policyDisclosureAnalysis?: unknown
      auditTrail?: unknown[]
    } = {}
    try {
      const fullStandardResponse = await fetch(fullStandardDisclosureUrl, { cache: 'no-store' })
      if (fullStandardResponse.ok) {
        fullStandard = await fullStandardResponse.json()
      }
    } catch {
      // 全量数据加载失败时静默降级，使用空值填充
    }

    const raw = {
      ...base,
      standards: fullStandard.standards ?? [],
      policyDisclosureAnalysis: fullStandard.policyDisclosureAnalysis ?? [],
      auditTrail: [...(base.auditTrail ?? []), ...(fullStandard.auditTrail ?? [])],
    }
    const parsed = demoDatasetSchema.safeParse(raw)

    if (!parsed.success) {
      throw new Error(formatZodError(parsed.error))
    }

    return parsed.data
  },
}
