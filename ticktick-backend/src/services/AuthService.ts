import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { db } from '../db/knex'

export const AuthService = {
  async hashPassword(password: string) {
    return bcrypt.hash(password, 10)
  },

  async verifyPassword(password: string, hash: string) {
    return bcrypt.compare(password, hash)
  },

  async issueTokens(userId: number, deviceId: string) {
    const secret = process.env.JWT_SECRET || 'dev'
    const accessToken = jwt.sign({ deviceId }, secret, {
      subject: String(userId),
      expiresIn: Number(process.env.JWT_EXPIRES_IN || 900)
    })

    const refreshTokenRaw = jwt.sign({ deviceId, typ: 'refresh' }, secret, {
      subject: String(userId),
      expiresIn: `${Number(process.env.REFRESH_EXPIRES_DAYS || 30)}d`
    })
    const tokenHash = await bcrypt.hash(refreshTokenRaw, 10)

    const expiresAt = new Date(Date.now() + Number(process.env.REFRESH_EXPIRES_DAYS || 30) * 86400000).toISOString()
    await db('refresh_tokens').insert({
      user_id: userId,
      device_id: deviceId,
      token_hash: tokenHash,
      expires_at: expiresAt,
      created_at: new Date().toISOString()
    })

    return { accessToken, refreshToken: refreshTokenRaw }
  },

  async verifyRefreshToken(userId: number, deviceId: string, token: string) {
    const rows = await db('refresh_tokens')
      .where({ user_id: userId, device_id: deviceId })
      .orderBy('id', 'desc')
      .limit(10)

    for (const row of rows) {
      if (await bcrypt.compare(token, row.token_hash)) return true
    }
    return false
  },

  async rotateRefreshToken(refreshToken: string) {
    const secret = process.env.JWT_SECRET || 'dev'
    const payload = jwt.verify(refreshToken, secret) as { sub?: string; deviceId?: string; typ?: string }
    if (!payload?.sub || payload.typ !== 'refresh') throw new Error('invalid refresh')

    const userId = Number(payload.sub)
    const deviceId = payload.deviceId || 'unknown'

    const ok = await this.verifyRefreshToken(userId, deviceId, refreshToken)
    if (!ok) throw new Error('invalid refresh')

    await this.revokeDeviceTokens(userId, deviceId)
    const tokens = await this.issueTokens(userId, deviceId)
    return tokens
  },

  async revokeDeviceTokens(userId: number, deviceId: string) {
    await db('refresh_tokens').where({ user_id: userId, device_id: deviceId }).del()
  }
}
