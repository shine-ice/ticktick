import { Request, Response } from 'express'
import { z } from 'zod'
import { SyncService } from '../services/SyncService'
import { TaskService } from '../services/TaskService'
import { WsHub } from '../ws/hub'

export const SyncController = {
  async push(req: Request, res: Response) {
    const userId = req.auth!.userId
    const schema = z.object({
      deviceId: z.string().min(1),
      clientTime: z.string().min(1),
      changes: z.array(
        z.object({
          entityType: z.enum(['task', 'list', 'tag', 'habit']),
          entityId: z.number().int(),
          op: z.enum(['upsert', 'delete']),
          baseVersion: z.number().int(),
          clientUpdatedAt: z.string().optional(),
          patch: z.any().optional()
        })
      )
    })
    const input = schema.parse(req.body)

    const { results, lastVersion } = await SyncService.push(userId, input.deviceId, input.changes as any)

    for (const r of results) {
      if (r.entityType !== 'task') continue
      if (r.status !== 'applied') continue

      if (r.op === 'delete' && Number(r.entityId) > 0) {
        WsHub.broadcastToUser(userId, { type: 'TASK_DELETE', payload: { taskId: r.entityId, version: r.version } })
        continue
      }

      const id = Number(r.serverId || r.entityId)
      if (id > 0) {
        const task = await TaskService.getTaskWithChildren(userId, id).catch(() => null)
        if (task) WsHub.broadcastToUser(userId, { type: 'TASK_UPSERT', payload: { task, version: r.version } })
      }
    }

    WsHub.broadcastToUser(userId, { type: 'SYNC_ACK', payload: { deviceId: input.deviceId, lastVersion } })

    return res.json({ results, serverTime: new Date().toISOString(), lastVersion })
  },

  async pull(req: Request, res: Response) {
    const userId = req.auth!.userId
    const schema = z.object({ sinceVersion: z.number().int(), pageSize: z.number().int().max(500).default(200) })
    const input = schema.parse(req.body)

    const out = await SyncService.pull(userId, input.sinceVersion, input.pageSize)
    return res.json({ ...out, serverTime: new Date().toISOString() })
  }
}
