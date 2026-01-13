import { defineStore } from 'pinia'
import { StatsAPI } from '@/api/endpoints'

export const useStatsStore = defineStore('stats', {
  state: () => ({
    overview: null as any
  }),
  actions: {
    async fetchOverview(start: string, end: string) {
      const data = await StatsAPI.overview(start, end)
      this.overview = data
      return data
    }
  }
})
