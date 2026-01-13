import { Request, Response } from 'express'
import { z } from 'zod'
import { SmartListService } from '../services/SmartListService'

const createSchema = z.object({
  name: z.string().min(1),
  queryJson: z.any(),
  sortSpec: z.string().optional()
})

const patchSchema = z.object({
  name: z.string().min(1).optional(),
  queryJson: z.any().optional(),
  sortSpec: z.string().optional()
})

const runSchema = z.object({
  cursor: z.string().nullable().optional(),
  pageSize: z.number().int().min(1).max(200).default(50)
})

export const SmartListsController = {
  async list(req: Request, res: Response) {
    const userId = req.auth!.userId
    const items = await SmartListService.list(userId)
    return res.json({ items })
  },

  async create(req: Request, res: Response) {
    const userId = req.auth!.userId
    const input = createSchema.parse(req.body)
    const smartList = await SmartListService.create(userId, input)
    return res.status(201).json({ smartList })
  },

  async patch(req: Request, res: Response) {
    const userId = req.auth!.userId
    const id = Number(req.params.id)
    const input = patchSchema.parse(req.body)
    const smartList = await SmartListService.patch(userId, id, input)
    return res.json({ smartList })
  },

  async remove(req: Request, res: Response) {
    const userId = req.auth!.userId
    const id = Number(req.params.id)
    await SmartListService.remove(userId, id)
    return res.json({ ok: true })
  },

  async run(req: Request, res: Response) {
    const userId = req.auth!.userId
    const id = Number(req.params.id)
    const input = runSchema.parse(req.body)
    const out = await SmartListService.run(userId, id, { cursor: input.cursor ?? null, pageSize: input.pageSize })
    return res.json(out)
  }
}
