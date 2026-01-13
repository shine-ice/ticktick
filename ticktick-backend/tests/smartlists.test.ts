import { api, authHeader, registerAndLogin } from './utils/api'
import { resetDb } from './utils/db'

describe('smart lists', () => {
  beforeEach(async () => {
    await resetDb()
  })

  it('creates and runs smart lists', async () => {
    const { accessToken } = await registerAndLogin()
    const listRes = await api()
      .post('/api/lists')
      .set(authHeader(accessToken))
      .send({ name: 'Inbox' })
      .expect(201)
    const listId = listRes.body.list.id

    await api().post('/api/tasks').set(authHeader(accessToken)).send({ title: 'Buy milk', listId }).expect(201)
    await api().post('/api/tasks').set(authHeader(accessToken)).send({ title: 'Write report', listId }).expect(201)

    const createRes = await api()
      .post('/api/smart-lists')
      .set(authHeader(accessToken))
      .send({ name: 'Buy', queryJson: { keyword: 'Buy' } })
      .expect(201)

    const smartListId = createRes.body.smartList.id
    const runRes = await api()
      .post(`/api/smart-lists/${smartListId}/run`)
      .set(authHeader(accessToken))
      .send({ pageSize: 50 })
      .expect(200)

    expect(runRes.body.items.length).toBe(1)
    expect(runRes.body.items[0].title).toBe('Buy milk')
  })
})
