import { defineStore } from 'pinia'
import { SmartListAPI } from '@/api/endpoints'
import type { SmartList } from './types'

export const useSmartListsStore = defineStore('smartLists', {
  state: () => ({
    byId: {} as Record<number, SmartList>,
    lastRun: null as any
  }),
  getters: {
    items(state) {
      return Object.values(state.byId)
    }
  },
  actions: {
    upsertFromServer(smartList: SmartList) {
      this.byId[smartList.id] = { ...(this.byId[smartList.id] || {}), ...smartList }
    },
    deleteFromServer(id: number) {
      delete this.byId[id]
    },
    async fetchAll() {
      const data = await SmartListAPI.list()
      for (const item of data.items || []) {
        this.upsertFromServer(item)
      }
      return data.items || []
    },
    async create(payload: any) {
      const data = await SmartListAPI.create(payload)
      this.upsertFromServer(data.smartList)
      return data.smartList
    },
    async patch(id: number, patch: any) {
      const data = await SmartListAPI.patch(id, patch)
      this.upsertFromServer(data.smartList)
      return data.smartList
    },
    async remove(id: number) {
      const data = await SmartListAPI.remove(id)
      this.deleteFromServer(id)
      return data
    },
    async run(id: number, payload: any) {
      const data = await SmartListAPI.run(id, payload)
      this.lastRun = data
      return data
    }
  }
})
