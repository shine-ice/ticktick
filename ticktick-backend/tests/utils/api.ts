import request from 'supertest'
import { app } from '../../src/app'

export function api() {
  return request(app)
}

export async function registerAndLogin() {
  const email = `user_${Date.now()}_${Math.floor(Math.random() * 10000)}@test.local`
  const password = 'secret123'
  const name = 'Test User'

  await api().post('/api/auth/register').send({ email, password, name }).expect(201)
  const loginRes = await api().post('/api/auth/login').send({ email, password }).expect(200)

  return {
    email,
    password,
    name,
    accessToken: loginRes.body.accessToken as string,
    refreshToken: loginRes.body.refreshToken as string,
    user: loginRes.body.user as { id: number; email: string; name: string }
  }
}

export function authHeader(token: string) {
  return { Authorization: `Bearer ${token}` }
}
