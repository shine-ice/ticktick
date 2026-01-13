export type PersistState = {
  lastVersion: number
  pending: any[]
}

const KEY = 'ticktick_sync_state_v1'

export const LocalPersist = {
  load(): PersistState | null {
    try {
      const raw = localStorage.getItem(KEY)
      if (!raw) return null
      const obj = JSON.parse(raw)
      if (typeof obj.lastVersion !== 'number' || !Array.isArray(obj.pending)) return null
      return obj
    } catch {
      return null
    }
  },

  save(state: PersistState) {
    localStorage.setItem(KEY, JSON.stringify(state))
  },

  clear() {
    localStorage.removeItem(KEY)
  }
}

export const IDBPersist = {
  async load(): Promise<PersistState | null> {
    // TODO: implement IndexedDB persistence
    return null
  },
  async save(_state: PersistState) {
    // TODO
  },
  async clear() {
    // TODO
  }
}
