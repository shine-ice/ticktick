import { api, authHeader, registerAndLogin } from './utils/api'
import { resetDb } from './utils/db'

describe('nlp', () => {
  beforeEach(async () => {
    await resetDb()
  })

  it('parses text into draft', async () => {
    const { accessToken } = await registerAndLogin()
    const res = await api()
      .post('/api/nlp/parse')
      .set(authHeader(accessToken))
      .send({ text: 'Pay rent !! #home', timezone: 'UTC' })
      .expect(200)

    expect(res.body.draft.title).toContain('Pay rent')
    expect(res.body.draft.tagNames).toContain('home')
    expect(res.body.draft.priority).toBe(3)
  })
})
