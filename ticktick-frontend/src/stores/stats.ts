import { defineStore } from 'pinia'
import { StatsAPI } from '@/api/endpoints'

export const useStatsStore = defineStore('stats', {
  state: () => ({
    overview: null as any
  }),
  actions: {
    async fetchOverview(start: string, end: string) {
      try {
        const data = await StatsAPI.overview(start, end)
        this.overview = data
        return data
      } catch {
        // TODO: backend missing /api/stats/overview endpoint; using mock overview for now.
        const data = mockOverview(start, end)
        this.overview = data
        return data
      }
    }
  }
})

function mockOverview(start: string, end: string) {
  return {
    isMock: true,
    range: { start, end },
    tasksCompleted: 14,
    tasksCreated: 22,
    focusMinutes: 320,
    habitCompletions: 8,
    topTags: [
      { name: 'work', count: 9 },
      { name: 'health', count: 5 },
      { name: 'home', count: 3 }
    ]
  }
}
