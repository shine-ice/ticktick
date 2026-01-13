import { defineStore } from 'pinia'
import { PomodoroAPI } from '@/api/endpoints'
import type { PomodoroSettings } from './types'

export const usePomodoroStore = defineStore('pomodoro', {
  state: () => ({
    settings: null as PomodoroSettings | null,
    stats: null as null | { focusSeconds: number; breakSeconds: number; sessionsCount: number }
  }),
  actions: {
    async createSession(payload: any) {
      return PomodoroAPI.createSession(payload)
    },
    async fetchStats(start: string, end: string) {
      const data = await PomodoroAPI.stats(start, end)
      this.stats = data
      return data
    },
    async fetchSettings() {
      const data = await PomodoroAPI.getSettings()
      this.settings = data.settings || null
      return this.settings
    },
    async updateSettings(patch: any) {
      const data = await PomodoroAPI.updateSettings(patch)
      this.settings = data.settings || null
      return this.settings
    }
  }
})
