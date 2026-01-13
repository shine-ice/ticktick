import { Request, Response } from 'express'
import { z } from 'zod'
import { PomodoroService } from '../services/PomodoroService'

const sessionSchema = z.object({
  taskId: z.number().int().optional(),
  focusSeconds: z.number().int().min(1),
  breakSeconds: z.number().int().min(0).optional(),
  startedAt: z.string().min(1),
  endedAt: z.string().min(1)
})

const settingsSchema = z.object({
  focus_minutes: z.number().int().min(1).max(180).optional(),
  break_minutes: z.number().int().min(1).max(60).optional(),
  long_break_minutes: z.number().int().min(1).max(120).optional(),
  cycles_before_long_break: z.number().int().min(1).max(10).optional()
})

export const PomodoroController = {
  async createSession(req: Request, res: Response) {
    const userId = req.auth!.userId
    const input = sessionSchema.parse(req.body)
    const session = await PomodoroService.createSession(userId, input)
    return res.status(201).json({ session })
  },

  async stats(req: Request, res: Response) {
    const userId = req.auth!.userId
    const schema = z.object({ start: z.string().min(1), end: z.string().min(1) })
    const { start, end } = schema.parse({ start: req.query.start, end: req.query.end })
    const out = await PomodoroService.stats(userId, start, end)
    return res.json(out)
  },

  async getSettings(req: Request, res: Response) {
    const userId = req.auth!.userId
    const settings = await PomodoroService.getSettings(userId)
    return res.json({ settings })
  },

  async updateSettings(req: Request, res: Response) {
    const userId = req.auth!.userId
    const input = settingsSchema.parse(req.body)
    const settings = await PomodoroService.updateSettings(userId, input)
    return res.json({ settings })
  }
}
