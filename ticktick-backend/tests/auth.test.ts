import { api, authHeader, registerAndLogin } from './utils/api'
import { resetDb } from './utils/db'

describe('auth', () => {
  beforeEach(async () => {
    await resetDb()
  })

  it('registers and logs in', async () => {
    const { accessToken, refreshToken, user } = await registerAndLogin()
    expect(accessToken).toBeTruthy()
    expect(refreshToken).toBeTruthy()
    expect(user).toHaveProperty('id')
  })

  it('refreshes token', async () => {
    const { refreshToken } = await registerAndLogin()
    const res = await api().post('/api/auth/refresh').send({ refreshToken }).expect(200)
    expect(res.body.accessToken).toBeTruthy()
    expect(res.body.refreshToken).toBeTruthy()
  })

  it('logs out with auth', async () => {
    const { accessToken } = await registerAndLogin()
    await api().post('/api/auth/logout').set(authHeader(accessToken)).expect(200)
  })
})
