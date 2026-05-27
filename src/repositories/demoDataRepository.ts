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
    const [response, fullStandardResponse] = await Promise.all([
      fetch(datasetUrl, { cache: 'no-store' }),
      fetch(fullStandardDisclosureUrl, { cache: 'no-store' }),
    ])

    if (!response.ok) {
      throw new Error(`无法加载演示数据：${response.status} ${response.statusText}`)
    }
    if (!fullStandardResponse.ok) {
      throw new Error(`无法加载全量标准库数据：${fullStandardResponse.status} ${fullStandardResponse.statusText}`)
    }

    const base = await response.json()
    const fullStandard = await fullStandardResponse.json()
    const raw = {
      ...base,
      standards: fullStandard.standards,
      policyDisclosureAnalysis: fullStandard.policyDisclosureAnalysis,
      auditTrail: [...(base.auditTrail ?? []), ...(fullStandard.auditTrail ?? [])],
    }
    const parsed = demoDatasetSchema.safeParse(raw)

    if (!parsed.success) {
      throw new Error(formatZodError(parsed.error))
    }

    return parsed.data
  },
}
