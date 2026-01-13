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
    async login(email: string, password: string) {
      const data = await AuthAPI.login({ email, password, deviceId: this.deviceId })
      this.accessToken = data.accessToken
      this.refreshToken = data.refreshToken
      this.user = data.user
    },
    async refresh() {
      const data = await AuthAPI.refresh({ refreshToken: this.refreshToken })
      this.accessToken = data.accessToken
      this.refreshToken = data.refreshToken
    },
    async logout() {
      try {
        await AuthAPI.logout()
      } finally {
        this.accessToken = ''
        this.refreshToken = ''
        this.user = null
      }
    }
  }
})
