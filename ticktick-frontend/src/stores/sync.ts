import { defineStore } from 'pinia'
import { SyncAPI } from '@/api/endpoints'
import { useAuthStore } from './auth'
import { useTasksStore } from './tasks'
import { useWsRouter } from './wsRouter'
import { LocalPersist } from './syncPersist'

export type PendingChange = {
  entityType: 'task' | 'list' | 'tag' | 'habit'
  entityId: number
  op: 'upsert' | 'delete'
  baseVersion: number
  patch?: any
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}

export const useSyncStore = defineStore('sync', {
  state: () => ({
    lastVersion: 0,
    ws: null as WebSocket | null,
    reconnectTimer: 0 as any,
    pending: [] as PendingChange[],
    connected: false,
    _persistTimer: 0 as any,
    _pushing: false
  }),
  actions: {
    restoreFromStorage() {
      const st = LocalPersist.load()
      if (!st) return
      this.lastVersion = st.lastVersion || 0
      this.pending = Array.isArray(st.pending) ? st.pending : []
    },

    schedulePersist() {
      if (this._persistTimer) return
      this._persistTimer = window.setTimeout(() => {
        this._persistTimer = 0
        LocalPersist.save({ lastVersion: this.lastVersion, pending: this.pending })
      }, 300)
    },

    async pull() {
      const auth = useAuthStore()
      if (!auth.accessToken) return
      const out = await SyncAPI.pull({ sinceVersion: this.lastVersion, pageSize: 200 })
      this.lastVersion = out.nextSinceVersion
      this.schedulePersist()

      const tasksStore = useTasksStore()
      for (const c of out.changes) {
        if (c.entityType === 'task') {
          if (c.op === 'upsert' && c.payload) tasksStore.upsertFromServer(c.payload)
          if (c.op === 'delete') tasksStore.deleteFromServer(c.entityId)
        }
      }
    },

    enqueue(change: Omit<PendingChange, 'baseVersion'> & { baseVersion?: number }) {
      const baseVersion = typeof change.baseVersion === 'number' ? change.baseVersion : this.lastVersion
      this.pending.push({ ...change, baseVersion } as PendingChange)
      this.schedulePersist()
    },

    async pushPending() {
      const auth = useAuthStore()
      if (!auth.accessToken) return
      if (!this.pending.length) return
      if (this._pushing) return
      this._pushing = true

      try {
        const payload = {
          deviceId: auth.deviceId,
          clientTime: new Date().toISOString(),
          changes: this.pending
        }

        const out = await SyncAPI.push(payload)
        const tasksStore = useTasksStore()
        const keep: PendingChange[] = []

        for (let i = 0; i < out.results.length; i++) {
          const r = out.results[i]
          const original = this.pending[i]

          if (r.status === 'applied') {
            this.lastVersion = Math.max(this.lastVersion, Number(r.version || 0))
            if (r.clientTempId && r.serverId) {
              tasksStore.remapId(Number(r.clientTempId), Number(r.serverId))
            }
            continue
          }

          if (r.status === 'conflict') {
            this.lastVersion = Math.max(this.lastVersion, Number(r.serverVersion || 0))
            if (r.entityType === 'task' && r.serverEntity) {
              tasksStore.upsertFromServer(r.serverEntity)
            }
            keep.push({ ...original, baseVersion: this.lastVersion })
            continue
          }

          keep.push(original)
        }

        this.pending = keep
        this.schedulePersist()

        if (this.pending.length) {
          try {
            const again = await SyncAPI.push({
              deviceId: auth.deviceId,
              clientTime: new Date().toISOString(),
              changes: this.pending
            })
            const keep2: PendingChange[] = []
            for (let i = 0; i < again.results.length; i++) {
              const r2 = again.results[i]
              const original2 = this.pending[i]
              if (r2.status === 'applied') {
                this.lastVersion = Math.max(this.lastVersion, Number(r2.version || 0))
                if (r2.clientTempId && r2.serverId) {
                  tasksStore.remapId(Number(r2.clientTempId), Number(r2.serverId))
                }
                continue
              }
              keep2.push(original2)
            }
            this.pending = keep2
            this.schedulePersist()
            return again
          } catch {
            // ignore
          }
        }

        return out
      } finally {
        this._pushing = false
      }
    },

    initWs() {
      const auth = useAuthStore()
      if (!auth.accessToken) return

      const url = (import.meta.env.VITE_WS_BASE || 'ws://localhost:3000') + `/ws?token=${auth.accessToken}`
      this.ws?.close()

      const ws = new WebSocket(url)
      this.ws = ws

      ws.onopen = async () => {
        this.connected = true
        await this.pull().catch(() => void 0)
        await this.pushPending().catch(() => void 0)
      }

      ws.onmessage = async (ev) => {
        try {
          const msg = JSON.parse(ev.data)
          const version = msg?.payload?.version
          if (version) this.lastVersion = Math.max(this.lastVersion, Number(version))
          const router = useWsRouter()
          await router.dispatch(msg)
        } catch {
          // ignore
        }
      }

      ws.onclose = async () => {
        this.connected = false
        if (this.reconnectTimer) return
        this.reconnectTimer = window.setTimeout(async () => {
          this.reconnectTimer = 0
          await sleep(1000)
          this.initWs()
        }, 1000)
      }
    }
  }
})
