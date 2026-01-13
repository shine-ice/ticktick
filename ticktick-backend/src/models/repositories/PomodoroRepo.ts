import { db, unwrapInsertedId } from '../../db/knex'

export const PomodoroRepo = {
  async insertSession(userId: number, payload: any) {
    const now = new Date().toISOString()
    const ret = await db('pomodoro_sessions').insert({
      user_id: userId,
      task_id: payload.taskId ?? null,
      focus_seconds: payload.focusSeconds,
      break_seconds: payload.breakSeconds ?? 0,
      started_at: payload.startedAt,
      ended_at: payload.endedAt,
      created_at: now
    })
    const id = unwrapInsertedId(ret)
    return db('pomodoro_sessions').where({ id }).first()
  },

  async listSessions(userId: number, startISO: string, endISO: string) {
    return db('pomodoro_sessions')
      .where({ user_id: userId })
      .andWhere('started_at', '>=', startISO)
      .andWhere('ended_at', '<=', endISO)
      .orderBy('started_at', 'asc')
  },

  async getSettings(userId: number) {
    return db('pomodoro_settings').where({ user_id: userId }).first()
  },

  async upsertSettings(userId: number, patch: any) {
    const now = new Date().toISOString()
    const exist = await db('pomodoro_settings').where({ user_id: userId }).first()
    if (!exist) {
      await db('pomodoro_settings').insert({ user_id: userId, ...patch, updated_at: now })
    } else {
      await db('pomodoro_settings').where({ user_id: userId }).update({ ...patch, updated_at: now })
    }
    return db('pomodoro_settings').where({ user_id: userId }).first()
  }
}
