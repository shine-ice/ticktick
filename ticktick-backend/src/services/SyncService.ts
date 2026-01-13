import { db } from '../db/knex'
import { SyncRepo } from '../models/repositories/SyncRepo'
import { TaskService } from './TaskService'

export type PushChange = {
  entityType: 'task' | 'list' | 'tag' | 'habit'
  entityId: number
  op: 'upsert' | 'delete'
  baseVersion: number
  clientUpdatedAt?: string
  deviceId?: string
  patch?: any
}

export const SyncService = {
  async push(userId: number, deviceId: string, changes: PushChange[]) {
    return db.transaction(async () => {
      const results: any[] = []
      let lastVersion = (await db('sync_user_versions').where({ user_id: userId }).first())?.last_version ?? 0

      for (const c of changes) {
        if (c.entityType !== 'task') {
          results.push({
            entityType: c.entityType,
            entityId: c.entityId,
            op: c.op,
            status: 'applied',
            version: lastVersion
          })
          continue
        }

        const currentLast = (await db('sync_user_versions').where({ user_id: userId }).first())?.last_version ?? 0
        if (c.baseVersion < currentLast) {
          const serverEntity = await TaskService.getTaskWithChildren(userId, c.entityId).catch(() => null)
          results.push({
            entityType: 'task',
            entityId: c.entityId,
            op: c.op,
            status: 'conflict',
            serverVersion: currentLast,
            serverEntity
          })
          continue
        }

        if (c.op === 'delete') {
          if (c.entityId < 0) {
            results.push({
              entityType: 'task',
              entityId: c.entityId,
              op: c.op,
              status: 'applied',
              version: currentLast
            })
            continue
          }
          await TaskService.softDeleteTask(userId, c.entityId)
          const v = await SyncRepo.nextVersion(userId)
          lastVersion = v
          await SyncRepo.recordChange(userId, 'task', c.entityId, 'delete', v, null)
          results.push({ entityType: 'task', entityId: c.entityId, op: c.op, status: 'applied', version: v })
          continue
        }

        const patch = c.patch || {}
        const clientTempId = Number(patch.clientTempId || (c.entityId < 0 ? c.entityId : 0)) || null
        const isCreate = c.entityId < 0 || !!patch.clientTempId

        if (isCreate) {
          const created = await TaskService.createTask(userId, {
            title: patch.title,
            listId: patch.listId,
            note: patch.note,
            dueAt: patch.dueAt,
            startAt: patch.startAt,
            priority: patch.priority,
            reminderAt: patch.reminderAt,
            repeatRule: patch.repeatRule,
            tagIds: patch.tagIds,
            subtasks: patch.subtasks
          })

          const v = await SyncRepo.nextVersion(userId)
          lastVersion = v
          await SyncRepo.recordChange(userId, 'task', created.id, 'upsert', v, created)

          results.push({
            entityType: 'task',
            entityId: created.id,
            op: 'upsert',
            status: 'applied',
            version: v,
            serverId: created.id,
            clientTempId
          })
          continue
        }

        const updated = await TaskService.patchTask(userId, c.entityId, patch)
        const v = await SyncRepo.nextVersion(userId)
        lastVersion = v
        await SyncRepo.recordChange(userId, 'task', c.entityId, 'upsert', v, updated)
        results.push({ entityType: 'task', entityId: c.entityId, op: 'upsert', status: 'applied', version: v })
      }

      return { results, lastVersion }
    })
  },

  async pull(userId: number, sinceVersion: number, pageSize: number) {
    return SyncRepo.pullSince(userId, sinceVersion, pageSize)
  }
}
