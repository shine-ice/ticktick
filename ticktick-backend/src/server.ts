import 'express-async-errors'
import express from 'express'
import cors from 'cors'
import http from 'http'
import dotenv from 'dotenv'
dotenv.config()

import { routes } from './routes'
import { errorMiddleware } from './middleware/error'
import { WsHub } from './ws/hub'

const app = express()
app.use(cors())
app.use(express.json())

app.get('/health', (_req, res) => res.json({ ok: true }))

app.use(routes)
app.use(errorMiddleware)

const port = Number(process.env.PORT || 3000)
const server = http.createServer(app)

WsHub.init(server)

server.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`)
  console.log(`WS  listening on ws://localhost:${port}/ws`)
})
