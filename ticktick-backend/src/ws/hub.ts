import { WebSocketServer, WebSocket } from 'ws'
import jwt from 'jsonwebtoken'

type ClientMeta = { userId: number; deviceId?: string }
type AuthedSocket = WebSocket & { meta?: ClientMeta; isAlive?: boolean }

const userSockets = new Map<number, Set<AuthedSocket>>()

export const WsHub = {
  wss: null as WebSocketServer | null,

  init(server: any) {
    const wss = new WebSocketServer({ server, path: '/ws' })
    this.wss = wss

    wss.on('connection', (ws: AuthedSocket, req) => {
      try {
        const url = new URL(req.url || '', `http://${req.headers.host}`)
        const token = url.searchParams.get('token') || ''
        const secret = process.env.JWT_SECRET || 'dev'
        const payload = jwt.verify(token, secret) as any
        const userId = Number(payload.sub)
        const deviceId = payload.deviceId

        ws.meta = { userId, deviceId }
        ws.isAlive = true

        if (!userSockets.has(userId)) userSockets.set(userId, new Set())
        userSockets.get(userId)!.add(ws)

        ws.on('pong', () => (ws.isAlive = true))
        ws.on('close', () => {
          userSockets.get(userId)?.delete(ws)
        })
      } catch {
        ws.close()
      }
    })

    const interval = setInterval(() => {
      wss.clients.forEach((ws) => {
        const s = ws as AuthedSocket
        if (!s.isAlive) return s.terminate()
        s.isAlive = false
        s.ping()
      })
    }, 30000)

    wss.on('close', () => clearInterval(interval))
  },

  broadcastToUser(userId: number, payload: any) {
    const sockets = userSockets.get(userId)
    if (!sockets) return
    const data = JSON.stringify(payload)
    sockets.forEach((s) => {
      if (s.readyState === WebSocket.OPEN) s.send(data)
    })
  }
}
