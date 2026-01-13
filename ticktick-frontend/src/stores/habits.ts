import { defineStore } from 'pinia'
import { HabitAPI } from '@/api/endpoints'
import type { Habit } from './types'

export const useHabitsStore = defineStore('habits', {
  state: () => ({
    byId: {} as Record<number, Habit>
  }),
  getters: {
    items(state) {
      return Object.values(state.byId)
    }
  },
  actions: {
    upsertFromServer(habit: Habit) {
      this.byId[habit.id] = { ...(this.byId[habit.id] || {}), ...habit }
    },
    deleteFromServer(habitId: number) {
      delete this.byId[habitId]
    },
    async fetchAll() {
      const data = await HabitAPI.list()
      for (const item of data.items || []) {
        this.upsertFromServer(item)
      }
      return data.items || []
    },
    async create(payload: any) {
      const data = await HabitAPI.create(payload)
      this.upsertFromServer(data.habit)
      return data.habit
    },
    async patch(id: number, patch: any) {
      const data = await HabitAPI.patch(id, patch)
      this.upsertFromServer(data.habit)
      return data.habit
    },
    async remove(id: number) {
      const data = await HabitAPI.remove(id)
      this.deleteFromServer(id)
      return data
    },
    async log(id: number, payload: any) {
      return HabitAPI.log(id, payload)
    }
  }
})
