import { api, authHeader, registerAndLogin } from './utils/api'
import { resetDb } from './utils/db'

describe('habits', () => {
  beforeEach(async () => {
    await resetDb()
  })

  it('creates, updates, logs, and deletes habits', async () => {
    const { accessToken } = await registerAndLogin()
    const createRes = await api()
      .post('/api/habits')
      .set(authHeader(accessToken))
      .send({ name: 'Drink water', schedule: 'daily', target: 8, unit: 'cups' })
      .expect(201)

    const habitId = createRes.body.habit.id

    const listRes = await api().get('/api/habits').set(authHeader(accessToken)).expect(200)
    expect(listRes.body.items.length).toBe(1)

    await api()
      .patch(`/api/habits/${habitId}`)
      .set(authHeader(accessToken))
      .send({ target: 10 })
      .expect(200)

    const today = new Date().toISOString().slice(0, 10)
    const logRes = await api()
      .post(`/api/habits/${habitId}/log`)
      .set(authHeader(accessToken))
      .send({ date: today, value: 1 })
      .expect(200)
    expect(logRes.body.log.value).toBe(1)

    await api().delete(`/api/habits/${habitId}`).set(authHeader(accessToken)).expect(200)
  })
})
