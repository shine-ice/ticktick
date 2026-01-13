import { api, authHeader, registerAndLogin } from './utils/api'
import { resetDb } from './utils/db'

describe('tasks', () => {
  beforeEach(async () => {
    await resetDb()
  })

  it('creates, reads, updates, and deletes tasks', async () => {
    const { accessToken } = await registerAndLogin()

    const listRes = await api()
      .post('/api/lists')
      .set(authHeader(accessToken))
      .send({ name: 'Inbox' })
      .expect(201)
    const listId = listRes.body.list.id

    const tagRes = await api()
      .post('/api/tags')
      .set(authHeader(accessToken))
      .send({ name: 'home' })
      .expect(201)
    const tagId = tagRes.body.tag.id

    const createRes = await api()
      .post('/api/tasks')
      .set(authHeader(accessToken))
      .send({
        title: 'Buy milk',
        listId,
        tagIds: [tagId],
        subtasks: [{ title: 'Check fridge' }]
      })
      .expect(201)

    const taskId = createRes.body.task.id

    const getRes = await api().get(`/api/tasks/${taskId}`).set(authHeader(accessToken)).expect(200)
    expect(getRes.body.task.title).toBe('Buy milk')
    expect(getRes.body.task.subtasks.length).toBe(1)

    await api()
      .patch(`/api/tasks/${taskId}`)
      .set(authHeader(accessToken))
      .send({ note: 'Skim only', isCompleted: 1 })
      .expect(200)

    const listApiRes = await api().get('/api/tasks?page=1&pageSize=10').set(authHeader(accessToken)).expect(200)
    expect(listApiRes.body.items.length).toBe(1)

    await api().delete(`/api/tasks/${taskId}`).set(authHeader(accessToken)).expect(200)
    const listAfter = await api().get('/api/tasks?page=1&pageSize=10').set(authHeader(accessToken)).expect(200)
    expect(listAfter.body.items.length).toBe(0)
  })
})
