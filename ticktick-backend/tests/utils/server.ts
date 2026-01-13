import http from 'http'
import { app } from '../../src/app'
import { WsHub } from '../../src/ws/hub'

export async function startTestServer() {
  const server = http.createServer(app)
  WsHub.init(server)

  await new Promise<void>((resolve) => {
    server.listen(0, resolve)
  })

  const address = server.address()
  const port = typeof address === 'object' && address ? address.port : 0

  return { server, port }
}

export async function stopTestServer(server: http.Server) {
  await new Promise<void>((resolve, reject) => {
    server.close((err) => (err ? reject(err) : resolve()))
  })
  await WsHub.shutdown()
}
