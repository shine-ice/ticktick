import { api, authHeader, registerAndLogin } from './utils/api'
import { resetDb } from './utils/db'

describe('calendar', () => {
  beforeEach(async () => {
    await resetDb()
  })

  it('returns tasks in date range', async () => {
    const { accessToken } = await registerAndLogin()
    const listRes = await api()
      .post('/api/lists')
      .set(authHeader(accessToken))
      .send({ name: 'Inbox' })
      .expect(201)
    const listId = listRes.body.list.id

    const dueAt = new Date().toISOString()
    await api()
      .post('/api/tasks')
      .set(authHeader(accessToken))
      .send({ title: 'Due today', listId, dueAt })
      .expect(201)

    const start = new Date(Date.now() - 86400000).toISOString()
    const end = new Date(Date.now() + 86400000).toISOString()
    const res = await api()
      .get('/api/calendar/tasks')
      .set(authHeader(accessToken))
      .query({ start, end })
      .expect(200)

    expect(res.body.items.length).toBe(1)
  })
})
