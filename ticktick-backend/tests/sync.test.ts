import { api, authHeader, registerAndLogin } from './utils/api'
import { resetDb } from './utils/db'

describe('sync', () => {
  beforeEach(async () => {
    await resetDb()
  })

  it('pushes and pulls changes', async () => {
    const { accessToken } = await registerAndLogin()
    const listRes = await api()
      .post('/api/lists')
      .set(authHeader(accessToken))
      .send({ name: 'Inbox' })
      .expect(201)
    const listId = listRes.body.list.id

    const pushRes = await api()
      .post('/api/sync/push')
      .set(authHeader(accessToken))
      .send({
        deviceId: 'device-1',
        clientTime: new Date().toISOString(),
        changes: [
          {
            entityType: 'task',
            entityId: -1,
            op: 'upsert',
            baseVersion: 0,
            patch: { title: 'Synced task', listId }
          }
        ]
      })
      .expect(200)

    expect(pushRes.body.results.length).toBe(1)
    const lastVersion = pushRes.body.lastVersion as number

    const pullRes = await api()
      .post('/api/sync/pull')
      .set(authHeader(accessToken))
      .send({ sinceVersion: 0, pageSize: 200 })
      .expect(200)

    expect(pullRes.body.changes.length).toBeGreaterThan(0)
    expect(pullRes.body.nextSinceVersion).toBeGreaterThanOrEqual(lastVersion)
  })
})
