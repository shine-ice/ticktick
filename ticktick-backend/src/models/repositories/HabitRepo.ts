import { db, unwrapInsertedId } from '../../db/knex'

export const HabitRepo = {
  async list(userId: number) {
    return db('habits').where({ user_id: userId }).orderBy('id', 'desc')
  },

  async listByUser(userId: number) {
    return this.list(userId)
  },

  async findById(userId: number, id: number) {
    return db('habits').where({ user_id: userId, id }).first()
  },

  async create(userId: number, payload: any) {
    const now = new Date().toISOString()
    const ret = await db('habits').insert({
      user_id: userId,
      name: payload.name,
      schedule: payload.schedule,
      target: payload.target ?? 1,
      unit: payload.unit ?? null,
      created_at: now,
      updated_at: now
    })
    const id = unwrapInsertedId(ret)
    return db('habits').where({ id }).first()
  },

  async patch(userId: number, id: number, patch: any) {
    const now = new Date().toISOString()
    return db('habits').where({ user_id: userId, id }).update({ ...patch, updated_at: now })
  },

  async remove(userId: number, id: number) {
    await db('habit_logs').where({ habit_id: id }).del()
    return db('habits').where({ user_id: userId, id }).del()
  },

  async upsertLog(habitId: number, date: string, value: number) {
    const now = new Date().toISOString()
    const exist = await db('habit_logs').where({ habit_id: habitId, log_date: date }).first()
    if (!exist) {
      const ret = await db('habit_logs').insert({ habit_id: habitId, log_date: date, value, created_at: now })
      unwrapInsertedId(ret)
    } else {
      await db('habit_logs').where({ habit_id: habitId, log_date: date }).update({ value })
    }
    return db('habit_logs').where({ habit_id: habitId, log_date: date }).first()
  },

  async listLogs(habitId: number, startDate: string, endDate: string) {
    return db('habit_logs')
      .where({ habit_id: habitId })
      .andWhere('log_date', '>=', startDate)
      .andWhere('log_date', '<=', endDate)
  }
}
