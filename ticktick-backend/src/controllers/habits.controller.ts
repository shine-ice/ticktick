import { Request, Response } from 'express'
import { z } from 'zod'
import { HabitService } from '../services/HabitService'
import { SyncRepo } from '../models/repositories/SyncRepo'
import { WsHub } from '../ws/hub'

const createSchema = z.object({
  name: z.string().min(1),
  schedule: z.string().min(1),
  target: z.number().int().optional(),
  unit: z.string().optional()
})

const patchSchema = z.object({
  name: z.string().min(1).optional(),
  schedule: z.string().min(1).optional(),
  target: z.number().int().optional(),
  unit: z.string().optional()
})

const logSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  value: z.number().int()
})

export const HabitsController = {
  async list(req: Request, res: Response) {
    const userId = req.auth!.userId
    const items = await HabitService.list(userId)
    return res.json({ items })
  },

  async create(req: Request, res: Response) {
    const userId = req.auth!.userId
    const input = createSchema.parse(req.body)
    const habit = await HabitService.create(userId, input)

    const v = await SyncRepo.nextVersion(userId)
    await SyncRepo.recordChange(userId, 'habit', habit.id, 'upsert', v, habit)
    WsHub.broadcastToUser(userId, { type: 'HABIT_UPSERT', payload: { habit, version: v } })

    return res.status(201).json({ habit })
  },

  async patch(req: Request, res: Response) {
    const userId = req.auth!.userId
    const id = Number(req.params.id)
    const input = patchSchema.parse(req.body)
    const habit = await HabitService.patch(userId, id, input)

    const v = await SyncRepo.nextVersion(userId)
    await SyncRepo.recordChange(userId, 'habit', id, 'upsert', v, habit)
    WsHub.broadcastToUser(userId, { type: 'HABIT_UPSERT', payload: { habit, version: v } })

    return res.json({ habit })
  },

  async remove(req: Request, res: Response) {
    const userId = req.auth!.userId
    const id = Number(req.params.id)
    await HabitService.remove(userId, id)

    const v = await SyncRepo.nextVersion(userId)
    await SyncRepo.recordChange(userId, 'habit', id, 'delete', v, null)
    WsHub.broadcastToUser(userId, { type: 'HABIT_DELETE', payload: { habitId: id, version: v } })

    return res.json({ ok: true })
  },

  async log(req: Request, res: Response) {
    const userId = req.auth!.userId
    const id = Number(req.params.id)
    const input = logSchema.parse(req.body)
    const out = await HabitService.log(userId, id, input.date, input.value)
    return res.json(out)
  }
}
