import { Request, Response } from 'express'
import { z } from 'zod'
import { ListService } from '../services/ListService'
import { SyncRepo } from '../models/repositories/SyncRepo'
import { WsHub } from '../ws/hub'

const createSchema = z.object({ name: z.string().min(1), color: z.string().optional() })
const patchSchema = z.object({
  name: z.string().min(1).optional(),
  color: z.string().optional(),
  sort_order: z.number().int().optional(),
  is_archived: z.number().int().optional()
})

export const ListsController = {
  async list(req: Request, res: Response) {
    const userId = req.auth!.userId
    const items = await ListService.list(userId)
    return res.json({ items })
  },

  async create(req: Request, res: Response) {
    const userId = req.auth!.userId
    const input = createSchema.parse(req.body)
    const list = await ListService.create(userId, input)

    const v = await SyncRepo.nextVersion(userId)
    await SyncRepo.recordChange(userId, 'list', list.id, 'upsert', v, list)
    WsHub.broadcastToUser(userId, { type: 'LIST_UPSERT', payload: { list, version: v } })

    return res.status(201).json({ list })
  },

  async patch(req: Request, res: Response) {
    const userId = req.auth!.userId
    const id = Number(req.params.id)
    const input = patchSchema.parse(req.body)
    const list = await ListService.patch(userId, id, input)

    const v = await SyncRepo.nextVersion(userId)
    await SyncRepo.recordChange(userId, 'list', id, 'upsert', v, list)
    WsHub.broadcastToUser(userId, { type: 'LIST_UPSERT', payload: { list, version: v } })

    return res.json({ list })
  },

  async remove(req: Request, res: Response) {
    const userId = req.auth!.userId
    const id = Number(req.params.id)
    await ListService.remove(userId, id)

    const v = await SyncRepo.nextVersion(userId)
    await SyncRepo.recordChange(userId, 'list', id, 'delete', v, null)
    WsHub.broadcastToUser(userId, { type: 'LIST_DELETE', payload: { listId: id, version: v } })

    return res.json({ ok: true })
  }
}
