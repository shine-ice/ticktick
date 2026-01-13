import WebSocket from 'ws'
import { api, registerAndLogin } from './utils/api'
import { resetDb } from './utils/db'
import { startTestServer, stopTestServer } from './utils/server'
import { WsHub } from '../src/ws/hub'

describe('ws', () => {
  beforeEach(async () => {
    await resetDb()
  })

  it('connects and receives broadcast', async () => {
    const { server, port } = await startTestServer()
    try {
      const { accessToken, user } = await registerAndLogin()

      const ws = new WebSocket(`ws://127.0.0.1:${port}/ws?token=${accessToken}`)

      const message = await new Promise<string>((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error('timeout waiting for ws message')), 2000)
        ws.on('open', () => {
          WsHub.broadcastToUser(user.id, { type: 'TEST', payload: { ok: true } })
        })
        ws.on('message', (data) => {
          clearTimeout(timeout)
          resolve(data.toString())
        })
        ws.on('error', (err) => {
          clearTimeout(timeout)
          reject(err)
        })
      })

      const parsed = JSON.parse(message)
      expect(parsed.type).toBe('TEST')
      expect(parsed.payload.ok).toBe(true)

      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          ws.terminate()
          resolve()
        }, 1000)
        ws.once('close', () => {
          clearTimeout(timeout)
          resolve()
        })
        ws.once('error', (err) => {
          clearTimeout(timeout)
          reject(err)
        })
        ws.close()
      })
    } finally {
      await stopTestServer(server)
    }
  })
})
