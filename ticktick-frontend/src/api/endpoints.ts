import { api } from './client'

export const AuthAPI = {
  register(payload: any) {
    return api.post('/api/auth/register', payload).then((r) => r.data)
  },
  login(payload: any) {
    return api.post('/api/auth/login', payload).then((r) => r.data)
  },
  refresh(payload: any) {
    return api.post('/api/auth/refresh', payload).then((r) => r.data)
  },
  logout() {
    return api.post('/api/auth/logout').then((r) => r.data)
  }
}

export const TaskAPI = {
  list(page = 1, pageSize = 20) {
    return api.get('/api/tasks', { params: { page, pageSize } }).then((r) => r.data)
  },
  create(payload: any) {
    return api.post('/api/tasks', payload).then((r) => r.data)
  },
  patch(id: number, payload: any) {
    return api.patch(`/api/tasks/${id}`, payload).then((r) => r.data)
  },
  get(id: number) {
    return api.get(`/api/tasks/${id}`).then((r) => r.data)
  },
  remove(id: number) {
    return api.delete(`/api/tasks/${id}`).then((r) => r.data)
  }
}

export const NlpAPI = {
  parse(payload: any) {
    return api.post('/api/nlp/parse', payload).then((r) => r.data)
  }
}

export const CalendarAPI = {
  tasks(start: string, end: string) {
    return api.get('/api/calendar/tasks', { params: { start, end } }).then((r) => r.data)
  }
}

export const SyncAPI = {
  push(payload: any) {
    return api.post('/api/sync/push', payload).then((r) => r.data)
  },
  pull(payload: any) {
    return api.post('/api/sync/pull', payload).then((r) => r.data)
  }
}

export const ListAPI = {
  list() {
    return api.get('/api/lists').then((r) => r.data)
  },
  create(payload: any) {
    return api.post('/api/lists', payload).then((r) => r.data)
  },
  patch(id: number, payload: any) {
    return api.patch(`/api/lists/${id}`, payload).then((r) => r.data)
  },
  remove(id: number) {
    return api.delete(`/api/lists/${id}`).then((r) => r.data)
  }
}

export const TagAPI = {
  list() {
    return api.get('/api/tags').then((r) => r.data)
  },
  create(payload: any) {
    return api.post('/api/tags', payload).then((r) => r.data)
  },
  patch(id: number, payload: any) {
    return api.patch(`/api/tags/${id}`, payload).then((r) => r.data)
  },
  remove(id: number) {
    return api.delete(`/api/tags/${id}`).then((r) => r.data)
  }
}

export const HabitAPI = {
  list() {
    return api.get('/api/habits').then((r) => r.data)
  },
  create(payload: any) {
    return api.post('/api/habits', payload).then((r) => r.data)
  },
  patch(id: number, payload: any) {
    return api.patch(`/api/habits/${id}`, payload).then((r) => r.data)
  },
  remove(id: number) {
    return api.delete(`/api/habits/${id}`).then((r) => r.data)
  },
  log(id: number, payload: any) {
    return api.post(`/api/habits/${id}/log`, payload).then((r) => r.data)
  }
}

export const PomodoroAPI = {
  createSession(payload: any) {
    return api.post('/api/pomodoro/sessions', payload).then((r) => r.data)
  },
  stats(start: string, end: string) {
    return api.get('/api/pomodoro/stats', { params: { start, end } }).then((r) => r.data)
  },
  getSettings() {
    return api.get('/api/pomodoro/settings').then((r) => r.data)
  },
  updateSettings(payload: any) {
    return api.patch('/api/pomodoro/settings', payload).then((r) => r.data)
  }
}

export const SmartListAPI = {
  list() {
    return api.get('/api/smart-lists').then((r) => r.data)
  },
  create(payload: any) {
    return api.post('/api/smart-lists', payload).then((r) => r.data)
  },
  patch(id: number, payload: any) {
    return api.patch(`/api/smart-lists/${id}`, payload).then((r) => r.data)
  },
  remove(id: number) {
    return api.delete(`/api/smart-lists/${id}`).then((r) => r.data)
  },
  run(id: number, payload: any) {
    return api.post(`/api/smart-lists/${id}/run`, payload).then((r) => r.data)
  }
}

export const StatsAPI = {
  overview(start: string, end: string) {
    return api.get('/api/stats/overview', { params: { start, end } }).then((r) => r.data)
  }
}
