import { defineStore } from 'pinia'
import { useTasksStore } from './tasks'
import { useListsStore } from './lists'
import { useTagsStore } from './tags'
import { useHabitsStore } from './habits'

export type WsMessage = { type: string; payload?: any }

type Handler = (payload: any, msg: WsMessage) => void | Promise<void>

export const useWsRouter = defineStore('wsRouter', {
  state: () => ({
    handlers: {} as Record<string, Handler[]>
  }),
  actions: {
    register(type: string, handler: Handler) {
      this.handlers[type] ||= []
      this.handlers[type].push(handler)
    },

    async dispatch(msg: WsMessage) {
      const hs = this.handlers[msg.type] || []
      for (const h of hs) await h(msg.payload, msg)
    },

    installDefaults() {
      const tasks = useTasksStore()
      const lists = useListsStore()
      const tags = useTagsStore()
      const habits = useHabitsStore()

      this.register('TASK_UPSERT', ({ task }) => task && tasks.upsertFromServer(task))
      this.register('TASK_DELETE', ({ taskId }) => taskId && tasks.deleteFromServer(taskId))

      this.register('LIST_UPSERT', ({ list }) => list && lists.upsertFromServer(list))
      this.register('LIST_DELETE', ({ listId }) => listId && lists.deleteFromServer(listId))

      this.register('TAG_UPSERT', ({ tag }) => tag && tags.upsertFromServer(tag))
      this.register('TAG_DELETE', ({ tagId }) => tagId && tags.deleteFromServer(tagId))

      this.register('HABIT_UPSERT', ({ habit }) => habit && habits.upsertFromServer(habit))
      this.register('HABIT_DELETE', ({ habitId }) => habitId && habits.deleteFromServer(habitId))
      this.register('HABIT_LOG', (payload) => habits.upsertFromServer(payload))

      this.register('WS_READY', () => void 0)
      this.register('SYNC_ACK', () => void 0)
    }
  }
})
