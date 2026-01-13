import { api, authHeader, registerAndLogin } from './utils/api'
import { resetDb } from './utils/db'

describe('tags', () => {
  beforeEach(async () => {
    await resetDb()
  })

  it('creates, lists, updates, and deletes tags', async () => {
    const { accessToken } = await registerAndLogin()
    const createRes = await api()
      .post('/api/tags')
      .set(authHeader(accessToken))
      .send({ name: 'urgent', color: '#ff0000' })
      .expect(201)

    const tagId = createRes.body.tag.id

    const listRes = await api().get('/api/tags').set(authHeader(accessToken)).expect(200)
    expect(listRes.body.items.length).toBe(1)

    await api()
      .patch(`/api/tags/${tagId}`)
      .set(authHeader(accessToken))
      .send({ name: 'later' })
      .expect(200)

    await api().delete(`/api/tags/${tagId}`).set(authHeader(accessToken)).expect(200)
    const listResAfter = await api().get('/api/tags').set(authHeader(accessToken)).expect(200)
    expect(listResAfter.body.items.length).toBe(0)
  })
})
