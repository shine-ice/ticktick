import { db, unwrapInsertedId } from '../db/knex'
import { ApiError } from '../utils/errors'
import { TaskRepo } from '../models/repositories/TaskRepo'

export type CreateTaskInput = {
  title: string
  listId: number
  note?: string
  dueAt?: string
  startAt?: string
  priority?: number
  reminderAt?: string
  repeatRule?: string
  tagIds?: number[]
  subtasks?: Array<{ title: string }>
}

export const TaskService = {
  async getTaskWithChildren(userId: number, taskId: number) {
    const task = await db('tasks').where({ user_id: userId, id: taskId }).whereNull('deleted_at').first()
    if (!task) throw new ApiError(404, 'TASK_NOT_FOUND')

    const subtasks = await db('subtasks').where({ task_id: taskId }).orderBy('sort_order', 'asc')
    const tagRows = await db('task_tags').where({ task_id: taskId })
    const tagIds = tagRows.map((r: any) => r.tag_id)

    return { ...task, subtasks, tagIds }
  },

  async createTask(userId: number, taskData: CreateTaskInput) {
    const now = new Date().toISOString()

    return db.transaction(async (trx) => {
      const insertRet = await trx('tasks').insert({
        user_id: userId,
        list_id: taskData.listId,
        title: taskData.title,
        note: taskData.note || '',
        due_at: taskData.dueAt || null,
        start_at: taskData.startAt || null,
        priority: taskData.priority ?? 0,
        reminder_at: taskData.reminderAt || null,
        repeat_rule: taskData.repeatRule || null,
        is_completed: 0,
        created_at: now,
        updated_at: now
      })

      const taskId = unwrapInsertedId(insertRet)

      if (Array.isArray(taskData.subtasks) && taskData.subtasks.length) {
        const rows = taskData.subtasks.map((s, idx) => ({
          task_id: taskId,
          title: s.title,
          is_completed: 0,
          sort_order: idx,
          created_at: now,
          updated_at: now
        }))
        await trx('subtasks').insert(rows)
      }

      if (Array.isArray(taskData.tagIds) && taskData.tagIds.length) {
        const rows = taskData.tagIds.map((tagId) => ({ task_id: taskId, tag_id: tagId }))
        await trx('task_tags').insert(rows)
      }

      const task = await trx('tasks').where({ id: taskId }).first()
      const subtasks = await trx('subtasks').where({ task_id: taskId }).orderBy('sort_order', 'asc')
      const tagRows = await trx('task_tags').where({ task_id: taskId })
      const tagIds = tagRows.map((r: any) => r.tag_id)

      return { ...task, subtasks, tagIds }
    })
  },

  async patchTask(userId: number, taskId: number, patch: any) {
    const now = new Date().toISOString()
    return db.transaction(async (trx) => {
      const updatePayload: any = { updated_at: now }
      const mapping: Record<string, string> = {
        dueAt: 'due_at',
        startAt: 'start_at',
        reminderAt: 'reminder_at',
        repeatRule: 'repeat_rule',
        listId: 'list_id',
        isCompleted: 'is_completed'
      }
      for (const [key, value] of Object.entries(patch || {})) {
        if (key === 'subtasks' || key === 'tagIds' || key === 'clientTempId') continue
        const mapped = mapping[key] || key
        updatePayload[mapped] = value
      }

      const updatedCount = await trx('tasks')
        .where({ user_id: userId, id: taskId })
        .whereNull('deleted_at')
        .update(updatePayload)
      if (!updatedCount) throw new ApiError(404, 'TASK_NOT_FOUND')

      if (Array.isArray(patch.subtasks)) {
        await trx('subtasks').where({ task_id: taskId }).del()
        if (patch.subtasks.length) {
          await trx('subtasks').insert(
            patch.subtasks.map((s: any, idx: number) => ({
              task_id: taskId,
              title: s.title,
              is_completed: s.is_completed ?? 0,
              sort_order: idx,
              created_at: now,
              updated_at: now
            }))
          )
        }
      }

      if (Array.isArray(patch.tagIds)) {
        await trx('task_tags').where({ task_id: taskId }).del()
        if (patch.tagIds.length) {
          await trx('task_tags').insert(patch.tagIds.map((tagId: number) => ({ task_id: taskId, tag_id: tagId })))
        }
      }

      const task = await trx('tasks').where({ id: taskId }).first()
      const subtasks = await trx('subtasks').where({ task_id: taskId }).orderBy('sort_order', 'asc')
      const tagRows = await trx('task_tags').where({ task_id: taskId })
      const tagIds = tagRows.map((r: any) => r.tag_id)

      return { ...task, subtasks, tagIds }
    })
  },

  async softDeleteTask(userId: number, taskId: number) {
    const now = new Date().toISOString()
    const updated = await db('tasks')
      .where({ user_id: userId, id: taskId })
      .whereNull('deleted_at')
      .update({ deleted_at: now, updated_at: now })
    if (!updated) throw new ApiError(404, 'TASK_NOT_FOUND')
    return true
  },

  async listByDateRange(userId: number, startISO: string, endISO: string) {
    return db('tasks')
      .where({ user_id: userId })
      .whereNull('deleted_at')
      .andWhere('due_at', '>=', startISO)
      .andWhere('due_at', '<=', endISO)
      .orderBy('due_at', 'asc')
  },

  async list(userId: number, page: number, pageSize: number) {
    return TaskRepo.list(userId, page, pageSize)
  },

  async queryByRule(userId: number, rule: any, opt: { pageSize: number; cursor?: string | null }) {
    return TaskRepo.queryByRule(userId, rule, opt)
  }
}
