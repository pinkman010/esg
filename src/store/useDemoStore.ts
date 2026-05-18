import { create } from 'zustand'
import { demoDataRepository } from '../repositories/demoDataRepository'
import type { DemoDataset } from '../types/dataset'

interface DemoStore {
  dataset: DemoDataset | null
  isLoading: boolean
  error: string | null
  loadDataset: () => Promise<void>
}

export const useDemoStore = create<DemoStore>((set, get) => ({
  dataset: null,
  isLoading: false,
  error: null,

  async loadDataset() {
    if (get().dataset || get().isLoading) {
      return
    }

    set({ isLoading: true, error: null })

    try {
      const dataset = await demoDataRepository.load()
      set({ dataset, isLoading: false })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '演示数据加载失败',
        isLoading: false,
      })
    }
  },
}))
