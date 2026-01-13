import { Request, Response } from 'express'
import { z } from 'zod'
import { ApiError } from '../utils/errors'
import { UserRepo } from '../models/repositories/UserRepo'
import { AuthService } from '../services/AuthService'

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1)
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  deviceId: z.string().min(1).optional()
})

export const AuthController = {
  async register(req: Request, res: Response) {
    const input = registerSchema.parse(req.body)
    const exist = await UserRepo.findByEmail(input.email)
    if (exist) throw new ApiError(409, 'EMAIL_EXISTS')

    const now = new Date().toISOString()
    const hash = await AuthService.hashPassword(input.password)
    const inserted = await UserRepo.insert({
      email: input.email,
      name: input.name,
      password_hash: hash,
      timezone: 'UTC',
      created_at: now,
      updated_at: now
    })

    return res.status(201).json({ user: { id: inserted.id, email: input.email, name: input.name } })
  },

  async login(req: Request, res: Response) {
    const input = loginSchema.parse(req.body)
    const user = await UserRepo.findByEmail(input.email)
    if (!user) throw new ApiError(401, 'INVALID_CREDENTIALS')

    const ok = await AuthService.verifyPassword(input.password, user.password_hash)
    if (!ok) throw new ApiError(401, 'INVALID_CREDENTIALS')

    const deviceId = input.deviceId || `web-${Date.now()}`
    const tokens = await AuthService.issueTokens(user.id, deviceId)
    return res.json({ ...tokens, user: { id: user.id, email: user.email, name: user.name } })
  },

  async refresh(req: Request, res: Response) {
    const schema = z.object({ refreshToken: z.string().min(1) })
    const { refreshToken } = schema.parse(req.body)

    try {
      const rotated = await AuthService.rotateRefreshToken(refreshToken)
      return res.json({ accessToken: rotated.accessToken, refreshToken: rotated.refreshToken })
    } catch {
      throw new ApiError(401, 'INVALID_REFRESH')
    }
  },

  async logout(_req: Request, res: Response) {
    // TODO: revoke device refresh tokens (use deviceId or refreshToken)
    return res.json({ ok: true })
  }
}
