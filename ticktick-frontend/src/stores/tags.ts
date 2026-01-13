import { defineStore } from 'pinia'
import { TagAPI } from '@/api/endpoints'
import type { Tag } from './types'

export const useTagsStore = defineStore('tags', {
  state: () => ({
    byId: {} as Record<number, Tag>
  }),
  getters: {
    items(state) {
      return Object.values(state.byId)
    }
  },
  actions: {
    upsertFromServer(tag: Tag) {
      this.byId[tag.id] = { ...(this.byId[tag.id] || {}), ...tag }
    },
    deleteFromServer(tagId: number) {
      delete this.byId[tagId]
    },
    async fetchAll() {
      const data = await TagAPI.list()
      for (const item of data.items || []) {
        this.upsertFromServer(item)
      }
      return data.items || []
    },
    async create(payload: any) {
      const data = await TagAPI.create(payload)
      this.upsertFromServer(data.tag)
      return data.tag
    },
    async patch(id: number, patch: any) {
      const data = await TagAPI.patch(id, patch)
      this.upsertFromServer(data.tag)
      return data.tag
    },
    async remove(id: number) {
      const data = await TagAPI.remove(id)
      this.deleteFromServer(id)
      return data
    }
  }
})
