import { api, authHeader, registerAndLogin } from './utils/api'
import { resetDb } from './utils/db'

describe('pomodoro', () => {
  beforeEach(async () => {
    await resetDb()
  })

  it('creates sessions and returns stats', async () => {
    const { accessToken } = await registerAndLogin()
    const now = new Date()
    const start = new Date(now.getTime() - 600000).toISOString()
    const end = new Date(now.getTime() - 300000).toISOString()

    await api()
      .post('/api/pomodoro/sessions')
      .set(authHeader(accessToken))
      .send({ focusSeconds: 1500, breakSeconds: 300, startedAt: start, endedAt: end })
      .expect(201)

    const stats = await api()
      .get('/api/pomodoro/stats')
      .set(authHeader(accessToken))
      .query({ start, end: new Date().toISOString() })
      .expect(200)

    expect(stats.body.sessionsCount).toBe(1)
  })

  it('updates and reads settings', async () => {
    const { accessToken } = await registerAndLogin()
    await api()
      .patch('/api/pomodoro/settings')
      .set(authHeader(accessToken))
      .send({ focus_minutes: 30, break_minutes: 5 })
      .expect(200)

    const settingsRes = await api().get('/api/pomodoro/settings').set(authHeader(accessToken)).expect(200)
    expect(settingsRes.body.settings.focus_minutes).toBe(30)
  })
})
