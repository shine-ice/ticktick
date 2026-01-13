import { db, unwrapInsertedId } from '../../db/knex'

export type QueryRule = {
  status?: 'active' | 'completed' | 'all'
  due?: 'today' | 'overdue' | 'next7' | 'none' | 'any'
  priorityGte?: number
  listIds?: number[]
  tagIds?: number[]
  keyword?: string
}

export type TaskRow = {
  id: number
  user_id: number
  list_id: number
  title: string
  note: string | null
  due_at: string | null
  start_at: string | null
  priority: number
  repeat_rule: string | null
  reminder_at: string | null
  is_completed: number
  deleted_at: string | null
  created_at: string
  updated_at: string
}

export type SubtaskRow = {
  id: number
  task_id: number
  title: string
  is_completed: number
  sort_order?: number
  created_at: string
  updated_at: string
}

export const TaskRepo = {
  async findById(userId: number, id: number) {
    return db<TaskRow>('tasks').where({ user_id: userId, id }).whereNull('deleted_at').first()
  },

  async listByUser(userId: number, page: number, pageSize: number) {
    const offset = (page - 1) * pageSize
    const items = await db<TaskRow>('tasks')
      .where({ user_id: userId })
      .whereNull('deleted_at')
      .orderBy('updated_at', 'desc')
      .limit(pageSize)
      .offset(offset)

    const [{ total }] = await db('tasks')
      .where({ user_id: userId })
      .whereNull('deleted_at')
      .count({ total: '*' })

    return { items, total: Number(total || 0) }
  },

  async getById(userId: number, id: number) {
    return db<TaskRow>('tasks').where({ id, user_id: userId }).first()
  },

  async list(userId: number, page: number, pageSize: number) {
    const base = db('tasks').where({ user_id: userId }).whereNull('deleted_at')
    const [{ cnt }] = await base.clone().count<{ cnt: any }[]>({ cnt: '*' })
    const items = await base
      .clone()
      .orderBy([
        { column: 'is_completed', order: 'asc' },
        { column: 'due_at', order: 'asc' },
        { column: 'id', order: 'desc' }
      ])
      .offset((page - 1) * pageSize)
      .limit(pageSize)
    return { items, total: Number(cnt) }
  },

  async queryByRule(userId: number, rule: QueryRule, opt: { pageSize: number; cursor?: string | null }) {
    const q = db('tasks').where({ user_id: userId }).whereNull('deleted_at')

    if (rule.status === 'active') q.andWhere('is_completed', '=', 0)
    if (rule.status === 'completed') q.andWhere('is_completed', '=', 1)

    const now = new Date()
    const startOfToday = new Date(now)
    startOfToday.setHours(0, 0, 0, 0)
    const endOfToday = new Date(now)
    endOfToday.setHours(23, 59, 59, 999)
    const isoStart = startOfToday.toISOString()
    const isoEnd = endOfToday.toISOString()

    if (rule.due === 'today') q.andWhere('due_at', '>=', isoStart).andWhere('due_at', '<=', isoEnd)
    if (rule.due === 'overdue') {
      q.andWhereNotNull('due_at').andWhere('due_at', '<', isoStart).andWhere('is_completed', '=', 0)
    }
    if (rule.due === 'none') q.andWhereNull('due_at')
    if (rule.due === 'next7') {
      const end = new Date(now.getTime() + 7 * 86400000).toISOString()
      q.andWhereNotNull('due_at').andWhere('due_at', '>=', isoStart).andWhere('due_at', '<=', end)
    }

    if (typeof rule.priorityGte === 'number') q.andWhere('priority', '>=', rule.priorityGte)
    if (rule.listIds?.length) q.whereIn('list_id', rule.listIds)
    if (rule.keyword?.trim()) q.andWhere('title', 'like', `%${rule.keyword.trim()}%`)

    if (rule.tagIds?.length) {
      q.join('task_tags', 'tasks.id', 'task_tags.task_id').whereIn('task_tags.tag_id', rule.tagIds)
      q.select('tasks.*').groupBy('tasks.id')
    }

    q.orderBy([
      { column: 'due_at', order: 'asc' },
      { column: 'id', order: 'asc' }
    ])
    if (opt.cursor) {
      const [dueAt, idStr] = opt.cursor.split('|')
      const id = Number(idStr)
      q.andWhere((b) => {
        b.where('due_at', '>', dueAt).orWhere((b2) => b2.where('due_at', '=', dueAt).andWhere('id', '>', id))
      })
    }

    const items = await q.limit(opt.pageSize)
    const nextCursor =
      items.length === opt.pageSize ? `${items[items.length - 1].due_at || ''}|${items[items.length - 1].id}` : null

    return { items, nextCursor }
  },

  async createTask(task: Partial<TaskRow>) {
    const ret = await db('tasks').insert(task)
    return unwrapInsertedId(ret)
  },

  async updateTask(userId: number, id: number, patch: Partial<TaskRow>) {
    await db('tasks').where({ id, user_id: userId }).update(patch)
  },

  async softDelete(userId: number, id: number, deletedAt: string) {
    await db('tasks').where({ id, user_id: userId }).update({ deleted_at: deletedAt })
  },

  async listSubtasks(taskId: number) {
    return db<SubtaskRow>('subtasks').where({ task_id: taskId })
  },

  async replaceSubtasks(taskId: number, subtasks: Array<{ title: string; is_done?: number }>) {
    await db('subtasks').where({ task_id: taskId }).del()
    if (!subtasks.length) return
    await db('subtasks').insert(
      subtasks.map((s) => ({
        task_id: taskId,
        title: s.title,
        is_completed: s.is_done ?? 0
      }))
    )
  },

  async replaceTaskTags(taskId: number, tagIds: number[]) {
    await db('task_tags').where({ task_id: taskId }).del()
    if (!tagIds.length) return
    await db('task_tags').insert(tagIds.map((tagId) => ({ task_id: taskId, tag_id: tagId })))
  },

  async listTaskTags(taskId: number) {
    return db('task_tags').where({ task_id: taskId })
  }
}
