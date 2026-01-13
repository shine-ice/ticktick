import type { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { ApiError } from '../utils/errors'

export function authRequired(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : ''
  if (!token) throw new ApiError(401, 'UNAUTHORIZED', 'Missing token')

  try {
    const secret = process.env.JWT_SECRET || 'dev'
    const payload = jwt.verify(token, secret) as { sub?: string; deviceId?: string }
    const userId = Number(payload.sub)
    if (!userId) throw new ApiError(401, 'UNAUTHORIZED', 'Invalid token')
    req.auth = { userId, deviceId: payload.deviceId }
    next()
  } catch {
    throw new ApiError(401, 'UNAUTHORIZED', 'Invalid token')
  }
}
