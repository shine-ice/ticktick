import { api, authHeader, registerAndLogin } from './utils/api'
import { resetDb } from './utils/db'

describe('lists', () => {
  beforeEach(async () => {
    await resetDb()
  })

  it('creates, lists, updates, and deletes lists', async () => {
    const { accessToken } = await registerAndLogin()
    const createRes = await api()
      .post('/api/lists')
      .set(authHeader(accessToken))
      .send({ name: 'Inbox', color: '#ffcc00' })
      .expect(201)

    const listId = createRes.body.list.id

    const listRes = await api().get('/api/lists').set(authHeader(accessToken)).expect(200)
    expect(listRes.body.items.length).toBe(1)

    await api()
      .patch(`/api/lists/${listId}`)
      .set(authHeader(accessToken))
      .send({ name: 'Work', is_archived: 1 })
      .expect(200)

    await api().delete(`/api/lists/${listId}`).set(authHeader(accessToken)).expect(200)
    const listResAfter = await api().get('/api/lists').set(authHeader(accessToken)).expect(200)
    expect(listResAfter.body.items.length).toBe(0)
  })
})
