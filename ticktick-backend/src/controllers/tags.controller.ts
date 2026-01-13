import { Request, Response } from 'express'
import { z } from 'zod'
import { TagService } from '../services/TagService'
import { SyncRepo } from '../models/repositories/SyncRepo'
import { WsHub } from '../ws/hub'

const createSchema = z.object({ name: z.string().min(1), color: z.string().optional() })
const patchSchema = z.object({ name: z.string().min(1).optional(), color: z.string().optional() })

export const TagsController = {
  async list(req: Request, res: Response) {
    const userId = req.auth!.userId
    const items = await TagService.list(userId)
    return res.json({ items })
  },

  async create(req: Request, res: Response) {
    const userId = req.auth!.userId
    const input = createSchema.parse(req.body)
    const tag = await TagService.create(userId, input)

    const v = await SyncRepo.nextVersion(userId)
    await SyncRepo.recordChange(userId, 'tag', tag.id, 'upsert', v, tag)
    WsHub.broadcastToUser(userId, { type: 'TAG_UPSERT', payload: { tag, version: v } })

    return res.status(201).json({ tag })
  },

  async patch(req: Request, res: Response) {
    const userId = req.auth!.userId
    const id = Number(req.params.id)
    const input = patchSchema.parse(req.body)
    const tag = await TagService.patch(userId, id, input)

    const v = await SyncRepo.nextVersion(userId)
    await SyncRepo.recordChange(userId, 'tag', id, 'upsert', v, tag)
    WsHub.broadcastToUser(userId, { type: 'TAG_UPSERT', payload: { tag, version: v } })

    return res.json({ tag })
  },

  async remove(req: Request, res: Response) {
    const userId = req.auth!.userId
    const id = Number(req.params.id)
    await TagService.remove(userId, id)

    const v = await SyncRepo.nextVersion(userId)
    await SyncRepo.recordChange(userId, 'tag', id, 'delete', v, null)
    WsHub.broadcastToUser(userId, { type: 'TAG_DELETE', payload: { tagId: id, version: v } })

    return res.json({ ok: true })
  }
}
