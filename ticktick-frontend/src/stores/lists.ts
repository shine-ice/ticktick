import { defineStore } from 'pinia'
import { ListAPI } from '@/api/endpoints'
import type { List } from './types'

export const useListsStore = defineStore('lists', {
  state: () => ({
    byId: {} as Record<number, List>
  }),
  getters: {
    items(state) {
      return Object.values(state.byId)
    }
  },
  actions: {
    upsertFromServer(list: List) {
      this.byId[list.id] = { ...(this.byId[list.id] || {}), ...list }
    },
    deleteFromServer(listId: number) {
      delete this.byId[listId]
    },
    async fetchAll() {
      const data = await ListAPI.list()
      for (const item of data.items || []) {
        this.upsertFromServer(item)
      }
      return data.items || []
    },
    async create(payload: any) {
      const data = await ListAPI.create(payload)
      this.upsertFromServer(data.list)
      return data.list
    },
    async patch(id: number, patch: any) {
      const data = await ListAPI.patch(id, patch)
      this.upsertFromServer(data.list)
      return data.list
    },
    async remove(id: number) {
      const data = await ListAPI.remove(id)
      this.deleteFromServer(id)
      return data
    }
  }
})
