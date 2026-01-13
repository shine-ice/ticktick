import { api } from './utils/api'

describe('health', () => {
  it('returns ok', async () => {
    const res = await api().get('/health').expect(200)
    expect(res.body).toEqual({ ok: true })
  })
})
