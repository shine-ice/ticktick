import axios from 'axios'
import { useAuthStore } from '@/stores/auth'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || 'http://localhost:3000',
  timeout: 15000
})

api.interceptors.request.use((config) => {
  const auth = useAuthStore()
  if (auth.accessToken) config.headers.Authorization = `Bearer ${auth.accessToken}`
  return config
})

api.interceptors.response.use(
  (r) => r,
  async (e) => {
    const auth = useAuthStore()
    const original = e.config
    if (e.response?.status === 401 && auth.refreshToken && !original.__retried) {
      original.__retried = true
      // TODO: add refresh lock for concurrent refresh calls
      await auth.refresh()
      original.headers.Authorization = `Bearer ${auth.accessToken}`
      return api.request(original)
    }
    throw e
  }
)
