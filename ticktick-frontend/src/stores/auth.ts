import { defineStore } from 'pinia'
import { AuthAPI } from '@/api/endpoints'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    accessToken: '' as string,
    refreshToken: '' as string,
    user: null as null | { id: number; email: string; name: string },
    deviceId: `web-${crypto.randomUUID?.() || Date.now()}`
  }),
  actions: {
    restoreFromStorage() {
      const raw = localStorage.getItem('tt-auth')
      if (!raw) return
      try {
        const data = JSON.parse(raw)
        this.accessToken = data.accessToken || ''
        this.refreshToken = data.refreshToken || ''
        this.user = data.user || null
      } catch {
        localStorage.removeItem('tt-auth')
      }
    },
    persistToStorage() {
      const payload = {
        accessToken: this.accessToken,
        refreshToken: this.refreshToken,
        user: this.user
      }
      localStorage.setItem('tt-auth', JSON.stringify(payload))
    },
    async login(email: string, password: string) {
      const data = await AuthAPI.login({ email, password, deviceId: this.deviceId })
      this.accessToken = data.accessToken
      this.refreshToken = data.refreshToken
      this.user = data.user
      this.persistToStorage()
    },
    async register(payload: { name: string; email: string; password: string }) {
      await AuthAPI.register(payload)
      await this.login(payload.email, payload.password)
    },
    async refresh() {
      const data = await AuthAPI.refresh({ refreshToken: this.refreshToken })
      this.accessToken = data.accessToken
      this.refreshToken = data.refreshToken
      this.persistToStorage()
    },
    async logout() {
      try {
        await AuthAPI.logout()
      } finally {
        this.accessToken = ''
        this.refreshToken = ''
        this.user = null
        localStorage.removeItem('tt-auth')
      }
    }
  }
})
