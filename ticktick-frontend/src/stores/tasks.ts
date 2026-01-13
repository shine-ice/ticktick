import { defineStore } from 'pinia'
import { TaskAPI } from '@/api/endpoints'
import { useSyncStore } from './sync'
import type { Task } from './types'

export const useTasksStore = defineStore('tasks', {
  state: () => ({
    byId: {} as Record<number, Task>
  }),
  getters: {
    items(state) {
      return Object.values(state.byId)
    }
  },
  actions: {
    upsertFromServer(task: Task) {
      this.byId[task.id] = { ...(this.byId[task.id] || {}), ...task }
    },
    deleteFromServer(taskId: number) {
      delete this.byId[taskId]
    },
    remapId(tempId: number, serverId: number, serverEntity?: Task) {
      const existing = this.byId[tempId]
      if (existing) {
        delete this.byId[tempId]
        this.byId[serverId] = { ...existing, id: serverId, ...(serverEntity || {}) }
      } else if (serverEntity) {
        this.byId[serverId] = serverEntity
      }
    },

    async createTask(payload: any) {
      const data = await TaskAPI.create(payload)
      this.upsertFromServer(data.task)
      return data.task
    },

    async fetchList(page = 1, pageSize = 20) {
      const data = await TaskAPI.list(page, pageSize)
      for (const item of data.items || []) {
        this.upsertFromServer(item)
      }
      return data
    },

    createTaskOffline(payload: any) {
      const tempId = -Date.now()
      const local: Task = {
        id: tempId,
        title: payload.title,
        list_id: payload.listId,
        due_at: payload.dueAt || null,
        start_at: payload.startAt || null,
        priority: payload.priority ?? 0,
        repeat_rule: payload.repeatRule || null,
        tagIds: payload.tagIds || [],
        subtasks: payload.subtasks || [],
        is_completed: 0
      }
      this.byId[tempId] = local

      const sync = useSyncStore()
      sync.enqueue({
        entityType: 'task',
        entityId: tempId,
        op: 'upsert',
        patch: { ...payload, clientTempId: tempId }
      })
      sync.pushPending().catch(() => void 0)

      return local
    },

    async patchTask(id: number, patch: any) {
      const data = await TaskAPI.patch(id, patch)
      this.upsertFromServer(data.task)
      return data.task
    },

    async removeTask(id: number) {
      const data = await TaskAPI.remove(id)
      this.deleteFromServer(id)
      return data
    },

    optimisticPatch(id: number, patch: any) {
      this.byId[id] = { ...(this.byId[id] || ({} as any)), ...patch }
      const sync = useSyncStore()
      sync.enqueue({ entityType: 'task', entityId: id, op: 'upsert', patch })
      sync.pushPending().catch(() => void 0)
    }
  }
})
