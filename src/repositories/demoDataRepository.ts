import { demoDatasetSchema, type DemoDataset } from '../types/dataset'

export interface DemoDataRepository {
  load: () => Promise<DemoDataset>
}

const datasetUrl = '/data/demo-dataset.json'

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
    const response = await fetch(datasetUrl, { cache: 'no-store' })

    if (!response.ok) {
      throw new Error(`无法加载演示数据：${response.status} ${response.statusText}`)
    }

    const raw = await response.json()
    const parsed = demoDatasetSchema.safeParse(raw)

    if (!parsed.success) {
      throw new Error(formatZodError(parsed.error))
    }

    return parsed.data
  },
}
